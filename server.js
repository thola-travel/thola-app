/**
 * Desire Discovery Quiz: backend
 *
 * Serves the quiz frontend and receives submissions at POST /api/submit.
 * Each participant receives their own results email (summary, meanings,
 * examples, and suggestions, never their raw answers). If ADMIN_EMAIL is
 * set, a full copy (including answers) also goes there and the frontend
 * discloses that in the consent notice via GET /api/config.
 *
 * Production posture: security headers with a strict CSP, per-IP rate
 * limits, server-side payload sanitization, a bot honeypot, request
 * logging, health checks, graceful shutdown, retention cleanup for stored
 * submissions, and email that retries once but can never delay results.
 */

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const DB = require('./public/quiz-data.js');

/* ---------- Configuration & validation ---------- */

const PORT = Number(process.env.PORT || 3000);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
const SUBMISSIONS_DIR = path.join(__dirname, 'submissions');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SAVE_SUBMISSIONS = String(process.env.SAVE_SUBMISSIONS || 'on').toLowerCase() !== 'off';
const RETENTION_DAYS = Number(process.env.SUBMISSION_RETENTION_DAYS || 30);
const EMAIL_OFF = String(process.env.EMAIL_MODE || '').toLowerCase() === 'off';

function validateEnvironment() {
  const problems = [];
  if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    problems.push(`PORT must be a number between 1 and 65535 (got "${process.env.PORT}")`);
  }
  const smtpVars = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];
  const smtpSet = smtpVars.filter((v) => process.env[v]);
  if (smtpSet.length > 0 && smtpSet.length < smtpVars.length) {
    problems.push(
      'Partial SMTP configuration: ' + smtpSet.join(', ') + ' set but ' +
      smtpVars.filter((v) => !process.env[v]).join(', ') + ' missing. Email will run in test mode until all three are set.'
    );
  }
  if (ADMIN_EMAIL && !EMAIL_RE.test(ADMIN_EMAIL)) {
    problems.push(`ADMIN_EMAIL is not a valid email address ("${ADMIN_EMAIL}")`);
  }
  if (!Number.isFinite(RETENTION_DAYS) || RETENTION_DAYS < 0) {
    problems.push(`SUBMISSION_RETENTION_DAYS must be 0 (keep forever) or a positive number (got "${process.env.SUBMISSION_RETENTION_DAYS}")`);
  }
  return problems;
}

const app = express();

// Behind Render/Railway/Fly/nginx there is one proxy hop by default; set
// TRUST_PROXY to the hop count for your setup (0 = direct).
app.set('trust proxy', Number(process.env.TRUST_PROXY ?? 1));
app.disable('x-powered-by');

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
  })
);

// Request log for the API and anything that goes wrong elsewhere.
app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    if (req.path.startsWith('/api') || res.statusCode >= 400) {
      const ms = Number(process.hrtime.bigint() - start) / 1e6;
      console.log(
        `${new Date().toISOString()} ${req.ip} ${req.method} ${req.path} ${res.statusCode} ${ms.toFixed(0)}ms`
      );
    }
  });
  next();
});

app.use(express.json({ limit: '300kb' }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { ok: false, error: 'Too many requests. Please try again in a few minutes.' },
});
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { ok: false, error: 'Too many submissions from this connection. Please try again later.' },
});
app.use('/api', apiLimiter);

app.get('/healthz', (_req, res) => {
  res.json({
    ok: true,
    uptimeSeconds: Math.round(process.uptime()),
    email: smtpConfigured() ? 'smtp' : EMAIL_OFF ? 'off' : 'test-mode',
  });
});

app.get('/api/config', (_req, res) => {
  res.json({ adminCopy: Boolean(ADMIN_EMAIL) });
});

function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

// Generous but finite: a slow mail server must never hold up a submission.
const MAIL_TIMEOUTS = { connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000 };
const SEND_DEADLINE_MS = 20000;

function buildTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || 'true') === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    ...MAIL_TIMEOUTS,
  });
}

function sendWithDeadline(transporter, message) {
  return Promise.race([
    transporter.sendMail(message),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('mail send timed out after ' + SEND_DEADLINE_MS + 'ms')), SEND_DEADLINE_MS)
    ),
  ]);
}

/*
 * Email modes:
 *  - Real SMTP when SMTP_HOST/USER/PASS are set: mail goes to the address
 *    the participant entered.
 *  - Test mode otherwise (unless EMAIL_MODE=off): a throwaway Ethereal
 *    inbox is created on first use. The email is genuinely sent over SMTP,
 *    Ethereal captures it instead of delivering, and the API response
 *    carries a preview URL so the exact email can be inspected.
 */
