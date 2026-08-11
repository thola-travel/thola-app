/**
 * Desire Discovery Quiz — content and scoring data.
 *
 * Every multiple-choice answer carries weights toward one or more kink
 * categories. The app tallies these live as the participant answers, then
 * runs a full analysis on submission.
 */

const CATEGORIES = {
  dominance: {
    name: 'Dominance',
    emoji: '👑',
    tagline: 'You enjoy taking the lead.',
    description:
      'Dominance is about confidently guiding an experience — setting the pace, making decisions, and taking care of a partner who has chosen to follow your lead. At its heart it is an act of attentiveness and responsibility, not control for its own sake.',
    examples: [
      'Planning an evening and lovingly telling your partner exactly how it will go',
      'Giving clear, confident directions during intimacy',
      'Light "rules" or tasks agreed on together, with you as the one who sets them',
      'Aftercare — checking in and caring for your partner once play ends',
    ],
    support:
      'Enjoying being in charge is one of the most common dynamics there is. Great dominants are defined by consent, communication, and care — and wanting that role says you like to give as much as you like to lead.',
  },
  submission: {
    name: 'Submission',
    emoji: '🕊️',
    tagline: 'You find freedom in letting go.',
    description:
      'Submission is the joy of handing the reins to someone you trust — releasing decisions, pressure, and control so you can sink fully into the experience. Many people describe it as deeply relaxing, even meditative.',
    examples: [
      'Letting a partner plan and direct an intimate evening from start to finish',
      'Following playful instructions or agreed-upon "rules"',
      'Enjoying being "told what to do" within limits you set together',
      'The comfort of structure: rituals, titles, or routines you\'ve both chosen',
    ],
    support:
      'Submission is chosen, negotiated, and revocable at any time — which makes it a position of real power. Wanting to let go is incredibly common and speaks to a capacity for trust that many people envy.',
  },
  bondage: {
    name: 'Bondage & Restraint',
    emoji: '🪢',
    tagline: 'Restraint heightens sensation and trust.',
    description:
      'Bondage covers everything from a partner gently holding your wrists to artful rope work. Being restrained (or doing the restraining) can heighten anticipation, focus sensation, and create a powerful feeling of trust and surrender.',
    examples: [
      'A partner pinning your hands above your head',
      'Soft cuffs, silk scarves, or a sleep mask',
      'Decorative rope harnesses (many people enjoy rope purely as an art form)',
      'Agreeing on a signal so restraint always ends the moment anyone wants it to',
    ],
    support:
      'Bondage is one of the most widely enjoyed kinks in the world — studies consistently rank it near the top of common fantasies. Practiced with communication and a quick-release mindset, it\'s a beautiful blend of craft, trust, and sensation.',
  },
  sensation: {
    name: 'Sensation Play',
    emoji: '✨',
    tagline: 'Your body loves contrast and intensity.',
    description:
      'Sensation play is the exploration of touch across the whole spectrum — soft to sharp, warm to cool, feather-light to firm. It includes impact play (like spanking), temperature play, and texture play, all tuned to exactly the intensity you enjoy.',
    examples: [
      'A playful spank or firm massage',
      'An ice cube traced along the skin, or the warmth of massage oil',
      'Feathers, silk, or fingertips used teasingly',
      'Building intensity gradually and checking in about what feels best',
    ],
    support:
      'Bodies are wired for novelty — enjoying intense or contrasting sensations is simple neuroscience, not strangeness. You get to define the dial: sensation play can be as gentle or as bold as you like.',
  },
  roleplay: {
    name: 'Roleplay & Fantasy',
    emoji: '🎭',
    tagline: 'Imagination is your playground.',
    description:
      'Roleplay lets you step into a story — new characters, scenarios, and dynamics that free you from everyday roles. It can be elaborate or as simple as "let\'s pretend we just met."',
    examples: [
      'Meeting your long-term partner at a bar and pretending to be strangers',
      'Classic scenarios: boss/new hire, royalty/loyal subject, strangers on a train',
      'Costumes, accents, or just a shift in attitude',
      'Sharing fantasies out loud and picking one to act out together',
    ],
    support:
      'A rich fantasy life is a sign of creativity, and roleplay is simply collaborative storytelling with someone you trust. Almost everyone fantasizes — acting it out is just giving those stories a stage.',
  },
  exhibition: {
    name: 'Exhibitionism & Voyeurism',
    emoji: '🔥',
    tagline: 'Being seen — or watching — thrills you.',
    description:
      'This is the erotic charge of being admired, watched, or watching, always with everyone involved consenting. It ranges from loving the way a partner watches you undress to enjoying flirtatiously showing off.',
    examples: [
      'Dancing or undressing slowly while your partner watches',
      'Watching your partner enjoy themselves',
      'Flirty photos shared privately between consenting partners',
      'The thrill of a mirror placed just right',
    ],
    support:
      'Wanting to be desired — and to witness desire — is profoundly human. Between consenting adults in private, this is a celebrated and very common source of excitement.',
  },
  praise: {
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
      'Responding to praise means affirmation genuinely nourishes you — that\'s emotional attunement, not neediness. This is one of the gentlest and most connecting kinks there is.',
  },
  sensual: {
    name: 'Sensual & Romantic Connection',
    emoji: '🌹',
    tagline: 'Depth, tenderness, and presence are your language.',
    description:
      'Your strongest pull is toward deep presence: eye contact, slow touch, emotional closeness, and romance. Sometimes called "vanilla," this is its own rich flavor — and many people\'s absolute favorite.',
    examples: [
      'Long, slow evenings with no agenda but each other',
      'Massage, candlelight, music, and unhurried touch',
      'Deep eye contact and staying emotionally present',
      'Building anticipation over an entire day of small gestures',
    ],
    support:
      'There is nothing "plain" about vanilla — tenderness and presence are a complete erotic language of their own. Knowing that connection is what moves you is just as valid a discovery as any kink.',
  },
};

