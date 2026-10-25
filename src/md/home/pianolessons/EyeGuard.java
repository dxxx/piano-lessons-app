package md.home.pianolessons;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.ImageFormat;
import android.hardware.camera2.CameraAccessException;
import android.hardware.camera2.CameraCaptureSession;
import android.hardware.camera2.CameraCharacteristics;
import android.hardware.camera2.CameraDevice;
import android.hardware.camera2.CameraManager;
import android.hardware.camera2.CaptureRequest;
import android.hardware.camera2.params.StreamConfigurationMap;
import android.media.FaceDetector;
import android.media.Image;
import android.media.ImageReader;
import android.os.Handler;
import android.os.HandlerThread;
import android.os.SystemClock;
import android.util.Size;
import android.util.SizeF;
import android.view.Surface;

import java.nio.ByteBuffer;
import java.nio.ShortBuffer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * Eye-distance guard. The front camera is read about once a second at a tiny size, one face is looked for with
 * the platform android.media.FaceDetector, and the eye spacing relative to the frame width tells how close the
 * child is. Frames live in memory only for the moment they are examined: never saved, logged or sent anywhere.
 * Events (called on the camera thread): "close" (cover the screen), "ok" (uncover), "state", "cal".
 */
class EyeGuard {
    interface Listener { void onEvent(String type, String arg); }

    private static final float EYE_CM = 5.5f;          // average child's eye spacing
    private static final int[] ROTS = {0, 90, 270, 180};

    private final Activity act;
    private final Listener ls;
    private final SharedPreferences prefs;

    private HandlerThread thread;
    private Handler handler;
    private CameraDevice cam;
    private CameraCaptureSession session;
    private ImageReader reader;
    private volatile boolean running;

    private volatile boolean strict;
    private volatile boolean calibrating;
    private long calStart;
    private final List<Float> calSamples = new ArrayList<Float>();

    // from the camera's characteristics, for the no-calibration default
    private float focalMm, physW, physH;
    private int rot = 0;                                // the rotation that last found a face
    private long lastFrame;
    private int closeN;
    private long okSince, noFaceSince;
    private boolean covered;

    EyeGuard(Activity a, Listener l) {
        act = a; ls = l;
        prefs = a.getSharedPreferences("eye", Context.MODE_PRIVATE);
    }

    void setStrict(boolean s) { strict = s; }
    boolean hasCal() { return prefs.getFloat("cal", 0f) > 0f; }
    void resetCal() { prefs.edit().remove("cal").apply(); }
    boolean isCalibrating() { return calibrating; }

    /** Start a 7-second calibration run: samples after the first 2 s are averaged (median) into the stored ratio. */
    void calibrate() {
        synchronized (calSamples) { calSamples.clear(); }
        calStart = SystemClock.elapsedRealtime();
        calibrating = true;
    }

    /** Main thread. Idempotent. */
    synchronized void start() {
        if (running) return;
        running = true;
        covered = false; closeN = 0; okSince = 0; noFaceSince = 0; lastFrame = 0;
        thread = new HandlerThread("eyeguard");
        thread.start();
        handler = new Handler(thread.getLooper());
        handler.post(new Runnable() {
            @Override
            public void run() { open(); }
        });
    }

    /** Main thread. Idempotent. Releases the camera at once (the green dot goes away). */
    synchronized void stop() {
        if (!running) return;
        running = false;
        final boolean wasCovered = covered;
        covered = false;
        final Handler h = handler;
        final HandlerThread t = thread;
        handler = null; thread = null;
        if (h != null) {
            h.post(new Runnable() {
                @Override
                public void run() {
                    closeAll();
                    if (wasCovered) ls.onEvent("ok", "");
                    if (t != null) t.quitSafely();
                }
            });
        }
    }

    private void closeAll() {
        try { if (session != null) session.close(); } catch (Exception ignored) { }
        try { if (cam != null) cam.close(); } catch (Exception ignored) { }
        try { if (reader != null) reader.close(); } catch (Exception ignored) { }
        session = null; cam = null; reader = null;
    }