let testTransportPromise = null;

async function getMailer() {
  if (smtpConfigured()) {
    return { transporter: buildTransporter(), testMode: false, from: process.env.SMTP_FROM || process.env.SMTP_USER };
  }
  if (String(process.env.EMAIL_MODE || '').toLowerCase() === 'off') return null;
  if (!testTransportPromise) {
    testTransportPromise = nodemailer
      .createTestAccount()
      .then((acct) =>
        nodemailer.createTransport({
          host: acct.smtp.host,
          port: acct.smtp.port,
          secure: acct.smtp.secure,
          auth: { user: acct.user, pass: acct.pass },
          ...MAIL_TIMEOUTS,
        })
      )
      .catch((err) => {
        console.warn('Test inbox unavailable (' + err.message + '); emails are skipped until SMTP is configured.');
        testTransportPromise = null;
        return null;
      });
  }
  const transporter = await testTransportPromise;
  if (!transporter) return null;
  return { transporter, testMode: true, from: '"Desire Discovery Quiz" <quiz@example.com>' };
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ---------- Participant email: summary, meanings, suggestions ---------- */

const CARD_STYLE =
  'background:#faf7ff;border-radius:12px;border-left:5px solid #8b5cf6;padding:18px 20px;margin:14px 0;';

function categoryCardHtml(entry) {
  const cat = DB.CATEGORIES[entry.key];
  if (!cat) return '';
  const roleChip = entry.role
    ? `<span style="font-size:13px;background:#6d28d9;color:#fff;border-radius:999px;padding:2px 10px;margin-left:6px;">Your side: ${escapeHtml(entry.role.side)}</span>`
    : '';
  const roleNote = entry.role
    ? `<p style="margin:4px 0;color:#6d28d9;font-weight:bold;">${escapeHtml(entry.role.note)}</p>`
    : '';
  return `
  <div style="${CARD_STYLE}">
    <h3 style="margin:0 0 4px;color:#6d28d9;">${escapeHtml(cat.name)}
      <span style="font-size:13px;background:#ede9fe;color:#6d28d9;border-radius:999px;padding:2px 10px;margin-left:6px;">${entry.percent}% · ${escapeHtml(entry.level)}</span>
      ${roleChip}
    </h3>
    <p style="margin:4px 0;font-style:italic;color:#7c6f92;">${escapeHtml(cat.tagline)}</p>
    ${roleNote}
    <p style="margin:8px 0;">${escapeHtml(cat.description)}</p>
    <p style="margin:8px 0 4px;font-weight:bold;color:#6d28d9;">What this can look like</p>
    <ul style="margin:0 0 8px;padding-left:20px;">
      ${cat.examples.map((e) => `<li style="margin:3px 0;">${escapeHtml(e)}</li>`).join('')}
    </ul>
    <p style="margin:8px 0;background:#ecfdf5;border-radius:8px;padding:10px 12px;"><strong style="color:#059669;font-size:12px;letter-spacing:.08em;">CONTEXT</strong><br>${escapeHtml(cat.support)}</p>
    <p style="margin:8px 0 0;"><strong>Starting point:</strong> ${escapeHtml(cat.firstStep)}</p>
  </div>`;
}

function buildParticipantEmailHtml(submission) {
  const { name, results } = submission;
  const strong = results.kinkProfile.filter((k) => k.level === 'Strong match');
  const curious = results.kinkProfile.filter((k) => k.level === 'Curious spark');
  const featured = strong.concat(curious);

  const suggestions = (results.suggestions || DB.GENERAL_SUGGESTIONS)
    .map((s) => `<li style="margin:6px 0;">${escapeHtml(s)}</li>`)
    .join('');

  const desireMap = (results.aboutYou || [])
    .map(
      (item) => `
      <div style="background:#faf7ff;border-radius:10px;padding:12px 16px;margin:10px 0;">
        <p style="margin:0 0 4px;font-weight:bold;color:#6d28d9;">&ldquo;${escapeHtml(item.answer)}&rdquo;</p>
        <p style="margin:0;">${escapeHtml(item.reflection)}</p>
      </div>`
    )
    .join('');

  const rankedRows = featured
    .map(
      (k, i) => `
      <tr>
        <td style="padding:7px 10px;font-weight:bold;color:#6d28d9;white-space:nowrap;">${i + 1}.</td>
        <td style="padding:7px 10px;">${escapeHtml(k.plainName || k.name)}${k.role && k.role.side !== 'both sides' ? ` <span style="color:#7c6f92;font-size:13px;">· ${escapeHtml(k.role.side.toLowerCase())}</span>` : ''}</td>
        <td style="padding:7px 10px;font-weight:bold;color:#6d28d9;text-align:right;white-space:nowrap;">${k.percent}%</td>
      </tr>`
    )
    .join('');

  return `
  <div style="font-family:'Segoe UI',Helvetica,Arial,sans-serif;max-width:640px;margin:0 auto;color:#2b2140;line-height:1.6;">
    <div style="background:linear-gradient(120deg,#7c3aed,#ec4899);border-radius:16px;padding:28px;color:#fff;text-align:center;">
      <h1 style="margin:0;">Your Desire Profile</h1>
      <p style="margin:8px 0 0;opacity:.9;">Assessment report for ${escapeHtml(name)}. Sent only to this address.</p>
    </div>

    <h2 style="color:#6d28d9;margin-top:28px;">Ranked results</h2>
    ${rankedRows ? `
    <div style="background:#faf7ff;border-radius:12px;padding:10px 12px;">
      <table style="border-collapse:collapse;width:100%;">${rankedRows}</table>
    </div>` : `
    <div style="${CARD_STYLE}">
      <p style="margin:0;">No category crossed the interest thresholds. Your responses consistently favored connection and presence, which is itself a stable and common preference profile.</p>
    </div>`}

    <h2 style="color:#6d28d9;margin-top:28px;">Analysis</h2>
    <div style="background:#faf7ff;border-radius:12px;padding:18px 20px;white-space:pre-wrap;">${escapeHtml(results.summaryText)}</div>

    <h2 style="color:#6d28d9;margin-top:28px;">Category detail</h2>
    ${featured.length > 0 ? featured.map(categoryCardHtml).join('') : `
      <div style="${CARD_STYLE}">
        <p style="margin:0;">No category crossed the interest thresholds; see the analysis above.</p>
      </div>`}

    ${desireMap ? `
    <h2 style="color:#6d28d9;margin-top:28px;">Desire patterns</h2>
    <p style="color:#7c6f92;margin:4px 0 10px;">Accelerators, inhibitors, and solo patterns, interpreted from your responses.</p>
    ${desireMap}` : ''}

    <h2 style="color:#6d28d9;margin-top:28px;">Where you fall on the Kinsey scale</h2>
    <div style="${CARD_STYLE}">
      <h3 style="margin:0 0 6px;color:#6d28d9;">${escapeHtml(results.kinsey.label)}</h3>
      <p style="margin:0;">${escapeHtml(results.kinsey.description)}</p>
    </div>

    <h2 style="color:#6d28d9;margin-top:28px;">Recommendations</h2>
    <ul style="padding-left:20px;">${suggestions}</ul>

    <div style="background:#faf7ff;border-radius:12px;padding:18px 20px;margin-top:24px;text-align:center;">
      <p style="margin:0;">This report was generated from your responses and sent only to this address. Population research finds roughly half of adults report at least one interest outside conventional norms; every category measured here falls within the documented range of human sexuality when practiced with consent.</p>
    </div>
  </div>`;
}

/* ---------- Admin copy (optional): full answers + results ---------- */

function buildAdminEmailHtml(submission) {
  const { name, email, submittedAt, answers, results } = submission;
  const answerRows = answers
    .map(
      (a, i) => `
      <tr>
        <td style="padding:6px 10px;border:1px solid #e2d9ee;vertical-align:top;font-size:13px;"><strong>Q${i + 1}</strong> <em>(${escapeHtml(a.section)})</em> ${escapeHtml(a.question)}</td>
        <td style="padding:6px 10px;border:1px solid #e2d9ee;vertical-align:top;font-size:13px;">${escapeHtml(a.answer)}</td>
      </tr>`
    )
    .join('');

  const kinkRows = results.kinkProfile
    .map(
      (k) => `
      <tr>
        <td style="padding:6px 10px;border:1px solid #e2d9ee;font-size:13px;">${escapeHtml(k.name)}</td>
        <td style="padding:6px 10px;border:1px solid #e2d9ee;font-size:13px;">${k.percent}%</td>
        <td style="padding:6px 10px;border:1px solid #e2d9ee;font-size:13px;">${escapeHtml(k.level)}</td>
        <td style="padding:6px 10px;border:1px solid #e2d9ee;font-size:13px;">${escapeHtml(k.role ? k.role.side : '')}</td>
      </tr>`
    )
    .join('');

  return `
  <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;color:#2b2140;">
    <h1 style="color:#6d28d9;">Quiz Submission</h1>
    <p><strong>Name:</strong> ${escapeHtml(name)}<br>
       <strong>Email:</strong> ${escapeHtml(email)}<br>
       <strong>Submitted:</strong> ${escapeHtml(submittedAt)}</p>
    <h2 style="color:#6d28d9;">Answers</h2>
    <table style="border-collapse:collapse;width:100%;">${answerRows}</table>
    <h2 style="color:#6d28d9;">Scores</h2>
    <table style="border-collapse:collapse;width:100%;">${kinkRows}</table>
    <h2 style="color:#6d28d9;">Kinsey</h2>
    <p><strong>${escapeHtml(results.kinsey.label)}</strong><br>${escapeHtml(results.kinsey.description)}</p>
    <h2 style="color:#6d28d9;">Summary shown to participant</h2>
    <div style="background:#faf7ff;border-radius:8px;padding:14px;white-space:pre-wrap;font-size:13px;">${escapeHtml(results.summaryText)}</div>
  </div>`;
}

/* ---------- Payload sanitization ---------- */

const str = (v, max) => String(v ?? '').slice(0, max);

/**
 * Rebuild the submission from scratch, keeping only expected fields at
 * bounded sizes. Anything malformed returns null and the request is
 * rejected; nothing from the raw body is stored or emailed directly.
 */
function sanitizeSubmission(body) {
  const { name, email, answers, results } = body || {};
  if (!name || !String(name).trim()) return null;
  if (!email || !EMAIL_RE.test(String(email)) || String(email).length > 200) return null;
  if (!Array.isArray(answers) || answers.length === 0 || answers.length > 300) return null;
  if (!results || typeof results !== 'object') return null;
  const { kinkProfile, kinsey, summaryText } = results;
  if (!Array.isArray(kinkProfile) || kinkProfile.length === 0 || kinkProfile.length > 100) return null;
  if (!kinsey || typeof kinsey !== 'object') return null;
  if (typeof summaryText !== 'string') return null;

  return {
    name: str(name, 100).trim(),
    email: str(email, 200),
    submittedAt: new Date().toISOString(),
    answers: answers.map((a) => ({
      section: str(a && a.section, 60),
      question: str(a && a.question, 500),
      answer: str(a && a.answer, 500),
    })),
    results: {
      kinkProfile: kinkProfile.map((k) => ({
        key: str(k && k.key, 40),
        name: str(k && k.name, 80),
        plainName: str(k && k.plainName, 80),
        group: str(k && k.group, 40),
        percent: Math.max(0, Math.min(100, Math.round(Number(k && k.percent) || 0))),
        level: str(k && k.level, 40),
        role: k && k.role && typeof k.role === 'object'
          ? { side: str(k.role.side, 60), note: str(k.role.note, 400) }
          : null,
      })),
      kinsey: {
        key: str(kinsey.key, 4),
        label: str(kinsey.label, 120),
        description: str(kinsey.description, 1200),
      },
      aboutYou: (Array.isArray(results.aboutYou) ? results.aboutYou : []).slice(0, 50).map((item) => ({
        question: str(item && item.question, 300),
        answer: str(item && item.answer, 300),
        reflection: str(item && item.reflection, 800),
      })),
      suggestions: (Array.isArray(results.suggestions) ? results.suggestions : []).slice(0, 50).map((s) => str(s, 500)),
      summaryText: str(summaryText, 20000),
    },
  };
}

/* ---------- Routes ---------- */

async function deliverEmail(mailer, message, label) {
  // One retry for transient failures; a second failure is logged and moved past.
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      return await sendWithDeadline(mailer.transporter, message);
    } catch (mailErr) {
      console.error(`${label} attempt ${attempt} failed:`, mailErr.message);
      if (attempt === 1) await new Promise((r) => setTimeout(r, 2000));
    }
  }
  return null;
}

