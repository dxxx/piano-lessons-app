package md.home.pianolessons;

import android.app.Activity;
import android.app.ActivityManager;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.security.MessageDigest;

/**
 * One screen, one playlist. The page (assets/index.html) hosts YouTube's official
 * embed player; every attempt to leave it — links, the YouTube logo, end-screen
 * suggestions, popups — is swallowed here, and the app pins itself (lock task)
 * so a child cannot switch away without the grown-up PIN.
 */
public class MainActivity extends Activity {

    // Any https origin works; YouTube's embed refuses to play without a referrer.
    private static final String PAGE_ORIGIN = "https://pianolessons.home/";

    private WebView web;
    private FrameLayout root;
    private View fullscreenView;
    private WebChromeClient.CustomViewCallback fullscreenCallback;
    private boolean unlocking;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        root = new FrameLayout(this);
        root.setBackgroundColor(Color.parseColor("#14121F"));
        web = new WebView(this);
        root.addView(web, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(root);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setSupportMultipleWindows(true); // so popups reach onCreateWindow and get refused
        s.setJavaScriptCanOpenWindowsAutomatically(false);

        web.setLongClickable(false); // no link/image menus
        web.setOnLongClickListener(new View.OnLongClickListener() {
            @Override
            public boolean onLongClick(View v) { return true; }
        });
        web.addJavascriptInterface(new Parent(), "Parent");
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return true; // never navigate away from the lesson page
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onCreateWindow(WebView view, boolean dialog, boolean userGesture, android.os.Message msg) {
                return false; // YouTube logo / "Watch on YouTube" / suggestions: refused
            }

            @Override
            public void onShowCustomView(View view, CustomViewCallback callback) {
                if (fullscreenView != null) { callback.onCustomViewHidden(); return; }
                fullscreenView = view;
                fullscreenCallback = callback;
                root.addView(view, new FrameLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
                web.setVisibility(View.GONE);
                hideSystemBars();
            }

            @Override
            public void onHideCustomView() {
                exitFullscreen();
            }
        });

        web.loadDataWithBaseURL(PAGE_ORIGIN, readAsset("index.html"), "text/html", "utf-8", null);
    }

    /** Pin the app whenever it comes to the front unpinned; the system asks to confirm. */
    private void ensurePinned() {
        if (unlocking) return;
        ActivityManager am = (ActivityManager) getSystemService(ACTIVITY_SERVICE);
        if (am != null && am.getLockTaskModeState() == ActivityManager.LOCK_TASK_MODE_NONE) {
            try { startLockTask(); } catch (Exception ignored) { }
        }
    }

    private void exitFullscreen() {
        if (fullscreenView == null) return;
        root.removeView(fullscreenView);
        fullscreenView = null;
        web.setVisibility(View.VISIBLE);
        if (fullscreenCallback != null) fullscreenCallback.onCustomViewHidden();
        fullscreenCallback = null;
        hideSystemBars();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemBars();
    }

    @SuppressWarnings("deprecation")
    private void hideSystemBars() {
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        if (fullscreenView != null) exitFullscreen(); // Back only ever leaves fullscreen
    }

    @Override
    protected void onPause() {
        super.onPause();
        web.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
        ensurePinned();
    }

    private String readAsset(String name) {
        try (InputStream in = getAssets().open(name)) {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            for (int n; (n = in.read(buf)) > 0; ) out.write(buf, 0, n);
            return out.toString("UTF-8");
        } catch (Exception e) {
            return "<h1>Could not load the lesson page</h1>";
        }
    }

    /** The grown-up PIN and exit. Only a SHA-256 of the PIN is stored, in app-private prefs. */
    private class Parent {
        private SharedPreferences prefs() {
            return getSharedPreferences("parent", MODE_PRIVATE);
        }

        private String hash(String pin) {
            try {
                byte[] d = MessageDigest.getInstance("SHA-256")
                        .digest(("piano-lessons:" + pin).getBytes("UTF-8"));
                StringBuilder sb = new StringBuilder();
                for (byte b : d) sb.append(String.format("%02x", b));
                return sb.toString();
            } catch (Exception e) {
                return "";
            }
        }

        @JavascriptInterface
        public boolean hasPin() {
            return prefs().contains("pin");
        }

        @JavascriptInterface
        public void setPin(String pin) {
            if (pin != null && pin.matches("\\d{4,8}")) prefs().edit().putString("pin", hash(pin)).apply();
        }

        @JavascriptInterface
        public boolean checkPin(String pin) {
            return pin != null && hash(pin).equals(prefs().getString("pin", null));
        }

        @JavascriptInterface
        public void unlock() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    unlocking = true;
                    try { stopLockTask(); } catch (Exception ignored) { }
                    finishAndRemoveTask();
                }
            });
        }
    }
}
