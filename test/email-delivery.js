/**
 * Email delivery test: proves the submit endpoint really sends email.
 *
 * Starts a local SMTP server that captures messages, boots the app pointed
 * at it with real SMTP settings, posts a sample submission, and asserts:
 *  - the participant email arrives at the address entered, ranked list and
 *    summary included, raw answers excluded
 *  - the admin copy (ADMIN_EMAIL set for the test) arrives with the answers
 *
 * Usage: node test/email-delivery.js
 */

const { SMTPServer } = require('smtp-server');
const { spawn } = require('child_process');
const path = require('path');

const SMTP_PORT = 2525;
const APP_PORT = 3456;
const captured = [];

const smtp = new SMTPServer({
  authOptional: true,
  allowInsecureAuth: true,
  disabledCommands: ['STARTTLS'],
  onAuth(auth, session, callback) {
    callback(null, { user: auth.username }); // accept any credentials
  },
  onData(stream, session, callback) {
    let raw = '';
    stream.on('data', (d) => (raw += d.toString('utf8')));
    stream.on('end', () => {
      captured.push({ to: session.envelope.rcptTo.map((r) => r.address), raw });
      callback();
    });
  },
});

function decodeBody(raw) {
  // Quoted-printable is nodemailer's default for HTML; unfold and decode.
  return raw
    .replace(/=\r?\n/g, '')
    .replace(/=([0-9A-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

const samplePayload = {
  name: 'DeliveryTest',
  email: 'tester@example.com',
  answers: [
    { section: 'Play Style', question: 'Sample question?', answer: 'SECRET-ANSWER-TOKEN' },
  ],
  results: {
    kinkProfile: [
      { key: 'dominance', name: 'Dominance', plainName: 'Dominance', group: 'power', percent: 82, level: 'Strong match', cls: '', role: null },
      { key: 'impact', name: 'Impact Play', plainName: 'Impact Play', group: 'bondage', percent: 74, level: 'Strong match', cls: '', role: { side: 'delivering', note: 'You are the one swinging.' } },
      { key: 'sensual', name: 'Sensual & Romantic Connection', plainName: 'Sensual & Romantic Connection', group: 'connection', percent: 20, level: 'Not a focus right now', cls: 'low', role: null },
    ],
    kinsey: { key: '1', label: 'Kinsey 1: Predominantly heterosexual, only incidentally homosexual', description: 'Sample description.' },
    aboutYou: [{ question: 'Turn-on?', answer: 'Touch', reflection: 'Your desire lives in your body.' }],
    suggestions: ['Keep a private desire journal.'],
    summaryText: 'DeliveryTest, here is your RANKED-SUMMARY-TOKEN.',
  },
};

(async () => {
  await new Promise((resolve) => smtp.listen(SMTP_PORT, '127.0.0.1', resolve));

  const child = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], {
    env: {
      ...process.env,
      PORT: String(APP_PORT),
      SMTP_HOST: '127.0.0.1',
      SMTP_PORT: String(SMTP_PORT),
      SMTP_SECURE: 'false',
      SMTP_USER: 'test',
      SMTP_PASS: 'test',
      SMTP_FROM: 'Desire Discovery Quiz <quiz@test.local>',
      ADMIN_EMAIL: 'admin@example.com',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stderr.on('data', (d) => process.stderr.write(d));

  await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('app did not start')), 10000);
    child.stdout.on('data', (d) => {
      if (String(d).includes('running at')) { clearTimeout(t); resolve(); }
    });
  });

  const res = await fetch(`http://127.0.0.1:${APP_PORT}/api/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(samplePayload),
  });
  const body = await res.json();
  console.log('API response:', body);

  await new Promise((r) => setTimeout(r, 1000));
  child.kill();
  smtp.close();

  const failures = [];
  if (!body.ok || !body.participantEmailSent) failures.push('API did not report the participant email as sent');
  if (body.testMode) failures.push('expected real-SMTP mode, got test mode');

  const participant = captured.find((m) => m.to.includes('tester@example.com'));
  const admin = captured.find((m) => m.to.includes('admin@example.com'));

  if (!participant) failures.push('no email arrived at the participant address');
  if (!admin) failures.push('no admin copy arrived');

  if (participant) {
    const html = decodeBody(participant.raw);
    if (!html.includes('RANKED-SUMMARY-TOKEN')) failures.push('participant email is missing the summary');
    if (!html.includes('Dominance')) failures.push('participant email is missing the ranked list');
    if (!html.includes('82%')) failures.push('participant email is missing percentages');
    if (!html.includes('delivering')) failures.push('participant email is missing the chosen side');
    if (html.includes('SECRET-ANSWER-TOKEN')) failures.push('participant email leaked raw answers');
  }
  if (admin) {
    const html = decodeBody(admin.raw);
    if (!html.includes('SECRET-ANSWER-TOKEN')) failures.push('admin copy is missing the answers');
  }

  console.log('captured emails:', captured.map((m) => m.to.join(',')).join(' | ') || 'none');
  if (failures.length) {
    console.error('EMAIL TEST FAIL:\n- ' + failures.join('\n- '));
    process.exit(1);
  }
  console.log('EMAIL TEST PASS');
  process.exit(0);
})().catch((e) => { console.error('EMAIL TEST FAIL:', e); process.exit(1); });
