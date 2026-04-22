'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfile {
  username: string | null;
  xp: number;
  level: number;
  streak_weeks: number;
  membership_tier: string;
  total_points: number;
}

const FLOATING_ITEMS = [
  { type: 'fish', color: 'rgba(59,130,246,0.8)', x: '88%', y: '12%', size: 32, delay: '0s', duration: '3.2s' },
  { type: 'star', color: 'rgba(245,158,11,0.9)', x: '92%', y: '55%', size: 24, delay: '0.8s', duration: '2.5s' },
  { type: 'fish', color: 'rgba(255,117,31,0.7)', x: '82%', y: '78%', size: 28, delay: '1.4s', duration: '3.8s' },
];

// SVG fish — no emoji
const FishIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 60 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="28" cy="18" rx="22" ry="12" fill={color} />
    <polygon points="50,18 60,8 60,28" fill={color} opacity="0.7" />
    <circle cx="14" cy="14" r="3" fill="white" opacity="0.8" />
    <circle cx="13" cy="13" r="1.5" fill="#0a1f3c" />
  </svg>
);

// SVG star — no emoji
const StarIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
  </svg>
);

export default function HomeHero() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [collectedCount, setCollectedCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!user) return;
    const supabase = createClient();
    Promise.all([
      supabase.from('user_profiles').select('username, xp, level, streak_weeks, membership_tier, total_points').eq('id', user.id).single(),
      supabase.from('user_cards').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    ]).then(([profResult, countResult]) => {
      const prof = profResult.data;
      const count = countResult.count;
      if (prof) setProfile(prof);
      setCollectedCount(count || 0);
    });
  }, [user]);

  const displayName = profile?.username || user?.email?.split('@')[0] || 'Captain';
  const xp = profile?.xp || 0;
  const level = profile?.level || 1;
  const xpNeeded = level * 1000;
  const xpProgress = Math.min(Math.round((xp / xpNeeded) * 100), 100);
  const streak = profile?.streak_weeks || 0;
  const tier = profile?.membership_tier || 'Explorer';

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8" style={{ background: 'linear-gradient(135deg, #091408 0%, #1A3D28 50%, #2D6A4F 100%)' }}>
      {/* Texture */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      {/* Decorative orbs */}
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #ff751f, transparent)', transform: 'translate(30%, -30%)' }} />
      <div className="absolute bottom-0 right-20 w-40 h-40 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #E9A23B, transparent)', transform: 'translateY(40%)' }} />

      {/* Floating fun icons */}
      {mounted && FLOATING_ITEMS.map((item, i) => (
        <div
          key={i}
          className="absolute pointer-events-none select-none hidden lg:block"
          style={{
            left: item.x,
            top: item.y,
            animation: `floatBob ${item.duration} ${item.delay} ease-in-out infinite`,
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))',
            zIndex: 5,
          }}
        >
          {item.type === 'fish'
            ? <FishIcon size={item.size} color={item.color} />
            : <StarIcon size={item.size} color={item.color} />
          }
        </div>
      ))}

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="hidden sm:block flex-shrink-0" style={{ animation: 'logoWobble 6s ease-in-out infinite' }}>
            <Image
              src="/assets/images/little_voyagers_logo-1776778067350.png"
              alt="Little Voyagers Project Somerset"
              width={56}
              height={56}
              className="object-contain drop-shadow-lg"
            />
          </div>
          <div>
            {mounted && (
              <p className="text-primary-200 text-sm font-sans font-medium mb-1">
                {new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
            <h1 className="font-display text-3xl lg:text-4xl text-white mb-1">
              Ahoy, {displayName}!
            </h1>
            <p className="text-primary-200 font-sans text-sm lg:text-base max-w-md">
              You have{' '}
              <span className="font-semibold" style={{ color: '#ff751f' }}>{collectedCount} cards</span>{' '}
              in your collection. Keep fishing to unlock more!
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-4">
              <div
                className="rounded-full px-3 py-1 flex items-center gap-1.5 border border-white/20"
                style={{ backgroundColor: 'rgba(255,117,31,0.2)', animation: 'pulseBadge 3s ease-in-out infinite' }}
              >
                <Icon name="StarIcon" size={14} className="text-amber-400" />
                <span className="text-amber-200 text-xs font-sans font-semibold">{tier}</span>
              </div>
              {streak > 0 && (
                <div className="bg-white/10 border border-white/20 rounded-full px-3 py-1 flex items-center gap-1.5">
                  <Icon name="FireIcon" size={14} className="text-orange-400" />
                  <span className="text-white text-xs font-sans font-semibold">{streak} Week Streak</span>
                </div>
              )}
              <div className="bg-white/10 border border-white/20 rounded-full px-3 py-1 flex items-center gap-1.5">
                <Icon name="TrophyIcon" size={14} className="text-blue-300" />
                <span className="text-white text-xs font-sans font-semibold">Level {level} Angler</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-3">
          <Link
            href="/catch-log"
            className="inline-flex items-center gap-2 text-white font-sans font-semibold text-sm px-5 py-3 rounded-xl shadow-card transition-all duration-150 active:scale-95 hover:shadow-lg hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #ff751f, #e85a00)', boxShadow: '0 4px 16px rgba(255,117,31,0.4)' }}
          >
            <Icon name="PlusCircleIcon" size={18} />
            Log a Catch
          </Link>

          {/* XP progress */}
          <div className="w-full sm:w-52">
            <div className="flex justify-between mb-1">
              <span className="text-primary-200 text-xs font-sans">XP to Level {level + 1}</span>
              <span className="text-xs font-sans font-semibold tabular-nums" style={{ color: '#ff751f' }}>{xp} / {xpNeeded}</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 relative overflow-hidden"
                style={{ width: `${xpProgress}%`, background: 'linear-gradient(90deg, #ff751f, #E9A23B)' }}
              >
                {/* Shimmer on XP bar */}
                <div className="absolute inset-0 foil-shimmer opacity-60" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}