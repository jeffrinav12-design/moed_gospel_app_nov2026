import React, { useState } from 'react';
import {
  PenTool,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Award,
  Loader2,
  Eye,
  ChevronDown,
  ChevronUp,
  Youtube,
  ExternalLink,
} from 'lucide-react';
import { PracticeExercise, WritingCheckResult } from '../types';
import { buildChannelVideoSearchUrl } from '../data/gospelData';

interface WritingWorksLabProps {
  exercises: PracticeExercise[];
  topicTitle: string;
}

export const WritingWorksLab: React.FC<WritingWorksLabProps> = ({
  exercises,
  topicTitle,
}) => {
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<string, string>>({});
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [evaluations, setEvaluations] = useState<Record<string, WritingCheckResult>>({});
  const [showModelAnswer, setShowModelAnswer] = useState<Record<string, boolean>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAnswerChange = (id: string, text: string) => {
    setReflectionAnswers((prev) => ({ ...prev, [id]: text }));
  };

  const handleCheckAnswer = async (exercise: PracticeExercise) => {
    const draftText = reflectionAnswers[exercise.id];
    if (!draftText || !draftText.trim()) {
      setErrorMessage('Please write your prayer reflection or response before submitting.');
      return;
    }

    setErrorMessage(null);
    setEvaluatingId(exercise.id);

    try {
      const response = await fetch('/api/check-writing-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: exercise.question,
          modelAnswer: exercise.modelAnswer,
          studentAnswer: draftText.trim(),
          keyRubrics: exercise.keyRubrics,
          maxScore: exercise.maxScore,
        }),
      });

      if (!response.ok) {
        throw new Error('Pastoral reflection review failed');
      }

      const result: WritingCheckResult = await response.json();
      setEvaluations((prev) => ({ ...prev, [exercise.id]: result }));
    } catch (err) {
      console.error(err);
      setErrorMessage('Could not review your prayer reflection right now. Please try again.');
    } finally {
      setEvaluatingId(null);
    }
  };

  const toggleModelAnswer = (id: string) => {
    setShowModelAnswer((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <PenTool className="w-4 h-4 text-amber-700" />
            <h3 className="text-base font-bold text-stone-900 font-editorial">
              Prayer Journal & Personal Gospel Reflection
            </h3>
            <span aria-hidden="true">·</span>
            <a
              href={buildChannelVideoSearchUrl(topicTitle)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-rose-700 hover:underline inline-flex items-center gap-1"
            >
              <Youtube className="w-3.5 h-3.5" />
              Watch Topic Video
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-xs text-stone-500 mt-0.5 font-sans-ui">
            Journal your prayer, testimony, or biblical reflection on "{topicTitle}" and receive Scripture-based encouragement.
          </p>
        </div>

        <div className="text-xs text-stone-600 font-semibold shrink-0 tabular-nums">
          {exercises.length} Journal Prompts
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
          {errorMessage}
        </div>
      )}

      {/* Prompts */}
      <div className="space-y-6">
        {exercises.map((exercise, idx) => {
          const evalResult = evaluations[exercise.id];
          const isEvaluating = evaluatingId === exercise.id;
          const isModelVisible = showModelAnswer[exercise.id];

          return (
            <div
              key={exercise.id}
              className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 space-y-4"
            >
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                  {idx + 1}
                </span>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-stone-900 leading-snug font-editorial">
                    {exercise.question}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500">
                    <span className="uppercase font-semibold text-amber-800">{exercise.type}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">Alignment Guide: {exercise.maxScore} Pts</span>
                  </div>
                </div>
              </div>

              <textarea
                value={reflectionAnswers[exercise.id] || ''}
                onChange={(e) => handleAnswerChange(exercise.id, e.target.value)}
                rows={4}
                placeholder="Write your heartfelt prayer or Scripture reflection here..."
                className="w-full bg-[#FBF9F5] border border-stone-200 focus:border-amber-700 rounded-xl p-3 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none resize-none font-sans-ui"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-display">
                <button
                  type="button"
                  onClick={() => toggleModelAnswer(exercise.id)}
                  className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1 font-medium transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isModelVisible ? 'Hide Sample Reflection' : 'View Sample Gospel Reflection'}</span>
                  {isModelVisible ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>

                <button
                  type="button"
                  disabled={isEvaluating}
                  onClick={() => handleCheckAnswer(exercise)}
                  className="bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  {isEvaluating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Reviewing with Scripture Guide...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Submit Reflection</span>
                    </>
                  )}
                </button>
              </div>

              {isModelVisible && (
                <div className="bg-[#FBF9F5] border border-stone-200 rounded-xl p-4 text-xs space-y-2.5">
                  <div className="font-bold text-amber-800 uppercase tracking-wider text-[10px]">
                    Sample Prayer / Biblical Reflection:
                  </div>
                  <p className="text-stone-800 whitespace-pre-line leading-relaxed bg-white p-3 rounded-lg border border-stone-200">
                    {exercise.modelAnswer}
                  </p>

                  <div className="pt-1">
                    <div className="font-bold text-stone-600 uppercase tracking-wider text-[10px] mb-1">
                      Core Spiritual Themes:
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-stone-700 text-[11px]">
                      {exercise.keyRubrics.map((r, rIdx) => (
                        <li key={rIdx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {evalResult && (
                <div className="bg-[#FBF9F5] border border-amber-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-700" />
                      <span className="font-bold text-stone-900 text-xs font-display">
                        Scripture Guide Encouragement
                      </span>
                    </div>

                    <div className="font-bold text-sm font-display bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg text-emerald-800 tabular-nums">
                      Alignment: {evalResult.score} / {evalResult.maxScore}
                    </div>
                  </div>

                  <p className="text-xs text-stone-700 leading-relaxed font-medium">
                    {evalResult.feedback}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-lg space-y-1">
                      <div className="font-bold text-emerald-900 flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Biblical Strengths:</span>
                      </div>
                      <ul className="list-disc list-inside text-emerald-950 text-[11px] space-y-0.5">
                        {evalResult.strengths.map((s, sIdx) => (
                          <li key={sIdx}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-amber-50/70 border border-amber-200 p-2.5 rounded-lg space-y-1">
                      <div className="font-bold text-amber-900 flex items-center gap-1 text-[11px]">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                        <span>Further Meditation:</span>
                      </div>
                      <ul className="list-disc list-inside text-amber-950 text-[11px] space-y-0.5">
                        {evalResult.improvements.map((imp, impIdx) => (
                          <li key={impIdx}>{imp}</li>
                        ))}
                      </ul>
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
