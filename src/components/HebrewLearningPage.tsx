import React, { useState } from 'react';
import { Volume2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { HebrewGreekLetter } from '../types';
import { HEBREW_ALPHABET } from '../data/languagesAndHistoryData';

interface HebrewLearningPageProps {
  onOpenBibleReader?: () => void;
  onOpenGreekAcademy?: () => void;
  onOpenRabbiStudies?: () => void;
}

export const HebrewLearningPage: React.FC<HebrewLearningPageProps> = ({
  onOpenBibleReader,
  onOpenGreekAcademy,
  onOpenRabbiStudies,
}) => {
  const [selectedHebrew, setSelectedHebrew] = useState<HebrewGreekLetter>(HEBREW_ALPHABET[0]);
  const [quizHideNames, setQuizHideNames] = useState<boolean>(false);

  const speakLetter = (letter: HebrewGreekLetter) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(
      `${letter.name}. Biblical word: ${letter.biblicalWordTranslit}.`
    );
    utter.rate = 0.88;
    window.speechSynthesis.speak(utter);
  };

  return (
    <div className="space-y-6">
      {/* Archival Scroll Editorial Header */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5">
          <div className="space-y-2.5">
            <div className="text-xs text-stone-500 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-amber-800">Hebrew Language Academy</span>
              <span aria-hidden="true">·</span>
              <span>22 Sacred Aleph-Bet Letters</span>
              <span aria-hidden="true">·</span>
              <span>Old Testament Covenant Roots</span>
            </div>
            <h1 className="text-2xl sm:text-3xl xl:text-4xl font-bold text-stone-900 font-editorial">
              Learn Biblical Hebrew Letters & Root Meanings
            </h1>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-2xl">
              Master all 22 letters of the Hebrew Aleph-Bet from Aleph (א) to Tav (ת), including final sofit forms, ancient pictographs, Gematria values, and living Old Testament words.
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
            {onOpenGreekAcademy && (
              <button
                type="button"
                onClick={onOpenGreekAcademy}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-stone-200 bg-[#FBF9F5] hover:bg-stone-100 text-stone-800 text-xs font-semibold transition-colors"
              >
                Next: Greek Letters Academy
              </button>
            )}
            {onOpenRabbiStudies && (
              <button
                type="button"
                onClick={onOpenRabbiStudies}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-stone-200 bg-[#FBF9F5] hover:bg-stone-100 text-stone-800 text-xs font-semibold transition-colors"
              >
                Rabbi Historical Studies
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 relative min-h-[210px] bg-stone-900">
          <img
            src="/src/assets/images/hebrew_scroll_heritage_1795368174259.jpg"
            alt="Ancient parchment Torah scroll lit warmly"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6">
            <div className="text-amber-200 text-lg font-hebrew font-bold" dir="rtl">
              דְּבַר־אֱלֹהֵינוּ יָקוּם לְעוֹלָם
            </div>
            <p className="text-xs text-stone-200 mt-1">
              "The word of our God stands forever." — Isaiah 40:8
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Chart + Detailed Study Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3.5">
            <div>
              <h2 className="text-lg font-bold text-stone-900 font-editorial">
                Interactive Hebrew Aleph-Bet (Right-to-Left Heritage)
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Tap any letter to inspect its sound, pictograph, and Scripture vocabulary
              </p>
            </div>
            <button
              type="button"
              onClick={() => setQuizHideNames((q) => !q)}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors inline-flex items-center gap-1.5 ${
                quizHideNames
                  ? 'bg-amber-800 text-white border-amber-800'
                  : 'bg-[#FBF9F5] text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {quizHideNames ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{quizHideNames ? 'Reveal Names' : 'Practice Mode (Hide Names)'}</span>
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
                  className={`min-h-[82px] p-3 rounded-xl border text-center transition-colors flex flex-col items-center justify-center gap-1 ${
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

        <aside className="lg:col-span-5 bg-white border border-stone-200 rounded-2xl p-6 space-y-5">
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
                <h3 className="text-2xl font-bold text-stone-900 font-editorial">
                  {selectedHebrew.name}
                </h3>
                <p className="text-xs text-amber-800 font-semibold mt-0.5">
                  Sound: {selectedHebrew.pronunciation}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => speakLetter(selectedHebrew)}
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white shrink-0 flex items-center justify-center"
              title="Pronounce letter and word"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-[#FBF9F5] border border-stone-200">
              <div className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
                Ancient Pictograph & Heritage
              </div>
              <p className="text-stone-700 mt-1 leading-relaxed">
                {selectedHebrew.pictographOrOrigin}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
              <div className="font-bold text-amber-950 uppercase tracking-wider text-[11px]">
                Spiritual & Biblical Teaching
              </div>
              <p className="text-stone-800 mt-1 leading-relaxed">
                {selectedHebrew.spiritualMeaning}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
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
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {selectedHebrew.biblicalWordMeaning}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
