const { chromium } = require("../../aether-video/node_modules/playwright-core");
(async () => {
  const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true,
    args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--use-fake-ui-for-media-stream","--use-fake-device-for-media-stream","--autoplay-policy=no-user-gesture-required"] });
  const ctx = await b.newContext({ viewport: { width: 1360, height: 860 }, deviceScaleFactor: 1.5, permissions: ["camera","microphone"] });
  const p = await ctx.newPage();
  p.on("console", (m) => { if (m.type() === "error") console.log("console:", m.text().slice(0, 150)); });
  await p.goto("http://127.0.0.1:8000/robot.html", { waitUntil: "load" });
  await p.waitForTimeout(6000);
  await p.addStyleTag({ content: "#boot-screen,.boot-screen,#boot-flash{display:none!important}" });
  await p.waitForTimeout(1500);
  console.log((await p.evaluate(() => document.body.innerText)).slice(0, 600));
  console.log(await p.evaluate(() => [...document.querySelectorAll("button")].map((b) => b.innerText.trim() + "#" + b.id).join(" | ")));
  await p.screenshot({ path: __dirname + "/capturas/app_lumina_1.png" });
  await p.evaluate(() => document.getElementById("activate-btn").click());
  await p.waitForTimeout(6000);
  console.log((await p.evaluate(() => document.body.innerText)).slice(0, 400));
  await p.screenshot({ path: __dirname + "/capturas/app_lumina_2.png" });
  await b.close();
})();
