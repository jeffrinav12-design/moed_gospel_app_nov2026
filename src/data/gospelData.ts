import { GospelSession, FellowshipGroup, GospelPillar, YouTubeVideoSuggestion } from '../types';

export const JESUS_NEVER_FAILS_CHANNEL_URL = 'https://www.youtube.com/@jesusneverfails7649';

export const buildChannelVideoSearchUrl = (topicQuery: string) =>
  `https://www.youtube.com/@jesusneverfails7649/search?query=${encodeURIComponent(topicQuery)}`;

export const buildYouTubeGospelSearchUrl = (topicQuery: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(`"@jesusneverfails7649" "Jesus Never Fails" ${topicQuery}`)}`;

export const GOSPEL_PILLAR_LIST: Array<{
  id: GospelPillar;
  name: string;
  subtitle: string;
  anchorVerse: string;
  youtubeQuery: string;
}> = [
  {
    id: 'Salvation & Grace',
    name: 'Salvation & Grace',
    subtitle: 'The Cross, Redemption & New Birth',
    anchorVerse: 'Ephesians 2:8-9',
    youtubeQuery: 'Salvation Grace Cross of Jesus',
  },
  {
    id: 'Faith & Miracles',
    name: 'Faith & Miracles',
    subtitle: 'Trusting God When All Else Fails',
    anchorVerse: 'Hebrews 11:1 & 13:8',
    youtubeQuery: 'Jesus Never Fails Faith Miracles',
  },
  {
    id: 'Prayer & Intercession',
    name: 'Prayer & Intercession',
    subtitle: 'Breakthrough Prayer & Seeking His Face',
    anchorVerse: 'Jeremiah 33:3',
    youtubeQuery: 'Jesus Never Fails Prayer Breakthrough',
  },
  {
    id: 'Holy Spirit & Revival',
    name: 'Holy Spirit & Revival',
    subtitle: 'Walking in Power, Gifts & Fruit',
    anchorVerse: 'Acts 1:8 & Galatians 5:22',
    youtubeQuery: 'Holy Spirit Anointing Revival',
  },
  {
    id: 'Kingdom Discipleship',
    name: 'Kingdom Discipleship',
    subtitle: 'The Sermon on the Mount & Daily Walk',
    anchorVerse: 'Matthew 6:33',
    youtubeQuery: 'Sermon on the Mount Discipleship',
  },
  {
    id: 'Psalms & Worship',
    name: 'Psalms & Worship',
    subtitle: 'Songs of Deliverance & Divine Refuge',
    anchorVerse: 'Psalm 23 & Psalm 91',
    youtubeQuery: 'Jesus Never Fails Worship Song Psalms',
  },
];

const CHANNEL_EMBED_FALLBACKS = [
  {
    videoId: 'hVCWXvx_lio',
    watchUrl: 'https://www.youtube.com/watch?v=hVCWXvx_lio',
  },
  {
    videoId: 'NM3tu1CjoHY',
    watchUrl: 'https://www.youtube.com/watch?v=NM3tu1CjoHY',
  },
];

function makeSuggestedVideos(
  topicTitle: string,
  items: Array<{
    id: string;
    videoId?: string;
    title: string;
    duration: string;
    category: YouTubeVideoSuggestion['category'];
    scriptureReference: string;
    description: string;
  }>
): YouTubeVideoSuggestion[] {
  return items.map((item, idx) => {
    const fallback = CHANNEL_EMBED_FALLBACKS[idx % CHANNEL_EMBED_FALLBACKS.length];
    const resolvedVideoId = item.videoId || fallback.videoId;
    return {
      ...item,
      videoId: resolvedVideoId,
      channelName: 'Jesus Never Fail Ministries',
      channelUrl: JESUS_NEVER_FAILS_CHANNEL_URL,
      videoSearchUrl: item.videoId
        ? `https://www.youtube.com/watch?v=${item.videoId}`
        : buildChannelVideoSearchUrl(`${item.title} ${topicTitle}`),
      embedUrl: `https://www.youtube.com/embed/${resolvedVideoId}`,
      thumbnailUrl: `https://i.ytimg.com/vi/${resolvedVideoId}/hqdefault.jpg`,
    };
  });
}

