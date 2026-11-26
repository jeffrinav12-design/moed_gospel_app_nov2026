import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  MonitorUp,
  Hand,
  MessageSquare,
  Users,
  PhoneOff,
  Mail,
  Copy,
  Check,
  AlertCircle,
  Volume2,
  ShieldCheck,
  RefreshCw,
  BookOpen,
  Youtube,
  ExternalLink,
  Heart,
  Loader2,
} from 'lucide-react';
import {
  GospelSession,
  FellowshipGroup,
  UserProfile,
  PrayerRequestItem,
} from '../types';
import { GoogleSignInButton } from './GoogleSignInButton';
import { fetchGmailClassEmails, GmailMessageSummary } from '../services/googleAuth';
import { safeFetchJson } from '../services/apiClient';
import {
  auth,
  subscribePrayerRequests,
  postPrayerRequest,
  incrementPrayerAmen,
} from '../services/firebaseDb';
import {
  buildChannelVideoSearchUrl,
} from '../data/gospelData';

interface OnlineMeetClassroomProps {
  currentSession: GospelSession;
  currentFellowship: FellowshipGroup;
  userProfile: UserProfile;
  currentUserGoogle?: {
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
  } | null;
  onGoogleSignInSuccess?: (user: any) => void;
  onOpenTopicQuiz?: () => void;
}

