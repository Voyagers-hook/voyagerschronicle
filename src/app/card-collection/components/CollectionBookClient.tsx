'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CardRarity, FishingCard } from '@/app/card-collection/data/cardData';
import CardSlot from './CardSlot';
import CardDetailModal from './CardDetailModal';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * FULL LOGIC VERSION
 * Restores 400-line functional depth:
 * - Complete Supabase mapping (Stamina/Energy/HP/Beauty/Stats)
 * - Full rarity breakdown & progress logic
 * - Massive-scale viewport layout
 */

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

const RARITY_MAP: Record<string, { color: string; bg: string; border: string }> = {
  Widespread: { color: '#ffffff', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' },
  Elusive: { color: '#2d6a4f', bg: 'rgba(45,106,79,0.1)', border: 'rgba(45,106,79,0.3)' },
  Specimen: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)' },
  Legendary: { color: '#ff751f', bg: 'rgba(255,117,31,0.1)', border: 'rgba(255,117,31,0.4)' },
};

export default function CollectionBookClient() {
  const { user, loading: authLoading } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  // --- 400-LINE STATE LOGIC RESTORED ---
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
    rarityCounts: {} as Record<string, { owned: number; total: number }>
  });

  // --- RE-IMPLEMENTED DATA FETCHING ---
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

      // Calculate detailed rarity stats
      const rarityTotals = RARITIES.reduce((acc, r) => {
        acc[r] = {
          total: mappedCards.filter(card => card.rarity === r).length,
          owned: mappedCards.filter(card => card.rarity === r && card.collected).length
        };
        return acc;
      }, {} as Record<string, { owned: number; total: number }>);

      setStats({
        total: mappedCards.length,
        collected: mappedCards.filter(c => c.collected).length,
        rarityCounts: rarityTotals
      });

      setCards(mappedCards);
    } catch (err) {
      console.error('Error fetching collection logic:', err);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading, supabase]);

  useEffect(() => {
    loadCollectionData();
  }, [loadCollectionData]);

  // --- FILTERING & PAGINATION LOGIC ---
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
      }, 450);
    }
  };

  const completionRate = stats.total > 0 ? Math.round((stats.collected / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center bg-[#091408] font-sans selection:bg-[#ff751f]/30 overflow-x-hidden">
      
      {/* 1. BACKGROUND LAYER (Matching rest of site) */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#091408] via-[#1a3d28] to-[#2d6a4f]" />
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
      </div>

      {/* 2. TOP NAVIGATION HUD (Matching HomeHero Style) */}
      <header className="relative z-30 w-full max-w-[1600px] px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl">
            <Icon name="BookOpenIcon" size={32} className="text-[#ff751f]" />
          </div>
          <div>
            <h1 className="font-display text-4xl text-white tracking-tight">The Voyager's Chronicle</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="px-2 py-0.5 rounded bg-[#ff751f]/10 text-[#ff751f] text-[10px] font-bold uppercase tracking-widest border border-[#ff751f]/20">
                Master Collection
              </span>
              <p className="text-white/40 text-sm font-medium italic">
                {stats.collected} of {stats.total} specimens discovered
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-black/20 p-2 rounded-2xl backdrop-blur-md border border-white/5">
          <Link href="/card-opening" className="px-8 py-3 rounded-xl text-white font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,117,31,0.3)]"
            style={{ background: 'linear-gradient(135deg, #ff751f, #e85a00)' }}>
            Log New Catch
          </Link>
        </div>
      </header>

      {/* 3. MAIN WORKSPACE */}
      <main className="relative z-20 w-full max-w-[1800px] px-4 flex flex-col lg:flex-row gap-8 items-start justify-center pb-20">
        
        {/* SIDEBAR LOGIC (RESTORED) */}
        <aside className="w-full lg:w-80 flex flex-col gap-6 sticky top-8">
          <div className="bg-black/40 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] shadow-2xl">
            <h3 className="text-white font-display text-xl mb-6">Catalog Progress</h3>
            
            <div className="space-y-6">
              {/* Radial Completion Restored */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                    <circle cx="50" cy="50" r="45" fill="transparent" stroke="#ff751f" strokeWidth="10" 
                      strokeDasharray="282.7" strokeDashoffset={282.7 - (282.7 * completionRate) / 100}
                      strokeLinecap="round" className="transition-all duration-1000" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">{completionRate}%</span>
                </div>
                <p className="text-white/60 text-xs font-sans leading-relaxed">Overall mastery of the regional waters.</p>
              </div>

              {/* Rarity Filters Restored */}
              <nav className="flex flex-col gap-2 mt-8">
                <button onClick={() => {setFilterRarity('All'); setCurrentPage(0);}}
                  className={`w-full text-left px-5 py-3 rounded-xl text-sm font-bold transition-all ${filterRarity === 'All' ? 'bg-[#ff751f] text-white' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
                  All Specimens
                </button>
                {RARITIES.map(r => (
                  <button key={r} onClick={() => {setFilterRarity(r); setCurrentPage(0);}}
                    className={`group w-full flex items-center justify-between px-5 py-3 rounded-xl text-sm font-bold transition-all ${filterRarity === r ? 'bg-white/10 text-white border border-white/20' : 'text-white/40 hover:text-white'}`}>
                    <span className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: RARITY_MAP[r].color }} />
                      {r}
                    </span>
                    <span className="text-[10px] opacity-40">{stats.rarityCounts[r]?.owned || 0}/{stats.rarityCounts[r]?.total || 0}</span>
                  </button>
                ))}
              </nav>

              <button onClick={() => {setShowCollectedOnly(!showCollectedOnly); setCurrentPage(0);}}
                className={`w-full mt-4 py-3 rounded-xl border text-[10px] uppercase tracking-[0.2em] font-black transition-all ${showCollectedOnly ? 'bg-white text-black border-white' : 'border-white/10 text-white/40 hover:border-white/20'}`}>
                {showCollectedOnly ? 'Caught Specimens' : 'All Catalogued'}
              </button>
            </div>
          </div>
        </aside>

        {/* 4. THE BOOK (MASSIVE SCALE) */}
        <div className="relative flex-1 w-full flex flex-col items-center">
          <div className="relative w-full aspect-[2000/1400] transition-all duration-700 ease-in-out">
            {/* The Asset */}
            <img src={BOOK_ASSET} className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.7)]" alt="" />
            
            <div className={`absolute inset-0 transition-all duration-500 ${isFlipping ? 'opacity-0 scale-95 blur-xl' : 'opacity-100 scale-100'}`}>
              
              {/* LEFT PAGE GRID (Perfectly Center-Aligned) */}
              <div className="absolute top-[8.5%] left-[8%] w-[38.5%] h-[83%] flex flex-col p-8 lg:p-12 xl:p-16">
                <div className="flex justify-between items-center mb-8 border-b border-black/5 pb-2">
                  <span className="font-serif italic text-stone-800/60 text-sm">Folio {currentPage * 2 + 1}</span>
                  <span className="text-[10px] text-[#ff751f] font-black uppercase tracking-tighter">{filterRarity}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-12 xl:gap-y-20 flex-1 content-start">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="relative group transition-all duration-500 hover:-translate-y-2">
                      {leftPage[i] ? (
                        <CardSlot card={leftPage[i]} onClick={() => setSelectedCard(leftPage[i])} />
                      ) : (
                        <div className="aspect-[3/4] border-2 border-dashed border-black/[0.03] rounded-2xl bg-black/[0.01]" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT PAGE GRID */}
              <div className="absolute top-[8.5%] right-[8%] w-[38.5%] h-[83%] flex flex-col p-8 lg:p-12 xl:p-16">
                <div className="flex justify-between items-center mb-8 border-b border-black/5 pb-2">
                  <span className="text-[10px] text-[#ff751f] font-black uppercase tracking-tighter">Journal Entry</span>
                  <span className="font-serif italic text-stone-800/60 text-sm">Folio {currentPage * 2 + 2}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-12 xl:gap-y-20 flex-1 content-start">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="relative group transition-all duration-500 hover:-translate-y-2">
                      {rightPage[i] ? (
                        <CardSlot card={rightPage[i]} onClick={() => setSelectedCard(rightPage[i])} />
                      ) : (
                        <div className="aspect-[3/4] border-2 border-dashed border-black/[0.03] rounded-2xl bg-black/[0.01]" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* NAV CONTROLS */}
            {currentPage > 0 && (
              <button onClick={() => handlePageTurn('prev')} 
                className="absolute left-[-2%] top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white shadow-2xl flex items-center justify-center text-[#ff751f] transition-all hover:scale-110 active:scale-95 z-40">
                <Icon name="ChevronLeftIcon" size={32} />
              </button>
            )}
            {currentPage < totalPages - 1 && (
              <button onClick={() => handlePageTurn('next')} 
                className="absolute right-[-2%] top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white shadow-2xl flex items-center justify-center text-[#ff751f] transition-all hover:scale-110 active:scale-95 z-40">
                <Icon name="ChevronRightIcon" size={32} />
              </button>
            )}
          </div>

          <div className="mt-10 flex items-center gap-3">
             <div className="h-1 w-24 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#ff751f] transition-all" style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }} />
             </div>
             <span className="text-white/40 text-[10px] uppercase font-bold tracking-[0.3em]">Section {currentPage + 1} of {totalPages}</span>
          </div>
        </div>
      </main>

      {/* 5. MODAL LOGIC RESTORED */}
      {selectedCard && (
        <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </div>
  );
}
