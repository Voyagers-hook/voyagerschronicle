'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserStats {
  power: number;
  stealth: number;
  stamina: number;
  beauty: number;
  total: number;
  collected: number;
  totalCards: number;
}

const statConfig = [
  { key: 'power',   label: 'Power',   icon: 'BoltIcon',      color: '#ef4444', bg: 'bg-red-50',   border: 'border-red-200',   bar: 'stat-bar-power'   },
  { key: 'stealth', label: 'Stealth', icon: 'EyeSlashIcon',  color: '#2D6A4F', bg: 'bg-green-50', border: 'border-green-200', bar: 'stat-bar-stealth' },
  { key: 'stamina', label: 'Stamina', icon: 'HeartIcon',     color: '#3B82F6', bg: 'bg-blue-50',  border: 'border-blue-200',  bar: 'stat-bar-stamina' },
  { key: 'beauty',  label: 'Beauty',  icon: 'SparklesIcon',  color: '#ec4899', bg: 'bg-pink-50',  border: 'border-pink-200',  bar: 'stat-bar-beauty'  },
];

export default function CardGameKpis() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({ power: 0, stealth: 0, stamina: 0, beauty: 0, total: 0, collected: 0, totalCards: 24 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const supabase = createClient();

    Promise.all([
      supabase
        .from('user_cards')
        .select('cards(power, stealth, stamina, beauty)')
        .eq('user_id', user.id),
      supabase.from('cards').select('id', { count: 'exact', head: true }),
    ]).then(([{ data: userCards, error: userCardsError }, { count, error: countError }]) => {
      const cards = (userCards || []).map((uc: Record<string, unknown>) => uc.cards as { power: number; stealth: number; stamina: number; beauty: number } | null).filter(Boolean) as { power: number; stealth: number; stamina: number; beauty: number }[];
      const power   = cards.reduce((s, c) => s + (c?.power   || 0), 0);
      const stealth = cards.reduce((s, c) => s + (c?.stealth || 0), 0);
      const stamina = cards.reduce((s, c) => s + (c?.stamina || 0), 0);
      const beauty  = cards.reduce((s, c) => s + (c?.beauty  || 0), 0);
      setStats({ power, stealth, stamina, beauty, total: power + stealth + stamina + beauty, collected: cards.length, totalCards: count || 24 });
      setLoading(false);
    });
  }, [user]);

  const progress = stats.totalCards > 0 ? Math.round((stats.collected / stats.totalCards) * 100) : 0;
  const maxStat = Math.max(stats.power, stats.stealth, stats.stamina, stats.beauty, 1);

  return (
    <div className="space-y-4">
      {/* Total points hero banner */}
      <div className="relative overflow-hidden rounded-3xl p-5 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #ff751f 0%, #e85a00 100%)' }}>
        {/* Decorative bubbles */}
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, white, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-20 w-24 h-24 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, white, transparent)', transform: 'translateY(40%)' }} />
        <div className="relative z-10">
          <p className="text-white/80 text-xs font-sans font-semibold uppercase tracking-widest">Total Card Points</p>
          {loading ? (
            <div className="h-9 w-32 bg-white/20 rounded-xl animate-pulse mt-1" />
          ) : (
            <p className="font-display text-4xl text-white tabular-nums">{stats.total.toLocaleString()}</p>
          )}
          <p className="text-white/70 text-xs font-sans mt-1">{stats.collected} of {stats.totalCards} cards collected</p>
        </div>
        <div className="relative z-10 flex flex-col items-end gap-2">
          <Link href="/rewards" className="bg-white/20 hover:bg-white/30 text-white text-xs font-sans font-semibold px-4 py-2 rounded-xl transition-colors border border-white/30">
            Redeem Points
          </Link>
          <Link href="/leaderboard" className="bg-white text-xs font-sans font-semibold px-4 py-2 rounded-xl transition-colors" style={{ color: '#ff751f' }}>
            Leaderboard
          </Link>
        </div>
      </div>

      {/* Collection progress */}
      <div className="bg-white rounded-3xl p-5 shadow-card border border-adventure-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2D6A4F, #3D9068)' }}>
              <Icon name="BookOpenIcon" size={18} className="text-white" />
            </div>
            <div>
              <p className="font-sans font-semibold text-primary-800 text-sm">Card Collection</p>
              <p className="text-xs font-sans text-earth-400">Collect them all!</p>
            </div>
          </div>
          <Link href="/card-collection" className="text-xs font-sans font-semibold px-3 py-1.5 rounded-xl text-white" style={{ backgroundColor: '#ff751f' }}>
            View Album
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-4 bg-earth-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #ff751f, #E9A23B)' }}
            />
          </div>
          <span className="font-display text-lg text-primary-800 tabular-nums flex-shrink-0">{stats.collected}/{stats.totalCards}</span>
        </div>
        <p className="text-xs font-sans text-earth-400 mt-1">{progress}% complete</p>
      </div>

      {/* Stat bubbles grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statConfig.map((s) => {
          const val = stats[s.key as keyof UserStats] as number;
          const barWidth = maxStat > 0 ? Math.round((val / maxStat) * 100) : 0;
          return (
            <Link
              key={s.key}
              href="/card-collection"
              className={`bg-white rounded-3xl p-4 shadow-card border card-lift block ${s.bg} ${s.border}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${s.color}20` }}>
                  <Icon name={s.icon as Parameters<typeof Icon>[0]['name']} size={16} style={{ color: s.color }} />
                </div>
                <span className="text-xs font-sans font-semibold text-earth-500 uppercase tracking-wide">{s.label}</span>
              </div>
              {loading ? (
                <div className="h-8 bg-white/60 rounded-lg animate-pulse" />
              ) : (
                <>
                  <p className="font-display text-3xl tabular-nums font-bold mb-2" style={{ color: s.color }}>{val}</p>
                  <div className="h-2 bg-white/60 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${s.bar}`} style={{ width: `${barWidth}%` }} />
                  </div>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
