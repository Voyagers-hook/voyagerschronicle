'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { rarityConfig, CardRarity, FishingCard } from '@/app/card-collection/data/cardData';
import CardSlot from './CardSlot';
import CardDetailModal from './CardDetailModal';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SupabaseCard {
  id: string; card_number: number; name: string; species: string; rarity: string;
  image_url?: string; power?: number; stealth?: number; energy?: number; beauty?: number;
  hp?: number; card_level?: number; habitat?: string; description?: string;
  hint?: string; fact?: string; foil?: boolean; gradient?: string; border_color?: string;
  drop_rate?: number; points_value?: number;
}

const TEX_LEATHER  = 'https://voyagers-hook.github.io/images/leather%20texture.png';
const TEX_PARCHMENT = 'https://voyagers-hook.github.io/images/parchment.png';
const TEX_WOOD     = 'https://voyagers-hook.github.io/images/wood%20texture.png';
const TEX_RIVET    = 'https://voyagers-hook.github.io/images/rivet.png';

const RARITIES: CardRarity[] = ['Widespread', 'Elusive', 'Specimen', 'Legendary'];
const RARITY_DOT: Record<string, string> = {
  Widespread: '#c49050', Elusive: '#2D6A4F', Specimen: '#3B82F6', Legendary: '#F59E0B',
};
const CARDS_PER_SPREAD = 8; // 4 per page

