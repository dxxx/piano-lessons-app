package md.home.pianolessons;

import android.app.Activity;
import android.content.SharedPreferences;
import android.os.Build;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.HttpURLConnection;
import java.net.InetAddress;
import java.net.URL;
import java.net.URLEncoder;

/**
 * Remote lock (1.44). While the app is on screen it asks the grown-up's switch on the home PC
 * (tools/remote-lock-server.py) every 15 s whether to lock, and hands the answer to the page
 * (window.remoteState). The page owns the lock itself, so a lock survives restarts and the PIN
 * still works. The PC is found by a UDP broadcast on the home Wi-Fi, or by an address typed
 * in Menu > Screen time. Plain HTTP, LAN only; the page itself never talks to the network for this.
 * Exposed to the page as window.NRemote.
 */
public class RemoteLock {
    private static final int PORT = 47902, EVERY_MS = 15000;
    private final Activity act;
    private final WebView web;
    private final SharedPreferences prefs;
    private volatile boolean running;
    private volatile String status = "";
    private volatile String last = "not checked yet";
    private Thread thread;
    private int fails;

    public RemoteLock(Activity act, WebView web) {
        this.act = act;
        this.web = web;
        this.prefs = act.getSharedPreferences("remote", Activity.MODE_PRIVATE);
    }

    /** Typed address ("" = find the PC by itself). Accepts "192.168.1.5:47902" or a full http:// URL. */
    @JavascriptInterface
    public void setUrl(String u) {
        u = u == null ? "" : u.trim();
        if (!u.isEmpty() && !u.startsWith("http")) u = "http://" + u;
        if (u.endsWith("/")) u = u.substring(0, u.length() - 1);
        prefs.edit().putString("manual", u).putString("found", "").putBoolean("off", false).apply();
        fails = 0;
        kick();
    }

    @JavascriptInterface
    public void setOff(boolean off) { prefs.edit().putBoolean("off", off).apply(); kick(); }

    @JavascriptInterface
    public boolean isOff() { return prefs.getBoolean("off", false); }

    @JavascriptInterface
    public String url() {
        String m = prefs.getString("manual", "");
        return m.isEmpty() ? prefs.getString("found", "") : m;
    }

    @JavascriptInterface
    public boolean manual() { return !prefs.getString("manual", "").isEmpty(); }

    /** One line about the last check, for the Menu ("connected 10:42", "PC not found"). */
    @JavascriptInterface
    public String last() { return last; }

    /** What the page wants the PC to see (lock state, minutes used); sent with the next check. */
    @JavascriptInterface
    public void status(String s) { status = s == null ? "" : s; }

    public synchronized void start() {
        if (running) return;
        running = true;
        thread = new Thread(new Runnable() {
            @Override
            public void run() { loop(); }
        }, "remote-lock");
        thread.setDaemon(true);
        thread.start();
    }

    public synchronized void stop() {
        running = false;
        if (thread != null) thread.interrupt();
        thread = null;
    }

    private void kick() { Thread t = thread; if (t != null) t.interrupt(); }

    private void loop() {
        while (running) {
            if (!prefs.getBoolean("off", false)) {
                try { once(); } catch (Throwable e) { last = "error: " + e.getClass().getSimpleName(); }
            } else last = "off";
            try { Thread.sleep(EVERY_MS); } catch (InterruptedException e) { /* kicked or stopped */ }
        }
    }

    private void once() throws Exception {
        String base = url();
        if (base.isEmpty()) base = discover();
        if (base.isEmpty()) { last = "PC not found on this Wi-Fi"; return; }
        String q = "/tablet?id=" + URLEncoder.encode(Build.MODEL == null ? "tablet" : Build.MODEL, "UTF-8")
                + "&s=" + URLEncoder.encode(status, "UTF-8");
        HttpURLConnection c = null;
        try {
            c = (HttpURLConnection) new URL(base + q).openConnection();
            c.setConnectTimeout(3000);
            c.setReadTimeout(3000);
            c.setUseCaches(false);
            if (c.getResponseCode() != 200) throw new Exception("HTTP " + c.getResponseCode());
            InputStream in = c.getInputStream();
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buf = new byte[1024];
            for (int n; (n = in.read(buf)) > 0 && out.size() < 4096; ) out.write(buf, 0, n);
            final String json = out.toString("UTF-8").trim();
            if (!json.startsWith("{")) throw new Exception("not JSON");
            fails = 0;
            java.util.Calendar k = java.util.Calendar.getInstance();
            last = String.format(java.util.Locale.ROOT, "connected %02d:%02d", k.get(java.util.Calendar.HOUR_OF_DAY), k.get(java.util.Calendar.MINUTE));
            act.runOnUiThread(new Runnable() {
                @Override
                public void run() { web.evaluateJavascript("window.remoteState&&window.remoteState(" + json + ")", null); }
            });
        } catch (Exception e) {
            last = "PC not answering (" + base.replace("http://", "") + ")";
            if (++fails >= 4 && !manual()) { prefs.edit().putString("found", "").apply(); fails = 0; }   // the PC moved: look again
        } finally {
            if (c != null) c.disconnect();
        }
    }

    /** Broadcast "piano-remote?" on the Wi-Fi; the PC answers "piano-remote <port>". */
    private String discover() {
        DatagramSocket s = null;
        try {
            s = new DatagramSocket();
            s.setBroadcast(true);
            s.setSoTimeout(1500);
            byte[] ask = "piano-remote?".getBytes("UTF-8");
            s.send(new DatagramPacket(ask, ask.length, InetAddress.getByName("255.255.255.255"), PORT));
            byte[] buf = new byte[64];
            DatagramPacket p = new DatagramPacket(buf, buf.length);
            s.receive(p);
            String r = new String(p.getData(), 0, p.getLength(), "UTF-8").trim();
            if (!r.startsWith("piano-remote ")) return "";
            int port = Integer.parseInt(r.substring(13).trim());
            String u = "http://" + p.getAddress().getHostAddress() + ":" + port;
            prefs.edit().putString("found", u).apply();
            return u;
        } catch (Exception e) {
            return "";
        } finally {
            if (s != null) s.close();
        }
    }
}
