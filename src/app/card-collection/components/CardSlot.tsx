'use client';

import React, { useState } from 'react';
import { FishingCard, rarityConfig } from '@/app/card-collection/data/cardData';
import Icon from '@/components/ui/AppIcon';

interface CardSlotProps {
  card: FishingCard;
  onClick: (card: FishingCard) => void;
}

const rarityGlowColors: Record<string, string> = {
  Widespread: 'rgba(196,144,80,0.5)',
  Elusive:    'rgba(45,106,79,0.6)',
  Specimen:   'rgba(59,130,246,0.7)',
  Legendary:  'rgba(245,158,11,0.8)',
};

const rarityBorderWidth: Record<string, string> = {
  Widespread: '2px',
  Elusive:    '2px',
  Specimen:   '3px',
  Legendary:  '3px',
};

export default function CardSlot({ card, onClick }: CardSlotProps) {
  const [hovered, setHovered] = useState(false);
  const rarity = rarityConfig[card.rarity];
  const isShiny = card.rarity === 'Specimen' || card.rarity === 'Legendary';

  if (!card.collected) {
    return (
      <div
        className="relative aspect-[2/3] rounded-2xl border-2 border-dashed border-adventure-border bg-adventure-bg flex flex-col items-center justify-center gap-2 cursor-default"
        title={`Card #${card.cardNumber} — Not yet collected`}
      >
        <div className="w-10 h-10 rounded-xl bg-earth-100 flex items-center justify-center">
          <Icon name="LockClosedIcon" size={20} className="text-earth-300" />
        </div>
        <span className="text-xs font-sans text-earth-300 font-medium">#{String(card.cardNumber).padStart(3, '0')}</span>
      </div>
    );
  }

  return (
    <div
      className="relative aspect-[2/3] rounded-2xl cursor-pointer select-none"
      style={{ perspective: '600px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(card)}
    >
      <div
        className="w-full h-full rounded-2xl transition-all duration-300"
        style={{
          transform: hovered
            ? `rotateY(${isShiny ? 10 : 6}deg) rotateX(${isShiny ? -6 : -4}deg) scale(${isShiny ? 1.07 : 1.04})`
            : 'rotateY(0) rotateX(0) scale(1)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Card face */}
        <div
          className="w-full h-full rounded-2xl overflow-hidden flex flex-col relative"
          style={{
            borderWidth: rarityBorderWidth[card.rarity],
            borderStyle: 'solid',
            borderColor: card.borderColor,
            boxShadow: hovered
              ? `0 0 ${isShiny ? 30 : 16}px ${isShiny ? 8 : 4}px ${rarityGlowColors[card.rarity]}, 0 8px 24px rgba(0,0,0,0.2)`
              : `0 2px 8px rgba(0,0,0,0.1)`,
          }}
        >
          {/* Card header gradient */}
          <div className={`bg-gradient-to-br ${card.gradient} flex-1 flex flex-col items-center justify-center p-3 relative overflow-hidden`}>

            {/* Legendary: animated rainbow prismatic overlay */}
            {card.rarity === 'Legendary' && (
              <>
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,0,128,0.25) 0%, rgba(255,165,0,0.25) 20%, rgba(255,255,0,0.25) 40%, rgba(0,255,128,0.25) 60%, rgba(0,128,255,0.25) 80%, rgba(128,0,255,0.25) 100%)',
                    backgroundSize: '300% 300%',
                    animation: 'legendaryRainbow 3s ease infinite',
                    mixBlendMode: 'overlay',
                  }}
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(45deg, transparent 20%, rgba(255,255,255,0.8) 50%, transparent 80%)',
                    backgroundSize: '200% 200%',
                    animation: 'foilShimmer 2s ease infinite',
                  }}
                />
                {/* Star sparkles */}
                <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-yellow-300 opacity-80 animate-ping" style={{ animationDuration: '1.5s' }} />
                <div className="absolute bottom-2 left-1 w-2 h-2 rounded-full bg-amber-400 opacity-60 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
              </>
            )}

            {/* Specimen: blue-silver holographic shimmer */}
            {card.rarity === 'Specimen' && (
              <>
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(147,197,253,0.3) 0%, rgba(196,181,253,0.3) 33%, rgba(167,243,208,0.3) 66%, rgba(147,197,253,0.3) 100%)',
                    backgroundSize: '200% 200%',
                    animation: 'specimenHolo 4s ease infinite',
                    mixBlendMode: 'overlay',
                  }}
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, transparent 25%, rgba(255,255,255,0.6) 50%, transparent 75%)',
                    backgroundSize: '200% 200%',
                    animation: 'foilShimmer 2.5s ease infinite',
                  }}
                />
              </>
            )}

            {/* Standard foil shimmer for foil cards */}
            {card.foil && card.rarity !== 'Legendary' && card.rarity !== 'Specimen' && (
              <div
                className="absolute inset-0 opacity-30 pointer-events-none foil-shimmer"
              />
            )}

           {/* Card image or icon */}
{card.image ? (
  <div className="absolute inset-0 z-0">
    <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
  </div>
) : (
  <div className="relative z-10 flex flex-col items-center">
    <div className="w-12 h-12 rounded-xl bg-white/25 flex items-center justify-center mb-1 shadow-lg border border-white/30">
      <Icon name="SparklesIcon" size={22} className="text-white" />
    </div>
  </div>
)}

            {/* Rarity crown for Legendary */}
            {card.rarity === 'Legendary' && (
              <div className="absolute top-1.5 left-1.5 z-20">
                <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shadow-lg">
                  <Icon name="StarIcon" size={11} className="text-white" />
                </div>
              </div>
            )}

            {/* Specimen badge */}
            {card.rarity === 'Specimen' && (
              <div className="absolute top-1.5 left-1.5 z-20">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                  <Icon name="SparklesIcon" size={10} className="text-white" />
                </div>
              </div>
            )}
          </div>

          {/* Card footer */}
          <div className="bg-white px-2 py-1.5 relative">
            {/* Legendary gold shimmer on footer */}
            {card.rarity === 'Legendary' && (
              <div className="absolute inset-0 opacity-20" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.5), transparent)', backgroundSize: '200% 100%', animation: 'foilShimmer 2s ease infinite' }} />
            )}
     
        {/* Outer glow ring on hover */}
        {hovered && (
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              boxShadow: isShiny
                ? `0 0 0 2px ${card.borderColor}, 0 0 40px 8px ${rarityGlowColors[card.rarity]}`
                : `0 0 0 2px ${card.borderColor}60`,
            }}
          />
        )}
      </div>
    </div>
  );
}
