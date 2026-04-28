'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { rarityConfig, CardRarity, FishingCard } from '@/app/card-collection/data/cardData';
import CardSlot from './CardSlot';
import CardDetailModal from './CardDetailModal';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const rarities: CardRarity[] =['Widespread', 'Elusive', 'Specimen', 'Legendary'];
const CARDS_PER_PAGE = 8;

const TEX_WOOD = 'https://voyagers-hook.github.io/images/wood%20texture.png';
const TEX_PARCHMENT = 'https://voyagers-hook.github.io/images/parchment.png';
const TEX_RIVET = 'https://voyagers-hook.github.io/images/rivet.png';
const TEX_LEATHER = 'https://voyagers-hook.github.io/images/leather%20texture.png';

export default function CollectionBookClient() {
  const { user, loading: authLoading } = useAuth();
  const supabase = useMemo(() => createClient(),[]);

  const [selectedCard, setSelectedCard] = useState<FishingCard | null>(null);
  const[filterRarity, setFilterRarity] = useState<CardRarity | 'All'>('All');
  const [showCollectedOnly, setShowCollectedOnly] = useState(false);
  const [cards, setCards] = useState<FishingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const[error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [flipDir, setFlipDir] = useState<'left' | 'right' | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    const loadCards = async () => {
      setLoading(true);
      setError(null);

      const { data: allCards, error: fetchError } = await supabase
        .from('cards')
        .select('*')
        .order('card_number', { ascending: true });

      if (fetchError || !allCards) {
        setError(fetchError?.message ?? 'Failed to load cards.');
        setLoading(false);
        return;
      }

      let collectedMap = new Map<string, string>();
      if (user) {
        const { data: userCards, error: userCardsError } = await supabase
          .from('user_cards')
          .select('card_id, collected_at')
          .eq('user_id', user.id)
          .eq('opened', true);

        if (userCardsError) {
          console.error('Failed to load user cards:', userCardsError.message);
        }

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
        stamina: c.stamina ?? 0,
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
  },[user, authLoading, supabase]);

  useEffect(() => { setCurrentPage(0); }, [filterRarity, showCollectedOnly]);

  const filtered = cards.filter(c => {
    if (filterRarity !== 'All' && c.rarity !== filterRarity) return false;
    if (showCollectedOnly && !c.collected) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / CARDS_PER_PAGE);
  const pageCards = filtered.slice(currentPage * CARDS_PER_PAGE, (currentPage + 1) * CARDS_PER_PAGE);
  const slots =[...pageCards, ...Array(Math.max(0, CARDS_PER_PAGE - pageCards.length)).fill(null)];

  const collected = cards.filter(c => c.collected).length;
  const total = cards.length;
  const progress = total > 0 ? Math.round((collected / total) * 100) : 0;

  const goToPage = (dir: 'prev' | 'next') => {
    if (isFlipping) return;

    if (dir === 'prev' && currentPage > 0) {
      setIsFlipping(true);
      setFlipDir('right');
      setTimeout(() => {
        setCurrentPage(p => p - 1);
        setFlipDir(null);
        setIsFlipping(false);
      }, 250);
    }
    if (dir === 'next' && currentPage < totalPages - 1) {
      setIsFlipping(true);
      setFlipDir('left');
      setTimeout(() => {
        setCurrentPage(p => p + 1);
        setFlipDir(null);
        setIsFlipping(false);
      }, 250);
    }
  };

  const goToPageDirect = (targetPage: number) => {
    if (isFlipping || targetPage === currentPage) return;
    setIsFlipping(true);
    setFlipDir(targetPage > currentPage ? 'left' : 'right');
    setTimeout(() => {
      setCurrentPage(targetPage);
      setFlipDir(null);
      setIsFlipping(false);
    }, 250);
  };

  const maxDots = 7;
  const dotCount = Math.min(totalPages, maxDots);
  const dotStart = Math.min(
    Math.max(0, currentPage - Math.floor(maxDots / 2)),
    Math.max(0, totalPages - maxDots)
  );

  return (
    <>
      <div className="relative rounded-2xl overflow-hidden"
        style={{
          padding: '12px',
          backgroundColor: '#5c4033', // FALLBACK BROWN
          backgroundImage: `url("${TEX_WOOD}")`,
          backgroundSize: '512px 512px',
          backgroundRepeat: 'repeat',
          boxShadow: '0 12px 50px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -2px 4px rgba(0,0,0,0.3)',
        }}>

        <div className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ boxShadow: 'inset 0 2px 0 rgba(255,220,150,0.15), inset 0 -2px 0 rgba(0,0,0,0.3), inset 2px 0 0 rgba(255,220,150,0.1), inset -2px 0 0 rgba(0,0,0,0.2)' }} />

        <div className="absolute inset-[10px] rounded-xl pointer-events-none"
          style={{ border: '2px solid rgba(196,160,74,0.5)', boxShadow: '0 0 8px rgba(196,160,74,0.2)' }} />

        <img src={TEX_RIVET} alt="" className="absolute top-1.5 left-1.5 w-8 h-8 z-20 drop-shadow-lg" />
        <img src={TEX_RIVET} alt="" className="absolute top-1.5 right-1.5 w-8 h-8 z-20 drop-shadow-lg" />
        <img src={TEX_RIVET} alt="" className="absolute bottom-1.5 left-1.5 w-8 h-8 z-20 drop-shadow-lg" />
        <img src={TEX_RIVET} alt="" className="absolute bottom-1.5 right-1.5 w-8 h-8 z-20 drop-shadow-lg" />

        <div className="relative overflow-hidden rounded-t-lg"
          style={{
            backgroundColor: '#3e2723', // FALLBACK LEATHER
            backgroundImage: `url("${TEX_LEATHER}")`,
            backgroundSize: '600px 600px',
            backgroundRepeat: 'repeat',
            borderBottom: '3px solid rgba(0,0,0,0.4)',
            boxShadow: 'inset 0 -3px 8px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.05)',
          }}>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 100%)' }} />

          <div className="relative z-10 p-5 lg:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #C4A04A, #8B6914)', boxShadow: '0 3px 10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)' }}>
                  <Icon name="BookOpenIcon" size={22} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-amber-100" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.6)' }}>
                    The Voyager&apos;s Card Album
                  </h1>
                </div>
              </div>
              <p className="text-amber-200/50 text-xs ml-14" style={{ fontStyle: 'italic' }}>
                Your personal collection of rare and legendary fishing cards
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-2.5">
              <div className="rounded-xl p-3 min-w-[170px]"
                style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(196,160,74,0.3)', boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.3)' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-amber-300/60 text-[10px] font-bold uppercase tracking-widest">Collection</span>
                  <span className="text-sm font-bold" style={{ color: '#C4A04A' }}>{collected}/{total}</span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.4)', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)' }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #8B6914, #C4A04A, #D4B84A)', boxShadow: '0 0 6px rgba(196,160,74,0.4)' }} />
                </div>
                <p className="text-amber-400/40 text-[10px] mt-1 text-right">{progress}% complete</p>
              </div>
              <Link href="/card-opening"
                className="inline-flex items-center gap-2 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-all active:scale-95"
                style={{ background: 'linear-gradient(180deg, #C4A04A 0%, #8B6914 100%)', boxShadow: '0 3px 10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
                <Icon name="GiftIcon" size={14} />
                Open a Pack
              </Link>
            </div>
          </div>

          <div className="relative z-10 px-5 pb-4 flex flex-wrap gap-2">
            {rarities.map(r => {
              const count = cards.filter(c => c.rarity === r && c.collected).length;
              const rarityTotal = cards.filter(c => c.rarity === r).length;
              return (
                <div key={r} className="rounded-lg px-2.5 py-1 flex items-center gap-1.5"
                  style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(196,160,74,0.2)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)' }}>
                  <span className={`text-[10px] font-bold ${rarityConfig[r].color}`}>{r}</span>
                  <span className="text-amber-200/30 text-[10px] font-bold">{count}/{rarityTotal}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative h-3 z-10"
          style={{
            background: 'linear-gradient(180deg, #A07818 0%, #C4A04A 30%, #D4B84A 50%, #C4A04A 70%, #8B6914 100%)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.3)',
          }}>
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0,0,0,0.15) 20px, rgba(0,0,0,0.15) 21px)' }} />
        </div>

        <div className="relative flex flex-wrap items-center gap-2 px-4 py-2.5"
          style={{
            backgroundColor: '#5c4033', // FALLBACK BROWN
            backgroundImage: `url("${TEX_WOOD}")`,
            backgroundSize: '512px 512px',
            backgroundRepeat: 'repeat',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.3)',
            borderBottom: '2px solid rgba(0,0,0,0.3)',
          }}>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.25)' }} />

          <div className="relative z-10 flex items-center gap-1 rounded-lg p-0.5"
            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(196,160,74,0.25)' }}>
            <button onClick={() => setFilterRarity('All')}
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${filterRarity === 'All' ? 'text-white' : 'text-amber-200/50 hover:text-amber-200/80'}`}
              style={filterRarity === 'All' ? { background: 'linear-gradient(180deg, #C4A04A, #8B6914)', boxShadow: '0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)', textShadow: '0 1px 2px rgba(0,0,0,0.4)' } : {}}>
              All
            </button>
            {rarities.map(r => (
              <button key={r} onClick={() => setFilterRarity(r)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${filterRarity === r ? 'text-white' : 'text-amber-200/50 hover:text-amber-200/80'}`}
                style={filterRarity === r ? { background: 'linear-gradient(180deg, #C4A04A, #8B6914)', boxShadow: '0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)', textShadow: '0 1px 2px rgba(0,0,0,0.4)' } : {}}>
                {r}
              </button>
            ))}
          </div>

          <button onClick={() => setShowCollectedOnly(!showCollectedOnly)}
            className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${showCollectedOnly ? 'text-white' : 'text-amber-200/50 hover:text-amber-200/80'}`}
            style={showCollectedOnly
              ? { background: 'linear-gradient(180deg, #C4A04A, #8B6914)', boxShadow: '0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)' }
              : { background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(196,160,74,0.25)' }}>
            <Icon name="CheckCircleIcon" size={12} />
            Collected
          </button>

          <span className="relative z-10 text-[10px] text-amber-300/30 ml-auto font-bold">
            {loading ? 'Loading...' : `${filtered.length} cards · Page ${currentPage + 1}/${Math.max(1, totalPages)}`}
          </span>
        </div>

        <div className="relative h-2 z-10"
          style={{
            background: 'linear-gradient(180deg, #8B6914 0%, #C4A04A 40%, #D4B84A 50%, #C4A04A 60%, #A07818 100%)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
          }} />

        <div className="relative overflow-hidden rounded-b-lg"
          style={{
            backgroundColor: '#f1e4c3', // FALLBACK PARCHMENT
            backgroundImage: `url("${TEX_PARCHMENT}")`,
            backgroundSize: '1024px 1024px',
            backgroundRepeat: 'repeat',
            boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.15), inset 0 -2px 8px rgba(0,0,0,0.1)',
            minHeight: '400px',
          }}>

          <div className="absolute inset-0 pointer-events-none"
            style={{ boxShadow: 'inset 8px 0 20px rgba(0,0,0,0.08), inset -8px 0 20px rgba(0,0,0,0.08), inset 0 8px 20px rgba(0,0,0,0.06)' }} />

          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-10 pointer-events-none z-10 hidden lg:block"
            style={{ background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.06), rgba(0,0,0,0.1), rgba(0,0,0,0.06), transparent)' }} />

          {error ? (
            <div className="flex flex-col items-center justify-center h-80 gap-3">
              <Icon name="ExclamationTriangleIcon" size={48} style={{ color: '#B45309' }} />
              <p className="text-lg font-bold" style={{ color: '#8B7040' }}>Something went wrong</p>
              <p className="text-sm" style={{ color: '#A08050', fontStyle: 'italic' }}>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 rounded-lg text-xs font-bold text-white"
                style={{ background: 'linear-gradient(180deg, #C4A04A 0%, #8B6914 100%)' }}>
                Retry
              </button>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-80">
              <div className="text-center">
                <Icon name="ArrowPathIcon" size={36} className="animate-spin mx-auto mb-3" style={{ color: '#A08050' }} />
                <p className="text-sm font-bold" style={{ color: '#A08050' }}>Opening the album...</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-80 gap-3">
              <Icon name="BookOpenIcon" size={48} style={{ color: '#C4A882' }} />
              <p className="text-2xl font-bold" style={{ color: '#8B7040' }}>No cards to show</p>
              <p className="text-sm" style={{ color: '#A08050', fontStyle: 'italic' }}>
                Try adjusting your filters or open a pack!
              </p>
            </div>
          ) : (
            <div className="relative p-5 lg:p-8 transition-all duration-250"
              style={{ opacity: flipDir ? 0 : 1, transform: flipDir === 'left' ? 'translateX(-16px)' : flipDir === 'right' ? 'translateX(16px)' : 'translateX(0)' }}>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-5">
                {slots.map((card, idx) => (
                  card ? (
                    <CardSlot key={card.id} card={card} onClick={() => setSelectedCard(card)} />
                  ) : (
                    <div key={`empty-${idx}`}
                      className="rounded-xl relative overflow-hidden"
                      style={{
                        aspectRatio: '750 / 1000',
                        border: '2px dashed rgba(160,128,80,0.25)',
                        background: 'rgba(0,0,0,0.03)',
                        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.04)',
                      }}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon name="LockClosedIcon" size={20} style={{ color: 'rgba(160,128,80,0.2)' }} />
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="relative z-10 px-5 lg:px-8 pb-5 flex items-center justify-between">
              <button onClick={() => goToPage('prev')} disabled={currentPage === 0 || isFlipping}
                className="flex items-center gap-1.5 font-bold text-xs px-4 py-2 rounded-lg transition-all disabled:opacity-25 disabled:cursor-not-allowed active:scale-95"
                style={{
                  background: 'linear-gradient(180deg, #C4A04A 0%, #8B6914 100%)',
                  color: '#fff',
                  boxShadow: '0 3px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                }}>
                <Icon name="ChevronLeftIcon" size={14} />
                Prev
              </button>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: dotCount }).map((_, i) => {
                    const pageIndex = dotStart + i;
                    const isActive = pageIndex === currentPage;
                    return (
                      <button key={pageIndex}
                        onClick={() => goToPageDirect(pageIndex)}
                        disabled={isFlipping}
                        className="rounded-full transition-all"
                        style={{
                          width: isActive ? 20 : 8,
                          height: 8,
                          backgroundColor: isActive ? '#C4A04A' : 'rgba(160,128,80,0.3)',
                          boxShadow: isActive ? '0 0 6px rgba(196,160,74,0.4)' : 'none',
                        }} />
                    );
                  })}
                </div>
                <span className="text-[11px] font-bold" style={{ color: '#A08050' }}>
                  Page {currentPage + 1} of {Math.max(1, totalPages)}
                </span>
              </div>

              <button onClick={() => goToPage('next')} disabled={currentPage >= totalPages - 1 || isFlipping}
                className="flex items-center gap-1.5 font-bold text-xs px-4 py-2 rounded-lg transition-all disabled:opacity-25 disabled:cursor-not-allowed active:scale-95"
                style={{
                  background: 'linear-gradient(180deg, #C4A04A 0%, #8B6914 100%)',
                  color: '#fff',
                  boxShadow: '0 3px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                }}>
                Next
                <Icon name="ChevronRightIcon" size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedCard && (
        <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </>
  );
}