export default function CollectionBookClient() {
  const { user, loading: authLoading } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [cards, setCards]             = useState<FishingCard[]>([]);
  const [loading, setLoading]         = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [filterRarity, setFilterRarity] = useState<CardRarity | 'All'>('All');
  const [showCollectedOnly, setShowCollectedOnly] = useState(false);
  const [selectedCard, setSelectedCard] = useState<FishingCard | null>(null);
  const [isFlipping, setIsFlipping]   = useState(false);

  useEffect(() => {
    if (authLoading) return;
    const load = async () => {
      setLoading(true);
      const { data: allCards } = await supabase.from('cards').select('*').order('card_number', { ascending: true });
      if (!allCards) { setLoading(false); return; }

      let collectedMap = new Map<string, string>();
      if (user) {
        const { data: userCards } = await supabase
          .from('user_cards').select('card_id, collected_at')
          .eq('user_id', user.id).eq('opened', true);
        if (userCards) userCards.forEach((uc: any) => collectedMap.set(uc.card_id, uc.collected_at));
      }

      setCards((allCards as SupabaseCard[]).map(c => ({
        id: c.id, cardNumber: c.card_number, totalCards: allCards.length,
        name: c.name, species: c.species, rarity: c.rarity as CardRarity,
        image: c.image_url, power: c.power ?? 0, stealth: c.stealth ?? 0,
        stamina: c.energy ?? 0, energy: c.energy ?? 0, beauty: c.beauty ?? 0,
        hp: c.hp, cardLevel: c.card_level, habitat: c.habitat ?? '',
        description: c.description ?? '', hint: c.hint, fact: c.fact,
        foil: c.foil ?? false,
        gradient: c.gradient ?? 'from-blue-400 via-cyan-300 to-teal-400',
        borderColor: c.border_color ?? '#3B82F6',
        dropRate: c.drop_rate, pointsValue: c.points_value,
        collected: collectedMap.has(c.id),
        collectedDate: collectedMap.has(c.id)
          ? new Date(collectedMap.get(c.id)!).toLocaleDateString('en-GB') : undefined,
      })));
      setLoading(false);
    };
    load();
  }, [user, authLoading, supabase]);

  const filtered = useMemo(() => cards.filter(c => {
    if (filterRarity !== 'All' && c.rarity !== filterRarity) return false;
    if (showCollectedOnly && !c.collected) return false;
    return true;
  }), [cards, filterRarity, showCollectedOnly]);

  const totalSpreads   = Math.max(1, Math.ceil(filtered.length / CARDS_PER_SPREAD));
  const spread         = filtered.slice(currentPage * CARDS_PER_SPREAD, (currentPage + 1) * CARDS_PER_SPREAD);
  const leftCards      = spread.slice(0, 4);
  const rightCards     = spread.slice(4, 8);
  const collectedCount = cards.filter(c => c.collected).length;
  const progress       = cards.length > 0 ? Math.round((collectedCount / cards.length) * 100) : 0;

  const rarityBreakdown = RARITIES.map(r => ({
    r, total: cards.filter(c => c.rarity === r).length,
    owned: cards.filter(c => c.rarity === r && c.collected).length,
  }));

  const flip = (dir: number) => {
    if (isFlipping) return;
    const next = currentPage + dir;
    if (next < 0 || next >= totalSpreads) return;
    setIsFlipping(true);
    setTimeout(() => { setCurrentPage(next); setIsFlipping(false); }, 350);
  };

  // ── Page slot renderer ─────────────────────────────────────────────────────
  const PageSlots = ({ pageCards, side }: { pageCards: FishingCard[]; side: 'left' | 'right' }) => (
    <div className="grid grid-cols-2 gap-5 lg:gap-7">
      {Array.from({ length: 4 }).map((_, i) => {
        const card = pageCards[i];
        const slotNum = currentPage * CARDS_PER_SPREAD + (side === 'left' ? i : i + 4) + 1;
        if (card) {
          return (
            <div key={card.id}
              className={`group relative transition-all duration-500 hover:scale-105 ${side === 'left' ? '-rotate-1 hover:rotate-0' : 'rotate-1 hover:rotate-0'}`}>
              <CardSlot card={card} onClick={() => setSelectedCard(card)} />
            </div>
          );
        }
        return (
          <div key={`empty-${i}`}
            className="aspect-[750/1000] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 opacity-30"
            style={{ borderColor: '#8B6914', backgroundColor: 'rgba(139,105,20,0.05)' }}>
            <Icon name="LockClosedIcon" size={20} style={{ color: '#8B6914' }} />
            <span className="text-xs font-serif" style={{ color: '#8B6914' }}>#{String(slotNum).padStart(3, '0')}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen py-8 px-2 lg:px-6 flex flex-col items-center"
      style={{ background: '#0e0906', backgroundImage: `url("${TEX_WOOD}")`, backgroundSize: '600px', boxShadow: 'inset 0 0 300px rgba(0,0,0,0.9)' }}>

      {/* ── OUTER BOOK SHELL ── */}
      <div className="relative w-full max-w-[1400px]">

        {/* Stacked pages effect (right side) */}
        <div className="absolute right-1 top-2 bottom-2 w-full rounded-[2rem] opacity-40"
          style={{ background: '#fdf2d9', transform: 'translateX(6px)' }} />
        <div className="absolute right-1 top-4 bottom-4 w-full rounded-[2rem] opacity-30"
          style={{ background: '#f5e8c0', transform: 'translateX(12px)' }} />

        {/* Leather binding shell */}
        <div className="relative rounded-[2rem] shadow-[0_60px_120px_-10px_rgba(0,0,0,0.9)] overflow-hidden"
          style={{ backgroundImage: `url("${TEX_LEATHER}")`, backgroundSize: '500px', backgroundColor: '#2a1a0f', border: '3px solid #1a0f07' }}>

          {/* Corner rivets */}
          {[['top-4 left-4', 'tl'], ['top-4 right-4', 'tr'], ['bottom-4 left-4', 'bl'], ['bottom-4 right-4', 'br']].map(([pos, key]) => (
            <div key={key} className={`absolute ${pos} w-8 h-8 rounded-full border-2 z-30 flex items-center justify-center`}
              style={{ borderColor: '#8B6914', backgroundColor: '#3d2810', boxShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#c49050' }} />
            </div>
          ))}

          {/* Gold title bar */}
          <div className="relative flex items-center justify-between px-8 py-4 z-20"
            style={{ background: 'linear-gradient(180deg, #8B6914 0%, #5a420a 50%, #3d2c06 100%)', borderBottom: '2px solid #c49050' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#c49050' }}>
                <Icon name="BookOpenIcon" size={16} className="text-stone-900" />
              </div>
              <div>
                <h1 className="font-serif italic text-amber-100 text-xl tracking-wide leading-none">The Voyager's Chronicle</h1>
                <p className="text-amber-400/60 text-[10px] uppercase tracking-[0.3em]">Master Angler's Collection</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-amber-200 font-serif italic text-lg">{collectedCount}/{cards.length}</p>
                <p className="text-amber-400/50 text-[10px] uppercase tracking-widest">Collected</p>
              </div>
              <Link href="/card-opening"
                className="px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest text-stone-900 transition-all hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', boxShadow: '0 4px 12px rgba(245,158,11,0.4)' }}>
                Open Pack
              </Link>
            </div>
          </div>

          {/* Main book body */}
          <div className="flex">

            {/* ── LEFT SIDEBAR ── */}
            <div className="hidden lg:flex flex-col w-56 flex-shrink-0 border-r z-20 p-5 gap-5"
              style={{ background: 'rgba(20,12,5,0.85)', borderColor: '#3d2810', backdropFilter: 'blur(4px)' }}>

              {/* Progress ring */}
              <div className="flex flex-col items-center gap-3 py-4 border-b" style={{ borderColor: '#3d2810' }}>
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="transparent" stroke="#3d2810" strokeWidth="6" />
                    <circle cx="40" cy="40" r="34" fill="transparent" stroke="#c49050" strokeWidth="6"
                      strokeDasharray={213.6} strokeDashoffset={213.6 - (213.6 * progress) / 100}
                      className="transition-all duration-1000" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-amber-200 font-bold text-sm">{progress}%</span>
                  </div>
                </div>
                <p className="text-amber-200/70 text-[10px] uppercase tracking-widest text-center">Album Complete</p>
              </div>

              {/* Rarity breakdown */}
              <div className="space-y-3">
                <p className="text-amber-400/50 text-[9px] uppercase tracking-[0.3em]">By Rarity</p>
                {rarityBreakdown.map(({ r, total, owned }) => (
                  <div key={r} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: RARITY_DOT[r] }} />
                        <span className="text-amber-200/60 text-[10px] font-semibold">{r}</span>
                      </div>
                      <span className="text-amber-200/50 text-[10px]">{owned}/{total}</span>
                    </div>
                    <div className="h-1 rounded-full" style={{ backgroundColor: `${RARITY_DOT[r]}20` }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: total > 0 ? `${Math.round((owned / total) * 100)}%` : '0%', backgroundColor: RARITY_DOT[r] }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Filters */}
              <div className="space-y-2 border-t pt-4" style={{ borderColor: '#3d2810' }}>
                <p className="text-amber-400/50 text-[9px] uppercase tracking-[0.3em]">Filter by Rarity</p>
                {['All', ...RARITIES].map(r => (
                  <button key={r} onClick={() => { setFilterRarity(r as any); setCurrentPage(0); }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wide transition-all flex items-center gap-2 ${filterRarity === r ? 'text-stone-900' : 'text-amber-200/40 hover:text-amber-200/80'}`}
                    style={filterRarity === r ? { backgroundColor: '#c49050' } : {}}>
                    {r !== 'All' && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: RARITY_DOT[r] }} />}
                    {r}
                  </button>
                ))}
              </div>

              {/* Collected only toggle */}
              <button onClick={() => { setShowCollectedOnly(!showCollectedOnly); setCurrentPage(0); }}
                className={`w-full py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all border ${showCollectedOnly ? 'text-stone-900 border-amber-400' : 'text-amber-200/40 border-white/5 hover:border-white/10'}`}
                style={showCollectedOnly ? { backgroundColor: '#c49050' } : {}}>
                {showCollectedOnly ? 'Show All' : 'Caught Only'}
              </button>
            </div>

            {/* ── BOOK PAGES ── */}
            <div className="flex-1 flex min-h-0">

              {/* LEFT PAGE */}
              <div className="flex-1 relative overflow-hidden"
                style={{ backgroundImage: `url("${TEX_PARCHMENT}")`, backgroundSize: '900px', backgroundColor: '#fdf2d9', boxShadow: 'inset -30px 0 60px rgba(0,0,0,0.12)' }}>

                {/* Page vignette */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.08) 100%)' }} />

                {/* Page header */}
                <div className="flex items-end justify-between px-8 pt-7 pb-5 border-b" style={{ borderColor: 'rgba(139,105,20,0.2)' }}>
                  <div>
                    <p className="font-serif italic text-stone-600 text-xs uppercase tracking-[0.2em]">Classification: {filterRarity}</p>
                  </div>
                  <span className="font-serif italic text-stone-400 text-xs">Folio {currentPage * 2 + 1}</span>
                </div>

                <div className={`p-8 transition-opacity duration-300 ${isFlipping ? 'opacity-0' : 'opacity-100'}`}>
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="w-8 h-8 border-2 border-amber-600/30 border-t-amber-600 rounded-full animate-spin" />
                    </div>
                  ) : (
                    <PageSlots pageCards={leftCards} side="left" />
                  )}
                </div>

                {/* Previous page arrow — bottom left */}
                <div className="absolute bottom-6 left-6">
                  <button onClick={() => flip(-1)} disabled={currentPage === 0 || isFlipping}
                    className="w-12 h-12 rounded-full border flex items-center justify-center transition-all disabled:opacity-0 hover:scale-110 active:scale-95"
                    style={{ borderColor: 'rgba(139,105,20,0.3)', backgroundColor: 'rgba(139,105,20,0.08)', color: '#8B6914' }}>
                    <Icon name="ChevronLeftIcon" size={22} />
                  </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-black/10 to-transparent" />
              </div>

              {/* ── SPINE ── */}
              <div className="w-10 lg:w-14 flex-shrink-0 relative z-10"
                style={{ backgroundImage: `url("${TEX_LEATHER}")`, backgroundSize: '200px', backgroundColor: '#1a0f07', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)' }}>
                <div className="absolute inset-y-0 left-1/2 w-px bg-amber-900/20" />
                {[25, 50, 75].map(pct => (
                  <div key={pct} className="absolute w-full h-px" style={{ top: `${pct}%`, backgroundColor: 'rgba(139,105,20,0.2)' }} />
                ))}
              </div>

              {/* RIGHT PAGE */}
              <div className="flex-1 relative overflow-hidden"
                style={{ backgroundImage: `url("${TEX_PARCHMENT}")`, backgroundSize: '900px', backgroundColor: '#fdf2d9', boxShadow: 'inset 30px 0 60px rgba(0,0,0,0.12)' }}>

                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.08) 100%)' }} />

                {/* Page header */}
                <div className="flex items-end justify-between px-8 pt-7 pb-5 border-b" style={{ borderColor: 'rgba(139,105,20,0.2)' }}>
                  <p className="font-serif italic text-stone-400 text-xs">Spread {currentPage + 1} of {totalSpreads}</p>
                  <span className="font-serif italic text-stone-400 text-xs">Folio {currentPage * 2 + 2}</span>
                </div>

                <div className={`p-8 transition-opacity duration-300 ${isFlipping ? 'opacity-0' : 'opacity-100'}`}>
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="w-8 h-8 border-2 border-amber-600/30 border-t-amber-600 rounded-full animate-spin" />
                    </div>
                  ) : (
                    <PageSlots pageCards={rightCards} side="right" />
                  )}
                </div>

                {/* Next page arrow — bottom right */}
                <div className="absolute bottom-6 right-6">
                  <button onClick={() => flip(1)} disabled={currentPage >= totalSpreads - 1 || isFlipping}
                    className="w-12 h-12 rounded-full border flex items-center justify-center transition-all disabled:opacity-0 hover:scale-110 active:scale-95"
                    style={{ borderColor: 'rgba(139,105,20,0.3)', backgroundColor: 'rgba(139,105,20,0.08)', color: '#8B6914' }}>
                    <Icon name="ChevronRightIcon" size={22} />
                  </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-black/10 to-transparent" />
              </div>
            </div>
          </div>

          {/* Bottom gold bar */}
          <div className="h-4 border-t" style={{ background: 'linear-gradient(180deg, #3d2c06 0%, #5a420a 50%, #8B6914 100%)', borderColor: '#c49050' }} />
        </div>

        {/* Stacked page effect labels */}
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-40">
          {Array.from({ length: Math.min(totalSpreads - currentPage - 1, 6) }).map((_, i) => (
            <div key={i} className="h-1 rounded-full" style={{ width: `${8 - i}px`, backgroundColor: '#fdf2d9' }} />
          ))}
        </div>
      </div>

      {/* Mobile filters (shown below on small screens) */}
      <div className="lg:hidden mt-6 flex flex-wrap justify-center gap-2">
        {['All', ...RARITIES].map(r => (
          <button key={r} onClick={() => { setFilterRarity(r as any); setCurrentPage(0); }}
            className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all border ${filterRarity === r ? 'text-stone-900 border-amber-400' : 'text-amber-100/40 border-white/10'}`}
            style={filterRarity === r ? { backgroundColor: '#c49050' } : {}}>
            {r}
          </button>
        ))}
      </div>

      {selectedCard && <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />}
    </div>
  );
}
