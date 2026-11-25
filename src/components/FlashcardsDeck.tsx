import React, { useState } from 'react';
import {
  RotateCw,
  CheckCircle2,
  Volume2,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Youtube,
  ExternalLink,
} from 'lucide-react';
import { FlashcardItem } from '../types';
import { buildChannelVideoSearchUrl } from '../data/gospelData';

interface FlashcardsDeckProps {
  flashcards: FlashcardItem[];
  topicTitle: string;
}

export const FlashcardsDeck: React.FC<FlashcardsDeckProps> = ({ flashcards, topicTitle }) => {
  const [deck, setDeck] = useState<FlashcardItem[]>(flashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [reviewIds, setReviewIds] = useState<Set<string>>(new Set());

  React.useEffect(() => {
    setDeck(flashcards);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [flashcards]);

  const currentCard = deck[currentIndex];

  const handleFlip = () => setIsFlipped(!isFlipped);
  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % deck.length);
  };
  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length);
  };
  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
  };

  const toggleMastered = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        setReviewIds((r) => {
          const nr = new Set(r);
          nr.delete(id);
          return nr;
        });
      }
      return next;
    });
  };

  const toggleReview = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setReviewIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        setMasteredIds((m) => {
          const nm = new Set(m);
          nm.delete(id);
          return nm;
        });
      }
      return next;
    });
  };

  const handleSpeak = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!currentCard) {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center text-stone-500">
        No Scripture memory cards in this Gospel module.
      </div>
    );
  }

  const isCurrentMastered = masteredIds.has(currentCard.id);
  const isCurrentReview = reviewIds.has(currentCard.id);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Top Deck Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white border border-stone-200 rounded-2xl p-3.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-stone-900 font-display tabular-nums">
            Verse Card {currentIndex + 1} of {deck.length}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-semibold text-amber-800">{currentCard.category}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[11px] tabular-nums">
            <span className="text-emerald-700 font-semibold">{masteredIds.size} Memorized</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-700 font-semibold">{reviewIds.size} Meditating</span>
          </div>

          <button
            onClick={handleShuffle}
            className="flex items-center gap-1 text-stone-600 hover:text-stone-900 p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
            title="Shuffle Memory Cards"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Shuffle</span>
          </button>

          <a
            href={buildChannelVideoSearchUrl(topicTitle)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-rose-700 hover:underline font-semibold"
          >
            <Youtube className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Channel</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* 3D Flip Card */}
      <div
        onClick={handleFlip}
        className="relative h-80 sm:h-96 w-full cursor-pointer perspective-1000 select-none"
      >
        <div
          className={`w-full h-full duration-500 transform-style-3d relative rounded-2xl transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front Face */}
          <div className="absolute inset-0 backface-hidden bg-white border border-stone-200 hover:border-amber-700/60 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all">
            <div className="flex items-center justify-between text-xs">
              <span className="uppercase font-bold tracking-wider text-amber-800">
                Memory Verse Prompt · {currentCard.category}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleSpeak(currentCard.front, e)}
                  className="p-1.5 text-stone-500 hover:text-amber-800 rounded-lg bg-stone-100 hover:bg-stone-200 transition-colors"
                  title="Listen"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <div className="text-stone-400 flex items-center gap-1">
                  <RotateCw className="w-3 h-3" />
                  <span>Flip</span>
                </div>
              </div>
            </div>

            <div className="my-auto text-center px-4">
              <p className="text-lg sm:text-2xl font-bold text-stone-900 leading-relaxed font-editorial">
                {currentCard.front}
              </p>
              {currentCard.hint && (
                <p className="text-xs text-amber-900 mt-4 italic bg-[#FBF9F5] border border-stone-200 p-2.5 rounded-xl inline-block">
                  Scripture Clue: {currentCard.hint}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-stone-500 pt-3 border-t border-stone-100">
              <span className="truncate">{topicTitle}</span>
              <span className="text-amber-800 font-semibold shrink-0 ml-2">Tap to reveal Scripture</span>
            </div>
          </div>

          {/* Back Face */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#FBF9F5] border-2 border-emerald-600/60 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs">
              <span className="uppercase font-bold tracking-wider text-emerald-800">
                Scripture Truth & Promise
              </span>
              <button
                onClick={(e) => handleSpeak(currentCard.back, e)}
                className="p-1.5 text-stone-500 hover:text-emerald-800 rounded-lg bg-white border border-stone-200 transition-colors"
                title="Listen to Scripture"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="my-auto text-center px-4">
              <p className="text-base sm:text-xl font-medium text-stone-900 leading-relaxed whitespace-pre-line font-editorial">
                {currentCard.back}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3 border-t border-stone-200">
              <button
                onClick={(e) => toggleReview(currentCard.id, e)}
                className={`text-xs px-3.5 py-1.5 rounded-xl border transition-all ${
                  isCurrentReview
                    ? 'bg-amber-700 border-amber-700 text-white font-bold'
                    : 'bg-white border-stone-200 text-stone-700 hover:border-amber-500'
                }`}
              >
                Meditate Again
              </button>

              <button
                onClick={(e) => toggleMastered(currentCard.id, e)}
                className={`text-xs px-3.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                  isCurrentMastered
                    ? 'bg-emerald-700 border-emerald-700 text-white font-bold'
                    : 'bg-white border-stone-200 text-stone-700 hover:border-emerald-500'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Hidden in Heart</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3 font-display">
        <button
          onClick={handlePrev}
          className="flex-1 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Verse</span>
        </button>

        <button
          onClick={handleFlip}
          className="bg-stone-900 hover:bg-stone-800 text-white px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Flip Card</span>
        </button>

        <button
          onClick={handleNext}
          className="flex-1 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold transition-colors"
        >
          <span>Next Verse</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
