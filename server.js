/**
 * Desire Discovery Quiz: backend
 *
 * Serves the quiz frontend and receives submissions at POST /api/submit.
 * Each participant receives their own results email (summary, meanings,
 * examples, and suggestions, never their raw answers). If ADMIN_EMAIL is
 * set, a full copy (including answers) also goes there and the frontend
 * discloses that in the consent notice via GET /api/config. Every
 * submission is written to ./submissions/ as a JSON backup so a mail
 * outage never loses one.
 */

require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const DB = require('./public/quiz-data.js');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
const SUBMISSIONS_DIR = path.join(__dirname, 'submissions');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

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
    <p style="margin:8px 0;background:#ecfdf5;border-radius:8px;padding:10px 12px;"><strong style="color:#059669;font-size:12px;letter-spacing:.08em;">GOOD TO KNOW</strong><br>${escapeHtml(cat.support)}</p>
    <p style="margin:8px 0 0;"><strong>A gentle first step:</strong> ${escapeHtml(cat.firstStep)}</p>
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
      <p style="margin:8px 0 0;opacity:.9;">Everything you discovered, ${escapeHtml(name)}. Made for you to keep.</p>
    </div>

    <h2 style="color:#6d28d9;margin-top:28px;">Your kinks, ranked</h2>
    ${rankedRows ? `
    <div style="background:#faf7ff;border-radius:12px;padding:10px 12px;">
      <table style="border-collapse:collapse;width:100%;">${rankedRows}</table>
    </div>` : `
    <div style="${CARD_STYLE}">
      <p style="margin:0;">No single category dominated. Your profile leans toward presence, connection, and moving at your own pace. That's a complete answer in itself.</p>
    </div>`}

    <h2 style="color:#6d28d9;margin-top:28px;">What your answers say</h2>
    <div style="background:#faf7ff;border-radius:12px;padding:18px 20px;white-space:pre-wrap;">${escapeHtml(results.summaryText)}</div>

    <h2 style="color:#6d28d9;margin-top:28px;">Your top kinks, explained</h2>
    ${featured.length > 0 ? featured.map(categoryCardHtml).join('') : `
      <div style="${CARD_STYLE}">
        <p style="margin:0;">Connection, presence, and pace are the heart of your profile, and that's a complete answer in itself.</p>
      </div>`}

    ${desireMap ? `
    <h2 style="color:#6d28d9;margin-top:28px;">Your desire map</h2>
    <p style="color:#7c6f92;margin:4px 0 10px;">What speeds you up, what slows you down, and how your solo life fits in.</p>
    ${desireMap}` : ''}

    <h2 style="color:#6d28d9;margin-top:28px;">Where you fall on the Kinsey scale</h2>
    <div style="${CARD_STYLE}">
      <h3 style="margin:0 0 6px;color:#6d28d9;">${escapeHtml(results.kinsey.label)}</h3>
      <p style="margin:0;">${escapeHtml(results.kinsey.description)}</p>
    </div>

    <h2 style="color:#6d28d9;margin-top:28px;">Gentle suggestions for the road</h2>
    <ul style="padding-left:20px;">${suggestions}</ul>

    <div style="background:#faf7ff;border-radius:12px;padding:18px 20px;margin-top:24px;text-align:center;">
      <p style="margin:0;">Nothing in this profile is unusual, broken, or too much. Desire changes as you do,
      so come back to this kindly, explore at your own pace, and let each discovery help you know yourself a little better.</p>
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

/* ---------- Routes ---------- */

app.post('/api/submit', async (req, res) => {
  try {
    const { name, email, answers, results } = req.body || {};

    if (!name || !Array.isArray(answers) || answers.length === 0 || !results) {
      return res.status(400).json({ ok: false, error: 'Missing name, answers, or results.' });
    }
    if (!email || !EMAIL_RE.test(String(email))) {
      return res.status(400).json({ ok: false, error: 'A valid email address is required.' });
    }

    const submission = {
      name: String(name).slice(0, 100),
      email: String(email).slice(0, 200),
      submittedAt: new Date().toISOString(),
      answers,
      results,
    };

    // Local backup first; a mail outage should never lose a submission.
    fs.mkdirSync(SUBMISSIONS_DIR, { recursive: true });
    const safeName = submission.name.replace(/[^a-z0-9-]/gi, '_').toLowerCase();
    const backupFile = path.join(
      SUBMISSIONS_DIR,
      `${submission.submittedAt.replace(/[:.]/g, '-')}-${safeName}.json`
    );
    fs.writeFileSync(backupFile, JSON.stringify(submission, null, 2));

    let participantEmailSent = false;
    let testMode = false;
    let previewUrl = null;

    const mailer = await getMailer();
    if (mailer) {
      testMode = mailer.testMode;
      try {
        const info = await sendWithDeadline(mailer.transporter, {
          from: mailer.from,
          to: submission.email,
          subject: `${submission.name}, your Desire Profile is ready`,
          html: buildParticipantEmailHtml(submission),
        });
        participantEmailSent = true;
        if (testMode) {
          previewUrl = nodemailer.getTestMessageUrl(info) || null;
          console.log('Test mode: participant email captured. Preview:', previewUrl);
        } else {
          console.log('Participant email sent to', submission.email);
        }
      } catch (mailErr) {
        console.error('Participant email failed (submission saved locally):', mailErr.message);
      }

      if (ADMIN_EMAIL) {
        try {
          const adminInfo = await sendWithDeadline(mailer.transporter, {
            from: mailer.from,
            to: ADMIN_EMAIL,
            subject: `Quiz submission: ${submission.name}`,
            html: buildAdminEmailHtml(submission),
          });
          if (testMode) {
            console.log('Test mode: admin copy captured. Preview:', nodemailer.getTestMessageUrl(adminInfo));
          }
        } catch (mailErr) {
          console.error('Admin copy failed (submission saved locally):', mailErr.message);
        }
      }
    } else {
      console.warn('Email is off, submission saved to', backupFile);
    }

    return res.json({ ok: true, participantEmailSent, testMode, previewUrl });
  } catch (err) {
    console.error('Submission error:', err);
    return res.status(500).json({ ok: false, error: 'Server error.' });
  }
});

app.listen(PORT, () => {
  console.log(`Desire Discovery Quiz running at http://localhost:${PORT}`);
  if (smtpConfigured()) {
    console.log('Email: real delivery via', process.env.SMTP_HOST);
  } else if (String(process.env.EMAIL_MODE || '').toLowerCase() === 'off') {
    console.log('Email: off (EMAIL_MODE=off). Submissions are saved to ./submissions/ only.');
  } else {
    console.log('Email: TEST MODE. No SMTP credentials set, so emails are captured by a throwaway');
    console.log('Ethereal inbox and each submission response includes a preview link to inspect');
    console.log('the exact email. Set SMTP_* in .env for real delivery (see .env.example).');
  }
});
