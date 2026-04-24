'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

interface AnalyticsData {
  totalMembers: number;
  totalCards: number;
  totalCatches: number;
  pendingCatches: number;
  totalTrades: number;
  quizCompletions: number;
  cardsByRarity: { rarity: string; count: number; color: string }[];
  topMembers: { username: string; total_points: number; level: number }[];
  recentCatches: { species: string; catch_status: string; submitted_at: string }[];
  quizScores: { quiz_category: string; avg_score: number; completions: number }[];
}

const rarityColors: Record<string, string> = {
  Widespread: '#c49050',
  Elusive:    '#2D6A4F',
  Specimen:   '#3B82F6',
  Legendary:  '#F59E0B',
};

function StatCard({ icon, label, value, sub, color }: { icon: string; label: string; value: string | number; sub: string; color: string }) {
  return (
    <div className="bg-white rounded-3xl border border-adventure-border shadow-card p-5 flex items-center gap-4">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
        <Icon name={icon as Parameters<typeof Icon>[0]['name']} size={26} style={{ color }} />
      </div>
      <div>
        <p className="text-xs font-sans font-semibold text-earth-400 uppercase tracking-widest">{label}</p>
        <p className="font-display text-3xl text-primary-800 tabular-nums">{value}</p>
        <p className="text-xs font-sans text-earth-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

function RarityBar({ rarity, count, total, color }: { rarity: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-20 flex-shrink-0">
        <span className="text-xs font-sans font-bold" style={{ color }}>{rarity}</span>
      </div>
      <div className="flex-1 h-5 bg-earth-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-700"
          style={{ width: `${Math.max(pct, 8)}%`, backgroundColor: color }}
        >
          <span className="text-white text-xs font-bold">{count}</span>
        </div>
      </div>
      <span className="text-xs font-sans text-earth-400 w-8 text-right">{pct}%</span>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({
    totalMembers: 0, totalCards: 0, totalCatches: 0, pendingCatches: 0,
    totalTrades: 0, quizCompletions: 0, cardsByRarity: [], topMembers: [],
    recentCatches: [], quizScores: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
      supabase.from('cards').select('id', { count: 'exact', head: true }),
      supabase.from('catch_submissions').select('id', { count: 'exact', head: true }),
      supabase.from('catch_submissions').select('id', { count: 'exact', head: true }).eq('catch_status', 'pending'),
      supabase.from('trades').select('id', { count: 'exact', head: true }),
      supabase.from('quiz_scores').select('id', { count: 'exact', head: true }),
      supabase.from('user_cards').select('cards(rarity)'),
      supabase.from('user_profiles').select('username, total_points, level').order('total_points', { ascending: false }).limit(5),
      supabase.from('catch_submissions').select('species, catch_status, submitted_at').order('submitted_at', { ascending: false }).limit(8),
      supabase.from('quiz_scores').select('quiz_category, score'),
    ]).then(([members, cards, catches, pending, trades, quizCount, userCards, topMembers, recentCatches, quizScores]) => {
      const rarityMap: Record<string, number> = {};
      (userCards.data || []).forEach((uc: Record<string, unknown>) => {
        const card = uc.cards as { rarity: string } | null;
        if (card?.rarity) rarityMap[card.rarity] = (rarityMap[card.rarity] || 0) + 1;
      });
      const cardsByRarity = Object.entries(rarityMap).map(([rarity, count]) => ({
        rarity, count, color: rarityColors[rarity] || '#6B7280',
      }));

      const quizMap: Record<string, { total: number; count: number }> = {};
      (quizScores.data || []).forEach((qs: { quiz_category: string; score: number }) => {
        if (!quizMap[qs.quiz_category]) quizMap[qs.quiz_category] = { total: 0, count: 0 };
        quizMap[qs.quiz_category].total += qs.score;
        quizMap[qs.quiz_category].count += 1;
      });
      const quizAverages = Object.entries(quizMap).map(([cat, v]) => ({
        quiz_category: cat,
        avg_score: Math.round(v.total / v.count),
        completions: v.count,
      }));

      setData({
        totalMembers: members.count || 0,
        totalCards: cards.count || 0,
        totalCatches: catches.count || 0,
        pendingCatches: pending.count || 0,
        totalTrades: trades.count || 0,
        quizCompletions: quizCount.count || 0,
        cardsByRarity,
        topMembers: (topMembers.data || []).map(m => ({ username: m.username || 'Angler', total_points: m.total_points || 0, level: m.level || 1 })),
        recentCatches: (recentCatches.data || []).map(c => ({ species: c.species, catch_status: c.catch_status, submitted_at: c.submitted_at })),
        quizScores: quizAverages,
      });
      setLoading(false);
    });
  }, []);

  const totalCollected = data.cardsByRarity.reduce((s, r) => s + r.count, 0);

  return (
    <AppLayout currentPath="/admin-analytics">
      <div className="fade-in space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8" style={{ background: 'linear-gradient(135deg, #091408 0%, #1A3D28 50%, #2D6A4F 100%)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #ff751f, transparent)', transform: 'translate(30%, -30%)' }} />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Icon name="ChartBarIcon" size={22} className="text-white" />
              </div>
              <h1 className="font-display text-3xl lg:text-4xl text-white">Analytics</h1>
            </div>
            <p className="text-primary-200 font-sans text-sm">Live overview of your Voyagers Chronicle community.</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-24 bg-white rounded-3xl animate-pulse border border-adventure-border" />)}
          </div>
        ) : (
          <>
            {/* KPI grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard icon="UsersIcon"                 label="Members"         value={data.totalMembers}    sub="Registered anglers"                      color="#2D6A4F" />
              <StatCard icon="BookOpenIcon"              label="Cards in Circ."  value={data.totalCards}      sub="Master catalogue"                        color="#ff751f" />
              <StatCard icon="ClipboardDocumentListIcon" label="Catch Logs"      value={data.totalCatches}    sub={`${data.pendingCatches} pending review`} color="#3B82F6" />
              <StatCard icon="ArrowsRightLeftIcon"       label="Total Trades"    value={data.totalTrades}     sub="All time"                                color="#8B5CF6" />
              <StatCard icon="AcademicCapIcon"           label="Quiz Attempts"   value={data.quizCompletions} sub="All categories"                          color="#F59E0B" />
              <StatCard icon="SparklesIcon"              label="Cards Collected" value={totalCollected}       sub="Across all members"                      color="#ec4899" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card rarity distribution */}
              <div className="bg-white rounded-3xl border border-adventure-border shadow-card p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Icon name="SparklesIcon" size={18} className="text-amber-500" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl text-primary-800">Cards by Rarity</h2>
                    <p className="text-xs font-sans text-earth-400">Collected across all members</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {['Legendary', 'Specimen', 'Elusive', 'Widespread'].map(r => {
                    const entry = data.cardsByRarity.find(c => c.rarity === r);
                    return <RarityBar key={r} rarity={r} count={entry?.count || 0} total={totalCollected} color={rarityColors[r]} />;
                  })}
                </div>
              </div>

              {/* Top members */}
              <div className="bg-white rounded-3xl border border-adventure-border shadow-card p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Icon name="TrophyIcon" size={18} className="text-amber-500" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl text-primary-800">Top Anglers</h2>
                    <p className="text-xs font-sans text-earth-400">Ranked by total card points</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {data.topMembers.map((m, i) => (
                    <div key={m.username} className="flex items-center gap-3 p-3 rounded-2xl bg-adventure-bg">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: i === 0 ? '#F59E0B' : i === 1 ? '#94A3B8' : i === 2 ? '#CD7F32' : '#2D6A4F' }}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans font-semibold text-primary-800 text-sm truncate">{m.username}</p>
                        <p className="text-xs font-sans text-earth-400">Level {m.level}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-display text-lg text-primary-800 tabular-nums">{m.total_points.toLocaleString()}</p>
                        <p className="text-xs font-sans text-earth-400">pts</p>
                      </div>
                    </div>
                  ))}
                  {data.topMembers.length === 0 && (
                    <p className="text-center text-sm font-sans text-earth-400 py-4">No members yet</p>
                  )}
                </div>
              </div>

              {/* Recent catch submissions */}
              <div className="bg-white rounded-3xl border border-adventure-border shadow-card p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
                    <Icon name="ClipboardDocumentListIcon" size={18} className="text-primary-500" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl text-primary-800">Recent Catches</h2>
                    <p className="text-xs font-sans text-earth-400">Latest submissions</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {data.recentCatches.map((c, i) => {
                    const statusColors: Record<string, string> = {
                      approved: 'bg-green-100 text-green-700',
                      pending:  'bg-amber-100 text-amber-700',
                      rejected: 'bg-red-100 text-red-700',
                    };
                    return (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-adventure-bg">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #2D6A4F, #3D9068)' }}>
                          <Icon name="SparklesIcon" size={14} className="text-white" />
                        </div>
                        <p className="flex-1 font-sans font-semibold text-primary-800 text-sm truncate">{c.species}</p>
                        <span className={`text-xs font-sans font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${statusColors[c.catch_status] || statusColors.pending}`}>
                          {c.catch_status}
                        </span>
                      </div>
                    );
                  })}
                  {data.recentCatches.length === 0 && (
                    <p className="text-center text-sm font-sans text-earth-400 py-4">No catches yet</p>
                  )}
                </div>
              </div>

              {/* Quiz performance */}
              <div className="bg-white rounded-3xl border border-adventure-border shadow-card p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Icon name="AcademicCapIcon" size={18} className="text-blue-500" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl text-primary-800">Quiz Performance</h2>
                    <p className="text-xs font-sans text-earth-400">Average scores by category</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {data.quizScores.map((q) => (
                    <div key={q.quiz_category}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-sans font-semibold text-primary-700">{q.quiz_category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-sans text-earth-400">{q.completions} attempts</span>
                          <span className="font-display text-lg text-primary-800">{q.avg_score}%</span>
                        </div>
                      </div>
                      <div className="h-3 bg-earth-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${q.avg_score}%`, background: 'linear-gradient(90deg, #3B82F6, #2563EB)' }}
                        />
                      </div>
                    </div>
                  ))}
                  {data.quizScores.length === 0 && (
                    <p className="text-center text-sm font-sans text-earth-400 py-4">No quiz data yet</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
