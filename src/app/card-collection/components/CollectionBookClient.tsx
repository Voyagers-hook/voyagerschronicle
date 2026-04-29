'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { CardRarity, FishingCard } from '@/app/card-collection/data/cardData';
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

// --- CONSTANTS & ASSETS ---
const BOOK_DESIGN = 'https://voyagers-hook.github.io/images/book%20design%201.png';
const WOOD_BG = 'https://voyagers-hook.github.io/images/wood%20texture.png';

const RARITIES: CardRarity[] = ['Widespread', 'Elusive', 'Specimen', 'Legendary'];
const RARITY_COLORS: Record<string, string> = {
  Widespread: '#c49050',
  Elusive: '#2D6A4F',
  Specimen: '#3B82F6',
  Legendary: '#F59E0B',
};

export default function CollectionBookClient() {
  const { user, loading: authLoading } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  // --- STATE ---
  const [cards, setCards] = useState<FishingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [filterRarity, setFilterRarity] = useState<CardRarity | 'All'>('All');
  const [showCollectedOnly, setShowCollectedOnly] = useState(false);
  const [selectedCard, setSelectedCard] = useState<FishingCard | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);

  // --- DATA FETCHING & MAPPING ---
  useEffect(() => {
    if (authLoading) return;

    const loadCollection = async () => {
      setLoading(true);
      try {
        const { data: allCards, error: cardsError } = await supabase
          .from('cards')
          .select('*')
          .order('card_number', { ascending: true });

        if (cardsError) throw cardsError;

        let collectedMap = new Map<string, string>();
        if (user) {
          const { data: userCards } = await supabase
            .from('user_cards')
            .select('card_id, collected_at')
            .eq('user_id', user.id)
            .eq('opened', true);

          userCards?.forEach((uc: any) => collectedMap.set(uc.card_id, uc.collected_at));
        }

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
          stamina: c.energy ?? 0, // Mapping energy to stamina per your previous logic
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
          collected: collectedMap.has(c.id),
          collectedDate: collectedMap.has(c.id) 
            ? new Date(collectedMap.get(c.id)!).toLocaleDateString('en-GB') 
            : undefined,
        }));

        setCards(mapped);
      } catch (err) {
        console.error("Error loading collection:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCollection();
  }, [user, authLoading, supabase]);

  // --- DERIVED DATA / LOGIC ---
  const filtered = useMemo(() => {
    return cards.filter(c => {
      if (filterRarity !== 'All' && c.rarity !== filterRarity) return false;
      if (showCollectedOnly && !c.collected) return false;
      return true;
    });
  }, [cards, filterRarity, showCollectedOnly]);

  const totalSpreads = Math.max(1, Math.ceil(filtered.length / 8));
  const currentSpread = filtered.slice(currentPage * 8, (currentPage + 1) * 8);
  const leftCards = currentSpread.slice(0, 4);
  const rightCards = currentSpread.slice(4, 8);

  const collectedCount = cards.filter(c => c.collected).length;
  const progress = cards.length > 0 ? Math.round((collectedCount / cards.length) * 100) : 0;

  const handleFlip = (dir: number) => {
    if (isFlipping) return;
    const next = currentPage + dir;
    if (next < 0 || next >= totalSpreads) return;
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentPage(next);
      setIsFlipping(false);
    }, 400);
  };

  // --- RENDER HELPERS ---
  const EmptySlot = ({ index }: { index: number }) => (
    <div className="aspect-[3/4] rounded-xl border-2 border-dashed border-stone-800/10 bg-stone-900/5 flex flex-col items-center justify-center opacity-30">
      <Icon name="LockClosedIcon" size={16} className="text-stone-500" />
      <span className="text-[10px] font-serif mt-1 text-stone-500">
        #{String(currentPage * 8 + index + 1).padStart(3, '0')}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-[#0a0f07] flex flex-col items-center py-8 px-4 overflow-x-hidden relative">
      
      {/* 1. WOOD BACKGROUND LAYER */}
      <div className="fixed inset-0 -z-10 opacity-40"
        style={{ backgroundImage: `url("${WOOD_BG}")`, backgroundSize: '400px' }} />

      {/* 2. TOP HUD (The Gold Title Strip Logic) */}
      <div className="w-full max-w-6xl mb-6 z-20">
        <div className="relative rounded-2xl px-6 py-4 flex items-center justify-between shadow-2xl border border-[#c49050]/30"
          style={{ background: 'linear-gradient(180deg, #2a1a0f 0%, #1a0f07 100%)' }}>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-[#c49050] flex items-center justify-center bg-black">
               <Icon name="BookOpenIcon" size={20} className="text-[#c49050]" />
            </div>
            <div>
              <h1 className="font-serif italic text-amber-100 text-2xl leading-none">The Voyager's Chronicle</h1>
              <p className="text-amber-400/50 text-[10px] uppercase tracking-[0.3em] mt-1">Master Angler's Private Collection</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-amber-200 font-serif text-xl leading-none">{collectedCount} / {cards.length}</p>
              <p className="text-amber-400/40 text-[9px] uppercase tracking-widest mt-1">Specimens Found</p>
            </div>
            <Link href="/card-opening" 
              className="bg-gradient-to-br from-amber-400 to-amber-700 px-6 py-2 rounded-lg text-black font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg">
              Open Packs
            </Link>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE (Sidebar + Book) */}
      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-8 items-start justify-center">
        
        {/* LEFT SIDEBAR STATS (Restoring your 400-line logic) */}
        <div className="w-full lg:w-56 flex-shrink-0 flex flex-col gap-4 z-20">
          <div className="bg-black/60 backdrop-blur-md rounded-2xl p-5 border border-white/5 space-y-6">
            
            {/* Circular Progress */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-20 h-20 mb-2">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="45" fill="transparent" stroke="#c49050" strokeWidth="8"
                    strokeDasharray="282.7" strokeDashoffset={282.7 - (282.7 * progress) / 100}
                    strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-amber-100">{progress}%</div>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-amber-200/40">Completion</p>
            </div>

            {/* Rarity Breakdown */}
            <div className="space-y-4">
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/20 font-bold border-b border-white/5 pb-2">Catalog Stats</p>
              {RARITIES.map(r => {
                const total = cards.filter(c => c.rarity === r).length;
                const owned = cards.filter(c => c.rarity === r && c.collected).length;
                const perc = total > 0 ? (owned / total) * 100 : 0;
                return (
                  <div key={r} className="group">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-white/60 group-hover:text-white transition-colors">{r}</span>
                      <span className="text-amber-400/60">{owned}/{total}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${perc}%`, backgroundColor: RARITY_COLORS[r] }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Filters */}
            <div className="pt-2 flex flex-col gap-2">
              <button onClick={() => {setShowCollectedOnly(!showCollectedOnly); setCurrentPage(0);}}
                className={`w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all
                ${showCollectedOnly ? 'bg-[#c49050] text-black border-[#c49050]' : 'bg-transparent text-amber-200/40 border-white/10 hover:border-white/20'}`}>
                {showCollectedOnly ? '✓ Caught Only' : 'Show All'}
              </button>
            </div>
          </div>
        </div>

        {/* THE BOOK DESIGN (Mapping cards to your 2000x1400 asset) */}
        <div className="relative w-full max-w-[1100px] aspect-[2000/1400] transition-all duration-500"
          style={{ 
            backgroundImage: `url("${BOOK_DESIGN}")`, 
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: isFlipping ? 'brightness(0.7) blur(2px)' : 'none'
          }}>

          {/* LEFT PAGE GRID */}
          <div className="absolute top-[8%] left-[8%] w-[38%] h-[82%] flex flex-col p-4 lg:p-8">
            <div className="flex justify-between items-center mb-6 border-b border-stone-900/10 pb-2">
              <span className="font-serif italic text-stone-800 text-sm">{filterRarity} Specimens</span>
              <span className="text-[10px] text-stone-500 font-bold">FOLIO {currentPage * 2 + 1}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 lg:gap-6 flex-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                  {leftCards[i] ? (
                    <CardSlot card={leftCards[i]} onClick={() => setSelectedCard(leftCards[i])} />
                  ) : (
                    <EmptySlot index={i} />
                  )}
                </div>
              ))}
            </div>

            {currentPage > 0 && (
              <button onClick={() => handleFlip(-1)} className="absolute bottom-4 left-4 text-stone-800/40 hover:text-stone-800 transition-all hover:scale-110">
                <Icon name="ChevronLeftIcon" size={32} />
              </button>
            )}
          </div>

          {/* RIGHT PAGE GRID */}
          <div className="absolute top-[8%] right-[8%] w-[38%] h-[82%] flex flex-col p-4 lg:p-8">
            <div className="flex justify-between items-center mb-6 border-b border-stone-900/10 pb-2">
              <span className="text-[10px] text-stone-500 font-bold">FOLIO {currentPage * 2 + 2}</span>
              <span className="font-serif italic text-stone-800 text-sm">Voyager's Log</span>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:gap-6 flex-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="transform rotate-1 hover:rotate-0 transition-transform duration-300">
                  {rightCards[i] ? (
                    <CardSlot card={rightCards[i]} onClick={() => setSelectedCard(rightCards[i])} />
                  ) : (
                    <EmptySlot index={i + 4} />
                  )}
                </div>
              ))}
            </div>

            {currentPage < totalSpreads - 1 && (
              <button onClick={() => handleFlip(1)} className="absolute bottom-4 right-4 text-stone-800/40 hover:text-stone-800 transition-all hover:scale-110">
                <Icon name="ChevronRightIcon" size={32} />
              </button>
            )}
          </div>
        </div>

        {/* RIGHT SIDE RARITY FILTERS (Vertical floating tabs) */}
        <div className="hidden xl:flex flex-col gap-2 z-20">
            {['All', ...RARITIES].map((r) => (
                <button key={r} onClick={() => {setFilterRarity(r as any); setCurrentPage(0);}}
                    className={`w-12 h-24 rounded-r-xl border-y border-r transition-all flex items-center justify-center [writing-mode:vertical-lr] text-[10px] font-bold uppercase tracking-widest
                    ${filterRarity === r ? 'bg-amber-100 text-black border-amber-100 translate-x-2' : 'bg-black/40 text-amber-100/40 border-white/10 hover:text-amber-100'}`}>
                    {r}
                </button>
            ))}
        </div>
      </div>

      {/* 4. MODAL */}
      {selectedCard && (
        <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </div>
  );
}
