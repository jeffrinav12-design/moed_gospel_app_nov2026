import React, { useState } from 'react';
import { AssertionReasonQuestion } from '../types';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Lightbulb,
  Award,
  Youtube,
  ExternalLink,
} from 'lucide-react';
import { buildChannelVideoSearchUrl } from '../data/gospelData';

interface AssertionReasonLabProps {
  questions?: AssertionReasonQuestion[];
  topicTitle: string;
  bookReference?: string;
}

const AR_OPTIONS: { id: 'A' | 'B' | 'C' | 'D'; label: string; description: string }[] = [
  {
    id: 'A',
    label: '(A) Both Assertion (A) and Reason (R) are biblically true, and (R) rightly explains (A).',
    description:
      'Both statements reflect sound Scripture, and Reason (R) provides the spiritual or biblical ground for Assertion (A).',
  },
  {
    id: 'B',
    label: '(B) Both Assertion (A) and Reason (R) are true, but (R) does NOT explain (A).',
    description:
      'Both statements are individually true in Scripture, yet Reason (R) addresses a separate truth.',
  },
  {
    id: 'C',
    label: '(C) Assertion (A) is biblically true, but Reason (R) is false.',
    description: 'The main Assertion is true according to the Gospel, while Reason contains a misunderstanding.',
  },
  {
    id: 'D',
    label: '(D) Assertion (A) is false, but Reason (R) is biblically true.',
    description: 'The Assertion misstates the Gospel truth, whereas Reason states true Scripture.',
  },
];

export const AssertionReasonLab: React.FC<AssertionReasonLabProps> = ({
  questions = [],
  topicTitle,
  bookReference,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});

  if (!questions || questions.length === 0) {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center text-stone-500">
        <HelpCircle className="w-12 h-12 mx-auto text-stone-300 mb-3" />
        <h3 className="text-lg font-semibold text-stone-800 font-editorial">
          No Scripture Assertion & Reason Questions Yet
        </h3>
        <p className="text-sm mt-1 max-w-md mx-auto">
          Choose another Gospel topic or use the Gospel Study Builder to generate Assertion & Reason reflections.
        </p>
      </div>
    );
  }

  const currentQ = questions[currentIndex] || questions[0];
  const userSelected = selectedAnswers[currentQ.id];
  const isSubmitted = !!userSelected;
  const isCorrect = userSelected === currentQ.correctOption;

  const handleSelectOption = (opt: 'A' | 'B' | 'C' | 'D') => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: opt }));
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
  };

  const scoreCount = Object.entries(selectedAnswers).filter(([id, ans]) => {
    const q = questions.find((item) => item.id === id);
    return q && q.correctOption === ans;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1 flex-wrap">
            <span className="font-semibold text-amber-800">Scripture Assertion & Reason</span>
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
              Watch Jesus Never Fail Ministries Message
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <h2 className="text-xl font-bold text-stone-900 font-editorial">
            Biblical Assertion & Reason Discernment
          </h2>
          <p className="text-sm text-stone-500 mt-0.5">
            Discern how Gospel truth in Assertion (A) connects to its biblical foundation in Reason (R).
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-stone-500 font-medium">Completed</div>
            <div className="text-lg font-bold text-stone-900 font-code tabular-nums">
              {scoreCount} / {questions.length}
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-2.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition border border-stone-200"
            title="Restart Study"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Question Stepper */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          {questions.map((q, idx) => {
            const answered = selectedAnswers[q.id];
            const correct = answered === q.correctOption;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center tabular-nums ${
                  idx === currentIndex
                    ? 'bg-stone-900 text-white'
                    : answered
                    ? correct
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
        <span className="text-xs font-medium text-stone-500 tabular-nums">
          Reflection {currentIndex + 1} of {questions.length}
        </span>
      </div>

      {/* Question Card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-lg bg-amber-700 text-white font-bold text-xs flex items-center justify-center">
                A
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Gospel Assertion
              </span>
            </div>
            <p className="text-stone-900 font-medium text-base leading-relaxed">
              "{currentQ.assertion}"
            </p>
          </div>

          <div className="bg-sky-50/50 border border-sky-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-lg bg-sky-700 text-white font-bold text-xs flex items-center justify-center">
                R
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-900">
                Scriptural Reason
              </span>
            </div>
            <p className="text-stone-900 font-medium text-base leading-relaxed">
              "{currentQ.reason}"
            </p>
          </div>
        </div>

        {currentQ.conceptTip && (
          <div className="flex items-start gap-3 bg-[#FBF9F5] border border-stone-200 rounded-xl p-3.5 text-xs text-stone-700">
            <Lightbulb className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-stone-900">Scripture Anchor: </span>
              {currentQ.conceptTip}
            </div>
          </div>
        )}

        <div className="space-y-3 pt-1">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Select your biblical discernment:
          </div>

          <div className="grid grid-cols-1 gap-3">
            {AR_OPTIONS.map((opt) => {
              const isThisSelected = userSelected === opt.id;
              const isThisCorrect = opt.id === currentQ.correctOption;

              let cardStyle =
                'border-stone-200 hover:border-stone-300 bg-white hover:bg-[#FBF9F5]';
              if (isSubmitted) {
                if (isThisCorrect) {
                  cardStyle = 'border-emerald-500 bg-emerald-50/70';
                } else if (isThisSelected && !isThisCorrect) {
                  cardStyle = 'border-rose-400 bg-rose-50/70';
                } else {
                  cardStyle = 'border-stone-100 bg-stone-50/50 opacity-60';
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  disabled={isSubmitted}
                  className={`w-full text-left p-4 rounded-xl border transition-colors flex items-start gap-3.5 ${cardStyle}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg text-xs font-bold shrink-0 flex items-center justify-center ${
                      isSubmitted
                        ? isThisCorrect
                          ? 'bg-emerald-600 text-white'
                          : isThisSelected
                          ? 'bg-rose-600 text-white'
                          : 'bg-stone-200 text-stone-500'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {opt.id}
                  </div>

                  <div className="flex-1">
                    <div className="font-semibold text-sm text-stone-900 leading-snug">
                      {opt.label}
                    </div>
                    <div className="text-xs text-stone-500 mt-1 leading-relaxed">
                      {opt.description}
                    </div>
                  </div>

                  {isSubmitted && isThisCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  {isSubmitted && isThisSelected && !isThisCorrect && (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {isSubmitted && (
          <div
            className={`p-5 rounded-xl border ${
              isCorrect ? 'bg-emerald-50/70 border-emerald-200' : 'bg-[#FBF9F5] border-stone-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-2 font-semibold text-sm">
              {isCorrect ? (
                <>
                  <Award className="w-4 h-4 text-emerald-700" />
                  <span className="text-emerald-900">
                    Well Discerned! (Option {currentQ.correctOption})
                  </span>
                </>
              ) : (
                <>
                  <HelpCircle className="w-4 h-4 text-stone-600" />
                  <span className="text-stone-900">
                    Scripture Explanation (Answer: {currentQ.correctOption})
                  </span>
                </>
              )}
            </div>
            <p className="text-sm text-stone-700 leading-relaxed">{currentQ.explanation}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 disabled:opacity-30 flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>

          <button
            onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
            disabled={currentIndex === questions.length - 1}
            className="px-5 py-2 text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-30 rounded-xl flex items-center gap-1.5 transition"
          >
            Next Reflection <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
