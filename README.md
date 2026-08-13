# Desire Discovery Quiz 🌸

An interactive, sex-positive quiz with a custom SVG line-icon set (no emoji) that helps people figure out two things:

- **Their kink profile across 50 categories.** The broad strokes (dominance, submission, sadism, masochism, bondage, sensation, roleplay, exhibitionism, voyeurism, praise, sensual connection) and the niche stuff too: primal play, consensual non-consent, pet play, rope and shibari, e-stim, medical play, breeding fantasy, erotic hypnosis, compersion, material fetishes, feet, watersports, messy play, and more. Each category comes with a plain-language meaning, real examples, a supportive note, and a gentle first step.
- **Where they land on the Kinsey scale** (0 to 6, plus X for the asexual spectrum), with an affirming description of what that placement means.

## How it works

1. The participant enters a **first name and email**, checks a consent notice, and answers **71 multiple-choice questions** in four parts:
   - *Part 1, Play Style*: 20 weighted scenario questions, including differentiators that separate close identities (dominant vs sadist vs disciplinarian, submissive vs masochist vs brat).
   - *Part 2, Spark Round*: 39 rapid-fire questions, one per niche kink, answered on a gut-reaction scale (Yes please / Curious / Take it or leave it / Not for me). For the 32 kinks where giving and receiving are different experiences, the "yes" answer splits into sides with tailored labels ("Yes, tying" / "Yes, being tied" / "Yes, both sides"), so someone who loves doing a thing but not receiving it gets an accurate profile. The chosen side appears on their result cards, the spectrum map, the summary, and the email.
   - *Part 3, Desire & Solo Life*: 8 questions about turn-ons, turn-offs, what pulls them out of the moment, and their solo life (how often they masturbate, how, what they turn to, and how they feel after). Each answer gets a supportive, research-grounded reflection in the results.
   - *Part 4, Kinsey Scale*: 4 attraction questions.
2. A **live reading sidebar** analyzes answers as they come in, with animated category bars and a running read on where the profile is leaning.
3. On submission the full analysis runs. Every category gets a percentage and a grade (*Strong match* at 60% and up, *Curious spark* at 35% and up, *Not a focus* below that). Kinsey answers are averaged to a placement. Personalized suggestions are assembled and a plain-language summary is written.
4. The results page opens with a **ranked list of their kinks with percentages** (top kink first, straight down the line, each with the side they chose), then the written summary, then full explanation cards for their top kinks, then everything else: the desire map, an animated Kinsey scale, a **spectrum map** of all 50 categories, and suggestions for self-discovery.
5. **The participant gets an email copy** in the same order: ranked list, summary, top-kink explanations, desire map, Kinsey result, and suggestions. Their raw answers are never included in that email.

Every submission is also written to `./submissions/` as a JSON backup on the server, so a mail outage never loses one.

## Setup

```bash
npm install
cp .env.example .env   # fill in SMTP credentials (see below)
npm start              # http://localhost:3000
```

### Email setup

Any SMTP provider works. With Gmail: enable 2-Step Verification, create an App password at https://myaccount.google.com/apppasswords, and use it as `SMTP_PASS`. If you want the quiz fully untraceable to a personal account, send from a dedicated address created just for this.

**Testing without credentials:** with no SMTP settings, the app starts in test mode. Every submission's email is genuinely composed and sent over SMTP, a throwaway Ethereal inbox captures it instead of delivering, and the results page shows an "open the exact email" link so you can inspect precisely what the participant would have received. Set `EMAIL_MODE=off` to disable email entirely. Either way, results always display and submissions are saved to `./submissions/`; a slow or unreachable mail server can never delay someone's results (hard 20-second send deadline).

There's also an automated delivery test that runs a real SMTP server locally and asserts the participant email arrives at the address entered (ranked list, percentages, and side included; raw answers excluded) and that the admin copy carries the answers:

```bash
node test/email-delivery.js
```

### Optional admin copy

By default nothing is sent anywhere except to the participant. If you set `ADMIN_EMAIL` in `.env`, a full copy of each submission (answers plus results) is emailed there, and the consent notice on the intro screen automatically updates to disclose that a copy is kept by the quiz administrator. Nobody gets collected from silently.

## Testing

With the server running:

```bash
CHROMIUM_PATH=/path/to/chrome node test/smoke.js
```

This drives the whole quiz in a real browser (name and email entry, all 71 questions, submission) and asserts the results render with no JS errors.

## Production

The server ships production-ready:

- **Security:** strict Content-Security-Policy and security headers (helmet), same-origin API only, no `x-powered-by`, JSON bodies capped at 300 KB.
- **Abuse protection:** per-IP rate limits (120 API requests / 15 min, 10 submissions / hour) and an invisible honeypot field that silently discards bot submissions. Set `TRUST_PROXY` to your proxy hop count (default 1) so limits see real client IPs.
- **Input handling:** every submission is rebuilt server-side from a whitelist of expected fields with hard size caps; malformed payloads get a clear 400.
- **Operations:** `GET /healthz` for uptime checks, request logging for the API, clear startup config warnings (for example partial SMTP settings), graceful shutdown on SIGTERM/SIGINT.
- **Data care:** submission backups can be disabled (`SAVE_SUBMISSIONS=off`) and are otherwise auto-deleted after `SUBMISSION_RETENTION_DAYS` (default 30; 0 keeps forever).
- **Email resilience:** one automatic retry on failure, hard send deadlines, and results that never wait on a mail server.

### Deploying

Docker:

```bash
docker build -t desire-quiz .
docker run -p 3000:3000 --env-file .env desire-quiz
```

Render/Railway/Fly: point the service at this repo, set the environment variables from `.env.example`, and use `npm start` (or the Dockerfile). The app listens on `PORT` and reports readiness at `/healthz`. Run it behind HTTPS (all these hosts provide it by default); the quiz collects intimate data and must not be served over plain HTTP.

## Privacy notes

- `submissions/` and `.env` are git-ignored, so personal data and credentials never reach the repository.
- The participant email contains only their summary and meanings. Never their raw answers.
