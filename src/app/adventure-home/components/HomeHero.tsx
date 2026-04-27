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

const XP_THRESHOLDS: Record<number, number> = {
  1: 150, 2: 400, 3: 750, 4: 1200, 5: 1800,
  6: 2500, 7: 3400, 8: 4500, 9: 6000, 10: 6000,
};

const HERO_DESKTOP = 'https://voyagers-hook.github.io/images/adventure%20home%20desktop.jpg';
const HERO_MOBILE  = 'https://voyagers-hook.github.io/images/adventure%20home%20mobile.jpg';

export default function HomeHero() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [collectedCount, setCollectedCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    if (!user) { 
      setLoading(false); 
      return; 
    }

    let isCancelled = false; // Prevents memory leaks if component unmounts
    const supabase = createClient();

    Promise.all([
      supabase
        .from('user_profiles')
        .select('username, xp, level, streak_weeks, membership_tier, total_points')
        .eq('id', user.id)
        .single(),
      supabase
        .from('user_cards')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),
    ])
      .then(([profResult, countResult]) => {
        if (isCancelled) return;
        
        // Safely handle potential Supabase errors
        if (profResult.error) console.error('Profile fetch error:', profResult.error);
        if (countResult.error) console.error('Card count error:', countResult.error);

        if (profResult.data) setProfile(profResult.data);
        setCollectedCount(countResult.count ?? 0);
        setLoading(false);
      })
      .catch((err) => {
        if (isCancelled) return;
        console.error('Unexpected error:', err);
        setLoading(false);
      });

      return () => {
        isCancelled = true; // Cleanup function
      };
  }, [user]);

  const displayName  = profile?.username || user?.email?.split('@')[0] || 'Captain';
  const xp           = profile?.xp ?? 0;
  const level        = profile?.level ?? 1;
  const streak       = profile?.streak_weeks ?? 0;
  const tier         = profile?.membership_tier ?? 'Novice Angler';
  const nextLevelXp  = XP_THRESHOLDS[level] ?? 6000;
  const xpProgress   = Math.min(Math.round((xp / nextLevelXp) * 100), 100);

  return (
    <div className="relative overflow-hidden rounded-3xl w-full max-w-[1400px] mx-auto min-h-[680px] sm:min-h-[400px] flex items-center">
      
      {/* ── Background images ── */}
      <img
        src={HERO_DESKTOP}
        alt="Desktop Background"
        className="absolute inset-0 w-full h-full object-cover hidden sm:block"
      />
      <img
        src={HERO_MOBILE}
        alt="Mobile Background"
        className="absolute inset-0 w-full h-full object-cover sm:hidden"
      />

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, rgba(9,20,8,0.75) 0%, rgba(26,61,40,0.6) 50%, rgba(45,106,79,0.5) 100%)' }} />

      {/* Content */}
      <div className="relative w-full z-10 p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        
        {/* Left — greeting */}
        <div className="flex items-start gap-4">
          <div className="hidden sm:block flex-shrink-0" style={{ animation: 'logoWobble 6s ease-in-out infinite' }}>
            <Image
              src="/assets/images/little_voyagers_logo-1776778067350.png"
              alt="Little Voyagers Project Somerset"
              width={100} height={100}
              className="object-contain drop-shadow-lg"
            />
          </div>
          <div>
            {mounted && (
              <p className="text-primary-200 text-sm font-sans font-medium mb-1">
                {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
            <h1 className="font-display text-3xl lg:text-4xl text-white mb-1">
              Ahoy, {displayName}!
            </h1>
            <p className="text-primary-200 font-sans text-sm lg:text-base max-w-md">
              You have{' '}
              <span className="font-semibold" style={{ color: '#ff751f' }}>{collectedCount} card{collectedCount !== 1 ? 's' : ''}</span>{' '}
              in your collection. Keep fishing to unlock more!
            </p>
          </div>
        </div>

        {/* Right — CTA + level/XP widget */}
        <div className="flex flex-col sm:items-end gap-4">
          <Link
            href="/catch-log"
            className="inline-flex items-center justify-center gap-2 text-white font-sans font-semibold text-sm px-5 py-3 rounded-xl shadow-card transition-all duration-150 active:scale-95 hover:shadow-lg hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #ff751f, #e85a00)', boxShadow: '0 4px 16px rgba(255,117,31,0.4)' }}
          >
            <Icon name="PlusCircleIcon" size={18} />
            Log a Catch
          </Link>

          {/* XP / level bar */}
          <div className="w-full sm:w-100 rounded-2xl border border-white/20 p-3"
            style={{ backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Icon name="StarIcon" size={13} className="text-amber-400" />
                <span className="text-amber-200 text-xs font-sans font-semibold">Level {level} · {tier}</span>
              </div>
              {streak > 0 && (
                <div className="flex items-center gap-1">
                  <Icon name="FireIcon" size={12} className="text-orange-400" />
                  <span className="text-white text-xs font-sans font-semibold">{streak}w streak</span>
                </div>
              )}
            </div>
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
              {loading ? (
                <div className="h-full w-full bg-white/10 animate-pulse rounded-full" />
              ) : (
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: xpProgress > 0 ? `${xpProgress}%` : '2px',
                    background: 'linear-gradient(90deg, #ff751f, #E9A23B)',
                    minWidth: xpProgress > 0 ? undefined : '2px',
                  }}
                />
              )}
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-white/40 text-[10px] font-sans">
                {xp === 0 ? 'Complete activities to earn XP!' : `${xp} XP earned`}
              </span>
              <span className="text-[10px] font-sans font-semibold tabular-nums" style={{ color: '#ff751f' }}>
                {xp} / {nextLevelXp}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
