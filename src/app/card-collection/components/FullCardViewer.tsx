'use client';

import React, { useState, useEffect } from 'react';
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

export default function FullCardViewer({ card, onClose }: FullCardViewerProps) {
  const [flipped, setFlipped] = useState(false);
  const [mounted, setMounted] = useState(false);
  const rarity = rarityConfig[card.rarity];
  const isShiny = card.rarity === 'Specimen' || card.rarity === 'Legendary';

  // Animate in
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setMounted(false);
    setTimeout(onClose, 200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: `rgba(0,0,0,${mounted ? 0.75 : 0})`,
        backdropFilter: mounted ? 'blur(8px)' : 'blur(0px)',
        transition: 'background-color 0.2s, backdrop-filter 0.2s',
      }}
      onClick={handleClose}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
      >
        <Icon name="XMarkIcon" size={20} />
      </button>

      {/* Hint text */}
      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-xs font-sans tracking-wide whitespace-nowrap">
        {flipped ? 'Tap card to flip back' : 'Tap card to see details'}
      </p>

      {/* Card container — 750x1000 ratio */}
      <div
        className="relative cursor-pointer"
        style={{
          width: 'min(340px, 85vw)',
          aspectRatio: '750 / 1000',
          perspective: '1200px',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'scale(1)' : 'scale(0.85)',
          transition: 'opacity 0.25s, transform 0.25s',
        }}
        onClick={e => { e.stopPropagation(); setFlipped(f => !f); }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            filter: `drop-shadow(0 0 ${isShiny ? 40 : 20}px ${rarityGlow[card.rarity]})`,
          }}
        >
          {/* ── FRONT — card face or card back ── */}
          <div
            className="absolute inset-0 rounded-3xl overflow-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {card.collected ? (
              // Collected card front
              <div
                className="w-full h-full rounded-3xl overflow-hidden flex flex-col relative"
                style={{
                  border: `3px solid ${card.borderColor}`,
                  background: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))`,
                }}
              >
                <div className={`bg-gradient-to-br ${card.gradient} flex-1 relative overflow-hidden`}>
                  {/* Legendary shimmer */}
                  {card.rarity === 'Legendary' && (
                    <>
                      <div className="absolute inset-0 pointer-events-none"
                        style={{ background: 'linear-gradient(135deg, rgba(255,0,128,0.25) 0%, rgba(255,165,0,0.25) 20%, rgba(255,255,0,0.25) 40%, rgba(0,255,128,0.25) 60%, rgba(0,128,255,0.25) 80%, rgba(128,0,255,0.25) 100%)', backgroundSize: '300% 300%', animation: 'legendaryRainbow 3s ease infinite', mixBlendMode: 'overlay' }} />
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-yellow-300 opacity-80 animate-ping" style={{ animationDuration: '1.5s' }} />
                    </>
                  )}
                  {/* Specimen shimmer */}
                  {card.rarity === 'Specimen' && (
                    <div className="absolute inset-0 pointer-events-none"
                      style={{ background: 'linear-gradient(135deg, rgba(147,197,253,0.3) 0%, rgba(196,181,253,0.3) 50%, rgba(167,243,208,0.3) 100%)', backgroundSize: '200% 200%', animation: 'specimenHolo 4s ease infinite', mixBlendMode: 'overlay' }} />
                  )}
                  {/* Card image */}
                  {card.image ? (
                    <>
                      <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon name="SparklesIcon" size={60} className="text-white/40" />
                    </div>
                  )}
                  {/* Card name overlay at bottom of image */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="font-display text-2xl text-white drop-shadow-lg">{card.name}</p>
                    <p className="text-white/70 text-sm font-sans">{card.species}</p>
                  </div>
                  {/* Rarity badge top left */}
                  <div className="absolute top-3 left-3">
                    <span className="text-white text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${card.borderColor}cc` }}>
                      {card.rarity}
                    </span>
                  </div>
                  {/* Card number top right */}
                  <div className="absolute top-3 right-3">
                    <span className="text-white/60 text-xs font-sans font-bold">#{String(card.cardNumber).padStart(3, '0')}</span>
                  </div>
                </div>
              </div>
            ) : (
              // Uncollected — show card back on front face
              <img src={CARD_BACK} alt="Undiscovered card" className="w-full h-full object-cover rounded-3xl" />
            )}
          </div>

          {/* ── BACK — stats/hint panel ── */}
          <div
            className="absolute inset-0 rounded-3xl overflow-hidden bg-white"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              border: `3px solid ${card.collected ? card.borderColor : '#ff751f'}`,
            }}
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div
                className="p-5 flex items-center gap-3"
                style={{ background: card.collected ? `linear-gradient(135deg, ${card.borderColor}22, ${card.borderColor}44)` : 'linear-gradient(135deg, #ff751f22, #ff751f44)' }}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: card.collected ? `${card.borderColor}33` : '#ff751f33' }}>
                  <Icon name="SparklesIcon" size={24} style={{ color: card.collected ? card.borderColor : '#ff751f' }} />
                </div>
                <div>
                  <p className="font-display text-lg text-primary-800">
                    {card.collected ? card.name : `Card #${String(card.cardNumber).padStart(3, '0')}`}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: card.collected ? card.borderColor : '#ff751f' }}>
                      {card.rarity}
                    </span>
                    {card.habitat && (
                      <span className="text-xs font-sans text-earth-500 flex items-center gap-1">
                        <Icon name="MapPinIcon" size={11} />
                        {card.habitat}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {card.collected ? (
                  <>
                    {/* Stats grid */}
                    <div>
                      <p className="text-xs font-sans font-bold text-earth-400 uppercase tracking-widest mb-3">Card Stats</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'Power',   value: card.power,   color: '#ef4444', icon: 'BoltIcon'      },
                          { label: 'Energy',  value: card.energy,  color: '#3B82F6', icon: 'HeartIcon'     },
                          { label: 'Stealth', value: card.stealth, color: '#2D6A4F', icon: 'EyeSlashIcon'  },
                          { label: 'Beauty',  value: card.beauty,  color: '#ec4899', icon: 'SparklesIcon'  },
                        ].map(s => (
                          <div key={s.label} className="bg-adventure-bg rounded-2xl p-3 border border-adventure-border">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Icon name={s.icon as any} size={13} style={{ color: s.color }} />
                              <span className="text-xs font-sans font-semibold text-earth-500">{s.label}</span>
                            </div>
                            <p className="font-display text-2xl font-bold" style={{ color: s.color }}>{s.value ?? '—'}</p>
                            <div className="h-1.5 rounded-full mt-1.5 overflow-hidden bg-earth-100">
                              <div className="h-full rounded-full" style={{ width: `${s.value ?? 0}%`, backgroundColor: s.color }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* HP and Card Level */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-adventure-bg rounded-2xl p-3 border border-adventure-border text-center">
                        <p className="text-xs font-sans text-earth-400 uppercase tracking-wide mb-1">HP</p>
                        <p className="font-display text-xl text-primary-800">{card.hp ?? '—'}</p>
                      </div>
                      <div className="bg-adventure-bg rounded-2xl p-3 border border-adventure-border text-center">
                        <p className="text-xs font-sans text-earth-400 uppercase tracking-wide mb-1">Card Level</p>
                        <p className="font-display text-xl text-primary-800">{card.cardLevel ?? '—'}</p>
                      </div>
                    </div>

                    {/* Description */}
                    {card.description && (
                      <div className="bg-adventure-bg rounded-2xl p-4 border border-adventure-border">
                        <p className="text-xs font-sans font-bold text-earth-400 uppercase tracking-widest mb-2">Description</p>
                        <p className="text-sm font-sans text-primary-700 leading-relaxed">{card.description}</p>
                      </div>
                    )}

                    {/* Collected date */}
                    {card.collectedDate && (
                      <p className="text-xs font-sans text-earth-400 text-center">
                        Collected on {card.collectedDate}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    {/* Hint for uncollected */}
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="LightBulbIcon" size={16} className="text-amber-500" />
                      <p className="text-xs font-sans font-bold text-earth-400 uppercase tracking-widest">Collector's Hint</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                      <p className="text-sm font-sans text-amber-800 leading-relaxed italic">
                        "{card.hint ?? 'Keep fishing and exploring to unlock this card!'}"
                      </p>
                    </div>
                    <div className="bg-adventure-bg rounded-2xl p-4 border border-adventure-border text-center">
                      <p className="text-sm font-sans text-earth-500">
                        Open a pack or complete challenges to collect this card!
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
