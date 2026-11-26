import React, { useState } from 'react';
import {
  Languages,
  ScrollText,
  Volume2,
  Search,
  Loader2,
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { HebrewGreekLetter, RabbiHistoryLesson } from '../types';
import {
  HEBREW_ALPHABET,
  GREEK_ALPHABET,
  RABBI_HISTORY_LESSONS,
} from '../data/languagesAndHistoryData';
import { safeFetchJson } from '../services/apiClient';

type HubMode = 'hebrew' | 'greek' | 'rabbi';

export const HebrewGreekRabbiHub: React.FC = () => {
  const [mode, setMode] = useState<HubMode>('hebrew');
  const [selectedHebrew, setSelectedHebrew] = useState<HebrewGreekLetter>(HEBREW_ALPHABET[0]);
  const [selectedGreek, setSelectedGreek] = useState<HebrewGreekLetter>(GREEK_ALPHABET[0]);
  const [quizHideNames, setQuizHideNames] = useState<boolean>(false);

  const [lessons, setLessons] = useState<RabbiHistoryLesson[]>(RABBI_HISTORY_LESSONS);
  const [activeLessonId, setActiveLessonId] = useState<string>(RABBI_HISTORY_LESSONS[0].id);
  const [rabbiQuery, setRabbiQuery] = useState('');
  const [loadingRabbi, setLoadingRabbi] = useState(false);
  const [rabbiError, setRabbiError] = useState<string | null>(null);

  const activeLesson = lessons.find((l) => l.id === activeLessonId) || lessons[0];

  const speakLetter = (letter: HebrewGreekLetter) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const text = `${letter.name}. Biblical word: ${letter.biblicalWordTranslit}.`;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
  };

  const handleAskRabbiHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rabbiQuery.trim()) return;
    setLoadingRabbi(true);
    setRabbiError(null);
    try {
      const result = await safeFetchJson<RabbiHistoryLesson>('/api/bible/rabbi-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryText: rabbiQuery.trim() }),
      });
      if (!result.ok || !result.data?.title) {
        throw new Error(result.error || 'Could not retrieve Jewish historical insight.');
      }
      const lesson = result.data;
      setLessons((prev) => [lesson, ...prev]);
      setActiveLessonId(lesson.id);
      setRabbiQuery('');
    } catch (err: any) {
      setRabbiError(err?.message || 'Unable to generate historical commentary right now.');
    } finally {
      setLoadingRabbi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Archival Scroll Editorial Header */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 p-6 sm:p-7 flex flex-col justify-between space-y-5">
          <div className="space-y-2">
            <div className="text-xs text-stone-500 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-amber-800">Biblical Languages & Jewish Roots</span>
              <span aria-hidden="true">·</span>
              <span>22 Hebrew Letters</span>
              <span aria-hidden="true">·</span>
              <span>24 Greek Letters</span>
              <span aria-hidden="true">·</span>
              <span>Rabbi Historical Insights</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-editorial">
              Walk Deeper Into Original Scripture & Covenant History
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed max-w-2xl">
              Learn every letter of the Hebrew Aleph-Bet and Koine Greek alphabet alongside historical Jewish Torah & Second Temple explanations showing how Jesus fulfills every covenant promise.
            </p>
          </div>

          {/* 3-Way Segmented Switcher */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 rounded-xl max-w-xl">
            <button
              type="button"
              onClick={() => setMode('hebrew')}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
                mode === 'hebrew'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span className="font-hebrew text-sm">א</span>
              <span>Hebrew Letters (22)</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('greek')}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
                mode === 'greek'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span className="font-greek text-sm">Ω</span>
              <span>Greek Letters (24)</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('rabbi')}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
                mode === 'rabbi'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ScrollText className="w-3.5 h-3.5" />
              <span>Rabbi History</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 relative min-h-[200px] bg-stone-900">
          <img
            src="/src/assets/images/hebrew_scroll_heritage_1795368174259.jpg"
            alt="Ancient parchment Torah scroll lit warmly"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-end p-5">
            <div className="text-amber-200 text-lg font-hebrew font-bold">
              דְּבַר־אֱלֹהֵינוּ יָקוּם לְעוֹלָם
            </div>
            <p className="text-xs text-stone-200 mt-0.5">
              "The word of our God stands forever." — Isaiah 40:8
            </p>
          </div>
        </div>
      </div>

      {/* MODE 1: HEBREW ALEPH-BET */}
      {mode === 'hebrew' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-stone-900 font-editorial">
                  Interactive Hebrew Aleph-Bet Chart (Right-to-Left Heritage)
                </h3>
                <p className="text-xs text-stone-500">
                  Click any Hebrew letter to study its pictograph, Gematria number, and Biblical root word
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuizHideNames((q) => !q)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  quizHideNames
                    ? 'bg-amber-800 text-white border-amber-800'
                    : 'bg-[#FBF9F5] text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {quizHideNames ? 'Practice Mode: Reveal Names' : 'Hide Names to Practice'}
              </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5" dir="rtl">
              {HEBREW_ALPHABET.map((letter) => {
                const isSelected = selectedHebrew.id === letter.id;
                return (
                  <button
                    key={letter.id}
                    type="button"
                    onClick={() => setSelectedHebrew(letter)}
                    dir="ltr"
                    className={`p-3 rounded-xl border text-center transition-colors flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-[#FBF9F5] text-stone-900 border-stone-200 hover:border-amber-600'
                    }`}
                  >
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-bold font-hebrew leading-none">
                        {letter.glyph}
                      </span>
                      {letter.finalForm && (
                        <span
                          className={`text-lg font-hebrew ${
                            isSelected ? 'text-amber-300' : 'text-stone-400'
                          }`}
                          title="Final sofit form"
                        >
                          {letter.finalForm}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-semibold truncate max-w-full ${
                        isSelected ? 'text-amber-200' : 'text-stone-700'
                      }`}
                    >
                      {quizHideNames ? '?' : letter.name.split(' ')[0]}
                    </span>
                    <span
                      className={`text-[10px] tabular-nums ${
                        isSelected ? 'text-stone-300' : 'text-stone-400'
                      }`}
                    >
                      {letter.numericValue}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hebrew Letter Study Card */}
          <div className="lg:col-span-5 bg-white border border-stone-200 rounded-2xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-[#FBF9F5] border border-stone-200 flex items-center justify-center text-5xl font-bold font-hebrew text-stone-900 shrink-0">
                  {selectedHebrew.glyph}
                </div>
                <div>
                  <div className="text-xs text-stone-500 tabular-nums">
                    Gematria Value: {selectedHebrew.numericValue}
                    {selectedHebrew.finalForm ? ` · Final Form: ${selectedHebrew.finalForm}` : ''}
                  </div>
                  <h4 className="text-2xl font-bold text-stone-900 font-editorial">
                    {selectedHebrew.name}
                  </h4>
                  <p className="text-xs text-amber-800 font-semibold mt-0.5">
                    Sound: {selectedHebrew.pronunciation}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => speakLetter(selectedHebrew)}
                className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white shrink-0"
                title="Pronounce letter and word"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#FBF9F5] border border-stone-200">
                <div className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
                  Ancient Pictograph & Heritage
                </div>
                <p className="text-stone-700 mt-1 leading-relaxed">
                  {selectedHebrew.pictographOrOrigin}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
                <div className="font-bold text-amber-950 uppercase tracking-wider text-[11px]">
                  Spiritual & Biblical Teaching
                </div>
                <p className="text-stone-800 mt-1 leading-relaxed">
                  {selectedHebrew.spiritualMeaning}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900">Biblical Vocabulary Example</span>
                  <span className="text-stone-500 font-semibold">
                    {selectedHebrew.scriptureReference}
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-2 pt-1">
                  <span className="text-sm font-bold text-rose-800">
                    {selectedHebrew.biblicalWordTranslit}
                  </span>
                  <span className="text-2xl font-bold font-hebrew text-stone-900">
                    {selectedHebrew.biblicalWordExample}
                  </span>
                </div>
                <p className="text-stone-600 leading-relaxed">
                  {selectedHebrew.biblicalWordMeaning}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: KOINE GREEK ALPHABET */}
      {mode === 'greek' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-stone-900 font-editorial">
                  Koine Greek New Testament Alphabet (24 Letters)
                </h3>
                <p className="text-xs text-stone-500">
                  Learn uppercase & lowercase letters behind the Gospels and Epistles
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuizHideNames((q) => !q)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  quizHideNames
                    ? 'bg-indigo-800 text-white border-indigo-800'
                    : 'bg-[#FBF9F5] text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {quizHideNames ? 'Practice Mode: Reveal Names' : 'Hide Names to Practice'}
              </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
              {GREEK_ALPHABET.map((letter) => {
                const isSelected = selectedGreek.id === letter.id;
                return (
                  <button
                    key={letter.id}
                    type="button"
                    onClick={() => setSelectedGreek(letter)}
                    className={`p-3 rounded-xl border text-center transition-colors flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-[#FBF9F5] text-stone-900 border-stone-200 hover:border-indigo-700'
                    }`}
                  >
                    <div className="flex items-baseline gap-1.5 font-greek">
                      <span className="text-2xl font-semibold leading-none">{letter.glyph}</span>
                      <span
                        className={`text-lg ${
                          isSelected ? 'text-amber-200' : 'text-stone-500'
                        }`}
                      >
                        {letter.lowercaseGlyph}
                      </span>
                    </div>
                    <span
                      className={`text-[11px] font-semibold truncate max-w-full ${
                        isSelected ? 'text-amber-200' : 'text-stone-700'
                      }`}
                    >
                      {quizHideNames ? '?' : letter.name}
                    </span>
                    <span
                      className={`text-[10px] tabular-nums ${
                        isSelected ? 'text-stone-300' : 'text-stone-400'
                      }`}
                    >
                      {letter.numericValue}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Greek Letter Study Card */}
          <div className="lg:col-span-5 bg-white border border-stone-200 rounded-2xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-[#FBF9F5] border border-stone-200 flex items-center justify-center gap-1 font-greek text-3xl font-semibold text-stone-900 shrink-0">
                  <span>{selectedGreek.glyph}</span>
                  <span className="text-stone-500 text-2xl">{selectedGreek.lowercaseGlyph}</span>
                </div>
                <div>
                  <div className="text-xs text-stone-500 tabular-nums">
                    Isopsephy Value: {selectedGreek.numericValue}
                  </div>
                  <h4 className="text-2xl font-bold text-stone-900 font-editorial">
                    {selectedGreek.name}
                  </h4>
                  <p className="text-xs text-indigo-900 font-semibold mt-0.5">
                    Sound: {selectedGreek.pronunciation}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => speakLetter(selectedGreek)}
                className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white shrink-0"
                title="Pronounce Greek letter & NT word"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#FBF9F5] border border-stone-200">
                <div className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
                  Origin & Manuscript Form
                </div>
                <p className="text-stone-700 mt-1 leading-relaxed">
                  {selectedGreek.pictographOrOrigin}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200">
                <div className="font-bold text-indigo-950 uppercase tracking-wider text-[11px]">
                  Gospel & New Testament Resonance
                </div>
                <p className="text-stone-800 mt-1 leading-relaxed">
                  {selectedGreek.spiritualMeaning}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900">Key New Testament Greek Word</span>
                  <span className="text-stone-500 font-semibold">
                    {selectedGreek.scriptureReference}
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-2 pt-1">
                  <span className="text-sm font-bold text-indigo-900">
                    {selectedGreek.biblicalWordTranslit}
                  </span>
                  <span className="text-2xl font-semibold font-greek text-stone-900">
                    {selectedGreek.biblicalWordExample}
                  </span>
                </div>
                <p className="text-stone-600 leading-relaxed">
                  {selectedGreek.biblicalWordMeaning}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: RABBI & JEWISH HISTORICAL INSIGHTS */}
      {mode === 'rabbi' && (
        <div className="space-y-6">
          {/* Interactive Lookup Form */}
          <form
            onSubmit={handleAskRabbiHistory}
            className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
          >
            <div className="flex items-center gap-2.5 flex-1">
              <Search className="w-4 h-4 text-amber-800 shrink-0" />
              <input
                type="text"
                value={rabbiQuery}
                onChange={(e) => setRabbiQuery(e.target.value)}
                placeholder="Ask Rabbi historical background on any Bible passage or custom (e.g. 'Shabbat Lamp', 'Kinsman Redeemer', 'Day of Atonement', 'Galilee Synagogue')..."
                className="w-full text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loadingRabbi || !rabbiQuery.trim()}
              className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 shrink-0"
            >
              {loadingRabbi ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span>Explore Jewish History</span>
            </button>
          </form>

          {rabbiError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{rabbiError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Lessons Selector */}
            <aside className="lg:col-span-4 space-y-2.5">
              {lessons.map((lesson) => {
                const isActive = lesson.id === activeLesson.id;
                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => setActiveLessonId(lesson.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-colors space-y-1 ${
                      isActive
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-white text-stone-900 border-stone-200 hover:border-amber-600'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span
                        className={`font-semibold ${
                          isActive ? 'text-amber-300' : 'text-amber-800'
                        }`}
                      >
                        {lesson.hebrewTerm}
                      </span>
                      <span
                        className={`font-hebrew text-sm ${
                          isActive ? 'text-stone-200' : 'text-stone-600'
                        }`}
                      >
                        {lesson.hebrewScript}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold font-editorial leading-snug">
                      {lesson.title}
                    </h4>
                    <div
                      className={`text-[11px] ${
                        isActive ? 'text-stone-300' : 'text-stone-500'
                      }`}
                    >
                      {lesson.torahOrScriptureRefs}
                    </div>
                  </button>
                );
              })}
            </aside>

            {/* Active Lesson Commentary Canvas */}
            <article className="lg:col-span-8 bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-stone-100 pb-5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
                  <span>{activeLesson.era}</span>
                  <span className="font-semibold text-amber-800">
                    {activeLesson.torahOrScriptureRefs}
                  </span>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="text-2xl font-bold text-stone-900 font-editorial">
                    {activeLesson.title}
                  </h3>
                  <span className="text-2xl font-bold font-hebrew text-amber-900">
                    {activeLesson.hebrewScript}
                  </span>
                </div>
                <p className="text-sm text-stone-700 leading-relaxed pt-1">
                  {activeLesson.summary}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-800" />
                  <span>Historical Teaching & Rabbi Scholarship</span>
                </h4>
                <ul className="space-y-2.5">
                  {activeLesson.rabbiPerspectiveDetails.map((pt, i) => (
                    <li
                      key={i}
                      className="p-3.5 rounded-xl bg-[#FBF9F5] border border-stone-200 text-xs sm:text-sm text-stone-800 leading-relaxed flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1.5">
                  <div className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                    Synagogue & Daily Jewish Custom
                  </div>
                  <p className="text-xs sm:text-sm text-stone-800 leading-relaxed">
                    {activeLesson.jewishCustomsExplained}
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-rose-50/60 border border-rose-200 space-y-1.5">
                  <div className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                    How Jesus Fulfills This Promise
                  </div>
                  <p className="text-xs sm:text-sm text-stone-800 leading-relaxed">
                    {activeLesson.fulfillmentInJesus}
                  </p>
                </div>
              </div>
            </article>
          </div>
        </div>
      )}
    </div>
  );
};
