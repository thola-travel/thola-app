# Desire Discovery Quiz 🌸

An interactive, sex-positive quiz with a custom SVG line-icon set (no emoji) that helps people figure out two things:

- **Their kink profile across 50 categories.** The broad strokes (dominance, submission, sadism, masochism, bondage, sensation, roleplay, exhibitionism, voyeurism, praise, sensual connection) and the niche stuff too: primal play, consensual non-consent, pet play, rope and shibari, e-stim, medical play, breeding fantasy, erotic hypnosis, compersion, material fetishes, feet, watersports, messy play, and more. Each category comes with a plain-language meaning, real examples, a supportive note, and a gentle first step.
- **Where they land on the Kinsey scale** (0 to 6, plus X for the asexual spectrum), with an affirming description of what that placement means.

## How it works

1. The participant enters a **first name and email**, checks a consent notice, and answers **71 base questions plus adaptive follow-ups** in four parts:
   - *Part 1, Play Style*: 20 weighted scenario questions, including differentiators that separate close identities (dominant vs sadist vs disciplinarian, submissive vs masochist vs brat). Questions where several answers can be true at once (fantasies, daydreams) are select-all-that-apply; forced-choice is kept only where it sharpens discrimination.
   - *Part 2, Interest Inventory*: 39 direct questions, one per niche kink, on a four-point scale (Strongly appeals / Curious / Neutral / Does not appeal). Every full "yes" triggers an adaptive centrality follow-up (central / regular / occasional / peripheral) that weights the score, so rankings discriminate between core interests and peripheral ones. For the 32 kinks where giving and receiving are different experiences, the "yes" answer splits into sides with tailored labels ("Yes, tying" / "Yes, being tied" / "Yes, both sides"), so someone who loves doing a thing but not receiving it gets an accurate profile. The chosen side appears on their result cards, the spectrum map, the summary, and the email.
   - *Part 3, Desire & Solo Patterns*: 8 questions about turn-ons, turn-offs, what pulls them out of the moment, and their solo life (how often they masturbate, how, what they turn to, and how they feel after). Six of these are select-all-that-apply, since more than one answer is usually true; every selected answer gets its own research-grounded reflection in the results, and multi-select scoring normalizes against the sum of all selectable weights.
   - *Part 4, In Your Words*: 3 optional open-response questions (most arousing fantasy, wanted-but-untried, anything not captured). Responses are analyzed by keyword and phrase matching against a per-category lexicon with negation handling; identified themes are reported and weighted into the ranked scores, and the full text is stored with the submission.
   - *Part 5, Attraction*: 4 attraction questions. The Kinsey scale is never mentioned before the results; the results section explains what the scale is, then gives the placement and its meaning.
2. A **live reading sidebar** analyzes answers as they come in, with animated category bars and a running read on where the profile is leaning.
3. On submission the full analysis runs. Every category gets a percentage and a grade (*Strong match* at 60% and up, *Curious spark* at 35% and up, *Not a focus* below that). Kinsey answers are averaged to a placement. Personalized suggestions are assembled and a plain-language summary is written.
4. The results page opens with a completion banner confirming the submission and stating, from the server's actual delivery status, that the report is being sent to the address provided, followed by a **ranked list of their kinks with percentages** (top kink first, straight down the line, each with the side they chose), then the written summary, then full explanation cards for their top kinks, then everything else: the desire map, an animated Kinsey scale, a **spectrum map** of all 50 categories, and suggestions for self-discovery.
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
node test/email-delivery.js   # real-SMTP delivery, content, and confirmation checks
node test/text-analysis.js    # open-response analyzer: phrases, boundaries, negation
```

### Optional admin copy

By default nothing is sent anywhere except to the participant. If you set `ADMIN_EMAIL` in `.env`, a full copy of each submission (answers plus results) is emailed there, and the consent notice on the intro screen automatically updates to disclose that a copy is kept by the quiz administrator. Nobody gets collected from silently.

## Testing

With the server running:

```bash
CHROMIUM_PATH=/path/to/chrome node test/smoke.js
```

This drives the whole quiz in a real browser (name and email entry, all questions, submission) and asserts the results render with no JS errors.

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
