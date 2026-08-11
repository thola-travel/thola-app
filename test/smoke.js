/**
 * Browser smoke test: runs the whole quiz as a user would — name + consent,
 * all 20 questions, submission — and asserts the results screen renders with
 * no JS errors.
 *
 * Usage: start the server (`npm start`), then:
 *   CHROMIUM_PATH=/path/to/chrome node test/smoke.js
 * (CHROMIUM_PATH defaults to the Playwright-managed Chromium if installed.)
 */

const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

  await page.goto(process.env.QUIZ_URL || 'http://localhost:3000/');
  await page.fill('#first-name', 'SmokeTest');
  await page.check('#consent-check');
  await page.click('#btn-start');

  for (let i = 0; i < 20; i++) {
    await page.waitForSelector('.option', { state: 'visible' });
    const options = page.locator('.option');
    const n = await options.count();
    await options.nth(i % n).click();
    await page.waitForTimeout(450);
  }

  await page.waitForSelector('#screen-results.active', { timeout: 15000 });
  const title = await page.textContent('#results-title');
  const kinsey = await page.textContent('#kinsey-label');
  const kinkCards = await page.locator('.kink-card').count();

  console.log('TITLE:', title.trim());
  console.log('KINSEY:', kinsey.trim());
  console.log('KINK CARDS:', kinkCards);
  console.log('JS ERRORS:', errors.length ? errors : 'none');

  await browser.close();
  if (errors.length || kinkCards === 0) {
    console.error('SMOKE FAIL');
    process.exit(1);
  }
  console.log('SMOKE PASS');
})().catch((e) => { console.error('SMOKE FAIL:', e); process.exit(1); });
