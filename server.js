/**
 * Desire Discovery Quiz — backend
 *
 * Serves the quiz frontend and receives submissions at POST /api/submit.
 * Each submission (name, every question + answer, computed results, and the
 * plain-language summary shown to the participant) is emailed to
 * RESULTS_EMAIL and also written to ./submissions/ as a JSON backup so
 * nothing is lost if email delivery fails.
 */

require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const RESULTS_EMAIL = process.env.RESULTS_EMAIL || 'mizdonstudios@gmail.com';
const SUBMISSIONS_DIR = path.join(__dirname, 'submissions');

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function buildTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || 'true') === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildEmailHtml(submission) {
  const { name, submittedAt, answers, results } = submission;

  const answerRows = answers
    .map(
      (a, i) => `
        <tr>
          <td style="padding:8px 12px;border:1px solid #e2d9ee;vertical-align:top;"><strong>Q${i + 1}.</strong> ${escapeHtml(a.question)}</td>
          <td style="padding:8px 12px;border:1px solid #e2d9ee;vertical-align:top;">${escapeHtml(a.answer)}</td>
        </tr>`
    )
    .join('');

  const kinkRows = results.kinkProfile
    .map(
      (k) => `
        <tr>
          <td style="padding:8px 12px;border:1px solid #e2d9ee;">${escapeHtml(k.name)}</td>
          <td style="padding:8px 12px;border:1px solid #e2d9ee;">${escapeHtml(String(k.percent))}%</td>
          <td style="padding:8px 12px;border:1px solid #e2d9ee;">${escapeHtml(k.level)}</td>
        </tr>`
    )
    .join('');

  return `
  <div style="font-family:Georgia,serif;max-width:680px;margin:0 auto;color:#2b2140;">
    <h1 style="color:#7c3aed;">Desire Discovery Quiz — New Submission</h1>
    <p><strong>Name:</strong> ${escapeHtml(name)}<br>
       <strong>Submitted:</strong> ${escapeHtml(submittedAt)}</p>

    <h2 style="color:#7c3aed;">Questions &amp; Answers</h2>
    <table style="border-collapse:collapse;width:100%;font-size:14px;">${answerRows}</table>

    <h2 style="color:#7c3aed;">Kink Profile Scores</h2>
    <table style="border-collapse:collapse;width:100%;font-size:14px;">
      <tr>
        <th style="padding:8px 12px;border:1px solid #e2d9ee;text-align:left;">Category</th>
        <th style="padding:8px 12px;border:1px solid #e2d9ee;text-align:left;">Score</th>
        <th style="padding:8px 12px;border:1px solid #e2d9ee;text-align:left;">Level</th>
      </tr>
      ${kinkRows}
    </table>

    <h2 style="color:#7c3aed;">Kinsey Scale Result</h2>
    <p><strong>${escapeHtml(results.kinsey.label)}</strong></p>
    <p>${escapeHtml(results.kinsey.description)}</p>

    <h2 style="color:#7c3aed;">Summary Shown to ${escapeHtml(name)}</h2>
    <div style="background:#f6f1fb;border-radius:8px;padding:16px;white-space:pre-wrap;font-size:14px;">${escapeHtml(results.summaryText)}</div>
  </div>`;
}

app.post('/api/submit', async (req, res) => {
  try {
    const { name, answers, results } = req.body || {};

    if (!name || !Array.isArray(answers) || answers.length === 0 || !results) {
      return res.status(400).json({ ok: false, error: 'Missing name, answers, or results.' });
    }

    const submission = {
      name: String(name).slice(0, 100),
      submittedAt: new Date().toISOString(),
      answers,
      results,
    };

    // Always keep a local backup so a mail outage never loses a submission.
    fs.mkdirSync(SUBMISSIONS_DIR, { recursive: true });
    const safeName = submission.name.replace(/[^a-z0-9-]/gi, '_').toLowerCase();
    const backupFile = path.join(
      SUBMISSIONS_DIR,
      `${submission.submittedAt.replace(/[:.]/g, '-')}-${safeName}.json`
    );
    fs.writeFileSync(backupFile, JSON.stringify(submission, null, 2));

    let emailSent = false;
    if (smtpConfigured()) {
      try {
        await buildTransporter().sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: RESULTS_EMAIL,
          subject: `Desire Discovery Quiz — results for ${submission.name}`,
          html: buildEmailHtml(submission),
        });
        emailSent = true;
      } catch (mailErr) {
        console.error('Email delivery failed (submission saved locally):', mailErr.message);
      }
    } else {
      console.warn('SMTP is not configured — submission saved to', backupFile);
    }

    return res.json({ ok: true, emailSent });
  } catch (err) {
    console.error('Submission error:', err);
    return res.status(500).json({ ok: false, error: 'Server error.' });
  }
});

app.listen(PORT, () => {
  console.log(`Desire Discovery Quiz running at http://localhost:${PORT}`);
  if (!smtpConfigured()) {
    console.log('Note: SMTP env vars not set — submissions will be saved to ./submissions/ but not emailed.');
    console.log('See .env.example for setup.');
  }
});
