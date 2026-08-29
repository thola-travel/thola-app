/**
 * Resend delivery test: proves the submit endpoint sends both emails over
 * the Resend HTTPS API path (the transport that works on hosts that block
 * outbound SMTP, like Render's free tier).
 *
 * Starts a local HTTP server standing in for api.resend.com, boots the app
 * with RESEND_API_KEY set and RESEND_API_URL pointed at the stand-in, posts
 * a sample submission, and asserts:
 *  - both requests carry the bearer key and the Resend payload shape
 *  - the participant email goes to the entered address with ranked
 *    content and no raw answers; the admin copy includes the answers
 *  - the API response reports participantEmailSent with no test mode
 *
 * Usage: node test/resend-delivery.js
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const RESEND_PORT = 8125;
const APP_PORT = 3458;
const captured = [];

let failMode = false; // when true, the stub answers 422 (permanent error)

const stub = http.createServer((req, res) => {
  let raw = '';
  req.on('data', (d) => (raw += d));
  req.on('end', () => {
    captured.push({
      method: req.method,
      url: req.url,
      auth: req.headers.authorization || '',
      body: JSON.parse(raw || '{}'),
    });
    if (failMode) {
      res.writeHead(422, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Invalid `to` field.' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ id: 'email_' + captured.length }));
  });
});

const samplePayload = {
  name: 'ResendTest',
  email: 'participant@example.com',
  answers: [{ section: 'Play Style', question: 'Sample question?', answer: 'SECRET-ANSWER-TOKEN' }],
  results: {
    kinkProfile: [
      { key: 'dominance', name: 'Dominance', plainName: 'Dominance', group: 'power', percent: 82, level: 'Strong match', cls: '', role: null },
    ],
    kinsey: { key: '1', label: 'Kinsey 1: Predominantly heterosexual, only incidentally homosexual', description: 'Sample description.' },
    aboutYou: [],
    textThemes: [],
    dimensions: { drive: 72, adventure: 61, connection: 55, intensity: 48, powerLean: 38 },
    persona: 'Sample persona.',
    suggestions: ['Keep notes.'],
    summaryText: 'ResendTest RANKED-SUMMARY-TOKEN.',
  },
};

(async () => {
  await new Promise((resolve) => stub.listen(RESEND_PORT, '127.0.0.1', resolve));

  const child = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], {
    env: {
      ...process.env,
      PORT: String(APP_PORT),
      RESEND_API_KEY: 're_test_key_123',
      RESEND_API_URL: `http://127.0.0.1:${RESEND_PORT}/emails`,
      RESEND_FROM: 'Assessment <reports@example.com>',
      ADMIN_EMAIL: 'admin@example.com',
      SMTP_HOST: '',
      SMTP_USER: '',
      SMTP_PASS: '',
      SAVE_SUBMISSIONS: 'off',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stderr.on('data', (d) => process.stderr.write(d));

  let startupLog = '';
  await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('app did not start')), 10000);
    child.stdout.on('data', (d) => {
      startupLog += String(d);
      if (startupLog.includes('running at')) { clearTimeout(t); resolve(); }
    });
  });
  await new Promise((r) => setTimeout(r, 300));

  const res = await fetch(`http://127.0.0.1:${APP_PORT}/api/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(samplePayload),
  });
  const body = await res.json();
  console.log('API response:', body);

  const health = await (await fetch(`http://127.0.0.1:${APP_PORT}/healthz`)).json();

  await new Promise((r) => setTimeout(r, 500));

  // Second submission against a permanently failing API (422): the server
  // must not retry (one call per email, no backoff delay) and must report
  // the participant email as not sent.
  failMode = true;
  const callsBefore = captured.length;
  const failStart = Date.now();
  const failRes = await fetch(`http://127.0.0.1:${APP_PORT}/api/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...samplePayload, email: 'participant2@example.com' }),
  });
  const failBody = await failRes.json();
  const failElapsed = Date.now() - failStart;
  await new Promise((r) => setTimeout(r, 300));
  const failCalls = captured.length - callsBefore;

  child.kill();
  stub.close();

  const failures = [];
  if (failBody.participantEmailSent) failures.push('participant email reported sent despite a 422 from the API');
  if (!failBody.ok) failures.push('submission was not accepted when the mail API failed');
  if (failCalls !== 2) failures.push(`permanent 422 should get one call per email (2 total), saw ${failCalls}`);
  if (failElapsed > 1800) failures.push(`permanent 422 took ${failElapsed}ms, retry backoff appears to have run`);
  if (!body.ok || !body.participantEmailSent) failures.push('API did not report the participant email as sent');
  if (body.testMode) failures.push('unexpected test mode with Resend configured');
  if (body.previewUrl) failures.push('unexpected preview URL on the Resend path');
  if (health.email !== 'resend') failures.push(`healthz email mode is "${health.email}", expected "resend"`);

  const participant = captured.find((c) => (c.body.to || []).includes('participant@example.com'));
  const admin = captured.find((c) => (c.body.to || []).includes('admin@example.com'));

  if (callsBefore !== 2) failures.push(`expected 2 Resend API calls for the first submission, saw ${callsBefore}`);
  if (!participant) failures.push('no Resend call addressed to the participant');
  if (!admin) failures.push('no Resend call addressed to the admin');

  for (const c of captured) {
    if (c.auth !== 'Bearer re_test_key_123') failures.push('missing or wrong Authorization bearer header');
    if (c.method !== 'POST' || c.url !== '/emails') failures.push(`unexpected request ${c.method} ${c.url}`);
    if (!c.body.from || !c.body.subject || !c.body.html || !Array.isArray(c.body.to)) {
      failures.push('payload missing from/to/subject/html in Resend shape');
    }
  }

  if (participant) {
    if (!participant.body.html.includes('RANKED-SUMMARY-TOKEN')) failures.push('participant email missing summary');
    if (!participant.body.html.includes('Dominance')) failures.push('participant email missing ranked list');
    if (participant.body.html.includes('SECRET-ANSWER-TOKEN')) failures.push('participant email leaked raw answers');
    if (participant.body.from !== 'Assessment <reports@example.com>') failures.push('participant email not using RESEND_FROM');
  }
  if (admin && !admin.body.html.includes('SECRET-ANSWER-TOKEN')) failures.push('admin copy missing the answers');

  if (failures.length) {
    console.error('RESEND TEST FAIL:\n- ' + failures.join('\n- '));
    process.exit(1);
  }
  console.log('RESEND TEST PASS');
  process.exit(0);
})().catch((e) => { console.error('RESEND TEST FAIL:', e); process.exit(1); });