app.post('/api/submit', submitLimiter, async (req, res) => {
  try {
    // Honeypot: the visible form never fills this field. Bots do. Report
    // success so they move on, and do nothing at all.
    if (req.body && typeof req.body.website === 'string' && req.body.website.trim() !== '') {
      console.warn('Honeypot tripped from', req.ip, '- submission discarded');
      return res.json({ ok: true, participantEmailSent: true, testMode: false, previewUrl: null });
    }

    const submission = sanitizeSubmission(req.body);
    if (!submission) {
      return res.status(400).json({ ok: false, error: 'The submission was incomplete or malformed. Please retake the quiz and submit again.' });
    }

    // Local backup first (unless disabled); a mail outage should never lose one.
    let backupFile = null;
    if (SAVE_SUBMISSIONS) {
      fs.mkdirSync(SUBMISSIONS_DIR, { recursive: true });
      const safeName = submission.name.replace(/[^a-z0-9-]/gi, '_').toLowerCase();
      backupFile = path.join(
        SUBMISSIONS_DIR,
        `${submission.submittedAt.replace(/[:.]/g, '-')}-${safeName}.json`
      );
      fs.writeFileSync(backupFile, JSON.stringify(submission, null, 2));
    }

    let participantEmailSent = false;
    let testMode = false;
    let previewUrl = null;

    const mailer = await getMailer();
    if (mailer) {
      testMode = mailer.testMode;
      const info = await deliverEmail(mailer, {
        from: mailer.from,
        to: submission.email,
        subject: `${submission.name}, your Desire Profile is ready`,
        html: buildParticipantEmailHtml(submission),
      }, 'Participant email');
      if (info) {
        participantEmailSent = true;
        if (testMode) {
          previewUrl = nodemailer.getTestMessageUrl(info) || null;
          console.log('Test mode: participant email captured. Preview:', previewUrl);
        } else {
          console.log('Participant email sent to', submission.email);
        }
      }

      if (ADMIN_EMAIL) {
        const adminInfo = await deliverEmail(mailer, {
          from: mailer.from,
          to: ADMIN_EMAIL,
          subject: `Quiz submission: ${submission.name}`,
          html: buildAdminEmailHtml(submission),
        }, 'Admin copy');
        if (adminInfo && testMode) {
          console.log('Test mode: admin copy captured. Preview:', nodemailer.getTestMessageUrl(adminInfo));
        }
      }
    } else if (backupFile) {
      console.warn('Email is off, submission saved to', backupFile);
    } else {
      console.warn('Email is off and SAVE_SUBMISSIONS=off: submission processed but not persisted.');
    }

    return res.json({ ok: true, participantEmailSent, testMode, previewUrl });
  } catch (err) {
    console.error('Submission error:', err);
    return res.status(500).json({ ok: false, error: 'Something went wrong on our side. Your answers were not lost; please submit again.' });
  }
});

