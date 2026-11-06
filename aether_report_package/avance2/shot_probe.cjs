const { chromium } = require("../../aether-video/node_modules/playwright-core");
const S = process.argv[2];
(async () => {
  const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true,
    args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--enable-webgl"] });
  const p = await b.newPage({ viewport: { width: 1600, height: 1000 } });
  p.on("console", m => { if (m.type()==="error") console.log("CONSOLE:", m.text().slice(0,200)); });
  await p.goto("file:///C:/Users/mende/Downloads/Armado%20del%20carrito%20Aether.html", { waitUntil: "load", timeout: 60000 });
  await p.waitForTimeout(15000);
  const info = await p.evaluate(() => ({ webgl: !!document.createElement("canvas").getContext("webgl2"), btn: [...document.querySelectorAll("button")].map(b=>b.id+"|"+b.textContent.trim().slice(0,30)).slice(0,40), canv: document.querySelectorAll("canvas").length }));
  console.log(JSON.stringify(info));
  await p.screenshot({ path: S + "/shots/probe1.png" });
  await b.close();
})();
