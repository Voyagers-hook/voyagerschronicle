'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FishingCard, rarityConfig } from '@/app/card-collection/data/cardData';
import Icon from '@/components/ui/AppIcon';

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
  const [flipped, setFlipped] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [mounted, setMounted] = useState(false);
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

  const handleClose = () => {
    setMounted(false);
    setTimeout(onClose, 200);
  };

  const handleTrade = () => {
    handleClose();
    router.push(`/trading?offer=${card.id}&name=${encodeURIComponent(card.name)}`);
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
      {/* Close button */}
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
        {/* Hint text */}
        <p className="text-white/50 text-xs font-sans tracking-wide">
          {flipped ? 'Tap card to flip back' : 'Tap card to see details'}
        </p>

        {/* Card — 750/1000 ratio */}
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
            {/* ── FRONT — card face ── */}
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
              <div className="absolute top-3 left-3 z-10">
                <span className="text-white text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: `${card.borderColor}cc` }}>{card.rarity}</span>
              </div>
              <div className="absolute top-3 right-3 z-10">
                <span className="text-white/60 text-xs font-sans font-bold">#{String(card.cardNumber).padStart(3, '0')}</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 z-10"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)' }}>
                <p className="font-display text-xl text-white drop-shadow">{card.name}</p>
                <p className="text-white/60 text-xs font-sans">{card.species}</p>
              </div>
              <div className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ border: `3px solid ${card.borderColor}` }} />
            </div>

            {/* ── BACK — card back image, NOT mirrored ── */}
            <div
              className="absolute inset-0 rounded-3xl overflow-hidden"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg) scaleX(-1)',
              }}
            >
              <img
                src={CARD_BACK}
                alt="Card back"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ border: `3px solid ${card.borderColor}` }} />
            </div>
          </div>
        </div>

        {/* ── STATS PANEL — slides up after flip ── */}
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
          {/* Header */}
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
            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              <StatBox label="Power"   value={card.power}   color="#ef4444" icon="BoltIcon"     />
              <StatBox label="Energy"  value={card.stamina} color="#3B82F6" icon="HeartIcon"    />
              <StatBox label="Stealth" value={card.stealth} color="#2D6A4F" icon="EyeSlashIcon" />
              <StatBox label="Beauty"  value={card.beauty}  color="#ec4899" icon="SparklesIcon" />
            </div>

            {/* HP + Card Level */}
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

            {/* Description */}
            {card.description && (
              <div className="bg-adventure-bg rounded-2xl p-3 border border-adventure-border">
                <p className="text-xs font-sans font-bold text-earth-400 uppercase tracking-widest mb-2">Description</p>
                <p className="text-sm font-sans text-primary-700 leading-relaxed">{card.description}</p>
              </div>
            )}

            {/* Hint */}
            {card.hint && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3">
                <p className="text-xs font-sans font-bold text-amber-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                  <Icon name="LightBulbIcon" size={11} /> Hint
                </p>
                <p className="text-sm font-sans text-amber-800 italic leading-relaxed">"{card.hint}"</p>
              </div>
            )}

            {/* Collected date */}
            {card.collectedDate && (
              <p className="text-xs font-sans text-earth-400 text-center">Collected {card.collectedDate}</p>
            )}

            {/* Trade button */}
            <button
              onClick={handleTrade}
              className="w-full py-3 rounded-2xl text-white font-sans font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #2D6A4F, #3D9068)' }}
            >
              <Icon name="ArrowsRightLeftIcon" size={16} />
              Offer for Trade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
