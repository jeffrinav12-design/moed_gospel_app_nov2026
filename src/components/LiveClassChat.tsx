import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Plus,
  Sparkles,
  Loader2,
  Youtube,
  ExternalLink,
} from 'lucide-react';
import { ChatMessage, UserProfile } from '../types';
import {
  JESUS_NEVER_FAILS_CHANNEL_URL,
  buildChannelVideoSearchUrl,
} from '../data/gospelData';

interface LiveClassChatProps {
  userProfile: UserProfile;
  topicTitle: string;
  pillar: string;
  scriptureBook: string;
}

interface ChatThread {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

export const LiveClassChat: React.FC<LiveClassChatProps> = ({
  userProfile,
  topicTitle,
  pillar,
  scriptureBook,
}) => {
  const [threads, setThreads] = useState<ChatThread[]>([
    {
      id: 'thread-main',
      title: 'Scripture Q&A & Guidance',
      createdAt: 'Live',
      messages: [
        {
          id: 'msg-welcome',
          sender: 'MOED Gospel Guide',
          role: 'gospel-guide',
          text: `Grace and peace, ${userProfile.name}! Ask any Scripture question, Bible study insight, or prayer need about "${topicTitle}" (${scriptureBook}).`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    },
  ]);

  const [activeThreadId, setActiveThreadId] = useState<string>('thread-main');
  const [inputMessage, setInputMessage] = useState('');
  const [isAskingGuide, setIsAskingGuide] = useState(false);
  const [showNewThreadInput, setShowNewThreadInput] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: userProfile.name,
      role: userProfile.role,
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThreadId ? { ...t, messages: [...t.messages, newMsg] } : t
      )
    );

    setIsAskingGuide(true);
    try {
      const response = await fetch('/api/ai-tutor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          topic: topicTitle,
          pillar,
          scriptureBook,
          role: userProfile.role,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const guideMsg: ChatMessage = {
          id: `msg-guide-${Date.now()}`,
          sender: 'MOED Gospel Guide',
          role: 'gospel-guide',
          text: data.reply,
          timestamp:
            data.timestamp ||
            new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setThreads((prev) =>
          prev.map((t) =>
            t.id === activeThreadId ? { ...t, messages: [...t.messages, guideMsg] } : t
          )
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAskingGuide(false);
    }
  };

  const handleCreateNewThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreadTitle.trim()) return;

    const newId = `thread-${Date.now()}`;
    const newTh: ChatThread = {
      id: newId,
      title: newThreadTitle.trim(),
      createdAt: 'Now',
      messages: [
        {
          id: `msg-welcome-${Date.now()}`,
          sender: 'MOED Gospel Guide',
          role: 'gospel-guide',
          text: `New Scripture study thread started: "${newThreadTitle.trim()}". Share your Bible verse question below.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };

    setThreads((prev) => [...prev, newTh]);
    setActiveThreadId(newId);
    setNewThreadTitle('');
    setShowNewThreadInput(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto h-[620px]">
      {/* Left Sidebar */}
      <div className="md:col-span-1 bg-white border border-stone-200 rounded-2xl p-3 flex flex-col justify-between overflow-hidden">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 font-display">
              Study Threads
            </span>
            <button
              onClick={() => setShowNewThreadInput(!showNewThreadInput)}
              className="text-xs bg-stone-900 hover:bg-stone-800 text-white p-1.5 rounded-lg transition-colors"
              title="New Scripture Thread"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {showNewThreadInput && (
            <form
              onSubmit={handleCreateNewThread}
              className="space-y-1.5 p-2 bg-[#FBF9F5] rounded-xl border border-stone-200"
            >
              <input
                type="text"
                value={newThreadTitle}
                onChange={(e) => setNewThreadTitle(e.target.value)}
                placeholder="Prayer or verse topic..."
                className="w-full bg-white border border-stone-200 rounded-lg px-2 py-1 text-xs text-stone-900 focus:outline-none focus:border-amber-700 font-sans-ui"
                autoFocus
              />
              <div className="flex justify-end gap-1">
                <button
                  type="button"
                  onClick={() => setShowNewThreadInput(false)}
                  className="text-[11px] text-stone-500 hover:text-stone-800 px-2 py-0.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-[11px] bg-stone-900 hover:bg-stone-800 text-white px-2.5 py-0.5 rounded-md font-semibold font-display"
                >
                  Create
                </button>
              </div>
            </form>
          )}

          <div className="space-y-1 max-h-96 overflow-y-auto pr-1 font-sans-ui">
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setActiveThreadId(thread.id)}
                className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center gap-2 transition-colors ${
                  thread.id === activeThreadId
                    ? 'bg-[#FBF9F5] text-stone-900 font-semibold border border-amber-700/40'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0 text-amber-700" />
                <span className="truncate flex-1">{thread.title}</span>
                <span className="text-[11px] text-stone-400 tabular-nums">
                  ({thread.messages.length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Interlinked YouTube Channel Box */}
        <div className="p-3 bg-[#FBF9F5] rounded-xl border border-stone-200 text-xs space-y-2">
          <div className="font-semibold text-stone-900 flex items-center gap-1.5 font-display">
            <Youtube className="w-3.5 h-3.5 text-rose-700" />
            <span>@jesusneverfails7649</span>
          </div>
          <p className="text-[11px] text-stone-600 leading-relaxed">
            Watch messages and prayer teachings from the Jesus Never Fail Ministries channel alongside this Q&A.
          </p>
          <a
            href={buildChannelVideoSearchUrl(topicTitle)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 hover:underline"
          >
            <span>Open Channel Search</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Right Chat Stream */}
      <div className="md:col-span-3 bg-white border border-stone-200 rounded-2xl flex flex-col justify-between overflow-hidden">
        <div className="p-4 border-b border-stone-200 flex items-center justify-between gap-2 bg-white">
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-stone-900 font-editorial truncate">
              {activeThread.title}
            </h4>
            <p className="text-xs text-stone-500 font-sans-ui truncate">
              {pillar} · {scriptureBook} · {topicTitle}
            </p>
          </div>

          <a
            href={JESUS_NEVER_FAILS_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-rose-700 hover:underline inline-flex items-center gap-1.5 shrink-0"
          >
            <Youtube className="w-4 h-4" />
            <span className="hidden sm:inline">@jesusneverfails7649</span>
          </a>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FBF9F5]">
          {activeThread.messages.map((msg) => {
            const isMe = msg.sender === userProfile.name;
            const isGuide = msg.role === 'gospel-guide';

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    isGuide
                      ? 'bg-amber-700 text-white'
                      : isMe
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {isGuide ? <Sparkles className="w-3.5 h-3.5" /> : msg.sender[0]}
                </div>

                <div>
                  <div
                    className={`flex items-center gap-1.5 text-[11px] text-stone-500 mb-0.5 ${
                      isMe ? 'justify-end' : ''
                    }`}
                  >
                    <span className="font-semibold text-stone-700">{msg.sender}</span>
                    <span aria-hidden="true">·</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed font-sans-ui ${
                      isGuide
                        ? 'bg-white border border-stone-200 text-stone-800'
                        : isMe
                        ? 'bg-stone-900 text-white'
                        : 'bg-white text-stone-800 border border-stone-200'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {isAskingGuide && (
            <div className="flex items-center gap-2 text-xs text-stone-700 bg-white p-2.5 rounded-xl border border-stone-200 max-w-xs font-sans-ui">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />
              <span>Searching Scripture & preparing response...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Gospel Prompts */}
        <div className="px-4 py-2 border-t border-stone-200 bg-white flex items-center gap-1.5 overflow-x-auto text-[11px] font-sans-ui">
          <span className="text-stone-400 shrink-0 font-medium">Quick ask:</span>
          <button
            onClick={() =>
              setInputMessage('What key Bible verses prove that Jesus Never Fails in this passage?')
            }
            className="shrink-0 bg-[#FBF9F5] hover:bg-stone-100 text-stone-700 border border-stone-200 px-2.5 py-1 rounded-lg transition-colors font-medium"
          >
            Key Promise Verses
          </button>
          <button
            onClick={() =>
              setInputMessage('Explain this Gospel truth with a clear biblical illustration.')
            }
            className="shrink-0 bg-[#FBF9F5] hover:bg-stone-100 text-stone-700 border border-stone-200 px-2.5 py-1 rounded-lg transition-colors font-medium"
          >
            Biblical Illustration
          </button>
          <button
            onClick={() =>
              setInputMessage('Write a short heartfelt prayer based on today’s Scripture topic.')
            }
            className="shrink-0 bg-[#FBF9F5] hover:bg-stone-100 text-stone-700 border border-stone-200 px-2.5 py-1 rounded-lg transition-colors font-medium"
          >
            Prayer Guide
          </button>
        </div>

        <form
          onSubmit={handleSendMessage}
          className="p-3 border-t border-stone-200 flex items-center gap-2 bg-white"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about Scripture meaning, prayer requests, or @jesusneverfails7649..."
            className="flex-1 bg-[#FBF9F5] border border-stone-200 focus:border-amber-700 rounded-xl px-3.5 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none font-sans-ui"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isAskingGuide}
            className="bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white p-2 rounded-xl transition-colors"
            title="Send Question"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
