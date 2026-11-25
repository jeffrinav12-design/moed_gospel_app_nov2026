import React, { useState } from 'react';
import { GospelSession, GospelPillar, LiveYouTubeVideo } from '../types';
import {
  GOSPEL_PILLAR_LIST,
  JESUS_NEVER_FAILS_CHANNEL_URL,
  buildChannelVideoSearchUrl,
} from '../data/gospelData';
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  FileText,
  Split,
  FileEdit,
  Youtube,
  Play,
  ExternalLink,
  HeartHandshake,
  RefreshCw,
  Loader2,
  Eye,
  X,
} from 'lucide-react';

interface GospelChannelBrowserProps {
  sessions: GospelSession[];
  currentSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onNavigateToTab: (tab: string) => void;
  liveVideos?: LiveYouTubeVideo[];
  loadingVideos?: boolean;
  onRefreshVideos?: () => void;
  onCreateStudyFromVideo?: (video: LiveYouTubeVideo) => void;
  isGeneratingFromVideo?: string | null;
}

export const GospelChannelBrowser: React.FC<GospelChannelBrowserProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNavigateToTab,
  liveVideos = [],
  loadingVideos = false,
  onRefreshVideos,
  onCreateStudyFromVideo,
  isGeneratingFromVideo,
}) => {
  const [selectedPillar, setSelectedPillar] = useState<GospelPillar | 'All'>('All');
  const [activeVideo, setActiveVideo] = useState<LiveYouTubeVideo | null>(null);

  const filteredSessions =
    selectedPillar === 'All'
      ? sessions
      : sessions.filter((s) => s.pillar === selectedPillar);

  return (
    <div className="space-y-8">
      {/* Sanctuary Editorial Hero Banner */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span className="font-semibold text-rose-700">@jesusneverfails7649</span>
                <span aria-hidden="true">·</span>
                <span>Live Merged YouTube & Scripture Partner Hub</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-editorial leading-tight">
                Jesus Never Fail Ministries Channel & Interactive Gospel Studies
              </h2>
              <p className="text-sm text-stone-600 leading-relaxed max-w-2xl">
                Stream real uploads from{' '}
                <a
                  href={JESUS_NEVER_FAILS_CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-rose-700 underline underline-offset-4 hover:text-rose-800"
                >
                  https://www.youtube.com/@jesusneverfails7649
                </a>
                , convert any channel video into an interactive Bible study, and explore Scripture quizzes, parables, and prayer reflections.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={JESUS_NEVER_FAILS_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold transition-colors whitespace-nowrap"
              >
                <Youtube className="w-4 h-4" />
                <span>Open @jesusneverfails7649</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => onNavigateToTab('studio')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Build Custom Bible Study</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[220px] bg-stone-900">
            <img
              src="/src/assets/images/gospel_hero_sanctuary_1795279534207.jpg"
              alt="Open Holy Bible in morning sanctuary light"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent flex flex-col justify-end p-6">
              <p className="text-sm font-editorial italic text-white leading-relaxed">
                "Jesus Christ is the same yesterday, today, and forever."
              </p>
              <span className="text-xs text-amber-200 mt-1">Hebrews 13:8 · Anchor Promise</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Uploads From @jesusneverfails7649 */}
      <section className="bg-white border border-stone-200 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <div className="text-xs font-semibold text-rose-700 flex items-center gap-1.5">
              <Youtube className="w-4 h-4" />
              <span>Live Channel Feed · @jesusneverfails7649</span>
            </div>
            <h3 className="text-xl font-bold text-stone-900 font-editorial mt-1">
              Watch & Build Gospel Studies From Channel Videos
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {onRefreshVideos && (
              <button
                type="button"
                onClick={onRefreshVideos}
                disabled={loadingVideos}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingVideos ? 'animate-spin' : ''}`} />
                <span>Refresh Channel</span>
              </button>
            )}
            <a
              href={JESUS_NEVER_FAILS_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold transition-colors"
            >
              <span>All Uploads</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Active Embedded Player */}
        {activeVideo && (
          <div className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-950">
            <div className="aspect-video w-full">
              <iframe
                src={`${activeVideo.embedUrl}?autoplay=1`}
                title={activeVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-4 bg-stone-900 text-white flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-bold font-editorial truncate">{activeVideo.title}</div>
                <div className="text-xs text-stone-400 tabular-nums mt-0.5">
                  {Number(activeVideo.views || 0).toLocaleString()} views · Published{' '}
                  {activeVideo.publishedAt ? new Date(activeVideo.publishedAt).toLocaleDateString() : 'Recently'}
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                {onCreateStudyFromVideo && (
                  <button
                    type="button"
                    disabled={isGeneratingFromVideo === activeVideo.videoId}
                    onClick={() => onCreateStudyFromVideo(activeVideo)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-xs font-semibold"
                  >
                    {isGeneratingFromVideo === activeVideo.videoId ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>Build Interactive Study</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveVideo(null)}
                  className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
                  title="Close player"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {loadingVideos && liveVideos.length === 0 ? (
          <div className="py-10 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-rose-700" />
            <span>Loading live videos from @jesusneverfails7649...</span>
          </div>
        ) : liveVideos.length === 0 ? (
          <div className="py-6 text-center text-xs text-stone-500">
            No live channel feed items loaded right now. Click Refresh Channel or visit{' '}
            <a
              href={JESUS_NEVER_FAILS_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-700 font-semibold underline"
            >
              @jesusneverfails7649
            </a>
            .
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveVideos.map((vid) => {
              const isPlaying = activeVideo?.videoId === vid.videoId;
              const isGeneratingThis = isGeneratingFromVideo === vid.videoId;
              return (
                <div
                  key={vid.videoId}
                  className={`rounded-xl border overflow-hidden flex flex-col justify-between transition-colors ${
                    isPlaying
                      ? 'border-rose-600 bg-rose-50/30'
                      : 'border-stone-200 bg-[#FBF9F5]'
                  }`}
                >
                  <div>
                    <button
                      type="button"
                      onClick={() => setActiveVideo(vid)}
                      className="relative w-full aspect-video bg-stone-900 overflow-hidden group block"
                    >
                      <img
                        src={vid.thumbnailUrl}
                        alt={vid.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/25 group-hover:bg-black/45 transition-colors flex items-center justify-center">
                        <div className="w-11 h-11 rounded-full bg-rose-700 text-white flex items-center justify-center shadow-md">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>
                    </button>

                    <div className="p-4 space-y-1.5">
                      <div className="flex items-center gap-2 text-[11px] text-stone-500">
                        <span className="font-semibold text-rose-700">
                          {vid.isShort ? 'YouTube Short' : 'Channel Video'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1 tabular-nums">
                          <Eye className="w-3 h-3" />
                          {Number(vid.views || 0).toLocaleString()} views
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-stone-900 font-editorial leading-snug line-clamp-2">
                        {vid.title}
                      </h4>
                      {vid.description && (
                        <p className="text-xs text-stone-600 line-clamp-2">{vid.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="px-4 pb-4 pt-2 border-t border-stone-200/70 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveVideo(vid)}
                      className="text-xs font-semibold text-stone-900 hover:text-rose-700 inline-flex items-center gap-1"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{isPlaying ? 'Playing' : 'Watch'}</span>
                    </button>

                    {onCreateStudyFromVideo ? (
                      <button
                        type="button"
                        disabled={Boolean(isGeneratingFromVideo)}
                        onClick={() => onCreateStudyFromVideo(vid)}
                        className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:opacity-60 text-white text-[11px] font-semibold inline-flex items-center gap-1 transition-colors"
                      >
                        {isGeneratingThis ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Building...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 text-amber-300" />
                            <span>Create Gospel Study</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <a
                        href={vid.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-rose-700 font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        <span>YouTube</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Gospel Pillar Segmented Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span className="font-semibold text-stone-700">Filter Interactive Scripture Studies</span>
          <span className="tabular-nums">{filteredSessions.length} active studies</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedPillar('All')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
              selectedPillar === 'All'
                ? 'bg-stone-900 text-white'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
          >
            All Gospel Topics
          </button>
          {GOSPEL_PILLAR_LIST.map((pillar) => {
            const active = selectedPillar === pillar.id;
            return (
              <button
                key={pillar.id}
                onClick={() => setSelectedPillar(pillar.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-stone-900 text-white'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                {pillar.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Gospel Topics & Interlinked YouTube Video Cards */}
      <div className="grid grid-cols-1 gap-6">
        {filteredSessions.map((session) => {
          const isCurrent = session.id === currentSessionId;
          const channelSearchUrl = buildChannelVideoSearchUrl(session.title);

          return (
            <article
              key={session.id}
              className={`bg-white border rounded-2xl p-6 sm:p-7 transition-colors space-y-5 ${
                isCurrent ? 'border-amber-700/70 bg-[#FFFDF9]' : 'border-stone-200'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                    <span className="font-semibold text-amber-800">{session.pillar}</span>
                    <span aria-hidden="true">·</span>
                    <span>{session.scriptureBook}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-rose-700 font-medium">
                      @jesusneverfails7649 ({session.suggestedVideos?.length || 0} videos)
                    </span>
                    {isCurrent && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-emerald-700">Active Study</span>
                      </>
                    )}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-stone-900 font-editorial leading-snug">
                    <a
                      href={channelSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-rose-800 transition-colors inline-flex items-baseline gap-2"
                    >
                      <span>{session.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                    </a>
                  </h3>

                  <p className="text-xs font-editorial italic text-stone-700">
                    "{session.anchorVerse}"
                  </p>

                  <p className="text-sm text-stone-600 leading-relaxed">
                    {session.summary}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                  <a
                    href={channelSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                  >
                    <Youtube className="w-4 h-4" />
                    <span>Watch on YouTube</span>
                  </a>

                  <button
                    onClick={() => {
                      onSelectSession(session.id);
                      onNavigateToTab('kahoot');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                  >
                    <span>Study This Topic</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {session.suggestedVideos && session.suggestedVideos.length > 0 && (
                <div className="pt-4 border-t border-stone-100 space-y-2.5">
                  <div className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 text-rose-700" />
                    <span>Linked Videos on @jesusneverfails7649:</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {session.suggestedVideos.map((vid) => (
                      <a
                        key={vid.id}
                        href={vid.videoSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group p-3.5 rounded-xl bg-[#FBF9F5] hover:bg-rose-50/60 border border-stone-200 hover:border-rose-300 transition-colors flex flex-col justify-between gap-2"
                      >
                        <div className="space-y-1">
                          <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
                            <span className="font-semibold text-rose-700">{vid.category}</span>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">{vid.duration}</span>
                          </div>
                          <div className="text-xs font-bold text-stone-900 group-hover:text-rose-800 leading-snug">
                            {vid.title}
                          </div>
                        </div>
                        <div className="text-[11px] text-stone-500 flex items-center justify-between pt-1">
                          <span>{vid.scriptureReference}</span>
                          <span className="text-rose-700 font-semibold inline-flex items-center gap-1">
                            Watch <ExternalLink className="w-3 h-3" />
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Gospel Exercise Launchers */}
              <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    onSelectSession(session.id);
                    onNavigateToTab('kahoot');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Gospel Quiz ({session.quiz.length})</span>
                </button>

                <button
                  onClick={() => {
                    onSelectSession(session.id);
                    onNavigateToTab('ar-lab');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                  <span>Scripture A&R ({session.assertionReasons?.length || 0})</span>
                </button>

                <button
                  onClick={() => {
                    onSelectSession(session.id);
                    onNavigateToTab('case-study');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-800" />
                  <span>Parable & Case Study ({session.caseBasedQuestions?.length || 0})</span>
                </button>

                <button
                  onClick={() => {
                    onSelectSession(session.id);
                    onNavigateToTab('give-reason');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <HeartHandshake className="w-3.5 h-3.5 text-amber-800" />
                  <span>Biblical Reason ({session.giveReasons?.length || 0})</span>
                </button>

                <button
                  onClick={() => {
                    onSelectSession(session.id);
                    onNavigateToTab('diff-matrix');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <Split className="w-3.5 h-3.5 text-indigo-800" />
                  <span>Covenant Contrast ({session.differentiations?.length || 0})</span>
                </button>

                <button
                  onClick={() => {
                    onSelectSession(session.id);
                    onNavigateToTab('subjective');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <FileEdit className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Reflections ({(session.shortAnswers?.length || 0) + (session.longAnswers?.length || 0)})</span>
                </button>

                <button
                  onClick={() => {
                    onSelectSession(session.id);
                    onNavigateToTab('notes');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <BookOpen className="w-3.5 h-3.5 text-stone-700" />
                  <span>Devotional Notes & Prayer</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
