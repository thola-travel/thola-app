/**
 * Browser smoke test: runs the whole quiz as a user would: name + email +
 * consent, all questions across the six parts, then submission. Asserts the
 * summary-only results screen renders with no JS errors, and that the full
 * data payload (all answers plus complete computed results) reaches the
 * backend even though the screen shows only a high-level summary.
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
  let submitPayload = null;
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('request', (req) => {
    if (req.url().endsWith('/api/submit') && req.method() === 'POST') {
      try { submitPayload = req.postDataJSON(); } catch (e) { /* asserted below */ }
    }
  });

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
  const rankedItems = await page.locator('.ranked-item').count();
  const summaryText = (await page.textContent('#results-summary')).trim();
  const reportNote = (await page.textContent('#report-note')).trim();
  const reportItems = await page.locator('.report-list li').count();
  const thanksText = (await page.textContent('#thanks-text')).trim();
  const bodyText = await page.textContent('body');

  console.log('THANKS BANNER:', thanksText.slice(0, 100));
  console.log('TITLE:', title.trim());
  console.log('RANKED ITEMS (screen, max 5):', rankedItems);
  console.log('SUMMARY LENGTH:', summaryText.length);
  console.log('REPORT NOTE:', reportNote.slice(0, 80));
  console.log('REPORT LIST ITEMS:', reportItems);

  await browser.close();

  const failures = [];
  if (errors.length) failures.push('JS errors: ' + errors.join(' | '));

  // On-screen: a high-level summary only.
  if (rankedItems < 1 || rankedItems > 5) failures.push(`expected 1-5 ranked signals on screen, saw ${rankedItems}`);
  if (summaryText.length < 100) failures.push('summary paragraph missing or too short');
  if (!reportNote.includes('smoketest@example.com')) failures.push('report card does not name the delivery address');
  if (reportItems < 5) failures.push('report-contents list incomplete');
  if (!thanksText.includes('full report')) failures.push('banner does not reference the full report');
  if (/\brecorded\b|\bstored\b|\bdatabase\b/i.test(bodyText)) failures.push('participant-facing screen mentions recording/storage');

  // Backend payload: the complete data set must still be submitted.
  if (!submitPayload) {
    failures.push('no /api/submit payload captured');
  } else {
    const profile = (submitPayload.results && submitPayload.results.kinkProfile) || [];
    const themes = ((submitPayload.results && submitPayload.results.textThemes) || []).map((t) => t.name).join(' ');
    const dims = (submitPayload.results && submitPayload.results.dimensions) || {};
    const answers = submitPayload.answers || [];
    if (profile.length !== 50) failures.push(`payload kinkProfile has ${profile.length} categories, expected 50`);
    if (answers.length < 80) failures.push(`payload has only ${answers.length} answers`);
    const dimKeys = ['drive', 'adventure', 'connection', 'intensity', 'powerLean'];
    if (!dimKeys.every((k) => typeof dims[k] === 'number')) failures.push('payload dimensions incomplete');
    if (!themes.includes('Rope')) failures.push('payload text themes missing Rope');
    if (themes.includes('Feet')) failures.push('payload text themes matched a negated mention (Feet)');
    if (!submitPayload.results.kinsey || !submitPayload.results.summaryText) failures.push('payload missing kinsey/summary');
    console.log('PAYLOAD: categories=' + profile.length + ' answers=' + answers.length + ' themes=[' + themes + ']');
  }

  if (failures.length) {
    console.error('SMOKE FAIL:\n- ' + failures.join('\n- '));
    process.exit(1);
  }
  console.log('SMOKE PASS');
})().catch((e) => { console.error('SMOKE FAIL:', e); process.exit(1); });
