// Run JavaScript inside the app's WebView ON THE TABLET (DevTools protocol over adb), for on-device tests.
//   adb forward tcp:$(port get piano-player tablet-devtools) localabstract:webview_devtools_remote_<pid>
//   node tools/tabjs.mjs <port> "<js expression or async body>"     (or: - to read the JS from stdin)
// The value is returned as JSON (awaited if it is a promise). Needs Node 22+ (built-in WebSocket).
const [port, src] = process.argv.slice(2);
const js = src === "-" ? await new Promise(r => { let s = ""; process.stdin.on("data", d => s += d); process.stdin.on("end", () => r(s)); }) : src;
const pages = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(pages.find(p => p.type === "page").webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
ws.onmessage = e => {
  const m = JSON.parse(e.data);
  if (m.id !== 1) return;
  const r = m.result || {};
  if (r.exceptionDetails) console.log("ERROR", JSON.stringify(r.exceptionDetails.exception?.description || r.exceptionDetails.text));
  else console.log(JSON.stringify(r.result?.value, null, 1));
  ws.close(); process.exit(0);
};
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: "(async()=>{" + (/\breturn\b/.test(js) ? js : "return (" + js + ")") + "})()", awaitPromise: true, returnByValue: true } }));
