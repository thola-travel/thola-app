/**
 * Desire Discovery Quiz: interactive logic.
 *
 * Four parts: weighted play-style questions, a rapid-fire spark round (one
 * question per niche kink, with giving/receiving sides where they apply),
 * desire and solo-life questions, and the Kinsey scale. Answers are analyzed
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
      // Where giving/receiving are distinct sides, the "yes" answer splits
      // into doing it, receiving it, or both, so the profile records which.
      options: cat.roles
        ? [
            { label: cat.roles[0][0], value: 1, roleNote: cat.roles[0][1] },
            { label: cat.roles[1][0], value: 1, roleNote: cat.roles[1][1] },
            { label: 'Yes, both sides', value: 1, roleNote: 'Both sides of this appeal to you, depending on the day and the partner.' },
            { label: 'Curious', value: 0.55 },
            { label: 'Neutral', value: 0.15 },
            { label: 'Does not appeal', value: 0 },
          ]
        : SPARK_SCALE.map((s) => ({ label: s.label, value: s.value })),
    })),
    ...PERSONAL_QUESTIONS.map((q) => ({ ...q, type: 'personal' })),
    ...KINSEY_QUESTIONS.map((q) => ({ ...q, type: 'kinsey' })),
  ];

  const state = {
    name: '',
    email: '',
    index: 0,
    selections: new Array(allQuestions.length).fill(null),
  };

  // Follow-up asked after every full "yes" in the spark round. The answer
  // weights that category's score so rankings discriminate between a core
  // interest and a peripheral one instead of piling everything at 100%.
  const DEPTH_OPTIONS = [
    { label: 'Central. It shapes most of my fantasies or play', mult: 1 },
    { label: 'A regular feature. It comes up often', mult: 0.85 },
    { label: 'Occasional. Enjoyable when it happens, not sought out', mult: 0.65 },
    { label: 'Peripheral. It rarely surfaces on its own', mult: 0.45 },
  ];

  function depthQuestionFor(categoryKey) {
    return {
      type: 'sparkDepth',
      categoryKey,
      question: 'How central is ' + CATEGORIES[categoryKey].name.toLowerCase() + ' to your sexuality?',
      options: DEPTH_OPTIONS.map((d) => ({ label: d.label, mult: d.mult })),
    };
  }

  // Max possible weighted score per broad category (Parts 1 and 3), for
  // normalizing totals to percentages.
  const broadMax = {};
  Object.keys(CATEGORIES).forEach((key) => {
    broadMax[key] = QUESTIONS.concat(PERSONAL_QUESTIONS).reduce((sum, q) => {
      const best = Math.max(...q.options.map((o) => (o.scores && o.scores[key]) || 0));
      return sum + best;
    }, 0);
  });

  // ---------- Icons ----------
  function icon(key, cls) {
    const inner = (typeof ICONS !== 'undefined' && ICONS[key]) || '';
    return '<svg class="icon' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
  }

  function sparkValueIcon(v) {
    if (v >= 1) return icon('ui-flame');
    if (v >= 0.5) return icon('ui-eye');
    if (v > 0) return icon('ui-dash');
    return icon('ui-x');
  }

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
          'My results will be sent directly to the email address above. My responses are stored securely, and a copy is provided to the quiz administrator.';
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
    const depth = {};
    Object.keys(CATEGORIES).forEach((k) => (totals[k] = null)); // null = no signal yet
    state.selections.forEach((sel, i) => {
      const q = allQuestions[i];
      if (sel === null) return;
      if (q.type === 'kink' || q.type === 'personal') {
        Object.entries(q.options[sel].scores || {}).forEach(([k, pts]) => {
          totals[k] = (totals[k] || 0) + pts;
        });
      } else if (q.type === 'spark') {
        totals[q.categoryKey] = q.options[sel].value; // 0..1 interest scale
      } else if (q.type === 'sparkDepth') {
        depth[q.categoryKey] = q.options[sel].mult;
      }
    });
    return { totals, depth };
  }

  function percentFor(key, scores) {
    const cat = CATEGORIES[key];
    if (cat.sparkPrompt) {
      const base = scores.totals[key];
      if (base === null) return null;
      // A full yes is weighted by the centrality follow-up when answered.
      if (base === 1 && scores.depth[key] !== undefined) {
        return Math.round(100 * scores.depth[key]);
      }
      return Math.round(base * 100);
    }
    if (scores.totals[key] === null) return null;
    return Math.round((scores.totals[key] / (broadMax[key] || 1)) * 100);
  }

  function answeredCount() {
    return state.selections.filter((s) => s !== null).length;
  }

  function updateLivePanel() {
    const scores = currentScores();
    const ranked = Object.keys(CATEGORIES)
      .map((key) => ({ key, pct: percentFor(key, scores) }))
      .filter((e) => e.pct !== null)
      .sort((a, b) => b.pct - a.pct);

    const barsHost = $('live-bars');
    barsHost.innerHTML = '';
    ranked.slice(0, 8).forEach((e) => {
      const cat = CATEGORIES[e.key];
      const row = document.createElement('div');
      row.className = 'live-bar-row';
      row.innerHTML =
        '<div class="bar-label"><span>' + icon(e.key) + ' ' + cat.name + '</span><span>' + e.pct + '%</span></div>' +
        '<div class="live-bar-track"><div class="live-bar-fill"></div></div>';
      barsHost.appendChild(row);
      requestAnimationFrame(() => {
        row.querySelector('.live-bar-fill').style.width = e.pct + '%';
      });
    });

    const blurb = $('live-blurb');
    const answered = answeredCount();
    if (answered === 0) {
      blurb.textContent = 'Scores appear as responses accumulate.';
      return;
    }
    const top = ranked[0] && CATEGORIES[ranked[0].key];
    const second = ranked[1] && CATEGORIES[ranked[1].key];
    if (!top || ranked[0].pct === 0) {
      blurb.textContent = 'No clear signal yet.';
    } else if (answered < 4) {
      blurb.textContent = 'Early signal: ' + top.name.toLowerCase() + '. Sample still small.';
    } else if (second && ranked[0].pct - ranked[1].pct <= 8 && ranked[1].pct > 0) {
      blurb.textContent =
        'Current leaders: ' + top.name.toLowerCase() + ' and ' + second.name.toLowerCase() + ', closely matched.';
    } else {
      blurb.textContent = 'Strongest signal so far: ' + top.name.toLowerCase() + '.';
    }
  }

  // ---------- Quiz rendering ----------
  const PART_TAGS = {
    kink: 'Part 1 · Play Style',
    spark: 'Part 2 · Interest Inventory',
    sparkDepth: 'Part 2 · Interest Inventory',
    personal: 'Part 3 · Desire & Solo Patterns',
    kinsey: 'Part 4 · Kinsey Scale',
  };
  const PART_HINTS = {
    kink: 'Select the closest answer',
    spark: 'Answer by first instinct',
    sparkDepth: 'This weights the score for your ranking',
    personal: 'Answer privately and candidly',
    kinsey: 'Attraction, not behavior',
  };

  function renderQuestion(animated) {
    const body = $('question-body');
    const paint = () => {
      const q = allQuestions[state.index];

      $('section-tag').textContent = PART_TAGS[q.type];
      $('progress-count').textContent = (state.index + 1) + ' / ' + allQuestions.length;
      $('progress-fill').style.width = ((state.index / allQuestions.length) * 100) + '%';

      const sparkHeader = $('spark-header');
      if (q.type === 'spark' || q.type === 'sparkDepth') {
        sparkHeader.hidden = false;
        $('spark-icon').innerHTML = icon(q.categoryKey, 'icon-xl');
        $('spark-kicker-text').textContent =
          q.type === 'spark' ? 'Does this appeal to you?' : 'Follow-up';
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
        if (q.type === 'spark') {
          btn.innerHTML = sparkValueIcon(opt.value) + '<span>' + opt.label + '</span>';
        } else {
          btn.textContent = opt.label;
        }
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

    // A full "yes" on a spark question gets a centrality follow-up inserted
    // right after it; changing the answer away from "yes" removes it again.
    const q = allQuestions[state.index];
    if (q.type === 'spark') {
      const next = allQuestions[state.index + 1];
      const hasFollowUp = next && next.type === 'sparkDepth' && next.categoryKey === q.categoryKey;
      const isYes = q.options[optionIndex].value === 1;
      if (isYes && !hasFollowUp) {
        allQuestions.splice(state.index + 1, 0, depthQuestionFor(q.categoryKey));
        state.selections.splice(state.index + 1, 0, null);
      } else if (!isYes && hasFollowUp) {
        allQuestions.splice(state.index + 1, 1);
        state.selections.splice(state.index + 1, 1);
      }
    }

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
    const scores = currentScores();

    // Which side of each two-sided kink the participant chose.
    const roleChoices = {};
    allQuestions.forEach((q, i) => {
      const sel = state.selections[i];
      if (q.type !== 'spark' || sel === null) return;
      const opt = q.options[sel];
      if (opt.roleNote) {
        roleChoices[q.categoryKey] = {
          side: opt.label.replace(/^Yes, /i, ''),
          note: opt.roleNote,
        };
      }
    });

    const kinkProfile = Object.entries(CATEGORIES)
      .map(([key, cat]) => {
        const percent = percentFor(key, scores) || 0;
        const { level, cls } = levelFor(percent);
        return {
          key,
          name: cat.name,
          plainName: cat.name,
          group: cat.group,
          percent,
          level,
          cls,
          role: roleChoices[key] || null,
        };
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

    // Reflections for the turn-on / turn-off / solo-life questions.
    const aboutYou = [];
    allQuestions.forEach((q, i) => {
      const sel = state.selections[i];
      if (q.type !== 'personal' || sel === null) return;
      const opt = q.options[sel];
      if (opt.reflection) {
        aboutYou.push({ question: q.question, answer: opt.label, reflection: opt.reflection });
      }
    });

    const suggestions = buildSuggestions(kinkProfile);
    const summaryText = buildSummary(kinkProfile, kinsey);
    return { kinkProfile, kinsey, aboutYou, summaryText, suggestions };
  }

  function buildSuggestions(kinkProfile) {
    const top = kinkProfile.filter((k) => k.level !== 'Not a focus right now').slice(0, 3);
    const personal = top.map((k) => {
      const cat = CATEGORIES[k.key];
      return 'For ' + cat.name.toLowerCase() + ': ' + cat.firstStep;
    });
    return personal.concat(GENERAL_SUGGESTIONS);
  }

  function buildSummary(kinkProfile, kinsey) {
    const strong = kinkProfile.filter((k) => k.level === 'Strong match');
    const curious = kinkProfile.filter((k) => k.level === 'Curious spark');
    const name = state.name;
    const lines = [];

    const nameWithSide = (k) =>
      k.plainName.toLowerCase() + (k.role && k.role.side !== 'both sides' ? ' (' + k.role.side.toLowerCase() + ')' : '');

    if (strong.length > 0) {
      const names = strong.slice(0, 5).map(nameWithSide);
      lines.push(
        'Strongest signals: ' + joinNicely(names) +
        (strong.length > 5 ? ', with ' + (strong.length - 5) + ' further categories above the 60% threshold' : '') + '. ' +
        'Percentages combine your direct ratings, the centrality follow-ups, and response patterns across the scenario questions. ' +
        (strong.length > 1
          ? 'Several of these categories commonly co-occur; treat the cluster, not any single item, as the profile.'
          : 'A single dominant category indicates a focused preference profile.')
      );
    } else if (curious.length > 0) {
      lines.push(
        'No category crossed the strong-match threshold (60%). Moderate interest registered for ' +
        joinNicely(curious.slice(0, 5).map((k) => k.plainName.toLowerCase())) +
        '. Scores in this band typically indicate curiosity rather than an established preference.'
      );
    } else {
      lines.push(
        'No kink category registered above the interest thresholds. Your responses consistently favored connection, presence, and low-intensity ' +
        'contact, which is itself a stable and common preference profile.'
      );
    }

    if (curious.length > 0 && strong.length > 0) {
      lines.push(
        'Moderate interest (35-59%) also registered for ' +
        joinNicely(curious.slice(0, 6).map((k) => k.plainName.toLowerCase())) +
        (curious.length > 6 ? ', among others' : '') +
        '. Scores in this band usually reflect curiosity; the spectrum map below shows the complete distribution.'
      );
    }

    lines.push(
      'Orientation: your attraction responses place you at ' + kinsey.label.split(':')[0].replace('Kinsey', 'point') +
      ' on the Kinsey scale. ' + kinsey.description
    );

    lines.push(
      'For reference: population research (for example Joyal & Carpentier, 2017) finds that roughly half of adults report interest in at least one ' +
      'practice outside conventional norms. Every category measured here falls within the documented range of human sexuality when practiced with consent.'
    );

    return lines.join('\n\n');
  }

  function joinNicely(items) {
    if (items.length === 1) return items[0];
    if (items.length === 2) return items[0] + ' and ' + items[1];
    return items.slice(0, -1).join(', ') + ', and ' + items[items.length - 1];
  }

  // ---------- Submission flow ----------
  const SECTION_NAMES = {
    kink: 'Play Style',
    spark: 'Interest Inventory',
    sparkDepth: 'Interest Inventory',
    personal: 'Desire & Solo Patterns',
    kinsey: 'Kinsey Scale',
  };

  function collectAnswers() {
    return allQuestions.map((q, i) => ({
      section: SECTION_NAMES[q.type],
      question:
        q.type === 'spark' || q.type === 'sparkDepth'
          ? CATEGORIES[q.categoryKey].name + ': ' + q.question
          : q.question,
      answer: state.selections[i] !== null ? q.options[state.selections[i]].label : '(skipped)',
    }));
  }

  function beginAnalysis() {
    showScreen('analyzing');
    const steps = [
      'Compiling responses…',
      'Scoring play-style scenarios…',
      'Scoring the interest inventory…',
      'Computing Kinsey placement…',
      'Writing your report…',
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
    const payload = {
      name: state.name,
      email: state.email,
      answers: collectAnswers(),
      results,
      website: (document.getElementById('website') || { value: '' }).value,
    };

    // Results must never wait on a slow mail server: give the request a
    // hard deadline and fall back to showing results without the email.
    const abort = new AbortController();
    const deadline = setTimeout(() => abort.abort(), 30000);
    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: abort.signal,
    })
      .then((r) => r.json())
      .catch(() => ({ ok: false }))
      .then((resp) => {
        clearTimeout(deadline);
        setTimeout(() => renderResults(results, resp), 3200);
      });
  }

  // ---------- Results rendering ----------
  function cardHead(k, cat) {
    return (
      '<div class="kink-head"><h3>' + icon(k.key) + ' ' + cat.name + '</h3>' +
      '<span class="match-chip">' + k.percent + '% · ' + k.level + '</span>' +
      (k.role ? '<span class="match-chip role-chip">Your side: ' + k.role.side + '</span>' : '') +
      '</div>' +
      '<p class="kink-tagline">' + cat.tagline + '</p>' +
      (k.role ? '<p class="role-note">' + k.role.note + '</p>' : '') +
      '<div class="kink-meter"><div class="kink-meter-fill" data-w="' + k.percent + '"></div></div>'
    );
  }

  function fullCardHtml(k) {
    const cat = CATEGORIES[k.key];
    return (
      cardHead(k, cat) +
      '<p>' + cat.description + '</p>' +
      '<h4>What this can look like</h4>' +
      '<ul>' + cat.examples.map((e) => '<li>' + e + '</li>').join('') + '</ul>' +
      '<div class="support-note"><span class="note-label">Context</span>' + cat.support + '</div>' +
      '<div class="first-step"><span class="note-label">Starting point</span>' + cat.firstStep + '</div>'
    );
  }

  function compactCardHtml(k) {
    const cat = CATEGORIES[k.key];
    return (
      cardHead(k, cat) +
      '<p>' + cat.description + '</p>' +
      '<div class="first-step"><span class="note-label">Starting point</span>' + cat.firstStep + '</div>'
    );
  }

  function renderResults(results, serverResp) {
    $('results-title').textContent = 'Assessment results: ' + state.name;
    $('results-summary').textContent = results.summaryText;

    // Ranked list: top kinks first, straight down the line.
    const rankedHost = $('ranked-list');
    rankedHost.innerHTML = '';
    const ranked = results.kinkProfile.filter((k) => k.level !== 'Not a focus right now');
    const list = ranked.length > 0 ? ranked : results.kinkProfile.slice(0, 5);
    list.forEach((k, i) => {
      const li = document.createElement('li');
      li.className = 'ranked-item';
      li.innerHTML =
        '<span class="rank-num">' + (i + 1) + '</span>' +
        '<span class="rank-icon">' + icon(k.key) + '</span>' +
        '<span class="rank-name">' + k.plainName +
        (k.role && k.role.side !== 'both sides' ? '<em class="rank-side">' + k.role.side.toLowerCase() + '</em>' : '') +
        '</span>' +
        '<span class="rank-track"><span class="rank-fill" data-w="' + k.percent + '"></span></span>' +
        '<span class="rank-pct">' + k.percent + '%</span>';
      rankedHost.appendChild(li);
    });

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

    // Desire map: reflections on turn-ons, turn-offs, and solo life.
    const desireHost = $('desire-map');
    desireHost.innerHTML = '';
    (results.aboutYou || []).forEach((item) => {
      const row = document.createElement('div');
      row.className = 'desire-item';
      const answerEl = document.createElement('p');
      answerEl.className = 'desire-answer';
      answerEl.textContent = item.answer;
      const reflectionEl = document.createElement('p');
      reflectionEl.className = 'desire-reflection';
      reflectionEl.textContent = item.reflection;
      row.appendChild(answerEl);
      row.appendChild(reflectionEl);
      desireHost.appendChild(row);
    });
    $('desire-card').style.display = (results.aboutYou || []).length > 0 ? '' : 'none';

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
          '<div class="si-label"><span>' + icon(k.key) + ' ' + cat.name +
          (k.role && k.role.side !== 'both sides' ? '<em class="si-role"> · ' + k.role.side.toLowerCase() + '</em>' : '') +
          '</span><span class="si-pct">' + k.percent + '%</span></div>' +
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
      'Preference profiles shift with time and context. Retaking the assessment at intervals shows how yours changes; the differences between runs are themselves informative.';
    const emailNote = $('email-note');
    if (serverResp && serverResp.participantEmailSent && serverResp.testMode && serverResp.previewUrl) {
      emailNote.innerHTML =
        'Test mode: the email was captured instead of delivered. ' +
        '<a href="' + serverResp.previewUrl.replace(/"/g, '&quot;') + '" target="_blank" rel="noopener">Open the exact email here</a>.';
    } else if (serverResp && serverResp.participantEmailSent) {
      emailNote.textContent = 'Your report has been sent directly to ' + state.email + '. It is not shared with anyone else.';
    } else {
      emailNote.textContent = 'Email delivery is currently unavailable. Your results are shown above; consider saving this page.';
    }

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
