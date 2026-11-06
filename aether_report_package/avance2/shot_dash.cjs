const { chromium } = require("../../aether-video/node_modules/playwright-core");
const OUT = __dirname + "/capturas/";
(async () => {
  const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const p = await b.newPage({ viewport: { width: 1360, height: 860 }, deviceScaleFactor: 1.5 });
  for (const [n, u, w] of [["dash_index", "/index.html", 5000], ["dash_celda", "/celda.html", 4000], ["dash_inventario", "/inventory.html", 3000]]) {
    await p.goto("http://127.0.0.1:8000" + u, { waitUntil: "load", timeout: 60000 });
    await p.waitForTimeout(w);
    await p.screenshot({ path: OUT + n + ".png" });
    console.log("ok", n);
  }
  await b.close();
})().catch((e) => { console.log("ERR", e.message); process.exit(1); });
