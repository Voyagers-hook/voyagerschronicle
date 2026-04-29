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

const BASE = 'https://voyagers-hook.github.io/images';
const TEX_WOOD      = `${BASE}/wood%20texture.png`;
const TEX_LEATHER   = `${BASE}/leather%20texture.png`;
const TEX_PARCHMENT = `${BASE}/parchment.png`;
const RIVET         = `${BASE}/rivet.png`;

const RARITIES: CardRarity[] = ['Widespread', 'Elusive', 'Specimen', 'Legendary'];
const RARITY_DOT: Record<string, string> = {
  Widespread: '#c49050', Elusive: '#2D6A4F', Specimen: '#3B82F6', Legendary: '#F59E0B',
};

export default function CollectionBookClient() {
  const { user, loading: authLoading } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [cards, setCards]               = useState<FishingCard[]>([]);
  const [loading, setLoading]           = useState(true);
  const [currentPage, setCurrentPage]   = useState(0);
  const [filterRarity, setFilterRarity] = useState<CardRarity | 'All'>('All');
  const [showCollectedOnly, setShowCollectedOnly] = useState(false);
  const [selectedCard, setSelectedCard] = useState<FishingCard | null>(null);
  const [isFlipping, setIsFlipping]     = useState(false);

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

  const totalSpreads   = Math.max(1, Math.ceil(filtered.length / 8));
  const spread         = filtered.slice(currentPage * 8, (currentPage + 1) * 8);
  const leftCards      = spread.slice(0, 4);
  const rightCards     = spread.slice(4, 8);
  const collectedCount = cards.filter(c => c.collected).length;
  const progress       = cards.length > 0 ? Math.round((collectedCount / cards.length) * 100) : 0;

  const flip = (dir: number) => {
    if (isFlipping) return;
    const next = currentPage + dir;
    if (next < 0 || next >= totalSpreads) return;
    setIsFlipping(true);
    setTimeout(() => { setCurrentPage(next); setIsFlipping(false); }, 300);
  };

  const EmptySlot = ({ index }: { index: number }) => (
    <div className="aspect-[750/1000] rounded-xl flex flex-col items-center justify-center gap-2"
      style={{
        border: '2px dashed rgba(139,105,20,0.25)',
        backgroundColor: 'rgba(139,105,20,0.03)',
      }}>
      <Icon name="LockClosedIcon" size={18} style={{ color: 'rgba(139,105,20,0.3)' }} />
      <span className="text-xs font-serif" style={{ color: 'rgba(139,105,20,0.3)' }}>
        #{String(currentPage * 8 + index + 1).padStart(3, '0')}
      </span>
    </div>
  );

  return (
    <>
      {/* ── FULL PAGE WOOD BACKGROUND ── */}
      <div className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url("${TEX_WOOD}")`,
          backgroundSize: '400px 400px',
          backgroundRepeat: 'repeat',
          filter: 'brightness(0.4)',
        }} />

      <div className="min-h-screen py-6 px-4 flex flex-col items-center gap-6">

        {/* ── BOOK WRAPPER ── */}
        <div className="w-full max-w-6xl">

          {/* Outer leather binding — the cover */}
          <div className="relative rounded-2xl p-4"
            style={{
              backgroundImage: `url("${TEX_LEATHER}")`,
              backgroundSize: '300px 300px',
              backgroundRepeat: 'repeat',
              backgroundColor: '#2a1a0f',
              boxShadow: '0 30px 80px rgba(0,0,0,0.9), 0 0 0 3px #1a0f07, inset 0 1px 0 rgba(255,255,255,0.05)',
            }}>

            {/* Corner rivets — positioned precisely */}
            <img src={RIVET} alt="" className="absolute top-3 left-3 w-8 h-8 z-10" style={{ opacity: 0.8 }} />
            <img src={RIVET} alt="" className="absolute top-3 right-3 w-8 h-8 z-10" style={{ opacity: 0.8 }} />
            <img src={RIVET} alt="" className="absolute bottom-3 left-3 w-8 h-8 z-10" style={{ opacity: 0.8 }} />
            <img src={RIVET} alt="" className="absolute bottom-3 right-3 w-8 h-8 z-10" style={{ opacity: 0.8 }} />

            {/* Gold title strip across top of book */}
            <div className="relative rounded-xl mb-3 px-6 py-3 flex items-center justify-between z-10"
              style={{
                background: 'linear-gradient(180deg, #a07820 0%, #7a5c14 40%, #5a420a 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 2px 8px rgba(0,0,0,0.6)',
                border: '1px solid #c49050',
              }}>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#c49050', boxShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>
                  <Icon name="BookOpenIcon" size={14} className="text-stone-900" />
                </div>
                <div>
                  <h1 className="font-serif italic text-amber-100 text-lg leading-none tracking-wide">The Voyager's Chronicle</h1>
                  <p className="text-amber-400/60 text-[9px] uppercase tracking-[0.25em] mt-0.5">Master Angler's Collection</p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="text-right">
                  <p className="text-amber-200 font-serif text-base leading-none">{collectedCount} / {cards.length}</p>
                  <p className="text-amber-400/50 text-[9px] uppercase tracking-widest mt-0.5">Catalogued</p>
                </div>
                <Link href="/card-opening"
                  className="px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest text-stone-900 transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                  Open Pack
                </Link>
              </div>
            </div>

            {/* Inner book — pages + spine */}
            <div className="flex rounded-xl overflow-hidden"
              style={{ boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)' }}>

              {/* ── LEFT SIDEBAR ── */}
              <div className="hidden lg:flex flex-col flex-shrink-0 w-48 border-r"
                style={{
                  backgroundImage: `url("${TEX_LEATHER}")`,
                  backgroundSize: '300px 300px',
                  backgroundRepeat: 'repeat',
                  backgroundColor: '#1e1208',
                  borderColor: '#3d2810',
                }}>

                {/* Progress circle */}
                <div className="flex flex-col items-center gap-2 p-5 border-b" style={{ borderColor: '#3d2810' }}>
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="26" fill="transparent" stroke="#3d2810" strokeWidth="5" />
                      <circle cx="32" cy="32" r="26" fill="transparent" stroke="#c49050" strokeWidth="5"
                        strokeDasharray={163.4}
                        strokeDashoffset={163.4 - (163.4 * progress) / 100}
                        strokeLinecap="round" className="transition-all duration-1000" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-amber-200 font-bold text-xs">{progress}%</span>
                    </div>
                  </div>
                  <p className="text-amber-200/50 text-[9px] uppercase tracking-widest text-center">Complete</p>
                </div>

                {/* Rarity breakdown */}
                <div className="p-4 space-y-3 border-b" style={{ borderColor: '#3d2810' }}>
                  <p className="text-amber-400/40 text-[8px] uppercase tracking-[0.3em]">By Rarity</p>
                  {RARITIES.map(r => {
                    const total = cards.filter(c => c.rarity === r).length;
                    const owned = cards.filter(c => c.rarity === r && c.collected).length;
                    return (
                      <div key={r} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: RARITY_DOT[r] }} />
                            <span className="text-amber-200/50 text-[10px]">{r}</span>
                          </div>
                          <span className="text-amber-200/40 text-[10px]">{owned}/{total}</span>
                        </div>
                        <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: `${RARITY_DOT[r]}20` }}>
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: total > 0 ? `${Math.round((owned / total) * 100)}%` : '0%', backgroundColor: RARITY_DOT[r] }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Filters */}
                <div className="p-4 space-y-1 flex-1">
                  <p className="text-amber-400/40 text-[8px] uppercase tracking-[0.3em] mb-2">Filter</p>
                  {(['All', ...RARITIES] as const).map(r => (
                    <button key={r}
                      onClick={() => { setFilterRarity(r as any); setCurrentPage(0); }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-2"
                      style={filterRarity === r
                        ? { backgroundColor: '#c49050', color: '#1a0f07' }
                        : { color: 'rgba(253,242,217,0.35)' }}>
                      {r !== 'All' && (
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: RARITY_DOT[r as CardRarity] }} />
                      )}
                      {r}
                    </button>
                  ))}

                  <button
                    onClick={() => { setShowCollectedOnly(!showCollectedOnly); setCurrentPage(0); }}
                    className="w-full mt-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border"
                    style={showCollectedOnly
                      ? { backgroundColor: '#c49050', color: '#1a0f07', borderColor: '#c49050' }
                      : { color: 'rgba(253,242,217,0.3)', borderColor: 'rgba(139,105,20,0.2)' }}>
                    {showCollectedOnly ? '✓ Caught Only' : 'Caught Only'}
                  </button>
                </div>
              </div>

              {/* ── LEFT PAGE ── */}
              <div className="flex-1 relative min-h-[600px]"
                style={{
                  backgroundImage: `url("${TEX_PARCHMENT}")`,
                  backgroundSize: '500px 500px',
                  backgroundRepeat: 'repeat',
                  backgroundColor: '#fdf2d9',
                  boxShadow: 'inset -20px 0 40px rgba(0,0,0,0.1)',
                }}>

                {/* Left page inner shadow from spine */}
                <div className="absolute inset-y-0 right-0 w-12 pointer-events-none"
                  style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.12), transparent)' }} />
                {/* Left page inner shadow from cover edge */}
                <div className="absolute inset-y-0 left-0 w-6 pointer-events-none"
                  style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.08), transparent)' }} />

                {/* Page header */}
                <div className="flex items-end justify-between px-6 pt-5 pb-4 border-b"
                  style={{ borderColor: 'rgba(139,105,20,0.15)' }}>
                  <p className="font-serif italic text-stone-500 text-xs">
                    Classification: <span className="text-stone-700 font-semibold">{filterRarity}</span>
                  </p>
                  <span className="font-serif italic text-stone-400 text-xs">Folio {currentPage * 2 + 1}</span>
                </div>

                {/* Cards grid */}
                <div className={`p-6 grid grid-cols-2 gap-5 transition-opacity duration-300 ${isFlipping ? 'opacity-0' : 'opacity-100'}`}>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="aspect-[750/1000] rounded-xl animate-pulse"
                        style={{ backgroundColor: 'rgba(139,105,20,0.08)' }} />
                    ))
                  ) : (
                    Array.from({ length: 4 }).map((_, i) => (
                      leftCards[i]
                        ? (
                          <div key={leftCards[i].id}
                            className="transition-all duration-300 hover:scale-105"
                            style={{ transform: 'rotate(-0.5deg)' }}
                            onMouseEnter={e => (e.currentTarget.style.transform = 'rotate(0deg) scale(1.05)')}
                            onMouseLeave={e => (e.currentTarget.style.transform = 'rotate(-0.5deg)')}>
                            <CardSlot card={leftCards[i]} onClick={() => setSelectedCard(leftCards[i])} />
                          </div>
                        )
                        : <EmptySlot key={`el-${i}`} index={i} />
                    ))
                  )}
                </div>

                {/* Previous button */}
                {currentPage > 0 && (
                  <button onClick={() => flip(-1)} disabled={isFlipping}
                    className="absolute bottom-4 left-4 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    style={{ backgroundColor: 'rgba(139,105,20,0.15)', border: '1px solid rgba(139,105,20,0.3)', color: '#8B6914' }}>
                    <Icon name="ChevronLeftIcon" size={18} />
                  </button>
                )}

                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-6 pointer-events-none"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.06), transparent)' }} />
              </div>

              {/* ── SPINE ── */}
              <div className="w-8 flex-shrink-0 relative"
                style={{
                  backgroundImage: `url("${TEX_LEATHER}")`,
                  backgroundSize: '300px 300px',
                  backgroundRepeat: 'repeat',
                  backgroundColor: '#120a04',
                  boxShadow: 'inset 0 0 20px rgba(0,0,0,0.9)',
                }}>
                {/* Spine highlight line */}
                <div className="absolute inset-y-0 left-1/2 w-px"
                  style={{ backgroundColor: 'rgba(196,144,80,0.15)' }} />
                {/* Horizontal binding bands */}
                {[20, 40, 60, 80].map(pct => (
                  <div key={pct} className="absolute w-full h-px"
                    style={{ top: `${pct}%`, backgroundColor: 'rgba(139,105,20,0.3)' }} />
                ))}
              </div>

              {/* ── RIGHT PAGE ── */}
              <div className="flex-1 relative min-h-[600px]"
                style={{
                  backgroundImage: `url("${TEX_PARCHMENT}")`,
                  backgroundSize: '500px 500px',
                  backgroundRepeat: 'repeat',
                  backgroundColor: '#f8edd0',
                  boxShadow: 'inset 20px 0 40px rgba(0,0,0,0.1)',
                }}>

                {/* Right page inner shadow from spine */}
                <div className="absolute inset-y-0 left-0 w-12 pointer-events-none"
                  style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.12), transparent)' }} />
                {/* Right page inner shadow from cover edge */}
                <div className="absolute inset-y-0 right-0 w-6 pointer-events-none"
                  style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.08), transparent)' }} />

                {/* Page header */}
                <div className="flex items-end justify-between px-6 pt-5 pb-4 border-b"
                  style={{ borderColor: 'rgba(139,105,20,0.15)' }}>
                  <p className="font-serif italic text-stone-400 text-xs">
                    Spread {currentPage + 1} of {totalSpreads}
                  </p>
                  <span className="font-serif italic text-stone-400 text-xs">Folio {currentPage * 2 + 2}</span>
                </div>

                {/* Cards grid */}
                <div className={`p-6 grid grid-cols-2 gap-5 transition-opacity duration-300 ${isFlipping ? 'opacity-0' : 'opacity-100'}`}>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="aspect-[750/1000] rounded-xl animate-pulse"
                        style={{ backgroundColor: 'rgba(139,105,20,0.08)' }} />
                    ))
                  ) : (
                    Array.from({ length: 4 }).map((_, i) => (
                      rightCards[i]
                        ? (
                          <div key={rightCards[i].id}
                            className="transition-all duration-300"
                            style={{ transform: 'rotate(0.5deg)' }}
                            onMouseEnter={e => (e.currentTarget.style.transform = 'rotate(0deg) scale(1.05)')}
                            onMouseLeave={e => (e.currentTarget.style.transform = 'rotate(0.5deg)')}>
                            <CardSlot card={rightCards[i]} onClick={() => setSelectedCard(rightCards[i])} />
                          </div>
                        )
                        : <EmptySlot key={`er-${i}`} index={i + 4} />
                    ))
                  )}
                </div>

                {/* Next button */}
                {currentPage < totalSpreads - 1 && (
                  <button onClick={() => flip(1)} disabled={isFlipping}
                    className="absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    style={{ backgroundColor: 'rgba(139,105,20,0.15)', border: '1px solid rgba(139,105,20,0.3)', color: '#8B6914' }}>
                    <Icon name="ChevronRightIcon" size={18} />
                  </button>
                )}

                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-6 pointer-events-none"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.06), transparent)' }} />
              </div>
            </div>

            {/* Bottom gold strip */}
            <div className="mt-3 rounded-lg h-3"
              style={{
                background: 'linear-gradient(180deg, #5a420a 0%, #8B6914 50%, #5a420a 100%)',
                border: '1px solid #c49050',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
              }} />
          </div>

          {/* Stacked pages effect — right edge */}
          <div className="absolute right-2 inset-y-0 pointer-events-none" style={{ zIndex: -1 }}>
            {Array.from({ length: Math.min(totalSpreads - currentPage - 1, 8) }).map((_, i) => (
              <div key={i} className="absolute inset-0 rounded-2xl"
                style={{
                  backgroundColor: i % 2 === 0 ? '#fdf2d9' : '#f0e4c0',
                  transform: `translateX(${(i + 1) * 2}px)`,
                  opacity: 1 - i * 0.12,
                  zIndex: -i - 1,
                }} />
            ))}
          </div>
        </div>

        {/* Mobile filters */}
        <div className="lg:hidden flex flex-wrap justify-center gap-2 w-full max-w-lg">
          {(['All', ...RARITIES] as const).map(r => (
            <button key={r}
              onClick={() => { setFilterRarity(r as any); setCurrentPage(0); }}
              className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all border"
              style={filterRarity === r
                ? { backgroundColor: '#c49050', color: '#1a0f07', borderColor: '#c49050' }
                : { color: 'rgba(253,242,217,0.5)', borderColor: 'rgba(139,105,20,0.3)' }}>
              {r}
            </button>
          ))}
          <button
            onClick={() => { setShowCollectedOnly(!showCollectedOnly); setCurrentPage(0); }}
            className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all border"
            style={showCollectedOnly
              ? { backgroundColor: '#c49050', color: '#1a0f07', borderColor: '#c49050' }
              : { color: 'rgba(253,242,217,0.5)', borderColor: 'rgba(139,105,20,0.3)' }}>
            {showCollectedOnly ? '✓ Caught Only' : 'Caught Only'}
          </button>
        </div>
      </div>

      {selectedCard && <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />}
    </>
  );
}
