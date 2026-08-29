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
    ...DIMENSION_STATEMENTS.map((s) => ({
      type: 'likert',
      id: s.id,
      dim: s.dim,
      reverse: s.reverse,
      question: s.text,
      options: LIKERT_OPTIONS.map((o) => ({ label: o.label, v: o.v })),
    })),
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
    ...TEXT_QUESTIONS.map((q) => ({ ...q, type: 'text' })),
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
  // normalizing totals to percentages. Single-choice questions contribute
  // their best option; select-all questions contribute the sum across
  // options, since every applicable option can be chosen.
  const broadMax = {};
  Object.keys(CATEGORIES).forEach((key) => {
    broadMax[key] = QUESTIONS.concat(PERSONAL_QUESTIONS).reduce((sum, q) => {
      const perOption = q.options.map((o) => (o.scores && o.scores[key]) || 0);
      return sum + (q.multi ? perOption.reduce((a, b) => a + b, 0) : Math.max(...perOption));
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
  const REDUCED_MOTION =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Count a percentage element up from zero; paints the final value at once
  // when the visitor prefers reduced motion.
  function animateCount(el, to, ms) {
    if (REDUCED_MOTION) { el.textContent = to + '%'; return; }
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / ms);
      el.textContent = Math.round(to * (1 - Math.pow(1 - t, 3))) + '%';
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
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
        const picks = Array.isArray(sel) ? sel : [sel];
        picks.forEach((p) => {
          Object.entries((q.options[p] && q.options[p].scores) || {}).forEach(([k, pts]) => {
            totals[k] = (totals[k] || 0) + pts;
          });
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
    likert: 'Part 1 · How You Relate to Sex',
    kink: 'Part 2 · Play Style',
    spark: 'Part 3 · Interest Inventory',
    sparkDepth: 'Part 3 · Interest Inventory',
    personal: 'Part 4 · Desire & Solo Patterns',
    text: 'Part 5 · In Your Words',
    kinsey: 'Part 6 · Attraction',
  };
  const PART_HINTS = {
    likert: 'Rate your agreement with the statement',
    kink: 'Select the closest answer',
    spark: 'Answer by first instinct',
    sparkDepth: 'This weights the score for your ranking',
    personal: 'Answer privately and candidly',
    text: 'Optional. Analyzed by keyword and phrase matching, and stored with your responses',
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

      if (q.multi && (q.type === 'kink' || q.type === 'personal')) {
        // Select-all-that-apply: options toggle; Continue advances.
        const current = new Set(Array.isArray(state.selections[state.index]) ? state.selections[state.index] : []);
        const buttons = [];
        const cont = document.createElement('button');
        cont.type = 'button';
        cont.className = 'btn primary';
        cont.textContent = 'Continue';
        const sync = () => {
          buttons.forEach((b, i) => b.classList.toggle('selected', current.has(i)));
          cont.disabled = current.size === 0;
        };
        q.options.forEach((opt, i) => {
          const btn = document.createElement('button');
          btn.className = 'option multi-option';
          btn.type = 'button';
          btn.innerHTML = '<span class="check-box" aria-hidden="true"></span><span>' + opt.label + '</span>';
          btn.addEventListener('click', () => {
            if (current.has(i)) {
              current.delete(i);
            } else if (opt.exclusive) {
              current.clear();
              current.add(i);
            } else {
              q.options.forEach((o, j) => { if (o.exclusive) current.delete(j); });
              current.add(i);
            }
            sync();
            state.selections[state.index] = current.size > 0 ? [...current].sort((a, b) => a - b) : null;
            updateLivePanel();
          });
          buttons.push(btn);
          host.appendChild(btn);
        });
        const row = document.createElement('div');
        row.className = 'text-actions';
        cont.addEventListener('click', () => {
          if (current.size === 0) return;
          state.selections[state.index] = [...current].sort((a, b) => a - b);
          if (state.index < allQuestions.length - 1) {
            state.index += 1;
            renderQuestion(true);
          } else {
            beginAnalysis();
          }
        });
        row.appendChild(cont);
        host.appendChild(row);
        sync();
      } else if (q.type === 'text') {
        const area = document.createElement('textarea');
        area.className = 'text-answer';
        area.rows = 6;
        area.maxLength = 2000;
        area.placeholder = q.placeholder || '';
        area.value = typeof state.selections[state.index] === 'string' ? state.selections[state.index] : '';
        const row = document.createElement('div');
        row.className = 'text-actions';
        const cont = document.createElement('button');
        cont.type = 'button';
        cont.className = 'btn primary';
        cont.textContent = 'Continue';
        const skip = document.createElement('button');
        skip.type = 'button';
        skip.className = 'btn ghost';
        skip.textContent = 'Skip';
        const store = (value) => {
          state.selections[state.index] = value;
          if (state.index < allQuestions.length - 1) {
            state.index += 1;
            renderQuestion(true);
          } else {
            beginAnalysis();
          }
        };
        cont.addEventListener('click', () => store(area.value.trim().slice(0, 2000)));
        skip.addEventListener('click', () => store(''));
        row.appendChild(cont);
        row.appendChild(skip);
        host.appendChild(area);
        host.appendChild(row);
        area.focus();
      } else {
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
      }

      $('btn-back').style.visibility = state.index === 0 ? 'hidden' : 'visible';
      $('nav-hint').textContent = q.multi
        ? 'Select every answer that applies, then Continue'
        : PART_HINTS[q.type];
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

  // ---------- Open-response analysis ----------
  /**
   * Keyword and phrase matching against the category lexicon. Multi-word
   * terms match as phrases; single words require a left word boundary
   * (stems are allowed to extend right). A match preceded within four
   * words by a negation term is excluded.
   */
  function analyzeText(fullText) {
    const text = ' ' + fullText.toLowerCase().replace(/\s+/g, ' ') + ' ';
    const wordish = /[a-z0-9]/;
    const themes = [];
    Object.entries(KEYWORDS).forEach(([key, terms]) => {
      const found = [];
      terms.forEach((term) => {
        const t = term.toLowerCase();
        let idx = 0;
        while ((idx = text.indexOf(t, idx)) !== -1) {
          const beforeChar = text[idx - 1];
          if (beforeChar && wordish.test(beforeChar)) {
            idx += t.length;
            continue;
          }
          const beforeWords = text
            .slice(Math.max(0, idx - 44), idx)
            .trim()
            .split(' ')
            .slice(-4)
            .map((w) => w.replace(/[^a-z']/g, ''));
          const negated = beforeWords.some((w) => NEGATION_TERMS.includes(w));
          if (!negated) {
            found.push(term.trim());
            break;
          }
          idx += t.length;
        }
      });
      if (found.length > 0) {
        themes.push({ key, name: CATEGORIES[key].name, terms: [...new Set(found)] });
      }
    });
    return themes;
  }

  function collectTextResponses() {
    const parts = [];
    allQuestions.forEach((q, i) => {
      const sel = state.selections[i];
      if (q.type === 'text' && typeof sel === 'string' && sel.trim() !== '') {
        parts.push(sel);
      }
    });
    return parts;
  }

  // ---------- Dimension scoring ----------
  /**
   * Each unipolar dimension is the average of one forward and one reversed
   * item, scaled to 0-100. Power is bipolar: dominant minus submissive
   * agreement, scaled to -100..100.
   */
  function computeDimensions() {
    const raw = {};
    allQuestions.forEach((q, i) => {
      const sel = state.selections[i];
      if (q.type !== 'likert' || sel === null) return;
      const v = q.options[sel].v; // 0..4
      raw[q.id] = q.reverse ? 4 - v : v;
    });
    const pair = (f, r) => {
      const a = raw[f] !== undefined ? raw[f] : 2;
      const b = raw[r] !== undefined ? raw[r] : 2;
      return Math.round(((a + b) / 8) * 100);
    };
    const dom = raw.dim_pow_dom !== undefined ? raw.dim_pow_dom : 2;
    const sub = raw.dim_pow_sub !== undefined ? raw.dim_pow_sub : 2;
    return {
      drive: pair('dim_drive_f', 'dim_drive_r'),
      adventure: pair('dim_adv_f', 'dim_adv_r'),
      connection: pair('dim_conn_f', 'dim_conn_r'),
      intensity: pair('dim_int_f', 'dim_int_r'),
      powerLean: Math.round(((dom - sub) / 4) * 100),
      domScore: Math.round((dom / 4) * 100),
      subScore: Math.round((sub / 4) * 100),
    };
  }

  function personaLine(dims, kinkProfile) {
    const parts = [];
    parts.push(dims.drive >= 65 ? 'High-drive' : dims.drive >= 35 ? 'Moderate-drive' : 'Low-drive');
    if (dims.adventure >= 65) parts.push('exploratory');
    else if (dims.adventure < 35) parts.push('selective');
    parts.push(dims.powerLean > 25 ? 'dominant-leaning' : dims.powerLean < -25 ? 'submissive-leaning' : 'switch-balanced');
    const featured = kinkProfile.filter((k) => k.level !== 'Not a focus right now');
    let centre = '';
    if (featured.length > 0) {
      const groupTallies = {};
      featured.slice(0, 8).forEach((k) => {
        groupTallies[k.group] = (groupTallies[k.group] || 0) + k.percent;
      });
      const topGroup = Object.entries(groupTallies).sort((a, b) => b[1] - a[1])[0][0];
      centre = ', centered on ' + GROUPS[topGroup].toLowerCase();
    }
    return parts.join(', ') + ' profile' + centre + '.';
  }

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

    // Open-response analysis: themes weight into the category scores.
    const textParts = collectTextResponses();
    const textThemes = textParts.length > 0 ? analyzeText(textParts.join('\n')) : [];
    const themeKeys = new Set(textThemes.map((t) => t.key));

    const kinkProfile = Object.entries(CATEGORIES)
      .map(([key, cat]) => {
        let percent = percentFor(key, scores) || 0;
        const textSignal = themeKeys.has(key);
        if (textSignal) {
          // A positive written mention adds weight and sets a floor.
          percent = Math.min(100, Math.max(percent + 15, 40));
        }
        const { level, cls } = levelFor(percent);
        return {
          key,
          name: cat.name,
          plainName: cat.name,
          group: cat.group,
          percent,
          level,
          cls,
          textSignal,
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

    // Reflections for the turn-on / turn-off / solo-life questions. A
    // select-all question yields one reflection per selected option.
    const aboutYou = [];
    allQuestions.forEach((q, i) => {
      const sel = state.selections[i];
      if (q.type !== 'personal' || sel === null) return;
      const picks = Array.isArray(sel) ? sel : [sel];
      picks.forEach((p) => {
        const opt = q.options[p];
        if (opt && opt.reflection) {
          aboutYou.push({ question: q.question, answer: opt.label, reflection: opt.reflection });
        }
      });
    });

    const dimensions = computeDimensions();
    const persona = personaLine(dimensions, kinkProfile);
    const suggestions = buildSuggestions(kinkProfile);
    const summaryText = 'Profile overview: ' + persona + '\n\n' + buildSummary(kinkProfile, kinsey, textThemes);
    return { kinkProfile, kinsey, aboutYou, textThemes, dimensions, persona, summaryText, suggestions };
  }

  function buildSuggestions(kinkProfile) {
    const top = kinkProfile.filter((k) => k.level !== 'Not a focus right now').slice(0, 3);
    const personal = top.map((k) => {
      const cat = CATEGORIES[k.key];
      return 'For ' + cat.name.toLowerCase() + ': ' + cat.firstStep;
    });
    return personal.concat(GENERAL_SUGGESTIONS);
  }

  function buildSummary(kinkProfile, kinsey, textThemes) {
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

    if (textThemes && textThemes.length > 0) {
      lines.push(
        'Your written responses were analyzed by keyword and phrase matching and contained identifiable themes matching ' +
        joinNicely(textThemes.slice(0, 6).map((t) => t.name.toLowerCase())) +
        (textThemes.length > 6 ? ', among others' : '') +
        '. These matches are weighted into the ranked scores above.'
      );
    }

    lines.push(
      'Orientation: your attraction responses place you at ' + kinsey.label.split(':')[0].replace('Kinsey', 'point') +
      ' on the Kinsey scale, explained in the orientation section below. ' + kinsey.description
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
    likert: 'How You Relate to Sex',
    kink: 'Play Style',
    spark: 'Interest Inventory',
    sparkDepth: 'Interest Inventory',
    personal: 'Desire & Solo Patterns',
    text: 'Open Response',
    kinsey: 'Attraction',
  };

  function collectAnswers() {
    return allQuestions.map((q, i) => {
      const sel = state.selections[i];
      let answer;
      if (q.type === 'text') {
        answer = typeof sel === 'string' && sel.trim() !== '' ? sel : '(no response)';
      } else if (Array.isArray(sel)) {
        answer = sel.map((p) => q.options[p].label).join('; ');
      } else {
        answer = sel !== null ? q.options[sel].label : '(skipped)';
      }
      return {
        section: SECTION_NAMES[q.type],
        question:
          q.type === 'spark' || q.type === 'sparkDepth'
            ? CATEGORIES[q.categoryKey].name + ': ' + q.question
            : q.question,
        answer,
      };
    });
  }

  function beginAnalysis() {
    showScreen('analyzing');
    const steps = [
      'Compiling responses',
      'Scoring profile dimensions',
      'Scoring the interest inventory',
      'Analyzing written responses',
      'Computing attraction placement',
      'Writing your report',
    ];
    const host = $('analysis-steps');
    host.innerHTML = '';
    const rows = steps.map((label) => {
      const row = document.createElement('div');
      row.className = 'analysis-step';
      row.innerHTML =
        '<span class="as-dot"><svg class="as-check" viewBox="0 0 16 16"><path d="M2.5 8.5l3.5 3.5 7-8"/></svg></span>' +
        '<span>' + label + '</span>';
      host.appendChild(row);
      return row;
    });

    // Progress ring: eases toward 92% while the submission is in flight,
    // then closes to 100% once the server has answered. Step rows flip from
    // pending to active to done as the displayed progress crosses them.
    const ringFill = $('ring-fill');
    const ringCount = $('ring-count');
    const calcSub = $('calc-sub');
    const CIRC = 327; // stroke-dasharray set in the stylesheet
    let shown = 0;
    let announced = -1;
    function paint(p) {
      shown = p;
      ringFill.style.strokeDashoffset = String(CIRC * (1 - p / 100));
      ringCount.textContent = Math.round(p) + '%';
      const span = 100 / rows.length;
      rows.forEach((row, i) => {
        const done = p >= (i + 1) * span - 0.5;
        row.classList.toggle('done', done);
        row.classList.toggle('active', !done && p >= i * span);
      });
      // Mirror the active step into the status line; it is a live region,
      // so progress is announced to screen readers (the ring is aria-hidden).
      const stepIdx = p >= 100 ? rows.length : Math.min(rows.length - 1, Math.floor(p / span));
      if (stepIdx !== announced) {
        announced = stepIdx;
        calcSub.textContent = stepIdx >= rows.length ? 'Report ready.' : steps[stepIdx] + '.';
      }
    }
    let closing = false;
    const t0 = performance.now();
    function drift(now) {
      if (closing) return;
      const t = Math.min(1, (now - t0) / 3400);
      paint(Math.max(shown, 92 * (1 - Math.pow(1 - t, 2.2))));
      requestAnimationFrame(drift);
    }
    function completeRing(cb) {
      closing = true;
      if (REDUCED_MOTION) { paint(100); setTimeout(cb, 200); return; }
      const from = shown;
      const c0 = performance.now();
      function closer(now) {
        const t = Math.min(1, (now - c0) / 450);
        paint(from + (100 - from) * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(closer);
        else setTimeout(cb, 350);
      }
      requestAnimationFrame(closer);
    }
    if (REDUCED_MOTION) paint(92);
    else requestAnimationFrame(drift);

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
        const minWait = REDUCED_MOTION ? 300 : Math.max(0, 3400 - (performance.now() - t0));
        setTimeout(() => completeRing(() => renderResults(results, resp)), minWait);
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
    // Completion confirmation, driven by the server's actual delivery state.
    const thanksText = $('thanks-text');
    if (serverResp && serverResp.participantEmailSent && serverResp.testMode && serverResp.previewUrl) {
      thanksText.innerHTML =
        'Your responses have been recorded. Test mode is active, so the report email was captured instead of delivered: ' +
        '<a href="' + serverResp.previewUrl.replace(/"/g, '&quot;') + '" target="_blank" rel="noopener">open the exact email here</a>.';
    } else if (serverResp && serverResp.participantEmailSent) {
      thanksText.textContent =
        'Your responses have been recorded and your full report is being sent to ' + state.email +
        '. It is sent only to that address. Your results are also shown below.';
    } else {
      thanksText.textContent =
        'Your responses have been recorded. Email delivery is currently unavailable, so save this page; your full results are shown below.';
    }

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
        '<span class="rank-pct" data-count="' + k.percent + '">0%</span>';
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

    // Profile dimensions.
    const dims = results.dimensions;
    const dimHost = $('dimension-bars');
    dimHost.innerHTML = '';
    [
      ['drive', dims.drive],
      ['adventure', dims.adventure],
      ['connection', dims.connection],
      ['intensity', dims.intensity],
    ].forEach(([key, value]) => {
      const meta = DIMENSIONS_META[key];
      const row = document.createElement('div');
      row.className = 'dim-row';
      row.innerHTML =
        '<div class="dim-head"><span class="dim-name">' + meta.name + '</span><span class="dim-value" data-count="' + value + '">0%</span></div>' +
        '<div class="dim-track"><div class="dim-fill" data-w="' + value + '"></div></div>' +
        '<p class="dim-desc">' + meta.description + '</p>';
      dimHost.appendChild(row);
    });
    // Power lean: bipolar.
    const lean = dims.powerLean;
    const marker = Math.max(2, Math.min(98, (lean + 100) / 2));
    const leanRow = document.createElement('div');
    leanRow.className = 'dim-row';
    leanRow.innerHTML =
      '<div class="dim-head"><span class="dim-name">' + DIMENSIONS_META.power.name + '</span><span class="dim-value">' +
      (lean > 25 ? 'dominant ' + lean : lean < -25 ? 'submissive ' + Math.abs(lean) : 'balanced') + '</span></div>' +
      '<div class="dim-bipolar"><span class="dim-pole">Surrendering</span>' +
      '<div class="dim-bitrack"><div class="dim-marker"></div></div>' +
      '<span class="dim-pole">Directing</span></div>' +
      '<p class="dim-desc">' + DIMENSIONS_META.power.description + '</p>';
    dimHost.appendChild(leanRow);
    leanRow.querySelector('.dim-marker').style.left = marker + '%';

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

    // Written response themes.
    const themesHost = $('text-themes');
    themesHost.innerHTML = '';
    (results.textThemes || []).forEach((t) => {
      const row = document.createElement('div');
      row.className = 'theme-item';
      row.innerHTML =
        '<span class="theme-name">' + icon(t.key) + ' ' + t.name + '</span>' +
        '<span class="theme-terms">matched: ' + t.terms.map((x) => '&ldquo;' + x + '&rdquo;').join(', ') + '</span>';
      themesHost.appendChild(row);
    });
    $('text-card').style.display = (results.textThemes || []).length > 0 ? '' : 'none';

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
      card.className = 'card kink-card reveal ' + k.cls;
      card.style.animationDelay = (0.1 + i * 0.08) + 's';
      card.innerHTML = fullCardHtml(k);
      host.appendChild(card);
    });
    featured.curious.forEach((k, i) => {
      const card = document.createElement('div');
      card.className = 'card kink-card reveal ' + k.cls;
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

    // Animate all meters and percentage counters after first paint.
    requestAnimationFrame(() => {
      setTimeout(() => {
        document.querySelectorAll('[data-w]').forEach((el) => {
          el.style.width = el.getAttribute('data-w') + '%';
        });
        document.querySelectorAll('[data-count]').forEach((el) => {
          animateCount(el, parseInt(el.getAttribute('data-count'), 10) || 0, 900);
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
