import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Lightbulb,
  Copy,
  Check,
  Volume2,
  Youtube,
  ExternalLink,
} from 'lucide-react';
import { DefinitionItem } from '../types';
import { buildChannelVideoSearchUrl } from '../data/gospelData';

interface DefinitionsGlossaryProps {
  definitions: DefinitionItem[];
  topicTitle: string;
}

export const DefinitionsGlossary: React.FC<DefinitionsGlossaryProps> = ({
  definitions,
  topicTitle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = definitions.filter(
    (d) =>
      d.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = (def: DefinitionItem) => {
    const text = `${def.term}: ${def.definition}${def.formula ? `\nScripture / Root: ${def.formula}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(def.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-stone-200 rounded-2xl p-4">
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <BookOpen className="w-4 h-4 text-amber-700" />
          <span className="font-bold text-stone-900 font-display tabular-nums">
            Biblical Key Terms & Original Greek/Hebrew Roots ({filtered.length} of {definitions.length})
          </span>
          <span aria-hidden="true">·</span>
          <a
            href={buildChannelVideoSearchUrl(topicTitle)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-rose-700 hover:underline font-semibold inline-flex items-center gap-1"
          >
            <Youtube className="w-3.5 h-3.5" />
            Topic Videos
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search biblical terms..."
            className="w-full bg-[#FBF9F5] border border-stone-200 focus:border-amber-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Definitions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-stone-200 hover:border-amber-700/50 rounded-2xl p-5 transition-colors flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-base font-bold text-stone-900 font-editorial">
                  {item.term}
                </h3>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleSpeak(`${item.term}. ${item.definition}`)}
                    className="p-1 text-stone-400 hover:text-amber-800 rounded transition-colors"
                    title="Listen"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleCopy(item)}
                    className="p-1 text-stone-400 hover:text-amber-800 rounded transition-colors"
                    title="Copy Biblical Term"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans-ui">
                {item.definition}
              </p>

              {item.formula && (
                <div className="mt-3 bg-[#FBF9F5] border border-stone-200 rounded-xl p-2.5 flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider shrink-0">
                    Scripture & Root:
                  </span>
                  <code className="text-xs font-code text-stone-800 font-semibold truncate">
                    {item.formula}
                  </code>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-3 border-t border-stone-100 text-xs">
              {item.analogy && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-2.5 text-amber-950 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="leading-relaxed text-xs">
                    <span className="font-semibold">Gospel Picture: </span>
                    {item.analogy}
                  </div>
                </div>
              )}

              {item.example && (
                <div className="text-[11px] text-stone-500 pl-1">
                  <span className="font-semibold text-stone-700">Biblical Example: </span>
                  {item.example}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center text-stone-500 text-xs">
          No matching biblical terms found for "{searchQuery}".
        </div>
      )}
    </div>
  );
};
