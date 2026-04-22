'use client';

import { useState } from 'react';

type Rarity = 'Widespread' | 'Elusive' | 'Specimen' | 'Legendary';

interface FishingCard {
  id: string;
  card_number: number;
  name: string;
  species: string;
  rarity: Rarity;
  image_url: string | null;
  power: number;
  stealth: number;
  energy: number;
  beauty: number;
  habitat: string;
  description: string | null;
  fact: string | null;
  foil: boolean;
  gradient: string;
  border_color: string;
  hp: number;
  card_level: number;
  drop_rate: number;
}

interface FlippableCardProps {
  card: FishingCard;
  collected: boolean;
}

const RARITY_STYLES: Record<Rarity, { badge: string; glow: string; label: string }> = {
  Widespread: { badge: 'bg-green-100 text-green-700 border-green-200', glow: 'shadow-green-200',  label: '🌿 Widespread' },
  Elusive:    { badge: 'bg-blue-100 text-blue-700 border-blue-200',   glow: 'shadow-blue-200',   label: '💧 Elusive' },
  Specimen:   { badge: 'bg-purple-100 text-purple-700 border-purple-200', glow: 'shadow-purple-300', label: '🔮 Specimen' },
  Legendary:  { badge: 'bg-amber-100 text-amber-700 border-amber-200', glow: 'shadow-amber-300',  label: '⚡ Legendary' },
};

export function FlippableCard({ card, collected }: FlippableCardProps) {
  const [flipped, setFlipped] = useState(false);
  const rarityStyle = RARITY_STYLES[card.rarity];

  // Locked slot
  if (!collected) {
    return (
      <div
        className="relative rounded-2xl overflow-hidden select-none"
        style={{
          width: '100%',
          aspectRatio: '2.5 / 3.5',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          border: '2px solid rgba(255,255,255,0.06)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-30">
          <div className="text-5xl">🔒</div>
          <p className="text-white text-xs font-medium tracking-widest uppercase">Locked</p>
          <p className="text-white/60 text-xs">#{String(card.card_number).padStart(3, '0')}</p>
        </div>
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0px, transparent 1px, transparent 20px)',
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="relative cursor-pointer select-none"
      style={{ width: '100%', aspectRatio: '2.5 / 3.5', perspective: '1000px' }}
      onClick={() => card.fact && setFlipped(f => !f)}
      title={card.fact ? 'Click to reveal fact' : undefined}
    >
      {/* Inner flip container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ===== FRONT ===== */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            borderRadius: '1rem',
            overflow: 'hidden',
            border: `2px solid ${card.border_color}`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 20px ${card.border_color}44`,
          }}
        >
          {/* Card background gradient */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-20`}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

          {/* Foil shimmer */}
          {card.foil && (
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: 'linear-gradient(135deg, transparent 25%, rgba(255,255,255,0.3) 50%, transparent 75%)',
                backgroundSize: '200% 200%',
                animation: 'shimmer 3s linear infinite',
              }}
            />
          )}

          <div className="relative h-full flex flex-col p-2.5 gap-1.5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-white/40 font-mono text-xs">#{String(card.card_number).padStart(3, '0')}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${rarityStyle.badge}`}>
                {rarityStyle.label}
              </span>
            </div>

            {/* Card Name */}
            <div className="text-center">
              <h3 className="text-white font-bold text-sm leading-tight">{card.name}</h3>
              <p className="text-white/50 text-xs italic">{card.species}</p>
            </div>

            {/* Image */}
            <div
              className="flex-1 rounded-lg overflow-hidden bg-black/30 flex items-center justify-center min-h-0"
              style={{ border: `1px solid ${card.border_color}44` }}
            >
              {card.image_url ? (
                <img
                  src={card.image_url}
                  alt={card.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-5xl opacity-40">🐟</div>
              )}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-1">
              {[
                { label: 'PWR', value: card.power },
                { label: 'NRG', value: card.energy },
                { label: 'STL', value: card.stealth },
                { label: 'BTY', value: card.beauty },
              ].map(stat => (
                <div key={stat.label} className="bg-black/30 rounded-md p-1 text-center">
                  <p className="text-white/40 text-[9px] font-semibold tracking-wide">{stat.label}</p>
                  <p className="text-white font-bold text-xs">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <span className="text-white/40 text-[10px]">HP {card.hp}</span>
              <span className="text-white/40 text-[10px]">Lv.{card.card_level}</span>
              {card.fact && (
                <span className="text-white/30 text-[9px] italic">tap for fact</span>
              )}
            </div>
          </div>
        </div>

        {/* ===== BACK (Fact) ===== */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderRadius: '1rem',
            overflow: 'hidden',
            border: `2px solid ${card.border_color}`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 20px ${card.border_color}44`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
          <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-10`} />

          <div className="relative h-full flex flex-col items-center justify-center p-4 gap-3 text-center">
            <div className="text-3xl">🔍</div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest">Did you know?</p>
            <p className="text-white text-sm leading-relaxed font-medium">
              {card.fact}
            </p>
            <div className="mt-2 pt-3 border-t border-white/10 w-full">
              <p className="text-white/30 text-xs">{card.name} · Tap to flip back</p>
            </div>
          </div>
        </div>
      </div>

      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 200%; }
          100% { background-position: -200% -200%; }
        }
      `}</style>
    </div>
  );
}
