import React, { useState } from 'react';
import { CaseBasedQuestion } from '../types';
import {
  FileText,
  Check,
  Award,
  BookOpen,
  Eye,
  EyeOff,
  Youtube,
  ExternalLink,
} from 'lucide-react';
import { buildChannelVideoSearchUrl } from '../data/gospelData';

interface CaseBasedExplorerProps {
  questions?: CaseBasedQuestion[];
  topicTitle: string;
  bookReference?: string;
}

export const CaseBasedExplorer: React.FC<CaseBasedExplorerProps> = ({
  questions = [],
  topicTitle,
  bookReference,
}) => {
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<string, string>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  if (!questions || questions.length === 0) {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center text-stone-500">
        <FileText className="w-12 h-12 mx-auto text-stone-300 mb-3" />
        <h3 className="text-lg font-semibold text-stone-800 font-editorial">
          No Biblical Case Studies for This Topic
        </h3>
        <p className="text-sm mt-1 max-w-md mx-auto">
          Select another Gospel topic or generate a Parable Case Study in the Gospel Study Builder.
        </p>
      </div>
    );
  }

  const currentCase = questions[selectedCaseIdx] || questions[0];

  const toggleSolution = (subQId: string) => {
    setRevealedSolutions((prev) => ({
      ...prev,
      [subQId]: !prev[subQId],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1 flex-wrap">
            <span className="font-semibold text-amber-800">Biblical Narrative & Parable Study</span>
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
              Watch Related Sermon
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <h2 className="text-xl font-bold text-stone-900 font-editorial">
            Biblical Parable & Life Application Case Study
          </h2>
          <p className="text-sm text-stone-500 mt-0.5">
            Read the Gospel account or testimony scenario carefully and reflect on how Jesus responds in grace and power.
          </p>
        </div>

        {questions.length > 1 && (
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
            {questions.map((c, idx) => (
              <button
                key={c.id}
                onClick={() => setSelectedCaseIdx(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedCaseIdx === idx
                    ? 'bg-white text-stone-900'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Study {idx + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Case Passage */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="border-b border-stone-100 pb-4">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
            Scripture Case Account
          </div>
          <h3 className="text-lg font-bold text-stone-900 font-editorial">
            {currentCase.title}
          </h3>
        </div>

        <div className="bg-[#FBF9F5] border border-stone-200 rounded-xl p-5 text-stone-800 text-sm sm:text-base leading-relaxed">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 mb-2">
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            <span>Biblical Account & Real-Life Situation:</span>
          </div>
          <p className="whitespace-pre-line text-stone-800">{currentCase.casePassage}</p>
          {currentCase.scenarioContext && (
            <div className="mt-3 pt-3 border-t border-stone-200 text-xs text-stone-500 italic">
              Heart Focus: {currentCase.scenarioContext}
            </div>
          )}
        </div>

        {/* Sub-questions */}
        <div className="space-y-5 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold uppercase tracking-wider text-stone-700">
              Reflection Questions ({currentCase.subQuestions.length})
            </h4>
            <span className="text-xs text-stone-500 font-medium tabular-nums">
              {currentCase.subQuestions.reduce((acc, q) => acc + q.marks, 0)} Reflection Points
            </span>
          </div>

          {currentCase.subQuestions.map((subQ, idx) => {
            const isRevealed = revealedSolutions[subQ.id];
            const draftText = reflectionAnswers[subQ.id] || '';

            return (
              <div
                key={subQ.id}
                className="bg-white border border-stone-200 rounded-xl p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                      Q{idx + 1}
                    </span>
                    <p className="text-sm sm:text-base font-semibold text-stone-900 leading-snug">
                      {subQ.question}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-stone-500 shrink-0 tabular-nums">
                    {subQ.marks} {subQ.marks === 1 ? 'Pt' : 'Pts'}
                  </span>
                </div>

                <textarea
                  value={draftText}
                  onChange={(e) =>
                    setReflectionAnswers((prev) => ({ ...prev, [subQ.id]: e.target.value }))
                  }
                  placeholder="Write your Scripture insight or prayer reflection here..."
                  rows={2}
                  className="w-full text-xs sm:text-sm p-3 rounded-lg border border-stone-200 focus:outline-none focus:border-amber-700 bg-[#FBF9F5] resize-y"
                />

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => toggleSolution(subQ.id)}
                    className="text-xs font-semibold text-amber-800 hover:underline flex items-center gap-1.5 transition"
                  >
                    {isRevealed ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" /> Hide Biblical Insight
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" /> View Scripture-Centered Insight
                      </>
                    )}
                  </button>
                  {draftText.trim().length > 0 && (
                    <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Reflection Saved
                    </span>
                  )}
                </div>

                {isRevealed && (
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-2 text-xs sm:text-sm">
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-700" />
                      Gospel Reflection Insight:
                    </div>
                    <div className="text-stone-800 leading-relaxed whitespace-pre-line">
                      {subQ.modelAnswer}
                    </div>
                    {subQ.explanation && (
                      <div className="text-stone-600 pt-1 text-xs">
                        <span className="font-semibold text-stone-700">Life Application: </span>
                        {subQ.explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
