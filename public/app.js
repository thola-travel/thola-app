/**
 * Desire Discovery Quiz: interactive logic.
 *
 * Three parts: weighted play-style questions, a rapid-fire spark round
 * (one question per niche kink), and the Kinsey scale. Answers are analyzed
 * in real time in the sidebar; the full analysis runs on submission and the
 * packet is POSTed to the backend, which emails the participant their
 * summary, meanings, and suggestions.
 */

(function () {
  'use strict';

  // ---------- Build the question list ----------
  const sparkCategories = Object.entries(CATEGORIES).filter(([, c]) => c.sparkPrompt);

  const allQuestions = [
    ...QUESTIONS.map((q) => ({ ...q, type: 'kink' })),
    ...sparkCategories.map(([key, cat]) => ({
      type: 'spark',
      categoryKey: key,
      question: cat.sparkPrompt,
      options: SPARK_SCALE.map((s) => ({ label: s.label, value: s.value })),
    })),
    ...KINSEY_QUESTIONS.map((q) => ({ ...q, type: 'kinsey' })),
  ];

  const state = {
    name: '',
    email: '',
    index: 0,
    selections: new Array(allQuestions.length).fill(null),
  };

  // Max possible Part 1 score per broad category, for normalization.
  const broadMax = {};
  Object.keys(CATEGORIES).forEach((key) => {
    broadMax[key] = QUESTIONS.reduce((sum, q) => {
      const best = Math.max(...q.options.map((o) => (o.scores && o.scores[key]) || 0));
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
  const emailInput = $('email');
  const consentCheck = $('consent-check');
  const btnStart = $('btn-start');
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function refreshStartButton() {
    btnStart.disabled = !(
      nameInput.value.trim().length > 0 &&
      EMAIL_RE.test(emailInput.value.trim()) &&
      consentCheck.checked
    );
  }
  nameInput.addEventListener('input', refreshStartButton);
  emailInput.addEventListener('input', refreshStartButton);
  consentCheck.addEventListener('change', refreshStartButton);

  // If the server is configured to keep an admin copy, say so honestly.
  fetch('/api/config')
    .then((r) => r.json())
    .then((cfg) => {
      if (cfg && cfg.adminCopy) {
        $('consent-text').textContent =
          'My summary and results will be emailed to the address I entered above, and a copy of my responses is kept by the quiz administrator.';
      }
    })
    .catch(() => {});

  btnStart.addEventListener('click', () => {
    state.name = nameInput.value.trim();
    state.email = emailInput.value.trim();
    state.index = 0;
    renderQuestion(false);
    showScreen('quiz');
  });

  // ---------- Real-time analysis ----------
  function currentScores() {
    const totals = {};
    Object.keys(CATEGORIES).forEach((k) => (totals[k] = null)); // null = no signal yet
    state.selections.forEach((sel, i) => {
      const q = allQuestions[i];
      if (sel === null) return;
      if (q.type === 'kink') {
        Object.entries(q.options[sel].scores).forEach(([k, pts]) => {
          totals[k] = (totals[k] || 0) + pts;
        });
      } else if (q.type === 'spark') {
        totals[q.categoryKey] = q.options[sel].value; // 0..1 interest scale
      }
    });
    return totals;
  }

  function percentFor(key, totals) {
    const cat = CATEGORIES[key];
    if (cat.sparkPrompt) {
      return totals[key] === null ? null : Math.round(totals[key] * 100);
    }
    if (totals[key] === null) return null;
    return Math.round((totals[key] / (broadMax[key] || 1)) * 100);
  }

  function answeredCount() {
    return state.selections.filter((s) => s !== null).length;
  }

  function updateLivePanel() {
    const totals = currentScores();
    const ranked = Object.keys(CATEGORIES)
      .map((key) => ({ key, pct: percentFor(key, totals) }))
      .filter((e) => e.pct !== null)
      .sort((a, b) => b.pct - a.pct);

    const barsHost = $('live-bars');
    barsHost.innerHTML = '';
    ranked.slice(0, 8).forEach((e) => {
      const cat = CATEGORIES[e.key];
      const row = document.createElement('div');
      row.className = 'live-bar-row';
      row.innerHTML =
        '<div class="bar-label"><span>' + cat.emoji + ' ' + cat.name + '</span><span>' + e.pct + '%</span></div>' +
        '<div class="live-bar-track"><div class="live-bar-fill"></div></div>';
      barsHost.appendChild(row);
      requestAnimationFrame(() => {
        row.querySelector('.live-bar-fill').style.width = e.pct + '%';
      });
    });

    const blurb = $('live-blurb');
    const answered = answeredCount();
    if (answered === 0) {
      blurb.textContent = 'Answer a few questions and your profile will start to appear…';
      return;
    }
    const top = ranked[0] && CATEGORIES[ranked[0].key];
    const second = ranked[1] && CATEGORIES[ranked[1].key];
    if (!top || ranked[0].pct === 0) {
      blurb.textContent = 'Still listening… your profile is warming up.';
    } else if (answered < 4) {
      blurb.textContent = 'Early signs point toward ' + top.name.toLowerCase() + '… keep going, the picture is still forming.';
    } else if (second && ranked[0].pct - ranked[1].pct <= 8 && ranked[1].pct > 0) {
      blurb.textContent =
        'Interesting. A blend of ' + top.name.toLowerCase() + ' and ' + second.name.toLowerCase() +
        ' is taking shape. Versatile so far.';
    } else {
      blurb.textContent = top.emoji + ' ' + top.name + ' is emerging as a strong thread. ' + top.tagline;
    }
  }

  // ---------- Quiz rendering ----------
  const PART_TAGS = {
    kink: 'Part 1 · Your Play Style',
    spark: 'Part 2 · Spark Round',
    kinsey: 'Part 3 · Attraction & the Kinsey Scale',
  };
  const PART_HINTS = {
    kink: 'Pick the answer that feels most true',
    spark: 'Gut reaction. Your first instinct is the honest one',
    kinsey: 'Attraction, not behavior. Answer from your inner experience',
  };

  function renderQuestion(animated) {
    const body = $('question-body');
    const paint = () => {
      const q = allQuestions[state.index];

      $('section-tag').textContent = PART_TAGS[q.type];
      $('progress-count').textContent = (state.index + 1) + ' / ' + allQuestions.length;
      $('progress-fill').style.width = ((state.index / allQuestions.length) * 100) + '%';

      const sparkHeader = $('spark-header');
      if (q.type === 'spark') {
        sparkHeader.hidden = false;
        $('spark-emoji').textContent = CATEGORIES[q.categoryKey].emoji;
      } else {
        sparkHeader.hidden = true;
      }

      $('question-text').textContent = q.question;

      const host = $('options');
      host.className = 'options' + (q.type === 'spark' ? ' spark-grid' : '');
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
      $('nav-hint').textContent = PART_HINTS[q.type];
      updateLivePanel();
    };

    if (animated) {
      body.classList.remove('q-in');
      body.classList.add('q-out');
      setTimeout(() => {
        paint();
        body.classList.remove('q-out');
        body.classList.add('q-in');
      }, 200);
    } else {
      body.classList.remove('q-out');
      body.classList.add('q-in');
      paint();
    }
  }

  let advancing = false;
  function selectOption(optionIndex) {
    if (advancing) return;
    state.selections[state.index] = optionIndex;

    // Repaint just the selection highlight, then advance with animation.
    const host = $('options');
    Array.from(host.children).forEach((b, i) => b.classList.toggle('selected', i === optionIndex));
    updateLivePanel();

    advancing = true;
    setTimeout(() => {
      advancing = false;
      if (state.index < allQuestions.length - 1) {
        state.index += 1;
        renderQuestion(true);
      } else {
        beginAnalysis();
      }
    }, 340);
  }

  $('btn-back').addEventListener('click', () => {
    if (state.index > 0) {
      state.index -= 1;
      renderQuestion(true);
    }
  });

  // ---------- Full analysis ----------
  function levelFor(percent) {
    if (percent >= 60) return { level: 'Strong match', cls: '' };
    if (percent >= 35) return { level: 'Curious spark', cls: 'curious' };
    return { level: 'Not a focus right now', cls: 'low' };
  }

  function analyze() {
    const totals = currentScores();

    const kinkProfile = Object.entries(CATEGORIES)
      .map(([key, cat]) => {
        const percent = percentFor(key, totals) || 0;
        const { level, cls } = levelFor(percent);
        return { key, name: cat.emoji + ' ' + cat.name, plainName: cat.name, group: cat.group, percent, level, cls };
      })
      .sort((a, b) => b.percent - a.percent);

    // Kinsey: average the numeric answers; X wins if it's the majority.
    const kinseyStart = allQuestions.findIndex((q) => q.type === 'kinsey');
    const kinseyValues = [];
    let xCount = 0;
    KINSEY_QUESTIONS.forEach((q, i) => {
      const sel = state.selections[kinseyStart + i];
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

    const suggestions = buildSuggestions(kinkProfile);
    const summaryText = buildSummary(kinkProfile, kinsey);
    return { kinkProfile, kinsey, summaryText, suggestions };
  }

  function buildSuggestions(kinkProfile) {
    const top = kinkProfile.filter((k) => k.level !== 'Not a focus right now').slice(0, 3);
    const personal = top.map((k) => {
      const cat = CATEGORIES[k.key];
      return cat.emoji + ' For ' + cat.name.toLowerCase() + ': ' + cat.firstStep;
    });
    return personal.concat(GENERAL_SUGGESTIONS);
  }

  function buildSummary(kinkProfile, kinsey) {
    const strong = kinkProfile.filter((k) => k.level === 'Strong match');
    const curious = kinkProfile.filter((k) => k.level === 'Curious spark');
    const name = state.name;
    const lines = [];

    if (strong.length > 0) {
      const names = strong.slice(0, 5).map((k) => k.plainName.toLowerCase());
      lines.push(
        name + ', here\'s the clear picture from your answers: you\'re most strongly drawn to ' +
        joinNicely(names) +
        (strong.length > 5 ? ' (and ' + (strong.length - 5) + ' more)' : '') + '. ' +
        (strong.length > 1
          ? 'These interests tend to travel together. Think of them less as separate kinks and more as one coherent way you like to connect.'
          : 'A focused profile is genuinely useful. When you know exactly what lights you up, it gets much easier to ask for.')
      );
    } else if (curious.length > 0) {
      lines.push(
        name + ', no single kink dominates your profile, but you carry real sparks of curiosity toward ' +
        joinNicely(curious.slice(0, 5).map((k) => k.plainName.toLowerCase())) +
        '. Curiosity is where every good discovery starts. There\'s no rush.'
      );
    } else {
      lines.push(
        name + ', your answers point somewhere simple and real: connection itself is what excites you. ' +
        'The kink spectrum is wide, and "deep presence with a partner I trust" is a complete answer on it.'
      );
    }

    if (curious.length > 0 && strong.length > 0) {
      lines.push(
        'Alongside your core profile, you showed a curious spark toward ' +
        joinNicely(curious.slice(0, 6).map((k) => k.plainName.toLowerCase())) +
        (curious.length > 6 ? ', plus a few more' : '') +
        '. Worth exploring gently, at your own pace, if and when it appeals.'
      );
    }

    lines.push(
      'On attraction: you land at ' + kinsey.label.split(':')[0].replace('Kinsey', 'point') +
      ' on the Kinsey scale. ' + kinsey.description
    );

    lines.push(
      'One thing to hold onto, ' + name + ': nothing in your profile is unusual, broken, or too much. ' +
      'Every interest here is shared by millions of people, and every one is healthy when explored with consent, ' +
      'honest communication, and partners you trust. Your desires are part of who you are. Not a flaw to manage.'
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
      section: q.type === 'kink' ? 'Play Style' : q.type === 'spark' ? 'Spark Round' : 'Kinsey Scale',
      question: q.type === 'spark' ? CATEGORIES[q.categoryKey].name + ': ' + q.question : q.question,
      answer: state.selections[i] !== null ? q.options[state.selections[i]].label : '(skipped)',
    }));
  }

  function beginAnalysis() {
    showScreen('analyzing');
    const steps = [
      'Compiling your responses…',
      'Mapping your play-style profile…',
      'Charting every spark across the spectrum…',
      'Placing you on the Kinsey scale…',
      'Writing your summary…',
    ];
    let s = 0;
    const stepEl = $('analyzing-step');
    stepEl.textContent = steps[0];
    const ticker = setInterval(() => {
      s += 1;
      if (s < steps.length) {
        stepEl.style.opacity = 0;
        setTimeout(() => {
          stepEl.textContent = steps[s] || steps[steps.length - 1];
          stepEl.style.opacity = 1;
        }, 250);
      } else {
        clearInterval(ticker);
      }
    }, 620);

    const results = analyze();
    const payload = { name: state.name, email: state.email, answers: collectAnswers(), results };

    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .catch(() => ({ ok: false }))
      .then((resp) => {
        setTimeout(() => renderResults(results, resp), 3200);
      });
  }

  // ---------- Results rendering ----------
  function fullCardHtml(k) {
    const cat = CATEGORIES[k.key];
    return (
      '<div class="kink-head"><h3>' + cat.emoji + ' ' + cat.name + '</h3>' +
      '<span class="match-chip">' + k.percent + '% · ' + k.level + '</span></div>' +
      '<p class="kink-tagline">' + cat.tagline + '</p>' +
      '<div class="kink-meter"><div class="kink-meter-fill" data-w="' + k.percent + '"></div></div>' +
      '<p>' + cat.description + '</p>' +
      '<h4>What this can look like</h4>' +
      '<ul>' + cat.examples.map((e) => '<li>' + e + '</li>').join('') + '</ul>' +
      '<div class="support-note">💚 ' + cat.support + '</div>' +
      '<div class="first-step">🌱 <strong>A gentle first step:</strong> ' + cat.firstStep + '</div>'
    );
  }

  function compactCardHtml(k) {
    const cat = CATEGORIES[k.key];
    return (
      '<div class="kink-head"><h3>' + cat.emoji + ' ' + cat.name + '</h3>' +
      '<span class="match-chip">' + k.percent + '% · ' + k.level + '</span></div>' +
      '<p class="kink-tagline">' + cat.tagline + '</p>' +
      '<div class="kink-meter"><div class="kink-meter-fill" data-w="' + k.percent + '"></div></div>' +
      '<p>' + cat.description + '</p>' +
      '<div class="first-step">🌱 <strong>If curiosity ever calls:</strong> ' + cat.firstStep + '</div>'
    );
  }

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

    // Featured cards: strong in full, curious compact.
    const host = $('kink-results');
    host.innerHTML = '';
    const strong = results.kinkProfile.filter((k) => k.level === 'Strong match');
    const curious = results.kinkProfile.filter((k) => k.level === 'Curious spark');
    const featured = strong.length + curious.length > 0
      ? { strong, curious }
      : { strong: results.kinkProfile.slice(0, 3), curious: [] };

    featured.strong.forEach((k, i) => {
      const card = document.createElement('div');
      card.className = 'card glass kink-card reveal ' + k.cls;
      card.style.animationDelay = (0.1 + i * 0.08) + 's';
      card.innerHTML = fullCardHtml(k);
      host.appendChild(card);
    });
    featured.curious.forEach((k, i) => {
      const card = document.createElement('div');
      card.className = 'card glass kink-card reveal ' + k.cls;
      card.style.animationDelay = (0.1 + (featured.strong.length + i) * 0.08) + 's';
      card.innerHTML = compactCardHtml(k);
      host.appendChild(card);
    });

    // Full spectrum map, grouped.
    const mapHost = $('spectrum-map');
    mapHost.innerHTML = '';
    Object.entries(GROUPS).forEach(([groupKey, groupName]) => {
      const entries = results.kinkProfile.filter((k) => k.group === groupKey);
      if (entries.length === 0) return;
      const section = document.createElement('div');
      section.className = 'spectrum-group';
      section.innerHTML = '<h4>' + groupName + '</h4>';
      const grid = document.createElement('div');
      grid.className = 'spectrum-grid';
      entries.forEach((k) => {
        const cat = CATEGORIES[k.key];
        const item = document.createElement('div');
        item.className = 'spectrum-item';
        item.title = cat.tagline;
        item.innerHTML =
          '<div class="si-label"><span>' + cat.emoji + ' ' + cat.name + '</span>' +
          '<span class="si-pct">' + k.percent + '%</span></div>' +
          '<div class="si-track"><div class="si-fill" data-w="' + k.percent + '"></div></div>';
        grid.appendChild(item);
      });
      section.appendChild(grid);
      mapHost.appendChild(section);
    });

    // Suggestions
    const sugHost = $('suggestions-list');
    sugHost.innerHTML = '';
    results.suggestions.forEach((s) => {
      const li = document.createElement('li');
      li.textContent = s;
      sugHost.appendChild(li);
    });

    $('closing-note').textContent =
      'Getting to know yourself is a long conversation, ' + state.name +
      '. Come back whenever you like. Answers shift as you grow, and every version of your profile is worth having.';
    $('email-note').textContent = serverResp && serverResp.participantEmailSent
      ? 'A copy of your summary and results is on its way to ' + state.email + '.'
      : 'Your results are shown above. Email delivery isn\'t available right now, so consider saving this page.';

    showScreen('results');

    // Animate all meters after first paint.
    requestAnimationFrame(() => {
      setTimeout(() => {
        document.querySelectorAll('[data-w]').forEach((el) => {
          el.style.width = el.getAttribute('data-w') + '%';
        });
      }, 120);
    });
  }

  $('btn-restart').addEventListener('click', () => {
    state.index = 0;
    state.selections = new Array(allQuestions.length).fill(null);
    nameInput.value = state.name;
    emailInput.value = state.email;
    refreshStartButton();
    showScreen('intro');
  });
})();
