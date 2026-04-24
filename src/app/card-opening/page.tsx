'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type Phase = 'loading' | 'empty' | 'idle' | 'shaking' | 'ripping' | 'revealing' | 'card-flip' | 'done';

interface PendingCard {
  user_card_id: string;
  card_id: string;
  name: string;
  species: string;
  rarity: string;
  power: number;
  energy: number;
  beauty: number;
  stealth: number;
  image_url: string | null;
  gradient: string;
  border_color: string;
  foil: boolean;
  flipped: boolean;
  glowing: boolean;
}

const RARITY_COLORS: Record<string, string> = {
  Widespread: 'text-earth-500',
  Elusive:    'text-green-600',
  Specimen:   'text-blue-600',
  Legendary:  'text-amber-500',
};

export default function CardOpeningPage() {
  const supabase = createClient();
  const [phase, setPhase] = useState<Phase>('loading');
  const [pendingCards, setPendingCards] = useState<PendingCard[]>([]);
  const [revealedCards, setRevealedCards] = useState<PendingCard[]>([]);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string; size: number }[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Load unopened cards for this user
  useEffect(() => {
    const loadPending = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setPhase('empty'); return; }

      const { data, error } = await supabase
        .from('user_cards')
        .select(`
          id,
          card_id,
          opened,
          cards (
            name, species, rarity, power, energy, beauty, stealth,
            image_url, gradient, border_color, foil
          )
        `)
        .eq('user_id', user.id)
        .eq('opened', false)
        .order('collected_at', { ascending: true });

      if (error || !data || data.length === 0) {
        setPhase('empty');
        return;
      }

      const cards: PendingCard[] = data.map((row: any) => ({
        user_card_id: row.id,
        card_id: row.card_id,
        name: row.cards.name,
        species: row.cards.species,
        rarity: row.cards.rarity,
        power: row.cards.power,
        energy: row.cards.energy,
        beauty: row.cards.beauty,
        stealth: row.cards.stealth,
        image_url: row.cards.image_url,
        gradient: row.cards.gradient || 'from-blue-400 via-cyan-300 to-teal-400',
        border_color: row.cards.border_color || '#3B82F6',
        foil: row.cards.foil || false,
        flipped: false,
        glowing: false,
      }));

      setPendingCards(cards);
      setPhase('idle');
    };

    loadPending();
  }, []);

  const generateParticles = (count: number) => {
    if (!mounted) return [];
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: 20 + Math.floor(i * 37 % 60),
      y: 10 + Math.floor(i * 53 % 80),
      color: ['#ff751f', '#2D6A4F', '#F5C842', '#3B82F6', '#8B5CF6', '#EF4444'][i % 6],
      size: 4 + (i % 4) * 2,
    }));
  };

  const startOpening = () => {
    setPhase('shaking');
    setTimeout(() => {
      setPhase('ripping');
      setTimeout(() => {
        setPhase('revealing');
        setParticles(generateParticles(30));
        revealNextCard(0);
      }, 800);
    }, 1000);
  };

  const revealNextCard = (index: number) => {
    if (index >= pendingCards.length) { setPhase('done'); return; }
    setPhase('card-flip');
    const card: PendingCard = { ...pendingCards[index], flipped: false, glowing: false };
    setRevealedCards(prev => [...prev, card]);

    setTimeout(() => {
      setRevealedCards(prev => prev.map((c, i) => i === prev.length - 1 ? { ...c, flipped: true } : c));
      setTimeout(() => {
        setRevealedCards(prev => prev.map((c, i) => i === prev.length - 1 ? { ...c, glowing: true } : c));
        if (index < pendingCards.length - 1) {
          setTimeout(() => revealNextCard(index + 1), 1200);
        } else {
          setTimeout(() => setPhase('done'), 1200);
        }
      }, 600);
    }, 800);
  };

  // Mark all opened cards as opened=true in DB
  const markAsOpened = async () => {
    const ids = pendingCards.map(c => c.user_card_id);
    await supabase.from('user_cards').update({ opened: true }).in('id', ids);
  };

  const handleDone = async () => {
    await markAsOpened();
  };

  // Mark opened when phase hits done
  useEffect(() => {
    if (phase === 'done') { markAsOpened(); }
  }, [phase]);

  return (
    <AppLayout currentPath="/card-opening">
      <div className="min-h-[80vh] flex flex-col items-center justify-center fade-in">

        <div className="text-center mb-8">
          <h1 className="font-display text-4xl lg:text-5xl text-primary-800 mb-2">Open a Pack</h1>
          {phase !== 'loading' && phase !== 'empty' && (
            <p className="text-earth-400 font-sans text-sm">{pendingCards.length} card{pendingCards.length !== 1 ? 's' : ''} waiting for you</p>
          )}
        </div>

        {/* LOADING */}
        {phase === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <Icon name="ArrowPathIcon" size={40} className="animate-spin text-orange-500" />
            <p className="text-earth-400 font-sans text-sm">Checking for cards...</p>
          </div>
        )}

        {/* EMPTY — no cards sent yet */}
        {phase === 'empty' && (
          <div className="flex flex-col items-center gap-6 text-center max-w-sm">
            <div className="w-24 h-24 rounded-3xl bg-primary-50 border-2 border-dashed border-primary-200 flex items-center justify-center">
              <Icon name="GiftIcon" size={40} className="text-primary-300" />
            </div>
            <div>
              <h2 className="font-display text-2xl text-primary-800 mb-2">No Cards Yet</h2>
              <p className="text-earth-400 font-sans text-sm leading-relaxed">
                You don't have any cards waiting to be opened. Cards will appear here when the shop sends them to you!
              </p>
            </div>
            <Link href="/card-collection"
              className="inline-flex items-center gap-2 bg-white border border-adventure-border text-primary-700 font-sans font-semibold text-sm px-6 py-3 rounded-xl shadow-card transition-all hover:bg-primary-50">
              <Icon name="BookOpenIcon" size={16} />
              View My Collection
            </Link>
          </div>
        )}

        {/* IDLE — pack waiting */}
        {phase === 'idle' && (
          <div className="flex flex-col items-center gap-8">
            <div
              className="relative w-48 h-64 rounded-3xl overflow-hidden shadow-panel cursor-pointer hover:scale-105 transition-transform duration-300 active:scale-95"
              onClick={startOpening}
              style={{ background: 'linear-gradient(135deg, #1A3D28, #2D6A4F, #3D9068)' }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-1">
                  <Icon name="GiftIcon" size={36} className="text-white" />
                </div>
                <p className="font-display text-white text-xl text-center">Voyager Pack</p>
                <p className="text-primary-200 text-xs font-sans text-center">
                  {pendingCards.length} card{pendingCards.length !== 1 ? 's' : ''} inside
                </p>
                <div className="mt-2 rounded-full px-4 py-1.5" style={{ backgroundColor: 'rgba(255,117,31,0.3)', border: '1px solid rgba(255,117,31,0.5)' }}>
                  <span className="text-white text-xs font-sans font-bold">TAP TO OPEN</span>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
            </div>
            <p className="text-earth-400 font-sans text-sm">Tap the pack to reveal your cards!</p>
          </div>
        )}

        {/* SHAKING */}
        {phase === 'shaking' && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-48 h-64 rounded-3xl shadow-panel flex flex-col items-center justify-center gap-3"
              style={{ background: 'linear-gradient(135deg, #1A3D28, #2D6A4F, #3D9068)', animation: 'packShake 0.15s ease infinite' }}>
              <Icon name="GiftIcon" size={48} className="text-white" />
              <p className="font-display text-white text-xl">Voyager Pack</p>
            </div>
            <p className="font-display text-2xl text-primary-700 animate-pulse">Shaking the pack...</p>
          </div>
        )}

        {/* RIPPING */}
        {phase === 'ripping' && (
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-48 h-64">
              <div className="absolute inset-0 rounded-3xl"
                style={{ background: 'linear-gradient(135deg, #1A3D28, #2D6A4F)', clipPath: 'polygon(0 0, 100% 0, 100% 45%, 60% 50%, 100% 55%, 100% 100%, 0 100%)', animation: 'ripTop 0.4s ease forwards' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon name="SparklesIcon" size={40} className="text-white/60" />
                </div>
              </div>
            </div>
            <p className="font-display text-2xl text-amber-600 animate-pulse">Ripping open...</p>
          </div>
        )}

        {/* REVEALING / CARD-FLIP / DONE */}
        {(phase === 'revealing' || phase === 'card-flip' || phase === 'done') && (
          <div className="w-full max-w-3xl">
            {/* Particles */}
            {particles.length > 0 && (
              <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
                {particles.map(p => (
                  <div key={p.id} className="absolute rounded-full"
                    style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, backgroundColor: p.color, animation: `particleFall ${1.5 + (p.id % 3) * 0.5}s ease-out forwards`, animationDelay: `${(p.id % 5) * 0.1}s` }} />
                ))}
              </div>
            )}

            {/* Cards row */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              {revealedCards.map((card, idx) => (
                <div key={card.user_card_id + idx} className="relative" style={{ perspective: '800px' }}>
                  <div className="w-36 h-52 rounded-2xl transition-all duration-700"
                    style={{ transformStyle: 'preserve-3d', transform: card.flipped ? 'rotateY(0deg)' : 'rotateY(180deg)' }}>
                    {/* Back */}
                    <div className="absolute inset-0 rounded-2xl flex items-center justify-center"
                      style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'linear-gradient(135deg, #1A3D28, #2D6A4F)', border: '2px solid #3D9068' }}>
                      <Icon name="SparklesIcon" size={32} className="text-white/40" />
                    </div>
                    {/* Front */}
                    <div className="absolute inset-0 rounded-2xl overflow-hidden flex flex-col"
                      style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', border: `2px solid ${card.border_color}`, boxShadow: card.glowing ? `0 0 30px 8px ${card.border_color}80` : 'none', transition: 'box-shadow 0.5s ease' }}>
                      <div className={`bg-gradient-to-br ${card.gradient} flex-1 flex flex-col items-center justify-center p-3 relative`}>
                        {card.foil && (
                          <div className="absolute inset-0 opacity-40 pointer-events-none"
                            style={{ background: 'linear-gradient(135deg, transparent 20%, rgba(255,255,255,0.7) 50%, transparent 80%)', animation: 'foilShimmer 2s ease infinite' }} />
                        )}
                        {card.image_url ? (
                          <div className="absolute inset-0 w-full h-full">
                            <img src={card.image_url} alt={card.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-2">
                            <Icon name="SparklesIcon" size={22} className="text-white/80" />
                          </div>
                        )}
                        <p className="text-white font-display text-sm text-center leading-tight drop-shadow relative z-10">{card.name}</p>
                      </div>
                      <div className="bg-white px-2 py-1.5">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-sans font-bold ${RARITY_COLORS[card.rarity] || 'text-gray-500'}`}>{card.rarity}</span>
                          <span className="text-xs font-sans text-red-500 font-semibold">P:{card.power}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {card.flipped && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-xs font-sans font-bold px-3 py-1 rounded-full shadow-badge animate-bounce" style={{ backgroundColor: '#ff751f' }}>
                      NEW!
                    </div>
                  )}
                </div>
              ))}

              {/* Placeholder slots for unrevealed */}
              {Array.from({ length: pendingCards.length - revealedCards.length }).map((_, i) => (
                <div key={`placeholder-${i}`} className="w-36 h-52 rounded-2xl border-2 border-dashed border-primary-300 flex items-center justify-center"
                  style={{ background: 'rgba(45,106,79,0.05)' }}>
                  <Icon name="LockClosedIcon" size={24} className="text-primary-200" />
                </div>
              ))}
            </div>

            {phase === 'done' && (
              <div className="text-center space-y-4 fade-in">
                <p className="font-display text-3xl text-primary-800">Pack Opened!</p>
                <p className="text-earth-400 font-sans text-sm">You received {revealedCards.length} new card{revealedCards.length !== 1 ? 's' : ''}!</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href="/card-collection"
                    className="inline-flex items-center gap-2 text-white font-sans font-semibold text-sm px-6 py-3 rounded-xl shadow-card transition-all duration-150 active:scale-95"
                    style={{ backgroundColor: '#ff751f' }}>
                    <Icon name="BookOpenIcon" size={16} />
                    View My Collection
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
