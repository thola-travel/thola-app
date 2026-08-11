# Desire Discovery Quiz 🌸

A modern, animated, sex-positive interactive quiz that helps people discover:

- **Their kink profile across 46 categories** — from the broad strokes (dominance, submission, bondage, sensation, roleplay, exhibitionism, voyeurism, praise, sensual connection) to the niche (primal play, consensual non-consent, pet play, rope/shibari, e-stim, medical play, breeding fantasy, erotic hypnosis, compersion & sharing, material fetishes, feet, watersports, wet & messy play, and more) — each with meanings, real examples, a supportive shame-free note, and a gentle first-step suggestion.
- **Where they fall on the Kinsey scale** (0–6, plus X for the asexual spectrum), with an affirming description.

## How it works

1. The participant enters their **first name and email**, checks a consent notice, and answers **53 multiple-choice questions** in three parts:
   - *Part 1 — Play Style*: 12 weighted scenario questions.
   - *Part 2 — Spark Round*: 37 rapid-fire questions, one per niche kink, answered on a gut-reaction scale (🔥 Yes please / 👀 Curious / 😐 Take it or leave it / 🙅 Not for me) so even niche interests are measured directly and accurately.
   - *Part 3 — Kinsey Scale*: 4 attraction questions.
2. A **live reading sidebar analyzes answers in real time** — animated category bars and an evolving read on where they're leaning.
3. On submission the full analysis runs: every category is scored as a percentage and graded (*Strong resonance* ≥ 60% / *Curious spark* ≥ 35% / *Not a focus*), Kinsey answers are averaged to a placement, personalized suggestions are assembled, and a friendly plain-language summary is written.
4. The results page shows the summary, an animated Kinsey scale, full cards for strong matches, compact cards for curiosities, a **full spectrum map** of all 46 categories, and self-discovery suggestions.
5. **The participant is emailed a keepsake copy** — their summary, Kinsey result, the meanings/examples/support for what lit up, and suggestions. Their raw answers are *not* included in their email.

Every submission is also written to `./submissions/` as a JSON backup on the server, so a mail outage never loses one.

## Setup

```bash
npm install
cp .env.example .env   # fill in SMTP credentials (see below)
npm start              # http://localhost:3000
```

### Email setup

Any SMTP provider works. With Gmail: enable **2-Step Verification**, create an **App password** (https://myaccount.google.com/apppasswords), and use it as `SMTP_PASS`. For a quiz with no trace to a personal account, use a dedicated sending address.

Without SMTP configured the app still works — results display in the browser and submissions are saved to `./submissions/`.

### Optional admin copy

By default nothing is sent anywhere except to the participant. If you set `ADMIN_EMAIL` in `.env`, a full copy of each submission (answers + results) is emailed there — and the consent notice on the intro screen **automatically updates** to disclose that a copy is kept by the quiz administrator, so participants are never collected from silently.

## Testing

With the server running:

```bash
CHROMIUM_PATH=/path/to/chrome node test/smoke.js
```

This drives the entire quiz in a real browser — name/email entry, all 53 questions, submission — and asserts the results render with no JS errors.

## Privacy notes

- `submissions/` and `.env` are git-ignored so personal data and credentials never reach the repository.
- The participant email contains only their summary and meanings — never their raw answers.
