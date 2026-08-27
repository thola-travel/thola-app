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
  { label: 'Strongly appeals', value: 1 },
  { label: 'Curious', value: 0.55 },
  { label: 'Neutral', value: 0.15 },
  { label: 'Does not appeal', value: 0 },
];

const CATEGORIES = {
  /* ==================== BROAD (scored from Part 1) ==================== */

  dominance: {
    group: 'power',
    name: 'Dominance',
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
      'Dominance themes appear in a large minority of adults\' reported fantasies (Joyal & Carpentier, 2017). In practice the role rests on negotiation and continuous monitoring of the partner\'s state, not on force of personality.',
    firstStep:
      'Plan one evening start to finish and walk your partner through it in a warm, confident voice. Compare notes afterward about what worked.',
  },
  submission: {
    group: 'power',
    name: 'Submission',
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
      'Submission fantasies are among the most frequently reported in large surveys, across genders. Because the arrangement is negotiated and revocable, researchers classify it as agreed role division rather than passivity.',
    firstStep:
      'Hand over one small decision on purpose. What you wear, what happens first, who picks the music. Then just notice how it feels to follow.',
  },
  bondage: {
    group: 'bondage',
    name: 'Bondage & Restraint',
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
      'Restraint ranks near the top of reported fantasies in population studies; roughly half of Joyal & Carpentier\'s (2017) sample reported interest in some form. Standard practice pairs any restraint with an agreed release signal.',
    firstStep:
      'Start with a silk scarf or soft velcro cuffs. Agree on a release word first, and keep the first session short.',
  },
  sensation: {
    group: 'bondage',
    name: 'Sensation Play',
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
      'Skin carries separate receptor systems for pressure, temperature, and light touch, and alternating them measurably heightens response. Preference for contrast is a sensory processing pattern within normal variation.',
    firstStep:
      'Try a "sensation menu" night. Five different touches, eyes closed, and you rate each one together after.',
  },
  sadism: {
    group: 'bondage',
    name: 'Sadism',
    tagline: 'Arousal from delivering consensual intensity.',
    description:
      'Consensual sadism is arousal from delivering intensity a partner craves, and from watching it land. Ethical sadists are defined by attunement: they read every reaction, negotiate everything first, and stop on a word. The reaction is the reward, and it only counts if it was asked for.',
    examples: [
      'Delivering the sting a partner begged for, and savoring the gasp',
      'Watching a partner\'s face while intensity builds',
      'Negotiating limits in detail beforehand, then playing inside them',
      'Warm, attentive aftercare as the second half of the job',
    ],
    support:
      'Consensual sadism is distinguished from the clinical disorder by consent and partner welfare; DSM-5 draws the same line. Interest in administering agreed intensity appears in a substantial minority of adults.',
    firstStep:
      'Ask a willing partner to rate intensity out loud from 1 to 10 while you experiment with grip, pace, and pressure. Learning to read their numbers is the skill everything else builds on.',
  },
  masochism: {
    group: 'bondage',
    name: 'Masochism',
    tagline: 'Intensity lands as pleasure.',
    description:
      'Masochism means your body processes chosen intensity as pleasure: the sting, the ache, the endorphin wave, the floaty clarity after. It\'s on your terms, at your intensity, with your safeword. Many masochists describe it as release, focus, or even meditation.',
    examples: [
      'The right sting reading as heat instead of hurt',
      'Asking for more when the wave builds',
      'The pleasant ache the next day that keeps replaying the night',
      'The floaty, clear-headed state intense play can bring on',
    ],
    support:
      'Chosen pain triggers endorphin and adrenaline release that many nervous systems register as euphoria; the mechanism parallels endurance sport and capsaicin tolerance. By current diagnostic standards, consensual masochism is non-pathological.',
    firstStep:
      'Explore your own dial first: firm pressure, a hot shower turned up a notch, a hard massage. Notice exactly where "more" stops being the honest answer, and treat that as your starting map.',
  },
  roleplay: {
    group: 'imagination',
    name: 'Roleplay & Scenarios',
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
      'Nearly all adults report sexual fantasy, and scenario play is fantasy enacted. Novelty is a documented contributor to arousal in long-term relationships.',
    firstStep:
      'Exchange one scenario each in writing and run the milder one. Fluency comes with repetition, not first-attempt performance.',
  },
  exhibition: {
    group: 'seen',
    name: 'Exhibitionism',
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
      'Arousal from being watched by a consenting audience is a common pattern. Audience consent is the operative ethical and legal line; within it, this is ordinary variation.',
    firstStep:
      'Try a slow, well-lit reveal for an audience of one. You control the pace. They provide the applause.',
  },
  voyeurism: {
    group: 'seen',
    name: 'Voyeurism',
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
      'Visual stimuli are a primary arousal channel for much of the population. Consensual watching, where the watched party wants the audience, is distinct in kind from non-consensual voyeurism.',
    firstStep:
      'Ask your partner if you can just watch for five minutes, hands off. Afterward, tell them exactly what you loved seeing.',
  },
  praise: {
    group: 'mind',
    name: 'Praise & Worship',
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
      'Verbal affirmation engages reward pathways, and responsiveness to it during intimacy is a stable individual difference. It indexes attunement to social feedback, not dependence.',
    firstStep:
      'State three specific behaviors you respond to in your partner, and ask which phrases they respond to in return.',
  },
  sensual: {
    group: 'connection',
    name: 'Sensual & Romantic Connection',
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
      'Low interest across kink categories is itself a stable and common profile. Emphasis on presence and connection predicts relationship satisfaction as strongly as any specific practice.',
    firstStep:
      'Plan one unhurried evening with phones in another room. The only goal is presence. Everything else is a bonus.',
  },

  /* ==================== SPARK: Power & Control ==================== */

  switchplay: {
    group: 'power',
    name: 'Switching',
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
      'In community surveys a substantial share of practitioners identify as switches. Direct experience of both roles is associated with stronger negotiation skill in either.',
    firstStep:
      'Try a flip night. One of you leads until a timer goes off, then you trade. Compare notes after.',
  },
  bratplay: {
    group: 'power',
    name: 'Brat & Tamer Play',
    tagline: 'Negotiated defiance and pursuit.',
    sparkPrompt: 'Playful defiance. Teasing, breaking the "rules" on purpose, and being lovingly put back in line (or doing the taming).',
    roles: [["Yes, as the brat","The fun for you is being the playful troublemaker: testing, teasing, and being lovingly reined in."],["Yes, as the tamer","You want the tamer's chair. Meeting the sass, keeping a straight face, and winning."]],
    description:
      'Brat play is power exchange with a wink. One partner cheekily resists and provokes. The other rises to the challenge. The misbehavior is the game, and both of you are in on it.',
    examples: [
      'Sassy backtalk designed to earn a pre-agreed consequence',
      '"Make me" as an invitation',
      'The tamer keeping a stern face while clearly delighted',
      'Negotiated "punishments" that are really rewards',
    ],
    support:
      'Structured rule-testing is a recognized power-exchange style in which the resistance is part of the negotiated script. It selects for partners who prefer challenge over formality.',
    firstStep:
      'Agree on one rule, one playful consequence, and a safeword, then run a single evening under those terms.',
  },
  discipline: {
    group: 'power',
    name: 'Rules, Rituals & Discipline',
    tagline: 'Structure itself is the thrill.',
    sparkPrompt: 'Ongoing structure in a dynamic. Agreed rules, daily tasks, titles, and playful consequences.',
    roles: [["Yes, following the rules","Structure feels best from the inside: rules set for you, tasks to complete, praise to earn."],["Yes, setting the rules","You want to be the author: writing the rules, assigning the tasks, enforcing them warmly."]],
    description:
      'For some people the charge lives in the structure itself. Rules to follow or set. Rituals that mark the dynamic. Tasks, titles, and consequences you both picked in advance. Related corners of this world include protocol dynamics and financial domination (consensual, budgeted "tributes").',
    examples: [
      'A morning check-in text required by "the rules"',
      'Titles or honorifics used only in private',
      'Task lists with playful rewards and consequences',
      'Negotiating what the dynamic includes, which is half the fun',
    ],
    support:
      'Rule-based dynamics externalize structure that many participants report as regulating in itself. The documented range runs from single agreed rules to full protocol relationships.',
    firstStep:
      'Write one rule together that you\'d both enjoy for a single week. Then review it like co-authors and keep only what you actually liked.',
  },
  primal: {
    group: 'power',
    name: 'Primal Play',
    tagline: 'Instinct over etiquette.',
    sparkPrompt: 'Raw, instinctive energy. Chasing, wrestling, growling, pinning. Less talking, more instinct.',
    roles: [["Yes, as the prey","Being chased and caught is your side of this: the sprint, the capture, the surrender."],["Yes, as the hunter","Your instinct is to chase, catch, and pin. The pursuit is the point."]],
    description:
      'Primal play strips intimacy down to instinct. Chase and capture. Wrestling for the upper hand. Growls instead of sentences. It\'s athletic, cathartic, and surprisingly freeing.',
    examples: [
      'A playful chase from one room to another',
      'Wrestling where the winner sets the pace',
      'Growling, snarling, or wordless vocal play',
      'Hunter-and-prey games negotiated in advance',
    ],
    support:
      'Chase-and-capture play engages the same arousal-adrenaline loop as competitive physical sport. It is an established style within power exchange with its own community norms.',
    firstStep:
      'Try a sixty-second pillow-soft wrestling match with a clear stop word. Whoever ends up on top leads what happens next.',
  },
  cnc: {
    group: 'power',
    name: 'Consensual Non-Consent',
    tagline: 'Scripted surrender, absolute trust.',
    sparkPrompt: 'Carefully pre-scripted "resistance" scenes. Planned together in detail beforehand, with a safeword that ends everything instantly.',
    roles: [["Yes, surrendering","The appeal for you is giving up control inside a scene you scripted and can end instantly."],["Yes, in control","You'd hold the reins: running the scripted scene, reading your partner, keeping it safe."]],
    description:
      'CNC is advanced roleplay where partners script a scene of pretend resistance ahead of time. Every boundary gets discussed first. A safeword or signal stops everything instantly. Aftercare follows every scene. The paradox is the point: it only works because consent is total.',
    examples: [
      'A detailed negotiation conversation before anything happens. That\'s the real first step.',
      'A scripted scenario with agreed limits and off-limits words or acts',
      'A safeword plus a non-verbal signal, tested before play',
      'Generous aftercare and a debrief, every single time',
    ],
    support:
      'Surrender fantasies are among the most commonly reported in the fantasy literature (Lehmiller, 2018), and researchers are explicit that they do not reflect real-world wishes. Enactment requires the most detailed negotiation of any practice measured here.',
    firstStep:
      'Well before any scene, discuss the fantasy in the conditional tense and gauge both responses. Many couples find the discussion itself sufficient.',
  },
  petplay: {
    group: 'power',
    name: 'Pet Play',
    tagline: 'Role immersion in an animal persona.',
    sparkPrompt: 'Stepping into an animal persona. Kitten, puppy, pony. Collars, headspace, and a doting handler.',
    roles: [["Yes, as the pet","The wordless headspace is yours: collar on, human worries off."],["Yes, as the handler","You're the doting one: care, training, treats, and running the whole show."]],
    description:
      'Pet play lets one partner slip into an animal persona while the other cares for them, trains them, or dotes on them. The gear matters less than the headspace: simple, wordless, and free of human worries.',
    examples: [
      'A collar that marks when pet time begins and ends',
      'Fetch, head scratches, treats, and praise',
      'Kitten aloofness or puppy enthusiasm as a whole mood',
      'A handler who runs everything so the pet can just be',
    ],
    support:
      'The documented appeal is role immersion that suspends verbal, adult self-monitoring; practitioners describe the state as restful. An established international community exists.',
    firstStep:
      'Try ten minutes of the headspace with zero gear. One partner dotes on the other as their chosen animal. See how it feels.',
  },
  caregiver: {
    group: 'power',
    name: 'Caregiver & Nurture Dynamics',
    tagline: 'Nurture as an erotic structure.',
    sparkPrompt: 'A dynamic built on nurture between adults. One partner protective and guiding, the other cherished and taken care of.',
    roles: [["Yes, being cared for","Being doted on, guided, and kept safe is your side of this dynamic."],["Yes, as the caregiver","Nurturing is your engine: planning, protecting, and taking every decision off their plate."]],
    description:
      'Caregiver dynamics pair a protective, guiding partner with one who loves being looked after. Tucked in, praised, gently bossed around, completely safe. It\'s an adult dynamic about vulnerability and trust, and it can be as light or as structured as you both want.',
    examples: [
      'One partner planning meals, bedtimes, or comforts for the other',
      'Pet names, soft rules, and lots of reassurance',
      'A "no decisions tonight" gift to a stressed partner',
      'Comfort objects, cozy rituals, being tucked in',
    ],
    support:
      'Caregiving and care-receiving dynamics map onto attachment behavior expressed between consenting adults. Reported benefits center on structure and perceived safety rather than surface aesthetics.',
    firstStep:
      'Give your partner one full cared-for evening where you handle every decision and comfort. Then swap, or repeat. Whichever fits.',
  },
  orgasmcontrol: {
    group: 'power',
    name: 'Orgasm Control & Edging',
    tagline: 'Timing and denial as instruments.',
    sparkPrompt: 'Pleasure as a game of timing. Building, pausing, denying, or commanding release. Possibly chastity play.',
    roles: [["Yes, being controlled","You want your release in someone else's hands: asking, waiting, earning it."],["Yes, holding the keys","You want to be the timekeeper: building, pausing, granting, denying."]],
    description:
      'Orgasm control turns timing into the toy. Edging right up to the brink and pausing. Asking permission. Playful denial that makes the eventual yes overwhelming. For those who love the long game, chastity play with keys and timers.',
    examples: [
      'Edging: approaching the peak and deliberately backing off',
      '"Ask me first" as a game you both enjoy',
      'A denial day that makes the evening land twice as hard',
      'Chastity play with keys, timers, and plenty of teasing',
    ],
    support:
      'Delay reliably intensifies eventual reward, a standard reinforcement finding. Control-of-release practices are widespread across genders and orientations.',
    firstStep:
      'Try one round of "almost." Build close to the peak, pause for ten breaths, then notice what the wave does when you finally let it land.',
  },

  /* ==================== SPARK: Bondage & Sensation ==================== */

  rope: {
    group: 'bondage',
    name: 'Rope & Shibari',
    tagline: 'Rope as craft, meditation, and embrace.',
    sparkPrompt: 'Rope as an art form. Decorative ties and harnesses, and the slow ritual of tying or being tied.',
    roles: [["Yes, being tied","The full-body pressure and stillness of being wrapped is what draws you."],["Yes, tying","The rigger's side is yours: the craft, the patterns, the focus of the tie."]],
    description:
      'Rope bondage, including the Japanese-influenced art of shibari, treats tying as craft and connection. Many sessions never go past the tying itself. The slow ritual. Pressure like a full-body hug. The look of the finished tie.',
    examples: [
      'A simple decorative chest harness worn under clothes',
      'The steady rhythm of rope being wrapped and tensioned',
      'Rope photography as an art form',
      'Learning together from books and classes. The learning is a date in itself.',
    ],
    support:
      'Rope bondage has a developed technical tradition (shibari) with formal instruction available in most large cities. Reported injuries concentrate in nerve compression, which is why beginner teaching emphasizes placement and cutting tools.',
    firstStep:
      'Buy one soft practice rope and learn a single decorative wrist wrap from a beginner tutorial. Keep safety shears within reach from the first session.',
  },
  sensorydep: {
    group: 'bondage',
    name: 'Sensory Deprivation',
    tagline: 'Less input, more sensation.',
    sparkPrompt: 'Dimming the senses. Blindfolds, headphones, soft mitts. Every remaining touch counts double.',
    roles: [["Yes, senses dimmed","You want the blindfold side: the world off, every touch a surprise."],["Yes, running the show","You want to control the inputs: choosing what your partner feels next while they float."]],
    description:
      'Sensory deprivation removes a sense or two so the rest light up. A blindfold makes every touch a surprise. Headphones turn the world off. Soft mitts quiet the urge to reach out and control things.',
    examples: [
      'A blindfold plus one slow fingertip',
      'Noise-cancelling headphones with a playlist your partner controls',
      'Not knowing where the next touch will land',
      'Floating in stillness while your partner runs the show',
    ],
    support:
      'Removing one sensory channel reliably increases sensitivity in the remaining ones, a well-replicated perception finding. Blindfolds are the most common entry point in practice surveys.',
    firstStep:
      'Start with just a blindfold and a ten-minute timer. Agree that a single word lifts it instantly.',
  },
  impact: {
    group: 'bondage',
    name: 'Impact Play',
    tagline: 'Rhythm, sting, and glow.',
    sparkPrompt: 'Rhythmic strikes tuned to your taste. From playful spanks to paddles and floggers.',
    roles: [["Yes, receiving","You're on the receiving side: the rhythm, the sting, the afterglow."],["Yes, delivering","You're the one swinging: reading reactions, building the rhythm, providing the glow."]],
    description:
      'Impact play runs from a playful swat to paddles, floggers, and crops. It\'s always warmed up gradually, aimed at safe padded areas, and tuned to exactly what the receiver wants. Fans describe the afterglow as head-clearing.',
    examples: [
      'A warm-up of firm pats that slowly builds',
      'A paddle\'s sharp thud versus a flogger\'s spread-out thump',
      'Counting strikes together as a ritual',
      'The warm, floaty glow many people feel afterward',
    ],
    support:
      'Impact play is among the most practiced kink activities. Rhythmic intensity releases endorphins many report as a calm, clear afterstate; community safety practice confines strikes to large muscle groups.',
    firstStep:
      'Start with hands only, on the padded areas, using a 1-to-10 check-in scale. The receiver calls every number.',
  },
  temperature: {
    group: 'bondage',
    name: 'Temperature & Wax Play',
    tagline: 'Hot, cold, and everything electric between.',
    sparkPrompt: 'Contrast on the skin. Massage-safe wax candles, ice cubes, warmed oil, chilled glass.',
    roles: [["Yes, on my skin","You want to feel it: the wax, the ice, the shiver of contrast."],["Yes, wielding it","You'd rather hold the candle and the ice cube, painting the contrast on."]],
    description:
      'Temperature play uses contrast as its instrument. Low-temperature massage candles that pour like warm silk. Ice traced along the spine. Warmed oil, chilled glass. The gap between hot and cold is where the shiver lives.',
    examples: [
      'Massage candles made to pour warm, not hot',
      'An ice cube melting slowly down the back',
      'Alternating warm oil and cool breath',
      'A chilled spoon, which works far better than it has any right to',
    ],
    support:
      'Thermoreceptors adapt quickly to constant input, which is why alternation produces a stronger response than any single temperature. Purpose-made massage candles exist because standard wax burns skin.',
    firstStep:
      'Buy one massage candle made for skin (regular candles burn too hot) and pair it with a glass of ice. Alternate, and let the receiver rate each pass.',
  },
  tickling: {
    group: 'bondage',
    name: 'Tickling',
    tagline: 'Laughter and helplessness in one package.',
    sparkPrompt: 'Tickling as play. Feathers, fingertips, helplessness, and laughing until you beg.',
    roles: [["Yes, being tickled","The helpless laughter is your side of the game."],["Yes, tickling","You want to be the one holding all the cards, feather in hand."]],
    description:
      'Tickling (knismolagnia, if you want the formal term) blends touch, teasing, and playful power. The tickler holds all the cards. The ticklee gets to laugh, squirm, and surrender.',
    examples: [
      'Feather-light fingertips on ribs, feet, or neck',
      'A feather or soft brush as the instrument',
      'A hand-signal truce so the game always has an exit',
      'Slow, unbearable anticipation before contact',
    ],
    support:
      'Knismolagnia is documented in the fetish literature as a distinct interest combining touch, anticipation, and control. Because laughter is involuntary, practitioners standardize non-verbal stop signals.',
    firstStep:
      'Agree on a clear stop signal first. Laughing makes the word "stop" unreliable, so use a hand tap. Then map out which spots are fun and which are genuinely too much.',
  },
  electro: {
    group: 'bondage',
    name: 'Electrostimulation',
    tagline: 'Tingles by design.',
    sparkPrompt: 'Tingles and pulses from purpose-built, body-safe toys. From a light buzz to a deep thrum.',
    roles: [["Yes, feeling it","You want the tingles delivered to you."],["Yes, at the dials","You want to run the device: patterns, waves, and finding what works."]],
    description:
      'E-stim uses purpose-built devices (TENS-style units and specialty toys) to create sensations nothing else can. Champagne-bubble tingles. Deep rhythmic pulses. All of it dialed in precisely.',
    examples: [
      'A TENS unit\'s gentle buzz through sticky pads',
      'Turning the dial up together until you find "ooh"',
      'Patterns and waves instead of constant sensation',
      'Using only devices designed for bodies. Never improvised electronics.',
    ],
    support:
      'Modern e-stim derives from TENS technology and uses current-limited, body-safe devices. The manufacturer guidance (never across the chest) is the operative safety rule.',
    firstStep:
      'Start with an entry-level TENS unit on its lowest setting, on a forearm. Learn the sensation somewhere neutral first, and read the safety guidance (never across the chest).',
  },
  marking: {
    group: 'bondage',
    name: 'Biting, Scratching & Marking',
    tagline: 'Souvenirs you can feel tomorrow.',
    sparkPrompt: 'Bites, scratches, and hickeys. Intensity in the moment, and marks as sweet souvenirs after.',
    roles: [["Yes, being marked","Wearing the souvenir is the appeal: the bite, the scratch, the reminder."],["Yes, leaving marks","You're the one signing your work."]],
    description:
      'Marking blends sensation with meaning. There\'s the bright intensity of a bite or scratch in the moment. Then there\'s the private satisfaction of a mark that keeps whispering about last night for days.',
    examples: [
      'A bite on the shoulder at the peak of a moment',
      'Nail trails down the back',
      'A hickey placed where only you two know about it',
      'Agreeing in advance where marks are welcome and where they\'re not',
    ],
    support:
      'Marking combines acute sensation with a lasting visual signal, and both components have documented erotic salience. Agreeing on placement beforehand is the standard practice.',
    firstStep:
      'Have the thirty-second map talk: where marks are welcome, where they must never show. Then let intensity build gradually.',
  },
  edgeplay: {
    group: 'bondage',
    name: 'Thrill & Edge Play',
    tagline: 'High-risk intensity play. Education required.',
    sparkPrompt: 'High-trust thrill play. Fear, adrenaline, and intensity at the edges. This category requires real education before practice.',
    roles: [["Yes, riding the edge","You'd be the one feeling the adrenaline, inside a container someone trusted runs."],["Yes, creating the thrill","You'd run the scene, which carries the bigger share of the safety homework."]],
    description:
      'Edge play is the umbrella term for high-intensity, higher-risk play: fear play, knife-style sensation (often done with harmless props), and similar adrenaline games. Be clear-eyed here. This is the one area of kink where "just try it" is bad advice. It calls for real education, experienced mentors, and conservative choices. Some practices under this umbrella, like anything restricting breathing, have no fully safe version at all.',
    examples: [
      'The rollercoaster principle: fear enjoyed inside a container of safety',
      'Prop-based fear play (a cold butter knife reads as dramatic with zero edge)',
      'Adrenaline scenes negotiated in exhaustive detail beforehand',
      'Community workshops and mentors as the entry path, not experimentation',
    ],
    support:
      'This category carries objectively higher physical risk than anything else measured here; breath restriction in particular has no medically safe protocol. Community norms route newcomers through in-person education rather than experimentation.',
    firstStep:
      'Chase the feeling, not the hazard. Start with suspense, anticipation, and harmless props. Treat anything genuinely risky as something that requires in-person education first.',
  },

  /* ==================== SPARK: Roleplay & Imagination ==================== */

  costumes: {
    group: 'imagination',
    name: 'Uniforms & Costumes',
    tagline: 'The right outfit changes everything.',
    sparkPrompt: 'The charge of a uniform or costume. On you or on them.',
    roles: [["Yes, wearing it","Transformation is for you: the outfit changes how you move and feel."],["Yes, enjoying the view","You're the audience. The right outfit on a partner does the work."]],
    description:
      'For uniform and costume lovers, clothing is transformation. The authority of a uniform. The drama of a costume. The instant character shift the right outfit creates.',
    examples: [
      'A partner in a uniform that reads as confident',
      'A costume box that comes out on special nights',
      'Getting dressed up as its own form of foreplay',
      'One signature item, like a jacket or boots, that flips the switch',
    ],
    support:
      'Clothing-based arousal cues are among the oldest documented erotic patterns. Uniforms concentrate role and status signals, which is the operative mechanism.',
    firstStep:
      'Each partner names one outfit they would respond to. Secondhand shops make the trial inexpensive.',
  },
  authority: {
    group: 'imagination',
    name: 'Authority Roleplay',
    tagline: 'Power dynamics, safely on loan.',
    sparkPrompt: 'Charged authority scenarios between adults. Strict professor, demanding boss, commanding officer. All pretend, all chosen.',
    roles: [["Yes, as the authority","You want the commanding role: the desk, the title, the script's power side."],["Yes, under authority","You want the other chair: called in, outranked, and loving the pretend stakes."]],
    description:
      'Authority roleplay borrows charged power dynamics and plays them out safely between adults who wrote the script together. Professor and student. Boss and new hire. Officer and civilian. The power gap is the electricity, and it works because it isn\'t real.',
    examples: [
      'A "performance review" that goes somewhere reviews never should',
      'A strict instructor demanding extra credit',
      'Formal address, like sir or professor, used to set the scene',
      'Debriefing after, back on equal footing, comparing favorite moments',
    ],
    support:
      'Authority-gap scenarios rank high in fantasy surveys precisely because their real counterparts are prohibited; fantasy carries the charge without the harm. Consensual enactment between adults is categorically distinct from the real thing.',
    firstStep:
      'Pick a scenario, agree on the tone, and give each character a name. The names alone make it easier to step in and out.',
  },
  fantasy: {
    group: 'imagination',
    name: 'Fantasy, Monsters & Cosplay',
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
      'Fantastical and monster-themed erotica is a commercially large genre, indicating broad demand. Persona play, including fursonas, functions as bounded identity experimentation.',
    firstStep:
      'Start with story. Tell each other a short fantastical scenario out loud, then borrow one element for real life: a voice, a persona, a single prop.',
  },
  genderplay: {
    group: 'imagination',
    name: 'Gender Play & Cross-Dressing',
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
      'Cross-gender expression for erotic or exploratory purposes is documented across cultures and historical periods. Its significance ranges from situational play to identity signal; repeated self-observation is what distinguishes them.',
    firstStep:
      'One item of clothing, in private. Record the response and repeat before drawing conclusions.',
  },
  medical: {
    group: 'imagination',
    name: 'Medical Play',
    tagline: 'The ritual of the exam room.',
    sparkPrompt: 'Clinical roleplay. Exams, gloves, instruments, and the particular vulnerability of the doctor\'s office.',
    roles: [["Yes, being examined","The vulnerable side of the exam table is yours."],["Yes, examining","You want the gloves and the clipboard: methodical, thorough, in charge."]],
    description:
      'Medical play borrows the rituals of the clinic. The exam. The gloves. The clipboard questions. The commanding bedside manner. What draws people is the mix of vulnerability, authority, and complete full-body attention.',
    examples: [
      'A thorough "check-up" performed with theatrical seriousness',
      'Nitrile gloves as a sensory experience of their own',
      'Clipboard intake questions that get less clinical as they go',
      'The power dynamic between examiner and examined',
    ],
    support:
      'Clinical roleplay concentrates vulnerability, authority, and focused attention, the same active elements found in other examination-style play. Dedicated equipment suppliers and community protocols exist.',
    firstStep:
      'A box of nitrile gloves and a theatrical intake interview is a complete starter kit. Keep anything invasive out of scope until you\'ve both properly researched it.',
  },
  sizeplay: {
    group: 'imagination',
    name: 'Size & Strength Play',
    tagline: 'Arousal from physical size and strength difference.',
    sparkPrompt: 'The charge of size and strength difference. Being lifted, pinned, enveloped, or doing the lifting.',
    roles: [["Yes, being overpowered","Being lifted, pinned, and dwarfed is the thrill for you."],["Yes, doing the lifting","Your side is the strength: carrying, pinning, towering."]],
    description:
      'Size and strength play savors physical difference. Being picked up, pinned, or carried. Feeling small and protected, or big and powerful. It runs from real-world lifts all the way to pure giant-and-tiny fantasy.',
    examples: [
      'Being lifted or carried to another room mid-moment',
      'A hand that covers yours completely',
      'Playing up height or strength differences on purpose',
      'Fantasy scenarios of dramatic, impossible size difference',
    ],
    support:
      'Strength and size differentials are common arousal cues across genders and orientations, extending into pure fantasy at the macrophilia end. The physical versions carry ordinary lifting-injury risk and nothing more exotic.',
    firstStep:
      'Ask for one lift, pin, or carry. Warm up first and lift with your knees, not your back. Then see how the difference feels when it\'s deliberate.',
  },
  breeding: {
    group: 'imagination',
    name: 'Breeding Fantasy',
    tagline: 'Primal talk, modern precautions.',
    sparkPrompt: 'The primal fantasy of "breeding." Possessive, purposeful talk and energy, while real-life contraception stays firmly in place.',
    roles: [["Yes, being claimed","Being wanted that completely is your side of the fantasy."],["Yes, claiming","The possessive, purposeful energy runs from you outward."]],
    description:
      'Breeding kink is a fantasy of primal purpose. Possessive language. The charged idea of claiming a partner completely, or being claimed. For nearly everyone it lives strictly in dirty talk and energy. The fantasy gets to thrill precisely because contraception keeps reality safely boring.',
    examples: [
      'Possessive, purposeful dirty talk in the moment',
      'The primal framing of claiming and being claimed',
      'A fantasy enjoyed with reality kept firmly separate',
      'Clear contraception agreements that make the fantasy safe to say out loud',
    ],
    support:
      'Impregnation-themed fantasy ranks among the most searched erotic themes. Content research consistently finds the appeal is possession and intensity rather than literal reproduction; contraception agreements are the standard boundary.',
    firstStep:
      'Introduce it as vocabulary first: a few charged words in the moment. Have the daylight conversation beforehand about where the fantasy/reality line sits for both of you.',
  },
  hypno: {
    group: 'imagination',
    name: 'Mind Play & Erotic Hypnosis',
    tagline: 'The mind is the biggest erogenous zone.',
    sparkPrompt: 'Trance, suggestion, and altered headspace. Guided relaxation that turns the mind itself into the playground.',
    roles: [["Yes, going under","The floaty, guided headspace is what calls you."],["Yes, guiding","You'd be the voice: steady, careful, and trusted with someone's headspace."]],
    description:
      'Erotic hypnosis and mind play use relaxation, focus, and suggestion to create a floaty, altered headspace. That can mean simple guided relaxation with an erotic glow, or deeper trance play between partners who trust each other completely.',
    examples: [
      'A partner\'s voice guiding a slow, full-body relaxation',
      'Agreed trigger words that recall a conditioned state',
      'The floaty, suggestible state fans of this describe',
      'Long trust conversations first. The mind deserves the same care as the body.',
    ],
    support:
      'Erotic hypnosis extends clinical trance techniques. Suggestibility varies substantially between individuals, and effects depend on trust and expectation, as in therapeutic use.',
    firstStep:
      'Start with a simple guided relaxation read aloud by your partner. No triggers, no depth. Just their voice and your breath. Then talk about what it felt like.',
  },

  sleepy: {
    group: 'imagination',
    name: 'Drowsy & Sleepy Play',
    sparkPrompt: 'Half-asleep, drowsy intimacy, arranged with explicit prior consent: a standing "you may wake me like this."',
    roles: [["Yes, being woken", "The appeal for you is drifting at the edge of sleep and being drawn gently into pleasure you invited in advance."], ["Yes, doing the waking", "You\'d be the one starting slow and soft, holding a standing invitation your partner gave while wide awake."]],
    tagline: 'The edge of sleep, by invitation.',
    description:
      'Sleepy play (somnophilia, formally) is the charge of drowsy, half-asleep intimacy. Done right it runs on one strict rule: the consent conversation happens fully awake, in advance, as a standing and revocable invitation. The drowsiness is the mood. The permission is never drowsy.',
    examples: [
      'A standing "you can wake me like this" agreed on in daylight',
      'Slow, soft touch at the edge of sleep',
      'Lazy, half-dreaming morning intimacy',
      'Checking in once fully awake, every time',
    ],
    support:
      'Somnophilic fantasy appears at measurable rates in fantasy surveys. The practice standard is strict: consent is negotiated fully awake, in advance, and stays revocable; the drowsy state is the setting, never the consent condition.',
    firstStep:
      'Have the conversation fully awake first: what\'s welcome, what\'s not, and that the invitation can be withdrawn anytime. Then start with mornings, where sleep is already lifting.',
  },

  /* ==================== SPARK: Seen & Shared ==================== */

  filming: {
    group: 'seen',
    name: 'Filming & Photography',
    tagline: 'Your own private cinema.',
    sparkPrompt: 'Making private photos or videos together, for an audience of exactly two.',
    roles: [["Yes, on camera","Performing for the lens is your side."],["Yes, behind the camera","You're the director: framing, lighting, and appreciating."]],
    description:
      'Some couples love the camera. It adds performance energy in the moment and leaves a private archive after. Two things are non-negotiable: enthusiastic consent from everyone on camera, and genuinely secure storage.',
    examples: [
      'A photoshoot night with good lighting and no deadline',
      'Watching your own premiere together afterward',
      'The performance energy a lens adds',
      'Encrypted, password-protected storage as a standing rule',
    ],
    support:
      'Private recording adds performance salience and a reviewable record, both documented arousal factors. The material risks are storage and distribution, addressed by encryption and deletion agreements.',
    firstStep:
      'Start with photos only, on one designated device. Agree on storage and deletion rules before the first shot. The security talk is what makes the fun sustainable.',
  },
  groupplay: {
    group: 'seen',
    name: 'Group Play & Threesomes',
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
      'Group sex is the most frequently reported fantasy on record: 89% of Lehmiller\'s 4,175-person sample reported threesome fantasies. Successful practice correlates most strongly with communication quality between primary partners.',
    firstStep:
      'Each partner writes boundaries and interests separately, then compare documents. Most couples decide whether to proceed from that exercise alone.',
  },
  compersion: {
    group: 'seen',
    name: 'Compersion & Sharing',
    tagline: 'Their pleasure is your pleasure.',
    sparkPrompt: 'Heat or joy in a partner\'s pleasure with someone else. Cuckolding, hotwifing, or open dynamics.',
    roles: [["Yes, as the one watching","The heat for you is in witnessing or hearing about your partner's pleasure."],["Yes, as the one shared","Being desired by more than one, with your partner's delight, is your side."]],
    description:
      'Compersion is finding joy, or heat, in a partner\'s pleasure with someone else. On the erotic side it powers cuckolding and hotwifing. On the emotional side it\'s the engine of many open relationships. It flips jealousy\'s script, which is exactly why it fascinates people.',
    examples: [
      'The charge of hearing about a partner\'s date',
      'Hotwifing or cuckold dynamics with rules both partners wrote',
      'Watching a partner be desired and feeling pride instead of threat',
      'Rigorous honesty as the foundation under all of it',
    ],
    support:
      'Partner-sharing themes rank in the top tier of male-reported fantasies in multiple large surveys, and compersion is documented in consensual non-monogamy research as a learnable response.',
    firstStep:
      'Test the waters in fantasy first. Talk through a hypothetical together and watch your real reactions, whether that\'s arousal, anxiety, or both, with curiosity instead of judgment.',
  },

  /* ==================== SPARK: Fetish & Body ==================== */

  materials: {
    group: 'fetish',
    name: 'Latex, Leather & Materials',
    tagline: 'Texture is a language.',
    sparkPrompt: 'The look, feel, scent, and sound of materials. Latex, leather, PVC, silk, fur.',
    roles: [["Yes, wearing it","Second-skin materials on your own body are the draw."],["Yes, touching and admiring","Your pull runs outward: the look, feel, and sound of it on someone else."]],
    description:
      'Material fetishes respond to fabric as a full experience. The second-skin gleam of latex. Leather\'s scent and creak. Silk\'s glide. It can be about wearing it, touching it, or just looking at it.',
    examples: [
      'A leather jacket that does something to you',
      'The ritual of shining and caring for gear',
      'Latex under good lighting',
      'Silk sheets or gloves as the whole event',
    ],
    support:
      'Material-specific arousal is among the most studied fetish classes; Scorolli et al. (2007) found object and material preferences second in frequency only to body parts. Sensory specificity is the mechanism.',
    firstStep:
      'Go to a fabric or thrift store and let touch lead. One glove, scarf, or jacket in your favorite material is a complete experiment.',
  },
  lingerie: {
    group: 'fetish',
    name: 'Lingerie & Clothing',
    tagline: 'What\'s almost hidden is most seen.',
    sparkPrompt: 'The charge of special clothing. Lingerie, stockings, a particular garment that transforms the wearer.',
    roles: [["Yes, wearing it","The transformation and the reveal are yours to perform."],["Yes, enjoying the view","You're the appreciative audience for the reveal."]],
    description:
      'Lingerie love is about transformation and reveal. The garment changes how the wearer carries themselves. The slow unveiling becomes its own act. And there\'s the quiet thrill of something special hidden under ordinary clothes.',
    examples: [
      'A set worn all day as a private secret',
      'The slow reveal, treated as an event',
      'Stockings and garters, including the ritual of putting them on',
      'Shopping together as extended foreplay',
    ],
    support:
      'Partial concealment reliably outperforms full exposure in arousal research, and lingerie operationalizes that finding. The selection and reveal ritual adds anticipation, a separately documented factor.',
    firstStep:
      'Select one piece each. Anticipation during selection is part of the measured effect.',
  },
  feet: {
    group: 'fetish',
    name: 'Feet & Footwear',
    tagline: 'The most common body-part preference on record.',
    sparkPrompt: 'Feet and footwear as a source of attraction. Massaging, admiring, adoring, or beautiful shoes.',
    roles: [["Yes, adoring them","You're the admirer: the massage, the attention, the devotion."],["Yes, being adored","Receiving that devotion is your side of it."]],
    description:
      'Foot attraction is the world\'s most common body-focused kink. It covers foot massages, pedicure aesthetics, and heels or boots as objects of devotion. There\'s even a neuroscience theory for why: in the brain\'s body map, the region for feet sits right next to the one for genitals.',
    examples: [
      'A long, attentive foot massage as devotion',
      'Painted toes, anklets, pedicure aesthetics',
      'A partner\'s favorite heels or boots, kept for special nights',
      'Kisses that start at the ankle',
    ],
    support:
      'Feet are the most common body-part preference in every large dataset examined (Scorolli et al., 2007). One neurological hypothesis notes that foot and genital regions sit adjacent in the somatosensory cortex.',
    firstStep:
      'Offer or request a ten-minute foot massage with full attention, and note the response on both sides.',
  },
  bodyworship: {
    group: 'fetish',
    name: 'Body Worship',
    tagline: 'Reverence as an erotic act.',
    sparkPrompt: 'Devoted, unhurried adoration of a partner\'s body. Or being the one adored.',
    roles: [["Yes, adoring","Reverence flows from you: slow, devoted attention to someone else."],["Yes, being adored","Receiving unhurried adoration is your side, and it takes real openness."]],
    description:
      'Body worship makes reverence the entire event. Slow, devoted attention to a partner\'s body, treating every inch as worthy of adoration. Or the vulnerable glory of being on the receiving end.',
    examples: [
      'A slow head-to-toe appreciation, with commentary',
      'Massage as devotion rather than utility',
      'An entire evening focused on one adored feature',
      'Lying back and being adored, with nothing expected in return',
    ],
    support:
      'Extended asymmetric attention concentrates two documented arousal factors: focused attention and received appraisal. The giving and receiving sides show distinct but equally common appeal profiles.',
    firstStep:
      'Take turns. Fifteen minutes of unhurried appreciation each. The receiver\'s only job is to accept it.',
  },
  nichebody: {
    group: 'fetish',
    name: 'Hands, Hair & Specific Features',
    tagline: 'Attraction keyed to specific features.',
    sparkPrompt: 'A particular pull toward a specific feature. Hands, forearms, hair, necks, shoulders, voices.',
    roles: [["Yes, as the admirer","Your specific eye does the loving here."],["Yes, being admired","Having your particular features adored is the appeal."]],
    description:
      'Some attraction is precise. Hands and forearms (the formal term is quirofilia). Hair to touch or be touched by (trichophilia). Necks, shoulders, voices. A specific eye is a connoisseur\'s eye.',
    examples: [
      'Watching someone\'s hands while they work',
      'Hair play: brushing, braiding, a gentle tug',
      'Rolled-up sleeves as a genuine event',
      'A voice that does more than any picture could',
    ],
    support:
      'Body-part preferences beyond feet (hands, hair, necks, voices) form the most numerous single class in fetish taxonomies. The defining feature is specificity of cue, not intensity of interest.',
    firstStep:
      'Tell your partner exactly which feature undoes you and why. Specific desire, said out loud, is one of the best compliments there is.',
  },
  wetmessy: {
    group: 'fetish',
    name: 'Food & Messy Play',
    tagline: 'Texture, mess, and norm-breaking as play.',
    sparkPrompt: 'Play involving food and mess. Whipped cream, sauces, cake, deliberate messiness.',
    roles: [["Yes, getting messy","You want to be the canvas."],["Yes, making the mess","You're the artist with the whipped cream."]],
    description:
      'Wet-and-messy play, known as sploshing, is erotic play with food and mess: whipped cream, sauces, cake. The identified components are texture, taste, absurdity, and licensed rule-breaking.',
    examples: [
      'Whipped cream and chocolate sauce as art supplies',
      'The classic pie to the face, lovingly delivered',
      'A tarp-covered floor as a canvas',
      'The laughing shower together afterward',
    ],
    support:
      'Wet-and-messy play is a documented niche with a stable community. The active elements are texture, violation of cleanliness norms, and licensed play; hygiene management is the only practical constraint.',
    firstStep:
      'Start with dessert and a towel. One can of whipped cream, applied artistically, with the shower already warm.',
  },
  watersports: {
    group: 'fetish',
    name: 'Watersports',
    tagline: 'A taboo-amplified interest, measurably common.',
    sparkPrompt: 'Erotic play involving pee. A taboo-tinged interest that\'s far more common than polite company admits.',
    roles: [["Yes, on the giving side","Your interest runs toward giving."],["Yes, on the receiving side","Your interest runs toward receiving, which asks for the deeper trust."]],
    description:
      'Watersports (urolagnia, formally) is erotic interest in pee. For most people it\'s less about the substance than the intimacy, the taboo, and the total-trust vulnerability of sharing something normally private. Like all body-fluid play it comes with common-sense hygiene practices, which the community discusses openly.',
    examples: [
      'The charged intimacy of a private act, shared',
      'The shower as the practical classic',
      'The taboo itself as the engine of the thrill',
      'Frank hygiene and boundary talks beforehand. Unsexy, then very sexy.',
    ],
    support:
      'Urolagnia appears at measurable rates in every large fetish survey, well above its social visibility. Taboo amplification is the documented mechanism, and hygiene practice is well established in the community literature.',
    firstStep:
      'Raise it as fantasy first and gauge interest honestly. If you both lean in, the shower is the traditional low-stakes venue.',
  },

  objects: {
    group: 'fetish',
    name: 'Objects & Inflatables',
    sparkPrompt: 'A charge from a specific object: balloons, inflatables, plush, or another particular thing that does it for you.',
    tagline: 'Arousal keyed to a specific object.',
    description:
      'Object fetishes attach erotic charge to a specific thing: balloons (the "looner" community), inflatables, plush, or something else entirely. The draw is usually sensory: the texture, the sound, the tension, the anticipation.',
    examples: [
      'The squeak and tension of a balloon (to pop or carefully not to)',
      'Inflatables as texture and bounce',
      'Plush and soft objects as comfort turned charged',
      'Collecting or keeping a favorite object for private time',
    ],
    support:
      'Object-directed arousal is among the earliest documented fetish classes and is considered benign by modern diagnostic standards when it causes no distress. The balloon community is a well-documented example.',
    firstStep:
      'No partner needed for this one: explore solo first, notice which part of the experience carries the charge (sound, texture, tension), and share it with a partner only when and if you want to.',
  },

  /* ==================== SPARK: Voice & Mind ==================== */

  dirtytalk: {
    group: 'mind',
    name: 'Dirty Talk',
    tagline: 'Language as a primary stimulus.',
    sparkPrompt: 'Explicit, charged language. Hearing it, saying it, or trading it by text all day.',
    roles: [["Yes, hearing it","Words work on you. You want to be talked to."],["Yes, saying it","You're the narrator: the one whose voice does the damage."]],
    description:
      'For dirty-talk lovers, words do the heaviest lifting. Narration. Commands. Confessions. The right filth in the right tone. Which words work is intensely personal, and finding out together is part of the fun.',
    examples: [
      'A running narration of what\'s happening, or about to',
      'Texts through the day that build toward the evening',
      'Learning which words land and which clang',
      'A voice note that outperforms any photo',
    ],
    support:
      'Explicit verbal content functions as a primary arousal stimulus for a large share of adults. Effective vocabulary is idiosyncratic, which is why negotiating terms precedes using them.',
    firstStep:
      'Exchange lists of effective and off-limits words, then practice over text before speaking it aloud.',
  },
  degradation: {
    group: 'mind',
    name: 'Degradation & Objectification',
    tagline: 'Sharp words in a soft container.',
    sparkPrompt: 'Consensual humiliation. Chosen harsh words, or being treated as a beautiful object, thrilling precisely because you\'re safe.',
    roles: [["Yes, receiving the words","The sharp words land on you, and that contrast is the charge."],["Yes, saying the words","You'd deliver the script: sharp in the scene, warm underneath."]],
    description:
      'Degradation play uses deliberately harsh words or objectifying dynamics, chosen together, inside a container of real affection. For some people that contrast is electric. The golden rules: vocabulary negotiated in advance, off-limits topics listed, and warm aftercare that says what\'s actually true.',
    examples: [
      'Specific "mean" words agreed on in advance, with forbidden ones listed too',
      'Being treated as a gorgeous object for an evening',
      'The charge of contrast between scene words and real regard',
      'Aftercare that explicitly reaffirms what\'s true underneath',
    ],
    support:
      'Erotic humiliation operates on the contrast between scene content and actual regard. Research on BDSM practitioners finds post-scene intimacy and trust frequently increase; pre-negotiated vocabulary and aftercare are the standard structure.',
    firstStep:
      'Build the vocabulary lists first. Thrilling words, neutral words, never-words. Start with the mildest item on the list and add extra-warm aftercare.',
  },

  /* ==================== SPARK: Connection ==================== */

  tantric: {
    group: 'connection',
    name: 'Slow & Mindful Intimacy',
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
      'Attention-focused practice measurably improves arousal and satisfaction in mindfulness-based sex therapy trials. Slowed pacing and breath synchronization are the operative techniques, independent of any spiritual framing.',
    firstStep:
      'Three minutes of synchronized breathing and eye contact before intimacy. Initial awkwardness typically fades within the first minute.',
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
    question: 'Which of these fantasies have you replayed more than once? Select all that apply.',
    multi: true,
    options: [
      { label: 'Being completely at someone\'s mercy (safely, with someone I trust)', scores: { submission: 2, bondage: 2 } },
      { label: 'Having someone completely at mine', scores: { dominance: 2, bondage: 1 } },
      { label: 'Watching, or being watched, with total permission', scores: { voyeurism: 2, exhibition: 1 } },
      { label: 'A perfect, deeply romantic night where time slows down', scores: { sensual: 3 } },
      { label: 'None of these', exclusive: true, scores: {} },
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
    question: 'After intensity winds down, which of these do you most want?',
    options: [
      { label: 'Being held, praised, and reassured', scores: { praise: 2, submission: 2 } },
      { label: 'Taking care of my partner: water, blankets, soft words', scores: { dominance: 2, praise: 1 } },
      { label: 'Laughing together about the characters we just played', scores: { roleplay: 2, sensual: 1 } },
      { label: 'Long, quiet cuddling. No words needed', scores: { sensual: 3 } },
    ],
  },
  {
    question: 'Your partner gasps, squirms, and asks for more intensity. What happens in you?',
    options: [
      { label: 'That reaction is the whole point. I love causing it', scores: { sadism: 3, dominance: 1 } },
      { label: 'Envy. I want to be the one gasping', scores: { masochism: 3 } },
      { label: 'Curiosity, though I\'d keep checking in rather than cranking up', scores: { sensual: 1, praise: 1 } },
      { label: 'That scene isn\'t for me, on either side', scores: { sensual: 2 } },
    ],
  },
  {
    question: 'Where does the line between pain and pleasure sit for you?',
    options: [
      { label: 'There isn\'t one. The right sting is pleasure', scores: { masochism: 3, sensation: 1 } },
      { label: 'I love delivering the sting for someone who craves it', scores: { sadism: 3 } },
      { label: 'Firm and intense, yes. Actual pain, no', scores: { sensation: 2 } },
      { label: 'Nowhere near each other. Gentle is my language', scores: { sensual: 2 } },
    ],
  },
  {
    question: 'You\'re in charge tonight. What\'s the best part?',
    options: [
      { label: 'The control itself: decisions, obedience, my word being final', scores: { dominance: 3 } },
      { label: 'The reactions: making them gasp, squirm, and beg', scores: { sadism: 2, dominance: 1 } },
      { label: 'The theater of it: playing the powerful character well', scores: { roleplay: 2, dominance: 1 } },
      { label: 'Honestly, I\'d trade the job away', scores: { submission: 2 } },
    ],
  },
  {
    question: 'You\'re the one surrendering tonight. What\'s the best part?',
    options: [
      { label: 'Obedience itself. Following feels like flying', scores: { submission: 3 } },
      { label: 'The intensity my body gets to feel', scores: { masochism: 2, sensation: 1 } },
      { label: 'The praise I earn by being good', scores: { praise: 2, submission: 1 } },
      { label: 'Surrender isn\'t really the appeal for me', scores: { dominance: 1, sensual: 1 } },
    ],
  },
  {
    question: 'A partner describes exactly what they want to do to you, in vivid detail. You…',
    options: [
      { label: 'Melt. Words like that undo me', scores: { praise: 2, submission: 1 } },
      { label: 'Counter with what I\'m going to do to them instead', scores: { dominance: 2, sadism: 1 } },
      { label: 'Ask them to keep going while I just watch them say it', scores: { voyeurism: 2 } },
      { label: 'Would rather be shown than told', scores: { sensation: 1, sensual: 1 } },
    ],
  },
  {
    question: 'After an intense night, what do you want your body to feel like the next day?',
    options: [
      { label: 'A pleasant ache that reminds me all day', scores: { masochism: 3 } },
      { label: 'Nothing on me. But I love knowing they still feel it', scores: { sadism: 2 } },
      { label: 'Relaxed and glowing, no souvenirs', scores: { sensual: 2 } },
      { label: 'Whatever it is, I want the memory of how it looked', scores: { voyeurism: 1, exhibition: 1 } },
    ],
  },
  {
    question: 'Which of these daydreams have you had? Select all that apply.',
    multi: true,
    options: [
      { label: 'A partner begging, and me deciding whether to say yes', scores: { dominance: 2, sadism: 1 } },
      { label: 'Being pushed right to my limit by someone I trust completely', scores: { masochism: 2, submission: 1 } },
      { label: 'An audience that can\'t look away from me', scores: { exhibition: 2 } },
      { label: 'A slow morning with nowhere to be and nothing to prove', scores: { sensual: 2 } },
      { label: 'None of these', exclusive: true, scores: {} },
    ],
  },
  {
    question: 'How do you feel about marks, aches, and evidence?',
    options: [
      { label: 'Badges of honor. I want them', scores: { masochism: 2 } },
      { label: 'I like leaving them, where they\'re welcome', scores: { sadism: 2 } },
      { label: 'A mirror-check thrill, then fade please', scores: { sensation: 1, exhibition: 1 } },
      { label: 'No marks. Nothing to explain later', scores: { sensual: 1 } },
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
      'Your responses indicate attraction consistently directed toward a different gender. On the 0-to-6 scale Kinsey published in 1948, this is position 0, exclusively heterosexual.',
  },
  1: {
    label: 'Kinsey 1: Predominantly heterosexual, only incidentally homosexual',
    description:
      'Attraction directed predominantly toward a different gender, with incidental same-gender response. Kinsey\'s data found this pattern common; it is position 1 on the scale.',
  },
  2: {
    label: 'Kinsey 2: Predominantly heterosexual, but more than incidentally homosexual',
    description:
      'Predominant other-gender attraction with recurring, more than incidental, same-gender attraction. Contemporary self-labels at this position include heteroflexible and bi-curious; it is position 2 on the scale.',
  },
  3: {
    label: 'Kinsey 3: Equally heterosexual and homosexual',
    description:
      'Attraction to your own and other genders in roughly equal measure. This is position 3, the scale\'s bisexual midpoint.',
  },
  4: {
    label: 'Kinsey 4: Predominantly homosexual, but more than incidentally heterosexual',
    description:
      'Predominant same-gender attraction with recurring other-gender attraction; position 4 on the scale.',
  },
  5: {
    label: 'Kinsey 5: Predominantly homosexual, only incidentally heterosexual',
    description:
      'Attraction directed predominantly toward your own gender, with incidental other-gender response; position 5 on the scale.',
  },
  6: {
    label: 'Kinsey 6: Exclusively homosexual',
    description:
      'Attraction consistently directed toward your own gender. This is position 6, exclusively homosexual.',
  },
  X: {
    label: 'Kinsey X: Little or no sexual attraction',
    description:
      'Your responses indicate little or no sexual attraction. Kinsey recorded this as category X; the contemporary term is the asexual spectrum, a recognized orientation. Romantic attachment operates independently of sexual attraction and often remains fully present.',
  },
};

/* ==================== PART 3: turn-ons, turn-offs, solo life ==================== */
/*
 * Each option can carry `scores` (added to the broad category totals) and a
 * `reflection`: the supportive read-back shown in the results and the email.
 */

const PERSONAL_QUESTIONS = [
  {
    id: 'turnon_primary',
    question: 'Which of these reliably turn you on? Select all that apply.',
    multi: true,
    options: [
      {
        label: 'Confident, take-charge energy from a partner',
        scores: { submission: 2, praise: 1 },
        reflection:
          'Displayed confidence functions as your primary arousal cue. This typically co-occurs with the power-exchange scores elsewhere in this profile.',
      },
      {
        label: 'Being wanted. Compliments, adoration, obvious desire',
        scores: { praise: 2, exhibition: 1 },
        reflection:
          'Expressed desire is your primary accelerator. Practical implication: explicit verbal appreciation from partners has an outsized effect, and its absence registers as distance.',
      },
      {
        label: 'Touch. Hands, warmth, skin, pressure',
        scores: { sensation: 2, sensual: 1 },
        reflection:
          'Somatic input is your primary channel. Arousal in your pattern builds from physical contact rather than from context or language.',
      },
      {
        label: 'A great mind. Banter, teasing, the right words',
        scores: { roleplay: 1, praise: 1 },
        reflection:
          'Verbal and cognitive stimulation precedes physical response in your pattern. Conversational chemistry operates as functional foreplay.',
      },
      {
        label: 'What I can see. Watching, being watched, visuals',
        scores: { voyeurism: 2, exhibition: 1 },
        reflection:
          'Visual input is your dominant channel, consistent with the exhibitionism and voyeurism scores in this profile.',
      },
      {
        label: 'A story in my head. Fantasy and imagination',
        scores: { roleplay: 2 },
        reflection:
          'Internally generated fantasy is your primary driver. Recurring scenarios are usable data about underlying preference.',
      },
    ],
  },
  {
    id: 'desire_style',
    question: 'When does desire usually show up for you?',
    options: [
      {
        label: 'Out of nowhere. It just arrives, and often',
        reflection:
          'This is spontaneous desire in the research terminology: arousal arising without external prompting. Pairings with responsive-desire partners work best when the difference is named explicitly.',
      },
      {
        label: 'Once things get going. It builds in response to touch and closeness',
        reflection:
          'This is responsive desire: arousal follows stimulation rather than preceding it. It is among the most common patterns, particularly in long-term relationships, and indicates nothing about attraction level.',
      },
      {
        label: 'Only when the setting is right. Low stress, privacy, the right mood',
        reflection:
          'Context-dependent arousal reflects a sensitive inhibition system in dual-control-model terms. Environment functions as part of the stimulus.',
      },
      {
        label: 'Honestly, not that often',
        reflection:
          'Low spontaneous desire frequency is within normal population range and fluctuates with life phase. It warrants clinical attention only if it causes personal distress.',
      },
    ],
  },
  {
    id: 'turnoff_main',
    question: 'The other side. Which of these kill the mood for you? Select all that apply.',
    multi: true,
    options: [
      {
        label: 'Feeling rushed or pressured',
        reflection:
          'Pressure activates your inhibition system fastest. In dual-control terms, removing brakes outperforms adding accelerators; explicit pacing agreements address this directly.',
      },
      {
        label: 'Stress and a busy head. I can\'t switch off',
        reflection:
          'Cognitive load is the most commonly reported arousal inhibitor in the literature. A deliberate transition period between daily tasks and intimacy measurably improves response.',
      },
      {
        label: 'Feeling criticized or self-conscious',
        reflection:
          'Evaluation sensitivity is your primary brake. In this pattern, explicit reassurance functions as a precondition for arousal rather than an enhancement.',
      },
      {
        label: 'No emotional connection. It feels mechanical without it',
        reflection:
          'Arousal in your pattern is gated on emotional context. Relationship investment translates directly into desire, a coherent and common configuration.',
      },
      {
        label: 'The details. Hygiene, environment, timing',
        reflection:
          'Environmental cues carry disproportionate weight in your inhibition system. The same sensitivity operates in your favor when conditions are controlled.',
      },
    ],
  },
  {
    id: 'turnoff_moment',
    question: 'During intimacy, what pulls you out of the moment? Select all that apply.',
    multi: true,
    options: [
      {
        label: 'Worrying about how I look',
        reflection:
          'Self-observation during sex is termed spectatoring (Masters & Johnson) and reliably reduces arousal. Redirecting attention to physical sensation is the standard countermeasure and improves with practice.',
      },
      {
        label: 'Worrying about whether my partner is enjoying it',
        reflection:
          'Monitoring partner response at the expense of your own is a documented attention pattern. Direct verbal feedback from partners removes the guesswork that sustains it.',
      },
      {
        label: 'My to-do list. Intrusive everyday thoughts',
        reflection:
          'Task intrusion is a stress-carryover effect, not a desire deficit. A planned transition period is the evidence-supported correction.',
      },
      {
        label: 'Fear of doing something wrong',
        reflection:
          'Performance monitoring is evaluation anxiety applied to sex. Stating it to a partner typically reduces it, and reframing encounters as feedback rather than tests removes its basis.',
      },
      {
        label: 'Nothing much. I stay present pretty easily',
        exclusive: true,
        reflection:
          'Sustained present-focus during intimacy is the state mindfulness-based interventions aim to produce. No correction indicated.',
      },
    ],
  },
  {
    id: 'solo_frequency',
    question: 'How often do you masturbate, honestly?',
    options: [
      {
        label: 'Most days, sometimes more than once',
        reflection:
          'Daily-range frequency is within documented norms. Frequency alone is not a clinical indicator; interference with daily functioning is the relevant measure, and frequency by itself implies none.',
      },
      {
        label: 'A few times a week',
        reflection:
          'This matches the modal adult frequency band in the National Survey of Sexual Health and Behavior. Regular solo experience also correlates with accurate knowledge of one\'s own responses.',
      },
      {
        label: 'A few times a month',
        reflection:
          'Within the documented population range. No target frequency exists in the literature.',
      },
      {
        label: 'Rarely',
        reflection:
          'Solo frequency varies widely between individuals and across life phases. Low frequency is a normal data point, not a deficit.',
      },
      {
        label: 'Never, or almost never',
        reflection:
          'A measurable share of adults in every survey reports no masturbation, for reasons ranging from low drive to simple preference. It is a normal profile.',
      },
    ],
  },
  {
    id: 'solo_method',
    question: 'When you do, which approaches do you use? Select all that apply.',
    multi: true,
    options: [
      {
        label: 'Hands, nothing fancy',
        reflection:
          'Direct manual stimulation is the most commonly reported method. Method knowledge transfers directly to partner communication.',
      },
      {
        label: 'Toys are part of the routine',
        reflection:
          'Device use is statistically mainstream: roughly half of US women and nearly half of men report vibrator use (Herbenick et al., 2009).',
      },
      {
        label: 'Pressure or grinding works best for me',
        reflection:
          'Pressure-based technique is common though under-discussed. Method variation between individuals is wide and carries no clinical significance.',
      },
      {
        label: 'I take my time. Edging, building slowly',
        reflection:
          'Deliberate delay increases eventual orgasm intensity through arousal accumulation, the same mechanism measured in partnered orgasm control. Your solo pattern confirms responsiveness to it.',
      },
      {
        label: 'It varies with my mood',
        reflection:
          'Method flexibility indicates responsiveness to current state rather than habit, which correlates with reported satisfaction.',
      },
      {
        label: 'This one doesn\'t apply to me',
        exclusive: true,
        reflection:
          'A non-applicable response is valid, and no inference is drawn from it.',
      },
    ],
  },
  {
    id: 'solo_fuel',
    question: 'What do you turn to for solo inspiration? Select all that apply.',
    multi: true,
    options: [
      {
        label: 'My imagination. I write the whole script',
        reflection:
          'Self-generated fantasy indicates strong internal imagery. Recurrent content is the most direct available data on preference structure, and the research literature treats it as such.',
      },
      {
        label: 'Videos',
        reflection:
          'Visual material is the most common aid. Your selection patterns over time are more informative about preference than the fact of use.',
      },
      {
        label: 'Written erotica or audio',
        reflection:
          'Preference for narrative and audio over visual material indicates context-driven arousal, consistent with verbally driven patterns elsewhere in this profile.',
      },
      {
        label: 'Memories of real moments',
        reflection:
          'Reliance on autobiographical material indicates arousal anchored in lived context. It also identifies which encounters registered most strongly.',
      },
      {
        label: 'Whatever I find in the moment. No pattern',
        reflection:
          'Unpatterned selection suggests novelty-responsive arousal with low cue specificity.',
      },
      {
        label: 'Nothing. It\'s purely physical for me',
        exclusive: true,
        reflection:
          'Solo experience without mental content is a documented pattern. No inference about imagination or desire follows from it.',
      },
    ],
  },
  {
    id: 'solo_after',
    question: 'How do you feel afterward? Select all that apply.',
    multi: true,
    options: [
      {
        label: 'Relaxed and clear-headed',
        reflection:
          'The post-orgasm calm reflects parasympathetic activation. Deliberate use for sleep or stress regulation is common and unproblematic.',
      },
      {
        label: 'Satisfied, but a little guilty',
        reflection:
          'Post-masturbation guilt correlates with acquired beliefs, not with any measured harm; medical consensus classifies masturbation as normal sexual behavior. The response typically diminishes when examined directly.',
      },
      {
        label: 'Neutral. It\'s like scratching an itch',
        reflection:
          'A purely functional relationship with solo sex is a stable, common pattern requiring no interpretation.',
      },
      {
        label: 'Sometimes a little lonely',
        reflection:
          'Post-solo loneliness separates the physical function from the attachment function. It is information about unmet connection need, distinct from anything about the act itself.',
      },
      {
        label: 'Energized and in a better mood',
        reflection:
          'The reported mood elevation matches the documented dopamine and endorphin response profile.',
      },
    ],
  },
];

/* ==================== PART 4: open-response items ==================== */
/*
 * Free-text questions. Responses are analyzed by keyword and phrase
 * matching against the category lexicon below; positive matches are
 * weighted into the category scores and reported as themes. Full text is
 * stored with the submission.
 */

const TEXT_QUESTIONS = [
  {
    id: 'text_fantasy',
    question: 'In your own words: describe a fantasy or scenario you find most arousing. As much or as little detail as you want.',
    placeholder: 'Write freely. This is analyzed together with your other answers.',
  },
  {
    id: 'text_untried',
    question: 'Is there something you have wanted to try but have not? What has held you back?',
    placeholder: 'Interest, hesitation, circumstances. Whatever applies.',
  },
  {
    id: 'text_other',
    question: 'Anything about your sexual interests, experiences, or desires that the previous questions did not capture?',
    placeholder: 'Optional. Anything you consider relevant to an accurate profile.',
  },
];

/*
 * Category lexicon for open-response analysis. Terms are matched
 * case-insensitively; multi-word entries as phrases, single words on word
 * boundaries. A match preceded within four words by a negation term is
 * excluded from scoring.
 */
const KEYWORDS = {
  dominance: ['dominant', 'dominance', 'dom ', 'domme', 'in charge', 'take control', 'being in control', 'obey me', 'commanding'],
  submission: ['submissive', 'submission', 'surrender', 'being controlled', 'told what to do', 'obeying', 'serving', 'give up control'],
  sadism: ['sadist', 'sadism', 'watch them squirm', 'making them beg', 'their pain'],
  masochism: ['masochist', 'masochism', 'enjoy pain', 'like pain', 'love pain', 'pain and pleasure', 'hurt me', 'hurts so good'],
  bondage: ['bondage', 'restrained', 'restraints', 'tied down', 'tied up', 'tie me', 'cuffs', 'handcuff'],
  rope: ['rope', 'shibari', 'rigging', 'knots'],
  sensorydep: ['blindfold', 'sensory deprivation', 'earplugs', 'senses taken'],
  impact: ['spank', 'paddle', 'flogger', 'flogging', 'whip', 'crop', 'caning'],
  temperature: ['wax play', 'candle wax', 'hot wax', 'ice cube', 'ice play', 'temperature play'],
  tickling: ['tickle', 'tickling', 'ticklish'],
  electro: ['e-stim', 'estim', 'electro', 'tens unit', 'violet wand', 'electricity'],
  marking: ['bite', 'biting', 'bitten', 'scratch', 'hickey', 'marks on', 'marked'],
  edgeplay: ['knife play', 'fear play', 'breath play', 'choke', 'choking', 'gun play'],
  roleplay: ['roleplay', 'role play', 'role-play', 'scenario', 'pretend', 'act out', 'acting out'],
  costumes: ['uniform', 'costume', 'outfit', 'dressing up', 'dress up'],
  authority: ['teacher', 'professor', 'boss', 'officer', 'principal', 'interrogat', 'authority figure'],
  fantasy: ['monster', 'vampire', 'werewolf', 'alien', 'tentacle', 'dragon', 'furry', 'fursona', 'demon', 'cosplay'],
  genderplay: ['crossdress', 'cross-dress', 'cross dress', 'feminization', 'feminized', 'gender swap', 'genderswap'],
  medical: ['medical play', 'doctor play', 'nurse play', 'examination table', 'speculum', 'clinical'],
  sizeplay: ['giantess', 'giant ', 'size difference', 'manhandle', 'manhandled', 'picked up and carried', 'throw me around', 'tossed around'],
  breeding: ['breed', 'breeding', 'impregnat', 'bred'],
  hypno: ['hypnosis', 'hypnotize', 'hypnotized', 'trance', 'mind control', 'mindless'],
  sleepy: ['somnophilia', 'wake me up with', 'woken up with', 'half asleep', 'while sleeping', 'sleepy sex'],
  filming: ['film us', 'film ourselves', 'record us', 'recording ourselves', 'on camera', 'sex tape', 'take photos', 'photograph'],
  groupplay: ['threesome', 'foursome', 'orgy', 'group sex', 'swinging', 'swingers', 'more than one person', 'multiple partners', 'gangbang'],
  compersion: ['cuckold', 'cuck', 'hotwife', 'watch my partner', 'watching my partner', 'share my partner', 'being shared', 'another man', 'another woman'],
  exhibition: ['exhibitionist', 'exhibitionism', 'being watched', 'watch me', 'showing off', 'show off my body', 'audience', 'in public', 'semi-public', 'might get caught', 'getting caught'],
  voyeurism: ['voyeur', 'watching others', 'watching people', 'watch other people', 'watching them'],
  praise: ['praise', 'good girl', 'good boy', 'compliment', 'being told i\'m', 'affirmation', 'encouraging words'],
  degradation: ['degrade', 'degradation', 'humiliate', 'humiliation', 'call me names', 'name calling', 'used like', 'worthless', 'slut'],
  dirtytalk: ['dirty talk', 'talk dirty', 'talking dirty', 'sexting', 'phone sex', 'moaning in my ear', 'whisper'],
  petplay: ['pet play', 'kitten play', 'puppy play', 'collar', 'leash', 'pony play', 'meow'],
  caregiver: ['daddy', 'mommy', 'ddlg', 'caregiver', 'age play', 'ageplay', 'little space', 'babygirl', 'taken care of'],
  bratplay: ['brat', 'bratting', 'brat tamer', 'talk back', 'talking back', 'misbehave', 'put me in my place'],
  discipline: ['punish', 'punishment', 'discipline', 'obedience', 'protocol', 'rules to follow', 'findom', 'tribute'],
  primal: ['primal', 'chase me', 'being chased', 'hunted', 'prey', 'growl', 'wrestle', 'wrestling', 'feral', 'animalistic'],
  cnc: ['cnc', 'consensual non-consent', 'non-con', 'ravish', 'ravished', 'force me', 'forced', 'taken against', 'overpowered', 'rape fantasy', 'struggle'],
  orgasmcontrol: ['edging', 'edge me', 'denial', 'denied', 'orgasm control', 'chastity', 'cage', 'ruined orgasm', 'begging to come', 'begging to cum', 'permission to'],
  materials: ['latex', 'leather', 'pvc', 'rubber', 'nylon', 'spandex', 'satin'],
  lingerie: ['lingerie', 'stockings', 'garter', 'panties', 'corset', 'thigh highs', 'fishnets'],
  feet: ['feet', 'foot fetish', 'toes', 'soles', 'heels', 'boots', 'footjob'],
  bodyworship: ['worship', 'adore my body', 'adore their body', 'muscles', 'muscle worship'],
  nichebody: ['hands', 'forearms', 'veins', 'long hair', 'her hair', 'his hair', 'their hair', 'necks', 'collarbone', 'voice'],
  wetmessy: ['whipped cream', 'food play', 'sploshing', 'chocolate sauce', 'covered in', 'messy play'],
  watersports: ['watersports', 'golden shower', 'piss', 'peeing', 'urine', 'omorashi', 'wetting'],
  sensation: ['feather', 'sensation play', 'light touch', 'nails down', 'goosebumps', 'shiver'],
  sensual: ['romantic', 'candles', 'slow sex', 'gentle', 'cuddle', 'cuddling', 'eye contact', 'making love', 'intimacy', 'vanilla', 'kissing'],
  tantric: ['tantra', 'tantric', 'breathwork', 'mindful', 'meditative'],
  switchplay: ['switch', 'both roles', 'versatile', 'take turns being in charge'],
  objects: ['balloon', 'inflatable', 'plush', 'looner'],
};

const NEGATION_TERMS = ['not', 'no', 'never', 'don\'t', 'dont', 'hate', 'dislike', 'without', 'isn\'t', 'isnt', 'aren\'t', 'arent', 'wouldn\'t', 'wouldnt', 'stop', 'avoid', 'past'];

/* General self-discovery suggestions appended to everyone's results. */
const GENERAL_SUGGESTIONS = [
  'Track your reactions over time: recording which items drew yes, curious, or no responses reveals patterns a single session misses.',
  'Results work well as a discussion instrument with partners. Comparing profiles locates overlap and mismatch quickly.',
  'Safewords, check-ins, and aftercare are the standard risk controls for every practice measured here. Learn them before experimenting.',
  'Relevant reading: Nagoski, "Come As You Are" (desire mechanics); Easton and Hardy, "The New Topping Book" and "The New Bottoming Book" (power exchange practice).',
  'Retest at intervals. Preference profiles shift with time and context, and the differences between runs are themselves informative.',
];

/* Make the database available to the server for building result emails. */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GROUPS, SPARK_SCALE, CATEGORIES, QUESTIONS, PERSONAL_QUESTIONS, TEXT_QUESTIONS, KEYWORDS, NEGATION_TERMS, KINSEY_QUESTIONS, KINSEY_RESULTS, GENERAL_SUGGESTIONS };
}
