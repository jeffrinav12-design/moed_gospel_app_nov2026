import React, { useEffect } from 'react';
import {
  X,
  BookOpen,
  Languages,
  ScrollText,
  Users,
  Layers,
  Edit3,
  Music,
  BookMarked,
  Share2,
  Youtube,
  Gamepad2,
  Scale,
  BookText,
  HelpCircle,
  Table2,
  FileText,
  Sparkles,
  PenTool,
  MessageCircle,
  Wand2,
  Video,
  BarChart3,
  Home,
  LogOut,
} from 'lucide-react';
import { UserProfile } from '../types';
import { moedGospelLogoImg } from '../assets/media';

export interface DrawerMenuItem {
  id: string;
  label: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface DrawerMenuGroup {
  groupTitle: string;
  items: DrawerMenuItem[];
}

export const MOED_HAMBURGER_GROUPS: DrawerMenuGroup[] = [
  {
    groupTitle: 'Holy Scripture Sanctuary',
    items: [
      {
        id: 'bible-reader',
        label: 'Holy Bible (All Languages)',
        subtitle: '66 Books · Tamil, English, French, Malayalam & Global',
        icon: BookOpen,
      },
    ],
  },
  {
    groupTitle: 'Biblical Languages & Rabbi Studies (Separate Pages)',
    items: [
      {
        id: 'hebrew-academy',
        label: 'Hebrew Letters Academy',
        subtitle: '22 Aleph-Bet Letters, Gematria & OT Roots',
        icon: Languages,
      },
      {
        id: 'greek-academy',
        label: 'Greek Letters Academy',
        subtitle: '24 Koine Greek Letters & NT Roots',
        icon: Languages,
      },
      {
        id: 'rabbi-studies',
        label: 'Rabbi & Jewish Historical Studies',
        subtitle: 'Moedim, Synagogue & Torah Heritage',
        icon: ScrollText,
      },
    ],
  },
  {
    groupTitle: 'Stories, Flashcards & Editable Studio',
    items: [
      {
        id: 'bible-stories',
        label: 'Bible Character Stories',
        subtitle: 'Separated Life Journeys Across Scripture',
        icon: Users,
      },
      {
        id: 'biblical-cards',
        label: 'Biblical Cards & Flashcards',
        subtitle: 'Interactive Verse Memory Deck',
        icon: Layers,
      },
      {
        id: 'card-editor',
        label: 'Editable Card Template Studio',
        subtitle: 'Design, Customize & Print Cards',
        icon: Edit3,
      },
    ],
  },
  {
    groupTitle: 'Worship, Books & Ministry Connect',
    items: [
      {
        id: 'new-songs',
        label: '4 New Song Releases & StarMaker',
        subtitle: 'Dedicated Song Playlist & Worship Collaboration',
        icon: Music,
      },
      {
        id: 'book-releases',
        label: 'Gospel Book Releases',
        subtitle: 'Upcoming & Published Ministry Books',
        icon: BookMarked,
      },
      {
        id: 'socials-connect',
        label: 'Socials & Connect with Jeffrina',
        subtitle: 'YouTube, Blogger, Instagram, Rafoan Cloud & Portfolio',
        icon: Share2,
      },
    ],
  },
  {
    groupTitle: 'Jesus Never Fail Ministries Channel & Study Tools',
    items: [
      {
        id: 'curriculum',
        label: '@jesusneverfails7649 Live Channel',
        subtitle: 'Watch Sermons & Topic Links',
        icon: Youtube,
      },
      {
        id: 'kahoot',
        label: 'Gospel Quiz Arena',
        subtitle: 'Timed Interactive Scripture Quiz',
        icon: Gamepad2,
      },
      {
        id: 'ar-lab',
        label: 'Scripture Assertion & Reason',
        subtitle: 'Biblical Truth Logic Lab',
        icon: Scale,
      },
      {
        id: 'case-study',
        label: 'Parable & Passage Case Studies',
        subtitle: 'Applied Gospel Scenarios',
        icon: BookText,
      },
      {
        id: 'give-reason',
        label: 'Give Biblical Reason',
        subtitle: 'Apologetics & Faith Defense',
        icon: HelpCircle,
      },
      {
        id: 'diff-matrix',
        label: 'Covenant Contrast Matrix',
        subtitle: 'Side-by-Side Biblical Comparisons',
        icon: Table2,
      },
      {
        id: 'subjective',
        label: 'Short & Long Reflections',
        subtitle: 'Structured Devotional Responses',
        icon: FileText,
      },
      {
        id: 'flashcards',
        label: 'Topic Memory Verses',
        subtitle: 'Flashcards for Active Study Topic',
        icon: Sparkles,
      },
      {
        id: 'definitions',
        label: 'Biblical Terms Glossary',
        subtitle: 'Key Doctrine & Root Definitions',
        icon: BookOpen,
      },
      {
        id: 'writing',
        label: 'Prayer & Testimony Journal',
        subtitle: 'Written Reflection With Encouragement',
        icon: PenTool,
      },
      {
        id: 'notes',
        label: 'Sermon Notes & Printable Guide',
        subtitle: 'Outline, Prayer Points & PDF Print',
        icon: FileText,
      },
      {
        id: 'chat',
        label: 'Gospel Q&A Guide',
        subtitle: 'Scripture-Grounded Study Assistant',
        icon: MessageCircle,
      },
      {
        id: 'studio',
        label: 'New Gospel Study Builder',
        subtitle: 'Create Topic Study From Any Sermon or Verse',
        icon: Wand2,
      },
    ],
  },
  {
    groupTitle: 'Live Fellowship & Growth Tracking',
    items: [
      {
        id: 'online-class',
        label: 'Live Prayer Room (Cam & Mic)',
        subtitle: 'Face-to-Face Prayer & Fellowship',
        icon: Video,
      },
      {
        id: 'dashboard',
        label: 'Spiritual Growth Dashboard',
        subtitle: 'Progress Across Topics & Quizzes',
        icon: BarChart3,
      },
      {
        id: 'batches',
        label: 'Fellowship Circles',
        subtitle: 'Schedules & Group Links',
        icon: Users,
      },
    ],
  },
];

interface HamburgerMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activePageId: string;
  onSelectPage: (pageId: string) => void;
  userProfile?: UserProfile | null;
  onReturnWelcome?: () => void;
  onSignOut?: () => void;
}

