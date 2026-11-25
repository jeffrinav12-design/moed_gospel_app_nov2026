import React, { useState } from 'react';
import { Volume2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { HebrewGreekLetter } from '../types';
import { GREEK_ALPHABET } from '../data/languagesAndHistoryData';

interface GreekLearningPageProps {
  onOpenBibleReader?: () => void;
  onOpenHebrewAcademy?: () => void;
  onOpenRabbiStudies?: () => void;
}

export const GreekLearningPage: React.FC<GreekLearningPageProps> = ({
  onOpenBibleReader,
  onOpenHebrewAcademy,
  onOpenRabbiStudies,
}) => {
  const [selectedGreek, setSelectedGreek] = useState<HebrewGreekLetter>(GREEK_ALPHABET[0]);
  const [quizHideNames, setQuizHideNames] = useState<boolean>(false);

  const speakLetter = (letter: HebrewGreekLetter) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(
      `${letter.name}. New Testament word: ${letter.biblicalWordTranslit}.`
    );
    utter.rate = 0.88;
    window.speechSynthesis.speak(utter);
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5">
          <div className="space-y-2.5">
            <div className="text-xs text-stone-500 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-indigo-900">Koine Greek New Testament Academy</span>
              <span aria-hidden="true">·</span>
              <span>24 Sacred Greek Letters</span>
              <span aria-hidden="true">·</span>
              <span>Gospels & Apostolic Epistles</span>
            </div>
            <h1 className="text-2xl sm:text-3xl xl:text-4xl font-bold text-stone-900 font-editorial">
              Learn New Testament Koine Greek Letters & Words
            </h1>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-2xl">
              Study uppercase and lowercase Greek forms from Alpha (Α α) to Omega (Ω ω), manuscript pronunciations, Isopsephy numbers, and foundational New Testament Gospel terms.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {onOpenBibleReader && (
              <button
                type="button"
                onClick={onOpenBibleReader}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Open Holy Bible</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {onOpenHebrewAcademy && (
              <button
                type="button"
                onClick={onOpenHebrewAcademy}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-stone-200 bg-[#FBF9F5] hover:bg-stone-100 text-stone-800 text-xs font-semibold transition-colors"
              >
                Hebrew Letters Academy
              </button>
            )}
            {onOpenRabbiStudies && (
              <button
                type="button"
                onClick={onOpenRabbiStudies}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-stone-200 bg-[#FBF9F5] hover:bg-stone-100 text-stone-800 text-xs font-semibold transition-colors"
              >
                Next: Rabbi Historical Studies
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 relative min-h-[210px] bg-stone-900">
          <img
            src="/src/assets/images/hebrew_scroll_heritage_1795368174259.jpg"
            alt="Ancient Biblical manuscript scroll lit warmly"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-6">
            <div className="text-indigo-200 text-xl font-greek font-semibold">
              Ἐγώ εἰμι τὸ Ἄλφα καὶ τὸ Ὦ
            </div>
            <p className="text-xs text-stone-200 mt-1">
              "I am the Alpha and the Omega, the First and the Last." — Revelation 22:13
            </p>
          </div>
        </div>
      </div>

      {/* 24 Letters Chart + Study Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3.5">
            <div>
              <h2 className="text-lg font-bold text-stone-900 font-editorial">
                Koine Greek Alphabet (Α α — Ω ω)
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Tap any Greek letter to explore its sound, origin, and New Testament Gospel term
              </p>
            </div>
            <button
              type="button"
              onClick={() => setQuizHideNames((q) => !q)}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors inline-flex items-center gap-1.5 ${
                quizHideNames
                  ? 'bg-indigo-900 text-white border-indigo-900'
                  : 'bg-[#FBF9F5] text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {quizHideNames ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{quizHideNames ? 'Reveal Names' : 'Practice Mode (Hide Names)'}</span>
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
                  className={`min-h-[82px] p-3 rounded-xl border text-center transition-colors flex flex-col items-center justify-center gap-1 ${
                    isSelected
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-[#FBF9F5] text-stone-900 border-stone-200 hover:border-indigo-700'
                  }`}
                >
                  <div className="flex items-baseline gap-1.5 font-greek">
                    <span className="text-2xl font-semibold leading-none">{letter.glyph}</span>
                    <span
                      className={`text-lg ${isSelected ? 'text-amber-200' : 'text-stone-500'}`}
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

        <aside className="lg:col-span-5 bg-white border border-stone-200 rounded-2xl p-6 space-y-5">
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
                <h3 className="text-2xl font-bold text-stone-900 font-editorial">
                  {selectedGreek.name}
                </h3>
                <p className="text-xs text-indigo-900 font-semibold mt-0.5">
                  Sound: {selectedGreek.pronunciation}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => speakLetter(selectedGreek)}
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white shrink-0 flex items-center justify-center"
              title="Pronounce Greek letter and word"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-[#FBF9F5] border border-stone-200">
              <div className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
                Origin & Manuscript Form
              </div>
              <p className="text-stone-700 mt-1 leading-relaxed">
                {selectedGreek.pictographOrOrigin}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200">
              <div className="font-bold text-indigo-950 uppercase tracking-wider text-[11px]">
                Gospel & New Testament Resonance
              </div>
              <p className="text-stone-800 mt-1 leading-relaxed">
                {selectedGreek.spiritualMeaning}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
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
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {selectedGreek.biblicalWordMeaning}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
