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
const CARDS_PER_PAGE = 8;

export default function CollectionBookClient() {
  const { user } = useAuth();
  const supabase = createClient();
  const [selectedCard, setSelectedCard] = useState<FishingCard | null>(null);
  const [filterRarity, setFilterRarity] = useState<CardRarity | 'All'>('All');
  const [showCollectedOnly, setShowCollectedOnly] = useState(false);
  const [cards, setCards] = useState<FishingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [flipDir, setFlipDir] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    const loadCards = async () => {
      setLoading(true);
      const { data: allCards, error } = await supabase
        .from('cards')
        .select('*')
        .order('card_number', { ascending: true });

      if (error || !allCards) { setLoading(false); return; }

      let collectedMap = new Map<string, string>();
      if (user) {
        const { data: userCards } = await supabase
          .from('user_cards')
          .select('card_id, collected_at')
          .eq('user_id', user.id)
          .eq('opened', true);

        if (userCards) {
          userCards.forEach((uc: { card_id: string; collected_at: string }) => {
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
        power: c.power ?? 0,
        stealth: c.stealth ?? 0,
        stamina: c.energy ?? 0,
        energy: c.energy ?? 0,
        beauty: c.beauty ?? 0,
        hp: c.hp ?? undefined,
        cardLevel: c.card_level ?? undefined,
        habitat: c.habitat ?? '',
        description: c.description ?? '',
        hint: c.hint ?? undefined,
        fact: c.fact ?? undefined,
        foil: c.foil ?? false,
        gradient: c.gradient ?? 'from-blue-400 via-cyan-300 to-teal-400',
        borderColor: c.border_color ?? '#3B82F6',
        dropRate: c.drop_rate ?? undefined,
        pointsValue: c.points_value ?? undefined,
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

  useEffect(() => { setCurrentPage(0); }, [filterRarity, showCollectedOnly]);

  const filtered = cards.filter(c => {
    if (filterRarity !== 'All' && c.rarity !== filterRarity) return false;
    if (showCollectedOnly && !c.collected) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / CARDS_PER_PAGE);
  const pageCards = filtered.slice(currentPage * CARDS_PER_PAGE, (currentPage + 1) * CARDS_PER_PAGE);
  const slots = [...pageCards, ...Array(Math.max(0, CARDS_PER_PAGE - pageCards.length)).fill(null)];

  const collected = cards.filter(c => c.collected).length;
  const total = cards.length;
  const progress = total > 0 ? Math.round((collected / total) * 100) : 0;

  const goToPage = (dir: 'prev' | 'next') => {
    if (dir === 'prev' && currentPage > 0) {
      setFlipDir('right');
      setTimeout(() => { setCurrentPage(p => p - 1); setFlipDir(null); }, 200);
    }
    if (dir === 'next' && currentPage < totalPages - 1) {
      setFlipDir('left');
      setTimeout(() => { setCurrentPage(p => p + 1); setFlipDir(null); }, 200);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8 mb-6"
        style={{ background: 'linear-gradient(135deg, #091408 0%, #1A3D28 50%, #2D6A4F 100%)' }}>
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
            <p className="text-primary-200 font-sans text-sm max-w-md">Your personal collection of rare and legendary fishing cards.</p>
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
              className="inline-flex items-center gap-2 text-white font-sans font-semibold text-sm px-5 py-3 rounded-xl shadow-card transition-all active:scale-95"
              style={{ backgroundColor: '#ff751f' }}>
              <Icon name="GiftIcon" size={16} />
              Open a Pack
            </Link>
          </div>
        </div>
        <div className="relative z-10 mt-5 flex flex-wrap gap-2">
          {rarities.map(r => {
            const count = cards.filter(c => c.rarity === r && c.collected).length;
            const rarityTotal = cards.filter(c => c.rarity === r).length;
            return (
              <div key={r} className="bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 flex items-center gap-2">
                <span className={`text-xs font-sans font-bold ${rarityConfig[r].color}`}>{r}</span>
                <span className="text-white/60 text-xs font-sans">{count}/{rarityTotal}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-1 bg-white rounded-xl border border-adventure-border p-1 shadow-card">
          <button onClick={() => setFilterRarity('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-colors ${filterRarity === 'All' ? 'text-white' : 'text-earth-500 hover:text-primary-700'}`}
            style={filterRarity === 'All' ? { backgroundColor: '#ff751f' } : {}}>All</button>
          {rarities.map(r => (
            <button key={r} onClick={() => setFilterRarity(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-colors ${filterRarity === r ? 'text-white' : 'text-earth-500 hover:text-primary-700'}`}
              style={filterRarity === r ? { backgroundColor: '#ff751f' } : {}}>{r}</button>
          ))}
        </div>
        <button onClick={() => setShowCollectedOnly(!showCollectedOnly)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-sans font-semibold border transition-colors ${showCollectedOnly ? 'text-white border-transparent' : 'bg-white border-adventure-border text-earth-500'}`}
          style={showCollectedOnly ? { backgroundColor: '#ff751f' } : {}}>
          <Icon name="CheckCircleIcon" size={14} />
          Collected Only
        </button>
        <span className="text-xs font-sans text-earth-400 ml-auto">
          {loading ? 'Loading...' : `${filtered.length} cards · Page ${currentPage + 1} of ${Math.max(1, totalPages)}`}
        </span>
      </div>

      {/* Book */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #f5efe6 0%, #ede3d4 50%, #e8dcc8 100%)', border: '2px solid #c4a882', boxShadow: '0 8px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.6)' }}>
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-6 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.08), rgba(0,0,0,0.15), rgba(0,0,0,0.08))' }} />

        {loading ? (
          <div className="flex items-center justify-center h-80">
            <Icon name="ArrowPathIcon" size={40} className="animate-spin text-earth-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 gap-3">
            <Icon name="BookOpenIcon" size={48} className="text-earth-300" />
            <p className="font-display text-2xl text-earth-400">No cards to show</p>
          </div>
        ) : (
          <div className="p-6 lg:p-10 transition-opacity duration-200" style={{ opacity: flipDir ? 0 : 1 }}>
            {/* 2 rows of 4 — each card is 750/1000 ratio */}
            <div className="grid grid-cols-4 gap-4 lg:gap-6">
              {slots.map((card, idx) => (
                card ? (
                  <CardSlot key={card.id} card={card} onClick={() => setSelectedCard(card)} />
                ) : (
                  <div key={`empty-${idx}`}
                    className="rounded-2xl border-2 border-dashed opacity-30"
                    style={{ aspectRatio: '750 / 1000', borderColor: '#c4a882' }} />
                )
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Page navigation */}
      <div className="flex items-center justify-between mt-4 px-2">
        <button onClick={() => goToPage('prev')} disabled={currentPage === 0}
          className="flex items-center gap-2 font-sans font-semibold text-sm px-5 py-2.5 rounded-xl border transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary-50"
          style={{ borderColor: '#c4a882', color: '#8B6914', backgroundColor: 'rgba(245,239,230,0.8)' }}>
          <Icon name="ChevronLeftIcon" size={16} />
          Previous Page
        </button>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
            const isActive = i === currentPage || (totalPages <= 7 && i === currentPage);
            return (
              <button key={i}
                onClick={() => { setFlipDir(i > currentPage ? 'left' : 'right'); setTimeout(() => { setCurrentPage(i); setFlipDir(null); }, 200); }}
                className="rounded-full transition-all"
                style={{ width: isActive ? 20 : 8, height: 8, backgroundColor: isActive ? '#ff751f' : '#c4a882' }} />
            );
          })}
        </div>
        <button onClick={() => goToPage('next')} disabled={currentPage >= totalPages - 1}
          className="flex items-center gap-2 font-sans font-semibold text-sm px-5 py-2.5 rounded-xl border transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary-50"
          style={{ borderColor: '#c4a882', color: '#8B6914', backgroundColor: 'rgba(245,239,230,0.8)' }}>
          Next Page
          <Icon name="ChevronRightIcon" size={16} />
        </button>
      </div>
      <p className="text-center text-xs font-sans mt-2" style={{ color: '#a08040', fontStyle: 'italic' }}>
        Page {currentPage + 1} of {Math.max(1, totalPages)}
      </p>

      {selectedCard && (
        <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </>
  );
}
