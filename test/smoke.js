/**
 * Browser smoke test: runs the whole quiz as a user would: name + email +
 * consent, all questions across the three parts, then submission. Asserts
 * the results screen renders with no JS errors.
 *
 * Usage: start the server (`npm start`), then:
 *   CHROMIUM_PATH=/path/to/chrome node test/smoke.js
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
  await page.fill('#email', 'smoketest@example.com');
  await page.check('#consent-check');
  await page.click('#btn-start');

  // Answer questions until the results screen appears (question count may evolve).
  for (let i = 0; i < 80; i++) {
    const done = await page.locator('#screen-results.active').count();
    if (done > 0) break;
    const analyzing = await page.locator('#screen-analyzing.active').count();
    if (analyzing > 0) {
      await page.waitForSelector('#screen-results.active', { timeout: 20000 });
      break;
    }
    await page.waitForSelector('.option', { state: 'visible' });
    const options = page.locator('.option');
    const n = await options.count();
    await options.nth(i % n).click();
    await page.waitForTimeout(500);
  }

  await page.waitForSelector('#screen-results.active', { timeout: 20000 });
  const title = await page.textContent('#results-title');
  const kinsey = await page.textContent('#kinsey-label');
  const kinkCards = await page.locator('.kink-card').count();
  const spectrumItems = await page.locator('.spectrum-item').count();
  const suggestions = await page.locator('#suggestions-list li').count();
  const desireItems = await page.locator('.desire-item').count();

  console.log('TITLE:', title.trim());
  console.log('KINSEY:', kinsey.trim());
  console.log('KINK CARDS:', kinkCards);
  console.log('SPECTRUM ITEMS:', spectrumItems);
  console.log('SUGGESTIONS:', suggestions);
  console.log('DESIRE MAP ITEMS:', desireItems);
  console.log('JS ERRORS:', errors.length ? errors : 'none');

  await browser.close();
  if (errors.length || kinkCards === 0 || spectrumItems === 0 || desireItems === 0) {
    console.error('SMOKE FAIL');
    process.exit(1);
  }
  console.log('SMOKE PASS');
})().catch((e) => { console.error('SMOKE FAIL:', e); process.exit(1); });
