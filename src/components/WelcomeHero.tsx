import React, { useState } from 'react';
import {
  ArrowRight,
  Youtube,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  Menu,
  Languages,
} from 'lucide-react';
import { GospelPillar, UserProfile, MinistryRole, GospelSession } from '../types';
import { GOSPEL_PILLAR_LIST, JESUS_NEVER_FAILS_CHANNEL_URL } from '../data/gospelData';
import { BIBLE_LANGUAGES } from '../data/bibleCatalog';
import {
  googleSignIn,
  signInWithPartnerEmail,
  registerPartnerWithEmail,
} from '../services/googleAuth';
import { HamburgerMenuDrawer } from './HamburgerMenuDrawer';
import { moedGospelLogoImg } from '../assets/media';

interface WelcomeHeroProps {
  onGetStarted: (
    profile: UserProfile,
    targetSessionId?: string,
    targetPageId?: string
  ) => void;
  availableSessions: GospelSession[];
}

const AVATARS = ['✝️', '🕊️', '📖', '🙏', '🔥', '🌿'];

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({ onGetStarted }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [entryMode, setEntryMode] = useState<'email' | 'get-started'>('email');
  const [emailAction, setEmailAction] = useState<'signin' | 'signup'>('signin');

  // Email Auth fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showEmailFallbackBtn, setShowEmailFallbackBtn] = useState(false);

  // Get Started fields
  const [role, setRole] = useState<MinistryRole>('believer');
  const [name, setName] = useState('');
  const [selectedPillar, setSelectedPillar] = useState<GospelPillar>('Salvation & Grace');
  const [selectedAvatar, setSelectedAvatar] = useState('✝️');
  const [preferredLang, setPreferredLang] = useState<string>(() => {
    try {
      return localStorage.getItem('moed_preferred_bible_lang') || 'en';
    } catch {
      return 'en';
    }
  });

  const handleSelectPageFromMenu = (pageId: string) => {
    const cleanEmail = email.trim();
    const displayName =
      name.trim() ||
      partnerName.trim() ||
      (cleanEmail ? cleanEmail.split('@')[0] : '') ||
      'Gospel Partner';
    onGetStarted(
      {
        email: cleanEmail || undefined,
        role,
        name: displayName,
        avatar: selectedAvatar,
        pillar: selectedPillar,
        authProvider: 'guest',
        preferredBibleLanguage: preferredLang,
      },
      undefined,
      pageId
    );
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setShowEmailFallbackBtn(false);

    if (!email.trim() || !email.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    setAuthLoading(true);
    try {
      const displayName =
        partnerName.trim() || email.split('@')[0] || 'Gospel Partner';
      const user =
        emailAction === 'signup'
          ? await registerPartnerWithEmail(email.trim(), password, displayName)
          : await signInWithPartnerEmail(email.trim(), password);

      onGetStarted({
        uid: user.uid,
        email: user.email || email.trim(),
        role,
        name: user.displayName || displayName,
        avatar: selectedAvatar,
        pillar: selectedPillar,
        authProvider: 'email',
        preferredBibleLanguage: preferredLang,
      });
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/operation-not-allowed') {
        setAuthError(
          'Email/Password sign-in is not yet enabled in Firebase Authentication Console. You can continue below with this email or sign in with Google.'
        );
        setShowEmailFallbackBtn(true);
      } else if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found'
      ) {
        setAuthError(
          'Email or password did not match. Switch to Register or use Google Sign-In.'
        );
      } else if (code === 'auth/email-already-in-use') {
        setAuthError('An account with this email already exists. Switch to Sign In.');
      } else {
        setAuthError(err?.message || 'Unable to sign in with email right now.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleContinueEmailProfile = () => {
    const cleanEmail = email.trim();
    const displayName =
      partnerName.trim() || (cleanEmail ? cleanEmail.split('@')[0] : 'Gospel Partner');
    onGetStarted({
      email: cleanEmail || undefined,
      role,
      name: displayName,
      avatar: selectedAvatar,
      pillar: selectedPillar,
      authProvider: 'guest',
      preferredBibleLanguage: preferredLang,
    });
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        onGetStarted({
          uid: res.user.uid,
          email: res.user.email || undefined,
          role,
          name: res.user.displayName || res.user.email?.split('@')[0] || 'Gospel Partner',
          avatar: selectedAvatar,
          pillar: selectedPillar,
          authProvider: 'google',
          preferredBibleLanguage: preferredLang,
        });
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Google sign-in popup was closed or blocked.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleQuickGetStarted = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName =
      name.trim() || (role === 'pastor' ? 'Pastor / Fellowship Leader' : 'Gospel Partner');
    onGetStarted({
      role,
      name: finalName,
      avatar: selectedAvatar,
      pillar: selectedPillar,
      authProvider: 'guest',
      preferredBibleLanguage: preferredLang,
    });
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-stone-900 flex flex-col font-sans-ui">
      {/* Universal Hamburger Drawer accessible even on Entry */}
      <HamburgerMenuDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activePageId=""
        onSelectPage={handleSelectPageFromMenu}
      />

      {/* Neat Minimal Header (Max 14% / 56-64px height on mobile, tablet, laptop, TV) */}
      <header className="border-b border-stone-200 bg-white/95 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open MOED Navigation Menu"
              className="min-h-[44px] min-w-[44px] px-3 rounded-xl border border-stone-200 bg-[#FBF9F5] hover:bg-stone-100 text-stone-900 flex items-center justify-center gap-2 shrink-0 transition-colors"
            >
              <Menu className="w-5 h-5" />
              <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">
                Menu
              </span>
            </button>

            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={moedGospelLogoImg}
                alt="MOED Gospel Sanctuary Logo"
                className="w-10 h-10 rounded-xl object-cover border border-amber-200 shrink-0"
              />
              <div className="min-w-0">
                <div className="text-base sm:text-lg font-bold tracking-tight text-stone-900 font-editorial truncate">
                  MOED
                </div>
                <div className="text-[11px] font-semibold text-rose-700 truncate">
                  Jesus Never Fail Ministries
                </div>
              </div>
            </div>
          </div>

          <a
            href={JESUS_NEVER_FAILS_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] px-3.5 sm:px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-xl transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5"
          >
            <Youtube className="w-4 h-4" />
            <span className="hidden sm:inline">@jesusneverfails7649</span>
            <span className="sm:hidden">YouTube</span>
          </a>
        </div>
      </header>

      {/* Neat Centered First-Entering Sanctuary (Logo · App Name · Login · Get Started Only) */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-5xl 2xl:max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Clean Crest Logo + App Name + Verse */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden border-2 border-amber-200 bg-white shadow-sm">
              <img
                src={moedGospelLogoImg}
                alt="MOED Gospel Crest"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-3">
              <div className="text-xs font-medium tracking-[0.14em] uppercase text-amber-900/90">
                Gospel Sanctuary · Scripture · Fellowship
              </div>
              <h1
                className="text-5xl sm:text-6xl 2xl:text-7xl font-semibold text-stone-900 font-editorial leading-[1.04]"
                style={{ textWrap: 'balance' }}
              >
                MOED
              </h1>
              <p className="text-xl sm:text-2xl font-medium italic text-rose-800 font-editorial">
                Jesus Never Fail Ministries
              </p>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-md mx-auto lg:mx-0">
                "Jesus Christ is the same yesterday and today and forever." — Hebrews 13:8
              </p>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="min-h-[44px] px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors"
              >
                <Menu className="w-4 h-4 text-amber-800" />
                <span>Browse All Pages One by One</span>
              </button>
            </div>
          </div>

          {/* Right Column: Neat Login + Get Started Card */}
          <div className="lg:col-span-6 bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
            {/* Switcher: Sign In vs Get Started */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setEntryMode('email');
                  setAuthError(null);
                }}
                className={`min-h-[44px] py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  entryMode === 'email'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>Login</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEntryMode('get-started');
                  setAuthError(null);
                }}
                className={`min-h-[44px] py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  entryMode === 'get-started'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {entryMode === 'email' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div>
                    <h2 className="text-xl font-bold text-stone-900 font-editorial">
                      {emailAction === 'signin' ? 'Partner Sign In' : 'Create Partner Account'}
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Carry your name, Bible language & prayer notes across devices
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailAction(emailAction === 'signin' ? 'signup' : 'signin');
                      setAuthError(null);
                    }}
                    className="text-xs font-semibold text-rose-700 hover:underline shrink-0"
                  >
                    {emailAction === 'signin' ? 'New? Register' : 'Sign In'}
                  </button>
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-700" />
                      <span>{authError}</span>
                    </div>
                    {showEmailFallbackBtn && (
                      <button
                        type="button"
                        onClick={handleContinueEmailProfile}
                        className="w-full min-h-[44px] py-2 px-3 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors"
                      >
                        Continue With This Email Now
                      </button>
                    )}
                  </div>
                )}

                <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                  {emailAction === 'signup' && (
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Your Name (appears on your Holy Bible)
                      </label>
                      <input
                        type="text"
                        value={partnerName}
                        onChange={(e) => setPartnerName(e.target.value)}
                        placeholder="e.g. Grace, David, Jeffrina"
                        className="w-full min-h-[44px] border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full min-h-[44px] border border-stone-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="w-full min-h-[44px] border border-stone-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    {authLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>
                          {emailAction === 'signin' ? 'Sign In With Email' : 'Create Account & Enter'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-stone-200" />
                  <span className="shrink mx-3 text-[11px] text-stone-400 uppercase tracking-wider font-medium">
                    or
                  </span>
                  <div className="flex-grow border-t border-stone-200" />
                </div>

                <button
                  type="button"
                  disabled={authLoading}
                  onClick={handleGoogleLogin}
                  className="w-full min-h-[48px] py-2.5 px-4 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <span className="font-bold text-rose-700 text-sm">G</span>
                  <span>Continue With Google / Gmail</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleQuickGetStarted} className="space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
                  <div>
                    <h2 className="text-xl font-bold text-stone-900 font-editorial">
                      Get Started
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Personalize your Bible name & preferred language
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#FBF9F5] border border-stone-200 flex items-center justify-center text-xl shrink-0">
                    {selectedAvatar}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setRole('believer')}
                    className={`min-h-[40px] py-2 px-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                      role === 'believer'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Gospel Partner
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('pastor')}
                    className={`min-h-[40px] py-2 px-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                      role === 'pastor'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Pastor / Leader
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Your Name (displayed on your Holy Bible)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full min-h-[44px] border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                    <Languages className="w-3.5 h-3.5 text-amber-800" />
                    <span>Preferred Bible Language</span>
                  </label>
                  <select
                    value={preferredLang}
                    onChange={(e) => setPreferredLang(e.target.value)}
                    className="w-full min-h-[44px] border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 bg-white focus:outline-none focus:border-stone-900"
                  >
                    {BIBLE_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.nativeLabel}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Scripture Pillar Focus
                  </label>
                  <select
                    value={selectedPillar}
                    onChange={(e) => setSelectedPillar(e.target.value as GospelPillar)}
                    className="w-full min-h-[44px] border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 bg-white focus:outline-none focus:border-stone-900"
                  >
                    {GOSPEL_PILLAR_LIST.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Emblem
                  </label>
                  <div className="flex items-center gap-2">
                    {AVATARS.map((av) => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setSelectedAvatar(av)}
                        className={`w-10 h-10 rounded-xl border text-lg flex items-center justify-center transition-colors ${
                          selectedAvatar === av
                            ? 'bg-stone-900 border-stone-900 text-white'
                            : 'bg-[#FBF9F5] border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Enter MOED Sanctuary</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
