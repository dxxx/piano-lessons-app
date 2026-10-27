// Low-latency grand piano engine: AAudio (exclusive/MMAP when the device allows it) with a real-time data callback.
// Java (NativePiano) decodes the samples once and hands them over; touches arrive through a lock-free queue.
// Built by build.sh with the NDK into lib/arm64-v8a/libpianoengine.so.
#include <aaudio/AAudio.h>
#include <android/log.h>
#include <jni.h>
#include <atomic>
#include <cmath>
#include <cstring>
#include <ctime>
#include <thread>
#include <vector>

#define LOG(...) __android_log_print(ANDROID_LOG_INFO, "PianoEngine", __VA_ARGS__)

namespace {

constexpr int SAMPLES = 25, MAX_VOICES = 32, QUEUE = 256;

struct Sample { std::vector<int16_t> pcm; int midi = 0; };
Sample samples[SAMPLES];
int srcRate = 44100;

// ---- events: many producers (page bridge thread, touch thread), one consumer (audio callback) ----
struct Event { std::atomic<int> ready{0}; int type = 0, midi = 0; float vel = 0; };
Event ring[QUEUE];
std::atomic<uint32_t> wIdx{0};
uint32_t rIdx = 0;

void push(int type, int midi, float vel) {
    uint32_t i = wIdx.fetch_add(1) % QUEUE;
    Event &e = ring[i];
    e.type = type; e.midi = midi; e.vel = vel;
    e.ready.store(1, std::memory_order_release);
}

// ---- settings ----
std::atomic<float> master{0.6f}, wetLevel{0.22f}, width{0.6f};

// ---- voices (audio thread only) ----
struct Voice { bool on = false, held = false; int midi = 0, s = 0; double pos = 0, step = 1; float gain = 0, l = 1, r = 1, env = 0, decay = 1; };
Voice voices[MAX_VOICES];
int outRate = 48000;

// ---- small stereo room echo (Freeverb style: 4 combs + 2 allpasses per side) ----
struct Reverb {
    std::vector<float> comb[8], ap[4];
    int ci[8] = {}, ai[4] = {};
    float cf[8] = {};
    void init(int sr) {
        const int cl[4] = {1116, 1188, 1277, 1356}, al[2] = {556, 441};
        for (int s = 0; s < 2; s++) {
            for (int k = 0; k < 4; k++) comb[s * 4 + k].assign((cl[k] + s * 23) * sr / 44100, 0.f);
            for (int k = 0; k < 2; k++) ap[s * 2 + k].assign((al[k] + s * 23) * sr / 44100, 0.f);
        }
    }
    void process(float in, float &oL, float &oR) {
        float o[2];
        for (int s = 0; s < 2; s++) {
            float acc = 0;
            for (int k = 0; k < 4; k++) {
                int c = s * 4 + k; auto &b = comb[c]; float y = b[ci[c]];
                cf[c] = y * 0.75f + cf[c] * 0.25f;
                b[ci[c]] = in + cf[c] * 0.84f;
                if (++ci[c] >= (int)b.size()) ci[c] = 0;
                acc += y;
            }
            for (int k = 0; k < 2; k++) {
                int a = s * 2 + k; auto &b = ap[a]; float y = b[ai[a]];
                b[ai[a]] = acc + y * 0.5f; acc = y - acc;
                if (++ai[a] >= (int)b.size()) ai[a] = 0;
            }
            o[s] = acc * 0.25f;
        }
        oL = o[0]; oR = o[1];
    }
} reverb;

void release(Voice &v, float rel) { v.held = false; v.decay = (float)std::exp(-1.0 / (outRate * rel / 5)); }

void handle(const Event &e) {
    if (e.type == 2) { for (auto &v : voices) if (v.on) release(v, 0.02f); return; }
    for (auto &v : voices) if (v.on && v.held && v.midi == e.midi) release(v, e.type == 1 ? 0.02f : 0.35f);
    if (e.type != 1) return;
    int slot = 0;
    for (int i = 0; i < MAX_VOICES; i++) { if (!voices[i].on) { slot = i; break; } if (voices[i].env < voices[slot].env) slot = i; }
    int s = 0;
    for (int i = 1; i < SAMPLES; i++) if (std::abs(samples[i].midi - e.midi) < std::abs(samples[s].midi - e.midi)) s = i;
    if (samples[s].pcm.empty()) return;
    Voice &v = voices[slot];
    float pan = std::fmax(-1.f, std::fmin(1.f, (e.midi - 60) / 14.f)) * width.load();
    double ang = (pan + 1) * M_PI / 4;
    v.midi = e.midi; v.s = s; v.pos = 0;
    v.step = std::pow(2.0, (e.midi - samples[s].midi) / 12.0) * srcRate / outRate;
    v.gain = 0.9f * (float)std::pow(e.vel / 0.8f, 1.3f) / 32768.f;
    v.l = (float)std::cos(ang); v.r = (float)std::sin(ang);   // equal-power pan like Web Audio's StereoPanner
    v.env = 1; v.decay = 1; v.held = true; v.on = true;
}

// Compressor with Web Audio's DynamicsCompressor defaults (threshold -24 dB, knee 30 dB, ratio 12, attack 3 ms,
// release 250 ms), so the piano sounds the way it did in the page; a gentle safety clip only above 0.98.
struct Compressor {
    float env = 0.f, att = 0, rel = 0;              // dB of gain reduction now (0 = none)
    float makeup = 1;
    void init(int sr) {
        att = std::exp(-1.f / (0.003f * sr)); rel = std::exp(-1.f / (0.250f * sr));
        makeup = std::pow(10.f, -curve(0.f) * 0.6f / 20.f);   // Chromium: (1 / curve(full scale)) ^ 0.6, ~ +13 dB
    }
    static float curve(float x) {                     // input level dB -> output level dB
        const float T = -24.f, K = 30.f, R = 12.f;
        if (x < T - K / 2) return x;
        if (x > T + K / 2) return T + (x - T) / R;
        float d = x - T + K / 2; return x + (1 / R - 1) * d * d / (2 * K);
    }
    float gain(float peak) {
        float x = peak > 1e-6f ? 20.f * std::log10(peak) : -120.f;
        float red = x - curve(x);                     // dB of reduction wanted
        env = red > env ? att * env + (1 - att) * red : rel * env + (1 - rel) * red;
        return std::pow(10.f, -env / 20.f);
    }
} comp;
inline float clip(float x) {
    float a = std::fabs(x);
    if (a > 0.98f) a = 0.98f + 0.02f * std::tanh((a - 0.98f) / 0.02f);
    return std::copysign(a, x);
}

// ---- stream ----
AAudioStream *stream = nullptr;
std::atomic<int64_t> written{0};
std::atomic<int> xruns{0}, burst{0}, bufFrames{0};
std::atomic<bool> running{false};
int lastXrun = 0;
std::vector<float> L, R;

aaudio_data_callback_result_t onAudio(AAudioStream *s, void *, void *data, int32_t frames) {
    for (;;) {                                         // take every queued touch first
        Event &e = ring[rIdx % QUEUE];
        if (!e.ready.load(std::memory_order_acquire)) break;
        handle(e); e.ready.store(0, std::memory_order_relaxed); rIdx++;
    }
    if ((int)L.size() < frames) { L.resize(frames); R.resize(frames); }   // only on the first, odd-sized call
    std::fill(L.begin(), L.begin() + frames, 0.f); std::fill(R.begin(), R.begin() + frames, 0.f);
    for (auto &v : voices) {
        if (!v.on) continue;
        const auto &d = samples[v.s].pcm; int last = (int)d.size() - 1;
        double pos = v.pos; float env = v.env;
        for (int i = 0; i < frames; i++) {
            int p = (int)pos;
            if (p >= last || env < 0.0005f) { v.on = false; break; }
            float fr = (float)(pos - p), x = (d[p] + (d[p + 1] - d[p]) * fr) * v.gain * env;
            L[i] += x * v.l; R[i] += x * v.r;
            pos += v.step; env *= v.decay;
        }
        v.pos = pos; v.env = env;
    }
    float m = master.load(), w = wetLevel.load(), *out = (float *)data;
    for (int i = 0; i < frames; i++) {
        float eL, eR; reverb.process((L[i] + R[i]) * 0.5f * w, eL, eR);
        float a = (L[i] + eL) * m, b = (R[i] + eR) * m;   // m = 0.6 * grown-up limit, before the compressor like the page
        float g = comp.gain(std::fmax(std::fabs(a), std::fabs(b)));
        float post = g * comp.makeup * (m / 0.6f);         // Chrome's automatic make-up gain, then the limit again (the page's "out" gain)
        out[2 * i] = clip(a * post); out[2 * i + 1] = clip(b * post);
    }
    written += frames;
    int x = AAudioStream_getXRunCount(s);              // the sound broke up: one more burst of buffer
    if (x > lastXrun) {
        lastXrun = x; xruns = x;
        bufFrames = AAudioStream_setBufferSizeInFrames(s, AAudioStream_getBufferSizeInFrames(s) + AAudioStream_getFramesPerBurst(s));
    }
    return AAUDIO_CALLBACK_RESULT_CONTINUE;
}

bool exclusiveWanted = true;
bool open();
void onError(AAudioStream *, void *, aaudio_result_t err) {
    LOG("stream error %d, reopening", err);
    std::thread([] {                                   // must not close the stream on the callback thread
        if (stream) { AAudioStream_requestStop(stream); AAudioStream_close(stream); stream = nullptr; }
        if (running) open();
    }).detach();
}

bool open() {
    AAudioStreamBuilder *b;
    if (AAudio_createStreamBuilder(&b) != AAUDIO_OK) return false;
    AAudioStreamBuilder_setDirection(b, AAUDIO_DIRECTION_OUTPUT);
    AAudioStreamBuilder_setPerformanceMode(b, AAUDIO_PERFORMANCE_MODE_LOW_LATENCY);
    AAudioStreamBuilder_setSharingMode(b, exclusiveWanted ? AAUDIO_SHARING_MODE_EXCLUSIVE : AAUDIO_SHARING_MODE_SHARED);   // MMAP straight to the hardware when allowed
    AAudioStreamBuilder_setFormat(b, AAUDIO_FORMAT_PCM_FLOAT);
    AAudioStreamBuilder_setChannelCount(b, 2);
    if (__builtin_available(android 28, *)) {
        AAudioStreamBuilder_setUsage(b, AAUDIO_USAGE_GAME);
        AAudioStreamBuilder_setContentType(b, AAUDIO_CONTENT_TYPE_MUSIC);
    }
    AAudioStreamBuilder_setDataCallback(b, onAudio, nullptr);
    AAudioStreamBuilder_setErrorCallback(b, onError, nullptr);
    aaudio_result_t r = AAudioStreamBuilder_openStream(b, &stream);
    AAudioStreamBuilder_delete(b);
    if (r != AAUDIO_OK) { LOG("open failed %d", r); stream = nullptr; return false; }
    outRate = AAudioStream_getSampleRate(stream);
    reverb.init(outRate); comp.init(outRate);
    burst = AAudioStream_getFramesPerBurst(stream);
    bufFrames = AAudioStream_setBufferSizeInFrames(stream, burst * 2);   // start small, grow on xrun
    lastXrun = 0; xruns = 0; written = 0;
    for (auto &v : voices) v.on = false;
    r = AAudioStream_requestStart(stream);
    LOG("open: rate %d burst %d buffer %d sharing %d perf %d", outRate, burst.load(), bufFrames.load(),
        AAudioStream_getSharingMode(stream), AAudioStream_getPerformanceMode(stream));
    return r == AAUDIO_OK;
}

float latencyMs() {
    if (!stream) return -1;
    int64_t pos, t;
    if (AAudioStream_getTimestamp(stream, CLOCK_MONOTONIC, &pos, &t) != AAUDIO_OK) return -1;
    timespec now; clock_gettime(CLOCK_MONOTONIC, &now);
    int64_t n = now.tv_sec * 1000000000LL + now.tv_nsec;
    double played = pos + (n - t) * (double)outRate / 1e9;
    return (float)((AAudioStream_getFramesWritten(stream) - played) * 1000.0 / outRate);
}

}  // namespace

