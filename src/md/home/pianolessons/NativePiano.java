package md.home.pianolessons;

import android.content.Context;
import android.content.res.AssetFileDescriptor;
import android.media.AudioAttributes;
import android.media.AudioFormat;
import android.media.AudioManager;
import android.media.AudioTrack;
import android.media.MediaCodec;
import android.media.MediaExtractor;
import android.media.MediaFormat;
import android.os.Build;
import android.os.Process;
import android.util.Log;
import android.webkit.JavascriptInterface;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.ShortBuffer;
import java.util.concurrent.ConcurrentLinkedQueue;

/**
 * Low-latency grand piano, played natively instead of through the WebView's Web Audio.
 * The 25 Salamander samples (assets/sounds/grand) are decoded once into memory; a mixer thread writes
 * small blocks into a low-latency AudioTrack. The buffer starts at 2 bursts and grows one burst at a time
 * only when the track reports an underrun (the same idea as Synthesia's adaptive synth buffer).
 * The page calls it as window.NPiano: on(midi, vel), off(midi), cfg(loud, wet, width), ready(), stats().
 */
public class NativePiano {
    private static final String TAG = "NativePiano";
    private static final int SAMPLES = 25, MAX_VOICES = 32;
    private static final float MAX_SECONDS = 9f;           // longer tails are faded out; a held key rarely rings that long
    private static final String[] NAMES = {"C", "Ds", "Fs", "A"};

    private final Context app;
    private final short[][] pcm = new short[SAMPLES][];     // mono, 44.1 kHz, onset silence trimmed
    private final int[] sampleMidi = new int[SAMPLES];
    private volatile boolean ready, running;
    private int srcRate = 44100, outRate = 48000, burst = 192;
    private AudioTrack track;
    private Thread mixer;
    private final ConcurrentLinkedQueue<int[]> events = new ConcurrentLinkedQueue<>();   // {type, midi, vel*1000}

    // settings from the page (read by the mixer thread)
    private volatile float master = 0.6f, wetLevel = 0.22f, width = 0.6f;

    // voices (mixer thread only)
    private final int[] vMidi = new int[MAX_VOICES], vSample = new int[MAX_VOICES];
    private final double[] vPos = new double[MAX_VOICES], vStep = new double[MAX_VOICES];
    private final float[] vGain = new float[MAX_VOICES], vL = new float[MAX_VOICES], vR = new float[MAX_VOICES],
            vEnv = new float[MAX_VOICES], vDecay = new float[MAX_VOICES];
    private final boolean[] vOn = new boolean[MAX_VOICES], vHeld = new boolean[MAX_VOICES];
    private volatile int underruns, bufferFrames;

    // C++ AAudio engine (libpianoengine.so); the Java AudioTrack mixer below is only the fallback
    private static boolean NATIVE;
    static { try { System.loadLibrary("pianoengine"); NATIVE = true; } catch (Throwable t) { NATIVE = false; } }
    private static native void nSample(int i, int midi, int rate, short[] pcm);
    private static native boolean nStart(boolean exclusive);
    private static native void nStop();
    private static native void nEvent(int type, int midi, float vel);
    private static native void nCfg(float master, float wet, float width);
    private static native float[] nStats();
    private volatile boolean aaudio;
    private volatile String why = "";
    private volatile String route = "exclusive";   // exclusive (MMAP, raw to the speakers) | shared (through Android's mixer + the device's speaker tuning) | java
    /** A/B test from the grown-up's PC: NPiano.route("shared") etc. */
    @JavascriptInterface public String route(String r) { route = r; stop(); start(); return stats(); }
    /** writes decoded sample i as a WAV into the app's files folder, to compare with the source MP3 */
    @JavascriptInterface public String dump(int i) {
        try {
            java.io.File f = new java.io.File(app.getExternalFilesDir(null), "sample" + i + ".wav");
            short[] d = pcm[i];
            java.io.DataOutputStream o = new java.io.DataOutputStream(new java.io.FileOutputStream(f));
            ByteBuffer h = ByteBuffer.allocate(44).order(ByteOrder.LITTLE_ENDIAN);
            h.put("RIFF".getBytes()).putInt(36 + d.length * 2).put("WAVEfmt ".getBytes()).putInt(16).putShort((short) 1).putShort((short) 1)
             .putInt(srcRate).putInt(srcRate * 2).putShort((short) 2).putShort((short) 16).put("data".getBytes()).putInt(d.length * 2);
            o.write(h.array());
            ByteBuffer b = ByteBuffer.allocate(d.length * 2).order(ByteOrder.LITTLE_ENDIAN);
            for (short v : d) b.putShort(v);
            o.write(b.array()); o.close();
            return f.getAbsolutePath();
        } catch (Exception e) { return "error " + e; }
    }   // the C++ engine is the one playing