// Unknown API routes answer in JSON rather than falling through to HTML.
app.use('/api', (_req, res) => {
  res.status(404).json({ ok: false, error: 'Not found.' });
});

// JSON parse failures and anything else unexpected.
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({ ok: false, error: 'Submission too large.' });
  }
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, error: 'Invalid request body.' });
  }
  console.error('Unhandled error:', err);
  return res.status(500).json({ ok: false, error: 'Server error.' });
});

/* ---------- Retention cleanup ---------- */

function cleanupOldSubmissions() {
  if (!SAVE_SUBMISSIONS || RETENTION_DAYS <= 0) return;
  let removed = 0;
  try {
    if (!fs.existsSync(SUBMISSIONS_DIR)) return;
    const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
    for (const file of fs.readdirSync(SUBMISSIONS_DIR)) {
      const full = path.join(SUBMISSIONS_DIR, file);
      if (fs.statSync(full).mtimeMs < cutoff) {
        fs.unlinkSync(full);
        removed++;
      }
    }
  } catch (err) {
    console.error('Retention cleanup failed:', err.message);
  }
  if (removed > 0) console.log(`Retention: removed ${removed} submission(s) older than ${RETENTION_DAYS} days.`);
}

/* ---------- Startup & shutdown ---------- */

const envProblems = validateEnvironment();
envProblems.forEach((p) => console.warn('Config warning:', p));

