import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Flame,
  RotateCcw,
  Check,
  X,
  ArrowRight,
  Clock,
  Sparkles,
  Youtube,
  ExternalLink,
} from 'lucide-react';
import { QuizQuestion } from '../types';
import { buildChannelVideoSearchUrl } from '../data/gospelData';

interface KahootQuizArenaProps {
  questions: QuizQuestion[];
  topicTitle: string;
  participantName: string;
  onQuizComplete?: (score: number, accuracy: number) => void;
}

const SHAPES = [
  { icon: '▲', bg: 'bg-rose-700 hover:bg-rose-800 text-white' },
  { icon: '◆', bg: 'bg-blue-800 hover:bg-blue-900 text-white' },
  { icon: '●', bg: 'bg-amber-600 hover:bg-amber-700 text-white' },
  { icon: '■', bg: 'bg-emerald-700 hover:bg-emerald-800 text-white' },
];

export const KahootQuizArena: React.FC<KahootQuizArenaProps> = ({
  questions,
  topicTitle,
  participantName,
  onQuizComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isGameOver, setIsGameOver] = useState(false);
  const [answersHistory, setAnswersHistory] = useState<
    Array<{ correct: boolean; question: string; selected: string; correctAns: string }>
  >([]);

  const currentQ = questions[currentIndex] || questions[0];
  const timerRef = useRef<any>(null);

  useEffect(() => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setHasAnswered(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setIsGameOver(false);
    setAnswersHistory([]);
  }, [topicTitle]);

  useEffect(() => {
    if (isGameOver || hasAnswered || !currentQ) return;

    setTimeLeft(currentQ.timeLimitSeconds || 20);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentIndex, isGameOver, hasAnswered, topicTitle]);

  const handleTimeExpired = () => {
    if (hasAnswered || !currentQ) return;
    setHasAnswered(true);
    setSelectedOption(-1);
    setStreak(0);
    setAnswersHistory((prev) => [
      ...prev,
      {
        correct: false,
        question: currentQ.question,
        selected: 'Time Expired',
        correctAns: currentQ.options[currentQ.correctIndex],
      },
    ]);
  };

  const handleSelectOption = (idx: number) => {
    if (hasAnswered || isGameOver || !currentQ) return;
    clearInterval(timerRef.current);

    setSelectedOption(idx);
    setHasAnswered(true);

    const isCorrect = idx === currentQ.correctIndex;

    if (isCorrect) {
      const speedBonus = Math.floor((timeLeft / (currentQ.timeLimitSeconds || 20)) * 500);
      const earned = (currentQ.points || 1000) + speedBonus + streak * 150;
      setScore((s) => s + earned);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > maxStreak) setMaxStreak(nextStreak);

      try {
        confetti({
          particleCount: 45,
          spread: 55,
          origin: { y: 0.7 },
        });
      } catch {
        // Ignore confetti errors
      }
    } else {
      setStreak(0);
    }

    setAnswersHistory((prev) => [
      ...prev,
      {
        correct: isCorrect,
        question: currentQ.question,
        selected: currentQ.options[idx],
        correctAns: currentQ.options[currentQ.correctIndex],
      },
    ]);
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setHasAnswered(false);
    } else {
      setIsGameOver(true);
      if (onQuizComplete) {
        const totalCorrect = answersHistory.filter((a) => a.correct).length;
        const accuracy = Math.round((totalCorrect / Math.max(1, questions.length)) * 100);
        onQuizComplete(score, accuracy);
      }
      try {
        confetti({ particleCount: 90, spread: 90, origin: { y: 0.5 } });
      } catch {
        // Ignore
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setHasAnswered(false);
    setScore(0);
    setStreak(0);
    setIsGameOver(false);
    setAnswersHistory([]);
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center text-stone-500">
        <Sparkles className="w-10 h-10 text-amber-700 mx-auto mb-2 opacity-60" />
        <p className="text-base font-bold text-stone-800 font-editorial">
          No Gospel Quiz Questions Yet
        </p>
        <p className="text-xs mt-1 font-sans-ui">
          Generate a Gospel module in the Study Builder to launch an interactive Scripture quiz.
        </p>
      </div>
    );
  }

  if (isGameOver) {
    const totalCorrect = answersHistory.filter((a) => a.correct).length;
    const accuracy = Math.round((totalCorrect / questions.length) * 100);

    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-10 max-w-2xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
          <Trophy className="w-8 h-8 text-amber-700" />
        </div>

        <div>
          <div className="text-xs uppercase font-bold tracking-widest text-amber-800 mb-1">
            Gospel Scripture Quiz Completed
          </div>
          <h2 className="text-3xl font-bold text-stone-900 font-editorial">
            Blessed Study, {participantName}
          </h2>
          <p className="text-xs text-stone-500 mt-1 font-sans-ui">{topicTitle}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 bg-[#FBF9F5] border border-stone-200 rounded-2xl p-4">
          <div>
            <div className="text-2xl font-bold text-amber-800 font-display tabular-nums">
              {score.toLocaleString()}
            </div>
            <div className="text-[11px] text-stone-500">Grace Points</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-700 font-display tabular-nums">
              {accuracy}%
            </div>
            <div className="text-[11px] text-stone-500 tabular-nums">
              {totalCorrect} / {questions.length} Correct
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-rose-700 font-display tabular-nums">
              {maxStreak}x
            </div>
            <div className="text-[11px] text-stone-500">Best Streak</div>
          </div>
        </div>

        <div className="text-left bg-[#FBF9F5] border border-stone-200 rounded-2xl p-4 max-h-56 overflow-y-auto space-y-2.5">
          <div className="text-xs font-bold text-stone-600 uppercase tracking-wider">
            Scripture Review
          </div>
          {answersHistory.map((item, idx) => (
            <div
              key={idx}
              className="text-xs p-3 rounded-xl bg-white border border-stone-200 flex items-start gap-2.5"
            >
              {item.correct ? (
                <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              ) : (
                <X className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-semibold text-stone-900">{item.question}</div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  Your answer:{' '}
                  <span className={item.correct ? 'text-emerald-700 font-medium' : 'text-rose-700 font-medium'}>
                    {item.selected}
                  </span>
                  {!item.correct && (
                    <span className="text-emerald-700 ml-2 font-semibold">
                      Scripture Answer: {item.correctAns}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleRestart}
            className="flex-1 bg-stone-900 hover:bg-stone-800 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors font-display"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Gospel Quiz</span>
          </button>
          <a
            href={buildChannelVideoSearchUrl(topicTitle)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-rose-700 hover:bg-rose-800 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors font-display"
          >
            <Youtube className="w-4 h-4" />
            <span>Watch Topic on Channel</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Top Bar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs">
          <span className="font-bold text-stone-900 font-display tabular-nums">
            Question {currentIndex + 1} / {questions.length}
          </span>
          {streak > 1 && (
            <span className="inline-flex items-center gap-1 font-bold text-amber-800 tabular-nums">
              <Flame className="w-3.5 h-3.5 text-amber-700" />
              {streak}x Streak
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-code font-bold bg-[#FBF9F5] px-2.5 py-1 rounded-lg border border-stone-200 tabular-nums">
            <Clock className={`w-3.5 h-3.5 ${timeLeft <= 5 ? 'text-rose-700' : 'text-stone-500'}`} />
            <span className={timeLeft <= 5 ? 'text-rose-700' : 'text-stone-700'}>{timeLeft}s</span>
          </div>

          <div className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg font-code tabular-nums">
            {score.toLocaleString()} pts
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden">
        <div
          className="absolute top-0 left-0 h-1 bg-amber-700 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />

        <div className="text-xs uppercase tracking-wider font-semibold text-stone-500 mb-2">
          Gospel Topic · {topicTitle}
        </div>

        <h3 className="text-lg sm:text-2xl font-bold text-stone-900 leading-snug max-w-2xl mx-auto font-editorial">
          {currentQ.question}
        </h3>

        {hasAnswered && (
          <div className="mt-5 p-4 rounded-xl text-left flex flex-col sm:flex-row sm:items-start gap-3 bg-[#FBF9F5] border border-stone-200">
            {selectedOption === currentQ.correctIndex ? (
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Check className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                <X className="w-5 h-5" />
              </div>
            )}
            <div className="flex-1 text-xs">
              <div className="font-bold text-stone-900 text-sm font-display">
                {selectedOption === currentQ.correctIndex
                  ? 'Amen! Rightly Divided in Scripture.'
                  : 'Take Heart — Here is the Biblical Truth:'}
              </div>
              <p className="text-stone-600 mt-1 leading-relaxed">{currentQ.explanation}</p>
            </div>
            <button
              onClick={handleNext}
              className="bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 font-display self-end sm:self-center"
            >
              <span>{currentIndex + 1 === questions.length ? 'See Results' : 'Next Question'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {currentQ.options.map((opt, idx) => {
          const shape = SHAPES[idx % SHAPES.length];
          const isSelected = selectedOption === idx;
          const isCorrect = idx === currentQ.correctIndex;

          let blockStyle = shape.bg;
          if (hasAnswered) {
            if (isCorrect) {
              blockStyle = 'bg-emerald-700 text-white ring-2 ring-emerald-300';
            } else if (isSelected && !isCorrect) {
              blockStyle = 'bg-rose-600/80 text-white line-through opacity-80';
            } else {
              blockStyle = 'bg-stone-100 text-stone-400 opacity-60 border border-stone-200';
            }
          }

          return (
            <button
              key={idx}
              disabled={hasAnswered}
              onClick={() => handleSelectOption(idx)}
              className={`p-4 sm:p-5 rounded-2xl text-left font-medium text-sm sm:text-base flex items-center gap-3 transition-all ${blockStyle}`}
            >
              <span className="w-8 h-8 rounded-xl bg-black/15 flex items-center justify-center font-bold text-sm shrink-0">
                {shape.icon}
              </span>
              <span className="flex-1 leading-snug">{opt}</span>
              {hasAnswered && isCorrect && <Check className="w-5 h-5 shrink-0" />}
              {hasAnswered && isSelected && !isCorrect && <X className="w-5 h-5 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
