import React, { useState, useEffect } from 'react';
import {
  Users,
  Layers,
  Edit3,
  Search,
  Sparkles,
  Loader2,
  RotateCw,
  Plus,
  Save,
  Trash2,
  Printer,
  Copy,
  Check,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import {
  BibleCharacterStory,
  CardTemplateStyle,
  CustomBiblicalCard,
  StoryCategory,
} from '../types';
import {
  BIBLE_CHARACTER_STORIES,
  STORY_CATEGORIES,
} from '../data/languagesAndHistoryData';
import { DEFAULT_BIBLICAL_CARDS } from '../data/ministryLinks';
import { safeFetchJson } from '../services/apiClient';

type StoriesCardsMode = 'stories' | 'cards' | 'editor';

interface BibleStoriesAndCardsHubProps {
  customCards: CustomBiblicalCard[];
  onSaveCard: (card: CustomBiblicalCard) => Promise<void>;
  onDeleteCard: (cardId: string) => Promise<void>;
  incomingDraft?: Partial<CustomBiblicalCard> | null;
  onClearIncomingDraft?: () => void;
  initialMode?: StoriesCardsMode;
  hideInternalTabs?: boolean;
}

const TEMPLATE_STYLES: Array<{
  id: CardTemplateStyle;
  label: string;
  containerClass: string;
  accentText: string;
}> = [
  {
    id: 'classic-alabaster',
    label: 'Classic Alabaster',
    containerClass: 'bg-[#FBF9F5] border-stone-300 text-stone-900',
    accentText: 'text-stone-700',
  },
  {
    id: 'torah-scroll',
    label: 'Torah Scroll Gold',
    containerClass: 'bg-amber-50/80 border-amber-300 text-stone-900',
    accentText: 'text-amber-900',
  },
  {
    id: 'sanctuary-rose',
    label: 'Sanctuary Rose',
    containerClass: 'bg-rose-50/70 border-rose-300 text-stone-900',
    accentText: 'text-rose-800',
  },
  {
    id: 'lapis-scripture',
    label: 'Lapis Scripture',
    containerClass: 'bg-indigo-50/70 border-indigo-300 text-stone-900',
    accentText: 'text-indigo-900',
  },
];

export const BibleStoriesAndCardsHub: React.FC<BibleStoriesAndCardsHubProps> = ({
  customCards,
  onSaveCard,
  onDeleteCard,
  incomingDraft,
  onClearIncomingDraft,
  initialMode = 'stories',
  hideInternalTabs = false,
}) => {
  const [subMode, setSubMode] = useState<StoriesCardsMode>(initialMode);

  useEffect(() => {
    setSubMode(initialMode);
  }, [initialMode]);

  // Bible Character Stories state
  const [stories, setStories] = useState<BibleCharacterStory[]>(BIBLE_CHARACTER_STORIES);
  const [storyCategory, setStoryCategory] = useState<StoryCategory | 'All'>('All');
  const [storySearch, setStorySearch] = useState('');
  const [selectedStoryId, setSelectedStoryId] = useState<string>(BIBLE_CHARACTER_STORIES[0].id);
  const [lookupName, setLookupName] = useState('');
  const [lookingUpPerson, setLookingUpPerson] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Biblical Cards & Flashcards state
  const allCards: CustomBiblicalCard[] = [
    ...customCards,
    ...DEFAULT_BIBLICAL_CARDS.filter(
      (def) => !customCards.some((c) => c.cardId === def.cardId)
    ),
  ];
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Editable Card Template Studio state
  const [editingCard, setEditingCard] = useState<CustomBiblicalCard>({
    cardId: `card-${Date.now().toString(36)}`,
    title: 'My Faith Anchor Card',
    reference: 'Hebrews 13:8',
    hebrewOrGreekTerm: 'Ἰησοῦς Χριστός · Jesus Christ the Same Forever',
    frontPrompt: 'Why can we trust Jesus through every changing season of life?',
    backTruth: 'Jesus Christ is the same yesterday and today and forever.',
    historicalNote: 'Written to encourage steadfast believers holding fast to Christ.',
    templateStyle: 'torah-scroll',
    updatedAt: new Date().toISOString(),
  });
  const [savingCard, setSavingCard] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [copiedCardText, setCopiedCardText] = useState(false);

  useEffect(() => {
    if (incomingDraft && incomingDraft.title) {
      setEditingCard({
        cardId: `card-${Date.now().toString(36)}`,
        title: incomingDraft.title || 'Scripture Study Card',
        reference: incomingDraft.reference || '',
        hebrewOrGreekTerm: incomingDraft.hebrewOrGreekTerm || '',
        frontPrompt: incomingDraft.frontPrompt || 'Scripture meditation prompt',
        backTruth: incomingDraft.backTruth || 'Word of God',
        historicalNote: incomingDraft.historicalNote || '',
        templateStyle: incomingDraft.templateStyle || 'torah-scroll',
        updatedAt: new Date().toISOString(),
      });
      setSubMode('editor');
      if (onClearIncomingDraft) onClearIncomingDraft();
    }
  }, [incomingDraft, onClearIncomingDraft]);

  const filteredStories = stories.filter((s) => {
    const matchesCat = storyCategory === 'All' || s.category === storyCategory;
    const q = storySearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.keyChapters.toLowerCase().includes(q) ||
      s.lifeSummary.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const activeStory =
    stories.find((s) => s.id === selectedStoryId) || filteredStories[0] || stories[0];

  const handleLookupBiblePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupName.trim()) return;
    setLookingUpPerson(true);
    setLookupError(null);
    try {
      const result = await safeFetchJson<BibleCharacterStory>('/api/bible/character-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personName: lookupName.trim() }),
      });
      if (!result.ok || !result.data?.name) {
        throw new Error(result.error || 'Could not retrieve story for that person.');
      }
      const story = result.data;
      setStories((prev) => [story, ...prev]);
      setSelectedStoryId(story.id);
      setStoryCategory('All');
      setLookupName('');
    } catch (err: any) {
      setLookupError(err?.message || 'Unable to generate Bible character biography right now.');
    } finally {
      setLookingUpPerson(false);
    }
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard.title.trim() || !editingCard.frontPrompt.trim() || !editingCard.backTruth.trim()) {
      return;
    }
    setSavingCard(true);
    setSaveFeedback(null);
    try {
      const payload: CustomBiblicalCard = {
        ...editingCard,
        cardId: editingCard.cardId || `card-${Date.now().toString(36)}`,
        updatedAt: new Date().toISOString(),
      };
      await onSaveCard(payload);
      setSaveFeedback('Saved! Your Biblical card is now live in the Flashcard deck.');
      setTimeout(() => setSaveFeedback(null), 3000);
    } finally {
      setSavingCard(false);
    }
  };

  const handleEditExistingCard = (card: CustomBiblicalCard) => {
    const isDefault = DEFAULT_BIBLICAL_CARDS.some((d) => d.cardId === card.cardId);
    setEditingCard({
      ...card,
      cardId: isDefault ? `card-${Date.now().toString(36)}` : card.cardId,
    });
    setSubMode('editor');
  };

  const handleCreateBlankTemplate = () => {
    setEditingCard({
      cardId: `card-${Date.now().toString(36)}`,
      title: 'New Biblical Study Card',
      reference: '',
      hebrewOrGreekTerm: '',
      frontPrompt: '',
      backTruth: '',
      historicalNote: '',
      templateStyle: 'classic-alabaster',
      updatedAt: new Date().toISOString(),
    });
    setSubMode('editor');
  };

  const handleCopyCard = () => {
    const text = `${editingCard.title} (${editingCard.reference})\nTerm: ${editingCard.hebrewOrGreekTerm}\nPrompt: ${editingCard.frontPrompt}\nTruth: ${editingCard.backTruth}\nHistorical Note: ${editingCard.historicalNote}`;
    navigator.clipboard.writeText(text);
    setCopiedCardText(true);
    setTimeout(() => setCopiedCardText(false), 2000);
  };

  const currentDeckCard = allCards[activeCardIndex % Math.max(1, allCards.length)] || allCards[0];
  const currentStyleMeta =
    TEMPLATE_STYLES.find((t) => t.id === editingCard.templateStyle) || TEMPLATE_STYLES[0];
  const deckStyleMeta =
    TEMPLATE_STYLES.find((t) => t.id === currentDeckCard?.templateStyle) || TEMPLATE_STYLES[0];

  return (
    <div className="space-y-6">
      {/* Top Banner & Segmented Switcher */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 p-6 sm:p-7 flex flex-col justify-between space-y-5">
          <div className="space-y-2">
            <div className="text-xs text-stone-500 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-emerald-800">Separated Biographies & Card Studio</span>
              <span aria-hidden="true">·</span>
              <span>Stories of Everyone in the Bible</span>
              <span aria-hidden="true">·</span>
              <span>Flashcards</span>
              <span aria-hidden="true">·</span>
              <span>Editable Template</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-editorial">
              Biblical Stories, Study Cards & Editable Templates
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed max-w-2xl">
              Explore separated life journeys of men and women across Scripture, study interactive Biblical flashcards, or design and save your own editable Scripture cards.
            </p>
          </div>

          {!hideInternalTabs && (
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 rounded-xl max-w-2xl">
              <button
                type="button"
                onClick={() => setSubMode('stories')}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  subMode === 'stories'
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Bible Stories ({stories.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setSubMode('cards')}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  subMode === 'cards'
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Cards & Flashcards ({allCards.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setSubMode('editor')}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  subMode === 'editor'
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editable Template</span>
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 relative min-h-[200px] bg-stone-900">
          <img
            src="/src/assets/images/biblical_stories_olive_1795368174277.jpg"
            alt="Olive trees overlooking ancient Jerusalem foothills at sunrise"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-5">
            <div className="text-xs text-amber-200 font-semibold">Hebrews 12:1</div>
            <p className="text-sm font-editorial italic text-white mt-0.5">
              "Therefore, since we are surrounded by such a great cloud of witnesses..."
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: SEPARATED BIBLE CHARACTER STORIES */}
      {subMode === 'stories' && (
        <div className="space-y-5">
          {/* Search Anyone in the Bible */}
          <form
            onSubmit={handleLookupBiblePerson}
            className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
          >
            <div className="flex items-center gap-2.5 flex-1">
              <Search className="w-4 h-4 text-emerald-800 shrink-0" />
              <input
                type="text"
                value={lookupName}
                onChange={(e) => setLookupName(e.target.value)}
                placeholder="Open full separated story of ANY person in the Bible (e.g. 'Hannah', 'Gideon', 'Elijah', 'Deborah', 'Barnabas', 'Lydia')..."
                className="w-full text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={lookingUpPerson || !lookupName.trim()}
              className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 shrink-0"
            >
              {lookingUpPerson ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span>Open Biblical Life Story</span>
            </button>
          </form>

          {lookupError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{lookupError}</span>
            </div>
          )}

          {/* Category Filter + Quick Search */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {(['All', ...STORY_CATEGORIES] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setStoryCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                    storyCategory === cat
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={storySearch}
              onChange={(e) => setStorySearch(e.target.value)}
              placeholder="Filter loaded stories..."
              className="border border-stone-200 bg-white rounded-xl px-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-stone-700"
            />
          </div>

          {/* 12-Col Master-Detail Story Reader */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <aside className="lg:col-span-4 space-y-2.5 max-h-[650px] overflow-y-auto pr-1">
              {filteredStories.map((person) => {
                const isActive = person.id === activeStory.id;
                return (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => setSelectedStoryId(person.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-colors space-y-1 ${
                      isActive
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-white text-stone-900 border-stone-200 hover:border-emerald-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span
                        className={`font-semibold ${
                          isActive ? 'text-amber-300' : 'text-emerald-800'
                        }`}
                      >
                        {person.category}
                      </span>
                      <span
                        className={`font-hebrew ${
                          isActive ? 'text-stone-300' : 'text-stone-500'
                        }`}
                      >
                        {person.hebrewOrGreekName}
                      </span>
                    </div>
                    <h4 className="text-base font-bold font-editorial">{person.name}</h4>
                    <div
                      className={`text-xs ${
                        isActive ? 'text-stone-300' : 'text-stone-500'
                      }`}
                    >
                      Meaning: {person.nameMeaning} · {person.keyChapters}
                    </div>
                  </button>
                );
              })}
            </aside>

            <article className="lg:col-span-8 bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-stone-100 pb-5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
                  <span>{activeStory.era}</span>
                  <span className="font-semibold text-emerald-800">
                    Chapters: {activeStory.keyChapters}
                  </span>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="text-2xl sm:text-3xl font-bold text-stone-900 font-editorial">
                    {activeStory.name}
                  </h3>
                  <span className="text-xl font-bold font-hebrew text-stone-700">
                    {activeStory.hebrewOrGreekName}
                  </span>
                </div>
                <p className="text-xs font-semibold text-amber-800">
                  Name Meaning: "{activeStory.nameMeaning}"
                </p>
                <p className="text-sm font-editorial italic text-stone-800 bg-[#FBF9F5] border border-stone-200 rounded-xl p-3.5 mt-2">
                  {activeStory.anchorVerse}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Full Life Journey</span>
                </h4>
                <p className="text-sm text-stone-800 leading-relaxed">{activeStory.lifeSummary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#FBF9F5] border border-stone-200 space-y-2">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Key Biblical Moments
                  </h4>
                  <ul className="space-y-1.5 text-xs text-stone-700">
                    {activeStory.keyTurningPoints.map((pt, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {idx + 1}. {pt}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                    Faith Lessons for Today
                  </h4>
                  <ul className="space-y-1.5 text-xs text-stone-800">
                    {activeStory.spiritualLessons.map((les, idx) => (
                      <li key={idx} className="leading-relaxed">
                        • {les}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-rose-50/60 border border-rose-200 space-y-1.5">
                <div className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                  How Their Story Points to Jesus Christ
                </div>
                <p className="text-xs sm:text-sm text-stone-800 leading-relaxed">
                  {activeStory.gospelConnection}
                </p>
              </div>
            </article>
          </div>
        </div>
      )}

      {/* SECTION 2: BIBLICAL CARDS & INTERACTIVE FLASHCARDS */}
      {subMode === 'cards' && currentDeckCard && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Active Flip Flashcard */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between text-xs text-stone-600">
                <span className="font-semibold">
                  Interactive Study Flashcard {activeCardIndex + 1} of {allCards.length}
                </span>
                <button
                  type="button"
                  onClick={handleCreateBlankTemplate}
                  className="text-rose-700 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create New Card</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsCardFlipped((f) => !f)}
                className={`w-full min-h-[280px] rounded-2xl border p-7 text-left flex flex-col justify-between transition-colors ${deckStyleMeta.containerClass}`}
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className={`font-bold ${deckStyleMeta.accentText}`}>
                    {currentDeckCard.reference || 'Scripture Card'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-stone-500 font-semibold">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{isCardFlipped ? 'Back (Answer)' : 'Front (Click to Flip)'}</span>
                  </span>
                </div>

                {!isCardFlipped ? (
                  <div className="py-4 space-y-3">
                    {currentDeckCard.hebrewOrGreekTerm && (
                      <div className="text-sm font-hebrew font-bold text-rose-800">
                        {currentDeckCard.hebrewOrGreekTerm}
                      </div>
                    )}
                    <h3 className="text-xl font-bold font-editorial text-stone-900">
                      {currentDeckCard.title}
                    </h3>
                    <p className="text-sm text-stone-700 leading-relaxed">
                      {currentDeckCard.frontPrompt}
                    </p>
                  </div>
                ) : (
                  <div className="py-4 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Biblical Answer & Verse Truth
                    </div>
                    <p className="text-base font-editorial text-stone-900 leading-relaxed">
                      {currentDeckCard.backTruth}
                    </p>
                    {currentDeckCard.historicalNote && (
                      <p className="text-xs text-stone-600 pt-2 border-t border-stone-200/80 leading-relaxed">
                        {currentDeckCard.historicalNote}
                      </p>
                    )}
                  </div>
                )}

                <div className="text-[11px] text-stone-500 flex items-center justify-between pt-2 border-t border-stone-200/60">
                  <span>Click card surface to flip</span>
                  <span>Template: {deckStyleMeta.label}</span>
                </div>
              </button>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCardIndex((i) => (i - 1 + allCards.length) % allCards.length);
                    setIsCardFlipped(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-800"
                >
                  Previous Card
                </button>
                <button
                  type="button"
                  onClick={() => handleEditExistingCard(currentDeckCard)}
                  className="px-4 py-2 rounded-xl border border-stone-300 bg-[#FBF9F5] hover:bg-stone-100 text-xs font-semibold text-stone-900 inline-flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit This Card in Template</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCardIndex((i) => (i + 1) % allCards.length);
                    setIsCardFlipped(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold"
                >
                  Next Card
                </button>
              </div>
            </div>

            {/* All Biblical Study Cards Grid */}
            <div className="lg:col-span-6 space-y-3">
              <h3 className="text-sm font-bold text-stone-900 font-editorial">
                All Saved Biblical Cards ({allCards.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {allCards.map((card, idx) => {
                  const isCustom = customCards.some((c) => c.cardId === card.cardId);
                  return (
                    <div
                      key={card.cardId}
                      className={`p-4 rounded-xl border bg-white flex flex-col justify-between gap-3 ${
                        idx === activeCardIndex % allCards.length
                          ? 'border-stone-900'
                          : 'border-stone-200'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setActiveCardIndex(idx);
                          setIsCardFlipped(false);
                        }}
                        className="text-left space-y-1"
                      >
                        <div className="text-[11px] font-semibold text-amber-800">
                          {card.reference}
                        </div>
                        <h4 className="text-sm font-bold font-editorial text-stone-900 line-clamp-1">
                          {card.title}
                        </h4>
                        <p className="text-xs text-stone-600 line-clamp-2">{card.frontPrompt}</p>
                      </button>

                      <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px]">
                        <button
                          type="button"
                          onClick={() => handleEditExistingCard(card)}
                          className="font-semibold text-stone-700 hover:text-stone-950 inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        {isCustom && (
                          <button
                            type="button"
                            onClick={() => onDeleteCard(card.cardId)}
                            className="text-rose-700 hover:underline inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: LIVE EDITABLE TEMPLATE STUDIO */}
      {subMode === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form Editor */}
          <form
            onSubmit={handleSaveTemplate}
            className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-6 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-stone-900 font-editorial">
                  Editable Biblical Card Template
                </h3>
                <p className="text-xs text-stone-500">
                  Customize any verse card, Hebrew root note, flashcard, or printable devotional card
                </p>
              </div>
              <button
                type="button"
                onClick={handleCreateBlankTemplate}
                className="px-3 py-1.5 rounded-lg border border-stone-200 bg-[#FBF9F5] hover:bg-stone-100 text-xs font-semibold text-stone-800 inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Blank Card</span>
              </button>
            </div>

            {saveFeedback && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
                {saveFeedback}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Card Title
                </label>
                <input
                  type="text"
                  required
                  maxLength={140}
                  value={editingCard.title}
                  onChange={(e) => setEditingCard({ ...editingCard, title: e.target.value })}
                  placeholder="e.g. Covenant Peace in Storm"
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Scripture Reference
                </label>
                <input
                  type="text"
                  maxLength={120}
                  value={editingCard.reference}
                  onChange={(e) => setEditingCard({ ...editingCard, reference: e.target.value })}
                  placeholder="e.g. Isaiah 26:3"
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Hebrew / Greek Word or Meaning
              </label>
              <input
                type="text"
                maxLength={160}
                value={editingCard.hebrewOrGreekTerm}
                onChange={(e) =>
                  setEditingCard({ ...editingCard, hebrewOrGreekTerm: e.target.value })
                }
                placeholder="e.g. שָׁלוֹם שָׁלוֹם (Shalom Shalom — Perfect Peace)"
                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm font-hebrew text-stone-900 focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Card Front (Question / Prompt / Key Theme)
              </label>
              <textarea
                rows={2}
                required
                maxLength={600}
                value={editingCard.frontPrompt}
                onChange={(e) => setEditingCard({ ...editingCard, frontPrompt: e.target.value })}
                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Card Back (Bible Verse / Gospel Truth)
              </label>
              <textarea
                rows={3}
                required
                maxLength={1500}
                value={editingCard.backTruth}
                onChange={(e) => setEditingCard({ ...editingCard, backTruth: e.target.value })}
                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Jewish Historical Background / Personal Prayer Note
              </label>
              <textarea
                rows={2}
                maxLength={1000}
                value={editingCard.historicalNote}
                onChange={(e) =>
                  setEditingCard({ ...editingCard, historicalNote: e.target.value })
                }
                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Card Paper & Border Theme
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TEMPLATE_STYLES.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setEditingCard({ ...editingCard, templateStyle: style.id })}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                      editingCard.templateStyle === style.id
                        ? 'border-stone-900 bg-stone-900 text-white'
                        : 'border-stone-200 bg-[#FBF9F5] text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={savingCard}
                className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                {savingCard ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Save Editable Card</span>
              </button>

              <button
                type="button"
                onClick={handleCopyCard}
                className="px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FBF9F5] hover:bg-stone-100 text-xs font-semibold text-stone-800 inline-flex items-center gap-1.5"
              >
                {copiedCardText ? (
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedCardText ? 'Copied Card Text' : 'Copy Text'}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FBF9F5] hover:bg-stone-100 text-xs font-semibold text-stone-800 inline-flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Card</span>
              </button>
            </div>
          </form>

          {/* Live Formatted Card Preview */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Live Editable Biblical Card Preview
            </div>

            <div className={`rounded-2xl border p-7 space-y-5 ${currentStyleMeta.containerClass}`}>
              <div className="flex items-center justify-between gap-2 border-b border-stone-200/70 pb-3 text-xs">
                <span className={`font-bold ${currentStyleMeta.accentText}`}>
                  MOED · Jesus Never Fail Ministries
                </span>
                <span className="font-semibold text-stone-600">
                  {editingCard.reference || 'Scripture Reference'}
                </span>
              </div>

              <div className="space-y-2">
                {editingCard.hebrewOrGreekTerm && (
                  <div className="text-base font-bold font-hebrew text-rose-800">
                    {editingCard.hebrewOrGreekTerm}
                  </div>
                )}
                <h4 className="text-2xl font-bold font-editorial text-stone-900">
                  {editingCard.title || 'Untitled Biblical Card'}
                </h4>
              </div>

              <div className="p-4 rounded-xl bg-white/80 border border-stone-200/80 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Front Meditation Prompt
                </div>
                <p className="text-sm text-stone-800 leading-relaxed">
                  {editingCard.frontPrompt || 'Enter a question or prompt on the left.'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Back Scripture Answer
                </div>
                <p className="text-base font-editorial text-stone-900 leading-relaxed">
                  {editingCard.backTruth || 'Enter the Scripture verse or core Gospel truth.'}
                </p>
              </div>

              {editingCard.historicalNote && (
                <div className="text-xs text-stone-700 leading-relaxed pt-2 border-t border-stone-200/70">
                  <span className="font-semibold text-stone-900">Historical & Prayer Note: </span>
                  {editingCard.historicalNote}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
