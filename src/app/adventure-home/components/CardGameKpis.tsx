'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalPoints: number;
  xp: number;
  cardsCollected: number;
  totalCards: number;
  catchesLogged: number;
  catchesPending: number;
}

export default function CardGameKpis() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPoints: 0, xp: 0,
    cardsCollected: 0, totalCards: 0,
    catchesLogged: 0, catchesPending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const supabase = createClient();

    Promise.all([
      // XP and points from profile
      supabase
        .from('user_profiles')
        .select('xp, total_points')
        .eq('id', user.id)
        .single(),
      // Cards I own (opened)
      supabase
        .from('user_cards')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('opened', true),
      // Total cards in the game
      supabase
        .from('cards')
        .select('id', { count: 'exact', head: true }),
      // My approved catches
      supabase
        .from('catch_submissions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('catch_status', 'approved'),
      // My pending catches
      supabase
        .from('catch_submissions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('catch_status', 'pending'),
    ]).then(([profileRes, ownedRes, totalRes, catchRes, pendingRes]) => {
      setStats({
        totalPoints:    profileRes.data?.total_points ?? 0,
        xp:             profileRes.data?.xp ?? 0,
        cardsCollected: ownedRes.count ?? 0,
        totalCards:     totalRes.count ?? 0,
        catchesLogged:  catchRes.count ?? 0,
        catchesPending: pendingRes.count ?? 0,
      });
      setLoading(false);
    });
  }, [user]);

  const cardProgress = stats.totalCards > 0
    ? Math.round((stats.cardsCollected / stats.totalCards) * 100)
    : 0;

  const kpis = [
    {
      label: 'Spendable Points',
      value: stats.totalPoints.toLocaleString(),
      icon: 'StarIcon',
      color: '#ff751f',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      href: '/rewards',
      sub: 'Redeem for rewards',
    },
    {
      label: 'Total XP',
      value: stats.xp.toLocaleString(),
      icon: 'BoltIcon',
      color: '#2D6A4F',
      bg: 'bg-green-50',
      border: 'border-green-200',
      href: '/leaderboard',
      sub: 'Earns your level',
    },
    {
      label: 'Catches Logged',
      value: stats.catchesLogged.toString(),
      icon: 'TrophyIcon',
      color: '#3B82F6',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      href: '/catch-log',
      sub: stats.catchesPending > 0 ? `${stats.catchesPending} pending review` : 'Keep fishing!',
    },
    {
      label: 'Cards Collected',
      value: `${stats.cardsCollected}/${stats.totalCards}`,
      icon: 'BookOpenIcon',
      color: '#ec4899',
      bg: 'bg-pink-50',
      border: 'border-pink-200',
      href: '/card-collection',
      sub: `${cardProgress}% of the album`,
    },
  ];

  return (
    <div className="space-y-4">

      {/* Points banner */}
      <div
        className="relative overflow-hidden rounded-3xl p-5 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #ff751f 0%, #e85a00 100%)' }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, white, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-20 w-24 h-24 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, white, transparent)', transform: 'translateY(40%)' }} />
        <div className="relative z-10">
          <p className="text-white/80 text-xs font-sans font-semibold uppercase tracking-widest">Spendable Points</p>
          {loading ? (
            <div className="h-9 w-32 bg-white/20 rounded-xl animate-pulse mt-1" />
          ) : (
            <p className="font-display text-4xl text-white tabular-nums">{stats.totalPoints.toLocaleString()}</p>
          )}
          <p className="text-white/70 text-xs font-sans mt-1">
            Earned from catches, quizzes &amp; challenges
          </p>
        </div>
        <div className="relative z-10 flex flex-col items-end gap-2">
          <Link href="/rewards"
            className="bg-white/20 hover:bg-white/30 text-white text-xs font-sans font-semibold px-4 py-2 rounded-xl transition-colors border border-white/30">
            Redeem Points
          </Link>
          <Link href="/leaderboard"
            className="bg-white text-xs font-sans font-semibold px-4 py-2 rounded-xl transition-colors"
            style={{ color: '#ff751f' }}>
            Leaderboard
          </Link>
        </div>
      </div>

      {/* Collection progress bar */}
      <div className="bg-white rounded-3xl p-5 shadow-card border border-adventure-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #2D6A4F, #3D9068)' }}>
              <Icon name="BookOpenIcon" size={18} className="text-white" />
            </div>
            <div>
              <p className="font-sans font-semibold text-primary-800 text-sm">Card Collection</p>
              <p className="text-xs font-sans text-earth-400">Collect them all!</p>
            </div>
          </div>
          <Link href="/card-collection"
            className="text-xs font-sans font-semibold px-3 py-1.5 rounded-xl text-white"
            style={{ backgroundColor: '#ff751f' }}>
            View Album
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-4 bg-earth-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${cardProgress}%`, background: 'linear-gradient(90deg, #ff751f, #E9A23B)' }} />
          </div>
          <span className="font-display text-lg text-primary-800 tabular-nums flex-shrink-0">
            {stats.cardsCollected}/{stats.totalCards}
          </span>
        </div>
        <p className="text-xs font-sans text-earth-400 mt-1">{cardProgress}% complete</p>
      </div>

      {/* KPI grid — activity based, no card stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map(k => (
          <Link
            key={k.label}
            href={k.href}
            className={`bg-white rounded-3xl p-4 shadow-card border card-lift block ${k.bg} ${k.border}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${k.color}20` }}>
                <Icon name={k.icon as Parameters<typeof Icon>[0]['name']} size={16} style={{ color: k.color }} />
              </div>
              <span className="text-xs font-sans font-semibold text-earth-500 uppercase tracking-wide">{k.label}</span>
            </div>
            {loading ? (
              <div className="h-8 bg-white/60 rounded-lg animate-pulse" />
            ) : (
              <>
                <p className="font-display text-3xl tabular-nums font-bold mb-1" style={{ color: k.color }}>{k.value}</p>
                <p className="text-xs font-sans text-earth-400">{k.sub}</p>
              </>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
