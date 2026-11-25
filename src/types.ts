export type GospelPillar =
  | 'Salvation & Grace'
  | 'Faith & Miracles'
  | 'Prayer & Intercession'
  | 'Holy Spirit & Revival'
  | 'Kingdom Discipleship'
  | 'Psalms & Worship';

export type MinistryRole = 'believer' | 'pastor';

export interface LiveYouTubeVideo {
  videoId: string;
  title: string;
  url: string;
  embedUrl: string;
  thumbnailUrl: string;
  publishedAt: string;
  description: string;
  views: string;
  isShort: boolean;
  channelName: string;
  channelHandle: string;
  channelUrl: string;
}

export interface YouTubeVideoSuggestion {
  id: string;
  videoId?: string;
  title: string;
  channelName: string;
  channelUrl: string;
  videoSearchUrl: string;
  embedUrl?: string;
  thumbnailUrl?: string;
  duration: string;
  category: 'Sermon' | 'Prayer & Deliverance' | 'Worship Song' | 'Bible Teaching';
  scriptureReference: string;
  description: string;
}

export interface DefinitionItem {
  id: string;
  term: string;
  definition: string;
  analogy?: string;
  formula?: string;
  example?: string;
}

export interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  category: string;
  hint?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  points: number;
  timeLimitSeconds: number;
}

export interface AssertionReasonQuestion {
  id: string;
  assertion: string;
  reason: string;
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  conceptTip?: string;
}

export interface CaseSubQuestion {
  id: string;
  question: string;
  options?: string[];
  correctOptionIndex?: number;
  modelAnswer: string;
  marks: number;
  explanation: string;
}

export interface CaseBasedQuestion {
  id: string;
  title: string;
  casePassage: string;
  scenarioContext?: string;
  subQuestions: CaseSubQuestion[];
}

export interface GiveReasonQuestion {
  id: string;
  statement: string;
  reasonPoints: string[];
  scientificKeywordFocus: string[];
  modelAnswer: string;
  marks: number;
}

export interface DifferentiationRow {
  parameter: string;
  conceptAValue: string;
  conceptBValue: string;
}

export interface DifferentiationItem {
  id: string;
  topicHeading: string;
  conceptA: string;
  conceptB: string;
  rows: DifferentiationRow[];
  keyTakeaway: string;
}

export interface ShortAnswerQuestion {
  id: string;
  question: string;
  marks: number;
  keyPointsRequired: string[];
  modelAnswer: string;
  markingScheme: { step: string; marksAllocated: number }[];
}

export interface LongAnswerQuestion {
  id: string;
  question: string;
  marks: number;
  structuralGuideline: string;
  modelAnswer: string;
  subParts?: { label: string; question: string; answer: string; marks: number }[];
  rubricBreakdown: { criterion: string; marks: number }[];
}

export interface PracticeExercise {
  id: string;
  question: string;
  type: 'short' | 'long' | 'prayer';
  maxScore: number;
  modelAnswer: string;
  keyRubrics: string[];
}

export interface StudyNoteSection {
  title: string;
  bullets: string[];
  formulaBox?: string;
}

export interface GospelSession {
  id: string;
  title: string;
  pillar: GospelPillar;
  scriptureBook: string;
  anchorVerse: string;
  topic: string;
  channelReference: string;
  youtubeChannelUrl: string;
  suggestedVideos: YouTubeVideoSuggestion[];
  fellowshipName: string;
  createdAt: string;
  googleMeetUrl: string;
  isLiveNow: boolean;
  summary: string;
  definitions: DefinitionItem[];
  flashcards: FlashcardItem[];
  quiz: QuizQuestion[];
  assertionReasons?: AssertionReasonQuestion[];
  caseBasedQuestions?: CaseBasedQuestion[];
  giveReasons?: GiveReasonQuestion[];
  differentiations?: DifferentiationItem[];
  shortAnswers?: ShortAnswerQuestion[];
  longAnswers?: LongAnswerQuestion[];
  practiceExercises: PracticeExercise[];
  studyNotes: StudyNoteSection[];
  quickTips: string[];
  prayerPoints: string;
}

export interface FellowshipGroup {
  id: string;
  ownerUid?: string;
  name: string;
  pillar: GospelPillar;
  focusScripture: string;
  memberCount: number;
  meetingLink: string;
  currentSessionId: string;
  scheduleTime: string;
  createdAt?: string;
}

export interface UserProfile {
  uid?: string;
  email?: string;
  role: MinistryRole;
  name: string;
  avatar: string;
  pillar: GospelPillar;
  fellowshipId?: string;
  authProvider?: 'email' | 'google' | 'guest';
  preferredBibleLanguage?: string;
}

