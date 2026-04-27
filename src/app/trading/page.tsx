'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type TradeStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';
type Tab = 'browse' | 'incoming' | 'my-offers';

interface Card {
  id: string;
  name: string;
  rarity: string;
  power: number;
  stealth: number;
  energy: number;
  beauty: number;
  gradient: string;
  border_color: string;
  image_url: string | null;
}

interface UserCard {
  user_card_id: string;
  card: Card;
  owner_id: string;
  owner_username: string;
}

interface Trade {
  id: string;
  from_user_id: string;
  to_user_id: string;
  offered_card_id: string;
  wanted_card_id: string;
  trade_status: TradeStatus;
  created_at: string;
  from_username?: string;
  to_username?: string;
  offered_card?: Card;
  wanted_card?: Card;
}

const rarityColors: Record<string, { bg: string; text: string; border: string }> = {
  Widespread: { bg: '#f5ede0', text: '#92400e', border: '#c49050' },
  Elusive:    { bg: '#eaf4ee', text: '#1A3D28', border: '#2D6A4F' },
  Specimen:   { bg: '#eff6ff', text: '#1e40af', border: '#3B82F6' },
  Legendary:  { bg: '#fffbeb', text: '#92400e', border: '#F59E0B' },
};

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-sans text-earth-400 w-14 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-earth-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-sans font-semibold text-earth-600 w-6 text-right tabular-nums">{value}</span>
    </div>
  );
}

