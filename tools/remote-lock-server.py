"""Remote lock switch for Piano Lessons (1.44+).

The tablet app asks this server every 15 s whether it should be locked, and reports
what it is doing. A grown-up opens the control page on a phone on the same Wi-Fi:

    http://<pc-ip>:<port>/?k=<key>          (the key is printed at start and kept in the state file)

The tablet finds the server by itself: it broadcasts "piano-remote?" on UDP <port> and
this server answers "piano-remote <port>". The address can also be typed in the app's
Menu > Screen time > Remote lock.

Usage:  python -I remote-lock-server.py [--port 47902] [--state <file>]
State (key, switch, last tablet report) lives OUTSIDE the repo by default:
E:/Home-Apps/_staging/remote-lock/state.json
Stdlib only. Nothing here ever leaves the LAN.
"""
import argparse, html, json, os, secrets, socket, threading, time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

ap = argparse.ArgumentParser()
ap.add_argument("--port", type=int, default=47902)
ap.add_argument("--state", default=r"E:\Home-Apps\_staging\remote-lock\state.json")
A = ap.parse_args()
LOCK = threading.Lock()


def load():
    try:
        with open(A.state, encoding="utf-8") as f:
            s = json.load(f)
    except Exception:
        s = {}
    s.setdefault("key", secrets.token_urlsafe(8))
    s.setdefault("on", False)
    s.setdefault("v", 0)          # bumps on every flip; the app's PIN override holds only until the next flip
    s.setdefault("until", 0)      # ms since epoch; 0 = until unlocked
    s.setdefault("msg", "")
    s.setdefault("tablets", {})
    return s


def save(s):
    os.makedirs(os.path.dirname(A.state), exist_ok=True)
    tmp = A.state + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(s, f, indent=1)
    os.replace(tmp, A.state)


S = load()
save(S)


def now_ms():
    return int(time.time() * 1000)


def expire():
    if S["on"] and S["until"] and now_ms() >= S["until"]:
        S["on"], S["until"] = False, 0
        S["v"] += 1
        save(S)


def public():
    expire()
    return {"on": S["on"], "v": S["v"], "until": S["until"], "msg": S["msg"], "t": now_ms()}


def ago(ms):
    s = max(0, (now_ms() - ms) // 1000)
    return f"{s} s ago" if s < 90 else f"{s // 60} min ago" if s < 5400 else f"{s // 3600} h ago"


PAGE = """<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Piano tablet</title>
<style>
:root{{--bg:#14121f;--card:#1f1c30;--txt:#f3f1fb;--mut:#a59fc4;--on:#ff5c7a;--ok:#3ddc97}}
body{{margin:0;background:var(--bg);color:var(--txt);font:17px/1.4 system-ui,sans-serif}}
.w{{max-width:460px;margin:0 auto;padding:20px 16px}}
.st{{background:var(--card);border-radius:16px;padding:18px;margin-bottom:16px}}
.big{{font-size:26px;font-weight:700}} .mut{{color:var(--mut);font-size:14px}}
button{{width:100%;padding:18px;margin:6px 0;border:0;border-radius:14px;font-size:19px;font-weight:700}}
.l{{background:var(--on);color:#fff}} .u{{background:var(--ok);color:#06281a}} .g{{background:#2c2846;color:var(--txt)}}
.row{{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}} .row button{{font-size:16px;padding:14px 4px}}
</style></head><body><div class="w">
<div class="st"><div class="big">{state}</div><div class="mut">{until}</div></div>
<form method="post"><input type="hidden" name="k" value="{k}">
<button class="l" name="a" value="lock">&#128245; Lock the tablet now</button>
<div class="row"><button class="g" name="a" value="lock15">15 min</button><button class="g" name="a" value="lock30">30 min</button><button class="g" name="a" value="lock60">1 hour</button></div>
<button class="u" name="a" value="unlock">&#9989; Unlock</button></form>
<div class="st"><div class="mut">Tablet</div>{tabs}</div>
<div class="mut">Locks within 15 s while the app is open (straight away when it is next opened). The grown-up PIN on the tablet still unlocks it; the lock comes back only when you lock again here.</div>
</div><script>setTimeout(function(){{location.replace(location.pathname+"?k={k}")}},15000)</script></body></html>"""


class H(BaseHTTPRequestHandler):
    server_version = "PianoRemote/1"

    def log_message(self, *a):
        pass

    def send(self, code, body, ctype="application/json"):
        b = body.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", ctype + "; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def page(self):
        with LOCK:
            p = public()
            tabs = "".join(
                f"<div>{html.escape(t.get('name') or tid)}: seen {ago(t['seen'])}<br><span class=mut>{html.escape(t.get('s', ''))}</span></div>"
                for tid, t in sorted(S["tablets"].items(), key=lambda x: -x[1]["seen"])) or "<div class=mut>Not seen yet</div>"
        until = time.strftime("until %H:%M", time.localtime(p["until"] / 1000)) if p["on"] and p["until"] else ("until you unlock" if p["on"] else "")
        return PAGE.format(state="&#128274; LOCKED" if p["on"] else "&#128275; Unlocked", until=until, k=html.escape(S["key"]), tabs=tabs)

    def do_GET(self):
        u = urlparse(self.path)
        q = {k: v[0] for k, v in parse_qs(u.query).items()}
        if u.path == "/tablet":                       # the app's poll: no key needed (it only reads the switch)
            with LOCK:
                tid = (q.get("id") or "tablet")[:40]
                S["tablets"][tid] = {"seen": now_ms(), "s": (q.get("s") or "")[:300], "name": (q.get("name") or "")[:40]}
                if len(S["tablets"]) > 8:
                    del S["tablets"][min(S["tablets"], key=lambda t: S["tablets"][t]["seen"])]
                body = json.dumps(public())
                if int(time.time()) % 60 < 16:           # don't rewrite the file on every poll
                    save(S)
            return self.send(200, body)
        if u.path == "/" and secrets.compare_digest(q.get("k", ""), S["key"]):
            return self.send(200, self.page(), "text/html")
        self.send(404, "{}")

    def do_POST(self):
        n = min(int(self.headers.get("Content-Length") or 0), 2000)
        q = {k: v[0] for k, v in parse_qs(self.rfile.read(n).decode("utf-8", "replace")).items()}
        if not secrets.compare_digest(q.get("k", ""), S["key"]):
            return self.send(403, "{}")
        a = q.get("a", "")
        with LOCK:
            if a.startswith("lock"):
                mins = int(a[4:] or 0)
                S["on"], S["until"] = True, (now_ms() + mins * 60000 if mins else 0)
                S["v"] += 1
            elif a == "unlock" and S["on"]:
                S["on"], S["until"] = False, 0
                S["v"] += 1
            save(S)
        self.send_response(303)
        self.send_header("Location", "/?k=" + S["key"])
        self.end_headers()


def udp():                                             # discovery: the tablet broadcasts, we answer with the port
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind(("0.0.0.0", A.port))
    while True:
        try:
            d, addr = s.recvfrom(64)
            if d.strip() == b"piano-remote?":
                s.sendto(f"piano-remote {A.port}".encode(), addr)
        except Exception:
            time.sleep(1)


threading.Thread(target=udp, daemon=True).start()
print(f"Piano remote lock on :{A.port}  control page: http://<this-pc>:{A.port}/?k={S['key']}", flush=True)
ThreadingHTTPServer(("0.0.0.0", A.port), H).serve_forever()
