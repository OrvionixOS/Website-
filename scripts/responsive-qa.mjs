// Browser QA against the production preview: horizontal overflow, console
// errors, failed requests, calculator values, nav and accordion behaviour,
// plus full-page screenshots per viewport in .qa/.
//
// Usage: npm run build && npx vite preview --port 4173 &  then  npm run qa:responsive
// Env: QA_URL (default http://localhost:4173/), PLAYWRIGHT_CHROMIUM_PATH (optional).
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const URL_ = process.env.QA_URL ?? 'http://localhost:4173/';
const VIEWPORTS = [
  { name: 'mobile-320', width: 320, height: 640, mobile: true },
  { name: 'mobile-375', width: 375, height: 812, mobile: true },
  { name: 'tablet-768', width: 768, height: 1024, mobile: true },
  { name: 'ipad-air-820', width: 820, height: 1180, mobile: true },
  { name: 'ipad-landscape-1024', width: 1024, height: 768, mobile: true },
  { name: 'ipad-pro-landscape-1366', width: 1366, height: 1024, mobile: true },
  { name: 'desktop-1440', width: 1440, height: 900, mobile: false },
  // ~200% zoom of a 1280px window
  { name: 'zoom-200pct-640', width: 640, height: 400, mobile: false },
];

mkdirSync('.qa', { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined });
const failures = [];

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
  });
  const page = await context.newPage();
  const issues = [];
  page.on('console', (m) => m.type() === 'error' && issues.push(`console: ${m.text()}`));
  page.on('pageerror', (e) => issues.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => issues.push(`requestfailed: ${r.url()}`));
  page.on('response', (r) => r.status() >= 400 && issues.push(`HTTP ${r.status()}: ${r.url()}`));

  await page.goto(URL_, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  // Horizontal overflow
  const overflow = await page.evaluate(() => {
    const docW = document.documentElement.clientWidth;
    const offenders = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width && (r.right > docW + 1 || r.left < -1) && !el.closest('.record__scroll, .visually-hidden, .skip-link')) {
        offenders.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')} (${Math.round(r.left)}–${Math.round(r.right)})`);
      }
    }
    return { scrollW: document.documentElement.scrollWidth, docW, offenders: offenders.slice(0, 5) };
  });
  if (overflow.scrollW > overflow.docW || overflow.offenders.length) {
    issues.push(`overflow: scrollWidth ${overflow.scrollW} > ${overflow.docW}; ${overflow.offenders.join(', ')}`);
  }

  // Calculator defaults
  const values = await page.$$eval('[data-out]', (els) => Object.fromEntries(els.map((e) => [e.dataset.out, e.textContent])));
  if (values.pas !== '$25.00' || values.fee !== '$6.25' || values.remaining !== '$18.75') {
    issues.push(`calculator defaults wrong: ${JSON.stringify(values)}`);
  }

  // Calculator typing in a real browser
  await page.fill('#calc-budget', '240');
  await page.fill('#calc-hours', '4');
  const typed = await page.textContent('[data-out="fee"]');
  if (typed !== '$10.00') issues.push(`calculator typing: fee ${typed}`);
  await page.fill('#calc-budget', 'abc');
  const invalid = await page.textContent('[data-out="pas"]');
  const errVisible = await page.isVisible('#calc-budget-error');
  if (invalid !== '—' || !errVisible) issues.push('calculator invalid state not shown');
  await page.click('[data-calc-reset]');

  // Navigation
  const toggleVisible = await page.isVisible('[data-nav-toggle]');
  if (toggleVisible) {
    await page.click('[data-nav-toggle]');
    if (!(await page.isVisible('#primary-nav a[href="#pricing"]'))) issues.push('mobile menu did not open');
    await page.keyboard.press('Escape');
    if (await page.isVisible('#primary-nav a[href="#pricing"]')) issues.push('mobile menu did not close on Escape');
    await page.click('[data-nav-toggle]');
    await page.click('#primary-nav a[href="#pricing"]');
  } else {
    await page.click('#primary-nav a[href="#pricing"]');
  }
  await page.waitForTimeout(900);
  const pricingTop = await page.$eval('#pricing', (el) => Math.round(el.getBoundingClientRect().top));
  if (pricingTop < 0 || pricingTop > 140) issues.push(`Pricing anchor landed at top=${pricingTop}`);

  // Accordion
  await page.click('#faq-4-btn');
  if (!(await page.isVisible('#faq-4'))) issues.push('accordion did not open');

  // Touch-target size for primary controls
  const small = await page.$$eval('a.btn, button, .nav__links a, .nav__login, input', (els) =>
    els
      .filter((e) => e.offsetParent !== null)
      .map((e) => ({ t: (e.textContent || e.id).trim().slice(0, 30), h: e.getBoundingClientRect().height }))
      .filter((x) => x.h > 0 && x.h < 44),
  );
  if (small.length) issues.push(`touch targets <44px: ${JSON.stringify(small.slice(0, 4))}`);

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `.qa/${vp.name}.png`, fullPage: true });
  await page.screenshot({ path: `.qa/${vp.name}-fold.png` });

  console.log(`${issues.length ? '✗' : '✓'} ${vp.name}${issues.length ? '\n   - ' + issues.join('\n   - ') : ''}`);
  if (issues.length) failures.push(vp.name);
  await context.close();
}

// Keyboard-only pass on desktop
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(URL_);
  const order = [];
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press('Tab');
    order.push(await page.evaluate(() => document.activeElement?.id || document.activeElement?.textContent?.trim().slice(0, 24)));
  }
  const reached = ['calc-budget', 'calc-hours-range', 'calc-hours', 'faq-1-btn'].filter((id) => order.includes(id));
  console.log(`Keyboard: reached ${reached.join(', ')} in first 60 tabs; first stops: ${order.slice(0, 8).join(' | ')}`);
  if (!order.includes('calc-budget') || !order.includes('calc-hours')) failures.push('keyboard');
  await page.close();
}

await browser.close();
if (failures.length) {
  console.error(`\nQA failed for: ${failures.join(', ')}`);
  process.exit(1);
}
console.log('\nAll responsive QA checks passed. Screenshots in .qa/');
