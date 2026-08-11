/**
 * Desire Discovery Quiz — content and scoring database.
 *
 * Two kinds of categories:
 *  - Broad categories: scored from the weighted Part 1 questions.
 *  - Spark categories: each has its own rapid-fire question in Part 2
 *    (sparkPrompt), answered on a 4-point interest scale.
 *
 * Every entry carries: group, name, emoji, tagline, description, examples,
 * a supportive note, and a gentle "first step" suggestion. This file is also
 * require()'d by the server to build the participant's results email.
 */

const GROUPS = {
  power: 'Power & Control',
  bondage: 'Bondage & Sensation',
  imagination: 'Roleplay & Imagination',
  seen: 'Seen & Shared',
  fetish: 'Fetish & Body',
  mind: 'Voice & Mind',
  connection: 'Connection',
};

const SPARK_SCALE = [
  { label: '🔥 Yes please', value: 1 },
  { label: '👀 Curious…', value: 0.55 },
  { label: '😐 Take it or leave it', value: 0.15 },
  { label: '🙅 Not for me', value: 0 },
];

const CATEGORIES = {
  /* ==================== BROAD (scored from Part 1) ==================== */

  dominance: {
    group: 'power',
    name: 'Dominance',
    emoji: '👑',
    tagline: 'You enjoy taking the lead.',
    description:
      'Dominance is confidently guiding an experience — setting the pace, making decisions, and taking care of a partner who has chosen to follow your lead. At its heart it is attentiveness and responsibility, not control for its own sake.',
    examples: [
      'Planning an evening and lovingly telling your partner exactly how it will go',
      'Giving clear, confident directions during intimacy',
      'Light "rules" or tasks agreed on together, with you setting them',
      'Aftercare — checking in and caring for your partner once play ends',
    ],
    support:
      'Enjoying being in charge is one of the most common dynamics there is. Great dominants are defined by consent, communication, and care — wanting that role says you like to give as much as you like to lead.',
    firstStep:
      'Plan one evening start to finish and narrate it to your partner in a warm, confident voice — then debrief together afterward about what landed.',
  },
  submission: {
    group: 'power',
    name: 'Submission',
    emoji: '🕊️',
    tagline: 'You find freedom in letting go.',
    description:
      'Submission is the joy of handing the reins to someone you trust — releasing decisions, pressure, and control so you can sink fully into the experience. Many describe it as deeply relaxing, even meditative.',
    examples: [
      'Letting a partner plan and direct an intimate evening from start to finish',
      'Following playful instructions or agreed-upon "rules"',
      'Enjoying being "told what to do" within limits you set together',
      'The comfort of structure: rituals, titles, or routines you\'ve both chosen',
    ],
    support:
      'Submission is chosen, negotiated, and revocable at any time — which makes it a position of real power. Wanting to let go speaks to a capacity for trust many people envy.',
    firstStep:
      'Hand over one small decision on purpose — what you wear, what happens first — and notice how it feels to simply follow.',
  },
  bondage: {
    group: 'bondage',
    name: 'Bondage & Restraint',
    emoji: '🪢',
    tagline: 'Restraint heightens sensation and trust.',
    description:
      'Bondage covers everything from a partner gently holding your wrists to soft cuffs and scarves. Being restrained (or doing the restraining) heightens anticipation, focuses sensation, and creates a powerful feeling of trust.',
    examples: [
      'A partner pinning your hands above your head',
      'Soft cuffs, silk scarves, or a sleep mask',
      'Slowly building how much restraint you use as trust grows',
      'Agreeing on a signal so restraint ends the moment anyone wants it to',
    ],
    support:
      'Bondage consistently ranks among the most common fantasies in the world. Practiced with communication and a quick-release mindset, it\'s a beautiful blend of trust and sensation.',
    firstStep:
      'Start with a silk scarf or soft velcro cuffs, agree on a release word first, and keep the first session short and sweet.',
  },
  sensation: {
    group: 'bondage',
    name: 'Sensation Play',
    emoji: '✨',
    tagline: 'Your body loves contrast and intensity.',
    description:
      'Sensation play explores touch across the whole spectrum — soft to sharp, warm to cool, feather-light to firm — always tuned to exactly the intensity you enjoy.',
    examples: [
      'A firm massage that melts into teasing, feather-light touch',
      'Textures: silk, fur, fingertips, fingernails',
      'Building intensity gradually and checking in about what feels best',
      'Alternating contrast — soft then firm, slow then sudden',
    ],
    support:
      'Bodies are wired for novelty — enjoying intense or contrasting sensation is simple neuroscience, not strangeness. You define the dial.',
    firstStep:
      'Try a "sensation menu" night: five different touches, eyes closed, rating each one together afterward.',
  },
  roleplay: {
    group: 'imagination',
    name: 'Roleplay & Scenarios',
    emoji: '🎭',
    tagline: 'Imagination is your playground.',
    description:
      'Roleplay lets you step into a story — new characters, scenarios, and dynamics that free you from everyday roles. It can be elaborate or as simple as "let\'s pretend we just met."',
    examples: [
      'Meeting your long-term partner at a bar and pretending to be strangers',
      'Classic scenarios: royalty and loyal subject, strangers on a train',
      'Costumes, accents, or just a shift in attitude',
      'Sharing fantasies out loud and picking one to act out',
    ],
    support:
      'A rich fantasy life is a sign of creativity, and roleplay is collaborative storytelling with someone you trust. Almost everyone fantasizes — acting it out just gives those stories a stage.',
    firstStep:
      'Text each other one scenario you\'d each enjoy, then try the milder one with zero pressure to be "good actors" — laughing counts as success.',
  },
  exhibition: {
    group: 'seen',
    name: 'Exhibitionism',
    emoji: '🔥',
    tagline: 'Being seen and desired thrills you.',
    description:
      'Exhibitionism is the erotic charge of being watched and admired — always by people who want to be watching. It ranges from loving how a partner watches you undress to putting on a full private show.',
    examples: [
      'Dancing or undressing slowly while your partner watches',
      'Making deliberate eye contact while you have their full attention',
      'A mirror placed just right',
      'Dressing up knowing exactly the effect it will have',
    ],
    support:
      'Wanting to be desired is profoundly human. Between consenting adults in private, showing off is a celebrated and very common source of excitement.',
    firstStep:
      'Try a slow, well-lit reveal for a partner\'s eyes only — you control the pace, they control the applause.',
  },
  voyeurism: {
    group: 'seen',
    name: 'Voyeurism',
    emoji: '👁️',
    tagline: 'Watching is its own electricity.',
    description:
      'Voyeurism — in its healthy, consensual form — is the thrill of watching a partner who loves being watched: them undressing, touching, enjoying themselves, knowing your eyes are on them.',
    examples: [
      'Asking your partner to undress slowly while you stay across the room',
      'Watching your partner enjoy themselves',
      'The "look but don\'t touch" game — hands off until you can\'t stand it',
      'Watching together in a mirror',
    ],
    support:
      'Desire begins with the eyes for a huge share of people. Consensual watching — where being seen is the point — is a completely healthy way to build heat.',
    firstStep:
      'Ask your partner if you can simply watch for five minutes — no touching — and tell them afterward exactly what you loved seeing.',
  },
  praise: {
    group: 'mind',
    name: 'Praise & Worship',
    emoji: '💖',
    tagline: 'Words and adoration light you up.',
    description:
      'Praise kink is the deep pleasure of being verbally affirmed — "you\'re doing so well," "you\'re gorgeous" — or of showering a partner with adoration. It weaves emotional warmth directly into physical intimacy.',
    examples: [
      'A partner whispering how well you\'re doing',
      'Being told exactly what your partner loves about you, in detail',
      'Slow, reverent attention — treating a partner like a work of art',
      'Affirming words as part of aftercare',
    ],
    support:
      'Responding to praise means affirmation genuinely nourishes you — that\'s emotional attunement, not neediness. This is one of the gentlest, most connecting kinks there is.',
    firstStep:
      'Tell your partner three specific things you love watching them do, and ask which words they\'d most love to hear from you.',
  },
  sensual: {
    group: 'connection',
    name: 'Sensual & Romantic Connection',
    emoji: '🌹',
    tagline: 'Depth, tenderness, and presence are your language.',
    description:
      'Your strongest pull is toward deep presence: eye contact, slow touch, emotional closeness, and romance. Sometimes called "vanilla," this is its own rich flavor — and many people\'s absolute favorite.',
    examples: [
      'Long, slow evenings with no agenda but each other',
      'Massage, candlelight, music, and unhurried touch',
      'Deep eye contact and staying emotionally present',
      'Building anticipation over a whole day of small gestures',
    ],
    support:
      'There is nothing "plain" about vanilla — tenderness and presence are a complete erotic language of their own, and knowing connection is what moves you is as real a discovery as any kink.',
    firstStep:
      'Plan one unhurried evening with phones in another room — the only goal is presence, and everything else is a bonus.',
  },

  /* ==================== SPARK: Power & Control ==================== */

  switchplay: {
    group: 'power',
    name: 'Switching',
    emoji: '🔄',
    tagline: 'You want both sides of the coin.',
    sparkPrompt: 'Trading roles — confidently leading one night, happily surrendering the next.',
    description:
      'Switches move fluidly between dominant and submissive energy depending on mood, partner, and moment. It\'s not indecision — it\'s range.',
    examples: [
      'Leading tonight, following next weekend',
      'Trading who\'s "in charge" mid-evening with a laugh',
      'Matching your role to your partner\'s energy',
      'Coin-flip nights where chance decides who leads',
    ],
    support:
      'Many experienced kinksters identify as switches. Fluency in both roles often makes people more empathetic, creative partners on either side.',
    firstStep:
      'Try a "flip night": one of you leads until a timer goes off, then you trade — and compare notes after.',
  },
  bratplay: {
    group: 'power',
    name: 'Brat & Tamer Play',
    emoji: '😈',
    tagline: 'Playful defiance is your love language.',
    sparkPrompt: 'Playful defiance — teasing, breaking the "rules" on purpose, and being lovingly put back in line (or doing the taming).',
    description:
      'Brat play is power exchange with a wink: one partner cheekily resists, teases, and provokes, and the other rises to the challenge. The "misbehavior" is the game, and both sides are in on it.',
    examples: [
      'Sassy backtalk designed to earn a (pre-agreed) consequence',
      '"Make me" as an invitation, not a refusal',
      'The tamer keeping a mock-stern face while clearly delighted',
      'Negotiated "punishments" that are really rewards',
    ],
    support:
      'Bratting is beloved because it keeps power exchange light and funny. Wanting to poke the bear — or be the bear — is playfulness, and playfulness is intimacy.',
    firstStep:
      'Agree on one silly "rule," one playful consequence, and a safeword — then see who breaks first.',
  },
  discipline: {
    group: 'power',
    name: 'Rules, Rituals & Discipline',
    emoji: '📜',
    tagline: 'Structure itself is the thrill.',
    sparkPrompt: 'Ongoing structure in a dynamic — agreed rules, daily tasks, titles or honorifics, and playful consequences.',
    description:
      'For some, the erotic charge lives in the structure: rules to follow or set, rituals that mark the dynamic, tasks and titles, and consequences both partners chose in advance. Related niches include protocol dynamics and even financial domination (consensual, budgeted "tributes").',
    examples: [
      'A morning check-in text required by "the rules"',
      'Titles or honorifics used only in private',
      'Task lists with playful rewards and consequences',
      'Formal negotiation of what the dynamic includes — itself part of the fun',
    ],
    support:
      'Structure creates safety, and safety creates freedom. People who love rules-based dynamics often say the clarity is the most relaxing part of their relationship.',
    firstStep:
      'Draft one rule together that you\'d both enjoy for a single week — then review it like co-authors, keeping only what delighted you.',
  },
  primal: {
    group: 'power',
    name: 'Primal Play',
    emoji: '🐺',
    tagline: 'Instinct over etiquette.',
    sparkPrompt: 'Raw, instinctive energy — chasing, wrestling, growling, pinning. Less talking, more instinct.',
    description:
      'Primal play strips intimacy down to animal instinct: chase and capture, wrestling for the upper hand, growls instead of sentences. It\'s athletic, cathartic, and surprisingly freeing.',
    examples: [
      'A playful chase from one room to another',
      'Wrestling where the "winner" sets the pace',
      'Growling, snarling, or wordless vocal play',
      'Hunter-and-prey dynamics negotiated in advance',
    ],
    support:
      'We are, underneath it all, animals — and letting that side breathe in a safe container is healthy release, not regression. Primal players describe it as the most honest play there is.',
    firstStep:
      'Try a sixty-second pillow-soft wrestling match with a clear stop word — whoever ends up on top leads what happens next.',
  },
  cnc: {
    group: 'power',
    name: 'Consensual Non-Consent',
    emoji: '🎬',
    tagline: 'Scripted surrender, absolute trust.',
    sparkPrompt: 'Carefully pre-scripted "resistance" scenes — planned together in detail beforehand, where a safeword ends everything instantly.',
    description:
      'CNC is advanced roleplay in which partners script a scene of pretend resistance in advance — every boundary discussed beforehand, a safeword or signal that stops everything instantly, and thorough aftercare when it ends. The paradox is the point: it only works because consent is total.',
    examples: [
      'A detailed negotiation conversation before anything happens — the real first step',
      'A scripted scenario with agreed limits and off-limits words or acts',
      'A safeword plus a non-verbal signal, tested before play',
      'Generous aftercare and a debrief every single time',
    ],
    support:
      'Surrender fantasies are among the most commonly reported fantasies in sexuality research — having one says nothing negative about you. Acted out, CNC demands the most communication of any kink, which is why experienced players call it a masterclass in trust.',
    firstStep:
      'Long before any scene, simply talk about the fantasy in past tense ("what would have happened is…") — many couples find the conversation alone is electric.',
  },
  petplay: {
    group: 'power',
    name: 'Pet Play',
    emoji: '🐾',
    tagline: 'A collar can be a key to a freer headspace.',
    sparkPrompt: 'Stepping into an animal persona — kitten, puppy, pony — with collars, headspace, and a doting handler.',
    description:
      'Pet play lets one partner slip into an animal persona — playful puppy, aloof kitten, proud pony — while the other cares for, trains, or dotes on them. For many it\'s less about the accessories and more about the simple, wordless headspace.',
    examples: [
      'A collar that marks when "pet time" begins and ends',
      'Fetch, head scratches, treats, and praise',
      'Kitten aloofness or puppy enthusiasm as a whole mood',
      'A handler who takes care of everything so the pet can just be',
    ],
    support:
      'Pet play is a beloved, well-established community with conventions and social events worldwide. Wanting a simpler, wordless headspace is a legitimate form of relaxation and trust.',
    firstStep:
      'Try ten minutes of the headspace with zero gear — one partner simply doting on the other as their chosen animal — and see how it feels.',
  },
  caregiver: {
    group: 'power',
    name: 'Caregiver & Nurture Dynamics',
    emoji: '🧸',
    tagline: 'Being cherished is the whole point.',
    sparkPrompt: 'A dynamic built on nurture between adults — one partner protective and guiding, the other cherished, doted on, and taken care of.',
    description:
      'Caregiver dynamics pair a protective, guiding partner with one who loves being looked after — tucked in, praised, gently bossed around, utterly safe. It\'s an adult dynamic about vulnerability and trust, and it can be as light or as structured as you like.',
    examples: [
      'One partner planning meals, bedtimes, or comforts for the other',
      'Pet names, soft rules, and lots of reassurance',
      'A "no decisions tonight" gift to a stressed partner',
      'Comfort objects, cozy rituals, and being tucked in',
    ],
    support:
      'Wanting to be taken care of — or to be the one who takes care — is one of the most tender dynamics there is. Between consenting adults it\'s a beautiful container for vulnerability.',
    firstStep:
      'Offer your partner one full "cared-for" evening — you handle every decision and comfort — then swap or repeat, whichever fits.',
  },
  orgasmcontrol: {
    group: 'power',
    name: 'Orgasm Control & Edging',
    emoji: '⏳',
    tagline: 'Anticipation is your favorite drug.',
    sparkPrompt: 'Pleasure as a game of timing — building, pausing, denying, or commanding release; possibly chastity play.',
    description:
      'Orgasm control turns timing into the toy: edging right up to the brink and pausing, asking permission, playful denial that makes the eventual yes overwhelming, or chastity play for those who love the long game.',
    examples: [
      'Edging — approaching the peak and deliberately backing off',
      '"Ask me first" as a game both of you love',
      'A denial day that makes the evening incandescent',
      'Chastity play with keys, timers, and lots of teasing',
    ],
    support:
      'Delayed gratification measurably intensifies pleasure — this kink is basically applied neuroscience. Control games about release are extremely common and entirely healthy.',
    firstStep:
      'Try one round of "almost": build close to the peak, pause for ten breaths, and notice what the wave does when you finally let it land.',
  },

  /* ==================== SPARK: Bondage & Sensation ==================== */

  rope: {
    group: 'bondage',
    name: 'Rope & Shibari',
    emoji: '🎗️',
    tagline: 'Rope as craft, meditation, and embrace.',
    sparkPrompt: 'Rope as an art form — decorative ties and harnesses, the slow ritual of being tied or tying.',
    description:
      'Rope bondage — including the Japanese-influenced art of shibari — treats tying as craft and connection. Many sessions never go further than the tying itself: the slow ritual, the pressure like a full-body hug, the aesthetics of the finished tie.',
    examples: [
      'A simple decorative chest harness worn under clothes',
      'The meditative rhythm of rope being wrapped and tensioned',
      'Rope photography as an art form',
      'Learning together from books and classes — the learning is a date in itself',
    ],
    support:
      'Shibari has a worldwide community of artists and teachers, with classes in most cities. Loving rope is loving craft, patience, and closeness all at once.',
    firstStep:
      'Buy one soft practice rope and learn a single decorative wrist wrap from a beginner tutorial — keeping safety shears in reach as the habit from day one.',
  },
  sensorydep: {
    group: 'bondage',
    name: 'Sensory Deprivation',
    emoji: '🎧',
    tagline: 'Less input, more sensation.',
    sparkPrompt: 'Dimming the senses — blindfolds, headphones, soft mitts — so every remaining touch counts double.',
    description:
      'Sensory deprivation removes a sense or two so the rest light up: a blindfold that makes every touch a surprise, headphones that turn the world off, soft mitts that reduce the urge to reach and control.',
    examples: [
      'A blindfold plus one slow fingertip',
      'Noise-cancelling headphones with a playlist your partner controls',
      'Not knowing where the next touch will land',
      'Floating in stillness while your partner runs the show',
    ],
    support:
      'Neuroscience backs this one completely: removing one sense heightens the others. It\'s the same principle as closing your eyes to savor food — just far more fun.',
    firstStep:
      'Start with only a blindfold and a ten-minute timer; agree that a single word lifts it instantly.',
  },
  impact: {
    group: 'bondage',
    name: 'Impact Play',
    emoji: '🖐️',
    tagline: 'Rhythm, sting, and glow.',
    sparkPrompt: 'Rhythmic strikes tuned to your taste — from playful spanks to paddles and floggers.',
    description:
      'Impact play spans a playful swat to paddles, floggers, and crops — always warmed up gradually, aimed at safe, padded areas, and tuned to exactly the intensity the receiver wants. Fans describe the afterglow as head-clearing.',
    examples: [
      'A warm-up of firm pats that slowly builds',
      'A leather paddle\'s thud versus a flogger\'s spread-out thump',
      'Counting strikes together as a ritual',
      'The warm, floaty glow many people feel afterward',
    ],
    support:
      'Impact play is one of the most practiced kinks on earth, with a huge, safety-obsessed community. Endorphins are real — enjoying intensity is body chemistry, not damage.',
    firstStep:
      'Start with hands only, on the padded areas, using a 1-to-10 check-in scale — the receiver calls every number.',
  },
  temperature: {
    group: 'bondage',
    name: 'Temperature & Wax Play',
    emoji: '🕯️',
    tagline: 'Hot, cold, and everything electric between.',
    sparkPrompt: 'Contrast on the skin — massage-safe wax candles, ice cubes, warmed oil, chilled glass.',
    description:
      'Temperature play uses contrast as its instrument: low-temperature massage candles that pour like warm silk, ice traced along the spine, warmed oil, chilled glass. The gap between hot and cold is where the shiver lives.',
    examples: [
      'Massage-safe soy candles (made to pour warm, not hot)',
      'An ice cube melting slowly down the back',
      'Alternating warm oil and cool breath',
      'A chilled spoon as a surprisingly effective toy',
    ],
    support:
      'Temperature receptors are some of the most sensitive in the skin — this kink is pure sensory science. With body-safe materials it\'s a gentle, beginner-friendly favorite.',
    firstStep:
      'Buy one massage candle made for skin (regular candles burn too hot) and pair it with a glass of ice — alternate, and let the receiver rate each pass.',
  },
  tickling: {
    group: 'bondage',
    name: 'Tickling',
    emoji: '🪶',
    tagline: 'Laughter and helplessness in one package.',
    sparkPrompt: 'Tickling as play — feathers, fingertips, delicious helplessness, and laughing until you beg.',
    description:
      'Tickling (knismolagnia, if you like the formal name) blends touch, teasing, and playful power — the tickler holds all the cards, and the ticklee gets to laugh, squirm, and surrender.',
    examples: [
      'Feather-light fingertips on ribs, feet, or neck',
      'A feather or soft brush as the "instrument"',
      '"Tickle truce" hand signals so the game always has an exit',
      'Slow, unbearable anticipation before contact',
    ],
    support:
      'Tickling has a devoted worldwide community, and it\'s one of the few kinks built literally on laughter. Joy and squirming are a legitimate erotic language.',
    firstStep:
      'Agree on a clear stop signal (laughing makes "stop" unreliable — use a hand tap), then explore which spots are fun versus genuinely too much.',
  },
  electro: {
    group: 'bondage',
    name: 'Electrostimulation',
    emoji: '⚡',
    tagline: 'Tingles by design.',
    sparkPrompt: 'Tingles and pulses from purpose-built, body-safe toys — from feather-light buzz to deep thrum.',
    description:
      'E-stim uses purpose-built devices (TENS-style units and specialty toys) to create sensations impossible any other way — from champagne-bubble tingles to deep rhythmic pulses, all dialed precisely.',
    examples: [
      'A TENS unit\'s gentle buzz through sticky pads',
      'Slowly turning the dial together to find "ooh"',
      'Patterns and waves rather than constant sensation',
      'Only ever using devices designed for bodies — never improvised electronics',
    ],
    support:
      'E-stim has a well-established, safety-literate community and an entire industry of body-safe gear. Loving a sensation technology can\'t be "weird" — it\'s just precise.',
    firstStep:
      'Start with an entry-level TENS unit on the lowest setting on a forearm — get to know the sensation somewhere neutral before anywhere adventurous, and read the device\'s safety guidance (never across the chest).',
  },
  marking: {
    group: 'bondage',
    name: 'Biting, Scratching & Marking',
    emoji: '💋',
    tagline: 'Souvenirs you can feel tomorrow.',
    sparkPrompt: 'Bites, scratches, and hickeys — intensity in the moment, and marks as sweet souvenirs after.',
    description:
      'Marking blends sensation with meaning: the bright intensity of a bite or scratch in the moment, and the private satisfaction of a mark that whispers about last night for days.',
    examples: [
      'A bite on the shoulder at the peak of a moment',
      'Nail trails down the back',
      'A hickey placed exactly where only you two know',
      'Agreeing in advance where marks are welcome and where they\'re not',
    ],
    support:
      'The urge to mark and be marked is ancient, common, and tied to belonging. With placement agreed in advance, it\'s a sweet blend of intensity and sentiment.',
    firstStep:
      'Have the thirty-second "map talk" — where marks are welcome, where they must never show — and then let intensity build gradually.',
  },
  edgeplay: {
    group: 'bondage',
    name: 'Thrill & Edge Play',
    emoji: '🎢',
    tagline: 'The rollercoaster principle — with real safety rails required.',
    sparkPrompt: 'High-trust thrill play — fear, adrenaline, and intensity at the edges (a category that requires real education before practice).',
    description:
      'Edge play is the umbrella for high-intensity, higher-risk play — fear play, knife-adjacent sensation (often done with harmless props), and similar adrenaline games. This category carries genuine physical risk and is the one area of kink where "just try it" is the wrong advice: it calls for real education, experienced mentorship, and conservative choices. Some practices in this area (like anything restricting breathing) have no fully safe version at all.',
    examples: [
      'The rollercoaster principle: fear enjoyed inside a container of safety',
      'Prop-based fear play (a cold butter knife reads as dramatic with zero edge)',
      'Adrenaline scenes negotiated in exhaustive detail beforehand',
      'Community workshops and mentors as the entry path — not experimentation',
    ],
    support:
      'Being drawn to intensity and adrenaline is human — it\'s the same wiring that loves horror movies and skydiving. Honoring that pull responsibly means learning from experienced educators first; wanting the thrill is valid, and so is taking the risk seriously.',
    firstStep:
      'Chase the feeling, not the hazard: start with prop-based and psychological thrill (suspense, anticipation, harmless props), and treat anything genuinely risky as requiring in-person education first.',
  },

  /* ==================== SPARK: Roleplay & Imagination ==================== */

  costumes: {
    group: 'imagination',
    name: 'Uniforms & Costumes',
    emoji: '🧥',
    tagline: 'The right outfit changes everything.',
    sparkPrompt: 'The charge of a uniform or costume — on you or on them.',
    description:
      'For uniform and costume lovers, clothing is transformation: the authority of a uniform, the drama of a costume, the instant character shift the right outfit creates.',
    examples: [
      'A partner in a uniform from a profession that reads as confident',
      'Costume boxes that come out on special nights',
      'The ritual of getting dressed up as foreplay',
      'One signature item — a jacket, gloves, boots — that flips the switch',
    ],
    support:
      'Clothing has carried erotic charge in every culture in history. Responding to costume is responding to story and symbolism — imagination working exactly as designed.',
    firstStep:
      'Each of you names one outfit you\'d love to see the other in — thrift stores and costume shops make this a cheap, hilarious date.',
  },
  authority: {
    group: 'imagination',
    name: 'Authority Roleplay',
    emoji: '🏛️',
    tagline: 'Power dynamics, safely on loan.',
    sparkPrompt: 'Charged authority scenarios between adults — strict professor, demanding boss, commanding officer — all pretend, all chosen.',
    description:
      'Authority roleplay borrows charged power dynamics — professor and student, boss and new hire, officer and civilian — and plays them out safely between adults who chose the script. The appeal is the electricity of the power gap, enjoyed precisely because it isn\'t real.',
    examples: [
      'A "performance review" that goes somewhere reviews never should',
      'A strict instructor demanding extra credit',
      'Formal address — sir, ma\'am, professor — used to set the scene',
      'Debriefing after, back on equal footing, comparing favorite moments',
    ],
    support:
      'Power-gap fantasies are among the most common in sexuality research precisely because real life makes those lines uncrossable — the fantasy is where the charge goes to be safe. Playing pretend with a consenting partner harms no one and delights two.',
    firstStep:
      'Pick a scenario, agree on the tone (strict? teasing?), and give each character a name — the names alone make it easier to step in and out.',
  },
  fantasy: {
    group: 'imagination',
    name: 'Fantasy, Monsters & Cosplay',
    emoji: '🐉',
    tagline: 'Imagination has no dress code.',
    sparkPrompt: 'The fantastical made flesh — vampires, monsters, aliens, cosplay, furry personas.',
    description:
      'Some desire runs through the fantastical: vampires and werewolves, monsters and aliens, beloved characters, or an anthropomorphic persona (the furry community\'s "fursona"). It\'s imagination refusing to stop at realism — and why should it?',
    examples: [
      'A vampire scene with all the gothic trimmings',
      'Monster-romance dynamics straight from the bestselling book genre',
      'Couple cosplay of characters with canonical chemistry',
      'A fursona as a freer, more playful version of yourself',
    ],
    support:
      'Monster romance tops bestseller lists and fantasy personas have thriving global communities — this territory is far more mainstream than it admits. A vivid imagination is a gift; giving it a body now and then is play at its purest.',
    firstStep:
      'Start with narrative: tell each other a short fantastical scenario aloud, and borrow one element — a voice, a persona, one prop — for real life.',
  },
  genderplay: {
    group: 'imagination',
    name: 'Gender Play & Cross-Dressing',
    emoji: '🦋',
    tagline: 'Gender as a playground, not a cage.',
    sparkPrompt: 'Playing with gender expression — cross-dressing, swapping roles, exploring another side of yourself.',
    description:
      'Gender play explores the erotic and personal charge of stepping across gender lines — clothing, names, roles, energy. For some it\'s occasional dress-up; for others it\'s a meaningful part of identity. Both are valid, and only you define what it means for you.',
    examples: [
      'Lingerie or clothing coded to another gender, worn for the thrill',
      'Swapping traditional "roles" for a night',
      'A different name and persona for special occasions',
      'Exploring what confidence feels like from the other side',
    ],
    support:
      'Cross-dressing and gender play are ancient (theater history is full of it) and extremely common. Whether it\'s pure play or something deeper, exploring it is healthy self-knowledge — and you\'re in vast company.',
    firstStep:
      'Start private and low-stakes: one item of clothing, alone or with a trusted partner, and simply notice what you feel — curiosity deserves data, not judgment.',
  },
  medical: {
    group: 'imagination',
    name: 'Medical Play',
    emoji: '🩺',
    tagline: 'The ritual of the exam room.',
    sparkPrompt: 'Clinical roleplay — exams, gloves, instruments, and the particular vulnerability of the doctor\'s office.',
    description:
      'Medical play borrows the rituals of the clinic — the exam, the gloves, the clipboard questions, the commanding bedside manner — for the unique cocktail of vulnerability, authority, and full-body attention.',
    examples: [
      'A thorough "check-up" with theatrical seriousness',
      'Nitrile gloves as a sensory experience of their own',
      'Clipboard intake questions that get progressively less clinical',
      'The power dynamic of examiner and examined',
    ],
    support:
      'Medical play is a well-established niche with dedicated communities and gear makers. The draw — being completely attended to — is one of intimacy\'s oldest wishes in a lab coat.',
    firstStep:
      'A box of nitrile gloves and a theatrical "intake interview" is a complete starter kit — keep anything invasive out of scope until you\'ve both researched it properly.',
  },
  sizeplay: {
    group: 'imagination',
    name: 'Size & Strength Play',
    emoji: '🏋️',
    tagline: 'The delicious physics of difference.',
    sparkPrompt: 'The charge of size and strength difference — being lifted, pinned, enveloped, or doing the lifting.',
    description:
      'Size and strength play savors physical difference: being picked up, pinned, or carried; feeling small and protected or big and powerful. It ranges from real-world lifts to pure giant-and-tiny fantasy (macrophilia\'s imaginative end).',
    examples: [
      'Being lifted or carried to another room mid-moment',
      'A hand that covers yours completely',
      'Deliberately playing up height or strength differences',
      'Fantasy scenarios of dramatic, impossible size difference',
    ],
    support:
      'The thrill of size difference shows up across all genders and orientations — protection and power are primal feelings. Enjoying the physics of bodies is as natural as kink gets.',
    firstStep:
      'Ask for one lift, pin, or carry (with a warm-up and good lifting form — knees, not backs) and see how the difference feels on purpose.',
  },
  breeding: {
    group: 'imagination',
    name: 'Breeding Fantasy',
    emoji: '🌾',
    tagline: 'Primal talk, modern precautions.',
    sparkPrompt: 'The primal fantasy of "breeding" — possessive, purposeful talk and energy — while real-life contraception stays firmly in place.',
    description:
      'Breeding kink is a fantasy of primal purpose — possessive language, the charged idea of being "bred" or claiming a partner completely. For nearly everyone it lives strictly in dirty talk and energy: the fantasy thrills precisely while real-world contraception keeps reality safely boring.',
    examples: [
      'Possessive, purposeful dirty talk in the moment',
      'The primal framing of claiming and being claimed',
      'A fantasy discussed and enjoyed with reality firmly separate',
      'Clear contraception agreements that make the fantasy safe to voice',
    ],
    support:
      'This is one of the most-searched fantasies on the internet — the wiring is ancient and the appeal is overwhelmingly about intensity and belonging, not literal outcomes. Talk about it openly; fantasy and family planning are separate conversations, and both deserve clarity.',
    firstStep:
      'Introduce it as vocabulary first — a few charged words in the moment — after a daylight conversation confirming the fantasy/reality line you both want.',
  },
  hypno: {
    group: 'imagination',
    name: 'Mind Play & Erotic Hypnosis',
    emoji: '🌀',
    tagline: 'The mind is the biggest erogenous zone.',
    sparkPrompt: 'Trance, suggestion, and altered headspace — guided relaxation that turns the mind itself into the playground.',
    description:
      'Erotic hypnosis and mind play use relaxation, focus, and suggestion to create altered, floaty headspace — from simple guided relaxation with an erotic glow to deeper trance play between very trusting partners.',
    examples: [
      'A partner\'s voice guiding a slow, full-body relaxation',
      'Trigger words that call back a marvelous feeling',
      'The floaty, suggestible state hypnosis fans adore',
      'Extensive trust talks first — the mind deserves the same care as the body',
    ],
    support:
      'Fascination with trance and suggestion is fascination with consciousness itself. Practiced with consent and care, mind play is a niche with thoughtful communities and a deep literature.',
    firstStep:
      'Start with a simple guided relaxation read aloud by your partner — no triggers, no depth, just their voice and your breath — and debrief what it felt like.',
  },

  /* ==================== SPARK: Seen & Shared ==================== */

  filming: {
    group: 'seen',
    name: 'Filming & Photography',
    emoji: '📸',
    tagline: 'Your own private cinema.',
    sparkPrompt: 'Making private photos or videos together — for an audience of exactly two.',
    description:
      'Some couples love the camera: the performance energy it adds in the moment, and the private archive it creates. The non-negotiables are enthusiastic consent from everyone filmed and genuinely secure storage.',
    examples: [
      'A photoshoot night with good lighting and no timeline',
      'Watching your own "premiere" together afterward',
      'The performance energy a lens adds',
      'Encrypted, password-protected storage as the standing rule',
    ],
    support:
      'The urge to capture desire is as old as art. With consent and real security habits, a private archive is a love letter you write together.',
    firstStep:
      'Start with photos only, on one designated device, and agree on storage and deletion rules before the first shot — the security talk is what makes the fun sustainable.',
  },
  groupplay: {
    group: 'seen',
    name: 'Group Play & Threesomes',
    emoji: '👥',
    tagline: 'More people, more logistics, more possibility.',
    sparkPrompt: 'Intimacy with more than two — threesomes, foursomes, or the social world of swinging.',
    description:
      'Group play spans the classic threesome fantasy to swinging\'s social scene. The fantasy is nearly universal; the practice runs on the unglamorous superpowers: communication, boundaries, and honest check-ins before and after.',
    examples: [
      'A threesome negotiated carefully with a trusted third',
      'Swinger events and clubs with well-defined etiquette',
      'Same-room versus separate-room boundaries — every couple defines their own',
      'The pre-talk and the debrief as the real main events',
    ],
    support:
      'Threesomes consistently rank as the single most common fantasy in research. Whether it stays fantasy or becomes practice, wanting it puts you in the statistical majority — not the margins.',
    firstStep:
      'Start with the map, not the territory: each partner writes their boundaries and hopes separately, then compare — many couples find the conversation is the adventure.',
  },
  compersion: {
    group: 'seen',
    name: 'Compersion & Sharing',
    emoji: '💞',
    tagline: 'Their pleasure is your pleasure.',
    sparkPrompt: 'Heat or joy in a partner\'s pleasure with someone else — cuckolding, hotwifing, or open dynamics.',
    description:
      'Compersion is finding joy — or heat — in a partner\'s pleasure with someone else. Erotically it powers cuckolding and hotwifing dynamics; emotionally it\'s the engine of many open relationships. It flips jealousy\'s script, which is exactly why it fascinates.',
    examples: [
      'The charge of hearing about a partner\'s date',
      'Hotwifing or cuckold dynamics with rules both partners wrote',
      'Watching a partner be desired and feeling pride instead of threat',
      'Rigorous honesty as the foundation that makes any of it work',
    ],
    support:
      'Cuckolding ranks in the top handful of fantasies for men in multiple large studies, and compersion is celebrated in polyamorous communities as a skill worth cultivating. Feeling it — or wanting to — is emotional range, not deficiency.',
    firstStep:
      'Test the waters in fantasy: talk through a hypothetical together and watch your real reactions — arousal, anxiety, both — with curiosity instead of judgment.',
  },

  /* ==================== SPARK: Fetish & Body ==================== */

  materials: {
    group: 'fetish',
    name: 'Latex, Leather & Materials',
    emoji: '🖤',
    tagline: 'Texture is a language.',
    sparkPrompt: 'The look, feel, scent, and sound of materials — latex, leather, PVC, silk, fur.',
    description:
      'Material fetishes respond to fabric as experience: the second-skin gleam of latex, leather\'s scent and creak, PVC\'s shine, silk\'s glide. It can be about wearing, touching, or simply beholding.',
    examples: [
      'A leather jacket that does something to you',
      'The ritual of shining and caring for gear',
      'Latex\'s gleam under good lighting',
      'Silk sheets or gloves as the whole event',
    ],
    support:
      'Leather and latex communities are decades-old cornerstones of kink culture with their own history and pride. Strong sensory preferences are wiring, not weirdness — sommeliers get paid for theirs.',
    firstStep:
      'Visit the fabric or thrift store and let touch lead — one glove, scarf, or jacket in your favorite material is a complete experiment.',
  },
  lingerie: {
    group: 'fetish',
    name: 'Lingerie & Clothing',
    emoji: '🎀',
    tagline: 'What\'s almost hidden is most seen.',
    sparkPrompt: 'The charge of special clothing — lingerie, stockings, a particular garment that transforms the wearer.',
    description:
      'Lingerie love is about transformation and reveal: the garment that changes how the wearer carries themselves, the slow unveiling, the secret of something special under ordinary clothes.',
    examples: [
      'A set worn all day as a private secret',
      'The slow reveal as its own act',
      'Stockings, garters, and the ritual of putting them on',
      'Shopping together as extended foreplay',
    ],
    support:
      'Entire industries exist because clothing is erotic to nearly everyone — the only variation is degree. Savoring the aesthetics of dress and undress is romance with good production values.',
    firstStep:
      'Shop together — in person or online — and let each partner pick one piece they\'d love to see; the picking is half the fun.',
  },
  feet: {
    group: 'fetish',
    name: 'Feet & Footwear',
    emoji: '🦶',
    tagline: 'The most common fetish on the planet.',
    sparkPrompt: 'Feet and footwear as a source of attraction — massaging, admiring, adoring, or beautiful shoes.',
    description:
      'Foot attraction is the world\'s most common body-focused kink — from loving foot massages and pedicure aesthetics to heels and boots as objects of devotion. Brain-mapping research even suggests why: the foot\'s sensory region neighbors the genitals\' in the cortex.',
    examples: [
      'A long, attentive foot massage as devotion',
      'Painted toes, anklets, and pedicure aesthetics',
      'A partner\'s favorite heels or boots kept for special nights',
      'Kisses that start at the ankle',
    ],
    support:
      'Studies consistently crown feet the most common fetish worldwide — you are in enormous company, and neuroscience suggests it\'s literally in the brain\'s wiring diagram. Nothing about it is strange.',
    firstStep:
      'Offer (or request) a proper ten-minute foot massage with lotion and full attention — devotion disguised as self-care.',
  },
  bodyworship: {
    group: 'fetish',
    name: 'Body Worship',
    emoji: '🏛️',
    tagline: 'Reverence as an erotic act.',
    sparkPrompt: 'Devoted, unhurried adoration of a partner\'s body — or being the one adored.',
    description:
      'Body worship makes reverence the entire event: slow, devoted attention to a partner\'s body — muscles, curves, hands, every inch treated as worthy of adoration — or the vulnerable glory of receiving that attention.',
    examples: [
      'A slow head-to-toe appreciation with commentary',
      'Massage as devotion rather than utility',
      'Focusing an entire evening on one adored feature',
      'Being laid back and adored with nothing expected in return',
    ],
    support:
      'In a world that teaches body criticism, body worship is a radical act of appreciation. Both giving and receiving it are practices in feeling worthy — which is therapy with better lighting.',
    firstStep:
      'Take turns: fifteen minutes of unhurried appreciation each, the receiver\'s only job being to accept it.',
  },
  nichebody: {
    group: 'fetish',
    name: 'Hands, Hair & Specific Features',
    emoji: '🤲',
    tagline: 'Your eye knows exactly what it loves.',
    sparkPrompt: 'A particular pull toward a specific feature — hands, forearms, hair, necks, shoulders, voices.',
    description:
      'Some attraction is beautifully specific: hands and forearms (quirofilia), hair to touch or be touched by (trichophilia), necks, shoulders, voices. A specific eye is a connoisseur\'s eye.',
    examples: [
      'Watching someone\'s hands while they work',
      'Hair play — brushing, braiding, a gentle tug',
      'Rolled-up sleeves as a genuine event',
      'A voice that does more than any picture could',
    ],
    support:
      'Nearly everyone has "a thing" — a feature that catches them first. Naming yours just means you know your own taste, and specific taste makes for wonderfully specific compliments.',
    firstStep:
      'Tell your partner exactly what feature undoes you and why — specific desire, spoken aloud, is one of the best compliments there is.',
  },
  wetmessy: {
    group: 'fetish',
    name: 'Food & Messy Play',
    emoji: '🍰',
    tagline: 'Permission to make a glorious mess.',
    sparkPrompt: 'Playful mess — whipped cream, chocolate sauce, cake, or the general joy of getting gloriously messy.',
    description:
      'Wet-and-messy play (sploshing) is the giddy, sensory joy of food and mess: whipped cream, chocolate sauce, an entire cake met with enthusiasm. It\'s texture, taste, absurdity, and childlike permission all at once.',
    examples: [
      'Whipped cream and chocolate sauce as art supplies',
      'The classic pie-to-the-face, lovingly delivered',
      'A tarp-covered floor as a canvas for chaos',
      'The laughing shower together afterward',
    ],
    support:
      'Sploshing is one of the most cheerful communities in kink — it runs on laughter. Wanting permission to be messy and ridiculous is wanting play in its purest form.',
    firstStep:
      'Start with dessert and a towel: one can of whipped cream, applied artistically, with the shower already warm.',
  },
  watersports: {
    group: 'fetish',
    name: 'Watersports',
    emoji: '💧',
    tagline: 'More common than anyone admits at dinner.',
    sparkPrompt: 'Erotic play involving pee — a taboo-tinged interest far more common than polite company admits.',
    description:
      'Watersports (urolagnia) is erotic interest in pee — often less about the substance than the intimacy, taboo, and total-trust vulnerability of it. Like all body-fluid play it comes with common-sense hygiene practices the community discusses openly.',
    examples: [
      'The charged intimacy of a normally private act shared',
      'Shower settings as the practical classic',
      'The taboo itself as the engine of the thrill',
      'Frank hygiene and boundary talks beforehand — unsexy, then very sexy',
    ],
    support:
      'Surveys consistently find this interest far more widespread than its dinner-party reputation suggests. Taboo is a normal amplifier of desire — enjoying it with a consenting partner and sensible hygiene is a preference, not a pathology.',
    firstStep:
      'Raise it as fantasy first and gauge mutual interest honestly; if you both lean in, the shower is the traditional low-stakes venue.',
  },

  /* ==================== SPARK: Voice & Mind ==================== */

  dirtytalk: {
    group: 'mind',
    name: 'Dirty Talk',
    emoji: '🎙️',
    tagline: 'Language is your favorite toy.',
    sparkPrompt: 'Explicit, charged language — hearing it, saying it, or trading it by text all day.',
    description:
      'For dirty-talk lovers, words do the heaviest lifting: narration, commands, confessions, filth delivered in exactly the right tone. The vocabulary that works is intensely personal — finding it together is part of the fun.',
    examples: [
      'A running narration of what\'s happening — or about to',
      'Texts through the day that build toward the evening',
      'Learning which specific words land and which clang',
      'A voice note that outperforms any photo',
    ],
    support:
      'The brain is the biggest erogenous zone and language is its native interface. Being word-driven is a superpower — you can flirt from anywhere with a signal.',
    firstStep:
      'Trade "green words" lists — words and phrases you each love (and any that are off-limits) — then practice by text, where nobody can see you blush.',
  },
  degradation: {
    group: 'mind',
    name: 'Degradation & Objectification',
    emoji: '🎭',
    tagline: 'Sharp words in a soft container.',
    sparkPrompt: 'Consensual humiliation — chosen harsh words or being treated as a beautiful object, thrilling precisely because you\'re safe.',
    description:
      'Degradation play uses deliberately harsh words or objectifying dynamics — chosen together, in a container of real affection — because for some people the contrast is electric. Its golden rules: pre-negotiated vocabulary, off-limits topics, and warm aftercare that reaffirms what\'s actually true.',
    examples: [
      'Specific "mean" words agreed on in advance — and forbidden ones listed too',
      'Being treated as a gorgeous object for an evening',
      'The charge of contrast between scene words and real regard',
      'Aftercare that explicitly reaffirms what\'s true underneath',
    ],
    support:
      'Praise and degradation are two ends of one axis — intensity of attention — and plenty of people enjoy both. Enjoying sharp words inside real safety is contrast play, and the negotiation it requires often deepens trust.',
    firstStep:
      'Build the vocabulary lists first — thrilling words, neutral words, never-words — and start with the mildest item on the list plus extra-warm aftercare.',
  },

  /* ==================== SPARK: Connection ==================== */

  tantric: {
    group: 'connection',
    name: 'Slow & Mindful Intimacy',
    emoji: '🧘',
    tagline: 'Presence as practice.',
    sparkPrompt: 'Slow, meditative intimacy — breathwork, extended eye contact, unhurried touch, tantra-inspired presence.',
    description:
      'Tantra-inspired, mindful intimacy treats presence itself as the practice: synchronized breath, long eye contact, deliberately slow touch, and sessions measured in closeness rather than milestones.',
    examples: [
      'Breathing in sync for a few minutes before anything else',
      'Eye-gazing that feels awkward for one minute and profound by three',
      'Touch slowed to a quarter speed',
      'Sessions with no goal beyond staying present together',
    ],
    support:
      'Mindfulness research keeps confirming what tantra traditions long claimed: attention is the real aphrodisiac. Craving slowness in a fast world is wisdom, not blandness.',
    firstStep:
      'Try three minutes of synchronized breathing and eye contact before your next intimate evening — expect giggles first, depth second.',
  },
};

