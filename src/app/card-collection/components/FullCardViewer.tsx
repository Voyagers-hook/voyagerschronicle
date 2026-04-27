'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FishingCard, rarityConfig } from '@/app/card-collection/data/cardData';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const CARD_BACK = 'https://raw.githubusercontent.com/Voyagers-hook/images/main/chronicle%20card%20back.png';

const rarityGlow: Record<string, string> = {
  Widespread: 'rgba(196,144,80,0.6)',
  Elusive:    'rgba(45,106,79,0.7)',
  Specimen:   'rgba(59,130,246,0.8)',
  Legendary:  'rgba(245,158,11,0.9)',
};

interface FullCardViewerProps {
  card: FishingCard;
  onClose: () => void;
}

function StatBox({ label, value, color, icon }: { label: string; value: number | undefined; color: string; icon: string }) {
  return (
    <div className="bg-white/80 rounded-2xl p-3 border border-adventure-border">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon name={icon as any} size={12} style={{ color }} />
        <span className="text-xs font-sans font-semibold text-earth-500">{label}</span>
      </div>
      <p className="font-display text-2xl font-bold" style={{ color }}>{value ?? '—'}</p>
      <div className="h-1.5 rounded-full mt-1 overflow-hidden bg-earth-100">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value ?? 0}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function FullCardViewer({ card, onClose }: FullCardViewerProps) {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();
  const [flipped, setFlipped] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [listing, setListing] = useState(false);
  const [alreadyListed, setAlreadyListed] = useState(false);
  const isShiny = card.rarity === 'Specimen' || card.rarity === 'Legendary';

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (flipped) {
      const t = setTimeout(() => setShowStats(true), 500);
      return () => clearTimeout(t);
    } else {
      setShowStats(false);
    }
  }, [flipped]);

  // Check if already listed
  useEffect(() => {
    if (!user || !card.id) return;
    const checkListing = async () => {
      const { data } = await supabase
        .from('trade_listings')
        .select('id')
        .eq('user_id', user.id)
        .eq('card_id', card.id)
        .limit(1);
      if (data && data.length > 0) setAlreadyListed(true);
    };
    checkListing();
  }, [user, card.id]);

  const handleClose = () => {
    setMounted(false);
    setTimeout(onClose, 200);
  };

  const handleListForTrade = async () => {
    if (!user || !card.id || listing) return;
    setListing(true);

    // Get the user_card_id for this card
    const { data: userCard } = await supabase
      .from('user_cards')
      .select('id')
      .eq('user_id', user.id)
      .eq('card_id', card.id)
      .eq('opened', true)
      .limit(1)
      .single();

    if (!userCard) {
      setListing(false);
      return;
    }

    const { error } = await supabase.from('trade_listings').insert({
      user_id: user.id,
      user_card_id: userCard.id,
      card_id: card.id,
    });

    setListing(false);

    if (error) {
      console.error('Error listing card:', error);
      return;
    }

    handleClose();
    router.push('/trading?listed=true');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 overflow-y-auto"
      style={{
        backgroundColor: `rgba(0,0,0,${mounted ? 0.82 : 0})`,
        backdropFilter: mounted ? 'blur(8px)' : 'none',
        transition: 'background-color 0.25s, backdrop-filter 0.25s',
      }}
      onClick={handleClose}
    >
      <button
        onClick={handleClose}
        className="fixed top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
      >
        <Icon name="XMarkIcon" size={20} />
      </button>

      <div
        className="flex flex-col items-center gap-4 w-full"
        style={{
          maxWidth: 320,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.25s, transform 0.25s',
        }}
        onClick={e => e.stopPropagation()}
      >
        <p className="text-white/50 text-xs font-sans tracking-wide">
          {flipped ? 'Tap card to flip back' : 'Tap card to see details'}
        </p>

        <div
          className="relative w-full cursor-pointer"
          style={{
            aspectRatio: '750 / 1000',
            perspective: '1200px',
            filter: `drop-shadow(0 0 ${isShiny ? 40 : 24}px ${rarityGlow[card.rarity]})`,
          }}
          onClick={() => setFlipped(f => !f)}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              transformStyle: 'preserve-3d',
              transition: 'transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* FRONT */}
            <div
              className="absolute inset-0 rounded-3xl overflow-hidden"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            >
              {card.image ? (
                <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
                  <Icon name="SparklesIcon" size={60} className="text-white/40" />
                </div>
              )}
              {card.rarity === 'Legendary' && (
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(135deg, rgba(255,0,128,0.2) 0%, rgba(255,165,0,0.2) 25%, rgba(255,255,0,0.2) 50%, rgba(0,255,128,0.2) 75%, rgba(0,128,255,0.2) 100%)', backgroundSize: '300% 300%', animation: 'legendaryRainbow 3s ease infinite', mixBlendMode: 'overlay' }} />
              )}
              {card.rarity === 'Specimen' && (
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(135deg, rgba(147,197,253,0.25) 0%, rgba(196,181,253,0.25) 50%, rgba(167,243,208,0.25) 100%)', backgroundSize: '200% 200%', animation: 'specimenHolo 4s ease infinite', mixBlendMode: 'overlay' }} />
              )}
              <div className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ border: `3px solid ${card.borderColor}` }} />
            </div>

            {/* BACK */}
            <div
              className="absolute inset-0 rounded-3xl overflow-hidden"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <div style={{ width: '100%', height: '100%', transform: 'scaleX(-1)' }}>
                <img src={CARD_BACK} alt="Card back" className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ border: `3px solid ${card.borderColor}` }} />
            </div>
          </div>
        </div>

        {/* STATS PANEL */}
        <div
          className="w-full rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.97)',
            border: `2px solid ${card.borderColor}44`,
            opacity: showStats ? 1 : 0,
            transform: showStats ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.35s ease, transform 0.35s ease',
            pointerEvents: showStats ? 'auto' : 'none',
          }}
        >
          <div className="p-4 flex items-center gap-3 border-b border-adventure-border"
            style={{ background: `linear-gradient(135deg, ${card.borderColor}15, ${card.borderColor}30)` }}>
            <div className="flex-1">
              <p className="font-display text-lg text-primary-800">{card.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: card.borderColor }}>{card.rarity}</span>
                {card.habitat && (
                  <span className="text-xs font-sans text-earth-500 flex items-center gap-1">
                    <Icon name="MapPinIcon" size={11} />{card.habitat}
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs font-sans text-earth-400">
              #{String(card.cardNumber).padStart(3, '0')} / {String(card.totalCards).padStart(3, '0')}
            </span>
          </div>

          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <StatBox label="Power"   value={card.power}   color="#ef4444" icon="BoltIcon" />
              <StatBox label="Energy"  value={card.stamina} color="#3B82F6" icon="HeartIcon" />
              <StatBox label="Stealth" value={card.stealth} color="#2D6A4F" icon="EyeSlashIcon" />
              <StatBox label="Beauty"  value={card.beauty}  color="#ec4899" icon="SparklesIcon" />
            </div>

            {(card.hp || card.cardLevel) && (
              <div className="grid grid-cols-2 gap-2">
                {card.hp && (
                  <div className="bg-adventure-bg rounded-2xl p-3 border border-adventure-border text-center">
                    <p className="text-xs font-sans text-earth-400 uppercase tracking-wide mb-1">HP</p>
                    <p className="font-display text-xl text-primary-800">{card.hp}</p>
                  </div>
                )}
                {card.cardLevel && (
                  <div className="bg-adventure-bg rounded-2xl p-3 border border-adventure-border text-center">
                    <p className="text-xs font-sans text-earth-400 uppercase tracking-wide mb-1">Card Level</p>
                    <p className="font-display text-xl text-primary-800">{card.cardLevel}</p>
                  </div>
                )}
              </div>
            )}

            {card.description && (
              <div className="bg-adventure-bg rounded-2xl p-3 border border-adventure-border">
                <p className="text-xs font-sans font-bold text-earth-400 uppercase tracking-widest mb-2">Description</p>
                <p className="text-sm font-sans text-primary-700 leading-relaxed">{card.description}</p>
              </div>
            )}

            {card.hint && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3">
                <p className="text-xs font-sans font-bold text-amber-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                  <Icon name="LightBulbIcon" size={11} /> Hint
                </p>
                <p className="text-sm font-sans text-amber-800 italic leading-relaxed">"{card.hint}"</p>
              </div>
            )}

            {card.collectedDate && (
              <p className="text-xs font-sans text-earth-400 text-center">Collected {card.collectedDate}</p>
            )}

            {/* Trade button — only show if card is collected */}
            {card.collected && (
              <button
                onClick={handleListForTrade}
                disabled={listing || alreadyListed}
                className="w-full py-3 rounded-2xl text-white font-sans font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #2D6A4F, #3D9068)' }}
              >
                <Icon name="ArrowsRightLeftIcon" size={16} />
                {alreadyListed ? 'Already Listed for Trade' : listing ? 'Listing...' : 'List for Trade'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