function MiniCardDisplay({ card }: { card: Card }) {
  const rc = rarityColors[card.rarity] ?? rarityColors.Widespread;
  return (
    <div className="w-28 rounded-2xl overflow-hidden shadow-card flex-shrink-0"
      style={{ border: `2px solid ${card.border_color}` }}>
      <div className={`bg-gradient-to-br ${card.gradient} h-20 flex flex-col items-center justify-center p-2 relative overflow-hidden`}>
        {card.image_url ? (
          <img src={card.image_url} alt={card.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <Icon name="SparklesIcon" size={20} className="text-white/80 mb-1" />
        )}
        <p className="text-white font-display text-xs text-center leading-tight relative z-10 drop-shadow">{card.name}</p>
      </div>
      <div className="bg-white px-2 py-2 space-y-1">
        <span className="block text-center text-xs font-sans font-bold rounded-full px-2 py-0.5 mb-1"
          style={{ backgroundColor: rc.bg, color: rc.text }}>{card.rarity}</span>
        <StatBar label="PWR" value={card.power}   color="#ef4444" />
        <StatBar label="STL" value={card.stealth} color="#2D6A4F" />
        <StatBar label="ENE" value={card.energy}  color="#3B82F6" />
        <StatBar label="BEA" value={card.beauty}  color="#ec4899" />
      </div>
    </div>
  );
}

export default function TradingPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<Tab>('browse');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  // Data
  const [availableCards, setAvailableCards] = useState<UserCard[]>([]); // other users' cards marked for trade
  const [myCards, setMyCards] = useState<Card[]>([]);                   // my opened cards
  const [incomingTrades, setIncomingTrades] = useState<Trade[]>([]);
  const [myOutgoingTrades, setMyOutgoingTrades] = useState<Trade[]>([]);

  // Propose trade modal
  const [proposingFor, setProposingFor] = useState<UserCard | null>(null); // card I want
  const [selectedMyCard, setSelectedMyCard] = useState<Card | null>(null);  // card I'm offering

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // 1. All opened cards that are NOT mine — available to browse
    const { data: othersCards } = await supabase
      .from('user_cards')
      .select(`
        id,
        user_id,
        cards (id, name, rarity, power, stealth, energy, beauty, gradient, border_color, image_url),
        user_profiles (username)
      `)
      .eq('opened', true)
      .neq('user_id', user.id);

    if (othersCards) {
      setAvailableCards(othersCards.map((uc: any) => ({
        user_card_id: uc.id,
        card: uc.cards,
        owner_id: uc.user_id,
        owner_username: uc.user_profiles?.username ?? 'Unknown',
      })));
    }

    // 2. My opened cards
    const { data: mine } = await supabase
      .from('user_cards')
      .select('cards (id, name, rarity, power, stealth, energy, beauty, gradient, border_color, image_url)')
      .eq('user_id', user.id)
      .eq('opened', true);

    if (mine) setMyCards(mine.map((uc: any) => uc.cards).filter(Boolean));

    // 3. Incoming trades (someone wants my card)
    const { data: incoming } = await supabase
      .from('trades')
      .select('*')
      .eq('to_user_id', user.id)
      .order('created_at', { ascending: false });

    if (incoming) {
      // Enrich with card and user details
      const enriched = await Promise.all(incoming.map(async (t: Trade) => {
        const [offeredRes, wantedRes, fromRes] = await Promise.all([
          supabase.from('cards').select('*').eq('id', t.offered_card_id).single(),
          supabase.from('cards').select('*').eq('id', t.wanted_card_id).single(),
          supabase.from('user_profiles').select('username').eq('id', t.from_user_id).single(),
        ]);
        return {
          ...t,
          offered_card: offeredRes.data,
          wanted_card: wantedRes.data,
          from_username: fromRes.data?.username,
        };
      }));
      setIncomingTrades(enriched);
    }

    // 4. My outgoing trades
    const { data: outgoing } = await supabase
      .from('trades')
      .select('*')
      .eq('from_user_id', user.id)
      .order('created_at', { ascending: false });

    if (outgoing) {
      const enriched = await Promise.all(outgoing.map(async (t: Trade) => {
        const [offeredRes, wantedRes, toRes] = await Promise.all([
          supabase.from('cards').select('*').eq('id', t.offered_card_id).single(),
          supabase.from('cards').select('*').eq('id', t.wanted_card_id).single(),
          supabase.from('user_profiles').select('username').eq('id', t.to_user_id).single(),
        ]);
        return {
          ...t,
          offered_card: offeredRes.data,
          wanted_card: wantedRes.data,
          to_username: toRes.data?.username,
        };
      }));
      setMyOutgoingTrades(enriched);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  // Pre-select card from ?offer=cardId coming from FullCardViewer
  useEffect(() => {
    const offerId = searchParams.get('offer');
    if (offerId && myCards.length > 0) {
      const preSelected = myCards.find(c => c.id === offerId);
      if (preSelected) {
        setSelectedMyCard(preSelected);
        setTab('browse');
      }
    }
  }, [searchParams, myCards]);

  // Send trade proposal
  const handlePropose = async () => {
    if (!proposingFor || !selectedMyCard || !user) return;
    const { error } = await supabase.from('trades').insert({
      from_user_id: user.id,
      to_user_id: proposingFor.owner_id,
      offered_card_id: selectedMyCard.id,
      wanted_card_id: proposingFor.card.id,
      trade_status: 'pending',
    });
    if (error) { showToast('Error sending trade: ' + error.message); return; }
    showToast(`Trade proposal sent to ${proposingFor.owner_username}!`);
    setProposingFor(null);
    setSelectedMyCard(null);
    loadData();
  };

  // Accept incoming trade
  const handleAccept = async (trade: Trade) => {
    const { error } = await supabase
      .from('trades')
      .update({ trade_status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', trade.id);
    if (error) { showToast('Error accepting trade'); return; }

    // Swap ownership in user_cards
    await Promise.all([
      supabase.from('user_cards').update({ user_id: trade.to_user_id }).eq('card_id', trade.offered_card_id).eq('user_id', trade.from_user_id),
      supabase.from('user_cards').update({ user_id: trade.from_user_id }).eq('card_id', trade.wanted_card_id).eq('user_id', trade.to_user_id),
    ]);

    showToast('Trade accepted! Cards have been swapped. ✓');
    loadData();
  };

  // Decline incoming trade
  const handleDecline = async (id: string) => {
    await supabase.from('trades').update({ trade_status: 'declined', updated_at: new Date().toISOString() }).eq('id', id);
    showToast('Trade declined.');
    loadData();
  };

  // Cancel my outgoing trade
  const handleCancel = async (id: string) => {
    await supabase.from('trades').update({ trade_status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', id);
    showToast('Trade cancelled.');
    loadData();
  };

  const pendingCount = incomingTrades.filter(t => t.trade_status === 'pending').length;

  const tabs: { key: Tab; label: string; iconName: Parameters<typeof Icon>[0]['name'] }[] = [
    { key: 'browse',    label: 'Browse Cards',                                       iconName: 'MagnifyingGlassIcon' },
    { key: 'incoming',  label: `Incoming${pendingCount > 0 ? ` (${pendingCount})` : ''}`, iconName: 'InboxIcon'           },
    { key: 'my-offers', label: 'My Offers',                                          iconName: 'PaperAirplaneIcon'   },
  ];

  return (
    <AppLayout currentPath="/trading">
      <div className="fade-in space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8"
          style={{ background: 'linear-gradient(135deg, #091408 0%, #1A3D28 50%, #2D6A4F 100%)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #ff751f, transparent)', transform: 'translate(30%, -30%)' }} />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Icon name="ArrowsRightLeftIcon" size={22} className="text-white" />
              </div>
              <h1 className="font-display text-3xl lg:text-4xl text-white">Trading Post</h1>
            </div>
            <p className="text-primary-200 font-sans text-sm max-w-lg">
              Browse cards other Voyagers own, or propose trades. Same-rarity swaps are fair trades.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white rounded-2xl border border-adventure-border p-1.5 shadow-card w-fit">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-sans font-semibold transition-all ${tab === t.key ? 'text-white shadow-sm' : 'text-earth-500 hover:text-primary-700 hover:bg-primary-50'}`}
              style={tab === t.key ? { backgroundColor: '#ff751f' } : {}}>
              <Icon name={t.iconName} size={15} />
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Icon name="ArrowPathIcon" size={36} className="animate-spin text-orange-400" />
          </div>
        ) : (
          <>
            {/* ── BROWSE ── */}
            {tab === 'browse' && (
              <div className="space-y-4">
                {selectedMyCard && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                    <Icon name="InformationCircleIcon" size={18} className="text-amber-500 flex-shrink-0" />
                    <p className="text-sm font-sans text-amber-800">
                      You're offering <strong>{selectedMyCard.name}</strong> — tap a card below to propose a trade.
                    </p>
                    <button onClick={() => setSelectedMyCard(null)} className="ml-auto text-amber-500 hover:text-amber-700">
                      <Icon name="XMarkIcon" size={16} />
                    </button>
                  </div>
                )}
                {availableCards.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-adventure-border">
                    <Icon name="MagnifyingGlassIcon" size={48} className="text-earth-200 mx-auto mb-3" />
                    <p className="font-display text-xl text-primary-700">No cards available yet</p>
                    <p className="text-earth-400 font-sans text-sm mt-1">When other members receive cards, they'll appear here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {availableCards.map(uc => {
                      const isFair = selectedMyCard?.rarity === uc.card.rarity;
                      return (
                        <div key={uc.user_card_id} className="bg-white rounded-2xl border border-adventure-border shadow-card p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700 font-sans flex-shrink-0">
                              {uc.owner_username.slice(0, 2).toUpperCase()}
                            </div>
                            <p className="text-xs font-sans font-semibold text-primary-800">{uc.owner_username}</p>
                            {selectedMyCard && isFair && (
                              <span className="ml-auto text-xs font-sans font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">Fair</span>
                            )}
                          </div>
                          <div className="flex justify-center mb-3">
                            <MiniCardDisplay card={uc.card} />
                          </div>
                          <button
                            onClick={() => setProposingFor(uc)}
                            className="w-full text-white font-sans font-semibold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5"
                            style={{ backgroundColor: '#ff751f' }}>
                            <Icon name="ArrowsRightLeftIcon" size={12} />
                            Propose Trade
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── INCOMING ── */}
            {tab === 'incoming' && (
              <div className="space-y-4">
                {incomingTrades.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-adventure-border">
                    <Icon name="InboxIcon" size={48} className="text-earth-200 mx-auto mb-3" />
                    <p className="font-display text-xl text-primary-700">No trade offers yet</p>
                    <p className="text-earth-400 font-sans text-sm mt-1">When members propose trades, they'll appear here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {incomingTrades.map(trade => (
                      <div key={trade.id} className="bg-white rounded-2xl border border-adventure-border shadow-card p-5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700 font-sans">
                            {(trade.from_username ?? 'U').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-sans font-semibold text-primary-800 text-sm">{trade.from_username}</p>
                            <p className="text-xs font-sans text-earth-400">{new Date(trade.created_at).toLocaleDateString('en-GB')}</p>
                          </div>
                          <span className={`ml-auto text-xs font-sans font-bold px-2.5 py-1 rounded-full ${
                            trade.trade_status === 'pending'  ? 'bg-amber-100 text-amber-700' :
                            trade.trade_status === 'accepted' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'}`}>
                            {trade.trade_status.charAt(0).toUpperCase() + trade.trade_status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center justify-center gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-xs font-sans text-earth-400 mb-1">They Offer</p>
                            {trade.offered_card && <MiniCardDisplay card={trade.offered_card} />}
                          </div>
                          <div className="w-10 h-10 rounded-full bg-primary-50 border border-primary-200 flex items-center justify-center flex-shrink-0">
                            <Icon name="ArrowsRightLeftIcon" size={18} className="text-primary-500" />
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-sans text-earth-400 mb-1">They Want</p>
                            {trade.wanted_card && <MiniCardDisplay card={trade.wanted_card} />}
                          </div>
                        </div>
                        {trade.trade_status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleAccept(trade)}
                              className="flex-1 text-white font-sans font-semibold text-sm py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                              style={{ backgroundColor: '#ff751f' }}>
                              <Icon name="CheckIcon" size={14} /> Accept
                            </button>
                            <button onClick={() => handleDecline(trade.id)}
                              className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-sans font-semibold text-sm py-2.5 rounded-xl flex items-center justify-center gap-1.5">
                              <Icon name="XMarkIcon" size={14} /> Decline
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── MY OFFERS ── */}
            {tab === 'my-offers' && (
              <div className="space-y-4">
                {myOutgoingTrades.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-adventure-border">
                    <Icon name="PaperAirplaneIcon" size={48} className="text-earth-200 mx-auto mb-3" />
                    <p className="font-display text-xl text-primary-700">No outgoing offers</p>
                    <p className="text-earth-400 font-sans text-sm mt-1">Browse cards and propose trades to see them here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myOutgoingTrades.map(trade => (
                      <div key={trade.id} className="bg-white rounded-2xl border border-adventure-border shadow-card p-5">
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-sans font-semibold text-primary-800 text-sm">To: {trade.to_username}</p>
                          <span className={`text-xs font-sans font-bold px-2.5 py-1 rounded-full ${
                            trade.trade_status === 'pending'  ? 'bg-amber-100 text-amber-700' :
                            trade.trade_status === 'accepted' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'}`}>
                            {trade.trade_status.charAt(0).toUpperCase() + trade.trade_status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center justify-center gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-xs font-sans text-earth-400 mb-1">Your card</p>
                            {trade.offered_card && <MiniCardDisplay card={trade.offered_card} />}
                          </div>
                          <Icon name="ArrowsRightLeftIcon" size={18} className="text-primary-400 flex-shrink-0" />
                          <div className="text-center">
                            <p className="text-xs font-sans text-earth-400 mb-1">Their card</p>
                            {trade.wanted_card && <MiniCardDisplay card={trade.wanted_card} />}
                          </div>
                        </div>
                        {trade.trade_status === 'pending' && (
                          <button onClick={() => handleCancel(trade.id)}
                            className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-sans font-semibold text-sm py-2.5 rounded-xl flex items-center justify-center gap-1.5">
                            <Icon name="XMarkIcon" size={14} /> Cancel Offer
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── PROPOSE TRADE MODAL ── */}
        {proposingFor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => { setProposingFor(null); setSelectedMyCard(null); }}>
            <div className="bg-white rounded-3xl shadow-panel p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl text-primary-800">Propose a Trade</h3>
                <button onClick={() => { setProposingFor(null); setSelectedMyCard(null); }}
                  className="p-2 rounded-xl hover:bg-primary-50 text-earth-400">
                  <Icon name="XMarkIcon" size={18} />
                </button>
              </div>

              <p className="text-sm font-sans text-earth-500 mb-4">
                You want <strong className="text-primary-800">{proposingFor.card.name}</strong> ({proposingFor.card.rarity}) from <strong className="text-primary-800">{proposingFor.owner_username}</strong>. Select one of your cards to offer:
              </p>

              {myCards.length === 0 ? (
                <p className="text-sm font-sans text-earth-400 text-center py-6">You don't have any cards to offer yet.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {myCards.map(card => {
                    const isFair = card.rarity === proposingFor.card.rarity;
                    const isSelected = selectedMyCard?.id === card.id;
                    return (
                      <button key={card.id} onClick={() => setSelectedMyCard(card)}
                        className={`rounded-xl overflow-hidden border-2 transition-all text-left ${isSelected ? 'border-orange-500 ring-2 ring-orange-300' : isFair ? 'border-green-400' : 'border-adventure-border'}`}>
                        <div className={`bg-gradient-to-br ${card.gradient} h-14 flex items-center justify-center relative`}>
                          {card.image_url && <img src={card.image_url} alt={card.name} className="absolute inset-0 w-full h-full object-cover" />}
                          <p className="text-white font-display text-xs text-center px-2 leading-tight relative z-10 drop-shadow">{card.name}</p>
                        </div>
                        <div className="bg-white p-2 flex items-center justify-between">
                          <span className="text-xs font-sans font-bold" style={{ color: rarityColors[card.rarity]?.text ?? '#333' }}>{card.rarity}</span>
                          {isFair && <span className="text-xs text-green-600 font-sans font-semibold">Fair</span>}
                          {isSelected && <Icon name="CheckCircleIcon" size={14} className="text-orange-500" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => { setProposingFor(null); setSelectedMyCard(null); }}
                  className="flex-1 bg-earth-50 hover:bg-earth-100 text-earth-600 font-sans font-semibold text-sm py-3 rounded-xl">
                  Cancel
                </button>
                <button onClick={handlePropose} disabled={!selectedMyCard}
                  className="flex-1 text-white font-sans font-semibold text-sm py-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#ff751f' }}>
                  Send Proposal
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