/* ==================== PART 1: broad weighted questions ==================== */

const QUESTIONS = [
  {
    question: 'Picture your ideal intimate evening. Who\'s steering the ship?',
    options: [
      { label: 'Me — I love planning every detail and guiding my partner through it', scores: { dominance: 3 } },
      { label: 'My partner — I want to be swept along and told what happens next', scores: { submission: 3 } },
      { label: 'We trade off — the back-and-forth is half the fun', scores: { dominance: 1, submission: 1, roleplay: 1 } },
      { label: 'No one — we move together, slow and equal', scores: { sensual: 3 } },
    ],
  },
  {
    question: 'A partner gently holds your wrists so you can\'t move. Your honest reaction?',
    options: [
      { label: 'Electric — I\'d love even more restraint than that', scores: { bondage: 3, submission: 1 } },
      { label: 'Intriguing — I\'d be curious to explore it slowly', scores: { bondage: 2 } },
      { label: 'I\'d rather be the one doing the holding', scores: { bondage: 2, dominance: 2 } },
      { label: 'Not my thing — I prefer my hands free to touch', scores: { sensual: 2 } },
    ],
  },
  {
    question: 'Which compliment would melt you the most mid-moment?',
    options: [
      { label: '"You\'re doing so well for me."', scores: { praise: 3, submission: 1 } },
      { label: '"I\'ll do anything you say."', scores: { dominance: 3 } },
      { label: '"I love watching you."', scores: { exhibition: 3 } },
      { label: '"I\'ve never felt this close to anyone."', scores: { sensual: 3, praise: 1 } },
    ],
  },
  {
    question: 'Your partner suggests pretending you\'re strangers who just met at a hotel bar. You…',
    options: [
      { label: 'Already have a fake name and a backstory — let\'s go', scores: { roleplay: 3 } },
      { label: 'Would play along and probably enjoy it', scores: { roleplay: 2 } },
      { label: 'Would rather skip the acting and just be us', scores: { sensual: 2 } },
      { label: 'Would prefer a scenario where one of us is clearly in charge', scores: { roleplay: 2, dominance: 1, submission: 1 } },
    ],
  },
  {
    question: 'Your partner watches you undress from across the room, clearly enjoying it. You feel…',
    options: [
      { label: 'Powerful — I\'d slow down and make a show of it', scores: { exhibition: 3 } },
      { label: 'Flattered but a bit shy — a little audience goes a long way', scores: { exhibition: 1, praise: 1 } },
      { label: 'I\'d rather swap places and do the watching', scores: { voyeurism: 3 } },
      { label: 'I\'d pull them close — distance is overrated', scores: { sensual: 2 } },
    ],
  },
  {
    question: 'Which of these fantasies have you replayed more than once?',
    options: [
      { label: 'Being completely at someone\'s mercy (safely, with someone I trust)', scores: { submission: 2, bondage: 2 } },
      { label: 'Having someone completely at mine', scores: { dominance: 2, bondage: 1 } },
      { label: 'Watching — or being watched — with total permission', scores: { voyeurism: 2, exhibition: 1 } },
      { label: 'A perfect, deeply romantic night where time slows down', scores: { sensual: 3 } },
    ],
  },
  {
    question: 'Rules and rituals in a relationship (a nickname only they use, a task, a routine) sound…',
    options: [
      { label: 'Wonderful — I\'d love following rules someone set just for me', scores: { submission: 3, praise: 1 } },
      { label: 'Wonderful — I\'d love being the one who sets them', scores: { dominance: 3 } },
      { label: 'Fun as an occasional game, not a lifestyle', scores: { roleplay: 1, submission: 1 } },
      { label: 'Unnecessary — spontaneity and equality suit me better', scores: { sensual: 2 } },
    ],
  },
  {
    question: 'A blindfold appears. What happens next?',
    options: [
      { label: 'I put it on — not seeing makes every touch twice as intense', scores: { bondage: 2, sensation: 2, submission: 1 } },
      { label: 'I put it on them — I love having all the control of the moment', scores: { bondage: 2, dominance: 2, voyeurism: 1 } },
      { label: 'We take turns — both sides sound fun', scores: { bondage: 2, sensation: 1 } },
      { label: 'I set it aside — eye contact is my favorite part', scores: { sensual: 3 } },
    ],
  },
  {
    question: 'During intimacy, how much talking do you want?',
    options: [
      { label: 'Constant praise and sweet words — tell me everything you\'re feeling', scores: { praise: 3 } },
      { label: 'Confident commands — a firm voice undoes me', scores: { submission: 2, praise: 1 } },
      { label: 'I want to be the voice — directing, praising, teasing', scores: { dominance: 2, praise: 2 } },
      { label: 'Very little — breath, movement, and eye contact say it all', scores: { sensual: 2 } },
    ],
  },
  {
    question: 'Honestly, what draws you to trying something new in intimacy?',
    options: [
      { label: 'The adrenaline — I chase intensity and new highs', scores: { sensation: 2, exhibition: 1 } },
      { label: 'The trust — doing something vulnerable with someone safe', scores: { bondage: 1, submission: 2 } },
      { label: 'The play — novelty, games, and imagination keep things alive', scores: { roleplay: 2, sensation: 1 } },
      { label: 'The closeness — anything new should bring us emotionally closer', scores: { sensual: 2, praise: 1 } },
    ],
  },
  {
    question: 'Your partner says: "Tonight, you\'re in charge of everything." You…',
    options: [
      { label: 'Light up — I\'ve already got ideas', scores: { dominance: 3 } },
      { label: 'Negotiate — can they be in charge instead?', scores: { submission: 3 } },
      { label: 'Turn it into a game with a scenario and stakes', scores: { roleplay: 2, dominance: 1 } },
      { label: 'Plan something slow, romantic, and unhurried', scores: { sensual: 2, dominance: 1 } },
    ],
  },
  {
    question: 'Aftercare time. What sounds most like heaven once things wind down?',
    options: [
      { label: 'Being held, praised, and told how wonderful I was', scores: { praise: 2, submission: 2 } },
      { label: 'Taking care of my partner — water, blankets, soft words', scores: { dominance: 2, praise: 1 } },
      { label: 'Laughing together about the characters we just played', scores: { roleplay: 2, sensual: 1 } },
      { label: 'Long, quiet cuddling — no words needed', scores: { sensual: 3 } },
    ],
  },
];

