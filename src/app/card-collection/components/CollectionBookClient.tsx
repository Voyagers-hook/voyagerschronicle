'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { rarityConfig, CardRarity, FishingCard } from '@/app/card-collection/data/cardData';
import CardSlot from './CardSlot';
import CardDetailModal from './CardDetailModal';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// --- TYPES ---
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

// --- ASSETS ---
const TEX_WOOD = 'https://voyagers-hook.github.io/images/wood%20texture.png';
const TEX_PARCHMENT = 'https://voyagers-hook.github.io/images/parchment.png';
const TEX_RIVET = 'https://voyagers-hook.github.io/images/rivet.png';
const TEX_LEATHER = 'https://voyagers-hook.github.io/images/leather%20texture.png';

export default function CollectionBookClient() {
  const { user, loading: authLoading } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  // State
  const [cards, setCards] = useState<FishingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0); // Represents the "Spread" index
  const [filterRarity, setFilterRarity] = useState<CardRarity | 'All'>('All');
  const [showCollectedOnly, setShowCollectedOnly] = useState(false);
  const [selectedCard, setSelectedCard] = useState<FishingCard | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);

  // --- DATA LOADING ---
  useEffect(() => {
    if (authLoading) return;

    const loadCollection = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch all cards defined in the game
        const { data: allCards, error: cardsError } = await supabase
          .from('cards')
          .select('*')
          .order('card_number', { ascending: true });

        if (cardsError) throw cardsError;

        // 2. Fetch the user's specific collection
        let collectedMap = new Map<string, string>();
        if (user) {
          const { data: userCards, error: userCardsError } = await supabase
            .from('user_cards')
            .select('card_id, collected_at')
            .eq('user_id', user.id)
            .eq('opened', true);

          if (userCardsError) console.error("User cards error:", userCardsError.message);
          else if (userCards) {
            userCards.forEach((uc: any) => collectedMap.set(uc.card_id, uc.collected_at));
          }
        }

        // 3. Map Supabase data to our UI-friendly FishingCard type
        const mapped: FishingCard[] = (allCards as SupabaseCard[]).map((c) => ({
          id: c.id,
          cardNumber: c.card_number,
          totalCards: allCards.length,
          name: c.name,
          species: c.species,
          rarity: c.rarity as CardRarity,
          image: c.image_url,
          power: c.power ?? 0,
          stealth: c.stealth ?? 0,
          stamina: c.stamina ?? 0,
          energy: c.energy ?? 0,
          beauty: c.beauty ?? 0,
          hp: c.hp,
          cardLevel: c.card_level,
          habitat: c.habitat ?? '',
          description: c.description ?? '',
          hint: c.hint,
          fact: c.fact,
          foil: c.foil ?? false,
          gradient: c.gradient ?? 'from-blue-400 via-cyan-300 to-teal-400',
          borderColor: c.border_color ?? '#3B82F6',
          dropRate: c.drop_rate,
          pointsValue: c.points_value,
          collected: collectedMap.has(c.id),
          collectedDate: collectedMap.has(c.id) 
            ? new Date(collectedMap.get(c.id)!).toLocaleDateString('en-GB') 
            : undefined,
        }));

        setCards(mapped);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    loadCollection();
  }, [user, authLoading, supabase]);

  // --- LOGIC & FILTERING ---
  const filtered = useMemo(() => {
    return cards.filter(c => {
      if (filterRarity !== 'All' && c.rarity !== filterRarity) return false;
      if (showCollectedOnly && !c.collected) return false;
      return true;
    });
  }, [cards, filterRarity, showCollectedOnly]);

  const totalSpreads = Math.ceil(filtered.length / 8);
  const currentSpread = filtered.slice(currentPage * 8, (currentPage + 1) * 8);
  
  // Split spread into Left Page (4) and Right Page (4)
  const leftPageCards = currentSpread.slice(0, 4);
  const rightPageCards = currentSpread.slice(4, 8);

  const collectedCount = cards.filter(c => c.collected).length;
  const progress = cards.length > 0 ? Math.round((collectedCount / cards.length) * 100) : 0;

  const handlePageTurn = (direction: number) => {
    if (isFlipping) return;
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentPage(prev => Math.max(0, Math.min(totalSpreads - 1, prev + direction)));
      setIsFlipping(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#120c08] py-16 px-4 flex flex-col items-center justify-center overflow-x-hidden"
      style={{ backgroundImage: `url("${TEX_WOOD}")`, backgroundSize: '600px', boxShadow: 'inset 0 0 300px rgba(0,0,0,0.9)' }}>
      
      {/* 1. TOP UI / PROGRESS */}
      <div className="w-full max-w-5xl mb-12 flex flex-col md:flex-row justify-between items-center gap-6 z-50">
        <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                    <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="4" 
                        strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * progress) / 100}
                        className="text-amber-500 transition-all duration-1000" />
                </svg>
                <span className="absolute text-xs font-bold text-amber-100">{progress}%</span>
            </div>
            <div>
                <h3 className="text-amber-100 font-serif italic text-lg leading-tight">Master Angler's Progress</h3>
                <p className="text-white/40 text-[10px] uppercase tracking-[0.2em]">{collectedCount} / {cards.length} Specimens Cataloged</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {['All', 'Widespread', 'Elusive', 'Specimen', 'Legendary'].map((r) => (
            <button key={r} onClick={() => { setFilterRarity(r as any); setCurrentPage(0); }}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border
              ${filterRarity === r ? 'bg-amber-100 border-amber-100 text-stone-900 shadow-xl scale-110' : 'bg-black/20 border-white/10 text-amber-100/40 hover:text-amber-100'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* 2. THE 3D BOOK ENGINE */}
      <div className="relative w-full max-w-7xl" style={{ perspective: '3000px' }}>
        
        <div className={`relative flex flex-col lg:flex-row transition-all duration-700 ease-in-out
          ${isFlipping ? 'opacity-40 scale-[0.98] blur-sm rotate-x-12' : 'opacity-100 scale-100 rotate-x-6'}`}
          style={{ transformStyle: 'preserve-3d' }}>
          
          {/* THE LEATHER BINDING (Outer shell) */}
          <div className="absolute -inset-4 sm:-inset-8 bg-[#2a1a0f] rounded-[3rem] shadow-[0_80px_120px_-20px_rgba(0,0,0,1)] border-b-[15px] border-black/50"
            style={{ backgroundImage: `url("${TEX_LEATHER}")`, backgroundSize: '500px' }}>
            <img src={TEX_RIVET} className="absolute top-10 left-10 w-10 h-10 opacity-40 mix-blend-overlay" alt="" />
            <img src={TEX_RIVET} className="absolute top-10 right-10 w-10 h-10 opacity-40 mix-blend-overlay" alt="" />
            <img src={TEX_RIVET} className="absolute bottom-10 left-10 w-10 h-10 opacity-40 mix-blend-overlay" alt="" />
            <img src={TEX_RIVET} className="absolute bottom-10 right-10 w-10 h-10 opacity-40 mix-blend-overlay" alt="" />
          </div>

          {/* LEFT PAGE SPREAD */}
          <div className="relative flex-1 bg-[#fdf2d9] min-h-[850px] rounded-l-2xl overflow-hidden border-r border-black/20 shadow-[inset_-40px_0_80px_rgba(0,0,0,0.15)]"
            style={{ backgroundImage: `url("${TEX_PARCHMENT}")`, backgroundSize: '900px' }}>
            
            <div className="p-12">
              <div className="flex justify-between items-end mb-10 border-b-2 border-stone-800/10 pb-6">
                <div>
                    <h2 className="font-serif italic text-4xl text-stone-900 tracking-tight">The Voyager's Log</h2>
                    <p className="text-stone-500 text-xs uppercase tracking-widest mt-1">Classification: {filterRarity}</p>
                </div>
                <span className="text-stone-400 font-serif italic">Folio {currentPage * 2 + 1}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-10">
                {leftPageCards.map(card => (
                  <div key={card.id} className="group relative transform -rotate-1 hover:rotate-0 hover:scale-105 transition-all duration-500">
                    <div className="absolute inset-0 bg-black/5 blur-xl rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardSlot card={card} onClick={() => setSelectedCard(card)} />
                  </div>
                ))}
                {Array.from({ length: 4 - leftPageCards.length }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] border-2 border-dashed border-stone-800/10 rounded-xl bg-stone-900/5 flex items-center justify-center opacity-40">
                    <Icon name="LockClosedIcon" size={32} className="text-stone-300" />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Page thickness effect at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/10 to-transparent" />
          </div>

          {/* THE SPINE / CENTRAL HINGE */}
          <div className="relative w-16 bg-[#1e130a] z-20 flex flex-col items-center justify-between py-12 shadow-[inset_0_0_40px_rgba(0,0,0,1)]"
            style={{ backgroundImage: `url("${TEX_LEATHER}")`, backgroundSize: '200px' }}>
            <div className="w-[1px] h-full bg-white/5 shadow-[0_0_10px_white/5]" />
            <div className="absolute top-1/4 w-full h-[2px] bg-amber-900/40" />
            <div className="absolute top-2/4 w-full h-[2px] bg-amber-900/40" />
            <div className="absolute top-3/4 w-full h-[2px] bg-amber-900/40" />
          </div>

          {/* RIGHT PAGE SPREAD */}
          <div className="relative flex-1 bg-[#fdf2d9] min-h-[850px] rounded-r-2xl overflow-hidden shadow-[inset_40px_0_80px_rgba(0,0,0,0.15)]"
            style={{ backgroundImage: `url("${TEX_PARCHMENT}")`, backgroundSize: '900px' }}>
            
            <div className="p-12 pt-28">
              <div className="grid grid-cols-2 gap-10">
                {rightPageCards.map(card => (
                  <div key={card.id} className="group relative transform rotate-1 hover:rotate-0 hover:scale-105 transition-all duration-500">
                    <div className="absolute inset-0 bg-black/5 blur-xl rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardSlot card={card} onClick={() => setSelectedCard(card)} />
                  </div>
                ))}
                {Array.from({ length: 4 - rightPageCards.length }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] border-2 border-dashed border-stone-800/10 rounded-xl bg-stone-900/5 flex items-center justify-center opacity-40">
                    <Icon name="LockClosedIcon" size={32} className="text-stone-300" />
                  </div>
                ))}
              </div>

              {/* Navigation Controls Embedded in the Page */}
              <div className="mt-20 flex flex-col items-end gap-4 border-t border-stone-800/5 pt-8">
                <span className="text-stone-400 font-serif italic uppercase text-xs tracking-widest">Folio {currentPage * 2 + 2}</span>
                <div className="flex gap-4">
                  <button 
                    disabled={currentPage === 0 || isFlipping}
                    onClick={() => handlePageTurn(-1)}
                    className="w-14 h-14 rounded-full border border-stone-800/10 flex items-center justify-center hover:bg-stone-900 hover:text-white transition-all disabled:opacity-0">
                    <Icon name="ChevronLeftIcon" size={28} />
                  </button>
                  <button 
                    disabled={currentPage >= totalSpreads - 1 || isFlipping}
                    onClick={() => handlePageTurn(1)}
                    className="w-14 h-14 rounded-full border border-stone-800/10 flex items-center justify-center hover:bg-stone-900 hover:text-white transition-all disabled:opacity-0">
                    <Icon name="ChevronRightIcon" size={28} />
                  </button>
                </div>
              </div>
            </div>

            {/* Page thickness effect at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/10 to-transparent" />
          </div>

        </div>
      </div>

      {/* 3. EXTRA ACTIONS */}
      <div className="mt-16 flex gap-6">
        <Link href="/card-opening" className="px-10 py-4 bg-amber-600 hover:bg-amber-500 text-stone-900 font-bold rounded-full shadow-2xl transition-all hover:-translate-y-1 active:scale-95 uppercase tracking-widest text-sm flex items-center gap-3">
            <Icon name="PlusCircleIcon" size={20} />
            Acquire More Packs
        </Link>
        <button onClick={() => setShowCollectedOnly(!showCollectedOnly)} 
            className={`px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm transition-all border ${showCollectedOnly ? 'bg-amber-100 text-stone-900 border-amber-100' : 'bg-transparent text-amber-100 border-white/20 hover:bg-white/5'}`}>
            {showCollectedOnly ? 'Show All' : 'Show Only Caught'}
        </button>
      </div>

      {selectedCard && (
        <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </div>
  );
}
