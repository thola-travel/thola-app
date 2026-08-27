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
  for (let i = 0; i < 120; i++) {
    const done = await page.locator('#screen-results.active').count();
    if (done > 0) break;
    const analyzing = await page.locator('#screen-analyzing.active').count();
    if (analyzing > 0) {
      await page.waitForSelector('#screen-results.active', { timeout: 60000 });
      break;
    }
    const before = await page.textContent('#progress-count');

    // Open-response questions: fill the textarea (with themed content so the
    // text-analysis path is exercised) and continue.
    if ((await page.locator('.text-answer').count()) > 0) {
      await page.fill(
        '.text-answer',
        'I fantasize about being tied up with rope, spanked, and hearing praise. Not into feet at all.'
      );
      await page.locator('.text-actions .btn.primary').click();
      await page.waitForTimeout(400);
      continue;
    }

    await page.waitForSelector('.option', { state: 'visible' });

    // Select-all-that-apply questions: toggle two options, then Continue.
    if ((await page.locator('.multi-option').count()) > 0) {
      const multi = page.locator('.multi-option');
      const m = await multi.count();
      try {
        await multi.nth(i % (m - 1)).click({ timeout: 3000 }); // skip the exclusive last option
        await multi.nth((i + 1) % (m - 1)).click({ timeout: 3000 });
        await page.locator('.text-actions .btn.primary').click({ timeout: 3000 });
      } catch (e) {
        continue;
      }
      await page.waitForTimeout(400);
      continue;
    }

    const options = page.locator('.option');
    const n = await options.count();
    try {
      await options.nth(i % n).click({ timeout: 3000 });
    } catch (e) {
      continue; // question advanced mid-click; re-enter the loop
    }
    // Wait until the quiz advances (progress text changes) or leaves the quiz screen.
    await page
      .waitForFunction(
        (prev) =>
          !document.querySelector('#screen-quiz.active') ||
          document.querySelector('#progress-count').textContent !== prev,
        before,
        { timeout: 5000 }
      )
      .catch(() => {});
  }

  await page.waitForSelector('#screen-results.active', { timeout: 60000 });
  const title = await page.textContent('#results-title');
  const kinsey = await page.textContent('#kinsey-label');
  const kinkCards = await page.locator('.kink-card').count();
  const spectrumItems = await page.locator('.spectrum-item').count();
  const suggestions = await page.locator('#suggestions-list li').count();
  const desireItems = await page.locator('.desire-item').count();
  const rankedItems = await page.locator('.ranked-item').count();
  const themeItems = await page.locator('.theme-item').count();
  const thanksText = (await page.textContent('#thanks-text')).trim();
  const themeNames = await page.locator('.theme-name').allTextContents();

  console.log('THANKS BANNER:', thanksText.slice(0, 90));
  console.log('TEXT THEMES:', themeItems, '->', themeNames.map((t) => t.trim()).join(', '));
  console.log('RANKED ITEMS:', rankedItems);
  console.log('TITLE:', title.trim());
  console.log('KINSEY:', kinsey.trim());
  console.log('KINK CARDS:', kinkCards);
  console.log('SPECTRUM ITEMS:', spectrumItems);
  console.log('SUGGESTIONS:', suggestions);
  console.log('DESIRE MAP ITEMS:', desireItems);
  console.log('JS ERRORS:', errors.length ? errors : 'none');

  await browser.close();
  const themesOk =
    themeItems > 0 &&
    themeNames.join(' ').includes('Rope') &&
    !themeNames.join(' ').includes('Feet'); // negated mention must not match
  if (!themesOk) console.error('theme analysis check failed');
  if (!thanksText.includes('recorded')) console.error('thanks banner check failed');

  if (errors.length || kinkCards === 0 || spectrumItems === 0 || desireItems === 0 || rankedItems === 0 || !themesOk || !thanksText.includes('recorded')) {
    console.error('SMOKE FAIL');
    process.exit(1);
  }
  console.log('SMOKE PASS');
})().catch((e) => { console.error('SMOKE FAIL:', e); process.exit(1); });