/* ==================== PART 3: Kinsey scale ==================== */

const KINSEY_QUESTIONS = [
  {
    question: 'When someone catches your eye and makes your heart beat faster, who does it tend to be?',
    options: [
      { label: 'Only people of a different gender than mine', value: 0 },
      { label: 'Mostly a different gender, occasionally my own', value: 1.5 },
      { label: 'People of my own gender and other genders about equally', value: 3 },
      { label: 'Mostly my own gender, occasionally a different one', value: 4.5 },
      { label: 'Only people of my own gender', value: 6 },
      { label: 'Honestly, no one — I rarely or never feel sexual attraction', value: 'X' },
    ],
  },
  {
    question: 'In your private fantasies and daydreams, who shows up?',
    options: [
      { label: 'Exclusively a different gender', value: 0 },
      { label: 'Mostly a different gender, with occasional exceptions', value: 1.5 },
      { label: 'A pretty even mix of genders', value: 3 },
      { label: 'Mostly my own gender, with occasional exceptions', value: 4.5 },
      { label: 'Exclusively my own gender', value: 6 },
      { label: 'My fantasies aren\'t really about anyone / I don\'t have sexual fantasies', value: 'X' },
    ],
  },
  {
    question: 'If attraction were guaranteed to be mutual and consequence-free, who would you be curious to be with?',
    options: [
      { label: 'Only a different gender — no curiosity beyond that', value: 0 },
      { label: 'A different gender, though I\'ve wondered about my own once or twice', value: 1.5 },
      { label: 'I\'d be open to a genuinely wide range of people', value: 3 },
      { label: 'My own gender, though I\'ve wondered about others once or twice', value: 4.5 },
      { label: 'Only my own gender — no curiosity beyond that', value: 6 },
      { label: 'The scenario doesn\'t spark much for me either way', value: 'X' },
    ],
  },
  {
    question: 'Thinking about deep romantic connection (not just physical), who can you picture building that with?',
    options: [
      { label: 'Only someone of a different gender', value: 0 },
      { label: 'Most likely a different gender, but I wouldn\'t rule anything out', value: 1.5 },
      { label: 'Gender genuinely wouldn\'t be the deciding factor', value: 3 },
      { label: 'Most likely my own gender, but I wouldn\'t rule anything out', value: 4.5 },
      { label: 'Only someone of my own gender', value: 6 },
      { label: 'Romantic connection matters to me, but sexual attraction isn\'t part of it', value: 'X' },
    ],
  },
];