export const GOSPEL_SESSIONS: GospelSession[] = [
  {
    id: 'gospel-salvation-cross-grace',
    title: 'The Finished Work of the Cross & Unfailing Grace',
    pillar: 'Salvation & Grace',
    scriptureBook: 'Romans 5 & Ephesians 2',
    anchorVerse: 'For by grace you have been saved through faith, and that not of yourselves; it is the gift of God. — Ephesians 2:8',
    topic: 'Justification by Faith, Redemption & Atonement in Christ',
    channelReference: 'Jesus Never Fail Ministries YouTube Channel',
    youtubeChannelUrl: JESUS_NEVER_FAILS_CHANNEL_URL,
    suggestedVideos: makeSuggestedVideos('Grace Salvation Cross', [
      {
        id: 'yt-sal-1',
        title: 'Jesus Never Fails: The Power of the Cross & Amazing Grace',
        duration: '28:14',
        category: 'Sermon',
        scriptureReference: 'Romans 5:1-11',
        description: 'A Christ-centered exposition on how Jesus paid the full debt of sin and opened eternal peace with God.',
      },
      {
        id: 'yt-sal-2',
        title: 'Saved by Grace, Not Works — Deep Bible Teaching',
        duration: '19:40',
        category: 'Bible Teaching',
        scriptureReference: 'Ephesians 2:1-10',
        description: 'Exploring the Greek root Charis (grace) and why human striving can never earn what Christ freely gave.',
      },
      {
        id: 'yt-sal-3',
        title: 'Jesus Never Fails — Live Sanctuary Worship & Altar Call',
        duration: '14:25',
        category: 'Worship Song',
        scriptureReference: 'John 3:16-17',
        description: 'Congregational worship and prayer invitation celebrating God\'s unfailing love that never lets go.',
      },
    ]),
    fellowshipName: 'Grace & Truth Fellowship',
    createdAt: '2026-11-21',
    googleMeetUrl: 'https://meet.google.com/jnf-grace-cross',
    isLiveNow: true,
    summary:
      'Discover the heart of the Gospel: humanity separated by sin is reconciled to a holy Father through the atoning death and resurrection of Jesus Christ. Salvation is not earned by religious performance, but received as a transforming gift of grace through faith.',
    definitions: [
      {
        id: 'def-g-1',
        term: 'Grace (Greek: Charis)',
        definition: 'God\'s unmerited favor, forgiving mercy, and empowering presence freely bestowed on believers through Jesus Christ.',
        formula: 'Ephesians 2:8-9 · Titus 2:11',
        analogy: 'Like a royal pardon handed freely to a prisoner who could never pay the court debt in ten lifetimes.',
        example: 'Paul writes in 2 Corinthians 12:9, "My grace is sufficient for you, for My strength is made perfect in weakness."',
      },
      {
        id: 'def-g-2',
        term: 'Justification (Greek: Dikaiosyne)',
        definition: 'The judicial act of God declaring a repentant sinner righteous in His sight on the basis of Christ\'s shed blood.',
        formula: 'Romans 5:1 · 2 Corinthians 5:21',
        analogy: 'Standing in court with a record wiped completely clean—not merely overlooked, but credited with Christ\'s own righteousness.',
        example: 'Therefore, having been justified by faith, we have peace with God through our Lord Jesus Christ (Romans 5:1).',
      },
      {
        id: 'def-g-3',
        term: 'Propitiation (Greek: Hilasterion)',
        definition: 'Christ\'s sacrifice on Calvary that fully satisfied God\'s righteous justice and turned away wrath, bringing reconciliation.',
        formula: '1 John 2:2 · Romans 3:25',
        analogy: 'The mercy seat in the Old Testament tabernacle sprinkled once and for all by the Lamb of God.',
        example: 'He Himself is the propitiation for our sins, and not for ours only but also for the whole world (1 John 2:2).',
      },
      {
        id: 'def-g-4',
        term: 'Redemption (Greek: Apolutrosis)',
        definition: 'Deliverance or buying back from the slavery of sin and condemnation through the ransom price of Christ\'s blood.',
        formula: 'Ephesians 1:7 · 1 Peter 1:18-19',
        analogy: 'Purchasing a captive out of a marketplace of bondage and setting them permanently free as a beloved child.',
        example: 'In Him we have redemption through His blood, the forgiveness of sins, according to the riches of His grace.',
      },
    ],
    flashcards: [
      {
        id: 'fc-g-1',
        category: 'Ephesians 2:8-9',
        front: 'Complete the promise: "For by grace you have been saved through faith..."',
        back: '"...and that not of yourselves; it is the gift of God, not of works, lest anyone should boast." (Ephesians 2:8-9)',
        hint: 'Salvation is a divine gift, never a wage earned by pride.',
      },
      {
        id: 'fc-g-2',
        category: 'Romans 5:8',
        front: 'How did God demonstrate His own love toward us while we were still sinners?',
        back: '"But God demonstrates His own love toward us, in that while we were still sinners, Christ died for us." (Romans 5:8)',
        hint: 'Jesus loved us before we ever cleaned ourselves up.',
      },
      {
        id: 'fc-g-3',
        category: 'John 19:30',
        front: 'What were Jesus\' triumphant final words on the cross ("Tetelestai")?',
        back: '"It is finished!" — signifying that the debt of sin was paid in full.',
        hint: 'One Greek word used on ancient receipts meaning "Paid in Full."',
      },
      {
        id: 'fc-g-4',
        category: '2 Corinthians 5:17',
        front: 'What happens to anyone who is in Christ Jesus?',
        back: '"Therefore, if anyone is in Christ, he is a new creation; old things have passed away; behold, all things have become new."',
        hint: 'Not merely improved behavior—a complete spiritual rebirth.',
      },
    ],
    quiz: [
      {
        id: 'q-sal-1',
        question: 'According to Ephesians 2:8-9, through what means is salvation received by the believer?',
        options: [
          'By observing ceremonial laws and charitable deeds',
          'By grace through faith, as the gift of God',
          'By human wisdom and moral perfection',
          'By inheritance from ancestors',
        ],
        correctIndex: 1,
        explanation: 'Ephesians 2:8-9 clearly teaches that salvation is the gift of God received by grace through faith, not by works, so no one can boast.',
        points: 1000,
        timeLimitSeconds: 20,
      },
      {
        id: 'q-sal-2',
        question: 'What does the Greek word "Tetelestai" spoken by Jesus on the cross mean?',
        options: [
          'Try harder next time',
          'It is finished / Paid in full',
          'Wait until the end',
          'Remember the temple',
        ],
        correctIndex: 1,
        explanation: 'In John 19:30, Jesus cried "Tetelestai" ("It is finished"), declaring that the full penalty for sin was satisfied once for all.',
        points: 1000,
        timeLimitSeconds: 20,
      },
      {
        id: 'q-sal-3',
        question: 'In Romans 5:1, what is the immediate fruit of being justified by faith?',
        options: [
          'Earthly wealth and fame',
          'Freedom from all trials forever',
          'Peace with God through our Lord Jesus Christ',
          'Knowledge of every secret mystery',
        ],
        correctIndex: 2,
        explanation: 'Romans 5:1 proclaims: "Therefore, having been justified by faith, we have peace with God through our Lord Jesus Christ."',
        points: 1000,
        timeLimitSeconds: 20,
      },
      {
        id: 'q-sal-4',
        question: 'According to Romans 8:1, what is true for those who are in Christ Jesus?',
        options: [
          'They remain under partial condemnation',
          'There is therefore now no condemnation',
          'They must earn forgiveness weekly',
          'They are judged by the Law of Moses',
        ],
        correctIndex: 1,
        explanation: 'Romans 8:1 guarantees complete assurance: "There is therefore now no condemnation to those who are in Christ Jesus."',
        points: 1000,
        timeLimitSeconds: 20,
      },
    ],
    assertionReasons: [
      {
        id: 'ar-sal-1',
        assertion: 'Good works cannot purchase or earn our salvation before God.',
        reason: 'Ephesians 2:8-10 teaches we are saved by grace through faith as God\'s gift, and then created in Christ Jesus for good works.',
        correctOption: 'A',
        explanation: 'Both statements are true, and the Reason explains the exact biblical order: salvation produces good works as fruit, rather than good works producing salvation as a root.',
        conceptTip: 'Root = Grace through Faith; Fruit = Good Works prepared by God.',
      },
      {
        id: 'ar-sal-2',
        assertion: 'Because Jesus cried "It is finished," believers may continue living carelessly in sin.',
        reason: 'God\'s grace covers every sin when a person trusts in Christ.',
        correctOption: 'D',
        explanation: 'The Assertion is false (Romans 6:1-2 asks "Shall we continue in sin that grace may abound? Certainly not!"), while the Reason is true—grace truly covers our sin and empowers us to walk in newness of life.',
        conceptTip: 'Grace is never a license to sin; grace is power to overcome sin.',
      },
    ],
    caseBasedQuestions: [
      {
        id: 'cbq-sal-1',
        title: 'The Thief on the Cross & Unmerited Mercy (Luke 23:39-43)',
        casePassage:
          'Beside Jesus hung two criminals. One mocked Him, demanding proof. The other rebuked his companion, acknowledged his own guilt before God, and humbly prayed: "Lord, remember me when You come into Your kingdom." With nails in His hands and unable to perform a single religious ceremony, baptism, or charitable act, Jesus answered him: "Assuredly, I say to you, today you will be with Me in Paradise."',
        scenarioContext: 'Scripture Case Study · Gospel of Luke',
        subQuestions: [
          {
            id: 'cbq-sal-1a',
            question: 'What did the repentant thief demonstrate before Jesus spoke the promise of Paradise?',
            modelAnswer: 'He demonstrated reverent fear of God, honest confession of his guilt, recognition of Jesus\' sinlessness, and humble faith in Christ as King.',
            marks: 2,
            explanation: 'True saving faith begins with humble repentance and turning directly to Jesus Christ.',
          },
          {
            id: 'cbq-sal-1b',
            question: 'How does this passage prove that salvation is by grace through faith rather than human works?',
            modelAnswer: 'The dying thief had zero opportunity to perform good deeds, rituals, or religious service, yet Jesus immediately promised him eternal Paradise based solely on faith in Him.',
            marks: 3,
            explanation: 'It stands as one of Scripture\'s clearest testimonies that Christ saves anyone who calls upon Him in faith.',
          },
        ],
      },
    ],
    giveReasons: [
      {
        id: 'gr-sal-1',
        statement: 'Why could Jesus Christ alone serve as the spotless Savior and Mediator between God and humanity?',
        reasonPoints: [
          'As fully God and fully man, He bridged the infinite holiness of God and the frailty of humanity.',
          'He lived a completely sinless life, fulfilling the entire Law without blemish (1 Peter 1:19).',
          'Through His resurrection, He proved His sacrifice was accepted and conquered death forever.',
        ],
        scientificKeywordFocus: ['Sinless Lamb', 'Mediator', 'Incarnation', 'Resurrection'],
        modelAnswer:
          'Only Jesus Christ is both fully divine and fully human without sin. Because He owed no debt of sin Himself, He could bear the sins of the world as the spotless Lamb of God and rise victorious to intercede for us forever (1 Timothy 2:5).',
        marks: 3,
      },
    ],
    differentiations: [
      {
        id: 'diff-sal-1',
        topicHeading: 'Covenant of Law vs. Covenant of Grace',
        conceptA: 'Old Covenant (Law / Human Effort)',
        conceptB: 'New Covenant (Grace in Christ)',
        rows: [
          {
            parameter: 'Basis of Standing',
            conceptAValue: '"Do this and live" — depends on flawless obedience',
            conceptBValue: '"Believe and live" — depends on Christ\'s finished work',
          },
          {
            parameter: 'Heart Motivation',
            conceptAValue: 'Fear of condemnation and external compliance',
            conceptBValue: 'Love, gratitude, and inner renewal by the Holy Spirit',
          },
          {
            parameter: 'Where Written',
            conceptAValue: 'Carved on tablets of stone (2 Cor 3:3)',
            conceptBValue: 'Written by the Spirit on human hearts (Hebrews 8:10)',
          },
          {
            parameter: 'Outcome for Sinners',
            conceptAValue: 'Exposes sin and shows need for a Savior (Gal 3:24)',
            conceptBValue: 'Forgives sin, justifies freely, and imparts eternal life',
          },
        ],
        keyTakeaway: 'The Law was our tutor to lead us to Christ, so we might be justified by faith (Galatians 3:24).',
      },
    ],
    shortAnswers: [
      {
        id: 'sa-sal-1',
        question: 'Explain in 2-3 sentences what it means to be "born again" according to John 3:3-7.',
        marks: 3,
        keyPointsRequired: ['Spiritual rebirth by the Holy Spirit', 'Not physical or inherited', 'Entering the Kingdom of God'],
        modelAnswer:
          'To be born again means receiving new spiritual life from above through the Holy Spirit when we repent and trust in Jesus Christ. Just as physical birth brings us into the natural world, spiritual rebirth gives us a new heart, a new nature, and citizenship in God\'s Kingdom.',
        markingScheme: [
          { step: 'Identify spiritual birth by the Spirit', marksAllocated: 1 },
          { step: 'Contrast with physical/religious heritage', marksAllocated: 1 },
          { step: 'Connect to faith in Christ and new life', marksAllocated: 1 },
        ],
      },
    ],
    longAnswers: [
      {
        id: 'la-sal-1',
        question: 'Trace the Gospel message through Romans 3:23, Romans 6:23, Romans 5:8, and Romans 10:9-10.',
        marks: 5,
        structuralGuideline: 'Walk step-by-step through human need, sin\'s penalty, Christ\'s sacrifice, and personal response of faith.',
        modelAnswer:
          '1. The Universal Need (Romans 3:23): All have sinned and fall short of God\'s glory.\n2. The Penalty & The Gift (Romans 6:23): The wages of sin is death, but the free gift of God is eternal life in Christ Jesus.\n3. God\'s Initiative (Romans 5:8): While we were still sinners, Christ died for us.\n4. Our Response (Romans 10:9-10): Confessing with our mouth that Jesus is Lord and believing in our heart that God raised Him from the dead brings complete salvation.',
        rubricBreakdown: [
          { criterion: 'Accurate citation of Romans Road verses', marks: 2 },
          { criterion: 'Clear explanation of Christ\'s substitutionary death', marks: 2 },
          { criterion: 'Practical call to repentance and faith', marks: 1 },
        ],
      },
    ],
    practiceExercises: [
      {
        id: 'ex-sal-1',
        question: 'Write a short personal testimony or prayer of thanksgiving reflecting on Ephesians 2:8-9 and what Christ\'s unfailing grace means in your life today.',
        type: 'prayer',
        maxScore: 5,
        modelAnswer:
          'Lord Jesus, I thank You that You never fail and Your grace found me when I could never save myself. Today I rest not in my own works, but in Your finished work on the cross. Fill my heart with gratitude to love and serve others as a reflection of Your mercy. Amen.',
        keyRubrics: ['Acknowledges grace as God\'s gift', 'Expresses personal faith in Christ', 'Reflects humble gratitude and obedience'],
      },
    ],
    studyNotes: [
      {
        title: '1. The Great Exchange at Calvary',
        bullets: [
          'Jesus took our sin, guilt, and curse upon the cross (Galatians 3:13).',
          'In exchange, believers receive His righteousness, peace, and adoption as children of God (2 Corinthians 5:21).',
          'Nothing can separate a believer from the love of God which is in Christ Jesus (Romans 8:38-39).',
        ],
        formulaBox: 'Anchor Verse: 2 Corinthians 5:21 — "He made Him who knew no sin to be sin for us, that we might become the righteousness of God in Him."',
      },
      {
        title: '2. Assurance When Tempted to Doubt',
        bullets: [
          'Your security rests on Christ\'s unchanging faithfulness ("Jesus Never Fails"), not fluctuating emotions.',
          'Whenever the enemy accuses, point to the blood of the Lamb and the Word of God (Revelation 12:11).',
        ],
      },
    ],
    quickTips: [
      'Begin every morning declaring Romans 8:1: "There is now no condemnation in Christ Jesus."',
      'Share the four steps of Romans Road with a friend or neighbor this week.',
      'Revisit the Jesus Never Fails YouTube sermon on Romans 5 whenever discouragement tries to knock.',
    ],
    prayerPoints:
      'Pray for assurance of salvation, deep gratitude for the Cross, and boldness to share the Gospel with neighbors and family.',
  },
  {
    id: 'gospel-faith-jesus-never-fails',
    title: 'Jesus Never Fails: Unshakeable Faith in Every Storm',
    pillar: 'Faith & Miracles',
    scriptureBook: 'Hebrews 11 & Mark 4',
    anchorVerse: 'Jesus Christ is the same yesterday, today, and forever. — Hebrews 13:8',
    topic: 'Trusting Christ Amid Storms, Healing & Mountain-Moving Faith',
    channelReference: 'Jesus Never Fail Ministries YouTube Channel',
    youtubeChannelUrl: JESUS_NEVER_FAILS_CHANNEL_URL,
    suggestedVideos: makeSuggestedVideos('Jesus Never Fails Storm Faith', [
      {
        id: 'yt-faith-1',
        title: 'Jesus Never Fails — Why God Allows Storms & How He Calms Them',
        duration: '34:10',
        category: 'Sermon',
        scriptureReference: 'Mark 4:35-41',
        description: 'A stirring sermon from the Jesus Never Fails channel on having peace in the boat when Christ is with you.',
      },
      {
        id: 'yt-faith-2',
        title: 'Mountain-Moving Faith & Miracles of Jesus',
        duration: '22:45',
        category: 'Bible Teaching',
        scriptureReference: 'Hebrews 11:1-6 & Mark 11:22-24',
        description: 'Practical steps to stand on God\'s written promises even when natural circumstances look impossible.',
      },
      {
        id: 'yt-faith-3',
        title: 'Midnight Breakthrough Prayer: Jesus Never Fails in Crisis',
        duration: '18:05',
        category: 'Prayer & Deliverance',
        scriptureReference: 'Hebrews 13:8',
        description: 'Guided faith declarations and intercession for healing, provision, and family restoration.',
      },
    ]),
    fellowshipName: 'Mountain-Mover Faith Circle',
    createdAt: '2026-11-21',
    googleMeetUrl: 'https://meet.google.com/jnf-faith-alive',
    isLiveNow: true,
    summary:
      'When human strength runs out and storms rage around the boat, Jesus Christ remains unchanging. This study unpacks biblical faith—not as wishful thinking, but as confident trust in the faithfulness and power of the Son of God who never fails.',
    definitions: [
      {
        id: 'def-f-1',
        term: 'Biblical Faith (Greek: Pistis)',
        definition: 'Steady trust, persuasion, and reliance upon God\'s character and spoken promises even before seeing physical evidence.',
        formula: 'Hebrews 11:1 · Romans 10:17',
        analogy: 'Dropping an anchor into solid bedrock beneath stormy waves—you cannot see the rock, yet the ship holds steady.',
        example: 'Faith comes by hearing, and hearing by the word of God (Romans 10:17).',
      },
      {
        id: 'def-f-2',
        term: 'Immutability of Christ',
        definition: 'The unchanging nature of Jesus Christ in His love, power, mercy, and faithfulness across every generation.',
        formula: 'Hebrews 13:8 · Malachi 3:6',
        analogy: 'A true North Star that never drifts while earthly seasons and storms come and go.',
        example: 'The same Jesus who healed, forgave, and fed multitudes in Galilee is alive and active today.',
      },
      {
        id: 'def-f-3',
        term: 'Mustard Seed Faith',
        definition: 'A small but genuine trust placed completely in an Almighty God rather than in the size of our own feelings.',
        formula: 'Matthew 17:20',
        analogy: 'A tiny spark lighting a great torch—its power comes not from its size, but from the living God it connects to.',
        example: 'Even tiny faith spoken in obedience to Christ moves seemingly immovable barriers.',
      },
    ],
    flashcards: [
      {
        id: 'fc-f-1',
        category: 'Hebrews 11:1',
        front: 'How does the Book of Hebrews define faith?',
        back: '"Now faith is the substance of things hoped for, the evidence of things not seen." (Hebrews 11:1)',
        hint: 'Substance and evidence — faith treats God\'s promise as already settled.',
      },
      {
        id: 'fc-f-2',
        category: 'Hebrews 13:8',
        front: 'Why can believers trust Jesus through changing seasons and hardships?',
        back: '"Jesus Christ is the same yesterday, today, and forever." (Hebrews 13:8)',
        hint: 'His character and power never diminish.',
      },
      {
        id: 'fc-f-3',
        category: '2 Corinthians 5:7',
        front: 'What two ways of navigating life are contrasted in 2 Corinthians 5:7?',
        back: '"For we walk by faith, not by sight."',
        hint: 'Sight looks at waves; faith looks at the Savior.',
      },
    ],
    quiz: [
      {
        id: 'q-f-1',
        question: 'In Mark 4:35-41, what did Jesus command the raging wind and waves on the Sea of Galilee?',
        options: [
          'Row faster toward the shore',
          '"Peace, be still!"',
          'Build a stronger boat',
          'Wait until morning',
        ],
        correctIndex: 1,
        explanation: 'Jesus rebuked the wind and said to the sea, "Peace, be still!"—and immediately there was a great calm.',
        points: 1000,
        timeLimitSeconds: 20,
      },
      {
        id: 'q-f-2',
        question: 'According to Romans 10:17, how does saving and enduring faith grow in a believer?',
        options: [
          'By worrying until relief arrives',
          'By hearing, and hearing by the Word of God',
          'By comparing yourself with neighbors',
          'By waiting passively without prayer',
        ],
        correctIndex: 1,
        explanation: 'Romans 10:17 states directly: "So then faith comes by hearing, and hearing by the word of God."',
        points: 1000,
        timeLimitSeconds: 20,
      },
      {
        id: 'q-f-3',
        question: 'Why did Peter begin to sink while walking on water in Matthew 14:30?',
        options: [
          'Because the water was too deep',
          'Because he shifted his focus from Jesus to the boisterous wind',
          'Because Jesus left the boat',
          'Because the other disciples called him back',
        ],
        correctIndex: 1,
        explanation: 'When Peter saw that the wind was boisterous, he was afraid and began to sink; yet the moment he cried "Lord, save me!", Jesus immediately stretched out His hand and caught him.',
        points: 1000,
        timeLimitSeconds: 20,
      },
    ],
    assertionReasons: [
      {
        id: 'ar-f-1',
        assertion: 'Even when a believer experiences fear in a sudden storm, Jesus does not abandon them.',
        reason: 'When Peter cried "Lord, save me!" in Matthew 14:30-31, Jesus immediately reached out His hand and lifted him up.',
        correctOption: 'A',
        explanation: 'Both statements are true, and Matthew 14 demonstrates why Jesus never fails—His compassion meets our weakest cry with immediate rescue.',
        conceptTip: 'Weak faith in a strong Savior still connects you to His mighty hand.',
      },
    ],
    caseBasedQuestions: [
      {
        id: 'cbq-f-1',
        title: 'The Woman with the Issue of Blood (Mark 5:25-34)',
        casePassage:
          'For twelve long years, a woman suffered a chronic illness, spent everything she owned on physicians, and grew worse rather than better. Hearing reports about Jesus, she pressed through a crowded street thinking, "If only I may touch His clothes, I shall be made well." Immediately the fountain of her blood dried up. Jesus turned and said, "Daughter, your faith has made you well. Go in peace."',
        scenarioContext: 'Miracles of Jesus · Gospel of Mark',
        subQuestions: [
          {
            id: 'cbq-f-1a',
            question: 'What barriers did this woman have to overcome to reach Jesus?',
            modelAnswer: 'Physical exhaustion after 12 years of illness, financial poverty, social isolation, and a thick pressing crowd.',
            marks: 2,
            explanation: 'Faith presses past discouragement and past failures straight toward Christ.',
          },
          {
            id: 'cbq-f-1b',
            question: 'Why did Jesus stop to speak directly to her and call her "Daughter"?',
            modelAnswer: 'He wanted her to know she was not stealing a hidden blessing, but was publicly restored to dignity, community, and personal relationship as a daughter of the Kingdom.',
            marks: 3,
            explanation: 'Jesus heals both the body and the wounded heart.',
          },
        ],
      },
    ],
    giveReasons: [
      {
        id: 'gr-f-1',
        statement: 'Why does Jesus declare in Hebrews 11:6 that without faith it is impossible to please God?',
        reasonPoints: [
          'Faith honors God\'s truthfulness and character—believing that He exists and rewards those who diligently seek Him.',
          'Self-reliance seeks glory for ourselves, whereas faith turns all reliance and glory toward God.',
        ],
        scientificKeywordFocus: ['Trust', 'Character of God', 'Hebrews 11:6', 'Diligent Seeking'],
        modelAnswer:
          'Faith pleases God because it takes Him at His Word and trusts His goodness even in unseen trials. Refusing to trust God treats His promises as unreliable, while faith honors Him as faithful and true.',
        marks: 3,
      },
    ],
    differentiations: [
      {
        id: 'diff-f-1',
        topicHeading: 'Walking by Sight vs. Walking by Faith',
        conceptA: 'Walking by Sight (Natural Fear)',
        conceptB: 'Walking by Faith (Christ-Centered Trust)',
        rows: [
          {
            parameter: 'Primary Anchor',
            conceptAValue: 'Visible circumstances, headlines, and shifting emotions',
            conceptBValue: 'The unchanging Word and character of Jesus Christ',
          },
          {
            parameter: 'Response to Crisis',
            conceptAValue: 'Panic, despair, and assuming God has forgotten',
            conceptBValue: 'Prayer, peace, and expecting God\'s deliverance',
          },
          {
            parameter: 'Focus of Attention',
            conceptAValue: 'Size of the giants or height of the waves',
            conceptBValue: 'Greatness of the Savior standing beside you',
          },
        ],
        keyTakeaway: 'Fear looks at the storm and forgets Jesus is in the boat; faith looks at Jesus and remembers the storm obeys His voice.',
      },
    ],
    shortAnswers: [
      {
        id: 'sa-f-1',
        question: 'What practical lesson does Jesus\' sleeping in the boat during the storm (Mark 4:38) teach believers?',
        marks: 3,
        keyPointsRequired: ['Presence of Christ', 'Perfect peace in God\'s will', 'Authority over creation'],
        modelAnswer:
          'Jesus slept in complete peace because He trusted His Father\'s plan and held sovereign authority over the wind and sea. When Christ is present in our lives, no storm can capsize His purpose for us.',
        markingScheme: [
          { step: 'Acknowledge Christ\'s peaceful trust in the Father', marksAllocated: 1 },
          { step: 'Recognize Christ\'s presence in the storm', marksAllocated: 1 },
          { step: 'Apply peace over panic to daily trials', marksAllocated: 1 },
        ],
      },
    ],
    longAnswers: [
      {
        id: 'la-f-1',
        question: 'Summarize three heroes of faith from Hebrews 11 and explain how their obedience points to Jesus Never Fails.',
        marks: 5,
        structuralGuideline: 'Cite Noah, Abraham, and Moses (or Rahab/David) and show how God honored their trust in His unseen promise.',
        modelAnswer:
          '1. Noah built an ark before rain had ever been seen, trusting God\'s warning and saving his household.\n2. Abraham stepped out not knowing where he was going, trusting God to build a lasting city.\n3. Moses chose reproach with God\'s people over Egypt\'s treasures, enduring as seeing Him who is invisible.\nTogether they prove across centuries that every promise God speaks is faithfully kept—Jesus never fails those who trust Him.',
        rubricBreakdown: [
          { criterion: 'Accurate biblical examples from Hebrews 11', marks: 2 },
          { criterion: 'Connection between unseen promise and faithful obedience', marks: 2 },
          { criterion: 'Application to trusting Christ today', marks: 1 },
        ],
      },
    ],
    practiceExercises: [
      {
        id: 'ex-f-1',
        question: 'Write a short faith declaration & prayer for a storm or challenge you or a loved one is facing, anchoring it in Hebrews 13:8 and Mark 4:39.',
        type: 'prayer',
        maxScore: 5,
        modelAnswer:
          'Lord Jesus, You are the same yesterday, today, and forever. Just as You spoke "Peace, be still!" to the storm in Galilee, I invite Your peace over my family and my heart today. I choose to walk by faith and not by fear, knowing You never fail. Amen.',
        keyRubrics: ['Cites Scripture promise', 'Replaces fear with trust in Jesus', 'Encouraging and prayerful tone'],
      },
    ],
    studyNotes: [
      {
        title: '1. Four Anchors When Storms Hit',
        bullets: [
          'Remember Jesus is in the boat with you (Matthew 28:20).',
          'Recall His past faithfulness — He is the same yesterday, today, and forever.',
          'Feed your faith daily on Scripture rather than feeding fear on anxious thoughts.',
        ],
        formulaBox: 'Anchor Verse: Hebrews 13:8 — "Jesus Christ is the same yesterday, today, and forever."',
      },
    ],
    quickTips: [
      'Watch the "Jesus Never Fails" YouTube sermon on Mark 4 before bed when feeling anxious.',
      'Keep a "Answered Prayers Journal" to remind your heart of God\'s past rescues.',
    ],
    prayerPoints:
      'Pray for supernatural peace in every household storm, physical and emotional healing, and unwavering faith.',
  },
  {
    id: 'gospel-prayer-breakthrough',
    title: 'Prevailing Prayer, Intercession & Breakthrough Promises',
    pillar: 'Prayer & Intercession',
    scriptureBook: 'Matthew 6 & Jeremiah 33',
    anchorVerse: 'Call to Me, and I will answer you, and show you great and mighty things, which you do not know. — Jeremiah 33:3',
    topic: 'The Lord\'s Prayer, Persistent Intercession & Spiritual Warfare',
    channelReference: 'Jesus Never Fail Ministries YouTube Channel',
    youtubeChannelUrl: JESUS_NEVER_FAILS_CHANNEL_URL,
    suggestedVideos: makeSuggestedVideos('Prayer Breakthrough Intercession', [
      {
        id: 'yt-pr-1',
        title: 'Jesus Never Fails: Midnight Prayer & Chain-Breaking Intercession',
        duration: '31:20',
        category: 'Prayer & Deliverance',
        scriptureReference: 'Acts 16:25-26 & James 5:16',
        description: 'Powerful prayer session inspired by Paul and Silas praising and praying until prison doors opened.',
      },
      {
        id: 'yt-pr-2',
        title: 'How Jesus Taught Us to Pray — The Lord\'s Prayer Unlocked',
        duration: '24:12',
        category: 'Bible Teaching',
        scriptureReference: 'Matthew 6:9-13',
        description: 'Line-by-line walkthrough of worship, surrender, daily provision, forgiveness, and protection.',
      },
    ]),
    fellowshipName: 'Watchmen Prayer Altar',
    createdAt: '2026-11-21',
    googleMeetUrl: 'https://meet.google.com/jnf-prayer-altar',
    isLiveNow: true,
    summary:
      'Prayer is living communion with our Heavenly Father through Jesus Christ. Explore the pattern of the Lord\'s Prayer, the power of united intercession, and why persistent, humble prayer never goes unheard.',
    definitions: [
      {
        id: 'def-p-1',
        term: 'Intercession',
        definition: 'Standing in the gap before God in prayer on behalf of others—family, church, neighbors, and nations.',
        formula: '1 Timothy 2:1 · Romans 8:34',
        analogy: 'Like an advocate pleading kindly for a friend before a merciful King.',
        example: 'Christ Jesus Himself ever lives to make intercession for us (Hebrews 7:25).',
      },
      {
        id: 'def-p-2',
        term: 'Abba, Father',
        definition: 'An intimate Aramaic term of warm family trust used by Jesus and imparted to believers by the Holy Spirit.',
        formula: 'Romans 8:15 · Galatians 4:6',
        analogy: 'A child running straight into their loving father\'s arms without hesitation.',
        example: 'We do not pray as distant strangers begging a reluctant judge, but as adopted sons and daughters.',
      },
    ],
    flashcards: [
      {
        id: 'fc-p-1',
        category: 'James 5:16',
        front: 'What does James 5:16 declare about the prayer of a righteous person?',
        back: '"The effective, fervent prayer of a righteous man avails much."',
        hint: 'Prayer backed by sincerity and faith carries real spiritual power.',
      },
      {
        id: 'fc-p-2',
        category: 'Philippians 4:6-7',
        front: 'What is the divine antidote to anxiety according to Philippians 4:6-7?',
        back: '"Be anxious for nothing, but in everything by prayer and supplication, with thanksgiving, let your requests be made known to God; and the peace of God... will guard your hearts."',
        hint: 'Prayer + Supplication + Thanksgiving = Guarding Peace.',
      },
    ],
    quiz: [
      {
        id: 'q-p-1',
        question: 'In Matthew 6:9, how does Jesus instruct believers to begin the Lord\'s Prayer?',
        options: [
          'With a list of complaints',
          '"Our Father in heaven, hallowed be Your name"',
          'With long repetitions to be seen by crowds',
          'By asking only for earthly wealth',
        ],
        correctIndex: 1,
        explanation: 'Jesus begins with relationship ("Our Father") and reverence ("hallowed be Your name") before presenting personal needs.',
        points: 1000,
        timeLimitSeconds: 20,
      },
      {
        id: 'q-p-2',
        question: 'What happened in Acts 16:25-26 when Paul and Silas prayed and sang hymns to God at midnight?',
        options: [
          'They fell silent from exhaustion',
          'A great earthquake shook the prison foundations and every chain was loosed',
          'The jailer sent them away in anger',
          'Only Paul escaped while others remained bound',
        ],
        correctIndex: 1,
        explanation: 'Midnight worship and prayer brought God\'s delivering power, shaking the foundations and leading the jailer\'s household to salvation.',
        points: 1000,
        timeLimitSeconds: 20,
      },
    ],
    assertionReasons: [
      {
        id: 'ar-p-1',
        assertion: 'Forgiving others is deeply connected to our own fellowship in prayer.',
        reason: 'In Matthew 6:14-15, Jesus teaches that our Heavenly Father forgives us as we forgive those who trespass against us.',
        correctOption: 'A',
        explanation: 'Both statements are true, and Jesus explicitly highlights forgiveness in the Lord\'s Prayer because bitterness clogs spiritual communion.',
        conceptTip: 'Keep short accounts of forgiveness so prayer flows unhindered.',
      },
    ],
    caseBasedQuestions: [
      {
        id: 'cbq-p-1',
        title: 'Daniel\'s Unwavering Prayer Habit (Daniel 6:10)',
        casePassage:
          'When jealous officials persuaded King Darius to sign a decree forbidding prayer to anyone except the king for thirty days under penalty of the lions\' den, Daniel knew the decree was signed. Yet he went home, knelt down on his knees three times a day in his upper room with windows open toward Jerusalem, and prayed and gave thanks before his God, as was his custom since early days.',
        scenarioContext: 'Old Testament Prayer Pattern · Book of Daniel',
        subQuestions: [
          {
            id: 'cbq-p-1a',
            question: 'Notice Daniel didn\'t just ask for rescue—what attitude accompanied his prayer even under threat?',
            modelAnswer: 'He "gave thanks before his God," maintaining gratitude and steady trust before the crisis was even resolved.',
            marks: 2,
            explanation: 'Gratitude in prayer declares that God is greater than the decree.',
          },
        ],
      },
    ],
    giveReasons: [
      {
        id: 'gr-p-1',
        statement: 'Why does Jesus teach in Luke 18:1 that people "always ought to pray and not lose heart"?',
        reasonPoints: [
          'Delayed answers are not denials; God works in His perfect timing to mature our trust.',
          'Persistent prayer aligns our desires with God\'s will rather than letting discouragement silence us.',
        ],
        scientificKeywordFocus: ['Persistence', 'Luke 18:1', 'Timing', 'Trust'],
        modelAnswer:
          'Jesus warns against losing heart because spiritual breakthroughs often require persevering faith. Waiting in prayer strengthens dependence on God rather than abandoning hope prematurely.',
        marks: 3,
      },
    ],
    differentiations: [
      {
        id: 'diff-p-1',
        topicHeading: 'Performative Prayer vs. Authentic Secret-Place Prayer',
        conceptA: 'Performative Prayer (Matthew 6:5)',
        conceptB: 'Secret-Place Prayer (Matthew 6:6)',
        rows: [
          {
            parameter: 'Audience',
            conceptAValue: 'Seeking applause and notice from people',
            conceptBValue: 'Seeking the Father who sees in secret',
          },
          {
            parameter: 'Style',
            conceptAValue: 'Empty, showy repetition without heart',
            conceptBValue: 'Honest, humble, scripture-anchored communion',
          },
          {
            parameter: 'Reward',
            conceptAValue: 'Temporary human praise only',
            conceptBValue: 'God\'s open blessing, peace, and answered prayer',
          },
        ],
        keyTakeaway: 'God looks at a humble, sincere heart—not impressive vocabulary.',
      },
    ],
    shortAnswers: [
      {
        id: 'sa-p-1',
        question: 'Briefly explain the ACTS model of balanced daily prayer.',
        marks: 3,
        keyPointsRequired: ['Adoration', 'Confession', 'Thanksgiving', 'Supplication'],
        modelAnswer:
          'A stands for Adoration (praising God for who He is), C for Confession (honest repentance), T for Thanksgiving (gratitude for His blessings), and S for Supplication (bringing requests for ourselves and others).',
        markingScheme: [
          { step: 'Define Adoration and Confession', marksAllocated: 1.5 },
          { step: 'Define Thanksgiving and Supplication', marksAllocated: 1.5 },
        ],
      },
    ],
    longAnswers: [
      {
        id: 'la-p-1',
        question: 'Break down the six petitions of the Lord\'s Prayer (Matthew 6:9-13) and how each shapes a believer\'s daily priorities.',
        marks: 5,
        structuralGuideline: 'Group the first three God-centered petitions and the final three human-need petitions.',
        modelAnswer:
          'God-centered petitions: (1) Hallowed be Your name (worship), (2) Your kingdom come (mission), (3) Your will be done (surrender). Believer-need petitions: (4) Give us daily bread (provision), (5) Forgive us as we forgive (mercy & relationships), (6) Lead us not into temptation and deliver us from evil (spiritual protection).',
        rubricBreakdown: [
          { criterion: 'God-centered petitions explained', marks: 2.5 },
          { criterion: 'Daily need & protection petitions explained', marks: 2.5 },
        ],
      },
    ],
    practiceExercises: [
      {
        id: 'ex-p-1',
        question: 'Compose a personal prayer using the ACTS pattern (Adoration, Confession, Thanksgiving, Supplication) for your home and community.',
        type: 'prayer',
        maxScore: 5,
        modelAnswer:
          'Heavenly Father, I adore You as the Almighty Maker who never fails. Forgive any pride or fear in my heart today. Thank You for sending Jesus and sustaining my family. I lift up my neighbors and loved ones for healing, salvation, and peace. In Jesus\' name, Amen.',
        keyRubrics: ['Includes Adoration & Thanksgiving', 'Includes humble Confession', 'Includes Intercession for others'],
      },
    ],
    studyNotes: [
      {
        title: '1. Stepping Into the Prayer Closet',
        bullets: [
          'Set a daily dedicated time to turn off distractions and meet with the Father (Matthew 6:6).',
          'Pray Scripture back to God—His promises never return void (Isaiah 55:11).',
        ],
        formulaBox: 'Anchor Verse: Jeremiah 33:3 — "Call to Me, and I will answer you, and show you great and mighty things."',
      },
    ],
    quickTips: [
      'Join the Jesus Never Fails YouTube Channel prayer streams whenever you need united agreement in prayer.',
      'Turn every anxious thought immediately into a prayer of thanksgiving (Philippians 4:6).',
    ],
    prayerPoints:
      'Pray for revival in homes, deliverance from fear and bondage, and unity among believers.',
  },
  {
    id: 'gospel-holy-spirit-revival',
    title: 'Walking in the Holy Spirit: Power, Fruit & Revival',
    pillar: 'Holy Spirit & Revival',
    scriptureBook: 'Acts 2 & Galatians 5',
    anchorVerse: 'But you shall receive power when the Holy Spirit has come upon you; and you shall be witnesses to Me. — Acts 1:8',
    topic: 'The Indwelling Helper, Fruit of the Spirit & Bold Witness',
    channelReference: 'Jesus Never Fail Ministries YouTube Channel',
    youtubeChannelUrl: JESUS_NEVER_FAILS_CHANNEL_URL,
    suggestedVideos: makeSuggestedVideos('Holy Spirit Revival Fruit', [
      {
        id: 'yt-hs-1',
        title: 'Jesus Never Fails: Fresh Fire & Anointing of the Holy Spirit',
        duration: '29:50',
        category: 'Sermon',
        scriptureReference: 'Acts 2:1-18',
        description: 'Understanding Pentecost, spiritual empowerment, and living as a bold witness for Christ.',
      },
      {
        id: 'yt-hs-2',
        title: 'The Ninefold Fruit of the Spirit Explained',
        duration: '21:15',
        category: 'Bible Teaching',
        scriptureReference: 'Galatians 5:22-25',
        description: 'How the Holy Spirit transforms everyday character into love, joy, peace, patience, and self-control.',
      },
    ]),
    fellowshipName: 'Upper Room Revival Fellowship',
    createdAt: '2026-11-21',
    googleMeetUrl: 'https://meet.google.com/jnf-upper-room',
    isLiveNow: true,
    summary:
      'Jesus promised never to leave His followers as orphans—He sent the Holy Spirit (the Comforter and Helper) to dwell within believers, illuminate Scripture, cultivate Christlike character, and empower bold Gospel witness.',
    definitions: [
      {
        id: 'def-hs-1',
        term: 'Paraclete (Greek: Parakletos)',
        definition: 'Jesus\' title for the Holy Spirit meaning Helper, Comforter, Advocate, and Counselor called alongside believers.',
        formula: 'John 14:16, 26',
        analogy: 'A faithful guide walking right beside you through unfamiliar territory, whispering truth and courage.',
        example: 'He will teach you all things, and bring to your remembrance all things that Jesus said.',
      },
      {
        id: 'def-hs-2',
        term: 'Fruit of the Spirit',
        definition: 'The single ninefold Christlike character produced naturally when a believer abides in Jesus and walks in the Spirit.',
        formula: 'Galatians 5:22-23',
        analogy: 'Apples growing organically on a healthy tree connected to living roots—not plastic fruit stapled onto dry branches.',
        example: 'Love, joy, peace, longsuffering, kindness, goodness, faithfulness, gentleness, self-control.',
      },
    ],
    flashcards: [
      {
        id: 'fc-hs-1',
        category: 'Galatians 5:22-23',
        front: 'List the nine qualities of the Fruit of the Spirit.',
        back: 'Love, joy, peace, longsuffering (patience), kindness, goodness, faithfulness, gentleness, and self-control.',
        hint: 'Notice Scripture calls it "fruit" (singular)—a unified cluster of Christ\'s character.',
      },
      {
        id: 'fc-hs-2',
        category: 'Zechariah 4:6',
        front: 'Complete God\'s word of empowerment: "Not by might nor by power..."',
        back: '"...but by My Spirit, says the LORD of hosts." (Zechariah 4:6)',
        hint: 'Spiritual victory comes by God\'s Spirit, not human muscle.',
      },
    ],
    quiz: [
      {
        id: 'q-hs-1',
        question: 'In Acts 1:8, what primary purpose did Jesus give for receiving the power of the Holy Spirit?',
        options: [
          'To gain worldly popularity',
          'To be witnesses to Jesus everywhere—from Jerusalem to the ends of the earth',
          'To avoid all earthly challenges',
          'To debate philosophy',
        ],
        correctIndex: 1,
        explanation: 'Jesus linked Spirit empowerment directly with Gospel witness: "you shall be witnesses to Me."',
        points: 1000,
        timeLimitSeconds: 20,
      },
      {
        id: 'q-hs-2',
        question: 'In John 16:13, how does Jesus describe the Spirit\'s ministry toward God\'s Word?',
        options: [
          'He will replace the Scriptures',
          'He is the Spirit of truth who will guide you into all truth',
          'He speaks only of human achievements',
          'He hides wisdom from ordinary believers',
        ],
        correctIndex: 1,
        explanation: 'The Holy Spirit always glorifies Jesus and guides believers into the truth of God\'s Word.',
        points: 1000,
        timeLimitSeconds: 20,
      },
    ],
    assertionReasons: [
      {
        id: 'ar-hs-1',
        assertion: 'True spiritual maturity is measured primarily by Christlike love and the Fruit of the Spirit.',
        reason: '1 Corinthians 13 teaches that even spectacular gifts without love profit nothing.',
        correctOption: 'A',
        explanation: 'Both statements are true, and 1 Corinthians 13 explains why gifts must always operate through sacrificial love.',
        conceptTip: 'Gifts empower ministry; Fruit validates character.',
      },
    ],
    caseBasedQuestions: [
      {
        id: 'cbq-hs-1',
        title: 'Peter Transformed: From Fearful Denial to Bold Pentecost Witness (Acts 2:14-41)',
        casePassage:
          'Days before the crucifixion, Peter denied knowing Jesus three times out of fear. Yet after the resurrection and the outpouring of the Holy Spirit at Pentecost, that same Peter stood courageously before thousands in Jerusalem and proclaimed the crucified and risen Christ, and about three thousand souls repented and were added that day.',
        scenarioContext: 'Book of Acts · Power of the Spirit',
        subQuestions: [
          {
            id: 'cbq-hs-1a',
            question: 'What transformed Peter from fearful silence to fearless Gospel preaching?',
            modelAnswer: 'Restoring grace from the risen Christ combined with the empowering baptism of the Holy Spirit at Pentecost.',
            marks: 3,
            explanation: 'The Holy Spirit turns timid believers into courageous witnesses.',
          },
        ],
      },
    ],
    giveReasons: [
      {
        id: 'gr-hs-1',
        statement: 'Why does Paul speak of "the fruit of the Spirit" (singular) rather than "fruits" (plural) in Galatians 5:22?',
        reasonPoints: [
          'All nine virtues grow together as one unified expression of Jesus Christ\'s own character inside the believer.',
          'Believers do not pick one trait and ignore others; abiding in the Spirit cultivates the whole harvest.',
        ],
        scientificKeywordFocus: ['Unified Character', 'Abiding in Christ', 'Galatians 5:22'],
        modelAnswer:
          'Paul uses the singular "fruit" because love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, and self-control are interwoven facets of Christ\'s life produced together by one Spirit.',
        marks: 3,
      },
    ],
    differentiations: [
      {
        id: 'diff-hs-1',
        topicHeading: 'Works of the Flesh vs. Fruit of the Spirit (Galatians 5:19-23)',
        conceptA: 'Works of the Flesh (Self-Rule)',
        conceptB: 'Fruit of the Spirit (Christ-Rule)',
        rows: [
          {
            parameter: 'Source',
            conceptAValue: 'Sinful human nature operating apart from God',
            conceptBValue: 'The indwelling Holy Spirit nourishing the new nature',
          },
          {
            parameter: 'Relational Impact',
            conceptAValue: 'Hatred, contentions, jealousies, outbursts of wrath',
            conceptBValue: 'Love, peace, kindness, gentleness, reconciliation',
          },
          {
            parameter: 'Ultimate Destiny',
            conceptAValue: 'Inner emptiness and spiritual bondage',
            conceptBValue: 'Abundant life and eternal fellowship with God',
          },
        ],
        keyTakeaway: 'Walk in the Spirit, and you shall not fulfill the lust of the flesh (Galatians 5:16).',
      },
    ],
    shortAnswers: [
      {
        id: 'sa-hs-1',
        question: 'How does the Holy Spirit assist believers when they do not know what to pray (Romans 8:26)?',
        marks: 2,
        keyPointsRequired: ['Helps in our weakness', 'Intercedes according to God\'s will'],
        modelAnswer:
          'Romans 8:26 promises that the Spirit helps us in our weaknesses and intercedes for us with groanings that cannot be uttered, perfectly aligning our cries with the Father\'s will.',
        markingScheme: [
          { step: 'Mention Spirit helping in weakness', marksAllocated: 1 },
          { step: 'Cite Romans 8:26 intercession', marksAllocated: 1 },
        ],
      },
    ],
    longAnswers: [
      {
        id: 'la-hs-1',
        question: 'Discuss how John 15:1-5 ("Abiding in the Vine") and Galatians 5:22-25 work together in everyday Christian living.',
        marks: 5,
        structuralGuideline: 'Explain branch connection, pruning, and Spirit-led daily obedience.',
        modelAnswer:
          'In John 15, Jesus explains that apart from Him we can do nothing; branches only bear fruit by remaining connected to the Vine. Galatians 5 reveals that this abiding life happens by walking in step with the Holy Spirit—crucifying selfish pride and allowing Christ\'s love, joy, and peace to overflow to others.',
        rubricBreakdown: [
          { criterion: 'Connection between John 15 Vine metaphor and Galatians 5 Fruit', marks: 3 },
          { criterion: 'Practical daily abiding habits', marks: 2 },
        ],
      },
    ],
    practiceExercises: [
      {
        id: 'ex-hs-1',
        question: 'Reflect on one Fruit of the Spirit (e.g., Patience, Peace, or Gentleness) you want the Holy Spirit to deepen in you this week, and write a prayer of surrender.',
        type: 'prayer',
        maxScore: 5,
        modelAnswer:
          'Holy Spirit, I invite Your gentle leadership into my words and reactions this week. Where impatience rises, produce Your longsuffering; where anxiety knocks, fill me with Christ\'s peace. Make my life a clear witness that Jesus never fails. Amen.',
        keyRubrics: ['Identifies specific Fruit of the Spirit', 'Demonstrates reliance on the Holy Spirit', 'Practical daily application'],
      },
    ],
    studyNotes: [
      {
        title: '1. Cultivating Sensitivity to the Holy Spirit',
        bullets: [
          'Start your day inviting the Holy Spirit to guide your speech, decisions, and compassion.',
          'Grieve not the Spirit through unforgiveness or harsh words (Ephesians 4:30-32).',
        ],
        formulaBox: 'Anchor Verse: Acts 1:8 — "You shall receive power when the Holy Spirit has come upon you."',
      },
    ],
    quickTips: [
      'Memorize Galatians 5:22-23 and review one character quality each morning.',
    ],
    prayerPoints:
      'Pray for a fresh outpouring of the Holy Spirit on families, churches, and bold Gospel witnesses.',
  },
  {
    id: 'gospel-kingdom-discipleship',
    title: 'Sermon on the Mount: Living as Salt & Light in Christ',
    pillar: 'Kingdom Discipleship',
    scriptureBook: 'Matthew 5–7',
    anchorVerse: 'But seek first the kingdom of God and His righteousness, and all these things shall be added to you. — Matthew 6:33',
    topic: 'The Beatitudes, Forgiveness, Loving Enemies & Building on the Rock',
    channelReference: 'Jesus Never Fail Ministries YouTube Channel',
    youtubeChannelUrl: JESUS_NEVER_FAILS_CHANNEL_URL,
    suggestedVideos: makeSuggestedVideos('Sermon on the Mount Matthew 5', [
      {
        id: 'yt-kd-1',
        title: 'Jesus Never Fails: Building Your Life on the Solid Rock (Matthew 7)',
        duration: '26:40',
        category: 'Sermon',
        scriptureReference: 'Matthew 7:24-27',
        description: 'Why hearing and obeying the words of Jesus keeps your household standing when floods rise.',
      },
      {
        id: 'yt-kd-2',
        title: 'Seek First the Kingdom — Overcoming Worry with Jesus',
        duration: '20:18',
        category: 'Bible Teaching',
        scriptureReference: 'Matthew 6:25-34',
        description: 'Jesus\' gentle cure for tomorrow\'s anxieties through trusting our Heavenly Father\'s care.',
      },
    ]),
    fellowshipName: 'Kingdom Builders Fellowship',
    createdAt: '2026-11-21',
    googleMeetUrl: 'https://meet.google.com/jnf-kingdom-rock',
    isLiveNow: true,
    summary:
      'In Matthew 5–7, Jesus reveals the upside-down beauty of God\'s Kingdom—where the humble are blessed, enemies are loved, worry is replaced with trust in our Father, and lives built on His words stand firm through every storm.',
    definitions: [
      {
        id: 'def-kd-1',
        term: 'The Beatitudes (Latin: Beatus — Blessed)',
        definition: 'Eight Kingdom blessings spoken by Jesus in Matthew 5:3-12 describing the character and joy of His followers.',
        formula: 'Matthew 5:3-12',
        analogy: 'The portrait of Christ\'s own heart mirrored in His disciples.',
        example: '"Blessed are the pure in heart, for they shall see God." (Matthew 5:8)',
      },
      {
        id: 'def-kd-2',
        term: 'Salt and Light',
        definition: 'Jesus\' twin metaphors for believers preserving goodness against moral decay and shining God\'s love into dark places.',
        formula: 'Matthew 5:13-16',
        analogy: 'A city perched on a hill at night—visible for miles, guiding weary travelers safely home.',
        example: 'Let your light so shine before men, that they may see your good works and glorify your Father in heaven.',
      },
    ],
    flashcards: [
      {
        id: 'fc-kd-1',
        category: 'Matthew 6:33',
        front: 'What promise follows seeking first God\'s Kingdom and righteousness?',
        back: '"...and all these things shall be added to you." (Matthew 6:33)',
        hint: 'Put God first, and trust Him for every daily provision.',
      },
      {
        id: 'fc-kd-2',
        category: 'Matthew 7:24',
        front: 'Whom does Jesus compare to a wise builder who built his house on the rock?',
        back: '"Whoever hears these sayings of Mine, and does them." (Matthew 7:24)',
        hint: 'Not merely hearing sermons—putting Jesus\' words into practice.',
      },
    ],
    quiz: [
      {
        id: 'q-kd-1',
        question: 'In Matthew 7:24-27, what determined whether the house stood or fell when the rains and floods came?',
        options: [
          'The height of the roof',
          'Whether the builder both heard AND practiced Jesus\' words (rock vs sand)',
          'The size of the house',
          'How sunny the weather was when built',
        ],
        correctIndex: 1,
        explanation: 'Both builders heard Jesus\' sayings, yet only the one who obeyed them built on the unshakeable Rock.',
        points: 1000,
        timeLimitSeconds: 20,
      },
    ],
    assertionReasons: [
      {
        id: 'ar-kd-1',
        assertion: 'Jesus commands believers not to worry about food, drink, or clothing.',
        reason: 'Our Heavenly Father feeds the birds of the air and clothes the lilies, and we are of much more value to Him.',
        correctOption: 'A',
        explanation: 'In Matthew 6:25-32, Jesus grounds freedom from worry directly in the Father\'s loving care and knowledge of our needs.',
        conceptTip: 'Worry shrinks when you remember who your Father is.',
      },
    ],
    caseBasedQuestions: [
      {
        id: 'cbq-kd-1',
        title: 'The Wise and Foolish Builders (Matthew 7:24-27)',
        casePassage:
          'Two houses stood side by side. Both endured the same descending rain, rising floods, and blowing winds. The house on the sand fell with a great crash, while the house founded on the rock stood unmoved.',
        scenarioContext: 'Sermon on the Mount Conclusion',
        subQuestions: [
          {
            id: 'cbq-kd-1a',
            question: 'Why did both houses experience the same storm?',
            modelAnswer: 'Following Jesus does not exempt life from storms, but obedience to Christ gives an unshakeable foundation that survives every storm.',
            marks: 3,
            explanation: 'Rock-solid obedience preserves us when trials strike.',
          },
        ],
      },
    ],
    giveReasons: [
      {
        id: 'gr-kd-1',
        statement: 'Why does Jesus teach in Matthew 5:44 to "love your enemies and pray for those who spitefully use you"?',
        reasonPoints: [
          'Doing so reflects the character of our Heavenly Father who sends sun and rain on both the just and unjust.',
          'Christlike love breaks cycles of hatred and points persecutors to the transforming Gospel.',
        ],
        scientificKeywordFocus: ['Agape Love', 'Father\'s Character', 'Reconciliation'],
        modelAnswer:
          'Anyone can greet friends, but loving enemies displays supernatural Kingdom grace—imitating Jesus who prayed "Father, forgive them" even from the cross.',
        marks: 3,
      },
    ],
    differentiations: [
      {
        id: 'diff-kd-1',
        topicHeading: 'House on the Sand vs. House on the Rock',
        conceptA: 'Hearing Only (Sand)',
        conceptB: 'Hearing & Obeying Jesus (Rock)',
        rows: [
          {
            parameter: 'Foundation',
            conceptAValue: 'Shifting opinions, pride, and self-will',
            conceptBValue: 'Daily obedience to the teachings of Jesus Christ',
          },
          {
            parameter: 'Storm Outcome',
            conceptAValue: 'Collapses under grief, temptation, or crisis',
            conceptBValue: 'Stands steady and testifies that Jesus never fails',
          },
        ],
        keyTakeaway: 'Be doers of the word, and not hearers only (James 1:22).',
      },
    ],
    shortAnswers: [
      {
        id: 'sa-kd-1',
        question: 'What does Matthew 5:16 teach about the ultimate goal of Christian kindness and good works?',
        marks: 2,
        keyPointsRequired: ['Not self-praise', 'Glorifying the Father in heaven'],
        modelAnswer:
          'Good works are meant to shine like light so others see God\'s love in action and glorify our Father in heaven—never to boast in ourselves.',
        markingScheme: [
          { step: 'Identify shining as light through good works', marksAllocated: 1 },
          { step: 'State goal: glorifying the Father in heaven', marksAllocated: 1 },
        ],
      },
    ],
    longAnswers: [
      {
        id: 'la-kd-1',
        question: 'Explain three Beatitudes from Matthew 5:3-10 and how they contrast with the world\'s definition of success.',
        marks: 5,
        structuralGuideline: 'Compare worldly pride/dominance with meekness, mercy, and peacemaking.',
        modelAnswer:
          '1. Poor in spirit (5:3): Recognizing total spiritual need before God rather than self-sufficiency.\n2. Meek (5:5): Strength under God\'s gentle control rather than aggressive pride.\n3. Peacemakers (5:9): Actively reconciling broken relationships rather than fueling division, reflecting Christ the Prince of Peace.',
        rubricBreakdown: [
          { criterion: 'Three Beatitudes accurately explained', marks: 3 },
          { criterion: 'Clear contrast with worldly values', marks: 2 },
        ],
      },
    ],
    practiceExercises: [
      {
        id: 'ex-kd-1',
        question: 'Identify one area where Jesus is calling you to be "Salt and Light" or a peacemaker this week, and write a practical action & prayer.',
        type: 'prayer',
        maxScore: 5,
        modelAnswer:
          'Lord Jesus, help me build my life on Your Word as a doer and not just a listener. Show me how to bring peace, gentle encouragement, and honest integrity to my workplace and family today so Your light shines clearly. Amen.',
        keyRubrics: ['Actionable obedience', 'Rooted in Matthew 5–7', 'Points glory to God'],
      },
    ],
    studyNotes: [
      {
        title: '1. Kingdom Priorities',
        bullets: [
          'Seek God\'s rule and righteousness before chasing anxious worries.',
          'Practice hidden generosity and quiet forgiveness.',
        ],
        formulaBox: 'Anchor Verse: Matthew 6:33 — "Seek first the kingdom of God and His righteousness."',
      },
    ],
    quickTips: [
      'Read one chapter of Matthew 5–7 aloud each morning for three days.',
    ],
    prayerPoints:
      'Pray for homes built on the Rock of Scripture and hearts free from anxiety.',
  },
  {
    id: 'gospel-psalms-worship-refuge',
    title: 'The Good Shepherd & Secret Place of Refuge (Psalm 23 & 91)',
    pillar: 'Psalms & Worship',
    scriptureBook: 'Psalm 23, Psalm 91 & John 10',
    anchorVerse: 'The LORD is my shepherd; I shall not want. — Psalm 23:1',
    topic: 'Divine Guidance, Protection, Comfort in the Valley & Praise',
    channelReference: 'Jesus Never Fail Ministries YouTube Channel',
    youtubeChannelUrl: JESUS_NEVER_FAILS_CHANNEL_URL,
    suggestedVideos: makeSuggestedVideos('Psalm 23 91 Good Shepherd Worship', [
      {
        id: 'yt-ps-1',
        title: 'Jesus Never Fails — Psalm 91 Prayer of Protection Over Your Home',
        duration: '25:05',
        category: 'Prayer & Deliverance',
        scriptureReference: 'Psalm 91:1-16',
        description: 'Declaring God\'s faithfulness, shelter, and angelic protection under the shadow of the Almighty.',
      },
      {
        id: 'yt-ps-2',
        title: 'The Good Shepherd Who Never Fails (Psalm 23 & John 10)',
        duration: '23:30',
        category: 'Sermon',
        scriptureReference: 'Psalm 23 & John 10:11',
        description: 'Walking through green pastures and dark valleys with Jesus, the Shepherd who laid down His life for the sheep.',
      },
      {
        id: 'yt-ps-3',
        title: 'Jesus Never Fails — Evening Worship & Scripture Meditation',
        duration: '16:45',
        category: 'Worship Song',
        scriptureReference: 'Psalm 23:6',
        description: 'Peaceful worship melodies proclaiming that goodness and mercy shall follow us all the days of our lives.',
      },
    ]),
    fellowshipName: 'Psalms & Sanctuary Worship',
    createdAt: '2026-11-21',
    googleMeetUrl: 'https://meet.google.com/jnf-psalm-23',
    isLiveNow: true,
    summary:
      'Psalm 23 and Psalm 91 meet directly in Jesus Christ, the Good Shepherd (John 10:11). Whether resting beside still waters or walking through the valley of the shadow of death, His rod, staff, and unfailing presence comfort and shield His people.',
    definitions: [
      {
        id: 'def-ps-1',
        term: 'Hesed (Hebrew: Unfailing Lovingkindness)',
        definition: 'God\'s steadfast, covenant-keeping mercy and loyal love that pursues His children every single day.',
        formula: 'Psalm 23:6 · Lamentations 3:22-23',
        analogy: 'A faithful shepherd who refuses to leave even one sheep behind in the dark hills.',
        example: '"Surely goodness and mercy (hesed) shall follow me all the days of my life."',
      },
      {
        id: 'def-ps-2',
        term: 'The Secret Place (Psalm 91:1)',
        definition: 'Close daily abiding in God\'s presence where fear loses its grip under the shadow of the Almighty.',
        formula: 'Psalm 91:1-2',
        analogy: 'A warm, guarded shelter inside a fortress while cold rain beats outside.',
        example: '"He who dwells in the secret place of the Most High shall abide under the shadow of the Almighty."',
      },
    ],
    flashcards: [
      {
        id: 'fc-ps-1',
        category: 'Psalm 23:4',
        front: 'Why does the psalmist fear no evil even in the valley of the shadow of death?',
        back: '"For You are with me; Your rod and Your staff, they comfort me." (Psalm 23:4)',
        hint: 'Presence conquers fear—notice the shift from talking ABOUT God ("He") to talking TO God ("You").',
      },
      {
        id: 'fc-ps-2',
        category: 'John 10:11',
        front: 'How did Jesus fulfill Psalm 23 in John 10:11?',
        back: '"I am the good shepherd. The good shepherd gives His life for the sheep."',
        hint: 'Our Shepherd didn\'t just guide us—He died and rose for us.',
      },
    ],
    quiz: [
      {
        id: 'q-ps-1',
        question: 'In Psalm 23:4, what comforting instruments does the Shepherd carry through the dark valley?',
        options: [
          'A golden crown and scepter',
          'His rod (for defense) and His staff (for guidance)',
          'Maps and lanterns',
          'Silver trumpets',
        ],
        correctIndex: 1,
        explanation: 'The shepherd\'s rod defends the flock from predators, while the curved staff gently guides and rescues wandering sheep.',
        points: 1000,
        timeLimitSeconds: 20,
      },
    ],
    assertionReasons: [
      {
        id: 'ar-ps-1',
        assertion: 'Even in the presence of enemies, God prepares a table of provision and peace for His child.',
        reason: 'Psalm 23:5 declares: "You prepare a table before me in the presence of my enemies; You anoint my head with oil; my cup runs over."',
        correctOption: 'A',
        explanation: 'Both statements are true, showing God\'s sustaining abundance even before external opposition disappears.',
        conceptTip: 'God gives peace right inside the battle, not only after it.',
      },
    ],
    caseBasedQuestions: [
      {
        id: 'cbq-ps-1',
        title: 'From "He Leads Me" to "You Are With Me" (Psalm 23:1-6)',
        casePassage:
          'Notice a tender shift in Psalm 23. In verses 1–3, David speaks about God in the third person ("He makes me lie down... He leads me"). Yet the moment David steps into the valley of the shadow of death in verse 4, he switches to second-person intimacy: "For YOU are with me."',
        scenarioContext: 'Devotional Hebrew Poetry · Psalm 23',
        subQuestions: [
          {
            id: 'cbq-ps-1a',
            question: 'What does this shift from "He" to "You" teach us about valleys and trials?',
            modelAnswer: 'In green pastures we talk about God, but in dark valleys we lean directly on Him in close, personal fellowship.',
            marks: 3,
            explanation: 'Hard seasons draw us from distant knowledge into intimate trust.',
          },
        ],
      },
    ],
    giveReasons: [
      {
        id: 'gr-ps-1',
        statement: 'Why does Psalm 23:4 specify "the valley of the SHADOW of death" rather than death itself?',
        reasonPoints: [
          'Because Jesus conquered death and took its sting at Calvary, only a shadow remains for those in Him.',
          'A shadow cannot harm a believer; it only proves there is a greater Light shining nearby.',
        ],
        scientificKeywordFocus: ['Shadow', 'Victory of Christ', 'Presence'],
        modelAnswer:
          'Because Christ defeated death through His resurrection, believers walk only through its shadow—never its permanent sting—with the Good Shepherd holding their hand.',
        marks: 3,
      },
    ],
    differentiations: [
      {
        id: 'diff-ps-1',
        topicHeading: 'The Hireling vs. The Good Shepherd (John 10:11-14)',
        conceptA: 'The Hireling (Self-Interest)',
        conceptB: 'Jesus, The Good Shepherd',
        rows: [
          {
            parameter: 'When Danger Comes',
            conceptAValue: 'Leaves the sheep and flees',
            conceptBValue: 'Stands firm and lays down His life for the sheep',
          },
          {
            parameter: 'Knowledge of Sheep',
            conceptAValue: 'Cares only for wages, not personal bond',
            conceptBValue: 'Knows each sheep by name and calls them tenderly',
          },
        ],
        keyTakeaway: 'Jesus never fails or abandons His flock—His sheep hear His voice and are eternally secure in His hand (John 10:28).',
      },
    ],
    shortAnswers: [
      {
        id: 'sa-ps-1',
        question: 'What does "dwell in the secret place of the Most High" (Psalm 91:1) look like in everyday life?',
        marks: 2,
        keyPointsRequired: ['Daily abiding', 'Trusting God as refuge'],
        modelAnswer:
          'It means making God\'s presence our daily home through prayer, Scripture meditation, and immediate trust whenever fear or trouble appears.',
        markingScheme: [
          { step: 'Explain consistent abiding in prayer and Word', marksAllocated: 1 },
          { step: 'Connect to shelter from fear', marksAllocated: 1 },
        ],
      },
    ],
    longAnswers: [
      {
        id: 'la-ps-1',
        question: 'Walk through all six verses of Psalm 23 showing how Jesus fulfills every promise as our Good Shepherd.',
        marks: 5,
        structuralGuideline: 'Cover provision (v1-2), restoration (v3), comfort in valleys (v4), victory & anointing (v5), and eternal home (v6).',
        modelAnswer:
          'V1-2: In Christ we lack no spiritual good and find rest in His Word. V3: He restores weary souls and leads us in righteousness. V4: In grief or crisis, His presence drives out fear. V5: He overflows our lives with grace even amidst trials. V6: His mercy pursues us all our days until we dwell in the Father\'s house forever.',
        rubricBreakdown: [
          { criterion: 'All sections of Psalm 23 covered', marks: 3 },
          { criterion: 'Christ-centered fulfillment highlighted', marks: 2 },
        ],
      },
    ],
    practiceExercises: [
      {
        id: 'ex-ps-1',
        question: 'Rewrite Psalm 23:1-6 as a personal prayer of worship and trust for your own household.',
        type: 'prayer',
        maxScore: 5,
        modelAnswer:
          'Lord Jesus, You are my Good Shepherd and I shall not lack any good thing. Restore my soul today and lead me in paths of righteousness for Your name\'s sake. Even when dark valleys appear, I fear no evil because You never fail and You are right beside me. Amen.',
        keyRubrics: ['Personalizes Psalm 23', 'Focuses on Jesus as Shepherd', 'Expresses peace and trust'],
      },
    ],
    studyNotes: [
      {
        title: '1. Resting Under His Wings',
        bullets: [
          'Psalm 23 is not just for funerals—it is a song for living triumphantly every single day.',
          'Read Psalm 91 aloud with your family as a declaration of peace and refuge.',
        ],
        formulaBox: 'Anchor Verse: Psalm 23:1 — "The LORD is my shepherd; I shall not want."',
      },
    ],
    quickTips: [
      'Sing along with the Jesus Never Fails Worship Channel playlist during morning devotions.',
    ],
    prayerPoints:
      'Pray for peace in weary hearts, healing for the sick, and households sheltered under Psalm 91.',
  },
];

