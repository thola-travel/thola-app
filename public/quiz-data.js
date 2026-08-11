/**
 * Desire Discovery Quiz: content and scoring database.
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
      'Dominance means guiding the experience. You set the pace, make the calls, and take care of a partner who has chosen to follow your lead. Done well, it\'s a job of attention and care, not bossiness.',
    examples: [
      'Planning an evening and telling your partner exactly how it will go',
      'Giving clear, confident directions in the moment',
      'Setting light "rules" or tasks the two of you agreed on',
      'Aftercare: checking in and looking after your partner when play ends',
    ],
    support:
      'Wanting to be in charge is one of the most common dynamics in intimacy, full stop. The best dominants are known for consent, communication, and care. Liking this role means you like to give as much as you like to lead.',
    firstStep:
      'Plan one evening start to finish and walk your partner through it in a warm, confident voice. Compare notes afterward about what worked.',
  },
  submission: {
    group: 'power',
    name: 'Submission',
    emoji: '🕊️',
    tagline: 'You find freedom in letting go.',
    description:
      'Submission is handing the reins to someone you trust. No decisions, no pressure, no steering. Just the experience. A lot of people describe the headspace as deeply relaxing, almost meditative.',
    examples: [
      'Letting a partner plan and direct a whole evening',
      'Following playful instructions or rules you both agreed on',
      'Being "told what to do" inside limits you set yourself',
      'The comfort of structure: rituals, titles, routines you both chose',
    ],
    support:
      'Submission is chosen, negotiated, and revocable at any moment. That makes it a position of real power. Wanting to let go takes a capacity for trust that plenty of people wish they had.',
    firstStep:
      'Hand over one small decision on purpose. What you wear, what happens first, who picks the music. Then just notice how it feels to follow.',
  },
  bondage: {
    group: 'bondage',
    name: 'Bondage & Restraint',
    emoji: '🪢',
    tagline: 'Restraint heightens sensation and trust.',
    description:
      'Bondage runs from a partner holding your wrists to soft cuffs and scarves. Being restrained, or doing the restraining, builds anticipation and focuses every sensation. It also creates a strong feeling of trust between you.',
    examples: [
      'A partner pinning your hands above your head',
      'Soft cuffs, silk scarves, or a sleep mask',
      'Adding a little more restraint as trust grows',
      'Agreeing on a signal so it all ends the second anyone wants it to',
    ],
    support:
      'In survey after survey, bondage lands near the top of the most common fantasies in the world. With communication and a quick-release mindset, it\'s trust and sensation working together.',
    firstStep:
      'Start with a silk scarf or soft velcro cuffs. Agree on a release word first, and keep the first session short.',
  },
  sensation: {
    group: 'bondage',
    name: 'Sensation Play',
    emoji: '✨',
    tagline: 'Your body loves contrast and intensity.',
    description:
      'Sensation play explores the whole range of touch. Soft to firm, warm to cool, feather-light to intense. The receiver sets the dial, always.',
    examples: [
      'A firm massage that melts into teasing, light touch',
      'Textures: silk, fur, fingertips, fingernails',
      'Building intensity slowly and checking in as you go',
      'Contrast on purpose: soft then firm, slow then sudden',
    ],
    support:
      'Skin is packed with different nerve receptors, and they love variety. Enjoying contrast and intensity is basic biology working as intended.',
    firstStep:
      'Try a "sensation menu" night. Five different touches, eyes closed, and you rate each one together after.',
  },
  roleplay: {
    group: 'imagination',
    name: 'Roleplay & Scenarios',
    emoji: '🎭',
    tagline: 'Imagination is your playground.',
    description:
      'Roleplay lets you step into a story. New characters, new dynamics, a break from your everyday roles. It can be elaborate, or as simple as "let\'s pretend we just met."',
    examples: [
      'Meeting your long-term partner at a bar and playing strangers',
      'Classic setups: royalty and loyal subject, strangers on a train',
      'Costumes, accents, or just a shift in attitude',
      'Saying fantasies out loud and picking one to act out',
    ],
    support:
      'Nearly everyone fantasizes. Roleplay is just giving those stories a stage with someone you trust, and a vivid imagination is a strength, not a quirk to apologize for.',
    firstStep:
      'Text each other one scenario you\'d each enjoy, then try the milder one. No pressure to be good actors. If you crack up laughing, that still counts.',
  },
  exhibition: {
    group: 'seen',
    name: 'Exhibitionism',
    emoji: '🔥',
    tagline: 'Being seen and desired thrills you.',
    description:
      'Exhibitionism is the charge of being watched and admired, always by people who want to be watching. For some that\'s loving how a partner looks at them while they undress. For others it\'s a full private show.',
    examples: [
      'Undressing slowly while your partner watches',
      'Holding eye contact while you have their full attention',
      'A mirror placed just right',
      'Dressing up knowing exactly the effect it will have',
    ],
    support:
      'Wanting to be desired is about as human as it gets. Between consenting adults in private, showing off is a common and healthy source of heat.',
    firstStep:
      'Try a slow, well-lit reveal for an audience of one. You control the pace. They provide the applause.',
  },
  voyeurism: {
    group: 'seen',
    name: 'Voyeurism',
    emoji: '👁️',
    tagline: 'Watching is its own electricity.',
    description:
      'Voyeurism, in its healthy consensual form, is the thrill of watching a partner who loves being watched. Them undressing, touching, enjoying themselves, fully aware your eyes are on them.',
    examples: [
      'Asking your partner to undress slowly while you stay across the room',
      'Watching your partner enjoy themselves',
      'The "look but don\'t touch" game, played until neither of you can stand it',
      'Watching each other in a mirror',
    ],
    support:
      'For a huge share of people, desire starts with the eyes. When being seen is the whole point for the person being watched, watching is a healthy way to build heat.',
    firstStep:
      'Ask your partner if you can just watch for five minutes, hands off. Afterward, tell them exactly what you loved seeing.',
  },
  praise: {
    group: 'mind',
    name: 'Praise & Worship',
    emoji: '💖',
    tagline: 'Words and adoration light you up.',
    description:
      'Praise kink is the deep pleasure of hearing it out loud. "You\'re doing so well." "You\'re gorgeous." Or being the one saying it, pouring adoration over a partner. It ties emotional warmth straight into physical intimacy.',
    examples: [
      'A partner whispering how well you\'re doing',
      'Hearing, in detail, what your partner loves about you',
      'Slow, reverent attention, like your partner is studying a favorite painting',
      'Kind words as part of aftercare',
    ],
    support:
      'If praise lands deep for you, that means affirmation genuinely feeds you. That\'s emotional attunement, not neediness, and it makes this one of the gentlest kinks there is.',
    firstStep:
      'Tell your partner three specific things you love watching them do. Then ask which words they\'d most love to hear back.',
  },
  sensual: {
    group: 'connection',
    name: 'Sensual & Romantic Connection',
    emoji: '🌹',
    tagline: 'Depth, tenderness, and presence are your language.',
    description:
      'Your strongest pull is toward presence. Eye contact, slow touch, emotional closeness, romance. People call it "vanilla," but vanilla is a real flavor, and it\'s a lot of people\'s favorite.',
    examples: [
      'Long, slow evenings with no agenda but each other',
      'Massage, candlelight, music, unhurried touch',
      'Deep eye contact and staying emotionally present',
      'Building anticipation across a whole day of small gestures',
    ],
    support:
      'Tenderness and presence make up a complete erotic language on their own. Learning that connection is what moves you is as real a discovery as any kink on this list.',
    firstStep:
      'Plan one unhurried evening with phones in another room. The only goal is presence. Everything else is a bonus.',
  },

  /* ==================== SPARK: Power & Control ==================== */

  switchplay: {
    group: 'power',
    name: 'Switching',
    emoji: '🔄',
    tagline: 'You want both sides of the coin.',
    sparkPrompt: 'Trading roles. Confidently leading one night, happily surrendering the next.',
    description:
      'Switches move between dominant and submissive energy depending on mood, partner, and moment. That isn\'t indecision. It\'s range.',
    examples: [
      'Leading tonight, following next weekend',
      'Trading who\'s in charge mid-evening, with a laugh',
      'Matching your role to your partner\'s energy',
      'Coin-flip nights where chance decides who leads',
    ],
    support:
      'Ask around any experienced kink community and you\'ll find a large share of people identify as switches. Knowing both roles from the inside tends to make people better partners in either one.',
    firstStep:
      'Try a flip night. One of you leads until a timer goes off, then you trade. Compare notes after.',
  },
  bratplay: {
    group: 'power',
    name: 'Brat & Tamer Play',
    emoji: '😈',
    tagline: 'Playful defiance is your love language.',
    sparkPrompt: 'Playful defiance. Teasing, breaking the "rules" on purpose, and being lovingly put back in line (or doing the taming).',
    description:
      'Brat play is power exchange with a wink. One partner cheekily resists and provokes. The other rises to the challenge. The misbehavior is the game, and both of you are in on it.',
    examples: [
      'Sassy backtalk designed to earn a pre-agreed consequence',
      '"Make me" as an invitation',
      'The tamer keeping a stern face while clearly delighted',
      'Negotiated "punishments" that are really rewards',
    ],
    support:
      'People love bratting because it keeps power exchange light and funny. Wanting to poke the bear, or be the bear, is playfulness. And playfulness is intimacy.',
    firstStep:
      'Agree on one silly rule, one playful consequence, and a safeword. Then see who breaks first.',
  },
  discipline: {
    group: 'power',
    name: 'Rules, Rituals & Discipline',
    emoji: '📜',
    tagline: 'Structure itself is the thrill.',
    sparkPrompt: 'Ongoing structure in a dynamic. Agreed rules, daily tasks, titles, and playful consequences.',
    description:
      'For some people the charge lives in the structure itself. Rules to follow or set. Rituals that mark the dynamic. Tasks, titles, and consequences you both picked in advance. Related corners of this world include protocol dynamics and financial domination (consensual, budgeted "tributes").',
    examples: [
      'A morning check-in text required by "the rules"',
      'Titles or honorifics used only in private',
      'Task lists with playful rewards and consequences',
      'Negotiating what the dynamic includes, which is half the fun',
    ],
    support:
      'Structure creates safety, and safety creates freedom. People in rules-based dynamics often say the clarity is the most relaxing part of their whole relationship.',
    firstStep:
      'Write one rule together that you\'d both enjoy for a single week. Then review it like co-authors and keep only what you actually liked.',
  },
  primal: {
    group: 'power',
    name: 'Primal Play',
    emoji: '🐺',
    tagline: 'Instinct over etiquette.',
    sparkPrompt: 'Raw, instinctive energy. Chasing, wrestling, growling, pinning. Less talking, more instinct.',
    description:
      'Primal play strips intimacy down to instinct. Chase and capture. Wrestling for the upper hand. Growls instead of sentences. It\'s athletic, cathartic, and surprisingly freeing.',
    examples: [
      'A playful chase from one room to another',
      'Wrestling where the winner sets the pace',
      'Growling, snarling, or wordless vocal play',
      'Hunter-and-prey games negotiated in advance',
    ],
    support:
      'Underneath the manners, we\'re animals. Letting that side breathe in a safe container is healthy release. People who play this way often call it the most honest play there is.',
    firstStep:
      'Try a sixty-second pillow-soft wrestling match with a clear stop word. Whoever ends up on top leads what happens next.',
  },
  cnc: {
    group: 'power',
    name: 'Consensual Non-Consent',
    emoji: '🎬',
    tagline: 'Scripted surrender, absolute trust.',
    sparkPrompt: 'Carefully pre-scripted "resistance" scenes. Planned together in detail beforehand, with a safeword that ends everything instantly.',
    description:
      'CNC is advanced roleplay where partners script a scene of pretend resistance ahead of time. Every boundary gets discussed first. A safeword or signal stops everything instantly. Aftercare follows every scene. The paradox is the point: it only works because consent is total.',
    examples: [
      'A detailed negotiation conversation before anything happens. That\'s the real first step.',
      'A scripted scenario with agreed limits and off-limits words or acts',
      'A safeword plus a non-verbal signal, tested before play',
      'Generous aftercare and a debrief, every single time',
    ],
    support:
      'Surrender fantasies show up constantly in sexuality research. In Justin Lehmiller\'s survey of over 4,000 Americans, most respondents reported having had one, so the fantasy itself says nothing bad about you. Acting it out demands more communication than any other kink, which is why experienced players treat CNC as a masterclass in trust.',
    firstStep:
      'Long before any scene, just talk about the fantasy in past tense: "what would have happened is..." Plenty of couples find the conversation alone is electric.',
  },
  petplay: {
    group: 'power',
    name: 'Pet Play',
    emoji: '🐾',
    tagline: 'A collar can be a key to a freer headspace.',
    sparkPrompt: 'Stepping into an animal persona. Kitten, puppy, pony. Collars, headspace, and a doting handler.',
    description:
      'Pet play lets one partner slip into an animal persona while the other cares for them, trains them, or dotes on them. The gear matters less than the headspace: simple, wordless, and free of human worries.',
    examples: [
      'A collar that marks when pet time begins and ends',
      'Fetch, head scratches, treats, and praise',
      'Kitten aloofness or puppy enthusiasm as a whole mood',
      'A handler who runs everything so the pet can just be',
    ],
    support:
      'Pet play has a long-established community with its own events and conventions worldwide. Wanting a simpler, wordless headspace is a real form of rest, and trust is what makes it possible.',
    firstStep:
      'Try ten minutes of the headspace with zero gear. One partner dotes on the other as their chosen animal. See how it feels.',
  },
  caregiver: {
    group: 'power',
    name: 'Caregiver & Nurture Dynamics',
    emoji: '🧸',
    tagline: 'Being cherished is the whole point.',
    sparkPrompt: 'A dynamic built on nurture between adults. One partner protective and guiding, the other cherished and taken care of.',
    description:
      'Caregiver dynamics pair a protective, guiding partner with one who loves being looked after. Tucked in, praised, gently bossed around, completely safe. It\'s an adult dynamic about vulnerability and trust, and it can be as light or as structured as you both want.',
    examples: [
      'One partner planning meals, bedtimes, or comforts for the other',
      'Pet names, soft rules, and lots of reassurance',
      'A "no decisions tonight" gift to a stressed partner',
      'Comfort objects, cozy rituals, being tucked in',
    ],
    support:
      'Wanting to be taken care of, or to be the one who does the caring, is one of the most tender dynamics there is. Between consenting adults it gives vulnerability a safe place to live.',
    firstStep:
      'Give your partner one full cared-for evening where you handle every decision and comfort. Then swap, or repeat. Whichever fits.',
  },
  orgasmcontrol: {
    group: 'power',
    name: 'Orgasm Control & Edging',
    emoji: '⏳',
    tagline: 'Anticipation is your favorite drug.',
    sparkPrompt: 'Pleasure as a game of timing. Building, pausing, denying, or commanding release. Possibly chastity play.',
    description:
      'Orgasm control turns timing into the toy. Edging right up to the brink and pausing. Asking permission. Playful denial that makes the eventual yes overwhelming. For those who love the long game, chastity play with keys and timers.',
    examples: [
      'Edging: approaching the peak and deliberately backing off',
      '"Ask me first" as a game you both enjoy',
      'A denial day that makes the evening land twice as hard',
      'Chastity play with keys, timers, and plenty of teasing',
    ],
    support:
      'Delayed gratification measurably intensifies reward. That\'s well-documented psychology, and this kink is basically that finding put to happy use. Control games around release are common and healthy.',
    firstStep:
      'Try one round of "almost." Build close to the peak, pause for ten breaths, then notice what the wave does when you finally let it land.',
  },

  /* ==================== SPARK: Bondage & Sensation ==================== */

  rope: {
    group: 'bondage',
    name: 'Rope & Shibari',
    emoji: '🎗️',
    tagline: 'Rope as craft, meditation, and embrace.',
    sparkPrompt: 'Rope as an art form. Decorative ties and harnesses, and the slow ritual of tying or being tied.',
    description:
      'Rope bondage, including the Japanese-influenced art of shibari, treats tying as craft and connection. Many sessions never go past the tying itself. The slow ritual. Pressure like a full-body hug. The look of the finished tie.',
    examples: [
      'A simple decorative chest harness worn under clothes',
      'The steady rhythm of rope being wrapped and tensioned',
      'Rope photography as an art form',
      'Learning together from books and classes. The learning is a date in itself.',
    ],
    support:
      'Shibari has a worldwide community of artists and teachers, with beginner classes in most major cities. Loving rope means loving craft, patience, and closeness at the same time.',
    firstStep:
      'Buy one soft practice rope and learn a single decorative wrist wrap from a beginner tutorial. Keep safety shears in reach from day one. It\'s the habit that marks people who know what they\'re doing.',
  },
  sensorydep: {
    group: 'bondage',
    name: 'Sensory Deprivation',
    emoji: '🎧',
    tagline: 'Less input, more sensation.',
    sparkPrompt: 'Dimming the senses. Blindfolds, headphones, soft mitts. Every remaining touch counts double.',
    description:
      'Sensory deprivation removes a sense or two so the rest light up. A blindfold makes every touch a surprise. Headphones turn the world off. Soft mitts quiet the urge to reach out and control things.',
    examples: [
      'A blindfold plus one slow fingertip',
      'Noise-cancelling headphones with a playlist your partner controls',
      'Not knowing where the next touch will land',
      'Floating in stillness while your partner runs the show',
    ],
    support:
      'The brain reliably compensates for a missing sense by turning up the others. You already use this trick when you close your eyes to savor food. This is the same principle with better company.',
    firstStep:
      'Start with just a blindfold and a ten-minute timer. Agree that a single word lifts it instantly.',
  },
  impact: {
    group: 'bondage',
    name: 'Impact Play',
    emoji: '🖐️',
    tagline: 'Rhythm, sting, and glow.',
    sparkPrompt: 'Rhythmic strikes tuned to your taste. From playful spanks to paddles and floggers.',
    description:
      'Impact play runs from a playful swat to paddles, floggers, and crops. It\'s always warmed up gradually, aimed at safe padded areas, and tuned to exactly what the receiver wants. Fans describe the afterglow as head-clearing.',
    examples: [
      'A warm-up of firm pats that slowly builds',
      'A paddle\'s sharp thud versus a flogger\'s spread-out thump',
      'Counting strikes together as a ritual',
      'The warm, floaty glow many people feel afterward',
    ],
    support:
      'Impact play may be the most practiced kink on earth, and its community is obsessive about doing it safely. The glow is endorphins doing their job. Enjoying intensity is body chemistry, not damage.',
    firstStep:
      'Start with hands only, on the padded areas, using a 1-to-10 check-in scale. The receiver calls every number.',
  },
  temperature: {
    group: 'bondage',
    name: 'Temperature & Wax Play',
    emoji: '🕯️',
    tagline: 'Hot, cold, and everything electric between.',
    sparkPrompt: 'Contrast on the skin. Massage-safe wax candles, ice cubes, warmed oil, chilled glass.',
    description:
      'Temperature play uses contrast as its instrument. Low-temperature massage candles that pour like warm silk. Ice traced along the spine. Warmed oil, chilled glass. The gap between hot and cold is where the shiver lives.',
    examples: [
      'Massage candles made to pour warm, not hot',
      'An ice cube melting slowly down the back',
      'Alternating warm oil and cool breath',
      'A chilled spoon, which works far better than it has any right to',
    ],
    support:
      'Your skin\'s temperature receptors are among its most sensitive. This one is pure sensory science, and with body-safe materials it\'s one of the friendliest starting points in kink.',
    firstStep:
      'Buy one massage candle made for skin (regular candles burn too hot) and pair it with a glass of ice. Alternate, and let the receiver rate each pass.',
  },
  tickling: {
    group: 'bondage',
    name: 'Tickling',
    emoji: '🪶',
    tagline: 'Laughter and helplessness in one package.',
    sparkPrompt: 'Tickling as play. Feathers, fingertips, helplessness, and laughing until you beg.',
    description:
      'Tickling (knismolagnia, if you want the formal term) blends touch, teasing, and playful power. The tickler holds all the cards. The ticklee gets to laugh, squirm, and surrender.',
    examples: [
      'Feather-light fingertips on ribs, feet, or neck',
      'A feather or soft brush as the instrument',
      'A hand-signal truce so the game always has an exit',
      'Slow, unbearable anticipation before contact',
    ],
    support:
      'Tickling has a devoted worldwide community, and it\'s one of the few kinks built literally on laughter. Joy and squirming are a real erotic language.',
    firstStep:
      'Agree on a clear stop signal first. Laughing makes the word "stop" unreliable, so use a hand tap. Then map out which spots are fun and which are genuinely too much.',
  },
  electro: {
    group: 'bondage',
    name: 'Electrostimulation',
    emoji: '⚡',
    tagline: 'Tingles by design.',
    sparkPrompt: 'Tingles and pulses from purpose-built, body-safe toys. From a light buzz to a deep thrum.',
    description:
      'E-stim uses purpose-built devices (TENS-style units and specialty toys) to create sensations nothing else can. Champagne-bubble tingles. Deep rhythmic pulses. All of it dialed in precisely.',
    examples: [
      'A TENS unit\'s gentle buzz through sticky pads',
      'Turning the dial up together until you find "ooh"',
      'Patterns and waves instead of constant sensation',
      'Using only devices designed for bodies. Never improvised electronics.',
    ],
    support:
      'E-stim has a well-established, safety-literate community and a whole industry of body-safe gear behind it. Liking a sensation that technology makes possible isn\'t strange. It\'s just specific.',
    firstStep:
      'Start with an entry-level TENS unit on its lowest setting, on a forearm. Learn the sensation somewhere neutral first, and read the safety guidance (never across the chest).',
  },
  marking: {
    group: 'bondage',
    name: 'Biting, Scratching & Marking',
    emoji: '💋',
    tagline: 'Souvenirs you can feel tomorrow.',
    sparkPrompt: 'Bites, scratches, and hickeys. Intensity in the moment, and marks as sweet souvenirs after.',
    description:
      'Marking blends sensation with meaning. There\'s the bright intensity of a bite or scratch in the moment. Then there\'s the private satisfaction of a mark that keeps whispering about last night for days.',
    examples: [
      'A bite on the shoulder at the peak of a moment',
      'Nail trails down the back',
      'A hickey placed where only you two know about it',
      'Agreeing in advance where marks are welcome and where they\'re not',
    ],
    support:
      'The urge to mark and be marked is ancient and tied to belonging. Settle placement in advance and it becomes a sweet mix of intensity and sentiment.',
    firstStep:
      'Have the thirty-second map talk: where marks are welcome, where they must never show. Then let intensity build gradually.',
  },
  edgeplay: {
    group: 'bondage',
    name: 'Thrill & Edge Play',
    emoji: '🎢',
    tagline: 'The rollercoaster principle, with real safety rails required.',
    sparkPrompt: 'High-trust thrill play. Fear, adrenaline, and intensity at the edges. This category requires real education before practice.',
    description:
      'Edge play is the umbrella term for high-intensity, higher-risk play: fear play, knife-style sensation (often done with harmless props), and similar adrenaline games. Be clear-eyed here. This is the one area of kink where "just try it" is bad advice. It calls for real education, experienced mentors, and conservative choices. Some practices under this umbrella, like anything restricting breathing, have no fully safe version at all.',
    examples: [
      'The rollercoaster principle: fear enjoyed inside a container of safety',
      'Prop-based fear play (a cold butter knife reads as dramatic with zero edge)',
      'Adrenaline scenes negotiated in exhaustive detail beforehand',
      'Community workshops and mentors as the entry path, not experimentation',
    ],
    support:
      'Being drawn to adrenaline is the same wiring that loves horror movies and skydiving. Wanting the thrill is valid. So is taking the risk seriously, and learning from experienced educators first is how people honor both.',
    firstStep:
      'Chase the feeling, not the hazard. Start with suspense, anticipation, and harmless props. Treat anything genuinely risky as something that requires in-person education first.',
  },

  /* ==================== SPARK: Roleplay & Imagination ==================== */

  costumes: {
    group: 'imagination',
    name: 'Uniforms & Costumes',
    emoji: '🧥',
    tagline: 'The right outfit changes everything.',
    sparkPrompt: 'The charge of a uniform or costume. On you or on them.',
    description:
      'For uniform and costume lovers, clothing is transformation. The authority of a uniform. The drama of a costume. The instant character shift the right outfit creates.',
    examples: [
      'A partner in a uniform that reads as confident',
      'A costume box that comes out on special nights',
      'Getting dressed up as its own form of foreplay',
      'One signature item, like a jacket or boots, that flips the switch',
    ],
    support:
      'Clothing has carried erotic charge in every culture with a written history. Responding to a costume is responding to story and symbolism. That\'s imagination working exactly as designed.',
    firstStep:
      'Each of you names one outfit you\'d love to see the other in. Thrift stores make this a cheap and very funny date.',
  },
  authority: {
    group: 'imagination',
    name: 'Authority Roleplay',
    emoji: '🏛️',
    tagline: 'Power dynamics, safely on loan.',
    sparkPrompt: 'Charged authority scenarios between adults. Strict professor, demanding boss, commanding officer. All pretend, all chosen.',
    description:
      'Authority roleplay borrows charged power dynamics and plays them out safely between adults who wrote the script together. Professor and student. Boss and new hire. Officer and civilian. The power gap is the electricity, and it works because it isn\'t real.',
    examples: [
      'A "performance review" that goes somewhere reviews never should',
      'A strict instructor demanding extra credit',
      'Formal address, like sir or professor, used to set the scene',
      'Debriefing after, back on equal footing, comparing favorite moments',
    ],
    support:
      'Power-gap fantasies rank among the most common in sexuality research, and the reason makes sense: real life makes those lines uncrossable, so the charge goes to fantasy, where it\'s safe. Playing pretend with a consenting partner harms no one and delights two.',
    firstStep:
      'Pick a scenario, agree on the tone, and give each character a name. The names alone make it easier to step in and out.',
  },
  fantasy: {
    group: 'imagination',
    name: 'Fantasy, Monsters & Cosplay',
    emoji: '🐉',
    tagline: 'Imagination has no dress code.',
    sparkPrompt: 'The fantastical made flesh. Vampires, monsters, aliens, cosplay, furry personas.',
    description:
      'Some desire runs through the fantastical. Vampires and werewolves. Monsters and aliens. Beloved characters. An anthropomorphic persona, which the furry community calls a fursona. It\'s imagination refusing to stop at realism, and why should it?',
    examples: [
      'A vampire scene with all the gothic trimmings',
      'Monster-romance dynamics straight out of the bestseller lists',
      'Couple cosplay of characters with real chemistry',
      'A fursona as a freer, more playful version of yourself',
    ],
    support:
      'Monster romance novels sell in the millions, and fantasy persona communities thrive worldwide. This territory is far more mainstream than it admits at parties. Giving your imagination a body now and then is play at its purest.',
    firstStep:
      'Start with story. Tell each other a short fantastical scenario out loud, then borrow one element for real life: a voice, a persona, a single prop.',
  },
  genderplay: {
    group: 'imagination',
    name: 'Gender Play & Cross-Dressing',
    emoji: '🦋',
    tagline: 'Gender as a playground, not a cage.',
    sparkPrompt: 'Playing with gender expression. Cross-dressing, swapping roles, exploring another side of yourself.',
    description:
      'Gender play explores the charge of stepping across gender lines. Clothing, names, roles, energy. For some people it\'s occasional dress-up. For others it turns out to be a meaningful part of identity. Both are valid, and only you get to define what it means for you.',
    examples: [
      'Clothing coded to another gender, worn for the thrill of it',
      'Swapping traditional roles for a night',
      'A different name and persona for special occasions',
      'Finding out what confidence feels like from the other side',
    ],
    support:
      'Cross-dressing is ancient. Theater history is full of it, and it remains extremely common today. Whether it\'s pure play or something deeper, exploring it is healthy self-knowledge, and you\'re in vast company.',
    firstStep:
      'Start private and low-stakes. One item of clothing, alone or with a trusted partner. Just notice what you feel. Curiosity deserves data, not judgment.',
  },
  medical: {
    group: 'imagination',
    name: 'Medical Play',
    emoji: '🩺',
    tagline: 'The ritual of the exam room.',
    sparkPrompt: 'Clinical roleplay. Exams, gloves, instruments, and the particular vulnerability of the doctor\'s office.',
    description:
      'Medical play borrows the rituals of the clinic. The exam. The gloves. The clipboard questions. The commanding bedside manner. What draws people is the mix of vulnerability, authority, and complete full-body attention.',
    examples: [
      'A thorough "check-up" performed with theatrical seriousness',
      'Nitrile gloves as a sensory experience of their own',
      'Clipboard intake questions that get less clinical as they go',
      'The power dynamic between examiner and examined',
    ],
    support:
      'Medical play is a well-established niche with dedicated communities and gear makers. The core wish, being completely attended to, is one of intimacy\'s oldest, just wearing a lab coat.',
    firstStep:
      'A box of nitrile gloves and a theatrical intake interview is a complete starter kit. Keep anything invasive out of scope until you\'ve both properly researched it.',
  },
  sizeplay: {
    group: 'imagination',
    name: 'Size & Strength Play',
    emoji: '🏋️',
    tagline: 'The delicious physics of difference.',
    sparkPrompt: 'The charge of size and strength difference. Being lifted, pinned, enveloped, or doing the lifting.',
    description:
      'Size and strength play savors physical difference. Being picked up, pinned, or carried. Feeling small and protected, or big and powerful. It runs from real-world lifts all the way to pure giant-and-tiny fantasy.',
    examples: [
      'Being lifted or carried to another room mid-moment',
      'A hand that covers yours completely',
      'Playing up height or strength differences on purpose',
      'Fantasy scenarios of dramatic, impossible size difference',
    ],
    support:
      'The thrill of size difference shows up across every gender and orientation. Protection and power are primal feelings, and enjoying the physics of bodies is about as natural as kink gets.',
    firstStep:
      'Ask for one lift, pin, or carry. Warm up first and lift with your knees, not your back. Then see how the difference feels when it\'s deliberate.',
  },
  breeding: {
    group: 'imagination',
    name: 'Breeding Fantasy',
    emoji: '🌾',
    tagline: 'Primal talk, modern precautions.',
    sparkPrompt: 'The primal fantasy of "breeding." Possessive, purposeful talk and energy, while real-life contraception stays firmly in place.',
    description:
      'Breeding kink is a fantasy of primal purpose. Possessive language. The charged idea of claiming a partner completely, or being claimed. For nearly everyone it lives strictly in dirty talk and energy. The fantasy gets to thrill precisely because contraception keeps reality safely boring.',
    examples: [
      'Possessive, purposeful dirty talk in the moment',
      'The primal framing of claiming and being claimed',
      'A fantasy enjoyed with reality kept firmly separate',
      'Clear contraception agreements that make the fantasy safe to say out loud',
    ],
    support:
      'This ranks among the most-searched fantasies on the internet. The wiring is ancient, and for almost everyone the appeal is intensity and belonging, not literal outcomes. Talk about it openly. Fantasy and family planning are separate conversations, and both deserve clarity.',
    firstStep:
      'Introduce it as vocabulary first: a few charged words in the moment. Have the daylight conversation beforehand about where the fantasy/reality line sits for both of you.',
  },
  hypno: {
    group: 'imagination',
    name: 'Mind Play & Erotic Hypnosis',
    emoji: '🌀',
    tagline: 'The mind is the biggest erogenous zone.',
    sparkPrompt: 'Trance, suggestion, and altered headspace. Guided relaxation that turns the mind itself into the playground.',
    description:
      'Erotic hypnosis and mind play use relaxation, focus, and suggestion to create a floaty, altered headspace. That can mean simple guided relaxation with an erotic glow, or deeper trance play between partners who trust each other completely.',
    examples: [
      'A partner\'s voice guiding a slow, full-body relaxation',
      'Trigger words that call back a marvelous feeling',
      'The floaty, suggestible state fans of this describe',
      'Long trust conversations first. The mind deserves the same care as the body.',
    ],
    support:
      'Fascination with trance is fascination with consciousness itself. Practiced with consent and care, mind play has thoughtful communities and a deep literature behind it.',
    firstStep:
      'Start with a simple guided relaxation read aloud by your partner. No triggers, no depth. Just their voice and your breath. Then talk about what it felt like.',
  },

  /* ==================== SPARK: Seen & Shared ==================== */

  filming: {
    group: 'seen',
    name: 'Filming & Photography',
    emoji: '📸',
    tagline: 'Your own private cinema.',
    sparkPrompt: 'Making private photos or videos together, for an audience of exactly two.',
    description:
      'Some couples love the camera. It adds performance energy in the moment and leaves a private archive after. Two things are non-negotiable: enthusiastic consent from everyone on camera, and genuinely secure storage.',
    examples: [
      'A photoshoot night with good lighting and no deadline',
      'Watching your own premiere together afterward',
      'The performance energy a lens adds',
      'Encrypted, password-protected storage as a standing rule',
    ],
    support:
      'People have been making art of desire for as long as art has existed. With consent and real security habits, a private archive is a love letter you write together.',
    firstStep:
      'Start with photos only, on one designated device. Agree on storage and deletion rules before the first shot. The security talk is what makes the fun sustainable.',
  },
  groupplay: {
    group: 'seen',
    name: 'Group Play & Threesomes',
    emoji: '👥',
    tagline: 'More people, more logistics, more possibility.',
    sparkPrompt: 'Intimacy with more than two. Threesomes, foursomes, or the social world of swinging.',
    description:
      'Group play runs from the classic threesome fantasy to swinging\'s social scene. The fantasy is nearly universal. The practice runs on unglamorous superpowers: communication, boundaries, and honest check-ins before and after.',
    examples: [
      'A threesome negotiated carefully with a trusted third',
      'Swinger events and clubs, which have well-defined etiquette',
      'Same-room versus separate-room boundaries. Every couple draws their own.',
      'The pre-talk and the debrief, which are the real main events',
    ],
    support:
      'In Lehmiller\'s survey of over 4,000 Americans, 89 percent had fantasized about a threesome. It is the single most common fantasy on record. Whether yours stays fantasy or becomes practice, you\'re in the statistical majority.',
    firstStep:
      'Start with the map, not the territory. Each partner writes their boundaries and hopes separately, then compare. For many couples the conversation is the adventure.',
  },
  compersion: {
    group: 'seen',
    name: 'Compersion & Sharing',
    emoji: '💞',
    tagline: 'Their pleasure is your pleasure.',
    sparkPrompt: 'Heat or joy in a partner\'s pleasure with someone else. Cuckolding, hotwifing, or open dynamics.',
    description:
      'Compersion is finding joy, or heat, in a partner\'s pleasure with someone else. On the erotic side it powers cuckolding and hotwifing. On the emotional side it\'s the engine of many open relationships. It flips jealousy\'s script, which is exactly why it fascinates people.',
    examples: [
      'The charge of hearing about a partner\'s date',
      'Hotwifing or cuckold dynamics with rules both partners wrote',
      'Watching a partner be desired and feeling pride instead of threat',
      'Rigorous honesty as the foundation under all of it',
    ],
    support:
      'Cuckolding ranks near the top of reported fantasies for men in multiple large studies, and polyamorous communities treat compersion as a skill worth practicing. Feeling it, or wanting to, is emotional range. Not a defect.',
    firstStep:
      'Test the waters in fantasy first. Talk through a hypothetical together and watch your real reactions, whether that\'s arousal, anxiety, or both, with curiosity instead of judgment.',
  },

  /* ==================== SPARK: Fetish & Body ==================== */

  materials: {
    group: 'fetish',
    name: 'Latex, Leather & Materials',
    emoji: '🖤',
    tagline: 'Texture is a language.',
    sparkPrompt: 'The look, feel, scent, and sound of materials. Latex, leather, PVC, silk, fur.',
    description:
      'Material fetishes respond to fabric as a full experience. The second-skin gleam of latex. Leather\'s scent and creak. Silk\'s glide. It can be about wearing it, touching it, or just looking at it.',
    examples: [
      'A leather jacket that does something to you',
      'The ritual of shining and caring for gear',
      'Latex under good lighting',
      'Silk sheets or gloves as the whole event',
    ],
    support:
      'Leather and latex communities are decades-old cornerstones of kink culture with their own history and pride. A strong sensory preference is wiring, not weirdness. Sommeliers get paid for theirs.',
    firstStep:
      'Go to a fabric or thrift store and let touch lead. One glove, scarf, or jacket in your favorite material is a complete experiment.',
  },
  lingerie: {
    group: 'fetish',
    name: 'Lingerie & Clothing',
    emoji: '🎀',
    tagline: 'What\'s almost hidden is most seen.',
    sparkPrompt: 'The charge of special clothing. Lingerie, stockings, a particular garment that transforms the wearer.',
    description:
      'Lingerie love is about transformation and reveal. The garment changes how the wearer carries themselves. The slow unveiling becomes its own act. And there\'s the quiet thrill of something special hidden under ordinary clothes.',
    examples: [
      'A set worn all day as a private secret',
      'The slow reveal, treated as an event',
      'Stockings and garters, including the ritual of putting them on',
      'Shopping together as extended foreplay',
    ],
    support:
      'Entire industries exist because clothing is erotic to nearly everyone. The only thing that varies is degree. Savoring dress and undress is romance with good production values.',
    firstStep:
      'Shop together, in person or online, and let each partner pick one piece they\'d love to see. The picking is half the fun.',
  },
  feet: {
    group: 'fetish',
    name: 'Feet & Footwear',
    emoji: '🦶',
    tagline: 'The most common fetish on the planet.',
    sparkPrompt: 'Feet and footwear as a source of attraction. Massaging, admiring, adoring, or beautiful shoes.',
    description:
      'Foot attraction is the world\'s most common body-focused kink. It covers foot massages, pedicure aesthetics, and heels or boots as objects of devotion. There\'s even a neuroscience theory for why: in the brain\'s body map, the region for feet sits right next to the one for genitals.',
    examples: [
      'A long, attentive foot massage as devotion',
      'Painted toes, anklets, pedicure aesthetics',
      'A partner\'s favorite heels or boots, kept for special nights',
      'Kisses that start at the ankle',
    ],
    support:
      'A 2007 study analyzing fetish communities found feet to be the most common body-part preference by a wide margin. You are in enormous company, and the wiring may be literal. Nothing about this is strange.',
    firstStep:
      'Offer, or request, a proper ten-minute foot massage with lotion and full attention. Devotion disguised as self-care.',
  },
  bodyworship: {
    group: 'fetish',
    name: 'Body Worship',
    emoji: '🏛️',
    tagline: 'Reverence as an erotic act.',
    sparkPrompt: 'Devoted, unhurried adoration of a partner\'s body. Or being the one adored.',
    description:
      'Body worship makes reverence the entire event. Slow, devoted attention to a partner\'s body, treating every inch as worthy of adoration. Or the vulnerable glory of being on the receiving end.',
    examples: [
      'A slow head-to-toe appreciation, with commentary',
      'Massage as devotion rather than utility',
      'An entire evening focused on one adored feature',
      'Lying back and being adored, with nothing expected in return',
    ],
    support:
      'Most of us are trained to criticize our bodies. Body worship practices the opposite, and both giving and receiving it build the feeling of being worthy. Call it what it is: appreciation with the volume turned up.',
    firstStep:
      'Take turns. Fifteen minutes of unhurried appreciation each. The receiver\'s only job is to accept it.',
  },
  nichebody: {
    group: 'fetish',
    name: 'Hands, Hair & Specific Features',
    emoji: '🤲',
    tagline: 'Your eye knows exactly what it loves.',
    sparkPrompt: 'A particular pull toward a specific feature. Hands, forearms, hair, necks, shoulders, voices.',
    description:
      'Some attraction is precise. Hands and forearms (the formal term is quirofilia). Hair to touch or be touched by (trichophilia). Necks, shoulders, voices. A specific eye is a connoisseur\'s eye.',
    examples: [
      'Watching someone\'s hands while they work',
      'Hair play: brushing, braiding, a gentle tug',
      'Rolled-up sleeves as a genuine event',
      'A voice that does more than any picture could',
    ],
    support:
      'Nearly everyone has a thing, the feature that catches them first. Naming yours just means you know your own taste. And specific taste makes for wonderfully specific compliments.',
    firstStep:
      'Tell your partner exactly which feature undoes you and why. Specific desire, said out loud, is one of the best compliments there is.',
  },
  wetmessy: {
    group: 'fetish',
    name: 'Food & Messy Play',
    emoji: '🍰',
    tagline: 'Permission to make a glorious mess.',
    sparkPrompt: 'Playful mess. Whipped cream, chocolate sauce, cake, or the general joy of getting gloriously messy.',
    description:
      'Wet-and-messy play, known as sploshing, is the giddy sensory joy of food and mess. Whipped cream. Chocolate sauce. An entire cake met with enthusiasm. It\'s texture, taste, absurdity, and childlike permission rolled together.',
    examples: [
      'Whipped cream and chocolate sauce as art supplies',
      'The classic pie to the face, lovingly delivered',
      'A tarp-covered floor as a canvas',
      'The laughing shower together afterward',
    ],
    support:
      'Sploshing may be the most cheerful corner of kink. It runs on laughter. Wanting permission to be messy and ridiculous is wanting play in its purest form.',
    firstStep:
      'Start with dessert and a towel. One can of whipped cream, applied artistically, with the shower already warm.',
  },
  watersports: {
    group: 'fetish',
    name: 'Watersports',
    emoji: '💧',
    tagline: 'More common than anyone admits at dinner.',
    sparkPrompt: 'Erotic play involving pee. A taboo-tinged interest that\'s far more common than polite company admits.',
    description:
      'Watersports (urolagnia, formally) is erotic interest in pee. For most people it\'s less about the substance than the intimacy, the taboo, and the total-trust vulnerability of sharing something normally private. Like all body-fluid play it comes with common-sense hygiene practices, which the community discusses openly.',
    examples: [
      'The charged intimacy of a private act, shared',
      'The shower as the practical classic',
      'The taboo itself as the engine of the thrill',
      'Frank hygiene and boundary talks beforehand. Unsexy, then very sexy.',
    ],
    support:
      'Surveys keep finding this interest is far more widespread than its reputation suggests. Taboo is a normal amplifier of desire. Enjoying it with a consenting partner and sensible hygiene is a preference, not a pathology.',
    firstStep:
      'Raise it as fantasy first and gauge interest honestly. If you both lean in, the shower is the traditional low-stakes venue.',
  },

  /* ==================== SPARK: Voice & Mind ==================== */

  dirtytalk: {
    group: 'mind',
    name: 'Dirty Talk',
    emoji: '🎙️',
    tagline: 'Language is your favorite toy.',
    sparkPrompt: 'Explicit, charged language. Hearing it, saying it, or trading it by text all day.',
    description:
      'For dirty-talk lovers, words do the heaviest lifting. Narration. Commands. Confessions. The right filth in the right tone. Which words work is intensely personal, and finding out together is part of the fun.',
    examples: [
      'A running narration of what\'s happening, or about to',
      'Texts through the day that build toward the evening',
      'Learning which words land and which clang',
      'A voice note that outperforms any photo',
    ],
    support:
      'The brain is the biggest erogenous zone, and language is how you reach it directly. Being word-driven means you can flirt from anywhere with a phone signal. Use it well.',
    firstStep:
      'Trade "green words" lists: words and phrases you each love, plus any that are off-limits. Then practice by text, where nobody can see you blush.',
  },
  degradation: {
    group: 'mind',
    name: 'Degradation & Objectification',
    emoji: '🎭',
    tagline: 'Sharp words in a soft container.',
    sparkPrompt: 'Consensual humiliation. Chosen harsh words, or being treated as a beautiful object, thrilling precisely because you\'re safe.',
    description:
      'Degradation play uses deliberately harsh words or objectifying dynamics, chosen together, inside a container of real affection. For some people that contrast is electric. The golden rules: vocabulary negotiated in advance, off-limits topics listed, and warm aftercare that says what\'s actually true.',
    examples: [
      'Specific "mean" words agreed on in advance, with forbidden ones listed too',
      'Being treated as a gorgeous object for an evening',
      'The charge of contrast between scene words and real regard',
      'Aftercare that explicitly reaffirms what\'s true underneath',
    ],
    support:
      'Praise and degradation are two ends of the same axis: intensity of attention. Plenty of people enjoy both. Liking sharp words inside real safety is contrast play, and the negotiation it takes tends to deepen trust.',
    firstStep:
      'Build the vocabulary lists first. Thrilling words, neutral words, never-words. Start with the mildest item on the list and add extra-warm aftercare.',
  },

  /* ==================== SPARK: Connection ==================== */

  tantric: {
    group: 'connection',
    name: 'Slow & Mindful Intimacy',
    emoji: '🧘',
    tagline: 'Presence as practice.',
    sparkPrompt: 'Slow, meditative intimacy. Breathwork, extended eye contact, unhurried touch, tantra-inspired presence.',
    description:
      'Tantra-inspired intimacy treats presence itself as the practice. Synchronized breath. Long eye contact. Touch slowed way down. Sessions measured in closeness rather than milestones.',
    examples: [
      'Breathing in sync for a few minutes before anything else',
      'Eye-gazing that feels awkward at minute one and profound by minute three',
      'Touch at a quarter of your usual speed',
      'Sessions with no goal beyond staying present together',
    ],
    support:
      'Mindfulness research keeps confirming what tantra traditions claimed for centuries: attention is the real aphrodisiac. Craving slowness in a fast world is wisdom, not blandness.',
    firstStep:
      'Try three minutes of synchronized breathing and eye contact before your next intimate evening. Expect giggles first. Depth comes second.',
  },
};

