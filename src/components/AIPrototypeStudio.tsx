import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Upload,
  FileText,
  Image as ImageIcon,
  X,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Share2,
  Copy,
  BookOpen,
  Youtube,
  ExternalLink,
} from 'lucide-react';
import { GospelPillar, GospelSession } from '../types';
import {
  GOSPEL_PILLAR_LIST,
  JESUS_NEVER_FAILS_CHANNEL_URL,
  buildChannelVideoSearchUrl,
} from '../data/gospelData';
import { safeFetchJson } from '../services/apiClient';

interface AIPrototypeStudioProps {
  currentPillar: GospelPillar;
  onSessionCreated: (newSession: GospelSession) => void;
  onSelectExistingSession: (sessionId: string) => void;
  availableSessions: GospelSession[];
}

export const AIPrototypeStudio: React.FC<AIPrototypeStudioProps> = ({
  currentPillar,
  onSessionCreated,
  onSelectExistingSession,
  availableSessions,
}) => {
  const [topic, setTopic] = useState('');
  const [scriptureBook, setScriptureBook] = useState('John 3 & Romans 5');
  const [pillar, setPillar] = useState<GospelPillar>(currentPillar);
  const [fellowshipPrompt, setFellowshipPrompt] = useState('');
  const [documentText, setDocumentText] = useState('');
  const [docFileName, setDocFileName] = useState<string | null>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [latestCreatedSession, setLatestCreatedSession] = useState<GospelSession | null>(null);
  const [copiedSharableLink, setCopiedSharableLink] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleApplyPreset = (preset: {
    topic: string;
    scriptureBook: string;
    pillar: GospelPillar;
    prompt: string;
  }) => {
    setTopic(preset.topic);
    setScriptureBook(preset.scriptureBook);
    setPillar(preset.pillar);
    setFellowshipPrompt(preset.prompt);
  };

  const handleDocFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocFileName(file.name);

    if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setDocumentText((event.target?.result as string) || '');
      };
      reader.readAsText(file);
    } else {
      setDocumentText(
        `[Uploaded Sermon Transcript / Study Notes: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]\nGenerate Christ-centered Gospel study questions, Scripture reflection prompts, and Jesus Never Fails channel video suggestions.`
      );
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImagePreview(result);
      const base64Data = result.split(',')[1];
      setImageBase64(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleClearDoc = () => {
    setDocumentText('');
    setDocFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() && !fellowshipPrompt.trim() && !documentText.trim() && !imageBase64) {
      setErrorMessage('Please enter a Bible topic, passage, sermon notes, or verse image.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setLatestCreatedSession(null);

    try {
      setGenerationStep('Praying & preparing Scripture insights with Gemini...');
      await new Promise((r) => setTimeout(r, 500));

      setGenerationStep('Creating Gospel quiz, Assertion & Reason, Parable Studies, and Jesus Never Fail Ministries YouTube links...');

      const result = await safeFetchJson<{ session?: GospelSession }>(
        '/api/generate-gospel-module',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: topic.trim(),
            pillar,
            scriptureBook: scriptureBook.trim(),
            fellowshipName: `Jesus Never Fail Ministries · ${pillar}`,
            prompt: fellowshipPrompt.trim(),
            documentText: documentText.trim(),
            imageBase64,
            imageMimeType,
          }),
        }
      );

      if (!result.ok || !result.data?.session) {
        throw new Error(result.error || 'Failed to build Gospel study module');
      }

      setGenerationStep('Finalizing memory verses, prayer points & fellowship share link...');
      const generatedSession = result.data.session;
      setLatestCreatedSession(generatedSession);
      onSessionCreated(generatedSession);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Could not generate Gospel study module. Please check inputs.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const copySessionLink = (id: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('session', id);
    navigator.clipboard.writeText(url.toString());
    setCopiedSharableLink(true);
    setTimeout(() => setCopiedSharableLink(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span className="font-semibold text-amber-800 inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Gospel & Sermon Study Builder
              </span>
              <span aria-hidden="true">·</span>
              <a
                href={JESUS_NEVER_FAILS_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-rose-700 hover:underline font-medium inline-flex items-center gap-1"
              >
                <Youtube className="w-3.5 h-3.5" />
                Interlinked with Jesus Never Fail Ministries Channel
              </a>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-editorial">
              Build an Interactive Gospel Study & Sermon Guide
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-sans-ui leading-relaxed">
              Enter any Bible passage, sermon title from Jesus Never Fail Ministries, or upload sermon notes. Automatically generates Scripture quizzes, Assertion & Reason, Parable Studies, Covenant Matrices, Memory Verses, and YouTube channel video links.
            </p>
          </div>

          <a
            href={JESUS_NEVER_FAILS_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold transition-colors shrink-0 self-start lg:self-center whitespace-nowrap"
          >
            <Youtube className="w-4 h-4" />
            <span>Open Jesus Never Fail Ministries Channel</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Gospel Topic Presets */}
        <div className="mt-5 pt-4 border-t border-stone-100">
          <div className="text-xs font-semibold text-stone-600 mb-2.5 flex items-center gap-1.5 font-display">
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            <span>Quick Gospel Sermon Presets:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                handleApplyPreset({
                  topic: "John 3:16 — God's Unfailing Love & Eternal Life",
                  scriptureBook: 'Gospel of John 3',
                  pillar: 'Salvation & Grace',
                  prompt:
                    'Focus on Nicodemus being born again, the bronze serpent typology, unconditional agape love, and assurance of eternal life through Jesus Christ.',
                })
              }
              className="text-xs bg-[#FBF9F5] hover:bg-amber-50 border border-stone-200 hover:border-amber-300 px-3 py-1.5 rounded-lg text-stone-800 font-semibold transition-colors"
            >
              John 3:16 — Born Again & Grace
            </button>
            <button
              type="button"
              onClick={() =>
                handleApplyPreset({
                  topic: 'Psalm 23 — The Good Shepherd Leads Us Safely',
                  scriptureBook: 'Psalm 23 & John 10',
                  pillar: 'Psalms & Worship',
                  prompt:
                    'Explore green pastures, still waters, the valley of the shadow of death, anointing oil, and Christ the Good Shepherd who never fails His flock.',
                })
              }
              className="text-xs bg-[#FBF9F5] hover:bg-amber-50 border border-stone-200 hover:border-amber-300 px-3 py-1.5 rounded-lg text-stone-800 font-semibold transition-colors"
            >
              Psalm 23 — The Good Shepherd
            </button>
            <button
              type="button"
              onClick={() =>
                handleApplyPreset({
                  topic: 'Ephesians 6 — Standing Strong in the Full Armor of God',
                  scriptureBook: 'Ephesians 6:10-18',
                  pillar: 'Prayer & Intercession',
                  prompt:
                    'Detail every piece of the Armor of God (belt of truth, breastplate of righteousness, shield of faith, sword of the Spirit) and praying in the Spirit.',
                })
              }
              className="text-xs bg-[#FBF9F5] hover:bg-amber-50 border border-stone-200 hover:border-amber-300 px-3 py-1.5 rounded-lg text-stone-800 font-semibold transition-colors"
            >
              Ephesians 6 — Full Armor of God
            </button>
            <button
              type="button"
              onClick={() =>
                handleApplyPreset({
                  topic: 'Acts 2 — Pentecost Fire & Holy Spirit Boldness',
                  scriptureBook: 'Acts 2 & Joel 2',
                  pillar: 'Holy Spirit & Revival',
                  prompt:
                    'Examine the Upper Room waiting in prayer, tongues of fire, Peter’s Gospel sermon, and 3,000 souls added to the early church.',
                })
              }
              className="text-xs bg-[#FBF9F5] hover:bg-amber-50 border border-stone-200 hover:border-amber-300 px-3 py-1.5 rounded-lg text-stone-800 font-semibold transition-colors"
            >
              Acts 2 — Holy Spirit Revival
            </button>
            <button
              type="button"
              onClick={() =>
                handleApplyPreset({
                  topic: 'Hebrews 11 & 13:8 — Unshakeable Faith: Jesus Never Fails',
                  scriptureBook: 'Hebrews 11 & 13:8',
                  pillar: 'Faith & Miracles',
                  prompt:
                    'Walk through the Hall of Faith (Abraham, Moses, Rahab) showing how Jesus Christ is the same yesterday, today, and forever.',
                })
              }
              className="text-xs bg-[#FBF9F5] hover:bg-amber-50 border border-stone-200 hover:border-amber-300 px-3 py-1.5 rounded-lg text-stone-800 font-semibold transition-colors"
            >
              Hebrews 13:8 — Jesus Never Fails
            </button>
          </div>
        </div>
      </div>

      {/* Main Form & Existing Sessions Library */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 font-display">
                  Gospel Topic or Sermon Title *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Romans 8 — More Than Conquerors in Christ"
                  className="w-full bg-[#FBF9F5] border border-stone-200 focus:border-amber-700 rounded-xl px-3.5 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none font-sans-ui"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 font-display">
                  Scripture Book / Passage
                </label>
                <input
                  type="text"
                  value={scriptureBook}
                  onChange={(e) => setScriptureBook(e.target.value)}
                  placeholder="e.g. Romans 8, Psalm 91, Gospel of Luke"
                  className="w-full bg-[#FBF9F5] border border-stone-200 focus:border-amber-700 rounded-xl px-3.5 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none font-sans-ui"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-display">
                Gospel Pillar Focus
              </label>
              <select
                value={pillar}
                onChange={(e) => setPillar(e.target.value as GospelPillar)}
                className="w-full bg-[#FBF9F5] border border-stone-200 focus:border-amber-700 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none font-sans-ui"
              >
                {GOSPEL_PILLAR_LIST.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.anchorVerse})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center justify-between font-display">
                <span>Fellowship & Devotional Emphasis</span>
                <span className="text-[11px] text-stone-400 font-normal">Optional</span>
              </label>
              <textarea
                value={fellowshipPrompt}
                onChange={(e) => setFellowshipPrompt(e.target.value)}
                rows={2}
                placeholder="e.g. Highlight daily encouragement for believers walking through trials, and link prayer points..."
                className="w-full bg-[#FBF9F5] border border-stone-200 focus:border-amber-700 rounded-xl p-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none resize-none font-sans-ui"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5 font-display">
                  <FileText className="w-3.5 h-3.5 text-amber-700" />
                  <span>Sermon Notes, Bible Passage, or Transcript</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-amber-800 hover:underline font-medium flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload Notes</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.pdf,.doc,.docx,.md"
                    onChange={handleDocFileUpload}
                    className="hidden"
                  />
                  {docFileName && (
                    <button
                      type="button"
                      onClick={handleClearDoc}
                      className="text-xs text-rose-700 hover:underline flex items-center gap-0.5"
                    >
                      <X className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>
              </div>

              {docFileName && (
                <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Loaded: {docFileName}</span>
                </div>
              )}

              <textarea
                value={documentText}
                onChange={(e) => setDocumentText(e.target.value)}
                rows={3}
                placeholder="Paste Bible verses, sermon outline points, or devotionals here..."
                className="w-full bg-[#FBF9F5] border border-stone-200 focus:border-amber-700 rounded-xl p-3 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none resize-none font-code"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5 font-display">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-700" />
                  <span>Upload Bible Verse Card or Sermon Slide Image</span>
                </label>
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="text-xs text-amber-800 hover:underline font-medium flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" />
                  <span>Choose Image</span>
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {imagePreview ? (
                <div className="relative inline-block border border-stone-200 rounded-xl overflow-hidden mt-1">
                  <img
                    src={imagePreview}
                    alt="Uploaded scripture visual"
                    className="max-h-36 object-contain bg-[#FBF9F5]"
                  />
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="absolute top-1.5 right-1.5 bg-white text-stone-600 hover:text-stone-900 p-1 rounded-full border border-stone-200"
                    title="Remove Image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => imageInputRef.current?.click()}
                  className="border border-dashed border-stone-300 hover:border-amber-600 rounded-xl p-4 text-center cursor-pointer transition-colors bg-[#FBF9F5]"
                >
                  <ImageIcon className="w-6 h-6 text-stone-400 mx-auto mb-1" />
                  <p className="text-xs text-stone-500 font-sans-ui">
                    Upload a Bible page photo, sermon graphic, or handwritten study sheet
                  </p>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-sans-ui">
                {errorMessage}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors font-display"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                    <span>{generationStep || 'Building Gospel Study Module...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Build Gospel Module & Link YouTube Videos</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Gospel Library & Share Links */}
        <div className="space-y-4">
          {latestCreatedSession && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-950 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider font-display">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Gospel Module Ready</span>
              </div>
              <p className="text-sm font-bold text-stone-900 font-editorial">
                {latestCreatedSession.title}
              </p>
              <p className="text-xs text-stone-700 line-clamp-2 font-sans-ui">
                {latestCreatedSession.summary}
              </p>

              <a
                href={buildChannelVideoSearchUrl(latestCreatedSession.title)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:underline"
              >
                <Youtube className="w-3.5 h-3.5" />
                <span>Search this title on Jesus Never Fail Ministries Channel</span>
              </a>

              <div className="bg-white border border-emerald-200 rounded-xl p-2.5 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-stone-600">
                  <span>Fellowship Share Link:</span>
                  <button
                    onClick={() => copySessionLink(latestCreatedSession.id)}
                    className="text-emerald-800 hover:underline flex items-center gap-1 font-semibold"
                  >
                    {copiedSharableLink ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedSharableLink ? 'Copied' : 'Copy Link'}</span>
                  </button>
                </div>
                <div className="text-[11px] font-code text-stone-700 truncate bg-[#FBF9F5] p-1.5 rounded border border-stone-200">
                  {window.location.origin}/?session={latestCreatedSession.id}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-500 font-display">
              <span>Gospel Study Archive</span>
              <span className="tabular-nums text-amber-800">{availableSessions.length} Modules</span>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {availableSessions.map((sess) => (
                <div
                  key={sess.id}
                  className="bg-[#FBF9F5] hover:bg-amber-50/40 border border-stone-200 rounded-xl p-3 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      onClick={() => onSelectExistingSession(sess.id)}
                      className="text-left flex-1 min-w-0"
                    >
                      <div className="text-xs font-semibold text-stone-900 hover:text-amber-800 transition-colors font-display line-clamp-1">
                        {sess.title}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        {sess.pillar} · {sess.scriptureBook}
                      </div>
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      <a
                        href={buildChannelVideoSearchUrl(sess.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-rose-700 hover:bg-rose-50 rounded"
                        title="Watch on Jesus Never Fail Ministries YouTube Channel"
                      >
                        <Youtube className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => copySessionLink(sess.id)}
                        className="p-1 text-stone-400 hover:text-stone-900 rounded"
                        title="Copy fellowship link"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
