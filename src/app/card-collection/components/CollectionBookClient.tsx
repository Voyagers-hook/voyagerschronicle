'use client';

import React, { useState, useEffect } from 'react';
import { rarityConfig, CardRarity, FishingCard } from '@/app/card-collection/data/cardData';
import CardSlot from './CardSlot';
import CardDetailModal from './CardDetailModal';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const rarities: CardRarity[] = ['Widespread', 'Elusive', 'Specimen', 'Legendary'];

export default function CollectionBookClient() {
  const { user } = useAuth();
  const supabase = createClient();
  const [selectedCard, setSelectedCard] = useState<FishingCard | null>(null);
  const [filterRarity, setFilterRarity] = useState<CardRarity | 'All'>('All');
  const [showCollectedOnly, setShowCollectedOnly] = useState(false);
  const [cards, setCards] = useState<FishingCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCards = async () => {
      setLoading(true);

      // Load all cards from DB
      const { data: allCards, error } = await supabase
        .from('cards')
        .select('*')
        .order('card_number', { ascending: true });

      if (error || !allCards) { setLoading(false); return; }

      // Load this user's collected card IDs
      let collectedMap = new Map<string, string>(); // card_id -> collected_at
      if (user) {
        const { data: userCards } = await supabase
          .from('user_cards')
        .select('card_id, collected_at, cards(card_number, hint, habitat)')
          .eq('user_id', user.id)
          .eq('opened', true);

        if (userCards) {
          userCards.forEach((uc: { card_id: string; collected_at: string }) => {
            // Keep the earliest collected date if duplicates
            if (!collectedMap.has(uc.card_id)) {
              collectedMap.set(uc.card_id, uc.collected_at);
            }
          });
        }
      }

      const mapped: FishingCard[] = allCards.map((c: any) => ({
        id: c.id,
        cardNumber: c.card_number,
        totalCards: c.total_cards ?? allCards.length,
        name: c.name,
        species: c.species,
        rarity: c.rarity as CardRarity,
        image: c.image_url ?? undefined,
        power: c.power,
        stealth: c.stealth,
        stamina: c.energy, // DB column is energy, interface uses stamina
        beauty: c.beauty,
        habitat: c.habitat ?? '',
        description: c.description ?? '',
        foil: c.foil ?? false,
        gradient: c.gradient ?? 'from-blue-400 via-cyan-300 to-teal-400',
        borderColor: c.border_color ?? '#3B82F6',
        collected: collectedMap.has(c.id),
        collectedDate: collectedMap.has(c.id)
          ? new Date(collectedMap.get(c.id)!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
          : undefined,
      }));

      setCards(mapped);
      setLoading(false);
    };

    loadCards();
  }, [user]);

  const collected = cards.filter(c => c.collected).length;
  const total = cards.length;
  const progress = total > 0 ? Math.round((collected / total) * 100) : 0;

  const filtered = cards.filter(c => {
    if (filterRarity !== 'All' && c.rarity !== filterRarity) return false;
    if (showCollectedOnly && !c.collected) return false;
    return true;
  });

  return (
    <>
      {/* Book cover header */}
      <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8 mb-6"
        style={{ background: 'linear-gradient(135deg, #091408 0%, #1A3D28 50%, #2D6A4F 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")` }} />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #ff751f, transparent)', transform: 'translate(30%, -30%)' }} />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <Icon name="BookOpenIcon" size={26} className="text-white" />
              </div>
              <div>
                <h1 className="font-display text-3xl lg:text-4xl text-white">The Voyager&apos;s</h1>
                <h1 className="font-display text-3xl lg:text-4xl" style={{ color: '#ff751f' }}>Card Album</h1>
              </div>
            </div>
            <p className="text-primary-200 font-sans text-sm max-w-md">
              Your personal collection of rare and legendary fishing cards. Collect them all to become a true Voyager!
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-3">
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 min-w-[180px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-primary-200 text-xs font-sans font-semibold uppercase tracking-wide">Collection</span>
                <span className="font-display text-lg" style={{ color: '#ff751f' }}>{collected}/{total}</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #ff751f, #E9A23B)' }} />
              </div>
              <p className="text-primary-300 text-xs font-sans mt-1.5 text-right">{progress}% complete</p>
            </div>

            <Link href="/card-opening"
              className="inline-flex items-center gap-2 text-white font-sans font-semibold text-sm px-5 py-3 rounded-xl shadow-card transition-all duration-150 active:scale-95"
              style={{ backgroundColor: '#ff751f' }}>
              <Icon name="GiftIcon" size={16} />
              Open a Pack
            </Link>
          </div>
        </div>

        {/* Rarity breakdown */}
        <div className="relative z-10 mt-5 flex flex-wrap gap-2">
          {rarities.map(r => {
            const count = cards.filter(c => c.rarity === r && c.collected).length;
            const rarityTotal = cards.filter(c => c.rarity === r).length;
            const cfg = rarityConfig[r];
            return (
              <div key={r} className="bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 flex items-center gap-2">
                <span className={`text-xs font-sans font-bold ${cfg.color}`}>{r}</span>
                <span className="text-white/60 text-xs font-sans">{count}/{rarityTotal}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 bg-white rounded-xl border border-adventure-border p-1 shadow-card">
          <button onClick={() => setFilterRarity('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-colors ${filterRarity === 'All' ? 'text-white' : 'text-earth-500 hover:text-primary-700'}`}
            style={filterRarity === 'All' ? { backgroundColor: '#ff751f' } : {}}>
            All
          </button>
          {rarities.map(r => (
            <button key={r} onClick={() => setFilterRarity(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-colors ${filterRarity === r ? 'text-white' : 'text-earth-500 hover:text-primary-700'}`}
              style={filterRarity === r ? { backgroundColor: '#ff751f' } : {}}>
              {r}
            </button>
          ))}
        </div>

        <button onClick={() => setShowCollectedOnly(!showCollectedOnly)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-sans font-semibold border transition-colors ${showCollectedOnly ? 'text-white border-transparent' : 'bg-white border-adventure-border text-earth-500 hover:text-primary-700'}`}
          style={showCollectedOnly ? { backgroundColor: '#ff751f', borderColor: '#ff751f' } : {}}>
          <Icon name="CheckCircleIcon" size={14} />
          Collected Only
        </button>

        <span className="text-xs font-sans text-earth-400 ml-auto">
          {loading ? 'Loading...' : `Showing ${filtered.length} of ${total} cards`}
        </span>
      </div>

      {/* Card grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-2xl bg-earth-100 animate-pulse" />
          ))}
        </div>
      ) : total === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Icon name="BookOpenIcon" size={48} className="text-earth-200 mb-4" />
          <p className="font-display text-2xl text-earth-400 mb-2">No cards yet</p>
          <p className="text-earth-300 font-sans text-sm">Cards will appear here once the shop adds them.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Icon name="FunnelIcon" size={48} className="text-earth-200 mb-4" />
          <p className="font-display text-2xl text-earth-400 mb-2">No cards match</p>
          <p className="text-earth-300 font-sans text-sm">Try changing the filters above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map(card => (
            <CardSlot key={card.id} card={card} onClick={() => setSelectedCard(card)} />
          ))}
        </div>
      )}

      {selectedCard && (
        <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </>
  );
}