export interface TopicProgressItem {
  uid: string;
  sessionId: string;
  quizDone: boolean;
  quizScore?: number;
  arDone: boolean;
  cbqDone: boolean;
  giveReasonDone: boolean;
  diffDone: boolean;
  subjectiveDone: boolean;
  flashcardsMastered?: number;
  updatedAt?: string;
}

export interface PrayerRequestItem {
  id: string;
  authorUid: string;
  authorName: string;
  message: string;
  topicTitle?: string;
  amenCount: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  role: 'believer' | 'pastor' | 'gospel-guide';
  text: string;
  timestamp: string;
}

export interface WritingCheckResult {
  score: number;
  maxScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface BibleBookMeta {
  id: string;
  name: string;
  testament: 'Old Testament' | 'New Testament';
  category: string;
  chapters: number;
  hebrewOrGreekName?: string;
}

export type BibleLanguageRegion = 'Featured' | 'Indian' | 'International';

export interface BibleLanguageOption {
  code: string;
  label: string;
  nativeLabel: string;
  region: BibleLanguageRegion;
  translationLabel: string;
  getBibleKey?: string;
  rtl?: boolean;
}

export interface BibleVerseItem {
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
  englishText?: string;
}

export interface BibleChapterPayload {
  reference: string;
  translation_name: string;
  languageCode?: string;
  languageLabel?: string;
  rtl?: boolean;
  verses: BibleVerseItem[];
  text?: string;
}

export interface VerseHebrewGreekMeaning {
  reference: string;
  originalLanguage: 'Hebrew' | 'Koine Greek';
  keyWords: Array<{
    englishWord: string;
    originalScript: string;
    transliteration: string;
    strongsNumber?: string;
    rootMeaning: string;
    theologicalDepth: string;
  }>;
  rabbiHistoricalContext: string;
  gospelFulfillment: string;
}

export interface HebrewGreekLetter {
  id: string;
  language: 'Hebrew' | 'Greek';
  glyph: string;
  finalForm?: string;
  lowercaseGlyph?: string;
  name: string;
  pronunciation: string;
  numericValue: number;
  pictographOrOrigin: string;
  spiritualMeaning: string;
  biblicalWordExample: string;
  biblicalWordTranslit: string;
  biblicalWordMeaning: string;
  scriptureReference: string;
}

export interface RabbiHistoryLesson {
  id: string;
  title: string;
  hebrewTerm: string;
  hebrewScript: string;
  era: string;
  torahOrScriptureRefs: string;
  summary: string;
  rabbiPerspectiveDetails: string[];
  jewishCustomsExplained: string;
  fulfillmentInJesus: string;
}

export type StoryCategory =
  | 'Patriarchs & Matriarchs'
  | 'Judges & Prophets'
  | 'Kings & Poets'
  | 'Women of Faith'
  | 'Apostles & Witnesses'
  | 'Encounters with Jesus';

export interface BibleCharacterStory {
  id: string;
  name: string;
  hebrewOrGreekName: string;
  nameMeaning: string;
  category: StoryCategory;
  era: string;
  keyChapters: string;
  anchorVerse: string;
  lifeSummary: string;
  keyTurningPoints: string[];
  spiritualLessons: string[];
  gospelConnection: string;
}

export type CardTemplateStyle =
  | 'classic-alabaster'
  | 'torah-scroll'
  | 'sanctuary-rose'
  | 'lapis-scripture';

export interface CustomBiblicalCard {
  cardId: string;
  uid?: string;
  title: string;
  reference: string;
  hebrewOrGreekTerm: string;
  frontPrompt: string;
  backTruth: string;
  historicalNote: string;
  templateStyle: CardTemplateStyle;
  updatedAt: string;
}

export interface SongReleaseItem {
  id: string;
  releaseNumber: number;
  title: string;
  subtitle: string;
  scriptureAnchor: string;
  hebrewTheme: string;
  description: string;
  listenUrl: string;
  starmakerUrl: string;
  channelVideoQueryUrl: string;
  coverImage: string;
  videoId?: string;
}

export interface SocialConnectLink {
  id: string;
  label: string;
  platform: string;
  handleOrNote: string;
  url: string;
  group: 'ministry' | 'profession';
}

export interface BookReleaseItem {
  bookId: string;
  ownerUid?: string;
  title: string;
  subtitle?: string;
  authorName: string;
  scriptureFocus?: string;
  description: string;
  releaseStatus: 'upcoming' | 'released';
  releaseDateLabel?: string;
  purchaseOrReadUrl?: string;
  youtubeTrailerUrl?: string;
  coverStyle: CardTemplateStyle;
  createdAt: string;
  updatedAt?: string;
}