    private void open() {
        try {
            CameraManager cm = (CameraManager) act.getSystemService(Context.CAMERA_SERVICE);
            String id = null;
            CameraCharacteristics cc = null;
            for (String s : cm.getCameraIdList()) {
                CameraCharacteristics c = cm.getCameraCharacteristics(s);
                Integer f = c.get(CameraCharacteristics.LENS_FACING);
                if (f != null && f == CameraCharacteristics.LENS_FACING_FRONT) { id = s; cc = c; break; }
            }
            if (id == null) { ls.onEvent("state", "nocam"); return; }
            SizeF ps = cc.get(CameraCharacteristics.SENSOR_INFO_PHYSICAL_SIZE);
            float[] fl = cc.get(CameraCharacteristics.LENS_INFO_AVAILABLE_FOCAL_LENGTHS);
            if (ps != null && fl != null && fl.length > 0) { physW = ps.getWidth(); physH = ps.getHeight(); focalMm = fl[0]; }
            StreamConfigurationMap map = cc.get(CameraCharacteristics.SCALER_STREAM_CONFIGURATION_MAP);
            Size[] sizes = map == null ? null : map.getOutputSizes(ImageFormat.YUV_420_888);
            if (sizes == null || sizes.length == 0) { ls.onEvent("state", "err:no small camera size"); return; }
            Size best = sizes[0];
            for (Size s : sizes) {                  // the size closest to 320x240 (tiny is enough, and quick)
                if (s.getWidth() < 160) continue;
                if (best.getWidth() < 160 || Math.abs(s.getWidth() * s.getHeight() - 76800) < Math.abs(best.getWidth() * best.getHeight() - 76800)) best = s;
            }
            reader = ImageReader.newInstance(best.getWidth(), best.getHeight(), ImageFormat.YUV_420_888, 2);
            reader.setOnImageAvailableListener(new ImageReader.OnImageAvailableListener() {
                @Override
                public void onImageAvailable(ImageReader r) { frame(r); }
            }, handler);
            cm.openCamera(id, new CameraDevice.StateCallback() {
                @Override
                public void onOpened(CameraDevice d) {
                    cam = d;
                    if (!running) { closeAll(); return; }
                    try {
                        d.createCaptureSession(Arrays.asList(reader.getSurface()), new CameraCaptureSession.StateCallback() {
                            @Override
                            public void onConfigured(CameraCaptureSession s) {
                                session = s;
                                if (!running) { closeAll(); return; }
                                try {
                                    CaptureRequest.Builder b = cam.createCaptureRequest(CameraDevice.TEMPLATE_PREVIEW);
                                    b.addTarget(reader.getSurface());
                                    s.setRepeatingRequest(b.build(), null, handler);
                                    ls.onEvent("state", "running");
                                } catch (Exception e) { ls.onEvent("state", "err:" + e.getMessage()); }
                            }

                            @Override
                            public void onConfigureFailed(CameraCaptureSession s) { ls.onEvent("state", "err:camera session failed"); }
                        }, handler);
                    } catch (Exception e) { ls.onEvent("state", "err:" + e.getMessage()); }
                }

                @Override
                public void onDisconnected(CameraDevice d) { d.close(); cam = null; ls.onEvent("state", "err:camera in use by another app"); }

                @Override
                public void onError(CameraDevice d, int code) { d.close(); cam = null; ls.onEvent("state", "err:camera error " + code); }
            }, handler);
        } catch (SecurityException e) {
            ls.onEvent("state", "noperm");
        } catch (CameraAccessException e) {
            ls.onEvent("state", "err:" + e.getMessage());
        } catch (Exception e) {
            ls.onEvent("state", "err:" + e);
        }
    }

    // ---- one frame, at most once a second (twice a second while calibrating) ----

    private void frame(ImageReader r) {
        Image im = null;
        byte[] y = null; int w = 0, h = 0;
        try {
            im = r.acquireLatestImage();
            if (im == null) return;
            long now = SystemClock.elapsedRealtime();
            if (now - lastFrame < (calibrating ? 500 : 1000)) return;
            lastFrame = now;
            w = im.getWidth(); h = im.getHeight();
            Image.Plane p = im.getPlanes()[0];
            ByteBuffer buf = p.getBuffer();
            int rs = p.getRowStride(), ps = p.getPixelStride();
            y = new byte[w * h];
            byte[] row = new byte[rs];
            for (int j = 0; j < h; j++) {
                int pos = j * rs;
                int n = Math.min(rs, buf.limit() - pos);
                if (n <= 0) break;
                buf.position(pos); buf.get(row, 0, n);
                if (ps == 1) System.arraycopy(row, 0, y, j * w, Math.min(w, n));
                else for (int i = 0; i < w && i * ps < n; i++) y[j * w + i] = row[i * ps];
            }
        } catch (Exception e) {
            y = null;
        } finally {
            if (im != null) im.close();                  // give the buffer back at once
        }
        if (y != null) analyse(y, w, h, SystemClock.elapsedRealtime());
    }

