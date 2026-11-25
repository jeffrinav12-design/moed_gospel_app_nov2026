import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  PenTool,
  Eraser,
  RotateCcw,
  Download,
  Printer,
  Lightbulb,
  Copy,
  Check,
  Youtube,
  ExternalLink,
} from 'lucide-react';
import { StudyNoteSection } from '../types';
import { buildChannelVideoSearchUrl } from '../data/gospelData';

interface StudyNotesAndWhiteboardProps {
  studyNotes: StudyNoteSection[];
  quickTips: string[];
  prayerPoints: string;
  topicTitle: string;
}

const COLORS = ['#ffffff', '#fcd34d', '#6ee7b7', '#93c5fd', '#fda4af', '#c4b5fd'];

export const StudyNotesAndWhiteboard: React.FC<StudyNotesAndWhiteboardProps> = ({
  studyNotes,
  quickTips,
  prayerPoints,
  topicTitle,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'notes' | 'board'>('notes');
  const [copiedNotes, setCopiedNotes] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [lineWidth, setLineWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);

  useEffect(() => {
    if (activeSubTab !== 'board') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = 420 * 2;
    ctx.scale(2, 2);

    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, rect.width, 420);

    if (prayerPoints) {
      ctx.fillStyle = '#e7e5e4';
      ctx.font = '14px monospace';
      const lines = prayerPoints.split('\n');
      lines.forEach((line, index) => {
        ctx.fillText(line, 24, 36 + index * 24);
      });
    }
  }, [activeSubTab, prayerPoints]);

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.strokeStyle = isEraser ? '#1c1917' : color;
    ctx.lineWidth = isEraser ? lineWidth * 4 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, rect.width, 420);
  };

  const handleDownloadBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `gospel-notes-${topicTitle.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleCopyAllNotes = () => {
    const text = studyNotes
      .map(
        (s) =>
          `${s.title}\n${s.bullets.map((b) => `• ${b}`).join('\n')}${
            s.formulaBox ? `\nScripture Anchor: ${s.formulaBox}` : ''
          }`
      )
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopiedNotes(true);
    setTimeout(() => setCopiedNotes(false), 2000);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Top Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-stone-200 rounded-2xl p-3">
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl text-xs font-display">
          <button
            onClick={() => setActiveSubTab('notes')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              activeSubTab === 'notes'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Sermon & Gospel Notes</span>
          </button>

          <button
            onClick={() => setActiveSubTab('board')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              activeSubTab === 'board'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Prayer Sketch Board</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={buildChannelVideoSearchUrl(topicTitle)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-rose-700 hover:underline inline-flex items-center gap-1 px-2"
          >
            <Youtube className="w-3.5 h-3.5" />
            <span>Channel Videos</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {activeSubTab === 'notes' ? (
            <>
              <button
                onClick={handleCopyAllNotes}
                className="text-xs bg-[#FBF9F5] hover:bg-stone-100 text-stone-700 px-3 py-1.5 rounded-lg border border-stone-200 flex items-center gap-1 transition-colors font-medium"
              >
                {copiedNotes ? (
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-amber-700" />
                )}
                <span>{copiedNotes ? 'Copied' : 'Copy Notes'}</span>
              </button>
              <button
                onClick={() => window.print()}
                className="text-xs bg-stone-900 hover:bg-stone-800 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors font-display"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleClearCanvas}
                className="text-stone-500 hover:text-stone-900 p-1.5 rounded-lg hover:bg-stone-100"
                title="Clear Board"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDownloadBoard}
                className="text-xs bg-[#FBF9F5] hover:bg-stone-100 text-stone-700 px-3 py-1.5 rounded-lg border border-stone-200 flex items-center gap-1 transition-colors font-medium"
              >
                <Download className="w-3.5 h-3.5 text-amber-700" />
                <span>Save Sketch</span>
              </button>
            </>
          )}
        </div>
      </div>

      {activeSubTab === 'notes' ? (
        <div className="space-y-4">
          {quickTips.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 uppercase tracking-wider text-[10px] font-display">
                <Lightbulb className="w-4 h-4 text-amber-700" />
                <span>Daily Christian Walk Takeaways</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-amber-950 text-xs">
                {quickTips.map((tip, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {prayerPoints && (
            <div className="bg-white border border-stone-200 rounded-2xl p-4 text-xs space-y-1">
              <div className="font-bold text-stone-900 uppercase tracking-wider text-[10px] font-display">
                Prayer Focus for "{topicTitle}"
              </div>
              <p className="text-stone-700 leading-relaxed whitespace-pre-line">{prayerPoints}</p>
            </div>
          )}

          <div className="space-y-4">
            {studyNotes.map((section, idx) => (
              <div key={idx} className="bg-white border border-stone-200 rounded-2xl p-6 space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-stone-900 font-editorial">
                  {section.title}
                </h3>

                <ul className="space-y-2 text-xs sm:text-sm text-stone-700 list-disc pl-5 marker:text-amber-700">
                  {section.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="leading-relaxed">
                      {bullet}
                    </li>
                  ))}
                </ul>

                {section.formulaBox && (
                  <div className="mt-3 bg-[#FBF9F5] border border-stone-200 rounded-xl p-3 text-xs font-editorial italic text-stone-900">
                    <span className="text-[10px] uppercase font-bold not-italic text-amber-800 block mb-0.5 font-display">
                      Anchor Verse:
                    </span>
                    {section.formulaBox}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-stone-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-stone-500 font-medium">Chalk:</span>
              <div className="flex items-center gap-1.5">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setColor(c);
                      setIsEraser(false);
                    }}
                    style={{ backgroundColor: c }}
                    className={`w-5 h-5 rounded-full transition-transform ${
                      color === c && !isEraser
                        ? 'scale-125 ring-2 ring-amber-700'
                        : 'opacity-80 hover:opacity-100 border border-stone-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 font-display">
                <button
                  type="button"
                  onClick={() => setIsEraser(false)}
                  className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1 ${
                    !isEraser
                      ? 'bg-stone-900 border-stone-900 text-white font-semibold'
                      : 'bg-[#FBF9F5] border-stone-200 text-stone-700'
                  }`}
                >
                  <PenTool className="w-3 h-3" />
                  <span>Pen</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEraser(true)}
                  className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1 ${
                    isEraser
                      ? 'bg-stone-900 border-stone-900 text-white font-semibold'
                      : 'bg-[#FBF9F5] border-stone-200 text-stone-700'
                  }`}
                >
                  <Eraser className="w-3 h-3" />
                  <span>Eraser</span>
                </button>
              </div>

              <div className="flex items-center gap-1 text-stone-500">
                <span>Size:</span>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={lineWidth}
                  onChange={(e) => setLineWidth(Number(e.target.value))}
                  className="w-20 accent-amber-700"
                />
              </div>
            </div>
          </div>

          <div className="border border-stone-300 rounded-xl overflow-hidden bg-stone-900">
            <canvas
              ref={canvasRef}
              style={{ width: '100%', height: '420px', touchAction: 'none' }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="cursor-crosshair w-full block"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-500">
            <span>Sketch sermon outlines, Scripture verses, or fellowship prayer points.</span>
            <span>Touch & Stylus Ready</span>
          </div>
        </div>
      )}
    </div>
  );
};
