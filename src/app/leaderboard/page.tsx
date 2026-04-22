'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LeaderboardEntry {
  id: string;
  username: string;
  membership_tier: string;
  total_points: number;
  level: number;
  avatarColor: string;
}

const AVATAR_COLORS = ['#F59E0B','#8B5CF6','#ff751f','#3B82F6','#10B981','#7C3AED','#38BDF8','#F97316'];

const statConfig = [
  { key: 'power',   label: 'Power',   color: '#ef4444' },
  { key: 'stealth', label: 'Stealth', color: '#2D6A4F' },
  { key: 'stamina', label: 'Stamina', color: '#3B82F6' },
  { key: 'beauty',  label: 'Beauty',  color: '#ec4899' },
];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('user_profiles')
      .select('id, username, membership_tier, total_points, level')
      .order('total_points', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        const entries = (data || []).map((p, i) => ({
          id: p.id,
          username: p.username || 'Angler',
          membership_tier: p.membership_tier || 'Explorer',
          total_points: p.total_points || 0,
          level: p.level || 1,
          avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
        }));
        setLeaderboard(entries);
        setLoading(false);
      });
  }, []);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const maxTotal = leaderboard[0]?.total_points || 1;

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <AppLayout currentPath="/leaderboard">
      <div className="fade-in space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8" style={{ background: 'linear-gradient(135deg, #091408 0%, #1A3D28 50%, #2D6A4F 100%)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #F59E0B, transparent)', transform: 'translate(30%, -30%)' }} />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Icon name="TrophyIcon" size={22} className="text-amber-400" />
              </div>
              <h1 className="font-display text-3xl lg:text-4xl text-white">Leaderboard</h1>
            </div>
            <p className="text-primary-200 font-sans text-sm max-w-lg">
              Ranked by total card stats — Power, Stealth, Stamina and Beauty combined across your entire collection.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse border border-adventure-border" />)}
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {top3.length >= 3 && (
              <div className="grid grid-cols-3 gap-4">
                {[top3[1], top3[0], top3[2]].map((entry, podiumIdx) => {
                  const actualRank = podiumIdx === 0 ? 2 : podiumIdx === 1 ? 1 : 3;
                  const heights = ['h-32', 'h-40', 'h-28'];
                  const medalColors = ['#94A3B8', '#F59E0B', '#CD7F32'];
                  return (
                    <div key={entry.id} className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white font-sans mb-2 shadow-lg" style={{ backgroundColor: entry.avatarColor }}>
                        {getInitials(entry.username)}
                      </div>
                      <p className="font-sans font-semibold text-primary-800 text-sm text-center">{entry.username}</p>
                      <p className="text-xs font-sans text-earth-400 mb-2">{entry.membership_tier}</p>
                      <div
                        className={`w-full rounded-t-2xl flex flex-col items-center justify-start pt-3 border-2 ${heights[podiumIdx]}`}
                        style={podiumIdx === 1
                          ? { background: 'linear-gradient(180deg, #fffbeb, #fef3c7)', borderColor: '#F59E0B' }
                          : { background: '#f8f9fa', borderColor: medalColors[podiumIdx] }
                        }
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold font-sans mb-1" style={{ backgroundColor: medalColors[podiumIdx] }}>
                          {actualRank}
                        </div>
                        <p className="font-display text-lg text-primary-800 tabular-nums">{entry.total_points.toLocaleString()}</p>
                        <p className="text-xs font-sans text-earth-400">pts</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full leaderboard */}
            <div className="bg-white rounded-2xl border border-adventure-border shadow-card overflow-hidden">
              <div className="p-5 border-b border-adventure-border">
                <h2 className="font-display text-xl text-primary-800">Full Rankings</h2>
              </div>
              <div className="divide-y divide-adventure-border">
                {leaderboard.map((entry, idx) => (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-4 px-5 py-4 hover:bg-adventure-bg transition-colors ${entry.id === user?.id ? 'bg-orange-50' : ''}`}
                  >
                    {/* Rank */}
                    <div className="w-8 text-center flex-shrink-0">
                      {idx < 3 ? (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold font-sans mx-auto" style={{ backgroundColor: idx === 0 ? '#F59E0B' : idx === 1 ? '#94A3B8' : '#CD7F32' }}>
                          {idx + 1}
                        </div>
                      ) : (
                        <span className="font-sans font-bold text-earth-400 text-sm">{idx + 1}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white font-sans flex-shrink-0" style={{ backgroundColor: entry.avatarColor }}>
                      {getInitials(entry.username)}
                    </div>

                    {/* Name & level */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-sans font-semibold text-primary-800 text-sm">{entry.username}</p>
                        {entry.id === user?.id && (
                          <span className="text-xs font-sans font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: '#ff751f' }}>You</span>
                        )}
                      </div>
                      <p className="text-xs font-sans text-earth-400">{entry.membership_tier} · Level {entry.level}</p>
                    </div>

                    {/* Total + bar */}
                    <div className="flex-shrink-0 text-right w-24">
                      <p className="font-display text-lg text-primary-800 tabular-nums">{entry.total_points.toLocaleString()}</p>
                      <div className="h-1.5 bg-earth-100 rounded-full overflow-hidden mt-1">
                        <div className="h-full rounded-full" style={{ width: `${(entry.total_points / maxTotal) * 100}%`, backgroundColor: '#ff751f' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
