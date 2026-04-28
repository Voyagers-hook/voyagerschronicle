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
      setTimeout(() => { setCurrentPage(p => p - 1); setFlipDir(null); }, 250);
    }
    if (dir === 'next' && currentPage < totalPages - 1) {
      setFlipDir('left');
      setTimeout(() => { setCurrentPage(p => p + 1); setFlipDir(null); }, 250);
    }
  };

  return (
    <>
      {/* ── Leather Cover / Header ── */}
      <div className="relative overflow-hidden rounded-t-3xl p-6 lg:p-8"
        style={{
          background: 'linear-gradient(145deg, #3E2116 0%, #5C3520 30%, #6B3A22 50%, #4A2818 100%)',
          borderBottom: '4px solid #2A1508',
          boxShadow: 'inset 0 2px 20px rgba(0,0,0,0.4), inset 0 -2px 10px rgba(0,0,0,0.3)',
        }}>
        {/* Leather texture overlay */}
        <div className="absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

        {/* Gold foil decorative corners */}
        <div className="absolute top-3 left-3 w-12 h-12 opacity-20"
          style={{ borderTop: '2px solid #C4A04A', borderLeft: '2px solid #C4A04A', borderTopLeftRadius: '8px' }} />
        <div className="absolute top-3 right-3 w-12 h-12 opacity-20"
          style={{ borderTop: '2px solid #C4A04A', borderRight: '2px solid #C4A04A', borderTopRightRadius: '8px' }} />
        <div className="absolute bottom-3 left-3 w-12 h-12 opacity-20"
          style={{ borderBottom: '2px solid #C4A04A', borderLeft: '2px solid #C4A04A', borderBottomLeftRadius: '8px' }} />
        <div className="absolute bottom-3 right-3 w-12 h-12 opacity-20"
          style={{ borderBottom: '2px solid #C4A04A', borderRight: '2px solid #C4A04A', borderBottomRightRadius: '8px' }} />

        {/* Spine stitching left edge */}
        <div className="absolute left-4 top-6 bottom-6 w-px opacity-30"
          style={{ backgroundImage: 'repeating-linear-gradient(to bottom, #C4A04A 0px, #C4A04A 8px, transparent 8px, transparent 16px)' }} />
        <div className="absolute left-6 top-6 bottom-6 w-px opacity-20"
          style={{ backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 4px, #C4A04A 4px, #C4A04A 12px, transparent 12px, transparent 16px)' }} />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 ml-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #C4A04A, #8B6914)', boxShadow: '0 2px 8px rgba(139,105,20,0.4)' }}>
                <Icon name="BookOpenIcon" size={26} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl text-amber-100" style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                  The Voyager&apos;s
                </h1>
                <h1 className="text-3xl lg:text-4xl" style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 700, color: '#C4A04A', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                  Card Album
                </h1>
              </div>
            </div>
            <p className="text-amber-200/60 text-sm max-w-md" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
              A personal collection of rare and legendary fishing cards, bound in leather and chronicled with care.
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-3">
            <div className="rounded-2xl p-4 min-w-[180px]"
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(196,160,74,0.3)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-300/70 text-xs font-semibold uppercase tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>Collection</span>
                <span className="text-lg font-bold" style={{ color: '#C4A04A', fontFamily: 'Georgia, serif' }}>{collected}/{total}</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(196,160,74,0.15)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #8B6914, #C4A04A, #D4B84A)' }} />
              </div>
              <p className="text-amber-400/50 text-xs mt-1.5 text-right" style={{ fontFamily: 'Georgia, serif' }}>{progress}% complete</p>
            </div>
            <Link href="/card-opening"
              className="inline-flex items-center gap-2 text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-card transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #8B6914, #C4A04A)', boxShadow: '0 4px 16px rgba(139,105,20,0.4)' }}>
              <Icon name="GiftIcon" size={16} />
              Open a Pack
            </Link>
          </div>
        </div>

        {/* Rarity counters */}
        <div className="relative z-10 mt-5 flex flex-wrap gap-2 ml-6">
          {rarities.map(r => {
            const count = cards.filter(c => c.rarity === r && c.collected).length;
            const rarityTotal = cards.filter(c => c.rarity === r).length;
            return (
              <div key={r} className="rounded-xl px-3 py-1.5 flex items-center gap-2"
                style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(196,160,74,0.2)' }}>
                <span className={`text-xs font-bold ${rarityConfig[r].color}`}>{r}</span>
                <span className="text-amber-200/40 text-xs">{count}/{rarityTotal}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Filters — styled as a bookmark ribbon ── */}
      <div className="flex flex-wrap items-center gap-3 mb-0 px-4 py-3 rounded-none"
        style={{ background: 'linear-gradient(to bottom, #2A1508, #3E2116)', borderBottom: '2px solid #C4A04A20' }}>
        <div className="flex items-center gap-1 rounded-xl p-1"
          style={{ background: 'rgba(196,160,74,0.1)', border: '1px solid rgba(196,160,74,0.2)' }}>
          <button onClick={() => setFilterRarity('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterRarity === 'All' ? 'text-white' : 'text-amber-300/60 hover:text-amber-200'}`}
            style={filterRarity === 'All' ? { background: 'linear-gradient(135deg, #8B6914, #C4A04A)' } : {}}>All</button>
          {rarities.map(r => (
            <button key={r} onClick={() => setFilterRarity(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterRarity === r ? 'text-white' : 'text-amber-300/60 hover:text-amber-200'}`}
              style={filterRarity === r ? { background: 'linear-gradient(135deg, #8B6914, #C4A04A)' } : {}}>{r}</button>
          ))}
        </div>
        <button onClick={() => setShowCollectedOnly(!showCollectedOnly)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${showCollectedOnly ? 'text-white' : 'text-amber-300/60'}`}
          style={showCollectedOnly
            ? { background: 'linear-gradient(135deg, #8B6914, #C4A04A)' }
            : { border: '1px solid rgba(196,160,74,0.2)' }}>
          <Icon name="CheckCircleIcon" size={14} />
          Collected Only
        </button>
        <span className="text-xs text-amber-400/40 ml-auto" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
          {loading ? 'Loading...' : `${filtered.length} cards · Page ${currentPage + 1} of ${Math.max(1, totalPages)}`}
        </span>
      </div>

      {/* ── The Book Pages ── */}
      <div className="relative overflow-hidden rounded-b-3xl"
        style={{
          background: 'linear-gradient(170deg, #F5EDDF 0%, #EDE0CB 30%, #E8D8BC 60%, #F0E5D2 100%)',
          border: '2px solid #C4A882',
          borderTop: 'none',
          boxShadow: '0 8px 40px rgba(0,0,0,0.25), inset 0 2px 30px rgba(139,105,20,0.08)',
        }}>

        {/* Aged paper texture */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")` }} />

        {/* Coffee stain watermark */}
        <div className="absolute top-12 right-16 w-40 h-40 rounded-full opacity-[0.03] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #8B6914 0%, transparent 70%)' }} />
        <div className="absolute bottom-20 left-10 w-24 h-24 rounded-full opacity-[0.025] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #5C3520 0%, transparent 70%)' }} />

        {/* Page edge shadow (book spine) */}
        <div className="absolute inset-y-0 left-0 w-8 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to right, rgba(139,105,20,0.12), transparent)' }} />
        <div className="absolute inset-y-0 right-0 w-4 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to left, rgba(139,105,20,0.08), transparent)' }} />

        {/* Center spine fold */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.04), rgba(0,0,0,0.08), rgba(0,0,0,0.04))' }} />

        {/* Faint ruled lines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{ backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 39px, #8B6914 39px, #8B6914 40px)', backgroundSize: '100% 40px' }} />

        {loading ? (
          <div className="flex items-center justify-center h-80">
            <div className="text-center">
              <Icon name="ArrowPathIcon" size={40} className="animate-spin mx-auto mb-3" style={{ color: '#C4A882' }} />
              <p className="text-sm" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#a08040' }}>
                Opening the album...
              </p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 gap-3">
            <Icon name="BookOpenIcon" size={48} style={{ color: '#C4A882' }} />
            <p className="text-2xl" style={{ fontFamily: 'Georgia, serif', color: '#a08040' }}>No cards to show</p>
            <p className="text-sm" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#b8a070' }}>
              Try adjusting your filters or open a pack!
            </p>
          </div>
        ) : (
          <div className="relative p-6 lg:p-10 transition-all duration-250"
            style={{ opacity: flipDir ? 0 : 1, transform: flipDir === 'left' ? 'translateX(-20px)' : flipDir === 'right' ? 'translateX(20px)' : 'translateX(0)' }}>

            {/* Page number header */}
            <div className="flex items-center justify-center mb-6 gap-4">
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, #C4A88260, transparent)' }} />
              <p className="text-xs tracking-[0.3em] uppercase" style={{ fontFamily: 'Georgia, serif', color: '#a08040' }}>
                Page {currentPage + 1}
              </p>
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, #C4A88260, transparent)' }} />
            </div>

            {/* Card grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6">
              {slots.map((card, idx) => (
                card ? (
                  <CardSlot key={card.id} card={card} onClick={() => setSelectedCard(card)} />
                ) : (
                  <div key={`empty-${idx}`}
                    className="rounded-2xl border-2 border-dashed relative overflow-hidden"
                    style={{ aspectRatio: '750 / 1000', borderColor: '#C4A88240' }}>
                    {/* Empty slot cross-hatch */}
                    <div className="absolute inset-0 opacity-[0.03]"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%238B6914' fill-opacity='1'%3E%3Cpath d='M0 0h1v20H0zM10 0h1v20h-1z'/%3E%3C/g%3E%3C/svg%3E")` }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Icon name="LockClosedIcon" size={16} style={{ color: '#C4A88240' }} />
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>

            {/* Bottom page flourish */}
            <div className="flex items-center justify-center mt-8 gap-3">
              <div className="w-8 h-px" style={{ backgroundColor: '#C4A88240' }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#C4A88240' }} />
              <div className="w-8 h-px" style={{ backgroundColor: '#C4A88240' }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Page Navigation — styled as vintage book controls ── */}
      <div className="flex items-center justify-between mt-5 px-2">
        <button onClick={() => goToPage('prev')} disabled={currentPage === 0}
          className="flex items-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            fontFamily: 'Georgia, serif',
            border: '1px solid #C4A88260',
            color: '#8B6914',
            background: 'linear-gradient(to bottom, #F5EDDF, #EDE0CB)',
            boxShadow: '0 2px 6px rgba(139,105,20,0.1)',
          }}>
          <Icon name="ChevronLeftIcon" size={16} />
          Previous Page
        </button>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
            const isActive = i === currentPage;
            return (
              <button key={i}
                onClick={() => { setFlipDir(i > currentPage ? 'left' : 'right'); setTimeout(() => { setCurrentPage(i); setFlipDir(null); }, 250); }}
                className="rounded-full transition-all"
                style={{ width: isActive ? 20 : 8, height: 8, backgroundColor: isActive ? '#C4A04A' : '#C4A88240' }} />
            );
          })}
        </div>

        <button onClick={() => goToPage('next')} disabled={currentPage >= totalPages - 1}
          className="flex items-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            fontFamily: 'Georgia, serif',
            border: '1px solid #C4A88260',
            color: '#8B6914',
            background: 'linear-gradient(to bottom, #F5EDDF, #EDE0CB)',
            boxShadow: '0 2px 6px rgba(139,105,20,0.1)',
          }}>
          Next Page
          <Icon name="ChevronRightIcon" size={16} />
        </button>
      </div>
      <p className="text-center text-xs mt-2" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#a08040' }}>
        Page {currentPage + 1} of {Math.max(1, totalPages)}
      </p>

      {selectedCard && (
        <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </>
  );
}
