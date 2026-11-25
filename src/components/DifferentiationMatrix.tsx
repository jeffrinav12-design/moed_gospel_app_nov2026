import React, { useState } from 'react';
import { DifferentiationItem } from '../types';
import {
  Split,
  Eye,
  EyeOff,
  Sparkles,
  Copy,
  Check,
  Youtube,
  ExternalLink,
} from 'lucide-react';
import { buildChannelVideoSearchUrl } from '../data/gospelData';

interface DifferentiationMatrixProps {
  items?: DifferentiationItem[];
  topicTitle: string;
  bookReference?: string;
}

export const DifferentiationMatrix: React.FC<DifferentiationMatrixProps> = ({
  items = [],
  topicTitle,
  bookReference,
}) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [testRecallMode, setTestRecallMode] = useState(false);
  const [revealedCells, setRevealedCells] = useState<Record<string, boolean>>({});
  const [copiedNotification, setCopiedNotification] = useState(false);

  if (!items || items.length === 0) {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center text-stone-500">
        <Split className="w-12 h-12 mx-auto text-stone-300 mb-3" />
        <h3 className="text-lg font-semibold text-stone-800 font-editorial">
          No Covenant Comparison Tables Yet
        </h3>
        <p className="text-sm mt-1 max-w-md mx-auto">
          Select another Gospel topic or generate Scripture comparisons using the Gospel Study Builder.
        </p>
      </div>
    );
  }

  const currentItem = items[selectedIdx] || items[0];

  const toggleCell = (key: string) => {
    setRevealedCells((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleCopyTable = () => {
    let text = `${currentItem.topicHeading}\n\n`;
    text += `Theme | ${currentItem.conceptA} | ${currentItem.conceptB}\n`;
    text += `---|---|---\n`;
    currentItem.rows.forEach((r) => {
      text += `${r.parameter} | ${r.conceptAValue} | ${r.conceptBValue}\n`;
    });
    text += `\nGospel Takeaway: ${currentItem.keyTakeaway}`;

    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1 flex-wrap">
            <span className="font-semibold text-amber-800">Scripture & Covenant Contrast</span>
            {bookReference && (
              <>
                <span aria-hidden="true">·</span>
                <span>{bookReference}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <a
              href={buildChannelVideoSearchUrl(topicTitle)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-700 hover:underline font-medium inline-flex items-center gap-1"
            >
              <Youtube className="w-3.5 h-3.5" />
              Watch Teaching on Channel
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <h2 className="text-xl font-bold text-stone-900 font-editorial">
            Biblical Contrast & Covenant Matrix
          </h2>
          <p className="text-sm text-stone-500 mt-0.5">
            Side-by-side Scripture comparison clarifying Old vs New Covenant promises and life in the Spirit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTestRecallMode(!testRecallMode)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition ${
              testRecallMode
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            {testRecallMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {testRecallMode ? 'Memory Practice Active' : 'Hide Cells to Reflect'}
          </button>

          <button
            onClick={handleCopyTable}
            className="p-2 text-stone-600 hover:text-stone-900 border border-stone-200 rounded-xl hover:bg-stone-50 transition"
            title="Copy Matrix"
          >
            {copiedNotification ? (
              <Check className="w-4 h-4 text-emerald-700" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {items.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {items.map((it, idx) => (
            <button
              key={it.id}
              onClick={() => {
                setSelectedIdx(idx);
                setRevealedCells({});
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                selectedIdx === idx
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
              }`}
            >
              {it.topicHeading}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        <div className="bg-[#FBF9F5] border-b border-stone-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-0.5">
              Biblical Comparison
            </div>
            <h3 className="text-lg font-bold text-stone-900 font-editorial">
              {currentItem.topicHeading}
            </h3>
          </div>
          {testRecallMode && (
            <div className="text-xs text-amber-900 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
              Click any covered cell to reveal the Scripture distinction.
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-stone-100/80 text-stone-700 text-xs font-bold uppercase tracking-wider border-b border-stone-200">
                <th className="py-4 px-6 w-1/4">Biblical Theme</th>
                <th className="py-4 px-6 w-3/8 text-amber-900 bg-amber-50/40 border-x border-stone-200">
                  {currentItem.conceptA}
                </th>
                <th className="py-4 px-6 w-3/8 text-blue-900 bg-blue-50/40">
                  {currentItem.conceptB}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {currentItem.rows.map((row, rIdx) => {
                const cellAKey = `${currentItem.id}-${rIdx}-A`;
                const cellBKey = `${currentItem.id}-${rIdx}-B`;

                const isAHidden = testRecallMode && !revealedCells[cellAKey];
                const isBHidden = testRecallMode && !revealedCells[cellBKey];

                return (
                  <tr key={rIdx} className="hover:bg-[#FBF9F5] transition">
                    <td className="py-4 px-6 font-semibold text-stone-900 text-xs sm:text-sm">
                      {row.parameter}
                    </td>

                    <td
                      onClick={() => testRecallMode && toggleCell(cellAKey)}
                      className={`py-4 px-6 text-stone-700 text-xs sm:text-sm leading-relaxed border-x border-stone-200 ${
                        testRecallMode ? 'cursor-pointer' : ''
                      }`}
                    >
                      {isAHidden ? (
                        <div className="text-amber-800 font-code text-xs bg-amber-50 px-3 py-2 rounded-lg text-center border border-amber-200">
                          Click to reveal
                        </div>
                      ) : (
                        row.conceptAValue
                      )}
                    </td>

                    <td
                      onClick={() => testRecallMode && toggleCell(cellBKey)}
                      className={`py-4 px-6 text-stone-700 text-xs sm:text-sm leading-relaxed ${
                        testRecallMode ? 'cursor-pointer' : ''
                      }`}
                    >
                      {isBHidden ? (
                        <div className="text-blue-800 font-code text-xs bg-blue-50 px-3 py-2 rounded-lg text-center border border-blue-200">
                          Click to reveal
                        </div>
                      ) : (
                        row.conceptBValue
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {currentItem.keyTakeaway && (
          <div className="p-5 bg-[#FBF9F5] border-t border-stone-200 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-xs uppercase tracking-wider text-amber-900 block mb-0.5">
                Core Gospel Truth:
              </span>
              <p className="text-xs sm:text-sm text-stone-800 font-medium">
                {currentItem.keyTakeaway}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
