import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  CheckCircle2,
  ChevronRight,
  Video,
  Youtube,
  ExternalLink,
  Target,
  Award,
  HeartHandshake,
} from 'lucide-react';
import { GospelSession, TopicProgressItem, UserProfile } from '../types';
import {
  JESUS_NEVER_FAILS_CHANNEL_URL,
  buildChannelVideoSearchUrl,
} from '../data/gospelData';

type ProgressTaskKey =
  | 'quizDone'
  | 'arDone'
  | 'cbqDone'
  | 'giveReasonDone'
  | 'diffDone'
  | 'subjectiveDone';

interface ProgressDashboardProps {
  sessions: GospelSession[];
  currentSession: GospelSession;
  userProfile: UserProfile;
  currentUserGoogle?: {
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
  } | null;
  topicProgress: Record<string, TopicProgressItem>;
  onToggleTask: (sessionId: string, taskKey: ProgressTaskKey) => void;
  onNavigateToTab: (tab: any) => void;
  onSelectSession: (sessionId: string) => void;
}

const PILLAR_COLORS: Record<string, string> = {
  'Salvation & Grace': '#9a3412',
  'Faith & Miracles': '#1e3a8a',
  'Prayer & Intercession': '#14532d',
  'Holy Spirit & Revival': '#b45309',
  'Kingdom Discipleship': '#57534e',
  'Psalms & Worship': '#9f1239',
};

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  sessions,
  userProfile,
  currentUserGoogle,
  topicProgress,
  onToggleTask,
  onNavigateToTab,
  onSelectSession,
}) => {
  const [selectedPillarFilter, setSelectedPillarFilter] = useState<string>('All');

  const pillarsList = [
    'All',
    'Salvation & Grace',
    'Faith & Miracles',
    'Prayer & Intercession',
    'Holy Spirit & Revival',
    'Kingdom Discipleship',
    'Psalms & Worship',
  ];

  // Aggregate real counts across all Gospel sessions from live topicProgress state
  let totalQuiz = 0;
  let totalAR = 0;
  let totalCBQ = 0;
  let totalGR = 0;
  let totalDiff = 0;
  let totalSubj = 0;

  let compQuiz = 0;
  let compAR = 0;
  let compCBQ = 0;
  let compGR = 0;
  let compDiff = 0;
  let compSubj = 0;

  let fullyCompletedTopics = 0;

  const pillarStats: Record<string, { totalModes: number; doneModes: number; count: number }> = {
    'Salvation & Grace': { totalModes: 0, doneModes: 0, count: 0 },
    'Faith & Miracles': { totalModes: 0, doneModes: 0, count: 0 },
    'Prayer & Intercession': { totalModes: 0, doneModes: 0, count: 0 },
    'Holy Spirit & Revival': { totalModes: 0, doneModes: 0, count: 0 },
    'Kingdom Discipleship': { totalModes: 0, doneModes: 0, count: 0 },
    'Psalms & Worship': { totalModes: 0, doneModes: 0, count: 0 },
  };

  sessions.forEach((s) => {
    totalQuiz += s.quiz?.length || 1;
    totalAR += s.assertionReasons?.length || 1;
    totalCBQ += s.caseBasedQuestions?.length || 1;
    totalGR += s.giveReasons?.length || 1;
    totalDiff += s.differentiations?.length || 1;
    totalSubj += (s.shortAnswers?.length || 1) + (s.longAnswers?.length || 1);

    const prog = topicProgress[s.id];
    if (prog?.quizDone) compQuiz += s.quiz?.length || 1;
    if (prog?.arDone) compAR += s.assertionReasons?.length || 1;
    if (prog?.cbqDone) compCBQ += s.caseBasedQuestions?.length || 1;
    if (prog?.giveReasonDone) compGR += s.giveReasons?.length || 1;
    if (prog?.diffDone) compDiff += s.differentiations?.length || 1;
    if (prog?.subjectiveDone) compSubj += (s.shortAnswers?.length || 1) + (s.longAnswers?.length || 1);

    const doneFlags = [
      Boolean(prog?.quizDone),
      Boolean(prog?.arDone),
      Boolean(prog?.cbqDone),
      Boolean(prog?.giveReasonDone),
      Boolean(prog?.diffDone),
      Boolean(prog?.subjectiveDone),
    ].filter(Boolean).length;

    if (doneFlags === 6) {
      fullyCompletedTopics += 1;
    }

    const pKey = s.pillar in pillarStats ? s.pillar : 'Faith & Miracles';
    pillarStats[pKey].totalModes += 6;
    pillarStats[pKey].doneModes += doneFlags;
    pillarStats[pKey].count += 1;
  });

  const radarData = [
    {
      pillar: 'Salvation',
      mastery: Math.round(
        (pillarStats['Salvation & Grace'].doneModes /
          Math.max(1, pillarStats['Salvation & Grace'].totalModes)) *
          100
      ),
      target: 100,
    },
    {
      pillar: 'Faith',
      mastery: Math.round(
        (pillarStats['Faith & Miracles'].doneModes /
          Math.max(1, pillarStats['Faith & Miracles'].totalModes)) *
          100
      ),
      target: 100,
    },
    {
      pillar: 'Prayer',
      mastery: Math.round(
        (pillarStats['Prayer & Intercession'].doneModes /
          Math.max(1, pillarStats['Prayer & Intercession'].totalModes)) *
          100
      ),
      target: 100,
    },
    {
      pillar: 'Holy Spirit',
      mastery: Math.round(
        (pillarStats['Holy Spirit & Revival'].doneModes /
          Math.max(1, pillarStats['Holy Spirit & Revival'].totalModes)) *
          100
      ),
      target: 100,
    },
    {
      pillar: 'Discipleship',
      mastery: Math.round(
        (pillarStats['Kingdom Discipleship'].doneModes /
          Math.max(1, pillarStats['Kingdom Discipleship'].totalModes)) *
          100
      ),
      target: 100,
    },
    {
      pillar: 'Psalms',
      mastery: Math.round(
        (pillarStats['Psalms & Worship'].doneModes /
          Math.max(1, pillarStats['Psalms & Worship'].totalModes)) *
          100
      ),
      target: 100,
    },
  ];

  const studyModeBarData = [
    { name: 'Gospel Quiz', Total: totalQuiz, Completed: compQuiz },
    { name: 'Scripture A&R', Total: totalAR, Completed: compAR },
    { name: 'Parable Studies', Total: totalCBQ, Completed: compCBQ },
    { name: 'Biblical Reason', Total: totalGR, Completed: compGR },
    { name: 'Covenant Matrix', Total: totalDiff, Completed: compDiff },
    { name: 'Reflections', Total: totalSubj, Completed: compSubj },
  ];

  const totalDoneModesAcrossAll = Object.values(pillarStats).reduce(
    (sum, item) => sum + item.doneModes,
    0
  );

  const pieData = Object.entries(pillarStats).map(([name, stat]) => ({
    name,
    value: totalDoneModesAcrossAll > 0 ? stat.doneModes : stat.count || 1,
    color: PILLAR_COLORS[name] || '#57534e',
  }));

  const filteredSessions =
    selectedPillarFilter === 'All'
      ? sessions
      : sessions.filter((s) => s.pillar === selectedPillarFilter);

  const totalItems = totalQuiz + totalAR + totalCBQ + totalGR + totalDiff + totalSubj;
  const completedItems = compQuiz + compAR + compCBQ + compGR + compDiff + compSubj;
  const overallCompletion = Math.round((completedItems / Math.max(1, totalItems)) * 100);
  const activeEmail = currentUserGoogle?.email || userProfile.email;

  return (
    <div className="space-y-6">
      {/* Header Summary Card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 pb-5">
          <div>
            <div className="text-xs text-stone-500 flex items-center gap-2">
              <span className="font-semibold text-amber-800">Real Spiritual Growth Tracker</span>
              <span aria-hidden="true">·</span>
              <span>@jesusneverfails7649</span>
            </div>
            <h2 className="text-2xl font-bold text-stone-900 font-editorial mt-1">
              Gospel Partner Progress & Scripture Mastery
            </h2>
            <p className="text-xs text-stone-600 mt-1">
              Updates automatically as you finish Gospel quizzes, Assertion-Reason checks, and reflections—or toggle modules manually below.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <a
              href={JESUS_NEVER_FAILS_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>@jesusneverfails7649</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={() => onNavigateToTab('online-class')}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Join Prayer Room</span>
            </button>
          </div>
        </div>

        {/* 4 Real Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#FBF9F5] border border-stone-200 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>Scripture Mastery</span>
              <Target className="w-4 h-4 text-amber-800" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-bold text-stone-900 font-editorial tabular-nums">
              {overallCompletion}%
            </div>
            <div className="mt-2 w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-800 h-full rounded-full transition-all duration-300"
                style={{ width: `${overallCompletion}%` }}
              />
            </div>
          </div>

          <div className="bg-[#FBF9F5] border border-stone-200 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>Exercises Completed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-stone-900 font-editorial tabular-nums">
                {completedItems}
              </span>
              <span className="text-xs text-stone-500 tabular-nums">/ {totalItems} prompts</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">Across active Gospel topics</p>
          </div>

          <div className="bg-[#FBF9F5] border border-stone-200 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>Completed Studies</span>
              <Award className="w-4 h-4 text-rose-700" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-stone-900 font-editorial tabular-nums">
                {fullyCompletedTopics}
              </span>
              <span className="text-xs text-stone-500 tabular-nums">/ {sessions.length} topics</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">All 6 study modes completed</p>
          </div>

          <div className="bg-[#FBF9F5] border border-stone-200 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>Partner Sync</span>
              <HeartHandshake className="w-4 h-4 text-indigo-800" />
            </div>
            <div className="mt-2 text-lg sm:text-xl font-bold text-stone-900 font-editorial truncate">
              {userProfile.uid ? 'Cloud Synced' : activeEmail ? 'Email Active' : 'Local Partner'}
            </div>
            <p className="text-[11px] text-stone-500 mt-1 truncate">
              {activeEmail || 'Saved in your browser session'}
            </p>
          </div>
        </div>
      </div>

      {/* Primary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-stone-900 font-editorial">
              Gospel Pillar Mastery
            </h3>
            <p className="text-xs text-stone-500">
              Real completion % across Salvation, Faith, Prayer, Spirit, Discipleship, and Psalms
            </p>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="74%" data={radarData}>
                <PolarGrid stroke="#e7e5e4" />
                <PolarAngleAxis dataKey="pillar" tick={{ fill: '#44403c', fontSize: 12, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#a8a29e', fontSize: 10 }} />
                <Radar name="Your Progress (%)" dataKey="mastery" stroke="#9a3412" fill="#9a3412" fillOpacity={0.42} />
                <Radar name="Target (%)" dataKey="target" stroke="#1e3a8a" fill="#1e3a8a" fillOpacity={0.08} />
                <Tooltip
                  formatter={(v: any) => [`${v}%`, 'Progress']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #d6d3d1' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-stone-900 font-editorial">
              Completion by Scripture Study Mode
            </h3>
            <p className="text-xs text-stone-500">
              Real completed prompts vs total prompts across all active Gospel studies
            </p>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studyModeBarData} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#44403c', fontSize: 11 }} angle={-15} textAnchor="end" interval={0} />
                <YAxis tick={{ fill: '#a8a29e', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #d6d3d1' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="Total" fill="#e7e5e4" radius={[6, 6, 0, 0]} name="Total Prompts" />
                <Bar dataKey="Completed" fill="#1e3a8a" radius={[6, 6, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pillar Distribution Row */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-5">
          <h3 className="text-lg font-bold text-stone-900 font-editorial">
            {totalDoneModesAcrossAll > 0 ? 'Completed Focus by Pillar' : 'Available Studies by Pillar'}
          </h3>
          <p className="text-xs text-stone-500 mb-4">
            {totalDoneModesAcrossAll > 0
              ? 'Distribution of your completed Gospel study modes'
              : 'Complete a quiz or study check below to see your personalized distribution'}
          </p>

          <div className="space-y-2 text-xs">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-stone-700">{item.name}</span>
                </div>
                <span className="font-bold text-stone-900 tabular-nums">
                  {totalDoneModesAcrossAll > 0 ? `${item.value} done` : `${item.value} study`}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 w-full h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={84} paddingAngle={3} dataKey="value">
                {pieData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Topic Checklist Interlinked with @jesusneverfails7649 */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-stone-900 font-editorial">
              Gospel Topic Completion & @jesusneverfails7649 Links
            </h3>
            <p className="text-xs text-stone-500">
              Click any check icon to record completion, or open a study to practice and auto-track mastery.
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {pillarsList.map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPillarFilter(p)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedPillarFilter === p
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-semibold">
                <th className="py-3 px-3">Gospel Topic & Channel Link</th>
                <th className="py-3 px-2 text-center">Quiz</th>
                <th className="py-3 px-2 text-center">A&R</th>
                <th className="py-3 px-2 text-center">Parable</th>
                <th className="py-3 px-2 text-center">Reason</th>
                <th className="py-3 px-2 text-center">Contrast</th>
                <th className="py-3 px-2 text-center">Notes</th>
                <th className="py-3 px-3 text-right">Study</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredSessions.map((session) => {
                const prog = topicProgress[session.id] || {
                  uid: userProfile.uid || 'local',
                  sessionId: session.id,
                  quizDone: false,
                  arDone: false,
                  cbqDone: false,
                  giveReasonDone: false,
                  diffDone: false,
                  subjectiveDone: false,
                };
                const doneCount = [
                  prog.quizDone,
                  prog.arDone,
                  prog.cbqDone,
                  prog.giveReasonDone,
                  prog.diffDone,
                  prog.subjectiveDone,
                ].filter(Boolean).length;
                const pct = Math.round((doneCount / 6) * 100);

                return (
                  <tr key={session.id} className="hover:bg-[#FBF9F5] transition-colors">
                    <td className="py-3.5 px-3">
                      <a
                        href={buildChannelVideoSearchUrl(session.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-stone-900 hover:text-rose-700 font-editorial inline-flex items-center gap-1.5"
                      >
                        <span>{session.title}</span>
                        <Youtube className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                      </a>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        {session.pillar} · {session.scriptureBook} ·{' '}
                        <span className="tabular-nums font-medium">{pct}%</span>
                      </div>
                    </td>

                    {(
                      [
                        'quizDone',
                        'arDone',
                        'cbqDone',
                        'giveReasonDone',
                        'diffDone',
                        'subjectiveDone',
                      ] as const
                    ).map((key) => (
                      <td key={key} className="py-3.5 px-2 text-center">
                        <button
                          onClick={() => onToggleTask(session.id, key)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            prog[key]
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                          }`}
                          title="Mark complete / incomplete"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </td>
                    ))}

                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => {
                          onSelectSession(session.id);
                          onNavigateToTab('kahoot');
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors whitespace-nowrap"
                      >
                        <span>Open</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