cleanupOldSubmissions();
const retentionTimer = setInterval(cleanupOldSubmissions, 24 * 60 * 60 * 1000);
retentionTimer.unref();

const server = app.listen(PORT, () => {
  console.log(`Desire Discovery Quiz running at http://localhost:${PORT}`);
  if (smtpConfigured()) {
    console.log('Email: real delivery via', process.env.SMTP_HOST);
  } else if (EMAIL_OFF) {
    console.log('Email: off (EMAIL_MODE=off).');
  } else {
    console.log('Email: TEST MODE. No SMTP credentials set, so emails are captured by a throwaway');
    console.log('Ethereal inbox and each submission response includes a preview link to inspect');
    console.log('the exact email. Set SMTP_* in .env for real delivery (see .env.example).');
  }
  console.log(
    `Submissions: ${SAVE_SUBMISSIONS ? `saved to ./submissions/ (retention: ${RETENTION_DAYS > 0 ? RETENTION_DAYS + ' days' : 'forever'})` : 'not saved (SAVE_SUBMISSIONS=off)'}`
  );
});

function shutdown(signal) {
  console.log(`${signal} received: closing server…`);
  server.close(() => {
    console.log('Server closed cleanly.');
    process.exit(0);
  });
  // If connections keep it open, leave anyway after a grace period.
  setTimeout(() => process.exit(0), 10000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