/* ==================== PART 1: broad weighted questions ==================== */

const QUESTIONS = [
  {
    question: 'Picture your ideal intimate evening. Who\'s steering the ship?',
    options: [
      { label: 'Me. I love planning every detail and guiding my partner through it', scores: { dominance: 3 } },
      { label: 'My partner. I want to be swept along and told what happens next', scores: { submission: 3 } },
      { label: 'We trade off. The back-and-forth is half the fun', scores: { dominance: 1, submission: 1, roleplay: 1 } },
      { label: 'No one. We move together, slow and equal', scores: { sensual: 3 } },
    ],
  },
  {
    question: 'A partner gently holds your wrists so you can\'t move. Your honest reaction?',
    options: [
      { label: 'Electric. I\'d love even more restraint than that', scores: { bondage: 3, submission: 1 } },
      { label: 'Intriguing. I\'d be curious to explore it slowly', scores: { bondage: 2 } },
      { label: 'I\'d rather be the one doing the holding', scores: { bondage: 2, dominance: 2 } },
      { label: 'Not my thing. I prefer my hands free to touch', scores: { sensual: 2 } },
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
      { label: 'Already have a fake name and a backstory. Let\'s go', scores: { roleplay: 3 } },
      { label: 'Would play along and probably enjoy it', scores: { roleplay: 2 } },
      { label: 'Would rather skip the acting and just be us', scores: { sensual: 2 } },
      { label: 'Would prefer a scenario where one of us is clearly in charge', scores: { roleplay: 2, dominance: 1, submission: 1 } },
    ],
  },
  {
    question: 'Your partner watches you undress from across the room, clearly enjoying it. You feel…',
    options: [
      { label: 'Powerful. I\'d slow down and make a show of it', scores: { exhibition: 3 } },
      { label: 'Flattered but a bit shy. A little audience goes a long way', scores: { exhibition: 1, praise: 1 } },
      { label: 'I\'d rather swap places and do the watching', scores: { voyeurism: 3 } },
      { label: 'I\'d pull them close. Distance is overrated', scores: { sensual: 2 } },
    ],
  },
  {
    question: 'Which of these fantasies have you replayed more than once?',
    options: [
      { label: 'Being completely at someone\'s mercy (safely, with someone I trust)', scores: { submission: 2, bondage: 2 } },
      { label: 'Having someone completely at mine', scores: { dominance: 2, bondage: 1 } },
      { label: 'Watching, or being watched, with total permission', scores: { voyeurism: 2, exhibition: 1 } },
      { label: 'A perfect, deeply romantic night where time slows down', scores: { sensual: 3 } },
    ],
  },
  {
    question: 'Rules and rituals in a relationship (a nickname only they use, a task, a routine) sound…',
    options: [
      { label: 'Wonderful. I\'d love following rules someone set just for me', scores: { submission: 3, praise: 1 } },
      { label: 'Wonderful. I\'d love being the one who sets them', scores: { dominance: 3 } },
      { label: 'Fun as an occasional game, not a lifestyle', scores: { roleplay: 1, submission: 1 } },
      { label: 'Unnecessary. Spontaneity and equality suit me better', scores: { sensual: 2 } },
    ],
  },
  {
    question: 'A blindfold appears. What happens next?',
    options: [
      { label: 'I put it on. Not seeing makes every touch twice as intense', scores: { bondage: 2, sensation: 2, submission: 1 } },
      { label: 'I put it on them. I love having all the control of the moment', scores: { bondage: 2, dominance: 2, voyeurism: 1 } },
      { label: 'We take turns. Both sides sound fun', scores: { bondage: 2, sensation: 1 } },
      { label: 'I set it aside. Eye contact is my favorite part', scores: { sensual: 3 } },
    ],
  },
  {
    question: 'During intimacy, how much talking do you want?',
    options: [
      { label: 'Constant praise and sweet words. Tell me everything you\'re feeling', scores: { praise: 3 } },
      { label: 'Confident commands. A firm voice undoes me', scores: { submission: 2, praise: 1 } },
      { label: 'I want to be the voice: directing, praising, teasing', scores: { dominance: 2, praise: 2 } },
      { label: 'Very little. Breath, movement, and eye contact say it all', scores: { sensual: 2 } },
    ],
  },
  {
    question: 'Honestly, what draws you to trying something new in intimacy?',
    options: [
      { label: 'The adrenaline. I chase intensity and new highs', scores: { sensation: 2, exhibition: 1 } },
      { label: 'The trust. Doing something vulnerable with someone safe', scores: { bondage: 1, submission: 2 } },
      { label: 'The play. Novelty and imagination keep things alive', scores: { roleplay: 2, sensation: 1 } },
      { label: 'The closeness. Anything new should bring us emotionally closer', scores: { sensual: 2, praise: 1 } },
    ],
  },
  {
    question: 'Your partner says: "Tonight, you\'re in charge of everything." You…',
    options: [
      { label: 'Light up. I\'ve already got ideas', scores: { dominance: 3 } },
      { label: 'Negotiate. Can they be in charge instead?', scores: { submission: 3 } },
      { label: 'Turn it into a game with a scenario and stakes', scores: { roleplay: 2, dominance: 1 } },
      { label: 'Plan something slow, romantic, and unhurried', scores: { sensual: 2, dominance: 1 } },
    ],
  },
  {
    question: 'Aftercare time. What sounds most like heaven once things wind down?',
    options: [
      { label: 'Being held, praised, and told how wonderful I was', scores: { praise: 2, submission: 2 } },
      { label: 'Taking care of my partner: water, blankets, soft words', scores: { dominance: 2, praise: 1 } },
      { label: 'Laughing together about the characters we just played', scores: { roleplay: 2, sensual: 1 } },
      { label: 'Long, quiet cuddling. No words needed', scores: { sensual: 3 } },
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
      { label: 'Honestly, no one. I rarely or never feel sexual attraction', value: 'X' },
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
      { label: 'Only a different gender. No curiosity beyond that', value: 0 },
      { label: 'A different gender, though I\'ve wondered about my own once or twice', value: 1.5 },
      { label: 'I\'d be open to a genuinely wide range of people', value: 3 },
      { label: 'My own gender, though I\'ve wondered about others once or twice', value: 4.5 },
      { label: 'Only my own gender. No curiosity beyond that', value: 6 },
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
    label: 'Kinsey 0: Exclusively heterosexual',
    description:
      'Your attractions point consistently toward people of a different gender than your own. On the 0-to-6 scale Alfred Kinsey published in 1948, that places you at 0, exclusively heterosexual. Like every point on the scale, it\'s simply a description of where your attractions naturally live. Clear, valid, and yours.',
  },
  1: {
    label: 'Kinsey 1: Predominantly heterosexual, only incidentally homosexual',
    description:
      'Your attractions lean strongly toward a different gender, with an occasional flicker of curiosity toward your own. Kinsey\'s research found this pattern to be very common. A 1 means your compass points one way with a little natural range, and that\'s a completely normal way for attraction to work.',
  },
  2: {
    label: 'Kinsey 2: Predominantly heterosexual, but more than incidentally homosexual',
    description:
      'You\'re mostly drawn to a different gender, but attraction to your own gender is a real, recurring part of your experience. More than a passing flicker. Many people at a 2 call themselves heteroflexible or bi-curious. Whatever words fit, this blend is common and completely valid.',
  },
  3: {
    label: 'Kinsey 3: Equally heterosexual and homosexual',
    description:
      'Your attractions land in the middle: people of your own gender and other genders draw you roughly equally. This is the classic bisexual point on Kinsey\'s scale. For you, attraction is probably about the person more than the package. Many people describe that as freeing.',
  },
  4: {
    label: 'Kinsey 4: Predominantly homosexual, but more than incidentally heterosexual',
    description:
      'You\'re mostly drawn to your own gender, while attraction to other genders remains a genuine part of your experience. A 4 is a rich, real pattern of attraction that plenty of people share. Your mix is yours, and it\'s completely valid.',
  },
  5: {
    label: 'Kinsey 5: Predominantly homosexual, only incidentally heterosexual',
    description:
      'Your attractions point strongly toward your own gender, with only occasional flickers elsewhere. A 5 means your compass is clear, with a little natural range. That\'s a very common shape for attraction to take, and entirely valid.',
  },
  6: {
    label: 'Kinsey 6: Exclusively homosexual',
    description:
      'Your attractions point consistently toward people of your own gender. On Kinsey\'s scale that\'s a 6, exclusively homosexual. Like every point on the scale, it\'s a clear, valid description of where your attractions naturally live.',
  },
  X: {
    label: 'Kinsey X: Little or no sexual attraction',
    description:
      'Your answers suggest sexual attraction plays little or no role in how you connect with people. Kinsey labeled this "X." Today many people describe it as being on the asexual spectrum. It\'s a real, recognized orientation, not a phase or a problem. Plenty of asexual people enjoy romance, intimacy, and deep connection on their own terms.',
  },
};

/* General self-discovery suggestions appended to everyone's results. */
const GENERAL_SUGGESTIONS = [
  'Keep a private desire journal. Noting what sparked a "yes," a "curious," or a "no" teaches you your own patterns faster than anything else.',
  'Share one result from this quiz with a partner as a conversation starter. "This said I might like X, what do you think?" is a famously easy opener.',
  'Learn the basics of consent culture: safewords, check-ins, and aftercare. They make every experiment on this list better.',
  'Two books worth your time: "Come As You Are" by Emily Nagoski on how desire works, and "The New Topping Book" and "The New Bottoming Book" by Easton and Hardy on power play.',
  'Retake this quiz in six months. Desire changes as you do, and watching your own answers shift is self-knowledge in motion.',
];

/* Make the database available to the server for building result emails. */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GROUPS, SPARK_SCALE, CATEGORIES, QUESTIONS, KINSEY_QUESTIONS, KINSEY_RESULTS, GENERAL_SUGGESTIONS };
}