export const OnlineMeetClassroom: React.FC<OnlineMeetClassroomProps> = ({
  currentSession,
  currentFellowship,
  userProfile,
  currentUserGoogle,
  onGoogleSignInSuccess,
  onOpenTopicQuiz,
}) => {
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const [activeSidePanel, setActiveSidePanel] = useState<'gmail' | 'people' | 'chat' | null>('chat');
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequestItem[]>([]);
  const [loadingPrayers, setLoadingPrayers] = useState(true);
  const [prayerInput, setPrayerInput] = useState('');
  const [postingPrayer, setPostingPrayer] = useState(false);
  const [prayerError, setPrayerError] = useState<string | null>(null);

  const [gmailMessages, setGmailMessages] = useState<GmailMessageSummary[]>([]);
  const [loadingGmail, setLoadingGmail] = useState(false);
  const [gmailError, setGmailError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Live Prayer Wall subscription (Firestore if signed in, /api/prayer-requests otherwise)
  useEffect(() => {
    let unsub: (() => void) | null = null;
    let isMounted = true;

    async function loadServerPrayers() {
      try {
        const result = await safeFetchJson<PrayerRequestItem[]>('/api/prayer-requests');
        if (result.ok && isMounted && Array.isArray(result.data)) {
          setPrayerRequests(result.data);
        }
      } catch {
        // Ignore network errors
      } finally {
        if (isMounted) setLoadingPrayers(false);
      }
    }

    if (auth.currentUser) {
      unsub = subscribePrayerRequests(
        (items) => {
          if (isMounted) {
            setPrayerRequests(items);
            setLoadingPrayers(false);
          }
        },
        () => {
          loadServerPrayers();
        }
      );
    } else {
      loadServerPrayers();
    }

    return () => {
      isMounted = false;
      if (unsub) unsub();
    };
  }, [currentUserGoogle?.email, userProfile.uid]);

  useEffect(() => {
    let isMounted = true;

    async function initMedia() {
      try {
        setMediaError(null);
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Your browser does not support webcam or microphone device access.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 360 } },
          audio: true,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const audioCtx = new AudioContextClass();
            audioContextRef.current = audioCtx;
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64;
            source.connect(analyser);
            analyserRef.current = analyser;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const checkVolume = () => {
              if (!analyserRef.current) return;
              analyserRef.current.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const average = sum / dataArray.length;
              setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
              animFrameRef.current = requestAnimationFrame(checkVolume);
            };
            checkVolume();
          }
        } catch (audioErr) {
          console.warn('Audio analyser notice:', audioErr);
        }
      } catch (err: any) {
        if (isMounted) {
          setMediaError(
            err.name === 'NotAllowedError'
              ? 'Camera or microphone permission was blocked. You can still participate via the Live Prayer Wall and Scripture quizzes.'
              : `Unable to access local camera/mic: ${err.message}`
          );
        }
      }
    }

    initMedia();

    return () => {
      isMounted = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (currentUserGoogle?.email) {
      loadGmailFellowshipEmails();
    }
  }, [currentUserGoogle?.email]);

  const loadGmailFellowshipEmails = async () => {
    setLoadingGmail(true);
    setGmailError(null);
    try {
      const res = await fetchGmailClassEmails();
      if (res.success) {
        setGmailMessages(res.messages);
      } else {
        setGmailError(res.error || 'Unable to load Gmail fellowship messages.');
      }
    } catch (e: any) {
      setGmailError(e.message || 'Error loading Gmail messages.');
    } finally {
      setLoadingGmail(false);
    }
  };

  const toggleCamera = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
    }
    setCameraActive(!cameraActive);
  };

  const toggleMic = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
    }
    setMicActive(!micActive);
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }
      setIsScreenSharing(false);
    } else {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          screenStreamRef.current = displayStream;
          if (screenVideoRef.current) {
            screenVideoRef.current.srcObject = displayStream;
          }
          displayStream.getVideoTracks()[0].onended = () => setIsScreenSharing(false);
          setIsScreenSharing(true);
        }
      } catch (err) {
        console.warn('Screen share cancelled:', err);
      }
    }
  };

  const handlePostPrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = prayerInput.trim();
    if (!text) return;

    setPostingPrayer(true);
    setPrayerError(null);
    const authorName = currentUserGoogle?.displayName || userProfile.name || 'Gospel Partner';

    try {
      if (auth.currentUser) {
        await postPrayerRequest(authorName, text, currentSession.title);
      } else {
        const result = await safeFetchJson<PrayerRequestItem>('/api/prayer-requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            authorName,
            message: text,
            topicTitle: currentSession.title,
          }),
        });
        const created: PrayerRequestItem =
          result.ok && result.data
            ? result.data
            : {
                id: `prayer-local-${Date.now().toString(36)}`,
                authorUid: 'partner-guest',
                authorName,
                message: text,
                topicTitle: currentSession.title,
                amenCount: 0,
                createdAt: new Date().toISOString(),
              };
        setPrayerRequests((prev) => [created, ...prev]);
      }
      setPrayerInput('');
    } catch (err: any) {
      setPrayerError(err?.message || 'Unable to post prayer request.');
    } finally {
      setPostingPrayer(false);
    }
  };

  const handleAmen = async (id: string) => {
    try {
      if (auth.currentUser) {
        await incrementPrayerAmen(id);
      } else {
        setPrayerRequests((prev) =>
          prev.map((p) => (p.id === id ? { ...p, amenCount: (p.amenCount || 0) + 1 } : p))
        );
        await safeFetchJson(`/api/prayer-requests/${id}/amen`, { method: 'POST' });
      }
    } catch {
      // Ignore errors
    }
  };

  const handleCopyMeetCode = () => {
    navigator.clipboard.writeText(currentSession.googleMeetUrl || 'https://meet.google.com/jnf-grace-cross');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  return (
    <div className="bg-stone-950 text-stone-100 rounded-2xl overflow-hidden border border-stone-800 flex flex-col min-h-[640px]">
      {/* Top Fellowship Room Bar */}
      <div className="bg-stone-900 px-5 py-3 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs">
          <span className="font-bold text-sm text-white font-editorial">
            Live Prayer & Worship Room
          </span>
          <span className="text-stone-500">·</span>
          <span className="text-amber-300 font-medium">{currentSession.pillar}</span>
          <span className="text-stone-500 hidden sm:inline">·</span>
          <a
            href={buildChannelVideoSearchUrl(currentSession.title)}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 text-rose-400 hover:text-rose-300 font-medium"
          >
            <Youtube className="w-3.5 h-3.5" />
            <span>@jesusneverfails7649</span>
          </a>
        </div>

        <div className="flex items-center gap-2">
          {currentUserGoogle?.email ? (
            <div className="flex items-center gap-2 bg-stone-800 border border-stone-700 px-3 py-1 rounded-lg text-xs">
              {currentUserGoogle.photoURL ? (
                <img
                  src={currentUserGoogle.photoURL}
                  alt="Google profile"
                  className="w-4 h-4 rounded-full object-cover"
                />
              ) : (
                <span className="font-bold text-amber-300">G</span>
              )}
              <span className="text-stone-200 font-medium truncate max-w-[140px]">
                {currentUserGoogle.displayName || currentUserGoogle.email}
              </span>
            </div>
          ) : (
            <GoogleSignInButton
              label="Sync Gmail Invites"
              onSuccess={onGoogleSignInSuccess}
              className="!py-1 !px-2.5 !text-xs !bg-stone-800 !text-stone-200 !border-stone-700 hover:!bg-stone-700"
            />
          )}

          <button
            onClick={handleCopyMeetCode}
            className="flex items-center gap-1.5 text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-stone-400" />}
            <span className="font-code text-[11px]">Copy Meet Link</span>
          </button>
        </div>
      </div>

      {/* Main Arena + Side Drawer */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
          {mediaError && (
            <div className="bg-amber-950/50 border border-amber-800/60 rounded-xl p-3 text-xs text-amber-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{mediaError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            {/* Tile 1: Active Study Focus & Live Anchor Verse */}
            <div className="relative rounded-2xl overflow-hidden bg-stone-900 border border-stone-800 flex flex-col justify-between min-h-[250px]">
              <img
                src="/src/assets/images/gospel_cross_sunrise_1795279533352.jpg"
                alt="Cross at sunrise for Gospel Fellowship"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover opacity-55"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/30" />

              <div className="relative z-10 p-3 flex justify-between items-center text-xs">
                <span className="text-amber-200 font-medium">Fellowship Sanctuary · @jesusneverfails7649</span>
                <Volume2 className="w-4 h-4 text-emerald-400" />
              </div>

              <div className="relative z-10 p-5 space-y-2 mt-auto">
                <h3 className="text-lg font-bold text-white font-editorial">
                  {currentSession.title}
                </h3>
                <p className="text-xs text-stone-200 italic">
                  "{currentSession.anchorVerse}"
                </p>

                {showCaptions && (
                  <div className="bg-black/75 rounded-xl p-2.5 text-xs text-stone-100 border border-white/10">
                    <span className="text-amber-300 font-semibold">Prayer Focus: </span>
                    <span>{currentSession.prayerPoints}</span>
                  </div>
                )}

                <div className="pt-1">
                  <a
                    href={buildChannelVideoSearchUrl(currentSession.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-300 hover:text-rose-200"
                  >
                    <Youtube className="w-3.5 h-3.5" />
                    <span>Open Topic Videos on @jesusneverfails7649</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Tile 2: Local Partner Webcam & Microphone Stream */}
            <div className="relative rounded-2xl overflow-hidden bg-stone-900 border border-stone-800 flex flex-col justify-between min-h-[250px]">
              {cameraActive ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
                />
              ) : (
                <div className="absolute inset-0 bg-stone-900 flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-3xl mb-2">
                    {userProfile.avatar || '✝️'}
                  </div>
                  <span className="text-xs text-stone-400 font-medium">Camera paused</span>
                </div>
              )}

              <div className="relative z-10 p-3 flex justify-between items-center">
                <span className="text-xs bg-black/65 px-2.5 py-1 rounded-lg text-stone-200 font-medium">
                  You {currentUserGoogle?.email ? `· ${currentUserGoogle.email.split('@')[0]}` : userProfile.email ? `· ${userProfile.email.split('@')[0]}` : ''}
                </span>

                <div className="flex items-center gap-2">
                  {micActive ? (
                    <div className="flex items-center gap-1.5 bg-black/65 px-2.5 py-1 rounded-lg text-xs text-emerald-400">
                      <Mic className="w-3.5 h-3.5" />
                      <div className="w-12 h-1.5 bg-stone-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 transition-all duration-75"
                          style={{ width: `${Math.max(6, audioLevel)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-rose-700 text-white flex items-center justify-center">
                      <MicOff className="w-3.5 h-3.5" />
                    </div>
                  )}

                  {isHandRaised && (
                    <span className="px-2 py-1 rounded-lg bg-amber-500 text-stone-950 text-xs font-bold">
                      Prayer Hand Raised
                    </span>
                  )}
                </div>
              </div>

              <div className="relative z-10 p-3 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-white">
                    {currentUserGoogle?.displayName || userProfile.name}
                  </span>
                  {currentUserGoogle && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <span className="text-stone-400">{currentFellowship.name}</span>
              </div>
            </div>
          </div>

          {isScreenSharing && (
            <div className="rounded-2xl overflow-hidden bg-stone-900 border border-amber-700/50 p-2">
              <div className="flex items-center justify-between px-3 py-1.5 text-xs text-amber-200">
                <span className="font-semibold flex items-center gap-1.5">
                  <MonitorUp className="w-4 h-4" />
                  Sharing Scripture / Worship Slides
                </span>
                <button onClick={toggleScreenShare} className="text-rose-400 font-medium">
                  Stop Sharing
                </button>
              </div>
              <video
                ref={screenVideoRef}
                autoPlay
                playsInline
                className="w-full h-52 object-contain rounded-lg bg-black"
              />
            </div>
          )}

          {/* Bottom Action Row */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-stone-300">
              <Users className="w-4 h-4 text-amber-400" />
              <span>{currentFellowship.name} · Live Prayer Session</span>
            </div>

            {onOpenTopicQuiz && (
              <button
                onClick={onOpenTopicQuiz}
                className="text-xs bg-amber-700 hover:bg-amber-800 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Open Fellowship Scripture Quiz</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Side Panel: Live Prayer Wall / Gmail Invites / Partner */}
        {activeSidePanel && (
          <div className="w-full lg:w-80 bg-stone-900 border-t lg:border-t-0 lg:border-l border-stone-800 flex flex-col shrink-0">
            <div className="flex items-center border-b border-stone-800 text-xs">
              <button
                onClick={() => setActiveSidePanel('chat')}
                className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 font-medium border-b-2 transition-colors ${
                  activeSidePanel === 'chat'
                    ? 'border-amber-500 text-amber-300'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Prayer Wall</span>
              </button>
              <button
                onClick={() => setActiveSidePanel('gmail')}
                className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 font-medium border-b-2 transition-colors ${
                  activeSidePanel === 'gmail'
                    ? 'border-amber-500 text-amber-300'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Gmail</span>
              </button>
              <button
                onClick={() => setActiveSidePanel('people')}
                className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 font-medium border-b-2 transition-colors ${
                  activeSidePanel === 'people'
                    ? 'border-amber-500 text-amber-300'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Partners</span>
              </button>
            </div>

            {activeSidePanel === 'chat' && (
              <div className="flex-1 flex flex-col p-4 overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                  {loadingPrayers ? (
                    <div className="py-8 text-center text-stone-400 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading Live Prayer Wall...</span>
                    </div>
                  ) : prayerRequests.length === 0 ? (
                    <div className="py-8 px-3 text-center text-stone-400 space-y-1">
                      <p className="font-semibold text-stone-300">Live Prayer Wall is Ready</p>
                      <p className="text-[11px]">
                        Post a prayer request or praise report below for Gospel Partners to agree with in prayer.
                      </p>
                    </div>
                  ) : (
                    prayerRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-3 rounded-xl border bg-stone-950 border-stone-800 text-stone-200 space-y-2"
                      >
                        <div className="flex items-center justify-between text-[10px] text-stone-400">
                          <span className="font-semibold text-amber-300">{req.authorName}</span>
                          <span>
                            {req.createdAt
                              ? new Date(req.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </span>
                        </div>
                        <p className="leading-relaxed">{req.message}</p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-stone-500 truncate max-w-[140px]">
                            {req.topicTitle || currentSession.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAmen(req.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-rose-300 text-[11px] font-semibold tabular-nums transition-colors"
                          >
                            <Heart className="w-3 h-3" />
                            <span>Amen ({req.amenCount || 0})</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {prayerError && (
                  <p className="text-[11px] text-rose-400 mt-2">{prayerError}</p>
                )}

                <form onSubmit={handlePostPrayer} className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={prayerInput}
                    onChange={(e) => setPrayerInput(e.target.value)}
                    placeholder="Share a live prayer request..."
                    className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-600"
                  />
                  <button
                    type="submit"
                    disabled={postingPrayer || !prayerInput.trim()}
                    className="bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white px-3 py-2 rounded-xl text-xs font-semibold"
                  >
                    {postingPrayer ? '...' : 'Post'}
                  </button>
                </form>
              </div>
            )}

            {activeSidePanel === 'gmail' && (
              <div className="p-4 flex-1 overflow-y-auto space-y-4">
                <div className="bg-stone-950 border border-stone-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Gmail Fellowship Invites</span>
                    {currentUserGoogle?.email && (
                      <button
                        onClick={loadGmailFellowshipEmails}
                        disabled={loadingGmail}
                        className="text-stone-400 hover:text-white p-1"
                        title="Refresh Gmail invites"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loadingGmail ? 'animate-spin' : ''}`} />
                      </button>
                    )}
                  </div>

                  {!currentUserGoogle?.email ? (
                    <div className="space-y-2.5">
                      <p className="text-[11px] text-stone-400">
                        Sign in with your Gmail account to view prayer meeting invites and ministry notices.
                      </p>
                      <GoogleSignInButton
                        label="Sign in with Gmail"
                        onSuccess={onGoogleSignInSuccess}
                        className="w-full justify-center"
                      />
                    </div>
                  ) : (
                    <div className="text-[11px] text-emerald-400 truncate">
                      Connected: {currentUserGoogle.email}
                    </div>
                  )}
                </div>

                {loadingGmail && (
                  <div className="text-center text-xs text-stone-400 py-4">
                    Loading fellowship emails...
                  </div>
                )}

                {gmailError && (
                  <div className="bg-rose-950/40 border border-rose-800/50 rounded-lg p-2.5 text-[11px] text-rose-300">
                    {gmailError}
                  </div>
                )}

                {!loadingGmail && gmailMessages.length === 0 && currentUserGoogle?.email && !gmailError && (
                  <div className="text-center text-xs text-stone-400 py-4">
                    No recent Gospel fellowship emails found.
                  </div>
                )}

                {!loadingGmail &&
                  gmailMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="bg-stone-950 border border-stone-800 rounded-xl p-3 space-y-1"
                    >
                      <div className="text-xs font-semibold text-white truncate">
                        {msg.subject || 'Prayer Fellowship Notice'}
                      </div>
                      <p className="text-[11px] text-stone-400 line-clamp-2">{msg.snippet}</p>
                      <div className="text-[10px] text-stone-500 truncate">
                        From: {msg.from || 'Jesus Never Fail Ministries'}
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {activeSidePanel === 'people' && (
              <div className="p-4 flex-1 overflow-y-auto space-y-3 text-xs">
                <div className="text-[11px] font-semibold text-stone-400">
                  Active Partner in Room
                </div>
                <div className="p-3 rounded-xl bg-stone-950 border border-amber-800/50 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">
                      {currentUserGoogle?.displayName || userProfile.name} (You)
                    </div>
                    <div className="text-[10px] text-stone-400">
                      {currentUserGoogle?.email || userProfile.email || 'Active Fellowship Partner'}
                    </div>
                  </div>
                  {micActive ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5 text-rose-400" />}
                </div>

                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="font-semibold text-white">Invite Gospel Partners</div>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    Share this fellowship room link with prayer partners or launch Google Meet directly.
                  </p>
                  <button
                    onClick={handleCopyMeetCode}
                    className="w-full py-2 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold flex items-center justify-center gap-1.5"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Meet Link Copied' : 'Copy Fellowship Invite Link'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="bg-stone-900 px-4 py-3 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3">
        <div className="hidden sm:block text-xs text-stone-400">
          {currentFellowship.name} · {currentSession.scriptureBook}
        </div>

        <div className="flex items-center gap-2.5 mx-auto">
          <button
            onClick={toggleMic}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
              micActive ? 'bg-stone-800 hover:bg-stone-700 text-white' : 'bg-rose-700 text-white'
            }`}
            title={micActive ? 'Mute microphone' : 'Unmute microphone'}
          >
            {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleCamera}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
              cameraActive ? 'bg-stone-800 hover:bg-stone-700 text-white' : 'bg-rose-700 text-white'
            }`}
            title={cameraActive ? 'Pause camera' : 'Enable camera'}
          >
            {cameraActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
              isScreenSharing ? 'bg-amber-700 text-white' : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
            }`}
            title="Share Bible verses or worship screen"
          >
            <MonitorUp className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsHandRaised(!isHandRaised)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
              isHandRaised ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
            }`}
            title="Raise hand for prayer"
          >
            <Hand className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowCaptions(!showCaptions)}
            className={`w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold font-code ${
              showCaptions ? 'bg-stone-700 text-amber-300' : 'bg-stone-800 text-stone-400'
            }`}
            title="Toggle Live Scripture Captions"
          >
            CC
          </button>

          <button
            onClick={() => {
              if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
              setCameraActive(false);
              setMicActive(false);
            }}
            className="w-11 h-11 rounded-full bg-rose-700 hover:bg-rose-800 text-white flex items-center justify-center"
            title="Leave Prayer Room"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveSidePanel(activeSidePanel === 'chat' ? null : 'chat')}
            className={`p-2.5 rounded-lg ${activeSidePanel === 'chat' ? 'bg-amber-700 text-white' : 'text-stone-400 hover:bg-stone-800'}`}
            title="Live Prayer Wall"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveSidePanel(activeSidePanel === 'gmail' ? null : 'gmail')}
            className={`p-2.5 rounded-lg ${activeSidePanel === 'gmail' ? 'bg-amber-700 text-white' : 'text-stone-400 hover:bg-stone-800'}`}
            title="Gmail Fellowship Invites"
          >
            <Mail className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveSidePanel(activeSidePanel === 'people' ? null : 'people')}
            className={`p-2.5 rounded-lg ${activeSidePanel === 'people' ? 'bg-amber-700 text-white' : 'text-stone-400 hover:bg-stone-800'}`}
            title="Active Partner"
          >
            <Users className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
