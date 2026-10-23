// Renders public/og-image.png (1200x630) from inline HTML using Playwright.
// Set PLAYWRIGHT_CHROMIUM_PATH if Chromium is not in Playwright's default location.
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';

const manrope = readFileSync(
  new URL('../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2', import.meta.url),
).toString('base64');

const html = `<!doctype html><html><head><style>
  @font-face{font-family:'Manrope Variable';font-weight:200 800;src:url(data:font/woff2;base64,${manrope}) format('woff2')}
  body{margin:0;width:1200px;height:630px;background:#1A1A1A;color:#F5F0EB;font-family:'Manrope Variable',sans-serif;
    display:flex;flex-direction:column;justify-content:space-between;padding:80px 88px;box-sizing:border-box;
    background-image:radial-gradient(70% 70% at 90% 0%,rgba(201,169,110,.14),transparent 60%)}
  .brand{display:flex;align-items:center;gap:14px;font-weight:700;font-size:30px;letter-spacing:-.02em;color:#fff}
  .mark{width:30px;height:30px;border:2.5px solid #C9A96E;border-radius:50%;position:relative}
  .mark:after{content:'';position:absolute;inset:6px;border-radius:50%;background:#C9A96E;clip-path:inset(0 0 50% 0)}
  .os{color:#C9A96E;font-size:.72em;letter-spacing:.14em;margin-left:6px}
  h1{margin:0;font-size:76px;line-height:1.02;letter-spacing:-.035em;font-weight:600;color:#fff;max-width:900px}
  .row{display:flex;justify-content:space-between;align-items:flex-end;border-top:1px solid rgba(255,255,255,.14);padding-top:28px}
  .eyebrow{color:#C9A96E;font-size:18px;letter-spacing:.18em;text-transform:uppercase;font-weight:700}
  .fee{font-size:26px;color:#B8A99A}.fee b{color:#C9A96E;font-weight:650}
</style></head><body>
  <div class="brand"><span class="mark"></span><span>Orvionix<span class="os">OS</span></span></div>
  <h1>Stop Letting Your Ad Budget Go to Waste.</h1>
  <div class="row"><span class="eyebrow">Performance-Based Ad Spend Optimization</span>
  <span class="fee"><b>25%</b> of eligible Protected Ad Spend</span></div>
</body></html>`;

const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'public/og-image.png' });
await browser.close();
console.log('Wrote public/og-image.png');
