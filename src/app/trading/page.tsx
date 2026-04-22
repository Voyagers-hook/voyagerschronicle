'use client';

import React, { useState } from 'react';
import { tradeOffers, membersCards, myCards, TradeOffer, MemberCard, TradeCard, TradeRarity } from '@/app/trading/data/tradeData';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';

type Tab = 'browse' | 'incoming' | 'my-offers';

const rarityColors: Record<TradeRarity, { bg: string; text: string; border: string }> = {
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
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-sans font-semibold text-earth-600 w-6 text-right tabular-nums">{value}</span>
    </div>
  );
}

function MiniCard({ card }: { card: TradeCard | MemberCard & { cardName: string; cardRarity: TradeRarity; cardPower: number; cardStealth: number; cardStamina: number; cardBeauty: number; cardGradient: string; cardBorderColor: string } }) {
  const name = 'name' in card ? card.name : card.cardName;
  const rarity = 'rarity' in card ? card.rarity : card.cardRarity;
  const power = 'power' in card ? card.power : card.cardPower;
  const stealth = 'stealth' in card ? card.stealth : card.cardStealth;
  const stamina = 'stamina' in card ? card.stamina : card.cardStamina;
  const beauty = 'beauty' in card ? card.beauty : card.cardBeauty;
  const gradient = 'gradient' in card ? card.gradient : card.cardGradient;
  const borderColor = 'borderColor' in card ? card.borderColor : card.cardBorderColor;
  const rc = rarityColors[rarity];

  return (
    <div className="w-28 rounded-2xl overflow-hidden shadow-card flex-shrink-0" style={{ border: `2px solid ${borderColor}` }}>
      <div className={`bg-gradient-to-br ${gradient} h-20 flex flex-col items-center justify-center p-2`}>
        <Icon name="SparklesIcon" size={20} className="text-white/80 mb-1" />
        <p className="text-white font-display text-xs text-center leading-tight">{name}</p>
      </div>
      <div className="bg-white px-2 py-2 space-y-1">
        <span className="block text-center text-xs font-sans font-bold rounded-full px-2 py-0.5 mb-1" style={{ backgroundColor: rc.bg, color: rc.text }}>{rarity}</span>
        <StatBar label="PWR" value={power} color="#ef4444" />
        <StatBar label="STL" value={stealth} color="#2D6A4F" />
        <StatBar label="STA" value={stamina} color="#3B82F6" />
        <StatBar label="BEA" value={beauty} color="#ec4899" />
      </div>
    </div>
  );
}

