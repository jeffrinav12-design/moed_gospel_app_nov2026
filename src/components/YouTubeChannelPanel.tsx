import React, { useState } from 'react';
import {
  Youtube,
  Play,
  ExternalLink,
  BookOpen,
  Clock,
  Search,
  Sparkles,
  Loader2,
  X,
} from 'lucide-react';
import { GospelSession, YouTubeVideoSuggestion, LiveYouTubeVideo } from '../types';
import {
  JESUS_NEVER_FAILS_CHANNEL_URL,
  buildChannelVideoSearchUrl,
  buildYouTubeGospelSearchUrl,
} from '../data/gospelData';

interface YouTubeChannelPanelProps {
  session: GospelSession;
  compact?: boolean;
  liveVideos?: LiveYouTubeVideo[];
  onCreateStudyFromVideo?: (video: LiveYouTubeVideo) => void;
  isGeneratingFromVideo?: string | null;
}

export const YouTubeChannelPanel: React.FC<YouTubeChannelPanelProps> = ({
  session,
  compact = false,
  liveVideos = [],
  onCreateStudyFromVideo,
  isGeneratingFromVideo,
}) => {
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideoSuggestion | null>(
    session.suggestedVideos?.[0] || null
  );
  const [showCompactPlayer, setShowCompactPlayer] = useState(false);

  React.useEffect(() => {
    setSelectedVideo(session.suggestedVideos?.[0] || null);
    setShowCompactPlayer(false);
  }, [session.id]);

  const activeChannelSearchUrl = buildChannelVideoSearchUrl(session.title);
  const activeGlobalSearchUrl = buildYouTubeGospelSearchUrl(session.title);

  // Pick a real live @jesusneverfails7649 video ID if available
  const activeEmbedUrl =
    selectedVideo?.embedUrl ||
    (liveVideos[0]?.embedUrl) ||
    'https://www.youtube.com/embed/hVCWXvx_lio';

  const activeWatchUrl =
    selectedVideo?.videoSearchUrl ||
    liveVideos[0]?.url ||
    activeChannelSearchUrl;

  if (compact) {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span className="font-semibold text-rose-700">@jesusneverfails7649</span>
                <span aria-hidden="true">·</span>
                <span>
                  {liveVideos.length > 0
                    ? `${liveVideos.length} Live Channel Videos`
                    : `${session.suggestedVideos?.length || 0} Linked Videos`}
                </span>
              </div>
              <p className="text-sm font-semibold text-stone-900 mt-0.5">
                {selectedVideo?.title || liveVideos[0]?.title || `Watch sermons on "${session.title}"`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => setShowCompactPlayer((prev) => !prev)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold transition-colors whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{showCompactPlayer ? 'Hide Video Player' : 'Play Channel Video'}</span>
            </button>
            <a
              href={session.youtubeChannelUrl || JESUS_NEVER_FAILS_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors whitespace-nowrap"
            >
              <span>Open @jesusneverfails7649</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {showCompactPlayer && (
          <div className="border-t border-stone-200 bg-stone-950 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-300">
              <span className="font-semibold text-white truncate">
                {selectedVideo?.title || liveVideos[0]?.title || session.title}
              </span>
              <div className="flex items-center gap-3 shrink-0">
                <a
                  href={activeWatchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-300 hover:underline inline-flex items-center gap-1"
                >
                  <span>Open on YouTube</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={() => setShowCompactPlayer(false)}
                  className="text-stone-400 hover:text-white p-1"
                  title="Close player"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="aspect-video max-w-3xl mx-auto rounded-xl overflow-hidden bg-black border border-stone-800">
              <iframe
                src={activeEmbedUrl}
                title={selectedVideo?.title || session.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
      {/* Header Bar */}
      <div className="px-6 py-5 border-b border-stone-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#FBF9F5]">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="font-semibold text-rose-700 inline-flex items-center gap-1.5">
              <Youtube className="w-4 h-4" />
              Jesus Never Fail Ministries (@jesusneverfails7649)
            </span>
            <span aria-hidden="true">·</span>
            <span>{session.pillar}</span>
            <span aria-hidden="true">·</span>
            <span>{session.scriptureBook}</span>
          </div>
          <h3 className="text-xl font-bold text-stone-900 font-editorial mt-1">
            Linked YouTube Messages for "{session.title}"
          </h3>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <a
            href={activeChannelSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Channel</span>
          </a>
          <a
            href={JESUS_NEVER_FAILS_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <Youtube className="w-3.5 h-3.5 text-rose-700" />
            <span>Visit @jesusneverfails7649</span>
            <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
          </a>
        </div>
      </div>

      {/* Two-Column Split: Embedded Player + Suggested Video List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-5 bg-stone-950 flex flex-col justify-between p-4 gap-3">
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-stone-800">
            <iframe
              src={activeEmbedUrl}
              title={selectedVideo?.title || session.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="space-y-2 px-1">
            <div className="text-xs text-amber-200 font-medium">
              {selectedVideo?.category || 'Sermon'} · {selectedVideo?.scriptureReference || session.scriptureBook}
            </div>
            <h4 className="text-base font-bold text-white font-editorial leading-snug">
              {selectedVideo?.title || session.title}
            </h4>
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <a
                href={activeWatchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-stone-900 hover:bg-amber-50 text-xs font-bold transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-rose-700 text-rose-700" />
                <span>Open on YouTube</span>
              </a>
              <a
                href={activeGlobalSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-colors"
              >
                <span>More Related</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500 border-b border-stone-100 pb-3">
            <span className="font-semibold text-stone-700">
              Channel & Topic Videos Interlinked With This Study
            </span>
            <span className="tabular-nums">
              {session.suggestedVideos.length} linked videos
            </span>
          </div>

          <div className="space-y-3">
            {session.suggestedVideos.map((video) => {
              const isSelected = selectedVideo?.id === video.id;
              return (
                <div
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedVideo(video);
                    }
                  }}
                  className={`p-4 rounded-xl border transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#FBF9F5] border-amber-700/60'
                      : 'bg-white border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <span className="font-semibold text-rose-700">{video.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {video.scriptureReference}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Clock className="w-3 h-3" />
                        {video.duration}
                      </span>
                    </div>
                    <h5 className="text-sm font-bold text-stone-900 leading-snug">
                      {video.title}
                    </h5>
                    <p className="text-xs text-stone-600 line-clamp-2">
                      {video.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVideo(video);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Play</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {liveVideos.length > 0 && onCreateStudyFromVideo && (
              <div className="pt-2 border-t border-stone-100">
                <div className="text-xs font-semibold text-stone-700 mb-2">
                  Latest Live Upload on @jesusneverfails7649:
                </div>
                <div className="p-3.5 rounded-xl bg-[#FBF9F5] border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-stone-900 truncate">
                      {liveVideos[0].title}
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5 tabular-nums">
                      {Number(liveVideos[0].views || 0).toLocaleString()} views · @jesusneverfails7649
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isGeneratingFromVideo === liveVideos[0].videoId}
                    onClick={() => onCreateStudyFromVideo(liveVideos[0])}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-800 hover:bg-amber-900 disabled:opacity-60 text-white text-xs font-semibold whitespace-nowrap shrink-0"
                  >
                    {isGeneratingFromVideo === liveVideos[0].videoId ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>Build Study From Video</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
