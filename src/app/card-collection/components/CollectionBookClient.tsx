'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { rarityConfig, CardRarity, FishingCard } from '@/app/card-collection/data/cardData';
import CardSlot from './CardSlot';
import CardDetailModal from './CardDetailModal';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Define the shape of your Supabase table row for type safety
interface SupabaseCard {
  id: string;
  card_number: number;
  total_cards?: number;
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

const rarities: CardRarity[] = ['Widespread', 'Elusive', 'Specimen', 'Legendary'];
const CARDS_PER_PAGE = 8;

const TEX_WOOD = 'https://voyagers-hook.github.io/images/wood%20texture.png';
const TEX_PARCHMENT = 'https://voyagers-hook.github.io/images/parchment.png';
const TEX_RIVET = 'https://voyagers-hook.github.io/images/rivet.png';
const TEX_LEATHER = 'https://voyagers-hook.github.io/images/leather%20texture.png';

export default function CollectionBookClient() {
  const { user, loading: authLoading } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [selectedCard, setSelectedCard] = useState<FishingCard | null>(null);
  const [filterRarity, setFilterRarity] = useState<CardRarity | 'All'>('All');
  const [showCollectedOnly, setShowCollectedOnly] = useState(false);
  const [cards, setCards] = useState<FishingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  // --- DATA LOADING LOGIC ---
  useEffect(() => {
    if (authLoading) return;

    const loadCards = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: allCards, error: fetchError } = await supabase
          .from('cards')
          .select('*')
          .order('card_number', { ascending: true });

        if (fetchError) throw fetchError;
        if (!allCards) return;

        let collectedMap = new Map<string, string>();
        if (user) {
          const { data: userCards, error: userCardsError } = await supabase
            .from('user_cards')
            .select('card_id, collected_at')
            .eq('user_id', user.id)
            .eq('opened', true);

          if (userCardsError) console.error('Failed to load user cards:', userCardsError.message);
          else if (userCards) {
            userCards.forEach((uc: any) => collectedMap.set(uc.card_id, uc.collected_at));
          }
        }

        const mapped: FishingCard[] = (allCards as SupabaseCard[]).map((c) => ({
          id: c.id,
          cardNumber: c.card_number,
          totalCards: c.total_cards ?? allCards.length,
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
            ? new Date(collectedMap.get(c.id)!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            : undefined,
        }));

        setCards(mapped);
      } catch (err: any) {
        setError(err.message ?? 'Failed to load album data.');
      } finally {
        setLoading(false);
      }
    };

    loadCards();
  }, [user, authLoading, supabase]);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(0); }, [filterRarity, showCollectedOnly]);

  // --- DERIVED STATE ---
  const filtered = useMemo(() => {
    return cards.filter(c => {
      if (filterRarity !== 'All' && c.rarity !== filterRarity) return false;
      if (showCollectedOnly && !c.collected) return false;
      return true;
    });
  }, [cards, filterRarity, showCollectedOnly]);

  const totalPages = Math.ceil(filtered.length / CARDS_PER_PAGE);
  const pageCards = filtered.slice(currentPage * CARDS_PER_PAGE, (currentPage + 1) * CARDS_PER_PAGE);
  const slots = [...pageCards, ...Array(Math.max(0, CARDS_PER_PAGE - pageCards.length)).fill(null)];

  const collectedCount = cards.filter(c => c.collected).length;
  const progress = cards.length > 0 ? Math.round((collectedCount / cards.length) * 100) : 0;

  // --- ACTIONS ---
  const handlePageFlip = (dir: 'next' | 'prev') => {
    if (isFlipping) return;
    if (dir === 'next' && currentPage < totalPages - 1) {
      setIsFlipping(true);
      setTimeout(() => { setCurrentPage(p => p + 1); setIsFlipping(false); }, 300);
    } else if (dir === 'prev' && currentPage > 0) {
      setIsFlipping(true);
      setTimeout(() => { setCurrentPage(p => p - 1); setIsFlipping(false); }, 300);
    }
  };

  return (
    <div className="max-w-6xl mx-auto my-12 p-4">
      {/* 1. THE WOOD TABLE (Outer Case) */}
      <div className="relative p-6 sm:p-10 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)]"
        style={{
          backgroundImage: `url("${TEX_WOOD}")`,
          backgroundSize: '400px',
          backgroundColor: '#3d2b1f'
        }}>
        
        {/* Interior Wood Shadow */}
        <div className="absolute inset-0 rounded-[3rem] shadow-[inset_0_2px_15px_rgba(255,255,255,0.1),inset_0_-2px_15px_rgba(0,0,0,0.5)] pointer-events-none" />

        {/* 2. THE LEATHER COVER (Book Binding) */}
        <div className="relative rounded-[2rem] p-3 sm:p-5 shadow-[0_0_60px_rgba(0,0,0,0.8)]"
          style={{
            backgroundImage: `url("${TEX_LEATHER}")`,
            backgroundSize: '500px',
            backgroundColor: '#2d1b10',
          }}>
          
          {/* Rivets at the corners */}
          <img src={TEX_RIVET} className="absolute top-6 left-6 w-8 h-8 drop-shadow-md z-30" alt="" />
          <img src={TEX_RIVET} className="absolute top-6 right-6 w-8 h-8 drop-shadow-md z-30" alt="" />
          <img src={TEX_RIVET} className="absolute bottom-6 left-6 w-8 h-8 drop-shadow-md z-30" alt="" />
          <img src={TEX_RIVET} className="absolute bottom-6 right-6 w-8 h-8 drop-shadow-md z-30" alt="" />

          {/* 3. THE PARCHMENT PAGES */}
          <div className="relative min-h-[750px] rounded-xl overflow-hidden border-l-8 border-black/30 shadow-[inset_0_0_80px_rgba(0,0,0,0.3)]"
            style={{
              backgroundColor: '#f2e6d0',
              backgroundImage: `radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.15) 100%), url("${TEX_PARCHMENT}")`,
              backgroundSize: 'cover, 900px',
            }}>
            
            {/* THE SPINE FOLD (Creates 3D book look) */}
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-20 z-20 pointer-events-none hidden lg:block"
              style={{
                background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.08) 35%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.08) 65%, transparent)',
              }} />

            {/* HEADER AREA */}
            <div className="relative z-10 px-8 py-10 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-black/10">
              <div className="text-center md:text-left">
                <h1 className="text-4xl lg:text-5xl font-serif font-bold text-stone-900 italic tracking-tight">
                  Voyager&apos;s Collection
                </h1>
                <p className="text-stone-600 font-serif italic mt-1 text-lg">Volume I: The Deep Waters</p>
                <div className="mt-4 flex items-center gap-3">
                    <div className="w-32 h-2 bg-stone-300 rounded-full overflow-hidden border border-black/5">
                        <div className="h-full bg-amber-800" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-xs font-bold text-stone-700 uppercase tracking-widest">{progress}% Discovered</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                {['All', ...rarities].map(r => (
                  <button key={r} onClick={() => setFilterRarity(r as any)}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${filterRarity === r ? 'bg-amber-900 border-amber-900 text-amber-100 shadow-lg' : 'border-stone-400/30 text-stone-700 hover:bg-stone-800/5'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* MAIN CONTENT (Card Grid) */}
            <div className={`relative z-10 p-8 lg:p-12 transition-all duration-300 ${isFlipping ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              {loading ? (
                 <div className="flex flex-col items-center justify-center h-80 gap-4">
                    <Icon name="ArrowPathIcon" size={40} className="animate-spin text-stone-400" />
                    <span className="font-serif italic text-stone-500">Turning pages...</span>
                 </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-80 text-center">
                    <Icon name="ExclamationCircleIcon" size={48} className="text-red-800/50 mb-2" />
                    <p className="font-serif italic text-stone-800">{error}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
                  {slots.map((card, idx) => (
                    <div key={card?.id || `empty-${idx}`} className="relative group">
                      {/* Inner Shadow for "Inserted" Look */}
                      <div className="absolute -inset-1 bg-black/10 rounded-xl blur-sm opacity-50 pointer-events-none" />
                      
                      {card ? (
                        <CardSlot card={card} onClick={() => setSelectedCard(card)} />
                      ) : (
                        <div className="aspect-[3/4] rounded-xl border-2 border-dashed border-stone-400/40 flex items-center justify-center bg-stone-900/5 transition-colors group-hover:bg-stone-900/10">
                          <Icon name="LockClosedIcon" size={28} className="text-stone-400/30" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* BOOK FOOTER (Navigation) */}
            <div className="absolute bottom-0 inset-x-0 p-8 flex items-center justify-between border-t border-black/5 bg-gradient-to-t from-black/5 to-transparent">
               <button 
                disabled={currentPage === 0 || isFlipping}
                onClick={() => handlePageFlip('prev')}
                className="group flex items-center gap-2 font-serif italic text-stone-800 disabled:opacity-20 transition-all">
                <Icon name="ChevronLeftIcon" size={24} className="group-hover:-translate-x-1 transition-transform" />
                <span className="uppercase tracking-tighter text-sm font-bold">Previous Folio</span>
              </button>

              <div className="hidden sm:flex flex-col items-center">
                <div className="flex gap-1.5 mb-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentPage ? 'w-6 bg-amber-900' : 'w-1.5 bg-stone-400'}`} />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.3em]">
                  Entry {currentPage + 1} of {Math.max(1, totalPages)}
                </span>
              </div>

              <button 
                disabled={currentPage >= totalPages - 1 || isFlipping}
                onClick={() => handlePageFlip('next')}
                className="group flex items-center gap-2 font-serif italic text-stone-800 disabled:opacity-20 transition-all">
                <span className="uppercase tracking-tighter text-sm font-bold">Next Folio</span>
                <Icon name="ChevronRightIcon" size={24} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action for Pack Opening */}
      <div className="mt-8 text-center">
        <Link href="/card-opening" className="inline-flex items-center gap-3 px-8 py-4 bg-amber-900 text-amber-100 rounded-full font-bold shadow-xl hover:bg-amber-800 hover:-translate-y-1 transition-all active:scale-95">
            <Icon name="GiftIcon" size={20} />
            Obtain More Specimens
        </Link>
      </div>

      {selectedCard && (
        <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </div>
  );
}
