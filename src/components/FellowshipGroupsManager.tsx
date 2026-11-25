import React, { useState } from 'react';
import {
  Users,
  Plus,
  Video,
  BookOpen,
  Copy,
  Check,
  ExternalLink,
  Clock,
  Youtube,
  HeartHandshake,
} from 'lucide-react';
import { FellowshipGroup, GospelPillar, GospelSession } from '../types';
import { GOSPEL_PILLAR_LIST, JESUS_NEVER_FAILS_CHANNEL_URL } from '../data/gospelData';

interface FellowshipGroupsManagerProps {
  fellowships: FellowshipGroup[];
  currentFellowship: FellowshipGroup;
  onSelectFellowship: (fellowship: FellowshipGroup) => void;
  onAddFellowship: (newFellowship: FellowshipGroup) => void;
  sessions: GospelSession[];
  onOpenPrayerRoom?: () => void;
}

export const FellowshipGroupsManager: React.FC<FellowshipGroupsManagerProps> = ({
  fellowships,
  currentFellowship,
  onSelectFellowship,
  onAddFellowship,
  sessions,
  onOpenPrayerRoom,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [focusScripture, setFocusScripture] = useState('');
  const [pillar, setPillar] = useState<GospelPillar>('Faith & Miracles');
  const [memberCount, setMemberCount] = useState(1);
  const [meetingLink, setMeetingLink] = useState('');
  const [scheduleTime, setScheduleTime] = useState('Sundays at 7:00 PM');
  const [selectedSessionId, setSelectedSessionId] = useState(sessions[0]?.id || '');

  const handleCreateFellowship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !focusScripture.trim()) return;

    const newId = `fellowship-${Date.now().toString(36)}`;
    const randomMeet = `https://meet.google.com/${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;

    const newGroup: FellowshipGroup = {
      id: newId,
      name: name.trim(),
      focusScripture: focusScripture.trim(),
      pillar,
      memberCount: Math.max(1, Number(memberCount) || 1),
      meetingLink: meetingLink.trim() || randomMeet,
      currentSessionId: selectedSessionId || sessions[0]?.id || '',
      scheduleTime: scheduleTime.trim() || 'Weekly Fellowship',
    };

    onAddFellowship(newGroup);
    setShowAddModal(false);
    setName('');
    setFocusScripture('');
  };

  const copyMeet = (id: string, link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLinkId(id);
    setTimeout(() => setCopiedLinkId(null), 2200);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
            <HeartHandshake className="w-4 h-4 text-amber-800" />
            <span className="font-semibold text-amber-800">House Churches & Prayer Circles</span>
            <span aria-hidden="true">·</span>
            <span>Jesus Never Fail Ministries</span>
          </div>
          <h3 className="text-xl font-bold text-stone-900 font-editorial">
            Gospel Fellowship & Intercession Groups
          </h3>
          <p className="text-xs text-stone-600 max-w-2xl leading-relaxed mt-1">
            Gather believers across families, house fellowships, and prayer altars. Each circle connects directly to a Gospel Scripture study, Google Meet prayer room, and the Jesus Never Fail Ministries YouTube channel.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center gap-2 shrink-0 transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Start Fellowship Group</span>
        </button>
      </div>

      {/* Fellowship Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fellowships.map((group) => {
          const isSelected = group.id === currentFellowship.id;
          const assignedSession = sessions.find((s) => s.id === group.currentSessionId);

          return (
            <div
              key={group.id}
              className={`bg-white border rounded-2xl p-5 transition-colors space-y-4 ${
                isSelected ? 'border-amber-700 bg-[#FFFDF9]' : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs text-stone-500">
                    <span className="font-semibold text-amber-800">{group.pillar}</span>
                    <span aria-hidden="true"> · </span>
                    <span className="tabular-nums">{group.memberCount} believers</span>
                  </div>
                  <h4 className="text-base font-bold text-stone-900 font-editorial mt-1">
                    {group.name}
                  </h4>
                  <p className="text-xs text-stone-600 mt-0.5">{group.focusScripture}</p>
                </div>

                {isSelected && (
                  <span className="text-xs font-semibold text-emerald-700">Active</span>
                )}
              </div>

              <div className="text-xs text-stone-600 space-y-1.5 pt-2 border-t border-stone-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>{group.scheduleTime}</span>
                </div>
                {assignedSession && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                    <span className="truncate font-medium text-stone-800">{assignedSession.title}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  onClick={() => onSelectFellowship(group)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                    isSelected
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                  }`}
                >
                  {isSelected ? 'Active Fellowship' : 'Switch to Group'}
                </button>

                {onOpenPrayerRoom ? (
                  <button
                    onClick={() => {
                      onSelectFellowship(group);
                      onOpenPrayerRoom();
                    }}
                    className="py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Prayer Room</span>
                  </button>
                ) : (
                  <a
                    href={group.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Meet</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                <button
                  onClick={() => copyMeet(group.id, group.meetingLink)}
                  className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                  title="Copy fellowship meeting link"
                >
                  {copiedLinkId === group.id ? (
                    <Check className="w-4 h-4 text-emerald-700" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Fellowship Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h4 className="text-lg font-bold text-stone-900 font-editorial">
              Create Prayer or Bible Fellowship Group
            </h4>

            <form onSubmit={handleCreateFellowship} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Fellowship Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Evening Psalm 91 Prayer Circle"
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Scripture Focus</label>
                <input
                  type="text"
                  required
                  value={focusScripture}
                  onChange={(e) => setFocusScripture(e.target.value)}
                  placeholder="e.g. Gospel of John & Prayer Promises"
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Gospel Pillar</label>
                  <select
                    value={pillar}
                    onChange={(e) => setPillar(e.target.value as GospelPillar)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-stone-900"
                  >
                    {GOSPEL_PILLAR_LIST.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Members Count</label>
                  <input
                    type="number"
                    min={1}
                    value={memberCount}
                    onChange={(e) => setMemberCount(Number(e.target.value))}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Gathering Time</label>
                <input
                  type="text"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  placeholder="e.g. Fridays at 7:30 PM"
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Gospel Study Topic</label>
                <select
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-stone-900"
                >
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold"
                >
                  Create Fellowship
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