    public NativePiano(Context c) {
        app = c.getApplicationContext();
        for (int o = 1, i = 0; o <= 6; o++) for (int k = 0; k < 4; k++, i++) sampleMidi[i] = 24 + 12 * (o - 1) + 3 * k;
        sampleMidi[24] = 96;
        new Thread(new Runnable() { public void run() { load(); } }, "piano-load").start();
    }

    // ---------------- page API ----------------
    @JavascriptInterface public boolean ready() { return ready && running; }
    /** the page opens/closes Play along: the audio stream only runs while the piano is on screen */
    private volatile boolean wanted, resumed = true;
    @JavascriptInterface public void active(boolean on) { wanted = on; if (on && resumed) start(); else stop(); }
    public void resume() { resumed = true; if (wanted) start(); }
    public void pause() { resumed = false; stop(); }
    @JavascriptInterface public void on(int midi, float vel) { if (aaudio) nEvent(1, midi, vel); else events.add(new int[]{1, midi, Math.round(vel * 1000)}); }
    @JavascriptInterface public void off(int midi) { if (aaudio) nEvent(0, midi, 0); else events.add(new int[]{0, midi, 0}); }
    @JavascriptInterface public void allOff() { if (aaudio) nEvent(2, 0, 0); else events.add(new int[]{2, 0, 0}); }
    /** loud = grown-up limit 0..1, wet = room echo level, w = stereo width (low notes left, high right) */
    @JavascriptInterface public void cfg(float loud, float wet, float w) { master = 0.6f * loud; wetLevel = wet; width = w; if (NATIVE) nCfg(master, wet, w); }
    @JavascriptInterface public String stats() {
        if (aaudio) {
            float[] v = nStats();
            return "{\"ready\":" + ready + ",\"engine\":\"aaudio\",\"rate\":" + (int) v[0] + ",\"burst\":" + (int) v[1] + ",\"bufferFrames\":" + (int) v[2]
                    + ",\"bufferMs\":" + (v[2] * 1000f / Math.max(1, v[0])) + ",\"underruns\":" + (int) v[3] + ",\"outLatencyMs\":" + v[4]
                    + ",\"exclusive\":" + (v[5] > 0) + ",\"lowLatency\":" + (v[6] > 0) + "}";
        }
        return "{\"why\":\"" + why + "\",\"ready\":" + ready + ",\"rate\":" + outRate + ",\"burst\":" + burst + ",\"bufferFrames\":" + bufferFrames
                + ",\"bufferMs\":" + (bufferFrames * 1000f / outRate) + ",\"underruns\":" + underruns
                + ",\"outLatencyMs\":" + outLatencyMs() + "}";
    }

    private volatile long written;   // frames handed to the track
    /** time a frame written now takes to reach the speaker, from the track's own presentation timestamp */
    private float outLatencyMs() {
        AudioTrack t = track;
        if (t == null) return -1;
        android.media.AudioTimestamp ts = new android.media.AudioTimestamp();
        if (!t.getTimestamp(ts)) return -1;
        long now = System.nanoTime();
        double playedNow = ts.framePosition + (now - ts.nanoTime) * outRate / 1e9;
        return (float) ((written - playedNow) * 1000.0 / outRate);
    }

