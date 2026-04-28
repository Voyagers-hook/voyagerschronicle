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
      supabase.from('user_profiles').select('xp, total_points').eq('id', user.id).single(),
      supabase.from('user_cards').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('opened', true),
      supabase.from('cards').select('id', { count: 'exact', head: true }),
      supabase.from('catch_submissions').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('catch_status', 'approved'),
      supabase.from('catch_submissions').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('catch_status', 'pending'),
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

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

      {/* Spendable Points — with Redeem button */}
      <div className="bg-orange-50 border border-orange-200 rounded-3xl p-4 shadow-card col-span-1">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#ff751f20' }}>
            <Icon name="StarIcon" size={16} style={{ color: '#ff751f' }} />
          </div>
          <span className="text-xs font-sans font-semibold text-earth-500 uppercase tracking-wide">Points</span>
        </div>
        {loading ? (
          <div className="h-8 bg-white/60 rounded-lg animate-pulse mb-3" />
        ) : (
          <p className="font-display text-3xl tabular-nums font-bold mb-1" style={{ color: '#ff751f' }}>
            {stats.totalPoints.toLocaleString()}
          </p>
        )}
        <p className="text-xs font-sans text-earth-400 mb-3">Spendable currency</p>
        <Link href="/rewards"
          className="block w-full text-center text-white font-sans font-semibold text-xs py-2 rounded-xl transition-all active:scale-95"
          style={{ backgroundColor: '#ff751f' }}>
          Redeem
        </Link>
      </div>

      {/* Total XP */}
      <div className="bg-green-50 border border-green-200 rounded-3xl p-4 shadow-card col-span-1">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#2D6A4F20' }}>
            <Icon name="BoltIcon" size={16} style={{ color: '#2D6A4F' }} />
          </div>
          <span className="text-xs font-sans font-semibold text-earth-500 uppercase tracking-wide">Total XP</span>
        </div>
        {loading ? (
          <div className="h-8 bg-white/60 rounded-lg animate-pulse mb-3" />
        ) : (
          <p className="font-display text-3xl tabular-nums font-bold mb-1" style={{ color: '#2D6A4F' }}>
            {stats.xp.toLocaleString()}
          </p>
        )}
        <p className="text-xs font-sans text-earth-400 mb-3">Earns your level</p>
        <Link href="/leaderboard"
          className="block w-full text-center font-sans font-semibold text-xs py-2 rounded-xl transition-all active:scale-95 border border-green-300 text-green-700 hover:bg-green-100">
          Leaderboard
        </Link>
      </div>

      {/* Catches Logged */}
      <div className="bg-blue-50 border border-blue-200 rounded-3xl p-4 shadow-card col-span-1">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#3B82F620' }}>
            <Icon name="TrophyIcon" size={16} style={{ color: '#3B82F6' }} />
          </div>
          <span className="text-xs font-sans font-semibold text-earth-500 uppercase tracking-wide">Catches</span>
        </div>
        {loading ? (
          <div className="h-8 bg-white/60 rounded-lg animate-pulse mb-3" />
        ) : (
          <p className="font-display text-3xl tabular-nums font-bold mb-1" style={{ color: '#3B82F6' }}>
            {stats.catchesLogged}
          </p>
        )}
        <p className="text-xs font-sans text-earth-400 mb-3">
          {stats.catchesPending > 0 ? `${stats.catchesPending} pending review` : 'Approved catches'}
        </p>
        <Link href="/catch-log"
          className="block w-full text-center font-sans font-semibold text-xs py-2 rounded-xl transition-all active:scale-95 border border-blue-300 text-blue-700 hover:bg-blue-100">
          View Log
        </Link>
      </div>

      {/* Cards Collected — with View Album */}
      <div className="bg-pink-50 border border-pink-200 rounded-3xl p-4 shadow-card col-span-1">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#ec489920' }}>
            <Icon name="BookOpenIcon" size={16} style={{ color: '#ec4899' }} />
          </div>
          <span className="text-xs font-sans font-semibold text-earth-500 uppercase tracking-wide">Cards</span>
        </div>
        {loading ? (
          <div className="h-8 bg-white/60 rounded-lg animate-pulse mb-3" />
        ) : (
          <>
            <p className="font-display text-3xl tabular-nums font-bold mb-1" style={{ color: '#ec4899' }}>
              {stats.cardsCollected}/{stats.totalCards}
            </p>
            <div className="h-1.5 rounded-full mb-1 overflow-hidden" style={{ backgroundColor: '#ec489920' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${cardProgress}%`, backgroundColor: '#ec4899' }} />
            </div>
          </>
        )}
        <p className="text-xs font-sans text-earth-400 mb-3">{cardProgress}% of album</p>
        <Link href="/card-collection"
          className="block w-full text-center font-sans font-semibold text-xs py-2 rounded-xl transition-all active:scale-95 border border-pink-300 text-pink-700 hover:bg-pink-100">
          View Album
        </Link>
      </div>

    </div>
  );
}
