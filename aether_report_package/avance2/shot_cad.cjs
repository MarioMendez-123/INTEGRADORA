const { chromium } = require("../../aether-video/node_modules/playwright-core");
const S = process.argv[2] + "/shots/";
(async () => {
  const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true,
    args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"] });
  const p = await b.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 });
  await p.goto("file:///C:/Users/mende/Downloads/Armado%20del%20carrito%20Aether.html", { waitUntil: "load", timeout: 60000 });
  await p.waitForTimeout(8000);
  const click = async (txt) => { await p.getByRole("button", { name: txt, exact: false }).first().click(); await p.waitForTimeout(6000); };
  await click("Carrito armado");
  await p.addStyleTag({ content: "#endCard{display:none!important}" });
  // uncheck labels for clean view
  const lab = p.getByLabel("Etiquetas"); if (await lab.count()) await lab.uncheck().catch(()=>{});
  const cot = p.getByLabel("Cotas"); if (await cot.count()) await cot.uncheck().catch(()=>{});
  await p.waitForTimeout(3000);
  await p.screenshot({ clip: { x: 0, y: 0, width: 1220, height: 945 }, path: S + "cad_armado_limpio.png" });
  const ex = p.getByLabel("Explosionada"); await ex.check().catch(()=>{}); await p.waitForTimeout(6000);
  await p.screenshot({ clip: { x: 0, y: 0, width: 1220, height: 945 }, path: S + "cad_explosionada.png" });
  await ex.uncheck().catch(()=>{});
  const tr = p.getByLabel("Estructura transparente"); await tr.check().catch(()=>{}); await p.waitForTimeout(5000);
  await p.screenshot({ clip: { x: 0, y: 0, width: 1220, height: 945 }, path: S + "cad_transparente.png" });
  await tr.uncheck().catch(()=>{});
  await click("Solo electrónica");
  await p.screenshot({ clip: { x: 0, y: 0, width: 1220, height: 945 }, path: S + "cad_electronica.png" });
  await b.close();
})().catch(e=>{console.log("ERR",e.message);process.exit(1)});
