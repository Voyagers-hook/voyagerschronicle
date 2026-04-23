'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Reward {
  id: string;
  title: string;
  description: string;
  xp_cost: number;
  reward_type: string;
  icon: string;
  image_url?: string;
}

export default function RewardsPage() {
  const { user } = useAuth();
  const [availableRewards, setAvailableRewards] = useState<Reward[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [redemptions, setRedemptions] = useState<{ reward_label: string; xp_cost: number; redeemed_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    Promise.all([
      supabase.from('user_profiles').select('total_points').eq('id', user.id).single(),
      supabase.from('rewards_redemptions').select('reward_label, xp_cost, redeemed_at').eq('user_id', user.id).order('redeemed_at', { ascending: false }).limit(5),
      supabase.from('rewards_catalogue').select('*').eq('active', true).order('xp_cost', { ascending: true })
    ]).then(([profResult, redsResult, rewardsResult]) => {
      if (rewardsResult.error) {
        console.error("Error fetching rewards:", rewardsResult.error);
        toast.error("Could not load rewards catalogue");
      }
      
      if (profResult.data) setTotalPoints(profResult.data.total_points || 0);
      setRedemptions(redsResult.data || []);
      setAvailableRewards(rewardsResult.data || []);
      setLoading(false);
    });
  }, [user]);

  const handleRedeem = async (reward: Reward) => {
    const cost = reward.xp_cost;
    if (!user || totalPoints < cost) {
      toast.error(`You need ${cost - totalPoints} more points to redeem this!`);
      return;
    }
    setRedeeming(reward.id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('rewards_redemptions').insert({
        user_id: user.id,
        reward_type: reward.reward_type,
        reward_label: reward.title,
        xp_cost: cost,
        catalogue_id: reward.id,
      });
      if (error) throw error;
      // Deduct points
      await supabase.from('user_profiles').update({ total_points: totalPoints - cost }).eq('id', user.id);
      setTotalPoints(p => p - cost);
      toast.success(`${reward.title} redeemed! The Voyagers Hook team will be in touch.`);
      // Refresh redemptions
      const { data: reds } = await supabase.from('rewards_redemptions').select('reward_label, xp_cost, redeemed_at').eq('user_id', user.id).order('redeemed_at', { ascending: false }).limit(5);
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
          {availableRewards.map((reward) => {
            const canAfford = totalPoints >= reward.xp_cost;
            return (
              <div key={reward.id} className={`bg-white rounded-3xl border border-adventure-border shadow-card p-5 flex flex-col card-lift ${!canAfford ? 'opacity-75' : ''}`}>
                <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                  {reward.image_url ? (
                    <img src={reward.image_url} alt={reward.title} className="w-10 h-10 object-contain" />
                  ) : (
                    <Icon name={reward.icon as any} size={26} className="text-orange-500" />
                  )}
                </div>
                <h3 className="font-display text-xl text-primary-800 mb-1">{reward.title}</h3>
                <p className="font-sans text-sm text-earth-500 leading-relaxed flex-1 mb-4">{reward.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Icon name="StarIcon" size={14} className="text-amber-500" />
                    <span className="font-display text-lg text-primary-800 tabular-nums">{reward.xp_cost.toLocaleString()}</span>
                    <span className="text-xs font-sans text-earth-400">XP</span>
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
                    {canAfford ? 'Redeem' : `Need ${(reward.xp_cost - totalPoints).toLocaleString()} more`}
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
                  <span className="text-xs font-sans font-bold text-amber-600 flex-shrink-0">-{r.xp_cost} XP</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
