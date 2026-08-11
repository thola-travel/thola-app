# Desire Discovery Quiz 🌸

An interactive, sex-positive quiz that helps people figure out two things:

- **Their kink profile across 46 categories.** The broad strokes (dominance, submission, bondage, sensation, roleplay, exhibitionism, voyeurism, praise, sensual connection) and the niche stuff too: primal play, consensual non-consent, pet play, rope and shibari, e-stim, medical play, breeding fantasy, erotic hypnosis, compersion, material fetishes, feet, watersports, messy play, and more. Each category comes with a plain-language meaning, real examples, a supportive note, and a gentle first step.
- **Where they land on the Kinsey scale** (0 to 6, plus X for the asexual spectrum), with an affirming description of what that placement means.

## How it works

1. The participant enters a **first name and email**, checks a consent notice, and answers **61 multiple-choice questions** in four parts:
   - *Part 1, Play Style*: 12 weighted scenario questions.
   - *Part 2, Spark Round*: 37 rapid-fire questions, one per niche kink, answered on a gut-reaction scale (🔥 Yes please / 👀 Curious / 😐 Take it or leave it / 🙅 Not for me). One direct question per kink keeps even the niche scores accurate.
   - *Part 3, Desire & Solo Life*: 8 questions about turn-ons, turn-offs, what pulls them out of the moment, and their solo life (how often they masturbate, how, what they turn to, and how they feel after). Each answer gets a supportive, research-grounded reflection in the results.
   - *Part 4, Kinsey Scale*: 4 attraction questions.
2. A **live reading sidebar** analyzes answers as they come in, with animated category bars and a running read on where the profile is leaning.
3. On submission the full analysis runs. Every category gets a percentage and a grade (*Strong match* at 60% and up, *Curious spark* at 35% and up, *Not a focus* below that). Kinsey answers are averaged to a placement. Personalized suggestions are assembled and a plain-language summary is written.
4. The results page shows the summary, an animated Kinsey scale, a **desire map** (their turn-on, turn-off, and solo-life answers read back with supportive context), full cards for strong matches, compact cards for curiosities, a **spectrum map** of all 46 categories, and suggestions for self-discovery.
5. **The participant gets an email copy** with their summary, Kinsey result, desire map, the meanings and examples for what lit up, and suggestions. Their raw answers are never included in that email.

Every submission is also written to `./submissions/` as a JSON backup on the server, so a mail outage never loses one.

## Setup

```bash
npm install
cp .env.example .env   # fill in SMTP credentials (see below)
npm start              # http://localhost:3000
```

### Email setup

Any SMTP provider works. With Gmail: enable 2-Step Verification, create an App password at https://myaccount.google.com/apppasswords, and use it as `SMTP_PASS`. If you want the quiz fully untraceable to a personal account, send from a dedicated address created just for this.

Without SMTP configured the app still works. Results display in the browser and submissions are saved to `./submissions/`.

### Optional admin copy

By default nothing is sent anywhere except to the participant. If you set `ADMIN_EMAIL` in `.env`, a full copy of each submission (answers plus results) is emailed there, and the consent notice on the intro screen automatically updates to disclose that a copy is kept by the quiz administrator. Nobody gets collected from silently.

## Testing

With the server running:

```bash
CHROMIUM_PATH=/path/to/chrome node test/smoke.js
```

This drives the whole quiz in a real browser (name and email entry, all 61 questions, submission) and asserts the results render with no JS errors.

## Privacy notes

- `submissions/` and `.env` are git-ignored, so personal data and credentials never reach the repository.
- The participant email contains only their summary and meanings. Never their raw answers.