/**
 * Kink questions. Each option maps points to categories (0–3).
 */
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
    question: 'How do you feel about a playful spank or firmer touch?',
    options: [
      { label: 'Yes please — intensity wakes my whole body up', scores: { sensation: 3 } },
      { label: 'A little sting can be fun in the right moment', scores: { sensation: 2 } },
      { label: 'I\'d rather give than receive it', scores: { sensation: 2, dominance: 2 } },
      { label: 'Soft and gentle is what my body loves', scores: { sensual: 2, praise: 1 } },
    ],
  },
  {
    question: 'An ice cube traced slowly down your spine, or warm oil massaged in. Thoughts?',
    options: [
      { label: 'Both — contrast is delicious', scores: { sensation: 3 } },
      { label: 'The warmth, absolutely — slow and soothing', scores: { sensual: 2, sensation: 1 } },
      { label: 'I want to be the one wielding the ice cube', scores: { sensation: 2, dominance: 1 } },
      { label: 'I\'d be more into the anticipation than the sensation itself', scores: { bondage: 1, submission: 1, sensation: 1 } },
    ],
  },
  {
    question: 'Your partner watches you undress from across the room, clearly enjoying it. You feel…',
    options: [
      { label: 'Powerful — I\'d slow down and make a show of it', scores: { exhibition: 3 } },
      { label: 'Flattered but a bit shy — a little audience goes a long way', scores: { exhibition: 1, praise: 1 } },
      { label: 'I\'d rather swap places and do the watching', scores: { exhibition: 3 } },
      { label: 'I\'d pull them close — distance is overrated', scores: { sensual: 2 } },
    ],
  },
  {
    question: 'Which of these fantasies have you replayed more than once?',
    options: [
      { label: 'Being completely at someone\'s mercy (safely, with someone I trust)', scores: { submission: 2, bondage: 2 } },
      { label: 'Having someone completely at mine', scores: { dominance: 2, bondage: 1 } },
      { label: 'An elaborate scenario — costumes, characters, a whole plot', scores: { roleplay: 3 } },
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
      { label: 'I put it on them — I love having all the control of the moment', scores: { bondage: 2, dominance: 2 } },
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
    question: 'Which "scene" from a movie or book has stayed with you?',
    options: [
      { label: 'A slow, reverent scene where someone is utterly adored', scores: { praise: 2, sensual: 2 } },
      { label: 'A charged power-dynamic scene — someone giving in, deliciously', scores: { dominance: 1, submission: 2 } },
      { label: 'A forbidden or secret encounter — the risk of being caught', scores: { exhibition: 2, roleplay: 1 } },
      { label: 'An artful scene involving rope, silk, or restraint', scores: { bondage: 3 } },
    ],
  },
  {
    question: 'How do you feel about mirrors placed where you can see yourselves?',
    options: [
      { label: 'Love it — watching us is a thrill of its own', scores: { exhibition: 3 } },
      { label: 'A fun bonus now and then', scores: { exhibition: 2 } },
      { label: 'I\'d rather watch my partner than myself', scores: { exhibition: 2, sensual: 1 } },
      { label: 'I\'d honestly rather the lights low and the world small', scores: { sensual: 2 } },
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

/**
 * Kinsey scale questions. Values follow Kinsey's 0–6 scale;
 * 'X' represents Kinsey's category for people who don't experience
 * sexual attraction (often described today as asexuality).
 */
const KINSEY_QUESTIONS = [
  {
    question: 'When someone catches your eye and makes your heart beat faster, who tends it to be?',
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
