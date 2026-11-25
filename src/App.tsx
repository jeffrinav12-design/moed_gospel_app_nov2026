import React, { useState, useEffect, useCallback } from 'react';
import {
  Share2,
  Check,
  Printer,
  Youtube,
  ExternalLink,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react';
import {
  GospelSession,
  UserProfile,
  FellowshipGroup,
  LiveYouTubeVideo,
  TopicProgressItem,
  CustomBiblicalCard,
  BookReleaseItem,
} from './types';
import { INITIAL_SESSIONS, INITIAL_BATCHES } from './data/defaultSessions';
import { buildChannelVideoSearchUrl } from './data/gospelData';
import {
  JESUS_NEVER_FAILS_HANDLE,
  MINISTRY_SOCIAL_LINKS,
  JEFFRINA_PROFESSION_LINKS,
} from './data/ministryLinks';
import { WelcomeHero } from './components/WelcomeHero';
import { ClassroomHeader } from './components/ClassroomHeader';
import {
  HamburgerMenuDrawer,
  MOED_HAMBURGER_GROUPS,
} from './components/HamburgerMenuDrawer';
import { AIPrototypeStudio } from './components/AIPrototypeStudio';
import { KahootQuizArena } from './components/KahootQuizArena';
import { FlashcardsDeck } from './components/FlashcardsDeck';
import { DefinitionsGlossary } from './components/DefinitionsGlossary';
import { WritingWorksLab } from './components/WritingWorksLab';
import { StudyNotesAndWhiteboard } from './components/StudyNotesAndWhiteboard';
import { LiveClassChat } from './components/LiveClassChat';
import { FellowshipGroupsManager } from './components/FellowshipGroupsManager';
import { PrintableNotesPDF } from './components/PrintableNotesPDF';
import { AssertionReasonLab } from './components/AssertionReasonLab';
import { CaseBasedExplorer } from './components/CaseBasedExplorer';
import { GiveReasonDesk } from './components/GiveReasonDesk';
import { DifferentiationMatrix } from './components/DifferentiationMatrix';
import { ShortLongAnswerDesk } from './components/ShortLongAnswerDesk';
import { GospelChannelBrowser } from './components/GospelChannelBrowser';
import { ProgressDashboard } from './components/ProgressDashboard';
import { OnlineMeetClassroom } from './components/OnlineMeetClassroom';
import { BibleReaderStudio } from './components/BibleReaderStudio';
import { HebrewLearningPage } from './components/HebrewLearningPage';
import { GreekLearningPage } from './components/GreekLearningPage';
import { RabbiHistoryPage } from './components/RabbiHistoryPage';
import { BibleStoriesAndCardsHub } from './components/BibleStoriesAndCardsHub';
import { NewSongsAndConnectHub } from './components/NewSongsAndConnectHub';
import { initAuth, logout } from './services/googleAuth';
import {
  auth,
  testFirestoreConnection,
  savePartnerProfile,
  fetchPartnerProfile,
  subscribeTopicProgress,
  saveTopicProgress,
  subscribeFellowships,
  createFellowshipInDb,
  subscribeCustomCards,
  saveCustomCard,
  deleteCustomCard,
  subscribeBookReleases,
  saveBookRelease,
  deleteBookRelease,
} from './services/firebaseDb';

type NavigationPage =
  | 'bible-reader'
  | 'hebrew-academy'
  | 'greek-academy'
  | 'rabbi-studies'
  | 'bible-stories'
  | 'biblical-cards'
  | 'card-editor'
  | 'new-songs'
  | 'book-releases'
  | 'socials-connect'
  | 'curriculum'
  | 'kahoot'
  | 'ar-lab'
  | 'case-study'
  | 'give-reason'
  | 'diff-matrix'
  | 'subjective'
  | 'flashcards'
  | 'definitions'
  | 'writing'
  | 'notes'
  | 'chat'
  | 'studio'
  | 'online-class'
  | 'dashboard'
  | 'batches';

type ProgressTaskKey =
  | 'quizDone'
  | 'arDone'
  | 'cbqDone'
  | 'giveReasonDone'
  | 'diffDone'
  | 'subjectiveDone';

const LOCAL_PROGRESS_KEY = 'moed_live_gospel_progress';
const LOCAL_CARDS_KEY = 'moed_custom_biblical_cards';
const LOCAL_BOOKS_KEY = 'moed_gospel_book_releases';
const LOCAL_BIBLE_LANG_KEY = 'moed_preferred_bible_lang';

const FLAT_PAGES = MOED_HAMBURGER_GROUPS.flatMap((g) => g.items);

const STUDY_MODULE_PAGES: NavigationPage[] = [
  'curriculum',
  'kahoot',
  'ar-lab',
  'case-study',
  'give-reason',
  'diff-matrix',
  'subjective',
  'flashcards',
  'definitions',
  'writing',
  'notes',
  'chat',
  'studio',
];

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [currentUserGoogle, setCurrentUserGoogle] = useState<{
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
  } | null>(null);

  const [sessions, setSessions] = useState<GospelSession[]>(INITIAL_SESSIONS);
  const [currentSessionId, setCurrentSessionId] = useState<string>(INITIAL_SESSIONS[0].id);

  const [fellowships, setFellowships] = useState<FellowshipGroup[]>(INITIAL_BATCHES);
  const [currentFellowshipId, setCurrentFellowshipId] = useState<string>(INITIAL_BATCHES[0].id);

  const [customCards, setCustomCards] = useState<CustomBiblicalCard[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_CARDS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [incomingCardDraft, setIncomingCardDraft] = useState<Partial<CustomBiblicalCard> | null>(
    null
  );

  const [bookReleases, setBookReleases] = useState<BookReleaseItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_BOOKS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [preferredBibleLanguage, setPreferredBibleLanguage] = useState<string>(() => {
    try {
      return localStorage.getItem(LOCAL_BIBLE_LANG_KEY) || 'en';
    } catch {
      return 'en';
    }
  });

  const [liveVideos, setLiveVideos] = useState<LiveYouTubeVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState<boolean>(true);
  const [isGeneratingFromVideo, setIsGeneratingFromVideo] = useState<string | null>(null);
  const [statusBannerError, setStatusBannerError] = useState<string | null>(null);

  const [topicProgress, setTopicProgress] = useState<Record<string, TopicProgressItem>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_PROGRESS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  const [activePage, setActivePage] = useState<NavigationPage>('bible-reader');
  const [copiedLinkNotification, setCopiedLinkNotification] = useState(false);

  const navigateToPage = (pageId: string) => {
    setActivePage(pageId as NavigationPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchLiveVideos = useCallback(async (forceRefresh = false) => {
    setLoadingVideos(true);
    try {
      const url = forceRefresh ? '/api/youtube/videos?refresh=true' : '/api/youtube/videos';
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data?.videos)) {
        setLiveVideos(data.videos);
      }
    } catch (err) {
      console.warn('Could not fetch live YouTube videos:', err);
    } finally {
      setLoadingVideos(false);
    }
  }, []);

  useEffect(() => {
    testFirestoreConnection();
    fetchLiveVideos(false);

    const searchParams = new URLSearchParams(window.location.search);
    const sessionParam = searchParams.get('session');
    const roleParam = searchParams.get('role');

    if (sessionParam) {
      const existing = sessions.find((s) => s.id === sessionParam);
      if (existing) {
        setCurrentSessionId(existing.id);
        setUserProfile({
          name: 'Gospel Partner',
          role: roleParam === 'pastor' ? 'pastor' : 'believer',
          pillar: existing.pillar,
          avatar: '✝️',
          authProvider: 'guest',
          preferredBibleLanguage,
        });
        setActivePage('curriculum');
      }
    }

    fetch('/api/sessions')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSessions((prev) => {
            const map = new Map<string, GospelSession>();
            prev.forEach((s) => map.set(s.id, s));
            data.forEach((s: GospelSession) => {
              if (s && s.id && s.pillar) map.set(s.id, s);
            });
            return Array.from(map.values());
          });
        }
      })
      .catch(() => {});

    fetch('/api/fellowships')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setFellowships((prev) => {
            const map = new Map<string, FellowshipGroup>();
            prev.forEach((f) => map.set(f.id, f));
            data.forEach((f: FellowshipGroup) => {
              if (f && f.id && f.name) map.set(f.id, f);
            });
            return Array.from(map.values());
          });
        }
      })
      .catch(() => {});

    fetch('/api/custom-templates')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCustomCards((prev) => {
            const map = new Map<string, CustomBiblicalCard>();
            prev.forEach((c) => map.set(c.cardId, c));
            data.forEach((c: CustomBiblicalCard) => {
              if (c && c.cardId) map.set(c.cardId, c);
            });
            return Array.from(map.values());
          });
        }
      })
      .catch(() => {});

    fetch('/api/book-releases')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBookReleases((prev) => {
            const map = new Map<string, BookReleaseItem>();
            prev.forEach((b) => map.set(b.bookId, b));
            data.forEach((b: BookReleaseItem) => {
              if (b && b.bookId) map.set(b.bookId, b);
            });
            return Array.from(map.values());
          });
        }
      })
      .catch(() => {});

    let unsubProgress: (() => void) | null = null;
    let unsubFellowships: (() => void) | null = null;
    let unsubCards: (() => void) | null = null;
    const unsubBooks = subscribeBookReleases((dbBooks) => {
      if (dbBooks.length > 0) {
        setBookReleases((prev) => {
          const map = new Map<string, BookReleaseItem>();
          prev.forEach((b) => map.set(b.bookId, b));
          dbBooks.forEach((b) => map.set(b.bookId, b));
          return Array.from(map.values());
        });
      }
    });

    const unsubscribeAuth = initAuth(async (user) => {
      if (user) {
        setCurrentUserGoogle({
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        });

        try {
          const remoteProfile = await fetchPartnerProfile(user.uid);
          if (remoteProfile?.preferredBibleLanguage) {
            setPreferredBibleLanguage(remoteProfile.preferredBibleLanguage);
          }
          setUserProfile((prev) => {
            const merged: UserProfile = {
              uid: user.uid,
              email: user.email || remoteProfile?.email || prev?.email,
              name:
                remoteProfile?.name ||
                user.displayName ||
                prev?.name ||
                user.email?.split('@')[0] ||
                'Gospel Partner',
              role: remoteProfile?.role || prev?.role || 'believer',
              pillar: remoteProfile?.pillar || prev?.pillar || 'Salvation & Grace',
              avatar: remoteProfile?.avatar || prev?.avatar || '✝️',
              authProvider: user.providerData?.some((p) => p.providerId === 'password')
                ? 'email'
                : 'google',
              preferredBibleLanguage:
                remoteProfile?.preferredBibleLanguage ||
                prev?.preferredBibleLanguage ||
                preferredBibleLanguage,
            };
            return merged;
          });
        } catch {}

        if (unsubProgress) unsubProgress();
        unsubProgress = subscribeTopicProgress(user.uid, (progressMap) => {
          setTopicProgress((prev) => ({ ...prev, ...progressMap }));
        });

        if (unsubFellowships) unsubFellowships();
        unsubFellowships = subscribeFellowships((dbGroups) => {
          if (dbGroups.length > 0) {
            setFellowships((prev) => {
              const map = new Map<string, FellowshipGroup>();
              prev.forEach((f) => map.set(f.id, f));
              dbGroups.forEach((g) => map.set(g.id, g));
              return Array.from(map.values());
            });
          }
        });

        if (unsubCards) unsubCards();
        unsubCards = subscribeCustomCards(user.uid, (dbCards) => {
          if (dbCards.length > 0) {
            setCustomCards((prev) => {
              const map = new Map<string, CustomBiblicalCard>();
              prev.forEach((c) => map.set(c.cardId, c));
              dbCards.forEach((c) => map.set(c.cardId, c));
              return Array.from(map.values());
            });
          }
        });
      } else {
        setCurrentUserGoogle(null);
        if (unsubProgress) {
          unsubProgress();
          unsubProgress = null;
        }
        if (unsubFellowships) {
          unsubFellowships();
          unsubFellowships = null;
        }
        if (unsubCards) {
          unsubCards();
          unsubCards = null;
        }
      }
    });

    return () => {
      if (typeof unsubscribeAuth === 'function') unsubscribeAuth();
      if (unsubProgress) unsubProgress();
      if (unsubFellowships) unsubFellowships();
      if (unsubCards) unsubCards();
      if (unsubBooks) unsubBooks();
    };
  }, [fetchLiveVideos]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(topicProgress));
    } catch {}
  }, [topicProgress]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_CARDS_KEY, JSON.stringify(customCards));
    } catch {}
  }, [customCards]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_BOOKS_KEY, JSON.stringify(bookReleases));
    } catch {}
  }, [bookReleases]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_BIBLE_LANG_KEY, preferredBibleLanguage);
    } catch {}
  }, [preferredBibleLanguage]);

  const handleChangeBibleLanguage = (langCode: string) => {
    setPreferredBibleLanguage(langCode);
    if (userProfile) {
      const updated = { ...userProfile, preferredBibleLanguage: langCode };
      setUserProfile(updated);
      if (auth.currentUser && userProfile.uid) {
        savePartnerProfile(userProfile.uid, updated).catch(() => {});
      }
    }
  };

  const handleUpdateReaderName = (newName: string) => {
    if (!userProfile) return;
    const updated = { ...userProfile, name: newName };
    setUserProfile(updated);
    if (auth.currentUser && userProfile.uid) {
      savePartnerProfile(userProfile.uid, updated).catch(() => {});
    }
  };

  const handleGoogleSignInSuccess = async (user: any) => {
    setCurrentUserGoogle({
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
    });
    if (userProfile) {
      const updated: UserProfile = {
        ...userProfile,
        uid: user.uid,
        email: user.email || userProfile.email,
        name: user.displayName || userProfile.name,
        authProvider: 'google',
        preferredBibleLanguage,
      };
      setUserProfile(updated);
      if (auth.currentUser) {
        savePartnerProfile(user.uid, updated).catch(() => {});
      }
    }
  };

  const handleSaveCustomCard = async (card: CustomBiblicalCard) => {
    setCustomCards((prev) => [card, ...prev.filter((c) => c.cardId !== card.cardId)]);
    if (auth.currentUser) {
      await saveCustomCard(auth.currentUser.uid, card).catch(() => {});
    }
    fetch('/api/custom-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card),
    }).catch(() => {});
  };

  const handleDeleteCustomCard = async (cardId: string) => {
    setCustomCards((prev) => prev.filter((c) => c.cardId !== cardId));
    if (auth.currentUser) {
      await deleteCustomCard(auth.currentUser.uid, cardId).catch(() => {});
    }
    fetch(`/api/custom-templates/${encodeURIComponent(cardId)}`, {
      method: 'DELETE',
    }).catch(() => {});
  };

  const handleSaveBookRelease = async (book: BookReleaseItem) => {
    setBookReleases((prev) => [book, ...prev.filter((b) => b.bookId !== book.bookId)]);
    if (auth.currentUser) {
      await saveBookRelease(book).catch(() => {});
    }
    fetch('/api/book-releases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book),
    }).catch(() => {});
  };

  const handleDeleteBookRelease = async (bookId: string) => {
    setBookReleases((prev) => prev.filter((b) => b.bookId !== bookId));
    if (auth.currentUser) {
      await deleteBookRelease(bookId).catch(() => {});
    }
    fetch(`/api/book-releases/${encodeURIComponent(bookId)}`, {
      method: 'DELETE',
    }).catch(() => {});
  };

  const handleToggleTask = async (sessionId: string, taskKey: ProgressTaskKey) => {
    const existing = topicProgress[sessionId] || {
      uid: userProfile?.uid || 'local',
      sessionId,
      quizDone: false,
      arDone: false,
      cbqDone: false,
      giveReasonDone: false,
      diffDone: false,
      subjectiveDone: false,
    };
    const nextValue = !existing[taskKey];
    const updatedItem: TopicProgressItem = {
      ...existing,
      [taskKey]: nextValue,
      updatedAt: new Date().toISOString(),
    };
    setTopicProgress((prev) => ({ ...prev, [sessionId]: updatedItem }));

    if (auth.currentUser) {
      saveTopicProgress(auth.currentUser.uid, sessionId, { [taskKey]: nextValue }).catch(() => {});
    }
  };

  const handleMarkTaskComplete = async (
    sessionId: string,
    taskKey: ProgressTaskKey,
    extra?: { quizScore?: number }
  ) => {
    const existing = topicProgress[sessionId] || {
      uid: userProfile?.uid || 'local',
      sessionId,
      quizDone: false,
      arDone: false,
      cbqDone: false,
      giveReasonDone: false,
      diffDone: false,
      subjectiveDone: false,
    };
    const updatedItem: TopicProgressItem = {
      ...existing,
      [taskKey]: true,
      ...(extra?.quizScore !== undefined ? { quizScore: extra.quizScore } : {}),
      updatedAt: new Date().toISOString(),
    };
    setTopicProgress((prev) => ({ ...prev, [sessionId]: updatedItem }));

    if (auth.currentUser) {
      saveTopicProgress(auth.currentUser.uid, sessionId, {
        [taskKey]: true,
        ...(extra?.quizScore !== undefined ? { quizScore: extra.quizScore } : {}),
      }).catch(() => {});
    }
  };

  const currentSession = sessions.find((s) => s.id === currentSessionId) || sessions[0];
  const currentFellowship =
    fellowships.find((f) => f.id === currentFellowshipId) || fellowships[0];

  const handleStartSession = async (
    profile: UserProfile,
    targetSessionId?: string,
    targetPageId?: string
  ) => {
    if (profile.preferredBibleLanguage) {
      setPreferredBibleLanguage(profile.preferredBibleLanguage);
    }
    setUserProfile(profile);

    if (profile.uid && auth.currentUser) {
      savePartnerProfile(profile.uid, profile).catch(() => {});
    }

    if (targetPageId) {
      navigateToPage(targetPageId);
      return;
    }

    if (targetSessionId) {
      setCurrentSessionId(targetSessionId);
      navigateToPage('curriculum');
    } else {
      const matchedSession = sessions.find((s) => s.pillar === profile.pillar);
      if (matchedSession) {
        setCurrentSessionId(matchedSession.id);
      }
      navigateToPage(profile.role === 'pastor' ? 'studio' : 'bible-reader');
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch {}
    setUserProfile(null);
    setCurrentUserGoogle(null);
  };

  const handleSessionCreated = (newSession: GospelSession) => {
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    navigateToPage('curriculum');
  };

  const handleCreateStudyFromVideo = async (video: LiveYouTubeVideo) => {
    setIsGeneratingFromVideo(video.videoId);
    setStatusBannerError(null);
    try {
      const res = await fetch('/api/generate-gospel-module', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: video.title,
          pillar: userProfile?.pillar || 'Faith & Miracles',
          scriptureBook: 'Holy Bible & @jesusneverfails7649',
          fellowshipName: currentFellowship?.name || 'Jesus Never Fail Ministries Partners',
          prompt: `Create a deeply engaging Gospel study and quiz inspired by this live upload from @jesusneverfails7649: "${video.title}". Description: ${video.description || 'Jesus Christ never fails those who trust in Him.'}`,
          sourceVideoId: video.videoId,
          sourceVideoTitle: video.title,
          sourceVideoUrl: video.url,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.session) {
        throw new Error(data?.error || 'Could not generate Gospel study from video.');
      }
      setSessions((prev) => [data.session, ...prev]);
      setCurrentSessionId(data.session.id);
      navigateToPage('kahoot');
    } catch (err: any) {
      setStatusBannerError(
        err?.message || 'Unable to generate an interactive Gospel study from that video right now.'
      );
    } finally {
      setIsGeneratingFromVideo(null);
    }
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  const handleSelectFellowship = (fellowship: FellowshipGroup) => {
    setCurrentFellowshipId(fellowship.id);
    if (fellowship.currentSessionId) {
      const sess = sessions.find((s) => s.id === fellowship.currentSessionId);
      if (sess) {
        setCurrentSessionId(sess.id);
      }
    }
  };

  const handleAddFellowship = async (newFellowship: FellowshipGroup) => {
    setFellowships((prev) => [newFellowship, ...prev]);
    setCurrentFellowshipId(newFellowship.id);

    if (auth.currentUser) {
      createFellowshipInDb(newFellowship).catch(() => {});
    } else {
      fetch('/api/fellowships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFellowship),
      }).catch(() => {});
    }
  };

  const handleCopyShareLink = () => {
    const url = new URL(window.location.origin);
    url.searchParams.set('session', currentSession.id);
    navigator.clipboard.writeText(url.toString());
    setCopiedLinkNotification(true);
    setTimeout(() => setCopiedLinkNotification(false), 2500);
  };

  if (!userProfile) {
    return (
      <WelcomeHero
        onGetStarted={handleStartSession}
        availableSessions={sessions}
      />
    );
  }

  const currentPageIndex = FLAT_PAGES.findIndex((p) => p.id === activePage);
  const currentPageMeta = FLAT_PAGES[currentPageIndex] || FLAT_PAGES[0];
  const prevPage =
    FLAT_PAGES[(currentPageIndex - 1 + FLAT_PAGES.length) % FLAT_PAGES.length];
  const nextPage = FLAT_PAGES[(currentPageIndex + 1) % FLAT_PAGES.length];
  const isStudyModulePage = STUDY_MODULE_PAGES.includes(activePage);
  const activeTopicSearchUrl = buildChannelVideoSearchUrl(currentSession.title);

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-stone-900 flex flex-col font-sans-ui">
      {/* Universal Hamburger Drawer */}
      <HamburgerMenuDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activePageId={activePage}
        onSelectPage={navigateToPage}
        userProfile={userProfile}
        onReturnWelcome={() => setUserProfile(null)}
        onSignOut={handleSignOut}
      />

      {/* Top Hamburger Header */}
      <div className="print:hidden">
        <ClassroomHeader
          userProfile={userProfile}
          currentSession={currentSession}
          currentFellowship={currentFellowship}
          fellowships={fellowships}
          onSelectFellowship={handleSelectFellowship}
          onToggleRole={() =>
            setUserProfile((prev) =>
              prev ? { ...prev, role: prev.role === 'pastor' ? 'believer' : 'pastor' } : null
            )
          }
          onExitToLanding={() => setUserProfile(null)}
          onSignOut={handleSignOut}
          onNavigateToTab={navigateToPage}
          activePageTitle={currentPageMeta.label}
          onOpenMenu={() => setDrawerOpen(true)}
          currentUserGoogle={currentUserGoogle}
          onGoogleSignInSuccess={handleGoogleSignInSuccess}
        />
      </div>

      {/* Responsive One-by-One Page Canvas (Android · Tablet · Laptop · Smart TV) */}
      <main className="flex-1 max-w-7xl 2xl:max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6 print:p-0">
        {statusBannerError && (
          <div className="print:hidden bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-xs text-rose-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
              <span>{statusBannerError}</span>
            </div>
            <button
              onClick={() => setStatusBannerError(null)}
              className="text-rose-700 hover:text-rose-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Active Study Topic Selector Banner ONLY on Gospel Study Tool Pages */}
        {isStudyModulePage && (
          <div className="print:hidden bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
              <a
                href={activeTopicSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Watch topic sermon on @jesusneverfails7649"
                className="w-11 h-11 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 flex items-center justify-center shrink-0 transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>

              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  {currentPageMeta.label}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <select
                    aria-label="Switch Gospel study topic"
                    value={currentSession.id}
                    onChange={(e) => handleSelectSession(e.target.value)}
                    className="bg-[#FBF9F5] border border-stone-200 rounded-xl px-3 py-1.5 text-sm sm:text-base font-bold text-stone-900 font-editorial focus:outline-none focus:border-stone-800 max-w-full"
                  >
                    {sessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <a
                href={activeTopicSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[40px] text-xs bg-rose-700 hover:bg-rose-800 text-white font-semibold px-3 py-2 rounded-xl inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Youtube className="w-3.5 h-3.5" />
                <span>YouTube Sermon</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                type="button"
                onClick={handleCopyShareLink}
                className="min-h-[40px] text-xs bg-[#FBF9F5] hover:bg-stone-100 text-stone-700 border border-stone-200 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors font-medium whitespace-nowrap"
              >
                {copiedLinkNotification ? (
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                ) : (
                  <Share2 className="w-3.5 h-3.5 text-amber-700" />
                )}
                <span>{copiedLinkNotification ? 'Copied' : 'Share'}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="min-h-[40px] text-xs bg-[#FBF9F5] hover:bg-stone-100 text-stone-700 border border-stone-200 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors font-medium whitespace-nowrap"
              >
                <Printer className="w-3.5 h-3.5 text-stone-600" />
                <span>PDF</span>
              </button>
            </div>
          </div>
        )}

        {/* ONE-BY-ONE DEDICATED PAGES */}
        <div className="print:hidden">
          {activePage === 'bible-reader' && (
            <BibleReaderStudio
              userName={userProfile.name}
              preferredLanguage={preferredBibleLanguage}
              onChangeLanguage={handleChangeBibleLanguage}
              onUpdateReaderName={handleUpdateReaderName}
              onSaveVerseAsCard={(draft) => {
                setIncomingCardDraft(draft);
                navigateToPage('card-editor');
              }}
            />
          )}

          {activePage === 'hebrew-academy' && (
            <HebrewLearningPage
              onOpenBibleReader={() => navigateToPage('bible-reader')}
              onOpenGreekAcademy={() => navigateToPage('greek-academy')}
              onOpenRabbiStudies={() => navigateToPage('rabbi-studies')}
            />
          )}

          {activePage === 'greek-academy' && (
            <GreekLearningPage
              onOpenBibleReader={() => navigateToPage('bible-reader')}
              onOpenHebrewAcademy={() => navigateToPage('hebrew-academy')}
              onOpenRabbiStudies={() => navigateToPage('rabbi-studies')}
            />
          )}

          {activePage === 'rabbi-studies' && (
            <RabbiHistoryPage
              onOpenBibleReader={() => navigateToPage('bible-reader')}
              onOpenHebrewAcademy={() => navigateToPage('hebrew-academy')}
              onOpenGreekAcademy={() => navigateToPage('greek-academy')}
            />
          )}

          {activePage === 'bible-stories' && (
            <BibleStoriesAndCardsHub
              customCards={customCards}
              onSaveCard={handleSaveCustomCard}
              onDeleteCard={handleDeleteCustomCard}
              initialMode="stories"
              hideInternalTabs
            />
          )}

          {activePage === 'biblical-cards' && (
            <BibleStoriesAndCardsHub
              customCards={customCards}
              onSaveCard={handleSaveCustomCard}
              onDeleteCard={handleDeleteCustomCard}
              initialMode="cards"
              hideInternalTabs
            />
          )}

          {activePage === 'card-editor' && (
            <BibleStoriesAndCardsHub
              customCards={customCards}
              onSaveCard={handleSaveCustomCard}
              onDeleteCard={handleDeleteCustomCard}
              incomingDraft={incomingCardDraft}
              onClearIncomingDraft={() => setIncomingCardDraft(null)}
              initialMode="editor"
              hideInternalTabs
            />
          )}

          {activePage === 'new-songs' && (
            <NewSongsAndConnectHub
              liveVideos={liveVideos}
              sectionFocus="songs"
            />
          )}

          {activePage === 'book-releases' && (
            <NewSongsAndConnectHub
              liveVideos={liveVideos}
              bookReleases={bookReleases}
              onSaveBookRelease={handleSaveBookRelease}
              onDeleteBookRelease={handleDeleteBookRelease}
              sectionFocus="books"
            />
          )}

          {activePage === 'socials-connect' && (
            <NewSongsAndConnectHub
              liveVideos={liveVideos}
              sectionFocus="socials"
            />
          )}

          {activePage === 'curriculum' && (
            <GospelChannelBrowser
              sessions={sessions}
              currentSessionId={currentSession.id}
              onSelectSession={handleSelectSession}
              onNavigateToTab={navigateToPage}
              liveVideos={liveVideos}
              loadingVideos={loadingVideos}
              onRefreshVideos={() => fetchLiveVideos(true)}
              onCreateStudyFromVideo={handleCreateStudyFromVideo}
              isGeneratingFromVideo={isGeneratingFromVideo}
            />
          )}

          {activePage === 'ar-lab' && (
            <AssertionReasonLab
              questions={currentSession.assertionReasons}
              topicTitle={currentSession.title}
              bookReference={`${currentSession.scriptureBook} · ${currentSession.channelReference}`}
            />
          )}

          {activePage === 'case-study' && (
            <CaseBasedExplorer
              questions={currentSession.caseBasedQuestions}
              topicTitle={currentSession.title}
              bookReference={`${currentSession.scriptureBook} · ${currentSession.channelReference}`}
            />
          )}

          {activePage === 'give-reason' && (
            <GiveReasonDesk
              questions={currentSession.giveReasons}
              topicTitle={currentSession.title}
              bookReference={`${currentSession.scriptureBook} · ${currentSession.channelReference}`}
            />
          )}

          {activePage === 'diff-matrix' && (
            <DifferentiationMatrix
              items={currentSession.differentiations}
              topicTitle={currentSession.title}
              bookReference={`${currentSession.scriptureBook} · ${currentSession.channelReference}`}
            />
          )}

          {activePage === 'subjective' && (
            <ShortLongAnswerDesk
              shortAnswers={currentSession.shortAnswers}
              longAnswers={currentSession.longAnswers}
              topicTitle={currentSession.title}
              bookReference={`${currentSession.scriptureBook} · ${currentSession.channelReference}`}
            />
          )}

          {activePage === 'studio' && (
            <AIPrototypeStudio
              currentPillar={userProfile.pillar}
              onSessionCreated={handleSessionCreated}
              onSelectExistingSession={handleSelectSession}
              availableSessions={sessions}
            />
          )}

          {activePage === 'kahoot' && (
            <KahootQuizArena
              questions={currentSession.quiz}
              topicTitle={currentSession.title}
              participantName={userProfile.name}
              onQuizComplete={(score) =>
                handleMarkTaskComplete(currentSession.id, 'quizDone', { quizScore: score })
              }
            />
          )}

          {activePage === 'flashcards' && (
            <FlashcardsDeck
              flashcards={currentSession.flashcards}
              topicTitle={currentSession.title}
            />
          )}

          {activePage === 'definitions' && (
            <DefinitionsGlossary
              definitions={currentSession.definitions}
              topicTitle={currentSession.title}
            />
          )}

          {activePage === 'writing' && (
            <WritingWorksLab
              exercises={currentSession.practiceExercises}
              topicTitle={currentSession.title}
            />
          )}

          {activePage === 'notes' && (
            <StudyNotesAndWhiteboard
              studyNotes={currentSession.studyNotes}
              quickTips={currentSession.quickTips}
              prayerPoints={currentSession.prayerPoints}
              topicTitle={currentSession.title}
            />
          )}

          {activePage === 'chat' && (
            <LiveClassChat
              userProfile={userProfile}
              topicTitle={currentSession.title}
              pillar={currentSession.pillar}
              scriptureBook={currentSession.scriptureBook}
            />
          )}

          {activePage === 'online-class' && (
            <OnlineMeetClassroom
              currentSession={currentSession}
              currentFellowship={currentFellowship}
              userProfile={userProfile}
              currentUserGoogle={currentUserGoogle}
              onGoogleSignInSuccess={handleGoogleSignInSuccess}
              onOpenTopicQuiz={() => navigateToPage('kahoot')}
            />
          )}

          {activePage === 'dashboard' && (
            <ProgressDashboard
              sessions={sessions}
              currentSession={currentSession}
              userProfile={userProfile}
              currentUserGoogle={currentUserGoogle}
              topicProgress={topicProgress}
              onToggleTask={handleToggleTask}
              onNavigateToTab={navigateToPage}
              onSelectSession={handleSelectSession}
            />
          )}

          {activePage === 'batches' && (
            <FellowshipGroupsManager
              fellowships={fellowships}
              currentFellowship={currentFellowship}
              onSelectFellowship={handleSelectFellowship}
              onAddFellowship={handleAddFellowship}
              sessions={sessions}
              onOpenPrayerRoom={() => navigateToPage('online-class')}
            />
          )}
        </div>

        {/* One-by-One Page Stepper (Ideal for Android, Tablet, Laptop & TV D-Pad) */}
        <nav
          aria-label="Page by page navigation"
          className="print:hidden bg-white border border-stone-200 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3"
        >
          <button
            type="button"
            onClick={() => navigateToPage(prevPage.id)}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-stone-200 bg-[#FBF9F5] hover:bg-stone-100 text-xs sm:text-sm font-semibold text-stone-800 inline-flex items-center gap-2 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 shrink-0" />
            <span className="truncate max-w-[140px] sm:max-w-[220px]">{prevPage.label}</span>
          </button>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors"
          >
            <Menu className="w-4 h-4" />
            <span>
              Page {currentPageIndex + 1} / {FLAT_PAGES.length} · Menu
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigateToPage(nextPage.id)}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-stone-200 bg-[#FBF9F5] hover:bg-stone-100 text-xs sm:text-sm font-semibold text-stone-800 inline-flex items-center gap-2 transition-colors"
          >
            <span className="truncate max-w-[140px] sm:max-w-[220px]">{nextPage.label}</span>
            <ChevronRight className="w-4 h-4 shrink-0" />
          </button>
        </nav>

        {/* Print-Only Devotional PDF */}
        <PrintableNotesPDF session={currentSession} />
      </main>

      {/* Editorial Footer */}
      <footer className="print:hidden border-t border-stone-200 bg-white py-5 px-4 sm:px-6 text-xs text-stone-500">
        <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <span className="font-bold text-stone-900 font-editorial">MOED · Jesus Never Fail Ministries</span>
            <span aria-hidden="true"> · </span>
            <span className="font-semibold text-rose-700">{JESUS_NEVER_FAILS_HANDLE}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {MINISTRY_SOCIAL_LINKS.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-600 hover:text-rose-700 font-medium transition-colors"
              >
                {s.platform}
              </a>
            ))}
            <span className="text-stone-300">|</span>
            {JEFFRINA_PROFESSION_LINKS.map((p) => (
              <a
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-600 hover:text-stone-950 font-semibold transition-colors"
              >
                Jeffrina · {p.platform}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
