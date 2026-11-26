import React, { useState } from 'react';
import {
  Search,
  Loader2,
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { RabbiHistoryLesson } from '../types';
import { RABBI_HISTORY_LESSONS } from '../data/languagesAndHistoryData';
import { safeFetchJson } from '../services/apiClient';
import { biblicalStoriesOliveImg } from '../assets/media';

interface RabbiHistoryPageProps {
  onOpenBibleReader?: () => void;
  onOpenHebrewAcademy?: () => void;
  onOpenGreekAcademy?: () => void;
}

export const RabbiHistoryPage: React.FC<RabbiHistoryPageProps> = ({
  onOpenBibleReader,
  onOpenHebrewAcademy,
  onOpenGreekAcademy,
}) => {
  const [lessons, setLessons] = useState<RabbiHistoryLesson[]>(RABBI_HISTORY_LESSONS);
  const [activeLessonId, setActiveLessonId] = useState<string>(RABBI_HISTORY_LESSONS[0].id);
  const [rabbiQuery, setRabbiQuery] = useState('');
  const [loadingRabbi, setLoadingRabbi] = useState(false);
  const [rabbiError, setRabbiError] = useState<string | null>(null);

  const activeLesson = lessons.find((l) => l.id === activeLessonId) || lessons[0];

  const handleAskRabbiHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rabbiQuery.trim()) return;
    setLoadingRabbi(true);
    setRabbiError(null);
    try {
      const result = await safeFetchJson<RabbiHistoryLesson>('/api/bible/rabbi-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryText: rabbiQuery.trim() }),
      });
      if (!result.ok || !result.data?.title) {
        throw new Error(result.error || 'Could not retrieve Jewish historical insight.');
      }
      const lesson = result.data;
      setLessons((prev) => [lesson, ...prev]);
      setActiveLessonId(lesson.id);
      setRabbiQuery('');
    } catch (err: any) {
      setRabbiError(err?.message || 'Unable to generate historical commentary right now.');
    } finally {
      setLoadingRabbi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Archival Scroll Editorial Header */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5">
          <div className="space-y-2.5">
            <div className="text-xs text-stone-500 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-amber-800">Rabbi & Jewish Historical Studies</span>
              <span aria-hidden="true">·</span>
              <span>Second Temple Context</span>
              <span aria-hidden="true">·</span>
              <span>Moedim, Synagogue & Torah Heritage</span>
            </div>
            <h1 className="text-2xl sm:text-3xl xl:text-4xl font-bold text-stone-900 font-editorial">
              Discover the Jewish Roots & Biblical Histories Behind Scripture
            </h1>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-2xl">
              Explore Torah feasts (Moedim), Passover Seder customs, 1st-century synagogue learning, and historical rabbinical context that illuminate God’s covenant love and fulfillment in Jesus Christ.
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
            {onOpenGreekAcademy && (
              <button
                type="button"
                onClick={onOpenGreekAcademy}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-stone-200 bg-[#FBF9F5] hover:bg-stone-100 text-stone-800 text-xs font-semibold transition-colors"
              >
                Greek Letters Academy
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 relative min-h-[210px] bg-stone-900">
          <img
            src={biblicalStoriesOliveImg}
            alt="Olive trees overlooking Jerusalem foothills"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6">
            <div className="text-amber-200 text-lg font-hebrew font-bold" dir="rtl">
              שְׁמַע יִשְׂרָאֵל יְהוָה אֱלֹהֵינוּ יְהוָה אֶחָד
            </div>
            <p className="text-xs text-stone-200 mt-1">
              "Hear, O Israel: The Lord our God, the Lord is one." — Deuteronomy 6:4
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Search Query */}
      <form
        onSubmit={handleAskRabbiHistory}
        className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
      >
        <div className="flex items-center gap-2.5 flex-1 px-2">
          <Search className="w-4 h-4 text-amber-800 shrink-0" />
          <input
            type="text"
            value={rabbiQuery}
            onChange={(e) => setRabbiQuery(e.target.value)}
            placeholder="Ask Jewish historical background on any custom or passage (e.g. 'Shabbat Lamp', 'Kinsman Redeemer', 'Day of Atonement', 'Galilee Synagogue')..."
            className="w-full text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none min-h-[40px]"
          />
        </div>
        <button
          type="submit"
          disabled={loadingRabbi || !rabbiQuery.trim()}
          className="min-h-[44px] px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 shrink-0"
        >
          {loadingRabbi ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          )}
          <span>Explore Jewish History</span>
        </button>
      </form>

      {rabbiError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{rabbiError}</span>
        </div>
      )}

      {/* Master-Detail Rabbi Lessons */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <aside className="lg:col-span-4 space-y-2.5">
          {lessons.map((lesson) => {
            const isActive = lesson.id === activeLesson.id;
            return (
              <button
                key={lesson.id}
                type="button"
                onClick={() => setActiveLessonId(lesson.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-colors space-y-1 min-h-[76px] ${
                  isActive
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-900 border-stone-200 hover:border-amber-600'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className={`font-semibold ${isActive ? 'text-amber-300' : 'text-amber-800'}`}>
                    {lesson.hebrewTerm}
                  </span>
                  <span className={`font-hebrew text-sm ${isActive ? 'text-stone-200' : 'text-stone-600'}`}>
                    {lesson.hebrewScript}
                  </span>
                </div>
                <h2 className="text-sm font-bold font-editorial leading-snug">{lesson.title}</h2>
                <div className={`text-[11px] ${isActive ? 'text-stone-300' : 'text-stone-500'}`}>
                  {lesson.torahOrScriptureRefs}
                </div>
              </button>
            );
          })}
        </aside>

        <article className="lg:col-span-8 bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-stone-100 pb-5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
              <span>{activeLesson.era}</span>
              <span className="font-semibold text-amber-800">
                {activeLesson.torahOrScriptureRefs}
              </span>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-2xl font-bold text-stone-900 font-editorial">
                {activeLesson.title}
              </h2>
              <span className="text-2xl font-bold font-hebrew text-amber-900">
                {activeLesson.hebrewScript}
              </span>
            </div>
            <p className="text-sm sm:text-base text-stone-700 leading-relaxed pt-1">
              {activeLesson.summary}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-800" />
              <span>Historical Teaching & Rabbi Scholarship</span>
            </h3>
            <ul className="space-y-2.5">
              {activeLesson.rabbiPerspectiveDetails.map((pt, i) => (
                <li
                  key={i}
                  className="p-3.5 rounded-xl bg-[#FBF9F5] border border-stone-200 text-xs sm:text-sm text-stone-800 leading-relaxed flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1.5">
              <div className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                Synagogue & Daily Jewish Custom
              </div>
              <p className="text-xs sm:text-sm text-stone-800 leading-relaxed">
                {activeLesson.jewishCustomsExplained}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-rose-50/60 border border-rose-200 space-y-1.5">
              <div className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                How Jesus Fulfills This Promise
              </div>
              <p className="text-xs sm:text-sm text-stone-800 leading-relaxed">
                {activeLesson.fulfillmentInJesus}
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};
