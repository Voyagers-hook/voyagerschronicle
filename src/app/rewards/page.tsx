'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Reward {
  id: string;
  title: string;
  description: string | null;
  xp_cost: number;
  reward_type: string;
  icon: string;
  image_url: string | null;
  stock: number | null;
  link: string | null;
}

interface Redemption {
  id: string;
  reward_title: string;
  xp_cost: number;
  status: 'pending' | 'fulfilled' | 'declined';
  redeemed_at: string;
  admin_notes: string | null;
}

const typeColor: Record<string, string> = {
  discount:   'bg-blue-100 text-blue-700',
  freebie:    'bg-green-100 text-green-700',
  merch:      'bg-purple-100 text-purple-700',
  experience: 'bg-amber-100 text-amber-700',
  general:    'bg-gray-100 text-gray-600',
  'card-pack':'bg-orange-100 text-orange-700',
  external:   'bg-teal-100 text-teal-700',
};

const statusStyle: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-700',
  fulfilled: 'bg-green-100 text-green-700',
  declined:  'bg-red-100 text-red-700',
};

export default function RewardsPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [userXP, setUserXP] = useState(0);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<Reward | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [toast, setToast] = useState('');
  const [tab, setTab] = useState<'browse' | 'history'>('browse');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const [rewardsRes, profileRes, redemptionsRes] = await Promise.all([
      supabase.from('rewards_catalogue').select('*').eq('active', true).order('xp_cost'),
      supabase.from('user_profiles').select('xp').eq('id', user.id).single(),
      supabase.from('rewards_redemptions')
        .select('id, reward_title, xp_cost, status, redeemed_at, admin_notes')
        .eq('user_id', user.id)
        .order('redeemed_at', { ascending: false }),
    ]);

    if (rewardsRes.data)    setRewards(rewardsRes.data);
    if (profileRes.data)    setUserXP(profileRes.data.xp ?? 0);
    if (redemptionsRes.data) setRedemptions(redemptionsRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleRedeem = async () => {
    if (!confirming || !user) return;
    setRedeeming(true);

    const { error } = await supabase.from('rewards_redemptions').insert({
      user_id:      user.id,
      catalogue_id: confirming.id,
      reward_title: confirming.title,
      reward_type:  confirming.reward_type,
      reward_label: confirming.title,
      status:       'pending',
    });

    setRedeeming(false);
    setConfirming(null);

    if (error) {
      showToast(error.message.includes('Not enough XP')
        ? "You don't have enough XP for this reward."
        : error.message.includes('out of stock')
        ? 'Sorry, this reward is out of stock.'
        : 'Something went wrong. Please try again.');
      return;
    }

    // Refresh XP balance and history
    await fetchData();
    showToast('Redeemed! ✓ We\'ll be in touch shortly.');
    setTab('history');
  };

  const pendingCount = redemptions.filter(r => r.status === 'pending').length;

  return (
    <AppLayout currentPath="/rewards">
      <div className="fade-in space-y-5">

        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8"
          style={{ background: 'linear-gradient(135deg, #091408 0%, #1A3D28 50%, #2D6A4F 100%)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #ff751f, transparent)', transform: 'translate(30%, -30%)' }} />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Icon name="GiftIcon" size={22} className="text-white" />
                </div>
                <h1 className="font-display text-3xl lg:text-4xl text-white">Rewards</h1>
              </div>
              <p className="text-primary-200 font-sans text-sm">Spend your XP on real rewards from Voyagers Hook.</p>
            </div>
            {/* XP balance */}
            <div className="bg-white/10 border border-white/20 rounded-2xl px-5 py-3 flex items-center gap-3">
              <Icon name="BoltIcon" size={22} className="text-amber-400" />
              <div>
                <p className="text-white/60 text-xs font-sans uppercase tracking-wide">Your XP</p>
                <p className="font-display text-3xl text-white tabular-nums">{userXP.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl border border-adventure-border p-1.5 shadow-card w-fit">
          <button onClick={() => setTab('browse')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-sans font-semibold transition-all ${tab === 'browse' ? 'text-white' : 'text-earth-500 hover:text-primary-700'}`}
            style={tab === 'browse' ? { backgroundColor: '#ff751f' } : {}}>
            <Icon name="SparklesIcon" size={14} />
            Browse Rewards
          </button>
          <button onClick={() => setTab('history')}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-sans font-semibold transition-all ${tab === 'history' ? 'text-white' : 'text-earth-500 hover:text-primary-700'}`}
            style={tab === 'history' ? { backgroundColor: '#ff751f' } : {}}>
            <Icon name="ClockIcon" size={14} />
            My Redemptions
            {pendingCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* Browse tab */}
        {tab === 'browse' && (
          <>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3].map(i => <div key={i} className="h-40 rounded-2xl bg-earth-100 animate-pulse" />)}
              </div>
            ) : rewards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-adventure-border">
                <Icon name="GiftIcon" size={40} className="text-earth-200 mb-3" />
                <p className="font-display text-lg text-primary-700">No rewards available yet</p>
                <p className="text-sm font-sans text-earth-400">Check back soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rewards.map(reward => {
                  const canAfford = userXP >= reward.xp_cost;
                  return (
                    <div key={reward.id}
                      className={`bg-white rounded-2xl border shadow-card overflow-hidden flex flex-col transition-all ${canAfford ? 'border-adventure-border hover:shadow-lg' : 'border-adventure-border opacity-70'}`}>
                      {/* Image or icon header */}
                      <div className="h-28 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center relative overflow-hidden">
                        {reward.image_url ? (
                          <img src={reward.image_url} alt={reward.title} className="w-full h-full object-cover" />
                        ) : (
                          <Icon name={reward.icon as any} size={48} className="text-primary-300" />
                        )}
                        <div className="absolute top-3 right-3">
                          <span className={`text-xs font-sans font-semibold px-2 py-0.5 rounded-full capitalize ${typeColor[reward.reward_type] ?? typeColor.general}`}>
                            {reward.reward_type}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-sans font-bold text-primary-800 text-sm mb-1">{reward.title}</h3>
                        {reward.description && (
                          <p className="text-xs font-sans text-earth-500 mb-3 flex-1">{reward.description}</p>
                        )}

                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-adventure-border">
                          <div className="flex items-center gap-1.5">
                            <Icon name="BoltIcon" size={14} className="text-amber-500" />
                            <span className="font-display text-lg text-amber-600">{reward.xp_cost.toLocaleString()}</span>
                            <span className="text-xs font-sans text-earth-400">XP</span>
                          </div>
                          <button
                            onClick={() => setConfirming(reward)}
                            disabled={!canAfford}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-sans font-bold transition-all active:scale-95 ${
                              canAfford
                                ? 'text-white hover:opacity-90'
                                : 'bg-earth-100 text-earth-400 cursor-not-allowed'
                            }`}
                            style={canAfford ? { backgroundColor: '#ff751f' } : {}}
                          >
                            {canAfford ? 'Redeem' : 'Need more XP'}
                          </button>
                        </div>

                        {!canAfford && (
                          <p className="text-xs font-sans text-earth-400 mt-2 text-right">
                            You need {(reward.xp_cost - userXP).toLocaleString()} more XP
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* History tab */}
        {tab === 'history' && (
          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl bg-earth-100 animate-pulse" />)}
              </div>
            ) : redemptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-adventure-border">
                <Icon name="ClockIcon" size={40} className="text-earth-200 mb-3" />
                <p className="font-display text-lg text-primary-700">No redemptions yet</p>
                <p className="text-sm font-sans text-earth-400">Redeem a reward and it will appear here.</p>
              </div>
            ) : (
              redemptions.map(r => (
                <div key={r.id} className="bg-white rounded-2xl border border-adventure-border shadow-card p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <Icon name="GiftIcon" size={18} className="text-primary-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans font-semibold text-sm text-primary-800">{r.reward_title}</p>
                    <p className="text-xs font-sans text-earth-400">
                      {new Date(r.redeemed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' · '}{r.xp_cost} XP spent
                    </p>
                    {r.admin_notes && (
                      <p className="text-xs font-sans text-primary-600 mt-1 bg-primary-50 rounded-lg px-2 py-1">
                        📋 {r.admin_notes}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs font-sans font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${statusStyle[r.status]}`}>
                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Confirm redemption modal */}
        {confirming && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto">
                <Icon name={confirming.icon as any} size={30} className="text-primary-500" />
              </div>
              <div className="text-center">
                <h3 className="font-display text-xl text-primary-800 mb-1">Confirm Redemption</h3>
                <p className="font-sans font-semibold text-primary-700">{confirming.title}</p>
                {confirming.description && (
                  <p className="text-sm font-sans text-earth-500 mt-1">{confirming.description}</p>
                )}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
                <p className="text-sm font-sans text-amber-700">
                  This will deduct <span className="font-bold">{confirming.xp_cost.toLocaleString()} XP</span> from your balance.
                </p>
                <p className="text-xs font-sans text-amber-600 mt-1">
                  You have {userXP.toLocaleString()} XP → you'll have {(userXP - confirming.xp_cost).toLocaleString()} XP after
                </p>
              </div>
              <p className="text-xs font-sans text-earth-400 text-center">
                The Voyagers Hook team will be notified and will fulfil your reward shortly.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirming(null)}
                  className="flex-1 py-2.5 rounded-xl border border-adventure-border text-sm font-sans font-semibold text-earth-500 hover:bg-earth-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleRedeem} disabled={redeeming}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-sans font-semibold disabled:opacity-60 transition-colors"
                  style={{ backgroundColor: '#ff751f' }}>
                  {redeeming ? 'Processing…' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 text-white text-sm font-sans font-semibold px-5 py-3 rounded-2xl shadow-panel fade-in"
            style={{ backgroundColor: '#ff751f' }}>
            {toast}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
