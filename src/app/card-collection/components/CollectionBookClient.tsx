'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CardRarity, FishingCard } from '@/app/card-collection/data/cardData';
import CardSlot from './CardSlot';
import CardDetailModal from './CardDetailModal';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SupabaseCard {
  id: string;
  card_number: number;
  name: string;
  species: string;
  rarity: string;
  image_url?: string;
  power?: number;
  stealth?: number;
  stamina?: number;
  energy?: number;
  beauty?: number;
  hp?: number;
  card_level?: number;
  habitat?: string;
  description?: string;
  hint?: string;
  fact?: string;
  foil?: boolean;
  gradient?: string;
  border_color?: string;
  drop_rate?: number;
  points_value?: number;
}

const BOOK_ASSET = 'https://voyagers-hook.github.io/images/book1.png';
const RARITIES: CardRarity[] = ['Widespread', 'Elusive', 'Specimen', 'Legendary'];

const RARITY_COLORS: Record<string, string> = {
  Widespread: '#94a3b8',
  Elusive: '#2d6a4f',
  Specimen: '#3b82f6',
  Legendary: '#ff751f',
};

export default function CollectionBookClient() {
  const { user, loading: authLoading } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [cards, setCards] = useState<FishingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [filterRarity, setFilterRarity] = useState<CardRarity | 'All'>('All');
  const [showCollectedOnly, setShowCollectedOnly] = useState(false);
  const [selectedCard, setSelectedCard] = useState<FishingCard | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    collected: 0,
    rarityCounts: {} as Record<string, { owned: number; total: number }>,
  });

  const loadCollectionData = useCallback(async () => {
    if (authLoading) return;
    setLoading(true);
    try {
      const { data: allCards, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .order('card_number', { ascending: true });

      if (cardsError) throw cardsError;

      let collectedMap = new Map<string, { date: string }>();
      if (user) {
        const { data: userCards } = await supabase
          .from('user_cards')
          .select('card_id, collected_at')
          .eq('user_id', user.id)
          .eq('opened', true);
        userCards?.forEach((uc: any) => {
          collectedMap.set(uc.card_id, { date: uc.collected_at });
        });
      }

      const mappedCards: FishingCard[] = (allCards as SupabaseCard[]).map((c) => ({
        id: c.id,
        cardNumber: c.card_number,
        totalCards: allCards.length,
        name: c.name,
        species: c.species,
        rarity: c.rarity as CardRarity,
        image: c.image_url,
        power: c.power ?? 0,
        stealth: c.stealth ?? 0,
        stamina: c.stamina ?? c.energy ?? 0,
        energy: c.energy ?? 0,
        beauty: c.beauty ?? 0,
        hp: c.hp,
        cardLevel: c.card_level,
        habitat: c.habitat ?? 'Unknown Waters',
        description: c.description ?? '',
        hint: c.hint,
        fact: c.fact,
        foil: c.foil ?? false,
        gradient: c.gradient ?? 'from-stone-700 to-stone-900',
        borderColor: c.border_color ?? '#ffffff',
        collected: collectedMap.has(c.id),
        collectedDate: collectedMap.has(c.id)
          ? new Date(collectedMap.get(c.id)!.date).toLocaleDateString('en-GB')
          : undefined,
      }));

      const rarityTotals = RARITIES.reduce((acc, r) => {
        acc[r] = {
          total: mappedCards.filter((card) => card.rarity === r).length,
          owned: mappedCards.filter((card) => card.rarity === r && card.collected).length,
        };
        return acc;
      }, {} as Record<string, { owned: number; total: number }>);

      setStats({
        total: mappedCards.length,
        collected: mappedCards.filter((c) => c.collected).length,
        rarityCounts: rarityTotals,
      });
      setCards(mappedCards);
    } catch (err) {
      console.error('Error fetching collection:', err);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading, supabase]);

  useEffect(() => { loadCollectionData(); }, [loadCollectionData]);

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchesRarity = filterRarity === 'All' || card.rarity === filterRarity;
      const matchesCollected = !showCollectedOnly || card.collected;
      return matchesRarity && matchesCollected;
    });
  }, [cards, filterRarity, showCollectedOnly]);

  const totalPages = Math.max(1, Math.ceil(filteredCards.length / 8));
  const currentSpread = filteredCards.slice(currentPage * 8, (currentPage + 1) * 8);
  const leftPage = currentSpread.slice(0, 4);
  const rightPage = currentSpread.slice(4, 8);

  const handlePageTurn = (direction: 'next' | 'prev') => {
    if (isFlipping) return;
    const next = direction === 'next' ? currentPage + 1 : currentPage - 1;
    if (next >= 0 && next < totalPages) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(next);
        setIsFlipping(false);
      }, 400);
    }
  };

  const completionRate = stats.total > 0 ? Math.round((stats.collected / stats.total) * 100) : 0;

  /* Book image is 4000x2800. Each page area: ~873x1246px.
     As percentages of 4000x2800:
     Left page:  left ~7.8%, top ~5.5%, width ~21.8%, height ~44.5%
     Right page: right ~7.8%, top ~5.5%, width ~21.8%, height ~44.5%
     We need to account for the book frame/border around the pages.
     Adjusted for the actual visible page area within the frame: */
  const PAGE_TOP = '11%';
  const PAGE_HEIGHT = '78%';
  const LEFT_PAGE_LEFT = '7.5%';
  const LEFT_PAGE_WIDTH = '40%';
  const RIGHT_PAGE_LEFT = '52.5%';
  const RIGHT_PAGE_WIDTH = '40%';

  const PageGrid = ({ pageCards, pageLabel }: { pageCards: FishingCard[]; pageLabel: string }) => (
    <div className="w-full h-full flex flex-col">
      {/* Page header */}
      <div className="flex items-center justify-between px-1 mb-2 lg:mb-3 flex-shrink-0">
        <span className="font-serif italic text-[10px] lg:text-xs" style={{ color: 'rgba(80,60,30,0.5)' }}>
          {pageLabel}
        </span>
        <span className="text-[8px] lg:text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(180,120,40,0.4)' }}>
          {filterRarity === 'All' ? 'All Species' : filterRarity}
        </span>
      </div>
      {/* 2x2 card grid */}
      <div className="grid grid-cols-2 gap-2 lg:gap-3 xl:gap-4 flex-1 content-start">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="relative">
            {pageCards[i] ? (
              <div className="transition-all duration-300 hover:-translate-y-1 hover:z-10 cursor-pointer">
                <CardSlot card={pageCards[i]} onClick={() => setSelectedCard(pageCards[i])} />
              </div>
            ) : (
              <div
                className="w-full rounded-lg lg:rounded-xl"
                style={{
                  aspectRatio: '3 / 4',
                  border: '2px dashed rgba(120,90,40,0.12)',
                  background: 'rgba(0,0,0,0.02)',
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center font-sans selection:bg-[#ff751f]/30 overflow-x-hidden"
      style={{ background: 'linear-gradient(180deg, #091408 0%, #0f1f12 40%, #1a3d28 100%)' }}>

      {/* Subtle texture overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/dark-matter.png')" }} />

      {/* ════ HEADER ════ */}
      <header className="relative z-30 w-full max-w-[1800px] px-4 lg:px-8 pt-6 pb-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-black/30 backdrop-blur-xl border border-white/[0.06] rounded-2xl px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #ff751f, #e85a00)', boxShadow: '0 4px 20px rgba(255,117,31,0.3)' }}>
              <Icon name="BookOpenIcon" size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl lg:text-3xl text-white tracking-tight">
                The Voyager&apos;s Chronicle
              </h1>
              <p className="text-white/30 text-xs lg:text-sm mt-0.5">
                <span className="text-[#ff751f] font-semibold">{stats.collected}</span>
                <span> of </span>
                <span className="text-white/50 font-semibold">{stats.total}</span>
                <span> specimens discovered</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Completion ring */}
            <div className="relative w-11 h-11 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="18" fill="transparent" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                <circle cx="22" cy="22" r="18" fill="transparent" stroke="#ff751f" strokeWidth="4"
                  strokeDasharray="113.1" strokeDashoffset={113.1 - (113.1 * completionRate) / 100}
                  strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-[10px]">
                {completionRate}%
              </span>
            </div>

            <Link href="/card-opening"
              className="flex items-center gap-2 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #ff751f, #e85a00)', boxShadow: '0 4px 20px rgba(255,117,31,0.3)' }}>
              <Icon name="GiftIcon" size={16} />
              Open Pack
            </Link>
          </div>
        </div>
      </header>

      {/* ════ MAIN LAYOUT ════ */}
      <main className="relative z-20 w-full max-w-[1800px] px-4 lg:px-8 flex flex-col lg:flex-row gap-6 items-start pb-20">

        {/* ──── SIDEBAR ──── */}
        <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0 lg:sticky lg:top-6">
          <div className="bg-black/30 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 space-y-5">

            {/* Rarity breakdown */}
            <div>
              <h3 className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">Species Rarity</h3>
              <div className="space-y-2">
                {RARITIES.map((r) => {
                  const owned = stats.rarityCounts[r]?.owned ?? 0;
                  const total = stats.rarityCounts[r]?.total ?? 0;
                  const pct = total > 0 ? (owned / total) * 100 : 0;
                  return (
                    <div key={r}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: RARITY_COLORS[r] }} />
                          <span className="text-white/60 text-[11px] font-semibold">{r}</span>
                        </div>
                        <span className="text-white/30 text-[10px] font-bold tabular-nums">{owned}/{total}</span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: RARITY_COLORS[r], opacity: 0.7 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Filter buttons */}
            <div>
              <h3 className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">Filter By</h3>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => { setFilterRarity('All'); setCurrentPage(0); }}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all"
                  style={{
                    background: filterRarity === 'All' ? 'linear-gradient(135deg, #ff751f, #e85a00)' : 'transparent',
                    color: filterRarity === 'All' ? '#fff' : 'rgba(255,255,255,0.35)',
                    boxShadow: filterRarity === 'All' ? '0 2px 12px rgba(255,117,31,0.3)' : 'none',
                  }}>
                  All Specimens
                </button>
                {RARITIES.map((r) => (
                  <button key={r}
                    onClick={() => { setFilterRarity(r); setCurrentPage(0); }}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all"
                    style={{
                      background: filterRarity === r ? 'rgba(255,255,255,0.08)' : 'transparent',
                      color: filterRarity === r ? '#fff' : 'rgba(255,255,255,0.35)',
                      border: filterRarity === r ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
                    }}>
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: RARITY_COLORS[r] }} />
                      {r}
                    </span>
                    <span className="text-[9px] opacity-40">
                      {stats.rarityCounts[r]?.owned ?? 0}/{stats.rarityCounts[r]?.total ?? 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Collected only toggle */}
            <button
              onClick={() => { setShowCollectedOnly(!showCollectedOnly); setCurrentPage(0); }}
              className="w-full py-2.5 rounded-xl text-[10px] uppercase tracking-[0.15em] font-black transition-all"
              style={{
                background: showCollectedOnly ? '#ff751f' : 'transparent',
                color: showCollectedOnly ? '#fff' : 'rgba(255,255,255,0.3)',
                border: showCollectedOnly ? '1px solid #ff751f' : '1px solid rgba(255,255,255,0.08)',
                boxShadow: showCollectedOnly ? '0 2px 12px rgba(255,117,31,0.3)' : 'none',
              }}>
              {showCollectedOnly ? 'Showing Collected' : 'Show Collected Only'}
            </button>
          </div>
        </aside>

        {/* ──── THE BOOK ──── */}
        <div className="flex-1 w-full flex flex-col items-center">
          {/* Book container - maintains 4000:2800 (10:7) aspect ratio */}
          <div className="relative w-full"
            style={{ maxWidth: '1200px', aspectRatio: '10 / 7' }}>

            {/* Book background image */}
            <img
              src={BOOK_ASSET}
              alt="Collection Book"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
              style={{ filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.6)) drop-shadow(0 10px 20px rgba(0,0,0,0.4))' }}
              draggable={false}
            />

            {/* Page content overlay - fades during flip */}
            <div className={`absolute inset-0 transition-all duration-400 ${isFlipping ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'}`}>

              {/* LEFT PAGE */}
              <div className="absolute" style={{
                top: PAGE_TOP,
                left: LEFT_PAGE_LEFT,
                width: LEFT_PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding: '4% 5% 4% 6%',
              }}>
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Icon name="ArrowPathIcon" size={28} className="animate-spin mx-auto mb-2" style={{ color: 'rgba(140,100,40,0.4)' }} />
                      <p className="text-xs font-serif italic" style={{ color: 'rgba(100,70,30,0.4)' }}>Loading specimens...</p>
                    </div>
                  </div>
                ) : filteredCards.length === 0 ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <Icon name="BookOpenIcon" size={32} style={{ color: 'rgba(140,100,40,0.2)' }} />
                    <p className="text-sm font-serif italic" style={{ color: 'rgba(100,70,30,0.4)' }}>No specimens found</p>
                    <p className="text-[10px]" style={{ color: 'rgba(100,70,30,0.3)' }}>Adjust your filters or open a pack</p>
                  </div>
                ) : (
                  <PageGrid pageCards={leftPage} pageLabel={`Page ${currentPage * 2 + 1}`} />
                )}
              </div>

              {/* RIGHT PAGE */}
              <div className="absolute" style={{
                top: PAGE_TOP,
                left: RIGHT_PAGE_LEFT,
                width: RIGHT_PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding: '4% 6% 4% 5%',
              }}>
                {!loading && filteredCards.length > 0 && (
                  <PageGrid pageCards={rightPage} pageLabel={`Page ${currentPage * 2 + 2}`} />
                )}
              </div>
            </div>

            {/* Navigation arrows */}
            {currentPage > 0 && (
              <button
                onClick={() => handlePageTurn('prev')}
                className="absolute z-40 top-1/2 -translate-y-1/2 transition-all hover:scale-110 active:scale-90"
                style={{
                  left: '-20px',
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff751f, #e85a00)',
                  boxShadow: '0 4px 20px rgba(255,117,31,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Icon name="ChevronLeftIcon" size={22} className="text-white" />
              </button>
            )}
            {currentPage < totalPages - 1 && (
              <button
                onClick={() => handlePageTurn('next')}
                className="absolute z-40 top-1/2 -translate-y-1/2 transition-all hover:scale-110 active:scale-90"
                style={{
                  right: '-20px',
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff751f, #e85a00)',
                  boxShadow: '0 4px 20px rgba(255,117,31,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Icon name="ChevronRightIcon" size={22} className="text-white" />
              </button>
            )}
          </div>

          {/* Page indicator below book */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i}
                  onClick={() => {
                    if (!isFlipping && i !== currentPage) {
                      setIsFlipping(true);
                      setTimeout(() => { setCurrentPage(i); setIsFlipping(false); }, 400);
                    }
                  }}
                  className="rounded-full transition-all"
                  style={{
                    width: i === currentPage ? 20 : 6,
                    height: 6,
                    background: i === currentPage ? '#ff751f' : 'rgba(255,255,255,0.1)',
                    boxShadow: i === currentPage ? '0 0 10px rgba(255,117,31,0.4)' : 'none',
                  }} />
              ))}
            </div>
            <span className="text-white/25 text-[10px] font-bold uppercase tracking-[0.2em]">
              Section {currentPage + 1} of {totalPages}
            </span>
          </div>
        </div>
      </main>

      {/* Modal */}
      {selectedCard && (
        <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </div>
  );
}