extern "C" {
JNIEXPORT void JNICALL Java_md_home_pianolessons_NativePiano_nSample(JNIEnv *env, jclass, jint i, jint midi, jint rate, jshortArray pcm) {
    if (i < 0 || i >= SAMPLES) return;
    jsize n = env->GetArrayLength(pcm);
    samples[i].pcm.resize(n + 1, 0);                   // +1: the interpolation reads one ahead
    env->GetShortArrayRegion(pcm, 0, n, samples[i].pcm.data());
    samples[i].midi = midi; srcRate = rate;
}
JNIEXPORT jboolean JNICALL Java_md_home_pianolessons_NativePiano_nStart(JNIEnv *, jclass, jboolean excl) {
    if (running) return true;
    exclusiveWanted = excl;
    running = true;
    if (!open()) { running = false; return false; }
    return true;
}
JNIEXPORT void JNICALL Java_md_home_pianolessons_NativePiano_nStop(JNIEnv *, jclass) {
    running = false;
    if (stream) { AAudioStream_requestStop(stream); AAudioStream_close(stream); stream = nullptr; }
}
JNIEXPORT void JNICALL Java_md_home_pianolessons_NativePiano_nEvent(JNIEnv *, jclass, jint type, jint midi, jfloat vel) { push(type, midi, vel); }
JNIEXPORT void JNICALL Java_md_home_pianolessons_NativePiano_nCfg(JNIEnv *, jclass, jfloat m, jfloat w, jfloat wd) { master = m; wetLevel = w; width = wd; }
/** rate, burst, buffer frames, xruns, output latency ms, exclusive (1) / shared (0), low-latency mode (1) */
JNIEXPORT jfloatArray JNICALL Java_md_home_pianolessons_NativePiano_nStats(JNIEnv *env, jclass) {
    float v[7] = {(float)outRate, (float)burst.load(), (float)bufFrames.load(), (float)xruns.load(), latencyMs(),
                  stream && AAudioStream_getSharingMode(stream) == AAUDIO_SHARING_MODE_EXCLUSIVE ? 1.f : 0.f,
                  stream && AAudioStream_getPerformanceMode(stream) == AAUDIO_PERFORMANCE_MODE_LOW_LATENCY ? 1.f : 0.f};
    jfloatArray a = env->NewFloatArray(7);
    env->SetFloatArrayRegion(a, 0, 7, v);
    return a;
}
}
