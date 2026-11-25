import React, { useState } from 'react';
import { GiveReasonQuestion } from '../types';
import {
  Lightbulb,
  CheckCircle2,
  Award,
  Eye,
  EyeOff,
  Sparkles,
  Youtube,
  ExternalLink,
} from 'lucide-react';
import { buildChannelVideoSearchUrl } from '../data/gospelData';

interface GiveReasonDeskProps {
  questions?: GiveReasonQuestion[];
  topicTitle: string;
  bookReference?: string;
}

export const GiveReasonDesk: React.FC<GiveReasonDeskProps> = ({
  questions = [],
  topicTitle,
  bookReference,
}) => {
  const [believerNotes, setBelieverNotes] = useState<Record<string, string>>({});
  const [revealedReasons, setRevealedReasons] = useState<Record<string, boolean>>({});

  if (!questions || questions.length === 0) {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center text-stone-500">
        <Lightbulb className="w-12 h-12 mx-auto text-stone-300 mb-3" />
        <h3 className="text-lg font-semibold text-stone-800 font-editorial">
          No Biblical Reason Questions Available
        </h3>
        <p className="text-sm mt-1 max-w-md mx-auto">
          Select another Gospel topic or generate Biblical Reason apologetics in the Gospel Study Builder.
        </p>
      </div>
    );
  }

  const toggleReveal = (id: string) => {
    setRevealedReasons((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1 flex-wrap">
            <span className="font-semibold text-amber-800">Biblical Apologetics & Give Reason</span>
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
            Give Biblical Reason — Knowing Why We Believe
          </h2>
          <p className="text-sm text-stone-500 mt-0.5">
            Be always ready to give a gentle, Scripture-anchored reason for the hope we have in Christ Jesus (1 Peter 3:15).
          </p>
        </div>

        <div className="text-xs bg-[#FBF9F5] border border-stone-200 rounded-xl px-4 py-2 text-stone-600 tabular-nums shrink-0">
          <span className="font-semibold text-stone-900">{questions.length} Prompts</span> in this topic
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((item, index) => {
          const isRevealed = revealedReasons[item.id];
          const userText = believerNotes[item.id] || '';
          const matchedKeywords = item.scientificKeywordFocus.filter((kw) =>
            userText.toLowerCase().includes(kw.toLowerCase())
          );

          return (
            <div
              key={item.id}
              className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                    #{index + 1}
                  </span>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block mb-1">
                      Give Biblical Reason:
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-snug font-editorial">
                      "{item.statement}"
                    </h3>
                  </div>
                </div>

                <span className="text-xs font-semibold text-stone-500 shrink-0 tabular-nums">
                  {item.marks} Reflection Pts
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-stone-600 flex items-center justify-between">
                  <span>Your Scriptural Reason & Testimony:</span>
                  <span className="text-stone-400 font-normal tabular-nums">
                    {userText.trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                </label>
                <textarea
                  value={userText}
                  onChange={(e) =>
                    setBelieverNotes((prev) => ({ ...prev, [item.id]: e.target.value }))
                  }
                  placeholder="Write your Scripture-backed explanation before comparing with the study guide..."
                  rows={3}
                  className="w-full text-sm p-3.5 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-700 bg-[#FBF9F5] resize-y"
                />
              </div>

              {userText.trim().length > 0 && (
                <div className="bg-[#FBF9F5] border border-stone-200 rounded-xl p-3 text-xs space-y-1.5">
                  <div className="font-semibold text-stone-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    Biblical Themes Included:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.scientificKeywordFocus.map((kw, kIdx) => {
                      const matched = matchedKeywords.includes(kw);
                      return (
                        <span
                          key={kIdx}
                          className={`px-2 py-0.5 rounded-md text-xs font-medium border flex items-center gap-1 ${
                            matched
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                              : 'bg-white text-stone-500 border-stone-200 opacity-65'
                          }`}
                        >
                          {matched && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                          {kw}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                <button
                  onClick={() => toggleReveal(item.id)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center gap-2 transition"
                >
                  {isRevealed ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-stone-500" /> Hide Biblical Answer
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-amber-700" /> Reveal Scriptural Reason & Verses
                    </>
                  )}
                </button>

                <div className="text-xs text-stone-500 tabular-nums">
                  {item.scientificKeywordFocus.length} core Gospel truths
                </div>
              </div>

              {isRevealed && (
                <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-5 space-y-4 text-sm">
                  <div>
                    <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-700" /> Scriptural Key Points:
                    </h4>
                    <ul className="space-y-1.5 pl-4 list-disc text-stone-800 marker:text-amber-700">
                      {item.reasonPoints.map((pt, pIdx) => (
                        <li key={pIdx} className="leading-relaxed">
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-amber-200/60">
                    <div className="text-xs font-bold text-amber-900 mb-1">
                      Complete Gospel Summary:
                    </div>
                    <div className="text-stone-900 font-editorial italic bg-white p-3.5 rounded-lg border border-amber-200 text-sm leading-relaxed">
                      "{item.modelAnswer}"
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