export const HamburgerMenuDrawer: React.FC<HamburgerMenuDrawerProps> = ({
  isOpen,
  onClose,
  activePageId,
  onSelectPage,
  userProfile,
  onReturnWelcome,
  onSignOut,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-label="MOED Gospel Navigation Menu"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-Over Panel */}
      <aside className="relative z-10 w-[88vw] max-w-md bg-[#FBF9F5] border-r border-stone-200 h-full flex flex-col shadow-2xl">
        {/* Drawer Header with MOED Crest Logo */}
        <div className="bg-white border-b border-stone-200 px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={moedGospelLogoImg}
              alt="MOED Gospel Sanctuary Emblem"
              className="w-10 h-10 rounded-xl object-cover border border-amber-200 shrink-0"
            />
            <div className="min-w-0">
              <div className="text-base font-bold text-stone-900 font-editorial truncate">
                MOED · Jesus Never Fail Ministries
              </div>
              <div className="text-[11px] text-rose-700 font-semibold truncate">
                {userProfile ? `${userProfile.avatar} ${userProfile.name}` : 'All Sections One by One'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="min-h-[44px] min-w-[44px] rounded-xl border border-stone-200 bg-[#FBF9F5] hover:bg-stone-100 text-stone-700 flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Grouped Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {MOED_HAMBURGER_GROUPS.map((group) => (
            <div key={group.groupTitle} className="space-y-1.5">
              <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-amber-900">
                {group.groupTitle}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePageId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectPage(item.id);
                        onClose();
                      }}
                      className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-xl text-left flex items-center gap-3 transition-colors border ${
                        isActive
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-white text-stone-800 border-stone-200/80 hover:border-amber-700 hover:bg-amber-50/40'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-amber-300' : 'text-rose-700'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-bold leading-snug truncate">
                          {item.label}
                        </div>
                        {item.subtitle && (
                          <div
                            className={`text-[11px] truncate ${
                              isActive ? 'text-stone-300' : 'text-stone-500'
                            }`}
                          >
                            {item.subtitle}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Drawer Footer Controls */}
        <div className="bg-white border-t border-stone-200 px-4 py-3 flex items-center justify-between gap-2">
          {onReturnWelcome && (
            <button
              type="button"
              onClick={() => {
                onReturnWelcome();
                onClose();
              }}
              className="min-h-[44px] flex-1 px-3 py-2 rounded-xl border border-stone-200 bg-[#FBF9F5] hover:bg-stone-100 text-stone-800 text-xs font-semibold inline-flex items-center justify-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Welcome Page</span>
            </button>
          )}
          {onSignOut && (
            <button
              type="button"
              onClick={() => {
                onSignOut();
                onClose();
              }}
              className="min-h-[44px] px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-800 text-xs font-semibold inline-flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </aside>
    </div>
  );
};
