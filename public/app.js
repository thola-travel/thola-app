/**
 * Desire Discovery Quiz — interactive logic.
 *
 * Answers are analyzed in real time (the "live reading" sidebar updates
 * category scores after every answer), then a complete analysis runs on
 * submission: kink profile with match levels, Kinsey scale placement, and
 * a plain-language summary. The full packet (name, Q&A, results, summary)
 * is POSTed to the backend, which emails it to the facilitator.
 */

(function () {
  'use strict';

  // ---------- State ----------
  const allQuestions = [
    ...QUESTIONS.map((q) => ({ ...q, type: 'kink' })),
    ...KINSEY_QUESTIONS.map((q) => ({ ...q, type: 'kinsey' })),
  ];

  const state = {
    name: '',
    index: 0,
    selections: new Array(allQuestions.length).fill(null), // option index per question
  };

  // Max possible score per category (for normalizing to percentages).
  const categoryMax = {};
  Object.keys(CATEGORIES).forEach((key) => {
    categoryMax[key] = QUESTIONS.reduce((sum, q) => {
      const best = Math.max(...q.options.map((o) => o.scores[key] || 0));
      return sum + best;
    }, 0);
  });

  // ---------- Elements ----------
  const $ = (id) => document.getElementById(id);
  const screens = {
    intro: $('screen-intro'),
    quiz: $('screen-quiz'),
    analyzing: $('screen-analyzing'),
    results: $('screen-results'),
  };

  function showScreen(name) {
    Object.values(screens).forEach((s) => s.classList.remove('active'));
    screens[name].classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---------- Intro ----------
  const nameInput = $('first-name');
  const consentCheck = $('consent-check');
  const btnStart = $('btn-start');

  function refreshStartButton() {
    btnStart.disabled = !(nameInput.value.trim().length > 0 && consentCheck.checked);
  }
  nameInput.addEventListener('input', refreshStartButton);
  consentCheck.addEventListener('change', refreshStartButton);

  btnStart.addEventListener('click', () => {
    state.name = nameInput.value.trim();
    state.index = 0;
    renderQuestion();
    showScreen('quiz');
  });

  // ---------- Live (real-time) analysis ----------
  function currentScores() {
    const totals = {};
    Object.keys(CATEGORIES).forEach((k) => (totals[k] = 0));
    state.selections.forEach((sel, i) => {
      const q = allQuestions[i];
      if (sel === null || q.type !== 'kink') return;
      const scores = q.options[sel].scores;
      Object.entries(scores).forEach(([k, pts]) => (totals[k] += pts));
    });
    return totals;
  }

  function answeredKinkCount() {
    return state.selections.filter((sel, i) => sel !== null && allQuestions[i].type === 'kink').length;
  }

  function updateLivePanel() {
    const totals = currentScores();
    const answered = answeredKinkCount();

    // Bars: show all categories, scaled to the current leader so movement is visible early.
    const leader = Math.max(1, ...Object.values(totals));
    const barsHost = $('live-bars');
    barsHost.innerHTML = '';
    Object.entries(CATEGORIES)
      .sort((a, b) => (totals[b[0]] || 0) - (totals[a[0]] || 0))
      .forEach(([key, cat]) => {
        const pct = Math.round(((totals[key] || 0) / leader) * 100);
        const row = document.createElement('div');
        row.className = 'live-bar-row';
        row.innerHTML =
          '<div class="bar-label"><span>' + cat.emoji + ' ' + cat.name + '</span></div>' +
          '<div class="live-bar-track"><div class="live-bar-fill" style="width:' + pct + '%"></div></div>';
        barsHost.appendChild(row);
      });

    // Blurb: an evolving read on where they're leaning.
    const blurb = $('live-blurb');
    if (answered === 0) {
      blurb.textContent = 'Answer a few questions and your profile will start to appear…';
      return;
    }
    const ranked = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    const [topKey, topVal] = ranked[0];
    const [secondKey, secondVal] = ranked[1];
    const top = CATEGORIES[topKey];

    if (answered < 4) {
      blurb.textContent = 'Early signs point toward ' + top.name.toLowerCase() + '… keep going, the picture is still forming.';
    } else if (topVal > 0 && secondVal > 0 && topVal - secondVal <= 2) {
      blurb.textContent =
        'Interesting — you\'re showing a blend of ' + top.name.toLowerCase() + ' and ' +
        CATEGORIES[secondKey].name.toLowerCase() + '. A versatile profile is taking shape.';
    } else {
      blurb.textContent =
        top.emoji + ' ' + top.name + ' is emerging as a strong thread for you. ' + top.tagline;
    }
  }

  // ---------- Quiz rendering ----------
  function renderQuestion() {
    const q = allQuestions[state.index];
    const kinkTotal = QUESTIONS.length;

    $('section-tag').textContent =
      q.type === 'kink' ? 'Part 1 · Your Play Style' : 'Part 2 · Attraction & the Kinsey Scale';
    $('progress-count').textContent = 'Question ' + (state.index + 1) + ' of ' + allQuestions.length;
    $('progress-fill').style.width = ((state.index / allQuestions.length) * 100) + '%';
    $('question-text').textContent = q.question;

    const host = $('options');
    host.innerHTML = '';
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'option' + (state.selections[state.index] === i ? ' selected' : '');
      btn.type = 'button';
      btn.textContent = opt.label;
      btn.addEventListener('click', () => selectOption(i));
      host.appendChild(btn);
    });

    $('btn-back').style.visibility = state.index === 0 ? 'hidden' : 'visible';
    $('nav-hint').textContent =
      q.type === 'kinsey'
        ? 'Attraction, not behavior — answer with your inner experience'
        : 'Pick the answer that feels most true';

    updateLivePanel();
  }

  function selectOption(optionIndex) {
    state.selections[state.index] = optionIndex;
    renderQuestion(); // repaint selection + live panel
    setTimeout(() => {
      if (state.index < allQuestions.length - 1) {
        state.index += 1;
        renderQuestion();
      } else {
        beginAnalysis();
      }
    }, 350);
  }

  $('btn-back').addEventListener('click', () => {
    if (state.index > 0) {
      state.index -= 1;
      renderQuestion();
    }
  });

  // ---------- Full analysis ----------
  function levelFor(percent) {
    if (percent >= 60) return { level: 'Strong resonance', cls: '' };
    if (percent >= 35) return { level: 'Curious spark', cls: 'curious' };
    return { level: 'Not a focus right now', cls: 'low' };
  }

  function analyze() {
    const totals = currentScores();

    const kinkProfile = Object.entries(CATEGORIES)
      .map(([key, cat]) => {
        const percent = Math.round(((totals[key] || 0) / (categoryMax[key] || 1)) * 100);
        const { level, cls } = levelFor(percent);
        return { key, name: cat.emoji + ' ' + cat.name, plainName: cat.name, percent, level, cls };
      })
      .sort((a, b) => b.percent - a.percent);

    // Kinsey: average the numeric answers; X wins if it's the majority.
    const kinseyValues = [];
    let xCount = 0;
    KINSEY_QUESTIONS.forEach((q, i) => {
      const sel = state.selections[QUESTIONS.length + i];
      if (sel === null) return;
      const v = q.options[sel].value;
      if (v === 'X') xCount += 1;
      else kinseyValues.push(v);
    });

    let kinseyKey;
    if (xCount > kinseyValues.length) {
      kinseyKey = 'X';
    } else {
      const avg = kinseyValues.reduce((a, b) => a + b, 0) / Math.max(1, kinseyValues.length);
      kinseyKey = Math.min(6, Math.max(0, Math.round(avg)));
    }
    const kinsey = { key: String(kinseyKey), ...KINSEY_RESULTS[kinseyKey] };

    const summaryText = buildSummary(kinkProfile, kinsey);
    return { kinkProfile, kinsey, summaryText };
  }

  function buildSummary(kinkProfile, kinsey) {
    const strong = kinkProfile.filter((k) => k.level === 'Strong resonance');
    const curious = kinkProfile.filter((k) => k.level === 'Curious spark');
    const name = state.name;

    const lines = [];

    if (strong.length > 0) {
      const names = strong.map((k) => k.plainName.toLowerCase());
      lines.push(
        name + ', your answers paint a clear and wonderful picture: you\'re most strongly drawn to ' +
        joinNicely(names) + '. ' +
        (strong.length > 1
          ? 'These threads weave together naturally — they\'re not separate "kinks" so much as one coherent way you love to connect.'
          : 'That focus is a gift — knowing exactly what lights you up makes it far easier to ask for.')
      );
    } else if (curious.length > 0) {
      lines.push(
        name + ', your profile is beautifully open — no single kink dominates, but you carry genuine sparks of curiosity toward ' +
        joinNicely(curious.map((k) => k.plainName.toLowerCase())) +
        '. Curiosity is exactly where every good discovery starts, and there\'s no rush.'
      );
    } else {
      lines.push(
        name + ', your answers point somewhere lovely: connection itself is your erotic language. ' +
        'The kink spectrum is wide, and "deep presence with a partner I trust" is a full and complete answer to what excites you.'
      );
    }

    if (curious.length > 0 && strong.length > 0) {
      lines.push(
        'Alongside your core profile, you showed a curious spark toward ' +
        joinNicely(curious.map((k) => k.plainName.toLowerCase())) +
        ' — worth exploring gently, at your own pace, if and when it appeals.'
      );
    }

    lines.push(
      'On attraction: you land at ' + kinsey.label.replace('Kinsey ', 'point ').split(' — ')[0].toLowerCase() +
      ' on the Kinsey scale. ' + kinsey.description
    );

    lines.push(
      'One thing to hold onto, ' + name + ': nothing in your profile is unusual, broken, or "too much." ' +
      'Every interest here is shared by millions of people and is completely healthy when explored with enthusiastic consent, ' +
      'honest communication, and partners you trust. Your desires are a feature of who you are — never a flaw.'
    );

    return lines.join('\n\n');
  }

  function joinNicely(items) {
    if (items.length === 1) return items[0];
    if (items.length === 2) return items[0] + ' and ' + items[1];
    return items.slice(0, -1).join(', ') + ', and ' + items[items.length - 1];
  }

  // ---------- Submission flow ----------
  function collectAnswers() {
    return allQuestions.map((q, i) => ({
      section: q.type === 'kink' ? 'Play Style' : 'Kinsey Scale',
      question: q.question,
      answer: state.selections[i] !== null ? q.options[state.selections[i]].label : '(skipped)',
    }));
  }

  function beginAnalysis() {
    showScreen('analyzing');
    const steps = [
      'Compiling your responses…',
      'Mapping your play-style profile…',
      'Placing you on the Kinsey scale…',
      'Writing your summary…',
    ];
    let s = 0;
    const stepEl = $('analyzing-step');
    stepEl.textContent = steps[0];
    const ticker = setInterval(() => {
      s += 1;
      if (s < steps.length) stepEl.textContent = steps[s];
      else clearInterval(ticker);
    }, 650);

    const results = analyze();
    const payload = { name: state.name, answers: collectAnswers(), results };

    // Send to the backend for email delivery; results show regardless so the
    // participant is never blocked by a delivery hiccup.
    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .catch(() => ({ ok: false }))
      .then((resp) => {
        setTimeout(() => renderResults(results, resp), 2800);
      });
  }

  // ---------- Results rendering ----------
  function renderResults(results, serverResp) {
    $('results-title').textContent = state.name + ', here\'s your Desire Profile 🌸';
    $('results-summary').textContent = results.summaryText;

    // Kinsey scale strip
    const scaleHost = $('kinsey-scale');
    scaleHost.innerHTML = '';
    ['0', '1', '2', '3', '4', '5', '6', 'X'].forEach((stop) => {
      const el = document.createElement('div');
      el.className = 'kinsey-stop' + (stop === results.kinsey.key ? ' hit' : '');
      el.textContent = stop;
      scaleHost.appendChild(el);
    });
    $('kinsey-label').textContent = results.kinsey.label;
    $('kinsey-description').textContent = results.kinsey.description;

    // Kink cards (strong + curious in full; others summarized in a low card)
    const host = $('kink-results');
    host.innerHTML = '';
    const featured = results.kinkProfile.filter((k) => k.level !== 'Not a focus right now');
    const rest = results.kinkProfile.filter((k) => k.level === 'Not a focus right now');

    (featured.length > 0 ? featured : results.kinkProfile.slice(0, 3)).forEach((k) => {
      const cat = CATEGORIES[k.key];
      const card = document.createElement('div');
      card.className = 'card kink-card ' + k.cls;
      card.innerHTML =
        '<div class="kink-head"><h3>' + cat.emoji + ' ' + cat.name + '</h3>' +
        '<span class="match-chip">' + k.percent + '% · ' + k.level + '</span></div>' +
        '<p class="kink-tagline">' + cat.tagline + '</p>' +
        '<div class="kink-meter"><div class="kink-meter-fill" style="width:' + k.percent + '%"></div></div>' +
        '<p>' + cat.description + '</p>' +
        '<h4>What this can look like</h4>' +
        '<ul>' + cat.examples.map((e) => '<li>' + e + '</li>').join('') + '</ul>' +
        '<div class="support-note">💚 ' + cat.support + '</div>';
      host.appendChild(card);
    });

    if (rest.length > 0 && featured.length > 0) {
      const card = document.createElement('div');
      card.className = 'card kink-card low';
      card.innerHTML =
        '<div class="kink-head"><h3>🌱 Quieter for now</h3></div>' +
        '<p>These areas didn\'t light up strongly this time: <strong>' +
        rest.map((k) => k.name).join(', ') +
        '</strong>. That\'s not a "no" — interests shift across a lifetime, and quiet today can become curiosity tomorrow. Nothing is closed off unless you want it to be.</p>';
      host.appendChild(card);
    }

    $('closing-note').textContent =
      'Discovery is a lifelong conversation with yourself, ' + state.name +
      '. Revisit this whenever you like — answers change as you grow, and every version of your profile is worth celebrating.';
    $('email-note').textContent = serverResp && serverResp.ok
      ? 'Your results have been sent to the facilitator, who can share a copy with you for your records.'
      : 'Your results were saved. If you\'d like a copy, just ask the facilitator.';

    showScreen('results');
  }

  $('btn-restart').addEventListener('click', () => {
    state.index = 0;
    state.selections = new Array(allQuestions.length).fill(null);
    nameInput.value = state.name;
    refreshStartButton();
    showScreen('intro');
  });
})();
