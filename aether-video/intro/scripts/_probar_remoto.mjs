import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: false });
const lum = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await lum.goto("http://10.4.5.165:8000/robot.html?intro=1&voz=servicio&lang=en");
await lum.waitForTimeout(2500);
const phone = await browser.newPage({ viewport: { width: 390, height: 780 } });
await phone.goto("http://10.4.5.165:8000/control.html");
await phone.waitForTimeout(1200);
const fr = () => lum.frames().find((f) => f.url().includes("slides.html"));
await lum.evaluate(() => openSlides());
await lum.waitForTimeout(2500);
const idx = () => fr().evaluate(() => current);
const seq = [];
for (const id of ["#next", "#next", "#next", "#prev"]) { await phone.click(id); await lum.waitForTimeout(1800); seq.push(await idx()); }
console.log("secuencia (esperado 1,2,3,2):", seq.join(","));
await browser.close();
