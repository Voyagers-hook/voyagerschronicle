'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Reward {
  id: string;
  label: string;
  description: string;
  pointsCost: number;
  type: string;
  icon: string;
  color: string;
  bg: string;
}

const rewards: Reward[] = [
  { id: 'pack-1',    label: 'Card Pack',          description: 'Receive a random pack of 3 new fishing cards to add to your collection!',  pointsCost: 500,  type: 'card-pack',   icon: 'GiftIcon',              color: '#ff751f', bg: 'bg-orange-50'  },
  { id: 'pack-2',    label: 'Rare Pack',           description: 'A special pack guaranteed to contain at least one Elusive or rarer card!',  pointsCost: 1000, type: 'rare-pack',   icon: 'SparklesIcon',          color: '#3B82F6', bg: 'bg-blue-50'    },
  { id: 'discount',  label: '10% Shop Discount',   description: 'Get a 10% discount code for your next purchase at Voyagers Hook!',          pointsCost: 750,  type: 'discount',    icon: 'TagIcon',               color: '#2D6A4F', bg: 'bg-green-50'   },
  { id: 'discount2', label: '20% Shop Discount',   description: 'Get a 20% discount code for your next purchase at Voyagers Hook!',          pointsCost: 1500, type: 'discount',    icon: 'TagIcon',               color: '#7C3AED', bg: 'bg-purple-50'  },
  { id: 'external',  label: 'Rewards Page',        description: 'Visit the Voyagers Hook rewards page to choose from exclusive prizes!',     pointsCost: 2000, type: 'external',    icon: 'TrophyIcon',            color: '#F59E0B', bg: 'bg-amber-50'   },
  { id: 'legend',    label: 'Legendary Pack',      description: 'An ultra-rare pack with a chance of containing a Legendary card!',          pointsCost: 2500, type: 'legend-pack', icon: 'StarIcon',              color: '#F59E0B', bg: 'bg-yellow-50'  },
];

export default function RewardsPage() {
  const { user } = useAuth();
  const [totalPoints, setTotalPoints] = useState(0);
  const [redemptions, setRedemptions] = useState<{ reward_label: string; points_cost: number; redeemed_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    Promise.all([
      supabase.from('user_profiles').select('total_points').eq('id', user.id).single(),
      supabase.from('rewards_redemptions').select('reward_label, points_cost, redeemed_at').eq('user_id', user.id).order('redeemed_at', { ascending: false }).limit(5),
    ]).then(([{ data: prof, error: profError }, { data: reds, error: redsError }]) => {
      if (prof) setTotalPoints(prof.total_points || 0);
      setRedemptions(reds || []);
      setLoading(false);
    });
  }, [user]);

  const handleRedeem = async (reward: Reward) => {
    if (!user || totalPoints < reward.pointsCost) {
      toast.error(`You need ${reward.pointsCost - totalPoints} more points to redeem this!`);
      return;
    }
    setRedeeming(reward.id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('rewards_redemptions').insert({
        user_id: user.id,
        reward_type: reward.type,
        reward_label: reward.label,
        points_cost: reward.pointsCost,
      });
      if (error) throw error;
      // Deduct points
      await supabase.from('user_profiles').update({ total_points: totalPoints - reward.pointsCost }).eq('id', user.id);
      setTotalPoints(p => p - reward.pointsCost);
      toast.success(`${reward.label} redeemed! The Voyagers Hook team will be in touch.`);
      // Refresh redemptions
      const { data: reds } = await supabase.from('rewards_redemptions').select('reward_label, points_cost, redeemed_at').eq('user_id', user.id).order('redeemed_at', { ascending: false }).limit(5);
      setRedemptions(reds || []);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Redemption failed');
    } finally {
      setRedeeming(null);
    }
  };

  return (
    <AppLayout currentPath="/rewards">
      <div className="fade-in space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8" style={{ background: 'linear-gradient(135deg, #091408 0%, #1A3D28 50%, #2D6A4F 100%)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #F59E0B, transparent)', transform: 'translate(30%, -30%)' }} />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Icon name="StarIcon" size={22} className="text-amber-400" />
                </div>
                <h1 className="font-display text-3xl lg:text-4xl text-white">Rewards</h1>
              </div>
              <p className="text-primary-200 font-sans text-sm">Spend your hard-earned points on amazing rewards!</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-2xl px-5 py-3 text-center">
              <p className="text-primary-200 text-xs font-sans font-semibold uppercase tracking-wide">Your Points</p>
              {loading ? (
                <div className="h-8 w-24 bg-white/20 rounded-lg animate-pulse mt-1" />
              ) : (
                <p className="font-display text-3xl text-white tabular-nums">{totalPoints.toLocaleString()}</p>
              )}
            </div>
          </div>
        </div>

        {/* Rewards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward) => {
            const canAfford = totalPoints >= reward.pointsCost;
            return (
              <div key={reward.id} className={`bg-white rounded-3xl border border-adventure-border shadow-card p-5 flex flex-col card-lift ${!canAfford ? 'opacity-75' : ''}`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${reward.bg}`}>
                  <Icon name={reward.icon as Parameters<typeof Icon>[0]['name']} size={26} style={{ color: reward.color }} />
                </div>
                <h3 className="font-display text-xl text-primary-800 mb-1">{reward.label}</h3>
                <p className="font-sans text-sm text-earth-500 leading-relaxed flex-1 mb-4">{reward.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Icon name="StarIcon" size={14} className="text-amber-500" />
                    <span className="font-display text-lg text-primary-800 tabular-nums">{reward.pointsCost.toLocaleString()}</span>
                    <span className="text-xs font-sans text-earth-400">pts</span>
                  </div>
                  <button
                    onClick={() => handleRedeem(reward)}
                    disabled={!canAfford || redeeming === reward.id || loading}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-sans font-semibold transition-all active:scale-95 ${canAfford ? 'text-white' : 'bg-earth-100 text-earth-400 cursor-not-allowed'}`}
                    style={canAfford ? { backgroundColor: '#ff751f' } : {}}
                  >
                    {redeeming === reward.id ? (
                      <Icon name="ArrowPathIcon" size={14} className="animate-spin" />
                    ) : (
                      <Icon name="GiftIcon" size={14} />
                    )}
                    {canAfford ? 'Redeem' : `Need ${(reward.pointsCost - totalPoints).toLocaleString()} more`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Redemption history */}
        {redemptions.length > 0 && (
          <div className="bg-white rounded-3xl border border-adventure-border shadow-card p-6">
            <h2 className="font-display text-xl text-primary-800 mb-4">Redemption History</h2>
            <div className="space-y-2">
              {redemptions.map((r, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-adventure-bg">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Icon name="GiftIcon" size={16} className="text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans font-semibold text-primary-800 text-sm">{r.reward_label}</p>
                    <p className="text-xs font-sans text-earth-400">{new Date(r.redeemed_at).toLocaleDateString('en-AU')}</p>
                  </div>
                  <span className="text-xs font-sans font-bold text-amber-600 flex-shrink-0">-{r.points_cost} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
