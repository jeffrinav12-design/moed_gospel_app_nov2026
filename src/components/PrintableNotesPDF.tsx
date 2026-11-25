import React from 'react';
import { GospelSession } from '../types';

interface PrintableNotesPDFProps {
  session: GospelSession;
}

export const PrintableNotesPDF: React.FC<PrintableNotesPDFProps> = ({ session }) => {
  return (
    <div className="hidden print:block p-8 bg-white text-stone-900 font-sans-ui max-w-4xl mx-auto space-y-6">
      {/* Printable Devotional Sheet Header */}
      <div className="border-b-2 border-stone-900 pb-4 flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-editorial text-stone-900">
            MOED · Jesus Never Fail Ministries Gospel Study & Devotional Guide
          </h1>
          <p className="text-sm font-semibold text-stone-700 font-display mt-0.5">
            {session.pillar} · {session.scriptureBook}
          </p>
          <p className="text-xs text-stone-600 mt-1">
            Topic: <span className="font-bold text-stone-900">{session.title}</span>
          </p>
        </div>

        <div className="text-right text-xs text-stone-600 font-sans-ui shrink-0">
          <div>Fellowship: {session.fellowshipName}</div>
          <div>YouTube: {session.channelReference}</div>
          <div className="font-code text-[10px] mt-1">{session.youtubeChannelUrl}</div>
        </div>
      </div>

      {/* Anchor Scripture & Gospel Summary */}
      <div className="border border-stone-300 rounded-lg p-3.5 bg-stone-50 text-xs leading-relaxed space-y-1.5 print-break-inside-avoid">
        <div className="font-bold text-stone-900 font-editorial text-sm">
          "{session.anchorVerse}"
        </div>
        <p className="text-stone-700">{session.summary}</p>
      </div>

      {/* Linked YouTube Videos */}
      {session.suggestedVideos && session.suggestedVideos.length > 0 && (
        <div className="space-y-1.5 print-break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-wide border-b border-stone-300 pb-1 font-display">
            Suggested Jesus Never Fail Ministries YouTube Channel Videos
          </h2>
          <ul className="list-disc list-inside text-xs space-y-1 text-stone-800">
            {session.suggestedVideos.map((v) => (
              <li key={v.id}>
                <span className="font-semibold">{v.title}</span> ({v.category} · {v.scriptureReference} · {v.duration})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Section 1: Key Biblical Terms */}
      <div className="space-y-2 print-break-inside-avoid">
        <h2 className="text-base font-bold uppercase tracking-wide border-b border-stone-300 pb-1 font-display">
          1. Key Biblical Terms & Root Meanings
        </h2>
        <div className="space-y-2.5 pt-1">
          {session.definitions.map((def, idx) => (
            <div key={def.id} className="text-xs space-y-0.5">
              <div className="font-bold text-stone-900 font-display">
                {idx + 1}. {def.term}
              </div>
              <p className="text-stone-800 leading-relaxed">{def.definition}</p>
              {def.formula && (
                <div className="font-code text-[11px] font-semibold text-stone-800 bg-stone-100 px-2 py-0.5 inline-block rounded">
                  Reference: {def.formula}
                </div>
              )}
              {def.analogy && (
                <div className="text-[11px] text-stone-600 italic">
                  Illustration: {def.analogy}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Sermon & Scripture Study Notes */}
      <div className="space-y-2 print-break-inside-avoid">
        <h2 className="text-base font-bold uppercase tracking-wide border-b border-stone-300 pb-1 font-display">
          2. Gospel Study Notes
        </h2>
        <div className="space-y-3 pt-1">
          {session.studyNotes.map((note, idx) => (
            <div key={idx} className="text-xs space-y-1">
              <h3 className="font-bold text-stone-900 font-display">{note.title}</h3>
              <ul className="list-disc list-inside space-y-0.5 text-stone-800">
                {note.bullets.map((b, bIdx) => (
                  <li key={bIdx}>{b}</li>
                ))}
              </ul>
              {note.formulaBox && (
                <div className="font-code text-[11px] bg-stone-100 p-1.5 rounded font-semibold text-stone-900 border border-stone-200">
                  {note.formulaBox}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Prayer Focus */}
      {session.prayerPoints && (
        <div className="border border-amber-300 rounded-lg p-3 text-xs bg-amber-50/50 print-break-inside-avoid">
          <span className="font-bold uppercase text-amber-900 block mb-1 font-display">
            Prayer & Intercession Points:
          </span>
          <p className="text-stone-800 whitespace-pre-line">{session.prayerPoints}</p>
        </div>
      )}

      {/* Section 3: Gospel Quiz */}
      <div className="space-y-2 print-break-inside-avoid">
        <h2 className="text-base font-bold uppercase tracking-wide border-b border-stone-300 pb-1 font-display">
          3. Gospel Scripture Quiz
        </h2>
        <div className="space-y-2 pt-1 text-xs">
          {session.quiz.map((q, idx) => (
            <div key={q.id} className="border-b border-stone-200 pb-1.5">
              <div className="font-semibold text-stone-900 font-display">
                Q{idx + 1}: {q.question}
              </div>
              <div className="grid grid-cols-2 gap-1 text-[11px] text-stone-700 mt-1">
                {q.options.map((opt, oIdx) => (
                  <div
                    key={oIdx}
                    className={oIdx === q.correctIndex ? 'font-bold text-stone-900' : ''}
                  >
                    ({String.fromCharCode(65 + oIdx)}) {opt} {oIdx === q.correctIndex && '✓'}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-stone-500 mt-0.5 italic">
                Insight: {q.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Assertion & Reason */}
      {session.assertionReasons && session.assertionReasons.length > 0 && (
        <div className="space-y-2 print-break-inside-avoid">
          <h2 className="text-base font-bold uppercase tracking-wide border-b border-stone-300 pb-1 font-display">
            4. Scripture Assertion & Reason
          </h2>
          <div className="space-y-3 pt-1 text-xs">
            {session.assertionReasons.map((ar, idx) => (
              <div key={ar.id} className="border-b border-stone-200 pb-2 space-y-1">
                <div className="font-bold text-stone-900">
                  Q{idx + 1}. Assertion (A): "{ar.assertion}"
                </div>
                <div className="font-semibold text-stone-700 pl-4">
                  Reason (R): "{ar.reason}"
                </div>
                <div className="text-[11px] font-semibold text-emerald-900 bg-emerald-50 p-1.5 rounded mt-1 border border-emerald-200">
                  Correct Option: ({ar.correctOption}) · {ar.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 5: Biblical Reason */}
      {session.giveReasons && session.giveReasons.length > 0 && (
        <div className="space-y-2 print-break-inside-avoid">
          <h2 className="text-base font-bold uppercase tracking-wide border-b border-stone-300 pb-1 font-display">
            5. Give Biblical Reason
          </h2>
          <div className="space-y-3 pt-1 text-xs">
            {session.giveReasons.map((gr, idx) => (
              <div key={gr.id} className="border-b border-stone-200 pb-2 space-y-1">
                <div className="font-bold text-stone-900">
                  Q{idx + 1}. "{gr.statement}"
                </div>
                <div className="text-[11px] bg-stone-50 p-2 rounded text-stone-800 border border-stone-200">
                  <span className="font-bold block text-stone-900">Scriptural Key Points:</span>
                  <ul className="list-disc list-inside space-y-0.5 mt-0.5">
                    {gr.reasonPoints.map((pt, pIdx) => (
                      <li key={pIdx}>{pt}</li>
                    ))}
                  </ul>
                  <div className="mt-1 font-editorial italic text-stone-700">
                    Biblical Summary: {gr.modelAnswer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 6: Covenant & Scripture Matrix */}
      {session.differentiations && session.differentiations.length > 0 && (
        <div className="space-y-2 print-break-inside-avoid">
          <h2 className="text-base font-bold uppercase tracking-wide border-b border-stone-300 pb-1 font-display">
            6. Scripture Contrast Matrix
          </h2>
          <div className="space-y-4 pt-1 text-xs">
            {session.differentiations.map((diff) => (
              <div key={diff.id} className="space-y-1.5">
                <div className="font-bold text-stone-900">{diff.topicHeading}</div>
                <table className="w-full border-collapse border border-stone-300 text-[11px]">
                  <thead>
                    <tr className="bg-stone-100">
                      <th className="border border-stone-300 p-1.5 text-left w-1/4">Theme</th>
                      <th className="border border-stone-300 p-1.5 text-left w-3/8 font-bold">
                        {diff.conceptA}
                      </th>
                      <th className="border border-stone-300 p-1.5 text-left w-3/8 font-bold">
                        {diff.conceptB}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {diff.rows.map((row, rIdx) => (
                      <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                        <td className="border border-stone-300 p-1.5 font-semibold text-stone-900">
                          {row.parameter}
                        </td>
                        <td className="border border-stone-300 p-1.5 text-stone-800">
                          {row.conceptAValue}
                        </td>
                        <td className="border border-stone-300 p-1.5 text-stone-800">
                          {row.conceptBValue}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-stone-300 pt-3 text-center text-[10px] text-stone-500 font-sans-ui">
        MOED · Jesus Never Fail Ministries — {session.youtubeChannelUrl}
      </div>
    </div>
  );
};
