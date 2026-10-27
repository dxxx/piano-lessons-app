package md.home.pianolessons;

import android.app.Activity;
import android.os.SystemClock;
import android.view.MotionEvent;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.FrameLayout;

import org.json.JSONArray;

/**
 * Native touch for the on-screen piano (what Synthesia does): a transparent view laid exactly over the page's keys.
 * Touches are read here, unbatched (requestUnbufferedDispatch), and go straight to NativePiano; the page is only
 * told afterwards so it can light the key. The page sends the key rectangles as window.NKeys.keys(json):
 * [[midi, left, top, right, bottom, black], ...] in device pixels; "[]" hands touch back to the page.
 */
public class KeyOverlay extends View {
    private final Activity act;
    private final WebView web;
    private final NativePiano piano;
    private float[][] keys = new float[0][];        // midi, l, t, r, b, black (view pixels, relative to this view)
    private final int[] down = new int[32];         // pointer id -> midi (-1 none)
    private final int[] fingers = new int[128];
    private float sizeBase = 0, sensK = 0.8f;
    private volatile float lastLagMs = -1;

    public KeyOverlay(Activity a, WebView w, NativePiano p) {
        super(a);
        act = a; web = w; piano = p;
        java.util.Arrays.fill(down, -1);
        setVisibility(GONE);
    }

    // ---------------- page API (window.NKeys) ----------------
    @JavascriptInterface
    public void keys(final String json) {
        act.runOnUiThread(new Runnable() { public void run() { setKeys(json); } });
    }
    /** touch velocity sensitivity: 0 = off (fixed level), 0.8 normal, 1.4 strong (same as the page's SENS_K) */
    @JavascriptInterface public void sens(float k) { sensK = k; }
    @JavascriptInterface public float lag() { return lastLagMs; }

    private void setKeys(String json) {
        releaseAll();
        try {
            JSONArray a = new JSONArray(json);
            if (a.length() == 0) { keys = new float[0][]; setVisibility(GONE); return; }
            float d = 1f;                       // the page already sends device pixels (CSS px * devicePixelRatio)
            float[][] k = new float[a.length()][];
            float l = 1e9f, t = 1e9f, r = -1e9f, b = -1e9f;
            for (int i = 0; i < a.length(); i++) {
                JSONArray e = a.getJSONArray(i);
                k[i] = new float[]{(float) e.getDouble(0), (float) e.getDouble(1) * d, (float) e.getDouble(2) * d,
                        (float) e.getDouble(3) * d, (float) e.getDouble(4) * d, (float) e.getDouble(5)};
                l = Math.min(l, k[i][1]); t = Math.min(t, k[i][2]); r = Math.max(r, k[i][3]); b = Math.max(b, k[i][4]);
            }
            for (float[] e : k) { e[1] -= l; e[3] -= l; e[2] -= t; e[4] -= t; }
            keys = k;
            FrameLayout.LayoutParams lp = new FrameLayout.LayoutParams(Math.round(r - l), Math.round(b - t));
            lp.leftMargin = Math.round(l); lp.topMargin = Math.round(t);
            setLayoutParams(lp);
            setVisibility(VISIBLE);
        } catch (Exception e) { keys = new float[0][]; setVisibility(GONE); }
    }

    // ---------------- touch ----------------
    private int keyAt(float x, float y) {
        for (float[] k : keys) if (k[5] > 0 && x >= k[1] && x < k[3] && y >= k[2] && y < k[4]) return (int) k[0];   // black keys sit on top
        for (float[] k : keys) if (k[5] == 0 && x >= k[1] && x < k[3] && y >= k[2] && y < k[4]) return (int) k[0];
        return -1;
    }

    private float[] rectOf(int m) { for (float[] k : keys) if ((int) k[0] == m) return k; return null; }

    /** 0.25..1 from where the finger lands on the key (nearer the front = louder), contact size and real pressure; same rule as the page */
    private float velocity(MotionEvent e, int i, int m, boolean isDown) {
        float[] k = rectOf(m);
        float pos = k == null ? 0.5f : Math.max(0, Math.min(1, (e.getY(i) - k[2]) / Math.max(1, k[4] - k[2])));
        float sum = pos, w = 1;
        float sz = (e.getTouchMajor(i) + e.getTouchMinor(i)) / 2f;
        if (sz > 1.5f) {
            float c = sizeBase > 0 ? Math.max(0, Math.min(1, 0.5f + (sz / sizeBase - 1) * 1.2f)) : 0.5f;
            if (isDown) sizeBase = sizeBase > 0 ? sizeBase * 0.9f + sz * 0.1f : sz;
            sum += c; w += 1;
        }
        float pr = e.getPressure(i);
        if (pr > 0 && pr != 1f && pr != 0.5f) { sum += 2 * Math.max(0, Math.min(1, pr * 1.2f)); w += 2; }
        if (sensK <= 0) return 0.8f;
        float h = sum / w;
        return 0.25f + 0.75f * Math.max(0, Math.min(1, 0.5f + (h - 0.5f) * (1 + sensK)));
    }

    private void press(int id, int m, MotionEvent e, int i, boolean isDown) {
        if (id < 0 || id >= down.length) return;
        int prev = down[id];
        if (prev == m) return;
        if (prev >= 0 && --fingers[prev] <= 0) { fingers[prev] = 0; piano.off(prev); tell(prev, false); }
        down[id] = m;
        if (m >= 0 && ++fingers[m] == 1) {
            piano.on(m, e == null ? 0.8f : velocity(e, i, m, isDown));   // sound first
            if (e != null) lastLagMs = SystemClock.uptimeMillis() - e.getEventTime();
            tell(m, true);                                              // then the page lights the key
        }
    }

    private void tell(int m, boolean on) {
        web.evaluateJavascript("window.pianoNat&&pianoNat(" + m + "," + (on ? 1 : 0) + ")", null);
    }

    private void releaseAll() { for (int id = 0; id < down.length; id++) if (down[id] >= 0) press(id, -1, null, 0, false); }

    @Override
    public boolean onTouchEvent(MotionEvent e) {
        int a = e.getActionMasked(), i = e.getActionIndex();
        switch (a) {
            case MotionEvent.ACTION_DOWN:
                requestUnbufferedDispatch(e);          // deliver every touch at once, not batched to the next frame
            case MotionEvent.ACTION_POINTER_DOWN:
                press(e.getPointerId(i), keyAt(e.getX(i), e.getY(i)), e, i, true);
                return true;
            case MotionEvent.ACTION_MOVE:
                for (int p = 0; p < e.getPointerCount(); p++) press(e.getPointerId(p), keyAt(e.getX(p), e.getY(p)), e, p, false);
                return true;
            case MotionEvent.ACTION_UP:
            case MotionEvent.ACTION_POINTER_UP:
                press(e.getPointerId(i), -1, null, 0, false);
                return true;
            case MotionEvent.ACTION_CANCEL:
                releaseAll();
                return true;
        }
        return true;
    }
}
