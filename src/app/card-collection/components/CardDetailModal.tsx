'use client';

import React from 'react';
import { FishingCard, rarityConfig } from '@/app/card-collection/data/cardData';
import Icon from '@/components/ui/AppIcon';

interface CardDetailModalProps {
  card: FishingCard | null;
  onClose: () => void;
}

function StatRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-sans text-earth-400 w-16 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-earth-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-sans font-bold tabular-nums w-6 text-right" style={{ color }}>{value}</span>
    </div>
  );
}

export default function CardDetailModal({ card, onClose }: CardDetailModalProps) {
  if (!card) return null;
  const rarity = rarityConfig[card.rarity];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-72 max-w-[90vw] rounded-3xl overflow-hidden shadow-panel"
        onClick={(e) => e.stopPropagation()}
        style={{ border: `3px solid ${card.borderColor}` }}
      >
        {/* Header */}
        <div className={`bg-gradient-to-br ${card.gradient} p-8 flex flex-col items-center relative`}>
          {card.foil && (
            <div
              className="absolute inset-0 opacity-40 pointer-events-none foil-shimmer"
            />
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <Icon name="XMarkIcon" size={16} />
          </button>

          {/* Card image placeholder */}
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mb-3 border-2 border-white/30">
            {card.image ? (
              <img src={card.image} alt={card.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <Icon name="SparklesIcon" size={32} className="text-white/80" />
            )}
          </div>

          <h2 className="font-display text-2xl text-white text-center drop-shadow">{card.name}</h2>
          <p className="text-white/70 text-sm font-sans italic mt-1">{card.species}</p>
          {card.foil && (
            <span className="mt-2 bg-white/20 text-white text-xs font-sans font-bold px-3 py-1 rounded-full border border-white/30">
              FOIL CARD
            </span>
          )}
        </div>

        {/* Body */}
        <div className="bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-sans font-bold px-3 py-1 rounded-full ${rarity.badge}`}>
              {card.rarity}
            </span>
            <span className="text-xs font-sans text-earth-400">#{String(card.cardNumber).padStart(3, '0')} / {String(card.totalCards).padStart(3, '0')}</span>
          </div>

          <p className="text-sm font-sans text-earth-500 leading-relaxed">{card.description}</p>

          {/* Stats */}
          <div className="space-y-2">
            <p className="text-xs font-sans font-semibold text-earth-400 uppercase tracking-widest">Card Stats</p>
            <StatRow label="Power"   value={card.power}   color="#ef4444" />
            <StatRow label="Stealth" value={card.stealth} color="#2D6A4F" />
            <StatRow label="Stamina" value={card.stamina} color="#3B82F6" />
            <StatRow label="Beauty"  value={card.beauty}  color="#ec4899" />
          </div>

          <div className="bg-adventure-bg rounded-xl p-3 text-center border border-adventure-border">
            <p className="text-xs font-sans text-earth-400 uppercase tracking-wide mb-0.5">Habitat</p>
            <p className="font-display text-lg text-primary-700">{card.habitat}</p>
          </div>

          {card.collectedDate && (
            <p className="text-xs font-sans text-earth-400 text-center">
              Collected on {card.collectedDate}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
