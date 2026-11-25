import React, { useState } from 'react';
import { ShortAnswerQuestion, LongAnswerQuestion } from '../types';
import {
  FileEdit,
  Award,
  Eye,
  EyeOff,
  ListOrdered,
  Sparkles,
  Youtube,
  ExternalLink,
} from 'lucide-react';
import { buildChannelVideoSearchUrl } from '../data/gospelData';

interface ShortLongAnswerDeskProps {
  shortAnswers?: ShortAnswerQuestion[];
  longAnswers?: LongAnswerQuestion[];
  topicTitle: string;
  bookReference?: string;
}

export const ShortLongAnswerDesk: React.FC<ShortLongAnswerDeskProps> = ({
  shortAnswers = [],
  longAnswers = [],
  topicTitle,
  bookReference,
}) => {
  const [activeCategory, setActiveCategory] = useState<'short' | 'long'>('short');
  const [selectedShortIdx, setSelectedShortIdx] = useState(0);
  const [selectedLongIdx, setSelectedLongIdx] = useState(0);

  const [believerDrafts, setBelieverDrafts] = useState<Record<string, string>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

  const toggleReveal = (id: string) => {
    setRevealedAnswers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDraftChange = (id: string, text: string) => {
    setBelieverDrafts((prev) => ({
      ...prev,
      [id]: text,
    }));
  };

  const hasShort = shortAnswers.length > 0;
  const hasLong = longAnswers.length > 0;

  if (!hasShort && !hasLong) {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center text-stone-500">
        <FileEdit className="w-12 h-12 mx-auto text-stone-300 mb-3" />
        <h3 className="text-lg font-semibold text-stone-800 font-editorial">
          No Scripture Reflections Yet
        </h3>
        <p className="text-sm mt-1 max-w-md mx-auto">
          Select another Gospel topic or generate reflection questions in the Gospel Study Builder.
        </p>
      </div>
    );
  }

  const currentShort = hasShort ? shortAnswers[selectedShortIdx] || shortAnswers[0] : null;
  const currentLong = hasLong ? longAnswers[selectedLongIdx] || longAnswers[0] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1 flex-wrap">
            <span className="font-semibold text-amber-800">Scripture Meditation & Written Reflections</span>
            {bookReference && (
              <>
                <span aria-hidden="true">·</span>
                <span>{bookReference}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <a
              href={buildChannelVideoSearchUrl(topicTitle)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-700 hover:underline font-medium inline-flex items-center gap-1"
            >
              <Youtube className="w-3.5 h-3.5" />
              Watch Teaching on Channel
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <h2 className="text-xl font-bold text-stone-900 font-editorial">
            Short & Deep Gospel Reflections
          </h2>
          <p className="text-sm text-stone-500 mt-0.5">
            Respond thoughtfully to concise biblical questions and deep sermon-style Scripture reflections.
          </p>
        </div>

        {/* Category Switcher */}
        <div className="flex items-center bg-stone-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveCategory('short')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeCategory === 'short'
                ? 'bg-white text-stone-900'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>Short Reflections</span>
            <span className="text-[11px] text-stone-500 tabular-nums">({shortAnswers.length})</span>
          </button>
          <button
            onClick={() => setActiveCategory('long')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeCategory === 'long'
                ? 'bg-white text-stone-900'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>Deep Reflections</span>
            <span className="text-[11px] text-stone-500 tabular-nums">({longAnswers.length})</span>
          </button>
        </div>
      </div>

      {/* SHORT REFLECTION VIEW */}
      {activeCategory === 'short' && currentShort && (
        <div className="space-y-5">
          {shortAnswers.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              {shortAnswers.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setSelectedShortIdx(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border tabular-nums ${
                    selectedShortIdx === idx
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  Reflection {idx + 1}
                </button>
              ))}
            </div>
          )}

          <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block mb-1">
                  Short Scripture Reflection
                </span>
                <h3 className="text-base sm:text-lg font-bold text-stone-900 whitespace-pre-line leading-relaxed font-editorial">
                  {currentShort.question}
                </h3>
              </div>
              <span className="text-xs font-semibold text-stone-500 shrink-0 tabular-nums">
                {currentShort.marks} Key Points
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-600">
                <span>Your Devotional Response:</span>
                <span className="text-stone-400 font-normal tabular-nums">
                  {(believerDrafts[currentShort.id] || '').trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                value={believerDrafts[currentShort.id] || ''}
                onChange={(e) => handleDraftChange(currentShort.id, e.target.value)}
                placeholder="Write your Scripture reflection here..."
                rows={5}
                className="w-full text-sm p-4 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-700 bg-[#FBF9F5] resize-y"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => toggleReveal(currentShort.id)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center gap-2 transition"
              >
                {revealedAnswers[currentShort.id] ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" /> Hide Biblical Guide
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-amber-700" /> Reveal Scripture Model Insight
                  </>
                )}
              </button>

              <span className="text-xs text-stone-400">Aim for 2–4 concise, Christ-centered sentences</span>
            </div>

            {revealedAnswers[currentShort.id] && (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 sm:p-6 space-y-4 text-sm">
                <div>
                  <h4 className="font-bold text-emerald-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-700" /> Biblical Model Insight:
                  </h4>
                  <div className="text-stone-900 leading-relaxed whitespace-pre-line bg-white p-4 rounded-lg border border-emerald-200">
                    {currentShort.modelAnswer}
                  </div>
                </div>

                {currentShort.markingScheme && currentShort.markingScheme.length > 0 && (
                  <div className="pt-3 border-t border-emerald-200/80">
                    <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ListOrdered className="w-3.5 h-3.5 text-emerald-700" /> Core Gospel Themes:
                    </div>
                    <div className="space-y-1.5">
                      {currentShort.markingScheme.map((step, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-center justify-between text-xs bg-white p-2.5 rounded-lg border border-emerald-200"
                        >
                          <span className="text-stone-800 font-medium">{step.step}</span>
                          <span className="font-code font-bold text-emerald-800 shrink-0 ml-2 tabular-nums">
                            +{step.marksAllocated} {step.marksAllocated === 1 ? 'Pt' : 'Pts'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DEEP REFLECTION VIEW */}
      {activeCategory === 'long' && currentLong && (
        <div className="space-y-5">
          {longAnswers.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              {longAnswers.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setSelectedLongIdx(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border tabular-nums ${
                    selectedLongIdx === idx
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  Deep Study {idx + 1}
                </button>
              ))}
            </div>
          )}

          <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block mb-1">
                  Deep Gospel Reflection
                </span>
                <h3 className="text-base sm:text-lg font-bold text-stone-900 whitespace-pre-line leading-relaxed font-editorial">
                  {currentLong.question}
                </h3>
              </div>
              <span className="text-xs font-semibold text-stone-500 shrink-0 tabular-nums">
                {currentLong.marks} Pillars
              </span>
            </div>

            {currentLong.structuralGuideline && (
              <div className="bg-[#FBF9F5] border border-stone-200 rounded-xl p-3.5 text-xs text-stone-700 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-stone-900">Study Structure: </span>
                  {currentLong.structuralGuideline}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-600">
                <span>Your In-Depth Scripture Reflection:</span>
                <span className="text-stone-400 font-normal tabular-nums">
                  {(believerDrafts[currentLong.id] || '').trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                value={believerDrafts[currentLong.id] || ''}
                onChange={(e) => handleDraftChange(currentLong.id, e.target.value)}
                placeholder="Outline your biblical reflection with anchor verses, Christ-centered meaning, and daily application..."
                rows={8}
                className="w-full text-sm p-4 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-700 bg-[#FBF9F5] resize-y"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => toggleReveal(currentLong.id)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center gap-2 transition"
              >
                {revealedAnswers[currentLong.id] ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" /> Hide Sermon Insight
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-amber-700" /> Reveal Full Gospel Reflection Guide
                  </>
                )}
              </button>

              <span className="text-xs text-stone-400">Aim for 100–150 words</span>
            </div>

            {revealedAnswers[currentLong.id] && (
              <div className="bg-amber-50/40 border border-amber-200 rounded-xl p-5 sm:p-6 space-y-5 text-sm">
                <div>
                  <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-700" /> Full Gospel Study Guide:
                  </h4>
                  <div className="text-stone-900 leading-relaxed whitespace-pre-line bg-white p-4 rounded-lg border border-amber-200">
                    {currentLong.modelAnswer}
                  </div>
                </div>

                {currentLong.rubricBreakdown && (
                  <div className="pt-3 border-t border-amber-200/80">
                    <div className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ListOrdered className="w-3.5 h-3.5 text-amber-700" /> Reflection Pillars:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentLong.rubricBreakdown.map((r, rIdx) => (
                        <div
                          key={rIdx}
                          className="flex items-center justify-between text-xs bg-white p-3 rounded-lg border border-amber-200"
                        >
                          <span className="text-stone-800 font-medium">{r.criterion}</span>
                          <span className="font-code font-bold text-amber-800 shrink-0 ml-2 tabular-nums">
                            {r.marks} {r.marks === 1 ? 'Pt' : 'Pts'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
