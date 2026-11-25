import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  Languages,
  Loader2,
  BookmarkPlus,
  Youtube,
  ExternalLink,
  Sparkles,
  Volume2,
  AlertCircle,
  Edit2,
  Check,
  Columns2,
} from 'lucide-react';
import {
  BibleBookMeta,
  BibleChapterPayload,
  BibleVerseItem,
  VerseHebrewGreekMeaning,
  CustomBiblicalCard,
} from '../types';
import { BIBLE_BOOKS_CATALOG, BIBLE_LANGUAGES } from '../data/bibleCatalog';
import { buildChannelVideoSearchUrl } from '../data/gospelData';

interface BibleReaderStudioProps {
  userName?: string;
  preferredLanguage?: string;
  onChangeLanguage?: (langCode: string) => void;
  onUpdateReaderName?: (newName: string) => void;
  onSaveVerseAsCard?: (cardDraft: Partial<CustomBiblicalCard>) => void;
}

export const BibleReaderStudio: React.FC<BibleReaderStudioProps> = ({
  userName = 'Gospel Partner',
  preferredLanguage = 'en',
  onChangeLanguage,
  onUpdateReaderName,
  onSaveVerseAsCard,
}) => {
  const [testamentFilter, setTestamentFilter] = useState<'All' | 'Old Testament' | 'New Testament'>('All');
  const [bookSearch, setBookSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState<BibleBookMeta>(
    BIBLE_BOOKS_CATALOG.find((b) => b.name === 'Psalms') || BIBLE_BOOKS_CATALOG[0]
  );
  const [selectedChapter, setSelectedChapter] = useState<number>(23);

  const [selectedLang, setSelectedLang] = useState<string>(preferredLanguage || 'en');
  const [parallelEnglish, setParallelEnglish] = useState<boolean>(false);

  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [nameDraft, setNameDraft] = useState<string>(userName);

  const [chapterData, setChapterData] = useState<BibleChapterPayload | null>(null);
  const [loadingChapter, setLoadingChapter] = useState<boolean>(false);
  const [chapterError, setChapterError] = useState<string | null>(null);

  const [selectedVerse, setSelectedVerse] = useState<BibleVerseItem | null>(null);
  const [verseAnalysis, setVerseAnalysis] = useState<VerseHebrewGreekMeaning | null>(null);
  const [analyzingVerse, setAnalyzingVerse] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  useEffect(() => {
    setNameDraft(userName);
  }, [userName]);

  useEffect(() => {
    if (preferredLanguage) {
      setSelectedLang(preferredLanguage);
    }
  }, [preferredLanguage]);

  const activeLangMeta =
    BIBLE_LANGUAGES.find((l) => l.code === selectedLang) || BIBLE_LANGUAGES[0];
  const featuredLanguages = BIBLE_LANGUAGES.filter((l) => l.region === 'Featured');
  const indianLanguages = BIBLE_LANGUAGES.filter((l) => l.region === 'Indian');
  const internationalLanguages = BIBLE_LANGUAGES.filter((l) => l.region === 'International');

  const filteredBooks = BIBLE_BOOKS_CATALOG.filter((b) => {
    const matchesTestament = testamentFilter === 'All' || b.testament === testamentFilter;
    const matchesSearch =
      !bookSearch.trim() ||
      b.name.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.category.toLowerCase().includes(bookSearch.toLowerCase());
    return matchesTestament && matchesSearch;
  });

  const loadChapter = useCallback(
    async (bookName: string, chapterNum: number, langCode: string, parallel: boolean) => {
      setLoadingChapter(true);
      setChapterError(null);
      setSelectedVerse(null);
      setVerseAnalysis(null);
      setAnalysisError(null);
      const idx = BIBLE_BOOKS_CATALOG.findIndex((b) => b.name === bookName);
      const bookNumber = idx >= 0 ? idx + 1 : 19;

      try {
        const res = await fetch(
          `/api/bible/chapter?book=${encodeURIComponent(bookName)}&bookNumber=${bookNumber}&chapter=${chapterNum}&lang=${encodeURIComponent(langCode)}&parallel=${parallel ? 'true' : 'false'}`
        );
        const data = await res.json();
        if (!res.ok || !Array.isArray(data?.verses)) {
          throw new Error(data?.error || `Could not load ${bookName} ${chapterNum}`);
        }
        setChapterData(data);
      } catch (err: any) {
        setChapterError(err?.message || 'Could not load Bible chapter right now.');
      } finally {
        setLoadingChapter(false);
      }
    },
    []
  );

  useEffect(() => {
    loadChapter(selectedBook.name, selectedChapter, selectedLang, parallelEnglish);
  }, [selectedBook.name, selectedChapter, selectedLang, parallelEnglish, loadChapter]);

  const handleLanguageSelect = (langCode: string) => {
    setSelectedLang(langCode);
    if (onChangeLanguage) onChangeLanguage(langCode);
  };

  const handleSelectBook = (book: BibleBookMeta) => {
    setSelectedBook(book);
    setSelectedChapter(1);
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = nameDraft.trim() || 'Gospel Partner';
    if (onUpdateReaderName) onUpdateReaderName(cleaned);
    setIsEditingName(false);
  };

  const handleAnalyzeVerse = async (verse: BibleVerseItem) => {
    setSelectedVerse(verse);
    setAnalyzingVerse(true);
    setAnalysisError(null);
    setVerseAnalysis(null);
    try {
      const ref = `${verse.book_name || selectedBook.name} ${verse.chapter}:${verse.verse}`;
      const res = await fetch('/api/bible/hebrew-meaning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: ref,
          verseText: verse.englishText || verse.text,
          testament: selectedBook.testament,
        }),
      });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data?.keyWords)) {
        throw new Error(data?.error || 'Could not retrieve Hebrew/Greek meanings.');
      }
      setVerseAnalysis(data);
    } catch (err: any) {
      setAnalysisError(err?.message || 'Unable to analyze verse roots right now.');
    } finally {
      setAnalyzingVerse(false);
    }
  };

  const handleSpeakVerse = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = selectedLang;
    utter.rate = 0.92;
    window.speechSynthesis.speak(utter);
  };

  const handleSaveToCardTemplate = () => {
    if (!selectedVerse || !onSaveVerseAsCard) return;
    const ref = `${selectedVerse.book_name || selectedBook.name} ${selectedVerse.chapter}:${selectedVerse.verse}`;
    const firstWord = verseAnalysis?.keyWords?.[0];
    onSaveVerseAsCard({
      title: `${selectedBook.name} ${selectedVerse.chapter}:${selectedVerse.verse} Meditation`,
      reference: ref,
      hebrewOrGreekTerm: firstWord
        ? `${firstWord.originalScript} (${firstWord.transliteration}) — ${firstWord.rootMeaning}`
        : selectedBook.hebrewOrGreekName || '',
      frontPrompt: `Reflect on ${ref}: What truth about God’s Word shines in this verse?`,
      backTruth: selectedVerse.text,
      historicalNote:
        verseAnalysis?.rabbiHistoricalContext ||
        verseAnalysis?.gospelFulfillment ||
        `Studied by ${userName} in ${selectedBook.name} (${activeLangMeta.label}).`,
      templateStyle: 'torah-scroll',
    });
    setSavedNotice(`Sent ${ref} to Editable Card Studio`);
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const channelChapterUrl = buildChannelVideoSearchUrl(`${selectedBook.name} ${selectedChapter}`);

  return (
    <div className="space-y-5">
      {/* Personalized User's Name + Multi-Language Sanctuary Header */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div className="space-y-1.5">
            <div className="text-xs text-stone-500 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-amber-800">
                Personalized Holy Bible · All 66 Books
              </span>
              <span aria-hidden="true">·</span>
              <span>Reading in {activeLangMeta.nativeLabel}</span>
            </div>

            {isEditingName ? (
              <form onSubmit={handleSaveName} className="flex flex-wrap items-center gap-2 pt-1">
                <input
                  type="text"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  maxLength={60}
                  placeholder="Enter your name"
                  className="border border-stone-300 rounded-xl px-3 py-2 text-base font-bold text-stone-900 font-editorial focus:outline-none focus:border-stone-900"
                />
                <button
                  type="submit"
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold inline-flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Name</span>
                </button>
              </form>
            ) : (
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-editorial">
                  {userName}&rsquo;s Holy Bible
                </h1>
                {onUpdateReaderName && (
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="min-h-[36px] px-2.5 py-1 rounded-lg border border-stone-200 bg-[#FBF9F5] hover:bg-stone-100 text-xs font-semibold text-stone-700 inline-flex items-center gap-1"
                    title="Personalize reader name on your Bible"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit Name</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <a
            href={channelChapterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors self-start lg:self-center shrink-0"
          >
            <Youtube className="w-4 h-4" />
            <span>Watch {selectedBook.name} on @jesusneverfails7649</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Multi-Language Bible Switcher (Featured + All Indian + Foreign Languages) */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mr-1 inline-flex items-center gap-1">
              <Languages className="w-3.5 h-3.5 text-amber-800" />
              <span>Bible Language:</span>
            </span>
            {featuredLanguages.map((lang) => {
              const isCurrent = selectedLang === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLanguageSelect(lang.code)}
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    isCurrent
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-[#FBF9F5] text-stone-800 border-stone-200 hover:border-amber-700'
                  }`}
                >
                  {lang.nativeLabel}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              aria-label="Select Indian or Foreign Bible Language"
              value={selectedLang}
              onChange={(e) => handleLanguageSelect(e.target.value)}
              className="min-h-[44px] bg-[#FBF9F5] border border-stone-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:border-stone-900"
            >
              <optgroup label="Featured Languages">
                {featuredLanguages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeLabel}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Indian Languages">
                {indianLanguages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeLabel}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Foreign / Global Languages">
                {internationalLanguages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeLabel}
                  </option>
                ))}
              </optgroup>
            </select>

            {selectedLang !== 'en' && (
              <button
                type="button"
                onClick={() => setParallelEnglish((p) => !p)}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                  parallelEnglish
                    ? 'bg-amber-800 text-white border-amber-800'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span>{parallelEnglish ? 'Parallel English: ON' : 'Show Parallel English'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main 12-Col Layout: Books Sidebar (4) + Reading Canvas & Word Study (8) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: All 66 Books + Chapters Selector */}
        <aside className="lg:col-span-4 bg-white border border-stone-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-900 font-editorial flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-800" />
              <span>66 Books of the Bible</span>
            </h2>
            <span className="text-xs text-stone-500 tabular-nums">
              {filteredBooks.length} books
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3.5" />
            <input
              type="text"
              value={bookSearch}
              onChange={(e) => setBookSearch(e.target.value)}
              placeholder="Search book (e.g. Genesis, Psalms, John)..."
              className="w-full min-h-[44px] border border-stone-200 bg-[#FBF9F5] rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-stone-800 focus:outline-none focus:border-stone-700"
            />
          </div>

          <div className="grid grid-cols-3 gap-1 p-1 bg-stone-100 rounded-xl text-xs font-semibold">
            {(['All', 'Old Testament', 'New Testament'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setTestamentFilter(tab)}
                className={`min-h-[38px] py-1.5 px-2 rounded-lg transition-colors truncate ${
                  testamentFilter === tab
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {tab === 'All' ? 'All (66)' : tab === 'Old Testament' ? 'OT (39)' : 'NT (27)'}
              </button>
            ))}
          </div>

          <div className="max-h-[260px] overflow-y-auto pr-1 grid grid-cols-2 gap-1.5">
            {filteredBooks.map((book) => {
              const isSelected = book.id === selectedBook.id;
              return (
                <button
                  key={book.id}
                  type="button"
                  onClick={() => handleSelectBook(book)}
                  className={`min-h-[44px] text-left px-3 py-2 rounded-xl border text-xs transition-colors flex items-center justify-between gap-1 ${
                    isSelected
                      ? 'bg-stone-900 text-white border-stone-900 font-semibold'
                      : 'bg-[#FBF9F5] text-stone-800 border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <span className="truncate">{book.name}</span>
                  <span
                    className={`text-[10px] tabular-nums shrink-0 ${
                      isSelected ? 'text-amber-200' : 'text-stone-400'
                    }`}
                  >
                    {book.chapters}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Chapter Picker Grid for Active Book */}
          <div className="pt-3 border-t border-stone-100 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-800">
                {selectedBook.name} Chapters
              </span>
              <span className="text-stone-500 font-hebrew">
                {selectedBook.hebrewOrGreekName}
              </span>
            </div>
            <div className="max-h-[190px] overflow-y-auto pr-1 grid grid-cols-5 sm:grid-cols-6 gap-1.5">
              {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setSelectedChapter(ch)}
                  className={`min-h-[40px] py-1.5 rounded-lg text-xs font-semibold tabular-nums border transition-colors ${
                    selectedChapter === ch
                      ? 'bg-rose-700 text-white border-rose-700'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right: Chapter Text + Interactive Verse Hebrew/Greek Meaning Drawer */}
        <section className="lg:col-span-8 space-y-5">
          <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-7 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <div className="text-xs text-stone-500">
                  <span>{userName}&rsquo;s Reading Sanctuary</span>
                  <span aria-hidden="true"> · </span>
                  <span>{selectedBook.testament}</span>
                  <span aria-hidden="true"> · </span>
                  <span className="font-semibold text-amber-800">
                    {chapterData?.translation_name || activeLangMeta.translationLabel}
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-semibold text-stone-900 font-editorial mt-0.5">
                  {selectedBook.name} {selectedChapter}
                </h2>
                {selectedBook.hebrewOrGreekName && (
                  <p className="text-sm text-amber-800 font-hebrew mt-0.5">
                    {selectedBook.hebrewOrGreekName}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={selectedChapter <= 1 || loadingChapter}
                  onClick={() => setSelectedChapter((c) => Math.max(1, c - 1))}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl border border-stone-200 bg-[#FBF9F5] hover:bg-stone-100 disabled:opacity-40 text-xs font-semibold text-stone-800 inline-flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev Ch.</span>
                </button>
                <button
                  type="button"
                  disabled={selectedChapter >= selectedBook.chapters || loadingChapter}
                  onClick={() => setSelectedChapter((c) => Math.min(selectedBook.chapters, c + 1))}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl border border-stone-200 bg-[#FBF9F5] hover:bg-stone-100 disabled:opacity-40 text-xs font-semibold text-stone-800 inline-flex items-center gap-1"
                >
                  <span>Next Ch.</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {savedNotice && (
              <div className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
                {savedNotice}
              </div>
            )}

            {loadingChapter ? (
              <div className="py-12 flex items-center justify-center gap-2.5 text-sm text-stone-600">
                <Loader2 className="w-5 h-5 animate-spin text-amber-800" />
                <span>
                  Opening {selectedBook.name} {selectedChapter} in {activeLangMeta.label} for {userName}...
                </span>
              </div>
            ) : chapterError ? (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{chapterError}</span>
              </div>
            ) : (
              <div className="space-y-2" dir={activeLangMeta.rtl ? 'rtl' : 'ltr'}>
                <p
                  className="text-xs text-stone-500 pb-2"
                  dir="ltr"
                >
                  Tap any verse below for its original{' '}
                  {selectedBook.testament === 'Old Testament' ? 'Hebrew' : 'Koine Greek'} root meaning & Jewish historical context.
                </p>
                {chapterData?.verses.map((v) => {
                  const isActiveVerse = selectedVerse?.verse === v.verse;
                  return (
                    <button
                      key={v.verse}
                      type="button"
                      onClick={() => handleAnalyzeVerse(v)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-colors flex flex-col gap-1.5 group ${
                        isActiveVerse
                          ? 'bg-amber-50 border border-amber-300'
                          : 'hover:bg-[#FBF9F5] border border-transparent'
                      }`}
                    >
                      <div
                        className={`flex items-baseline gap-3 w-full ${
                          activeLangMeta.rtl ? 'flex-row-reverse text-right' : ''
                        }`}
                      >
                        <span className="text-xs font-code font-semibold text-rose-700 tabular-nums shrink-0 w-7">
                          {v.verse}
                        </span>
                        <span className="text-[18px] sm:text-[19px] 2xl:text-[21px] leading-[1.72] text-stone-900 font-scripture-multilang flex-1">
                          {v.text}
                        </span>
                        <span
                          className="text-[11px] font-semibold text-stone-400 group-hover:text-amber-800 shrink-0 hidden sm:inline-flex items-center gap-1"
                          dir="ltr"
                        >
                          <Languages className="w-3 h-3" />
                          <span>Roots</span>
                        </span>
                      </div>
                      {parallelEnglish && v.englishText && (
                        <div
                          className="pl-10 text-sm sm:text-[15px] text-stone-600 font-editorial italic leading-relaxed"
                          dir="ltr"
                        >
                          {v.englishText}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Verse Original Language Meaning & Rabbi Context Drawer */}
          {selectedVerse && (
            <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 pb-4">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-amber-800 inline-flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      Original Language Word Study ·{' '}
                      {selectedBook.name} {selectedVerse.chapter}:{selectedVerse.verse}
                    </span>
                  </div>
                  <p className="text-base font-scripture-multilang text-stone-800">
                    "{selectedVerse.text}"
                  </p>
                  {selectedVerse.englishText && (
                    <p className="text-xs italic font-editorial text-stone-500">
                      "{selectedVerse.englishText}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSpeakVerse(selectedVerse.text)}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl border border-stone-200 bg-[#FBF9F5] hover:bg-stone-100 text-xs font-semibold text-stone-700 inline-flex items-center gap-1.5"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen</span>
                  </button>
                  {onSaveVerseAsCard && (
                    <button
                      type="button"
                      onClick={handleSaveToCardTemplate}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      <span>Save to Card Studio</span>
                    </button>
                  )}
                </div>
              </div>

              {analyzingVerse ? (
                <div className="py-8 flex items-center justify-center gap-2 text-xs text-stone-500">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-800" />
                  <span>Studying original Hebrew & Greek lexicons for {userName}...</span>
                </div>
              ) : analysisError ? (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  {analysisError}
                </div>
              ) : verseAnalysis ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {verseAnalysis.keyWords.map((kw, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-[#FBF9F5] border border-stone-200 space-y-1.5"
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-xs font-bold text-stone-900">
                            "{kw.englishWord}"
                          </span>
                          <span className="text-lg font-bold text-rose-800 font-hebrew">
                            {kw.originalScript}
                          </span>
                        </div>
                        <div className="text-xs text-amber-900 font-semibold">
                          {kw.transliteration}
                          {kw.strongsNumber ? ` · Strong’s ${kw.strongsNumber}` : ''}
                        </div>
                        <p className="text-xs text-stone-700 font-medium">
                          Root: {kw.rootMeaning}
                        </p>
                        <p className="text-xs text-stone-600 leading-relaxed">
                          {kw.theologicalDepth}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                      <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                        Rabbi / Jewish Historical Context
                      </h4>
                      <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                        {verseAnalysis.rabbiHistoricalContext}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-1.5">
                      <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                        Fulfilled in Jesus Christ
                      </h4>
                      <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                        {verseAnalysis.gospelFulfillment}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
