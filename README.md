# Desire Discovery Quiz 🌸

A warm, sex-positive interactive quiz that helps people discover:

- **Their kink profile** — which kinds of play they're drawn to (dominance, submission, bondage & restraint, sensation play, roleplay & fantasy, exhibitionism & voyeurism, praise & worship, and sensual/romantic connection), with real examples of each and supportive, shame-free explanations.
- **Where they fall on the Kinsey scale** (0–6, plus X), with an affirming description of their placement.

## How it works

1. The participant enters their **first name**, checks a consent notice, and answers **20 multiple-choice questions** (16 play-style + 4 Kinsey-scale).
2. A **live reading sidebar analyzes answers in real time**, showing category bars and an evolving read on where they're leaning.
3. On submission, the full analysis runs: category scores are normalized to percentages and graded (Strong resonance ≥ 60% / Curious spark ≥ 35% / Not a focus), Kinsey answers are averaged to a 0–6 placement (or X), and a friendly plain-language **summary** is written for them.
4. The results page shows the summary, a visual Kinsey scale, and a card for each resonant kink with examples and a supportive note.
5. **In the backend**, the complete packet — name, every question and answer, scores, Kinsey result, and the exact summary shown to the participant — is emailed to `mizdonstudios@gmail.com` and saved to `./submissions/` as a JSON backup (so a mail outage never loses a submission).

## Setup

```bash
npm install
cp .env.example .env   # fill in SMTP credentials (see below)
npm start              # http://localhost:3000
```

### Email setup (Gmail)

1. On the Gmail account, enable **2-Step Verification**.
2. Create an **App password**: https://myaccount.google.com/apppasswords
3. Put it in `.env` as `SMTP_PASS` (with `SMTP_USER` set to the Gmail address).

Without SMTP configured, the app still works — submissions are saved to `./submissions/` and a note is logged on startup.

## Privacy notes

- The intro screen includes a consent checkbox telling participants their answers and results will be sent to the facilitator. Please keep it — this data is intimate, and informed consent protects both you and your participants.
- `submissions/` and `.env` are git-ignored so personal data and credentials never end up in the repository.
