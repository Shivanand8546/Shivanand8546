const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  fs.mkdirSync('frames', { recursive: true });
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
      '--ignore-gpu-blocklist'
    ]
  });
  const page = await browser.newPage();
  page.on('console', m => console.log('PAGE LOG:', m.text()));
  page.on('pageerror', e => console.log('PAGE ERROR:', e.message));
  page.on('requestfailed', r => console.log('REQUEST FAILED:', r.url()));

  await page.setViewport({ width: 850, height: 300, deviceScaleFactor: 1 });
  await page.goto('file://' + path.resolve('index.html') + '?record');
  await page.waitForFunction('typeof window.setTime === "function"', { timeout: 20000 });

  const FPS = 20, SECONDS = 6, total = FPS * SECONDS;
  for (let i = 0; i < total; i++) {
    await page.evaluate(t => window.setTime(t), i / FPS);
    const n = String(i).padStart(4, '0');
    await page.screenshot({ path: `frames/f_${n}.png` });
  }
  await browser.close();
  console.log('Done: ' + total + ' frames');
})();
