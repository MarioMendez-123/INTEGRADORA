const { chromium } = require("../../aether-video/node_modules/playwright-core");
const fs = require("fs"), path = require("path");
const dir = process.argv[2];
(async () => {
  const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".svg"));
  for (const f of files) {
    const svg = fs.readFileSync(path.join(dir, f), "utf8");
    const m = svg.match(/width="(\d+)" height="(\d+)"/);
    const w = +m[1], h = +m[2];
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    await p.setContent(`<html><body style="margin:0;background:#fff">${svg}</body></html>`);
    await p.screenshot({ path: path.join(dir, f.replace(".svg", ".png")), clip: { x: 0, y: 0, width: w, height: h } });
    await p.close();
    console.log("ok", f, w, h);
  }
  await b.close();
})();
