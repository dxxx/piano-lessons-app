package md.home.pianolessons;

import android.app.Activity;
import android.Manifest;
import android.app.ActivityManager;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.security.MessageDigest;
import java.util.Locale;

import org.json.JSONObject;
import org.vosk.LibVosk;
import org.vosk.LogLevel;
import org.vosk.Model;
import org.vosk.Recognizer;
import org.vosk.android.RecognitionListener;
import org.vosk.android.SpeechService;
import org.vosk.android.StorageService;

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

    // Voice quiz (offline Vosk speech recognition + Android text-to-speech); all of it is driven by the page
    private static final int REQ_MIC = 71;
    private Model model;
    private String modelLang, wantLang, pendingLang;
    private boolean loadingModel;
    private Recognizer rec;
    private SpeechService svc;
    private int listenGen;
    private TextToSpeech tts;
    private boolean ttsReady, ttsEn, ttsEs;

    // Eye-distance guard (front camera, on-device only); the page decides when it is wanted
    private static final int REQ_CAM = 72;
    private EyeGuard eye;
    private boolean eyeOn, eyeMenuOpen, eyeResumed;

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
        web.addJavascriptInterface(new Voice(), "Voice");
        eye = new EyeGuard(this, new EyeGuard.Listener() {
            @Override
            public void onEvent(String type, String arg) { jsEye(type, arg); }
        });
        web.addJavascriptInterface(new Eye(), "Eye");
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return true; // never navigate away from the lesson page
            }

            /** Serve the bundled piano samples (assets/sounds/...) to the page; everything else is untouched. */
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (!url.startsWith(PAGE_ORIGIN + "sounds/")) return null;
                String path = request.getUrl().getPath();               // /sounds/grand/C4.mp3
                if (path == null || path.length() < 2 || path.contains("..")) return null;
                try {
                    InputStream in = getAssets().open(path.substring(1));
                    Map<String, String> headers = new HashMap<String, String>();
                    headers.put("Access-Control-Allow-Origin", "*");
                    return new WebResourceResponse("audio/mpeg", null, 200, "OK", headers, in);
                } catch (Exception e) {
                    return null;
                }
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
        stopListening();                        // never keep the microphone open in the background
        eyeResumed = false; eye.stop();         // ...nor the camera
        if (tts != null) tts.stop();
        web.evaluateJavascript("window.lockMenu&&window.lockMenu()", null);   // the grown-up menu relocks
        web.onPause();
    }

    @Override
    protected void onDestroy() {
        eye.stop();
        stopListening();
        freeModel();
        if (tts != null) { tts.shutdown(); tts = null; }
        super.onDestroy();
    }

    // ---- Voice quiz ----

    /** Tell the page something happened: window.voiceEvent(type, text). */
    private void js(String type, String arg) {
        final String call = "window.voiceEvent&&window.voiceEvent(" + JSONObject.quote(type) + ","
                + JSONObject.quote(arg == null ? "" : arg) + ")";
        runOnUiThread(new Runnable() {
            @Override
            public void run() { web.evaluateJavascript(call, null); }
        });
    }

    /** Main thread. Permission, then the native libraries, then the model of one language (one model at a time). */
    private void initVoice(final String lang) {
        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            pendingLang = lang;
            requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, REQ_MIC);
            return;
        }
        try {
            LibVosk.setLogLevel(LogLevel.WARNINGS);   // first touch of the native libraries (libvosk + JNA)
        } catch (Throwable t) {
            js("error", "the speech library did not load (" + t.getClass().getSimpleName() + ")");
            return;
        }
        initTts();
        if (model != null && lang.equals(modelLang)) { js("ready", lang); return; }
        wantLang = lang;
        if (loadingModel) return;                    // the running load re-checks wantLang when it ends
        stopListening();
        freeModel();
        loadingModel = true;
        js("loading", lang);
        StorageService.unpack(this, "models/" + lang, "model-" + lang,
                new StorageService.Callback<Model>() {
                    @Override
                    public void onComplete(Model m) {
                        loadingModel = false;
                        if (isDestroyed()) { m.close(); return; }
                        model = m;
                        modelLang = lang;
                        if (!lang.equals(wantLang)) { initVoice(wantLang); return; }
                        js("ready", lang);
                    }
                },
                new StorageService.Callback<java.io.IOException>() {
                    @Override
                    public void onComplete(java.io.IOException e) {
                        loadingModel = false;
                        js("error", "the voice model could not be prepared (" + e.getMessage() + ")");
                    }
                });
    }

    private void freeModel() {
        if (model != null) { model.close(); model = null; modelLang = null; }
    }

    private void stopListening() {
        listenGen++;                                 // results still in flight are ignored
        if (svc != null) {
            try { svc.stop(); svc.shutdown(); } catch (Exception ignored) { }
            svc = null;
        }
        if (rec != null) { rec.close(); rec = null; }
    }

    private void startListening() {
        stopListening();
        if (model == null) { js("error", "the voice model is not loaded"); return; }
        final int gen = ++listenGen;
        try {
            // A grammar (number words + plus/minus/is/equals) keeps the recogniser on the maths
            rec = new Recognizer(model, 16000.0f, readAsset("grammar/" + modelLang + ".json"));
            svc = new SpeechService(rec, 16000.0f);
            svc.startListening(new RecognitionListener() {
                private String text(String json, String key) {
                    try { return new JSONObject(json).optString(key, ""); } catch (Exception e) { return ""; }
                }
                @Override public void onPartialResult(String h) { if (gen == listenGen) js("partial", text(h, "partial")); }
                @Override public void onResult(String h) { if (gen == listenGen) js("final", text(h, "text")); }
                @Override public void onFinalResult(String h) { if (gen == listenGen) js("final", text(h, "text")); }
                @Override public void onError(Exception e) { if (gen == listenGen) js("listenError", String.valueOf(e.getMessage())); }
                @Override public void onTimeout() { if (gen == listenGen) js("timeout", ""); }
            });
        } catch (Exception e) {
            stopListening();
            js("listenError", String.valueOf(e.getMessage()));
        }
    }

    @Override
    public void onRequestPermissionsResult(int code, String[] perms, int[] results) {
        super.onRequestPermissionsResult(code, perms, results);
        if (code == REQ_CAM) { eyeRefresh(); return; }
        if (code != REQ_MIC) return;
        String lang = pendingLang;
        pendingLang = null;
        if (results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED && lang != null) initVoice(lang);
        else js("denied", "");
    }

    /** Tell the page which languages have a voice: "<en><es>" as 1/0. */
    private void ttsReport() {
        js("tts", (ttsReady && ttsEn ? "1" : "0") + (ttsReady && ttsEs ? "1" : "0"));
    }

    private void initTts() {
        if (tts != null) { ttsReport(); return; }
        tts = new TextToSpeech(this, new TextToSpeech.OnInitListener() {
            @Override
            public void onInit(int status) {
                if (status == TextToSpeech.SUCCESS && tts != null) {
                    ttsEn = tts.isLanguageAvailable(new Locale("en", "US")) >= TextToSpeech.LANG_AVAILABLE;
                    ttsEs = tts.isLanguageAvailable(new Locale("es", "ES")) >= TextToSpeech.LANG_AVAILABLE;
                    ttsReady = true;
                    tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {   // the page waits for "spoke"
                        @Override public void onStart(String id) {}
                        @Override public void onDone(String id) { js("spoke", id); }
                        @Override public void onError(String id) { js("spoke", id); }
                        @Override public void onStop(String id, boolean interrupted) { js("spoke", id); }
                    });
                }
                ttsReport();
            }
        });
    }

    // ---- Eye-distance guard ----

    private void jsEye(String type, String arg) {
        final String call = "window.eyeEvent&&window.eyeEvent(" + JSONObject.quote(type) + ","
                + JSONObject.quote(arg == null ? "" : arg) + ")";
        runOnUiThread(new Runnable() {
            @Override
            public void run() { web.evaluateJavascript(call, null); }
        });
    }

    /** Main thread: run the camera only when wanted, allowed, in front, and the grown-up menu is closed. */
    private void eyeRefresh() {
        boolean perm = checkSelfPermission(Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED;
        boolean cal = eye.isCalibrating();
        if (eyeResumed && perm && (cal || (eyeOn && !eyeMenuOpen))) eye.start(); else eye.stop();
        jsEye("state", !eyeOn && !cal ? "off" : !perm ? "noperm" : eyeMenuOpen && !cal ? "menu" : "on");
    }

    /** The page's eye-guard calls. */
    private class Eye {
        @JavascriptInterface
        public void config(final boolean on, final boolean strict) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() { eyeOn = on; eye.setStrict(strict); eyeRefresh(); }
            });
        }

        @JavascriptInterface
        public void menu(final boolean open) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() { eyeMenuOpen = open; eyeRefresh(); }
            });
        }

        @JavascriptInterface
        public void ask() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (checkSelfPermission(Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED)
                        requestPermissions(new String[]{Manifest.permission.CAMERA}, REQ_CAM);
                    else eyeRefresh();
                }
            });
        }

        @JavascriptInterface
        public void calibrate() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (checkSelfPermission(Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
                        requestPermissions(new String[]{Manifest.permission.CAMERA}, REQ_CAM);
                        return;
                    }
                    eye.calibrate(); eyeRefresh();
                }
            });
        }

        @JavascriptInterface
        public void resetCal() { eye.resetCal(); }

        @JavascriptInterface
        public boolean hasCal() { return eye.hasCal(); }
    }

    /** The page's voice calls. Everything that touches the recogniser runs on the main thread. */
    private class Voice {
        @JavascriptInterface
        public void voiceInit(final String lang) {
            final String l = "es".equals(lang) ? "es" : "en";
            runOnUiThread(new Runnable() {
                @Override
                public void run() { initVoice(l); }
            });
        }

        @JavascriptInterface
        public void voiceListen() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() { startListening(); }
            });
        }

        @JavascriptInterface
        public void voiceStop() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() { stopListening(); }
            });
        }

        @JavascriptInterface
        public void voiceRelease() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() { stopListening(); if (!loadingModel) freeModel(); }
            });
        }

        @JavascriptInterface
        public void ttsInit() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() { initTts(); }
            });
        }

        /** Speak, then tell the page "spoke" with the same id (also when it cannot speak, so the quiz never waits). */
        @JavascriptInterface
        public void speak(final String text, final String lang, final float rate, final String id) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    boolean es = "es".equals(lang);
                    if (!ttsReady || tts == null || !(es ? ttsEs : ttsEn)) { js("spoke", id); return; }   // no voice installed
                    tts.setLanguage(es ? new Locale("es", "ES") : new Locale("en", "US"));
                    tts.setSpeechRate(rate);
                    if (tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, id) != TextToSpeech.SUCCESS) js("spoke", id);
                }
            });
        }

        @JavascriptInterface
        public void speakStop() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() { if (tts != null) tts.stop(); }
            });
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
        eyeResumed = true; eyeRefresh();
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