function TradeOfferCard({ offer, onAccept, onDecline }: { offer: TradeOffer; onAccept: (id: string) => void; onDecline: (id: string) => void }) {
  const isFairTrade = offer.offeredCard.rarity === offer.wantedCard.rarity;
  return (
    <div className="bg-white rounded-2xl border border-adventure-border shadow-card p-5 card-lift">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700 font-sans flex-shrink-0">
          {offer.fromInitials}
        </div>
        <div>
          <p className="font-sans font-semibold text-primary-800 text-sm">{offer.fromMember}</p>
          <p className="text-xs font-sans text-earth-400">{offer.fromLevel} · {offer.postedDate}</p>
        </div>
        <div className="ml-auto flex flex-col items-end gap-1">
          <span className={`text-xs font-sans font-bold px-2.5 py-1 rounded-full ${
            offer.status === 'pending' ? 'bg-amber-100 text-amber-700' :
            offer.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
          </span>
          {!isFairTrade && offer.status === 'pending' && (
            <span className="text-xs font-sans text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Uneven rarity</span>
          )}
          {isFairTrade && offer.status === 'pending' && (
            <span className="text-xs font-sans text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">Fair trade</span>
          )}
        </div>
      </div>

      {offer.message && (
        <p className="text-xs font-sans text-earth-500 italic bg-adventure-bg rounded-xl px-3 py-2 mb-4 border border-adventure-border">
          &ldquo;{offer.message}&rdquo;
        </p>
      )}

      <div className="flex items-start justify-center gap-4 mb-4">
        <div className="flex flex-col items-center gap-1">
          <p className="text-xs font-sans text-earth-400 font-semibold uppercase tracking-wide mb-1">They Offer</p>
          <MiniCard card={offer.offeredCard} />
        </div>
        <div className="flex flex-col items-center justify-center pt-10">
          <div className="w-10 h-10 rounded-full bg-primary-50 border border-primary-200 flex items-center justify-center">
            <Icon name="ArrowsRightLeftIcon" size={18} className="text-primary-500" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-xs font-sans text-earth-400 font-semibold uppercase tracking-wide mb-1">They Want</p>
          <MiniCard card={offer.wantedCard} />
        </div>
      </div>

      {offer.status === 'pending' && (
        <div className="flex gap-2">
          <button
            onClick={() => onAccept(offer.id)}
            className="flex-1 text-white font-sans font-semibold text-sm py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            style={{ backgroundColor: '#ff751f' }}
          >
            <Icon name="CheckIcon" size={14} />
            Accept Trade
          </button>
          <button
            onClick={() => onDecline(offer.id)}
            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-sans font-semibold text-sm py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <Icon name="XMarkIcon" size={14} />
            Decline
          </button>
        </div>
      )}
    </div>
  );
}

export default function TradingPage() {
  const [tab, setTab] = useState<Tab>('browse');
  const [offers, setOffers] = useState(tradeOffers);
  const [proposingTo, setProposingTo] = useState<MemberCard | null>(null);
  const [selectedMyCard, setSelectedMyCard] = useState<MemberCard | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [myOffers, setMyOffers] = useState<{ id: string; toMember: string; myCard: MemberCard; theirCard: MemberCard; status: 'pending' | 'accepted' | 'declined' }[]>([]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleAccept = (id: string) => {
    setOffers(prev => prev.map(o => o.id === id ? { ...o, status: 'accepted' as const } : o));
    showToast('Trade accepted! Cards have been swapped.');
  };

  const handleDecline = (id: string) => {
    setOffers(prev => prev.map(o => o.id === id ? { ...o, status: 'declined' as const } : o));
    showToast('Trade declined.');
  };

  const handlePropose = () => {
    if (!proposingTo || !selectedMyCard) return;
    const newOffer = {
      id: `my-offer-${Date.now()}`,
      toMember: proposingTo.memberName,
      myCard: selectedMyCard,
      theirCard: proposingTo,
      status: 'pending' as const,
    };
    setMyOffers(prev => [...prev, newOffer]);
    setProposingTo(null);
    setSelectedMyCard(null);
    showToast(`Trade proposal sent to ${proposingTo.memberName}!`);
  };

  const pendingCount = offers.filter(o => o.status === 'pending').length;

  // Filter same-rarity cards for fair trade suggestions
  const fairTradeCards = proposingTo
    ? myCards.filter(c => c.cardRarity === proposingTo.cardRarity)
    : myCards;

  const tabs: { key: Tab; label: string; iconName: Parameters<typeof Icon>[0]['name'] }[] = [
    { key: 'browse', label: 'Browse Cards', iconName: 'MagnifyingGlassIcon' },
    { key: 'incoming', label: `Incoming${pendingCount > 0 ? ` (${pendingCount})` : ''}`, iconName: 'InboxIcon' },
    { key: 'my-offers', label: 'My Offers', iconName: 'PaperAirplaneIcon' },
  ];

  return (
    <AppLayout currentPath="/trading">
      <div className="fade-in space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8" style={{ background: 'linear-gradient(135deg, #091408 0%, #1A3D28 50%, #2D6A4F 100%)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #ff751f, transparent)', transform: 'translate(30%, -30%)' }} />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Icon name="ArrowsRightLeftIcon" size={22} className="text-white" />
              </div>
              <h1 className="font-display text-3xl lg:text-4xl text-white">Trading Post</h1>
            </div>
            <p className="text-primary-200 font-sans text-sm max-w-lg">
              Browse cards other Voyagers are offering, or propose your own trades. Same-rarity swaps are highlighted as fair trades.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white rounded-2xl border border-adventure-border p-1.5 shadow-card w-fit">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-sans font-semibold transition-all ${tab === t.key ? 'text-white shadow-sm' : 'text-earth-500 hover:text-primary-700 hover:bg-primary-50'}`}
              style={tab === t.key ? { backgroundColor: '#ff751f' } : {}}
            >
              <Icon name={t.iconName} size={15} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Browse tab */}
        {tab === 'browse' && (
          <div className="space-y-4">
            <p className="text-sm font-sans text-earth-400">Cards available for trade from other Voyagers:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {membersCards.filter(c => c.isForTrade).map((mc, idx) => {
                const rc = rarityColors[mc.cardRarity];
                return (
                  <div key={`${mc.memberId}-${mc.cardId}-${idx}`} className="bg-white rounded-2xl border border-adventure-border shadow-card p-4 card-lift">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700 font-sans flex-shrink-0">
                        {mc.memberInitials}
                      </div>
                      <div>
                        <p className="text-xs font-sans font-semibold text-primary-800">{mc.memberName}</p>
                        <p className="text-xs font-sans text-earth-400">{mc.memberLevel}</p>
                      </div>
                    </div>

                    <div className="flex justify-center mb-3">
                      <div className="w-28 rounded-2xl overflow-hidden shadow-card" style={{ border: `2px solid ${mc.cardBorderColor}` }}>
                        <div className={`bg-gradient-to-br ${mc.cardGradient} h-20 flex flex-col items-center justify-center p-2`}>
                          <Icon name="SparklesIcon" size={20} className="text-white/80 mb-1" />
                          <p className="text-white font-display text-xs text-center leading-tight">{mc.cardName}</p>
                        </div>
                        <div className="bg-white px-2 py-2 space-y-1">
                          <span className="block text-center text-xs font-sans font-bold rounded-full px-2 py-0.5 mb-1" style={{ backgroundColor: rc.bg, color: rc.text }}>{mc.cardRarity}</span>
                          <StatBar label="PWR" value={mc.cardPower} color="#ef4444" />
                          <StatBar label="STL" value={mc.cardStealth} color="#2D6A4F" />
                          <StatBar label="STA" value={mc.cardStamina} color="#3B82F6" />
                          <StatBar label="BEA" value={mc.cardBeauty} color="#ec4899" />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setProposingTo(mc)}
                      className="w-full text-white font-sans font-semibold text-xs py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                      style={{ backgroundColor: '#ff751f' }}
                    >
                      <Icon name="ArrowsRightLeftIcon" size={12} />
                      Propose Trade
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Incoming trades tab */}
        {tab === 'incoming' && (
          <div className="space-y-4">
            {offers.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-adventure-border">
                <Icon name="InboxIcon" size={48} className="text-earth-200 mx-auto mb-3" />
                <p className="font-display text-xl text-primary-700">No trade offers yet</p>
                <p className="text-earth-400 font-sans text-sm mt-1">When other members propose trades, they&apos;ll appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {offers.map(offer => (
                  <TradeOfferCard key={offer.id} offer={offer} onAccept={handleAccept} onDecline={handleDecline} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* My offers tab */}
        {tab === 'my-offers' && (
          <div className="space-y-4">
            {myOffers.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-adventure-border">
                <Icon name="PaperAirplaneIcon" size={48} className="text-earth-200 mx-auto mb-3" />
                <p className="font-display text-xl text-primary-700">No outgoing offers</p>
                <p className="text-earth-400 font-sans text-sm mt-1">Browse cards and propose trades to see them here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myOffers.map(offer => (
                  <div key={offer.id} className="bg-white rounded-2xl border border-adventure-border shadow-card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-sans font-semibold text-primary-800 text-sm">Offer to {offer.toMember}</p>
                      <span className="text-xs font-sans font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">Pending</span>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-center">
                        <p className="text-xs font-sans text-earth-400 mb-1">Your card</p>
                        <div className="w-20 h-14 rounded-xl overflow-hidden" style={{ border: `2px solid ${offer.myCard.cardBorderColor}` }}>
                          <div className={`bg-gradient-to-br ${offer.myCard.cardGradient} h-full flex items-center justify-center`}>
                            <p className="text-white font-display text-xs text-center px-1 leading-tight">{offer.myCard.cardName}</p>
                          </div>
                        </div>
                      </div>
                      <Icon name="ArrowsRightLeftIcon" size={18} className="text-primary-400" />
                      <div className="text-center">
                        <p className="text-xs font-sans text-earth-400 mb-1">Their card</p>
                        <div className="w-20 h-14 rounded-xl overflow-hidden" style={{ border: `2px solid ${offer.theirCard.cardBorderColor}` }}>
                          <div className={`bg-gradient-to-br ${offer.theirCard.cardGradient} h-full flex items-center justify-center`}>
                            <p className="text-white font-display text-xs text-center px-1 leading-tight">{offer.theirCard.cardName}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Propose trade modal */}
        {proposingTo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm fade-in" onClick={() => { setProposingTo(null); setSelectedMyCard(null); }}>
            <div className="bg-white rounded-3xl shadow-panel p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl text-primary-800">Propose a Trade</h3>
                <button onClick={() => { setProposingTo(null); setSelectedMyCard(null); }} className="p-2 rounded-xl hover:bg-primary-50 text-earth-400">
                  <Icon name="XMarkIcon" size={18} />
                </button>
              </div>

              <p className="text-sm font-sans text-earth-500 mb-4">
                You want <strong className="text-primary-800">{proposingTo.cardName}</strong> ({proposingTo.cardRarity}) from <strong className="text-primary-800">{proposingTo.memberName}</strong>.
                Select one of your cards to offer in return.
              </p>

              {fairTradeCards.length > 0 && (
                <div className="mb-3 p-3 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-xs font-sans font-semibold text-green-700">
                    Same-rarity cards highlighted below for a fair trade
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-5">
                {myCards.map(card => {
                  const isFair = card.cardRarity === proposingTo.cardRarity;
                  const isSelected = selectedMyCard?.cardId === card.cardId;
                  return (
                    <button
                      key={card.cardId}
                      onClick={() => setSelectedMyCard(card)}
                      className={`rounded-xl overflow-hidden border-2 transition-all text-left ${isSelected ? 'ring-2 ring-offset-1' : ''} ${isFair ? 'border-green-400' : 'border-adventure-border'}`}
                      style={isSelected ? { ringColor: '#ff751f', borderColor: '#ff751f' } : {}}
                    >
                      <div className={`bg-gradient-to-br ${card.cardGradient} h-14 flex items-center justify-center`}>
                        <p className="text-white font-display text-xs text-center px-2 leading-tight">{card.cardName}</p>
                      </div>
                      <div className="bg-white p-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-sans font-bold" style={{ color: rarityColors[card.cardRarity].text }}>{card.cardRarity}</span>
                          {isFair && <span className="text-xs text-green-600 font-sans font-semibold">Fair</span>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setProposingTo(null); setSelectedMyCard(null); }}
                  className="flex-1 bg-earth-50 hover:bg-earth-100 text-earth-600 font-sans font-semibold text-sm py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePropose}
                  disabled={!selectedMyCard}
                  className="flex-1 text-white font-sans font-semibold text-sm py-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#ff751f' }}
                >
                  Send Proposal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 text-white text-sm font-sans font-semibold px-5 py-3 rounded-2xl shadow-panel fade-in" style={{ backgroundColor: '#ff751f' }}>
            {toastMsg}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
