import React, { useState } from 'react';
import { Youtube, ExternalLink, Video, Check, Copy, LogOut, Menu } from 'lucide-react';
import { GospelSession, FellowshipGroup, UserProfile } from '../types';
import { JESUS_NEVER_FAILS_CHANNEL_URL } from '../data/gospelData';
import { GoogleSignInButton } from './GoogleSignInButton';
import { moedGospelLogoImg } from '../assets/media';

interface ClassroomHeaderProps {
  currentSession: GospelSession;
  fellowships: FellowshipGroup[];
  currentFellowship: FellowshipGroup;
  onSelectFellowship: (fellowship: FellowshipGroup) => void;
  userProfile: UserProfile;
  onToggleRole: () => void;
  onExitToLanding: () => void;
  onSignOut?: () => void;
  onNavigateToTab: (tab: string) => void;
  activePageTitle: string;
  onOpenMenu: () => void;
  currentUserGoogle?: {
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
  } | null;
  onGoogleSignInSuccess?: (user: any) => void;
}

export const ClassroomHeader: React.FC<ClassroomHeaderProps> = ({
  currentSession,
  fellowships,
  currentFellowship,
  onSelectFellowship,
  userProfile,
  onToggleRole,
  onExitToLanding,
  onSignOut,
  onNavigateToTab,
  activePageTitle,
  onOpenMenu,
  currentUserGoogle,
  onGoogleSignInSuccess,
}) => {
  const [copiedMeet, setCopiedMeet] = useState(false);

  const copyMeetLink = () => {
    navigator.clipboard.writeText(currentSession.googleMeetUrl);
    setCopiedMeet(true);
    setTimeout(() => setCopiedMeet(false), 2000);
  };

  return (
    <div className="no-print bg-white border-b border-stone-200 sticky top-0 z-30">
      {/* Strict 3-Zone Hamburger Top Bar (Safe Height for Android, Tablet, Laptop & TV) */}
      <header className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Hamburger Button + Crest Logo + Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Open Hamburger Navigation Menu"
            className="min-h-[44px] min-w-[44px] px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white flex items-center justify-center gap-2 shrink-0 transition-colors"
          >
            <Menu className="w-5 h-5" />
            <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">
              Menu
            </span>
          </button>

          <button
            type="button"
            onClick={onExitToLanding}
            className="flex items-center gap-2.5 text-left min-w-0 cursor-pointer"
            title="Return to MOED Welcome Page"
          >
            <img
              src={moedGospelLogoImg}
              alt="MOED Emblem"
              className="w-9 h-9 rounded-lg object-cover border border-amber-200 shrink-0 hidden xs:block sm:block"
            />
            <div className="min-w-0">
              <div className="text-sm sm:text-base font-bold tracking-tight text-stone-900 font-editorial truncate">
                MOED · Jesus Never Fail Ministries
              </div>
            </div>
          </button>
        </div>

        {/* Zone 2: Active One-by-One Page Name Indicator */}
        <div className="hidden md:flex items-center justify-center min-w-0">
          <span className="text-sm font-bold text-amber-900 font-editorial truncate max-w-[340px]">
            {activePageTitle}
          </span>
        </div>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href={currentSession.youtubeChannelUrl || JESUS_NEVER_FAILS_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] px-3.5 sm:px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-xl transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5"
          >
            <Youtube className="w-4 h-4" />
            <span className="hidden sm:inline">@jesusneverfails7649</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </a>
        </div>
      </header>

      {/* Compact Utility Bar: Fellowship, Prayer Room, Signed-In Profile */}
      <div className="bg-[#FBF9F5] border-t border-stone-200/80">
        <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="md:hidden font-bold text-amber-900 font-editorial truncate max-w-[200px]">
              {activePageTitle}
            </span>
            <span className="md:hidden text-stone-300">|</span>
            <label htmlFor="fellowship-select" className="hidden sm:inline text-stone-500 font-medium shrink-0">
              Fellowship:
            </label>
            <select
              id="fellowship-select"
              value={currentFellowship.id}
              onChange={(e) => {
                const found = fellowships.find((f) => f.id === e.target.value);
                if (found) onSelectFellowship(found);
              }}
              className="bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-stone-800 focus:outline-none focus:border-stone-500 max-w-[190px] sm:max-w-[240px] truncate"
            >
              {fellowships.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.memberCount})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => onNavigateToTab('online-class')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-semibold transition-colors whitespace-nowrap"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Prayer Room</span>
            </button>

            <button
              type="button"
              onClick={copyMeetLink}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 font-medium transition-colors whitespace-nowrap"
              title="Copy Google Meet fellowship link"
            >
              {copiedMeet ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
              <span>{copiedMeet ? 'Copied' : 'Meet Link'}</span>
            </button>

            {currentUserGoogle?.email ? (
              <span
                className="hidden sm:inline-flex items-center gap-1.5 bg-white border border-stone-200 px-2.5 py-1.5 rounded-lg text-stone-700 font-medium"
                title={`Signed in via Google: ${currentUserGoogle.email}`}
              >
                {currentUserGoogle.photoURL ? (
                  <img
                    src={currentUserGoogle.photoURL}
                    alt="Google account"
                    className="w-4 h-4 rounded-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-rose-700">G</span>
                )}
                <span className="truncate max-w-[120px]">{currentUserGoogle.email}</span>
              </span>
            ) : !userProfile.email ? (
              <GoogleSignInButton
                label="Google"
                onSuccess={onGoogleSignInSuccess}
                className="!py-1.5 !px-2.5 !text-xs !rounded-lg"
              />
            ) : null}

            <button
              type="button"
              onClick={onToggleRole}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 font-medium whitespace-nowrap"
              title="Switch Partner / Pastor perspective"
            >
              {userProfile.avatar} {userProfile.name}
            </button>

            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 text-stone-600 hover:text-rose-700 font-medium whitespace-nowrap"
                title="Sign out"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
