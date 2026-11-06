const { chromium } = require("../../aether-video/node_modules/playwright-core");
(async () => {
  const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const p = await b.newPage({ viewport: { width: 1360, height: 860 }, deviceScaleFactor: 1.5 });
  await p.goto("http://127.0.0.1:8000/index.html", { waitUntil: "load", timeout: 60000 });
  await p.waitForTimeout(4000);
  await p.evaluate(() => document.getElementById("linea-manufactura").scrollIntoView());
  await p.waitForTimeout(3500);
  await p.screenshot({ path: __dirname + "/capturas/dash_celda.png" });
  await b.close();
})();