    // ---------------- lifecycle ----------------
    public synchronized void start() {
        if (running || !ready || !wanted || !resumed) { why = "skip r=" + running + " ready=" + ready + " w=" + wanted + " res=" + resumed; return; }
        if (NATIVE && !"java".equals(route) && nStart(!"shared".equals(route))) { aaudio = true; running = true; nCfg(master, wetLevel, width); why = "aaudio"; return; }
        why = NATIVE ? "aaudio open failed" : "no native lib";
        aaudio = false;
        AudioManager am = (AudioManager) app.getSystemService(Context.AUDIO_SERVICE);
        try { outRate = Integer.parseInt(am.getProperty(AudioManager.PROPERTY_OUTPUT_SAMPLE_RATE)); } catch (Exception e) { outRate = 48000; }
        try { burst = Integer.parseInt(am.getProperty(AudioManager.PROPERTY_OUTPUT_FRAMES_PER_BUFFER)); } catch (Exception e) { burst = 192; }
        if (burst <= 0 || burst > 4096) burst = 192;
        AudioFormat fmt = new AudioFormat.Builder().setSampleRate(outRate).setEncoding(AudioFormat.ENCODING_PCM_FLOAT)
                .setChannelMask(AudioFormat.CHANNEL_OUT_STEREO).build();
        AudioAttributes attr = new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA)
                .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build();
        int min = AudioTrack.getMinBufferSize(outRate, AudioFormat.CHANNEL_OUT_STEREO, AudioFormat.ENCODING_PCM_FLOAT);
        try {
            if (Build.VERSION.SDK_INT >= 26) {
                track = new AudioTrack.Builder().setAudioAttributes(attr).setAudioFormat(fmt)
                        .setBufferSizeInBytes(min).setTransferMode(AudioTrack.MODE_STREAM)
                        .setPerformanceMode(AudioTrack.PERFORMANCE_MODE_LOW_LATENCY).build();
            } else {
                track = new AudioTrack(attr, fmt, min, AudioTrack.MODE_STREAM, AudioManager.AUDIO_SESSION_ID_GENERATE);
            }
        } catch (Exception e) { why += "; no track " + e; return; }
        if (Build.VERSION.SDK_INT >= 24) bufferFrames = track.setBufferSizeInFrames(burst * 2);   // start small, grow on underrun
        else bufferFrames = track.getBufferSizeInFrames();
        running = true;
        track.play();
        mixer = new Thread(new Runnable() { public void run() { mix(); } }, "piano-mix");
        mixer.start();
        Log.i(TAG, "started " + stats());
    }

    public synchronized void stop() {
        running = false;
        if (aaudio) { nStop(); aaudio = false; return; }
        if (mixer != null) { try { mixer.join(300); } catch (InterruptedException ignored) {} mixer = null; }
        if (track != null) { try { track.stop(); } catch (Exception ignored) {} track.release(); track = null; }
        for (int i = 0; i < MAX_VOICES; i++) vOn[i] = false;
        events.clear();
    }

    // ---------------- loading ----------------
    private void load() {
        long t0 = System.currentTimeMillis();
        try {
            for (int o = 1, i = 0; o <= 6; o++) for (int k = 0; k < 4; k++, i++) pcm[i] = decode("sounds/grand/" + NAMES[k] + o + ".mp3");
            pcm[24] = decode("sounds/grand/C7.mp3");
            if (NATIVE) for (int i = 0; i < SAMPLES; i++) nSample(i, sampleMidi[i], srcRate, pcm[i]);
            ready = true;
            Log.i(TAG, "samples decoded in " + (System.currentTimeMillis() - t0) + " ms");
            start();
        } catch (Exception e) { Log.w(TAG, "decode failed", e); }
    }

    /** MP3 asset -> mono 16-bit, silence before the attack trimmed, capped at MAX_SECONDS with a short fade. */
    private short[] decode(String asset) throws Exception {
        MediaExtractor ex = new MediaExtractor();
        AssetFileDescriptor fd = app.getAssets().openFd(asset);
        ex.setDataSource(fd.getFileDescriptor(), fd.getStartOffset(), fd.getLength());
        fd.close();
        ex.selectTrack(0);
        MediaFormat f = ex.getTrackFormat(0);
        int ch = f.getInteger(MediaFormat.KEY_CHANNEL_COUNT);
        srcRate = f.getInteger(MediaFormat.KEY_SAMPLE_RATE);
        int cap = (int) (srcRate * MAX_SECONDS);
        short[] out = new short[cap];
        int n = 0;
        MediaCodec dec = MediaCodec.createDecoderByType(f.getString(MediaFormat.KEY_MIME));
        dec.configure(f, null, null, 0);
        dec.start();
        MediaCodec.BufferInfo info = new MediaCodec.BufferInfo();
        boolean inEnd = false, outEnd = false;
        while (!outEnd && n < cap) {
            if (!inEnd) {
                int ii = dec.dequeueInputBuffer(5000);
                if (ii >= 0) {
                    ByteBuffer b = dec.getInputBuffer(ii);
                    int sz = ex.readSampleData(b, 0);
                    if (sz < 0) { dec.queueInputBuffer(ii, 0, 0, 0, MediaCodec.BUFFER_FLAG_END_OF_STREAM); inEnd = true; }
                    else { dec.queueInputBuffer(ii, 0, sz, ex.getSampleTime(), 0); ex.advance(); }
                }
            }
            int oi = dec.dequeueOutputBuffer(info, 5000);
            if (oi >= 0) {
                ByteBuffer b = dec.getOutputBuffer(oi);
                b.position(info.offset); b.limit(info.offset + info.size);
                ShortBuffer s = b.order(ByteOrder.nativeOrder()).asShortBuffer();
                while (s.remaining() >= ch && n < cap) {
                    int sum = 0;
                    for (int c = 0; c < ch; c++) sum += s.get();
                    out[n++] = (short) (sum / ch);
                }
                dec.releaseOutputBuffer(oi, false);
                if ((info.flags & MediaCodec.BUFFER_FLAG_END_OF_STREAM) != 0) outEnd = true;
            }
        }
        dec.stop(); dec.release(); ex.release();
        // where the sound really starts (the recordings open with 5-22 ms of silence plus MP3 padding)
        int look = Math.min(n, srcRate / 5), pk = 0, st = 0;
        for (int i = 0; i < look; i++) pk = Math.max(pk, Math.abs(out[i]));
        while (st < look && Math.abs(out[st]) < pk * 0.03) st++;
        st = Math.max(0, st - srcRate * 15 / 10000);
        int len = n - st, fade = Math.min(len, srcRate / 2);
        short[] r = new short[len];
        System.arraycopy(out, st, r, 0, len);
        if (n >= cap) for (int i = 0; i < fade; i++) r[len - fade + i] = (short) (r[len - fade + i] * (1f - (float) i / fade));
        return r;
    }

    // ---------------- mixer thread ----------------
    private void mix() {
        Process.setThreadPriority(Process.THREAD_PRIORITY_URGENT_AUDIO);
        int frames = burst;
        float[] L = new float[frames], R = new float[frames];
        float[] buf = new float[frames * 2];
        Reverb rv = new Reverb(outRate);
        int lastUnder = 0;
        while (running) {
            for (int[] ev; (ev = events.poll()) != null; ) handle(ev);
            java.util.Arrays.fill(L, 0); java.util.Arrays.fill(R, 0);
            for (int v = 0; v < MAX_VOICES; v++) if (vOn[v]) render(v, L, R, frames);
            float m = master, w = wetLevel;
            for (int i = 0; i < frames; i++) {
                float in = (L[i] + R[i]) * 0.5f;
                float[] e = rv.process(in * w);
                buf[2 * i] = clip((L[i] + e[0]) * m);
                buf[2 * i + 1] = clip((R[i] + e[1]) * m);
            }
            track.write(buf, 0, buf.length, AudioTrack.WRITE_BLOCKING); written += frames;   // blocks until there is room: this paces the thread
            if (Build.VERSION.SDK_INT >= 24) {
                int u = track.getUnderrunCount();
                if (u > lastUnder) {                      // the sound broke up: give it one more burst of buffer
                    lastUnder = u; underruns = u;
                    int want = Math.min(bufferFrames + burst, track.getBufferCapacityInFrames());
                    bufferFrames = track.setBufferSizeInFrames(want);
                    Log.i(TAG, "underrun " + u + ", buffer now " + bufferFrames + " frames");
                }
            }
        }
    }

    /** soft limiter: linear up to 0.6, tanh shoulder above, so loud chords never crack the speakers */
    private static float clip(float x) {
        float a = Math.abs(x);
        if (a > 0.6f) a = 0.6f + 0.4f * (float) Math.tanh((a - 0.6f) / 0.4f);
        return Math.copySign(a, x);
    }

    private void handle(int[] ev) {
        if (ev[0] == 2) { for (int v = 0; v < MAX_VOICES; v++) if (vOn[v]) release(v, 0.02f); return; }
        int midi = ev[1];
        for (int v = 0; v < MAX_VOICES; v++) if (vOn[v] && vHeld[v] && vMidi[v] == midi) release(v, ev[0] == 1 ? 0.02f : 0.35f);
        if (ev[0] != 1) return;
        int v = free();
        int s = 0;
        for (int i = 1; i < SAMPLES; i++) if (Math.abs(sampleMidi[i] - midi) < Math.abs(sampleMidi[s] - midi)) s = i;
        float vel = ev[2] / 1000f;
        float pan = Math.max(-1f, Math.min(1f, (midi - 60) / 14f)) * width;
        double ang = (pan + 1) * Math.PI / 4;
        vMidi[v] = midi; vSample[v] = s; vPos[v] = 0;
        vStep[v] = Math.pow(2, (midi - sampleMidi[s]) / 12.0) * srcRate / outRate;
        vGain[v] = 0.9f * (float) Math.pow(vel / 0.8f, 1.3) / 32768f;
        vL[v] = (float) Math.cos(ang); vR[v] = (float) Math.sin(ang);
        vEnv[v] = 1f; vDecay[v] = 1f; vHeld[v] = true; vOn[v] = true;
    }

    /** damper: fade with time constant rel/5 like the page's setTargetAtTime(0, t, rel / 5) */
    private void release(int v, float rel) {
        vHeld[v] = false;
        vDecay[v] = (float) Math.exp(-1.0 / (outRate * rel / 5));
    }

    private int free() {
        int quiet = 0;
        for (int v = 0; v < MAX_VOICES; v++) { if (!vOn[v]) return v; if (vEnv[v] < vEnv[quiet]) quiet = v; }
        return quiet;   // steal the quietest
    }

    private void render(int v, float[] L, float[] R, int frames) {
        short[] d = pcm[vSample[v]];
        double pos = vPos[v], step = vStep[v];
        float g = vGain[v], env = vEnv[v], dec = vDecay[v], gl = vL[v], gr = vR[v];
        int last = d.length - 1;
        for (int i = 0; i < frames; i++) {
            int p = (int) pos;
            if (p >= last || env < 0.0005f) { vOn[v] = false; break; }
            float fr = (float) (pos - p);
            float x = (d[p] + (d[p + 1] - d[p]) * fr) * g * env;
            L[i] += x * gl; R[i] += x * gr;
            pos += step; env *= dec;
        }
        vPos[v] = pos; vEnv[v] = env;
    }

    /** Small stereo room echo (Schroeder/Freeverb style: 4 combs + 2 allpasses per side, slightly different lengths left/right). */
    private static final class Reverb {
        final float[][] comb = new float[8][]; final int[] ci = new int[8]; final float[] cf = new float[8];
        final float[][] ap = new float[4][]; final int[] ai = new int[4];
        final float[] o = new float[2];
        Reverb(int sr) {
            int[] cl = {1116, 1188, 1277, 1356}, al = {556, 441};
            for (int s = 0; s < 2; s++) {
                for (int k = 0; k < 4; k++) comb[s * 4 + k] = new float[(cl[k] + s * 23) * sr / 44100];
                for (int k = 0; k < 2; k++) ap[s * 2 + k] = new float[(al[k] + s * 23) * sr / 44100];
            }
        }
        float[] process(float in) {
            for (int s = 0; s < 2; s++) {
                float acc = 0;
                for (int k = 0; k < 4; k++) {
                    int c = s * 4 + k; float[] b = comb[c]; float y = b[ci[c]];
                    cf[c] = y * 0.75f + cf[c] * 0.25f;                 // damping
                    b[ci[c]] = in + cf[c] * 0.84f;                     // feedback = room size
                    if (++ci[c] >= b.length) ci[c] = 0;
                    acc += y;
                }
                for (int k = 0; k < 2; k++) {
                    int a = s * 2 + k; float[] b = ap[a]; float y = b[ai[a]];
                    b[ai[a]] = acc + y * 0.5f; acc = y - acc;
                    if (++ai[a] >= b.length) ai[a] = 0;
                }
                o[s] = acc * 0.25f;
            }
            return o;
        }
    }
}