export const INITIAL_FELLOWSHIPS: FellowshipGroup[] = [
  {
    id: 'fellowship-grace-truth',
    name: 'Grace & Salvation Gospel Partners',
    pillar: 'Salvation & Grace',
    focusScripture: 'Romans 5 & Ephesians 2 · Cross & Redemption',
    memberCount: 1,
    meetingLink: 'https://meet.google.com/jnf-grace-cross',
    currentSessionId: 'gospel-salvation-cross-grace',
    scheduleTime: 'Sundays & Wednesdays · 7:00 PM',
  },
  {
    id: 'fellowship-faith-miracles',
    name: 'Jesus Never Fail Ministries Faith Circle',
    pillar: 'Faith & Miracles',
    focusScripture: 'Hebrews 11 & Mark 4 · Unshakeable Faith',
    memberCount: 1,
    meetingLink: 'https://meet.google.com/jnf-faith-alive',
    currentSessionId: 'gospel-faith-jesus-never-fails',
    scheduleTime: 'Tuesdays & Fridays · 8:00 PM',
  },
  {
    id: 'fellowship-prayer-altar',
    name: 'Watchmen Prayer & Intercession Altar',
    pillar: 'Prayer & Intercession',
    focusScripture: 'Matthew 6 & Jeremiah 33 · Breakthrough Prayer',
    memberCount: 1,
    meetingLink: 'https://meet.google.com/jnf-prayer-altar',
    currentSessionId: 'gospel-prayer-breakthrough',
    scheduleTime: 'Daily Morning Watch · 6:00 AM',
  },
  {
    id: 'fellowship-worship-psalms',
    name: 'Psalms & Sanctuary Worship Circle',
    pillar: 'Psalms & Worship',
    focusScripture: 'Psalm 23 & Psalm 91 · Good Shepherd Refuge',
    memberCount: 1,
    meetingLink: 'https://meet.google.com/jnf-psalm-23',
    currentSessionId: 'gospel-psalms-worship-refuge',
    scheduleTime: 'Saturdays · 6:30 PM',
  },
];
