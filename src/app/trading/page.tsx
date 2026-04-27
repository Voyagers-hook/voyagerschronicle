'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type TradeStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';
type Tab = 'browse' | 'my-listings' | 'incoming' | 'my-offers';

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
  card_number: number;
}

interface Listing {
  id: string;
  user_id: string;
  user_card_id: string;
  card_id: string;
  card: Card;
  owner_username: string;
  created_at: string;
}

interface Trade {
  id: string;
  from_user_id: string;
  to_user_id: string;
  offered_card_id: string;
  offered_user_card_id: string;
  wanted_card_id: string;
  wanted_user_card_id: string;
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

const rarityGlowColors: Record<string, string> = {
  Widespread: 'rgba(196,144,80,0.5)',
  Elusive:    'rgba(45,106,79,0.6)',
  Specimen:   'rgba(59,130,246,0.7)',
  Legendary:  'rgba(245,158,11,0.8)',
};

/* ── Card display that matches the collection style ── */
function TradeCardDisplay({ card, size = 'normal' }: { card: Card; size?: 'normal' | 'small' }) {
  const isShiny = card.rarity === 'Specimen' || card.rarity === 'Legendary';
  const borderWidth = isShiny ? '3px' : '2px';
  const width = size === 'small' ? 'w-24' : 'w-32';

  return (
    <div className={`${width} flex-shrink-0`}>
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          aspectRatio: '750 / 1000',
          borderWidth,
          borderStyle: 'solid',
          borderColor: card.border_color,
          boxShadow: `0 0 ${isShiny ? 20 : 10}px ${isShiny ? 4 : 2}px ${rarityGlowColors[card.rarity] ?? 'rgba(0,0,0,0.1)'}`,
        }}
      >
        {/* Full bleed image or gradient */}
        {card.image_url ? (
          <img src={card.image_url} alt={card.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
            <Icon name="SparklesIcon" size={28} className="text-white/40" />
          </div>
        )}

        {/* Legendary overlay */}
        {card.rarity === 'Legendary' && (
          <>
            <div className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(255,0,128,0.25) 0%, rgba(255,165,0,0.25) 20%, rgba(255,255,0,0.25) 40%, rgba(0,255,128,0.25) 60%, rgba(0,128,255,0.25) 80%, rgba(128,0,255,0.25) 100%)',
                backgroundSize: '300% 300%',
                animation: 'legendaryRainbow 3s ease infinite',
                mixBlendMode: 'overlay',
              }} />
            <div className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(45deg, transparent 20%, rgba(255,255,255,0.8) 50%, transparent 80%)',
                backgroundSize: '200% 200%',
                animation: 'foilShimmer 2s ease infinite',
              }} />
          </>
        )}

        {/* Specimen overlay */}
        {card.rarity === 'Specimen' && (
          <>
            <div className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(147,197,253,0.3) 0%, rgba(196,181,253,0.3) 33%, rgba(167,243,208,0.3) 66%, rgba(147,197,253,0.3) 100%)',
                backgroundSize: '200% 200%',
                animation: 'specimenHolo 4s ease infinite',
                mixBlendMode: 'overlay',
              }} />
            <div className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, transparent 25%, rgba(255,255,255,0.6) 50%, transparent 75%)',
                backgroundSize: '200% 200%',
                animation: 'foilShimmer 2.5s ease infinite',
              }} />
          </>
        )}

        {/* Rarity icon badge */}
        {card.rarity === 'Legendary' && (
          <div className="absolute top-1.5 left-1.5 z-20">
            <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shadow-lg">
              <Icon name="StarIcon" size={11} className="text-white" />
            </div>
          </div>
        )}
        {card.rarity === 'Specimen' && (
          <div className="absolute top-1.5 left-1.5 z-20">
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
              <Icon name="SparklesIcon" size={10} className="text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Name + rarity label below the card */}
      <div className="mt-2 text-center">
        <p className="font-display text-xs text-primary-800 leading-tight truncate">{card.name}</p>
        <span className="inline-block text-xs font-sans font-bold mt-0.5 px-2 py-0.5 rounded-full"
          style={{ backgroundColor: rarityColors[card.rarity]?.bg ?? '#f5f5f5', color: rarityColors[card.rarity]?.text ?? '#333' }}>
          {card.rarity}
        </span>
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

  const [browseListings, setBrowseListings] = useState<Listing[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [myCards, setMyCards] = useState<{ user_card_id: string; card: Card }[]>([]);
  const [incomingTrades, setIncomingTrades] = useState<Trade[]>([]);
  const [myOutgoingTrades, setMyOutgoingTrades] = useState<Trade[]>([]);

  const [proposingFor, setProposingFor] = useState<Listing | null>(null);
  const [selectedMyCard, setSelectedMyCard] = useState<{ user_card_id: string; card: Card } | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    if (searchParams.get('listed') === 'true') {
      showToast('Card listed for trade! Other Voyagers can now see it.');
      setTab('my-listings');
    }
  }, [searchParams]);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // 1. Browse listings — other users'
    const { data: otherListings } = await supabase
      .from('trade_listings')
      .select(`
        id, user_id, user_card_id, card_id, created_at,
        cards (id, name, rarity, power, stealth, energy, beauty, gradient, border_color, image_url, card_number),
        user_cards ( user_profiles ( username ) )
      `)
      .neq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (otherListings) {
      setBrowseListings(otherListings
        .filter((l: any) => l.cards)
        .map((l: any) => ({
          id: l.id,
          user_id: l.user_id,
          user_card_id: l.user_card_id,
          card_id: l.card_id,
          card: l.cards,
          owner_username: l.user_cards?.user_profiles?.username ?? 'Unknown',
          created_at: l.created_at,
        })));
    }

    // 2. My listings
    const { data: myListingsData } = await supabase
      .from('trade_listings')
      .select(`
        id, user_id, user_card_id, card_id, created_at,
        cards (id, name, rarity, power, stealth, energy, beauty, gradient, border_color, image_url, card_number)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (myListingsData) {
      setMyListings(myListingsData
        .filter((l: any) => l.cards)
        .map((l: any) => ({
          id: l.id,
          user_id: l.user_id,
          user_card_id: l.user_card_id,
          card_id: l.card_id,
          card: l.cards,
          owner_username: 'Me',
          created_at: l.created_at,
        })));
    }

    // 3. My opened cards
    const { data: mine } = await supabase
      .from('user_cards')
      .select('id, card_id, cards (id, name, rarity, power, stealth, energy, beauty, gradient, border_color, image_url, card_number)')
      .eq('user_id', user.id)
      .eq('opened', true);

    if (mine) {
      setMyCards(mine
        .filter((uc: any) => uc.cards)
        .map((uc: any) => ({
          user_card_id: uc.id,
          card: uc.cards,
        })));
    }

    // 4. Incoming trades
    const { data: incoming } = await supabase
      .from('trades')
      .select('*')
      .eq('to_user_id', user.id)
      .order('created_at', { ascending: false });

    if (incoming) {
      const enriched = await Promise.all(incoming.map(async (t: Trade) => {
        const [offeredRes, wantedRes, fromRes] = await Promise.all([
          supabase.from('cards').select('*').eq('id', t.offered_card_id).single(),
          supabase.from('cards').select('*').eq('id', t.wanted_card_id).single(),
          supabase.from('user_profiles').select('username').eq('id', t.from_user_id).single(),
        ]);
        return { ...t, offered_card: offeredRes.data, wanted_card: wantedRes.data, from_username: fromRes.data?.username };
      }));
      setIncomingTrades(enriched);
    }

    // 5. My outgoing trades
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
        return { ...t, offered_card: offeredRes.data, wanted_card: wantedRes.data, to_username: toRes.data?.username };
      }));
      setMyOutgoingTrades(enriched);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRemoveListing = async (listingId: string) => {
    await supabase.from('trade_listings').delete().eq('id', listingId);
    showToast('Card removed from trade listings.');
    loadData();
  };

  const handlePropose = async () => {
    if (!proposingFor || !selectedMyCard || !user) return;
    const { error } = await supabase.from('trades').insert({
      from_user_id: user.id,
      to_user_id: proposingFor.user_id,
      offered_card_id: selectedMyCard.card.id,
      offered_user_card_id: selectedMyCard.user_card_id,
      wanted_card_id: proposingFor.card.id,
      wanted_user_card_id: proposingFor.user_card_id,
      trade_status: 'pending',
    });
    if (error) { showToast('Error sending trade: ' + error.message); return; }
    showToast(`Trade proposal sent to ${proposingFor.owner_username}!`);
    setProposingFor(null);
    setSelectedMyCard(null);
    loadData();
  };

  const handleAccept = async (trade: Trade) => {
    const { error } = await supabase
      .from('trades')
      .update({ trade_status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', trade.id);
    if (error) { showToast('Error accepting trade'); return; }

    await Promise.all([
      supabase.from('user_cards').update({ user_id: trade.to_user_id }).eq('id', trade.offered_user_card_id),
      supabase.from('user_cards').update({ user_id: trade.from_user_id }).eq('id', trade.wanted_user_card_id),
    ]);

    await Promise.all([
      supabase.from('trade_listings').delete().eq('user_card_id', trade.offered_user_card_id),
      supabase.from('trade_listings').delete().eq('user_card_id', trade.wanted_user_card_id),
    ]);

    await supabase
      .from('trades')
      .update({ trade_status: 'cancelled', updated_at: new Date().toISOString() })
      .neq('id', trade.id)
      .eq('trade_status', 'pending')
      .or(`wanted_user_card_id.eq.${trade.wanted_user_card_id},offered_user_card_id.eq.${trade.offered_user_card_id}`);

    showToast('Trade accepted! Cards have been swapped. ✓');
    loadData();
  };

  const handleDecline = async (id: string) => {
    await supabase.from('trades').update({ trade_status: 'declined', updated_at: new Date().toISOString() }).eq('id', id);
    showToast('Trade declined.');
    loadData();
  };

  const handleCancel = async (id: string) => {
    await supabase.from('trades').update({ trade_status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', id);
    showToast('Trade cancelled.');
    loadData();
  };

  const pendingCount = incomingTrades.filter(t => t.trade_status === 'pending').length;

  const tabs: { key: Tab; label: string; iconName: Parameters<typeof Icon>[0]['name'] }[] = [
    { key: 'browse',      label: 'Browse Trades',                                          iconName: 'MagnifyingGlassIcon' },
    { key: 'my-listings', label: `My Listings (${myListings.length})`,                     iconName: 'TagIcon'             },
    { key: 'incoming',    label: `Incoming${pendingCount > 0 ? ` (${pendingCount})` : ''}`, iconName: 'InboxIcon'           },
    { key: 'my-offers',   label: 'My Offers',                                              iconName: 'PaperAirplaneIcon'   },
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
              List your cards for trade, browse what others are offering, and propose swaps.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white rounded-2xl border border-adventure-border p-1.5 shadow-card overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-sans font-semibold transition-all whitespace-nowrap ${tab === t.key ? 'text-white shadow-sm' : 'text-earth-500 hover:text-primary-700 hover:bg-primary-50'}`}
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
            {/* ── BROWSE LISTINGS ── */}
            {tab === 'browse' && (
              <div className="space-y-4">
                {browseListings.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-adventure-border">
                    <Icon name="TagIcon" size={48} className="text-earth-200 mx-auto mb-3" />
                    <p className="font-display text-xl text-primary-700 mb-2">No cards listed for trade yet</p>
                    <p className="text-earth-400 font-sans text-sm mt-1 max-w-md mx-auto">
                      When other Voyagers list cards for trade, they'll appear here. You can list your own cards from your Card Album!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {browseListings.map(listing => (
                      <div key={listing.id} className="bg-white rounded-2xl border border-adventure-border shadow-card p-4 flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-3 w-full">
                          <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700 font-sans flex-shrink-0">
                            {listing.owner_username.slice(0, 2).toUpperCase()}
                          </div>
                          <p className="text-xs font-sans font-semibold text-primary-800 truncate">{listing.owner_username}</p>
                        </div>
                        <TradeCardDisplay card={listing.card} />
                        <button
                          onClick={() => setProposingFor(listing)}
                          className="w-full mt-3 text-white font-sans font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95"
                          style={{ backgroundColor: '#ff751f' }}>
                          <Icon name="ArrowsRightLeftIcon" size={12} />
                          Offer a Trade
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── MY LISTINGS ── */}
            {tab === 'my-listings' && (
              <div className="space-y-4">
                {myListings.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-adventure-border">
                    <Icon name="TagIcon" size={48} className="text-earth-200 mx-auto mb-3" />
                    <p className="font-display text-xl text-primary-700 mb-2">No cards listed</p>
                    <p className="text-earth-400 font-sans text-sm mt-1 max-w-md mx-auto">
                      To list a card for trade, open it in your Card Album and tap "List for Trade".
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {myListings.map(listing => (
                      <div key={listing.id} className="bg-white rounded-2xl border border-adventure-border shadow-card p-4 flex flex-col items-center">
                        <div className="flex items-center justify-between mb-3 w-full">
                          <span className="text-xs font-sans text-earth-400">
                            {new Date(listing.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                          <span className="text-xs font-sans font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                            Active
                          </span>
                        </div>
                        <TradeCardDisplay card={listing.card} />
                        <button
                          onClick={() => handleRemoveListing(listing.id)}
                          className="w-full mt-3 bg-red-50 hover:bg-red-100 text-red-600 font-sans font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors">
                          <Icon name="XMarkIcon" size={12} />
                          Remove Listing
                        </button>
                      </div>
                    ))}
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
                    <p className="text-earth-400 font-sans text-sm mt-1">When other Voyagers want to trade for your listed cards, their offers appear here</p>
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
                          <div className="flex flex-col items-center">
                            <p className="text-xs font-sans text-earth-400 mb-2">They Offer</p>
                            {trade.offered_card && <TradeCardDisplay card={trade.offered_card} size="small" />}
                          </div>
                          <div className="w-10 h-10 rounded-full bg-primary-50 border border-primary-200 flex items-center justify-center flex-shrink-0">
                            <Icon name="ArrowsRightLeftIcon" size={18} className="text-primary-500" />
                          </div>
                          <div className="flex flex-col items-center">
                            <p className="text-xs font-sans text-earth-400 mb-2">For Your</p>
                            {trade.wanted_card && <TradeCardDisplay card={trade.wanted_card} size="small" />}
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
                    <p className="text-earth-400 font-sans text-sm mt-1">Browse listed cards and propose trades to see them here</p>
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
                          <div className="flex flex-col items-center">
                            <p className="text-xs font-sans text-earth-400 mb-2">Your card</p>
                            {trade.offered_card && <TradeCardDisplay card={trade.offered_card} size="small" />}
                          </div>
                          <Icon name="ArrowsRightLeftIcon" size={18} className="text-primary-400 flex-shrink-0" />
                          <div className="flex flex-col items-center">
                            <p className="text-xs font-sans text-earth-400 mb-2">Their card</p>
                            {trade.wanted_card && <TradeCardDisplay card={trade.wanted_card} size="small" />}
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

              {/* Card they want */}
              <div className="bg-primary-50 border border-primary-200 rounded-2xl p-4 mb-4">
                <p className="text-xs font-sans font-semibold text-primary-600 mb-3 uppercase tracking-wide">You want</p>
                <div className="flex items-center gap-4">
                  <TradeCardDisplay card={proposingFor.card} size="small" />
                  <div>
                    <p className="font-display text-sm text-primary-800">{proposingFor.card.name}</p>
                    <p className="text-xs font-sans text-earth-400 mt-0.5">from {proposingFor.owner_username}</p>
                    <span className="inline-block text-xs font-sans font-bold mt-1 px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: rarityColors[proposingFor.card.rarity]?.bg, color: rarityColors[proposingFor.card.rarity]?.text }}>
                      {proposingFor.card.rarity}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm font-sans text-earth-500 mb-3">Select one of your cards to offer in return:</p>

              {myCards.length === 0 ? (
                <p className="text-sm font-sans text-earth-400 text-center py-6">You don't have any cards to offer yet. Open some packs first!</p>
              ) : (
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {myCards.map(mc => {
                    const isFair = mc.card.rarity === proposingFor.card.rarity;
                    const isSelected = selectedMyCard?.user_card_id === mc.user_card_id;
                    return (
                      <button key={mc.user_card_id} onClick={() => setSelectedMyCard(mc)}
                        className={`rounded-2xl p-2 transition-all flex flex-col items-center ${
                          isSelected
                            ? 'bg-orange-50 ring-2 ring-orange-400'
                            : isFair
                              ? 'bg-green-50 ring-1 ring-green-300 hover:ring-2'
                              : 'bg-white hover:bg-primary-50 ring-1 ring-adventure-border'
                        }`}>
                        <TradeCardDisplay card={mc.card} size="small" />
                        <div className="flex items-center gap-1 mt-1">
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