    private void analyse(byte[] y, int w, int h, long now) {
        float ratio = -1; int usedRot = rot;
        int[] order = new int[ROTS.length];
        order[0] = rot; int k = 1;
        for (int r : ROTS) if (r != rot) order[k++] = r;
        for (int r : order) {
            int dw = (r == 90 || r == 270) ? h : w, dh = (r == 90 || r == 270) ? w : h;
            dw &= ~1;                                     // FaceDetector needs an even width
            Bitmap bmp = null;
            try {
                bmp = grey(y, w, h, r, dw, dh);
                FaceDetector.Face[] faces = new FaceDetector.Face[1];
                int n = new FaceDetector(dw, dh, 1).findFaces(bmp, faces);
                if (n > 0 && faces[0] != null && faces[0].confidence() >= 0.4f) {
                    ratio = faces[0].eyesDistance() / dw;
                    usedRot = r; rot = r;
                    break;
                }
            } catch (Exception ignored) {
            } finally {
                if (bmp != null) bmp.recycle();
            }
        }
        if (ratio < 0) { noFace(now); return; }
        noFaceSince = 0;
        if (calibrating) { calSample(ratio, now); return; }
        if (ratio > threshold(usedRot)) {
            okSince = 0;
            if (++closeN >= 2 && !covered) { covered = true; ls.onEvent("close", String.valueOf(ratio)); }
        } else {
            closeN = 0;
            if (covered) {
                if (okSince == 0) okSince = now;
                else if (now - okSince >= 2000) { covered = false; okSince = 0; ls.onEvent("ok", ""); }
            }
        }
    }

    /** No face: never covers. If already covered and nobody is seen for 8 s, he has left: uncover. */
    private void noFace(long now) {
        closeN = 0; okSince = 0;
        if (calibrating) { calSample(-1, now); return; }
        if (!covered) return;
        if (noFaceSince == 0) noFaceSince = now;
        else if (now - noFaceSince >= 8000) { covered = false; noFaceSince = 0; ls.onEvent("ok", ""); }
    }

    private void calSample(float ratio, long now) {
        if (ratio > 0 && now - calStart > 2000) synchronized (calSamples) { calSamples.add(ratio); }
        if (now - calStart < 7000) return;
        calibrating = false;
        float med = -1;
        synchronized (calSamples) {
            if (calSamples.size() >= 3) {
                List<Float> c = new ArrayList<Float>(calSamples);
                Collections.sort(c);
                med = c.get(c.size() / 2);
            }
        }
        if (med > 0) prefs.edit().putFloat("cal", med).apply();
        ls.onEvent("cal", med > 0 ? String.valueOf(med) : "none");
    }

    /** Eye spacing / frame width above which the child is "too close". */
    private float threshold(int r) {
        float cal = prefs.getFloat("cal", 0f);
        if (cal > 0f) return cal * (strict ? 1.15f : 1.35f);
        float dist = strict ? 40f : 30f;                  // cm
        float dim = (r == 90 || r == 270) ? physH : physW; // mm of sensor along the upright horizontal
        if (focalMm > 0 && dim > 0) return EYE_CM * focalMm / (dist * dim);
        return EYE_CM / (2f * dist * 0.577f);             // no data: assume a 60 degree horizontal view
    }

    /** The Y (luma) plane as a rotated RGB_565 grey bitmap, dw x dh with dw even. */
    private static Bitmap grey(byte[] y, int w, int h, int r, int dw, int dh) {
        short[] px = new short[dw * dh];
        for (int j = 0; j < dh; j++) {
            for (int i = 0; i < dw; i++) {
                int sx, sy;
                switch (r) {
                    case 90: sx = j; sy = h - 1 - i; break;
                    case 270: sx = w - 1 - j; sy = i; break;
                    case 180: sx = w - 1 - i; sy = h - 1 - j; break;
                    default: sx = i; sy = j;
                }
                int g = y[sy * w + sx] & 0xff;
                px[j * dw + i] = (short) (((g >> 3) << 11) | ((g >> 2) << 5) | (g >> 3));
            }
        }
        Bitmap b = Bitmap.createBitmap(dw, dh, Bitmap.Config.RGB_565);
        b.copyPixelsFromBuffer(ShortBuffer.wrap(px));
        return b;
    }
}