const KINSEY_RESULTS = {
  0: {
    label: 'Kinsey 0 — Exclusively heterosexual',
    description:
      'Your attractions point consistently toward people of a different gender than your own. On Kinsey\'s 0–6 scale, that places you at 0: exclusively heterosexual. Like every point on the scale, it\'s simply a description of where your attractions naturally live — clear, valid, and yours.',
  },
  1: {
    label: 'Kinsey 1 — Predominantly heterosexual, only incidentally homosexual',
    description:
      'Your attractions lean strongly toward a different gender, with the occasional flicker of curiosity or attraction toward your own. Kinsey found this incredibly common — a 1 simply means your compass points one way with a little natural range, which is a completely normal way for attraction to work.',
  },
  2: {
    label: 'Kinsey 2 — Predominantly heterosexual, but more than incidentally homosexual',
    description:
      'You\'re mostly drawn to a different gender, but attraction to your own gender is a real and recurring part of your experience — more than a passing flicker. Many people at a 2 identify as heteroflexible or bi-curious; whatever words fit, this blend is common and completely valid.',
  },
  3: {
    label: 'Kinsey 3 — Equally heterosexual and homosexual',
    description:
      'Your attractions land in the beautiful middle: people of your own gender and other genders draw you roughly equally. This is the classic bisexual point on Kinsey\'s scale. Attraction for you is likely about the person more than the package — a perspective many describe as freeing.',
  },
  4: {
    label: 'Kinsey 4 — Predominantly homosexual, but more than incidentally heterosexual',
    description:
      'You\'re mostly drawn to your own gender, while attraction to other genders remains a genuine part of your experience. A 4 reflects a rich, real pattern of attraction that plenty of people share — your mix is yours, and it\'s completely valid.',
  },
  5: {
    label: 'Kinsey 5 — Predominantly homosexual, only incidentally heterosexual',
    description:
      'Your attractions point strongly toward your own gender, with only occasional flickers elsewhere. A 5 means your compass is clear with a little natural range — a very common shape for attraction to take, and entirely valid.',
  },
  6: {
    label: 'Kinsey 6 — Exclusively homosexual',
    description:
      'Your attractions point consistently toward people of your own gender. On Kinsey\'s scale that\'s a 6: exclusively homosexual. Like every point on the scale, it\'s a clear, valid description of where your attractions naturally live.',
  },
  X: {
    label: 'Kinsey X — Little or no sexual attraction',
    description:
      'Your answers suggest sexual attraction plays little or no role in how you connect with people. Kinsey called this "X"; today many people describe it as being on the asexual spectrum. It\'s a real, recognized orientation — not a phase or a problem — and plenty of asexual people still enjoy romance, intimacy, and deep connection on their own terms.',
  },
};

/* General self-discovery suggestions appended to everyone's results. */
const GENERAL_SUGGESTIONS = [
  'Keep a private desire journal — noting what sparked "yes," "curious," or "no" teaches you your own patterns faster than anything else.',
  'Share one result from this quiz with a partner as a conversation starter — "this said I might like X, what do you think?" is a famously easy opener.',
  'Learn the classics of consent culture: safewords, check-ins, and aftercare make every experiment on this list better.',
  'Great reading for the road: "Come As You Are" by Emily Nagoski for desire itself, and "The New Topping Book" / "The New Bottoming Book" by Easton & Hardy for power play.',
  'Retake this quiz in six months — desire is a living thing, and watching your own answers shift is self-knowledge in motion.',
];

/* Make the database available to the server for building result emails. */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GROUPS, SPARK_SCALE, CATEGORIES, QUESTIONS, KINSEY_QUESTIONS, KINSEY_RESULTS, GENERAL_SUGGESTIONS };
}
