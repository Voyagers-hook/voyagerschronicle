'use client';

import React, { useState } from 'react';
import { FishingCard, rarityConfig } from '@/app/card-collection/data/cardData';
import Icon from '@/components/ui/AppIcon';
import FullCardViewer from './FullCardViewer';

const CARD_BACK = 'https://raw.githubusercontent.com/Voyagers-hook/images/main/chronicle%20card%20back.png';

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
  const [showViewer, setShowViewer] = useState(false);
  const isShiny = card.rarity === 'Specimen' || card.rarity === 'Legendary';

  // ── Uncollected — card back image, full viewer on click ───────────────────
  if (!card.collected) {
    return (
      <>
        <div
          className="relative aspect-[750/1000] rounded-2xl cursor-pointer select-none overflow-hidden"
          style={{ perspective: '600px' }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => setShowViewer(true)}
          title={`Card #${String(card.cardNumber).padStart(3, '0')} — Click to view`}
        >
          <div
            className="w-full h-full rounded-2xl transition-all duration-300"
            style={{
              transform: hovered ? 'rotateY(6deg) rotateX(-4deg) scale(1.04)' : 'rotateY(0) rotateX(0) scale(1)',
              transformStyle: 'preserve-3d',
              boxShadow: hovered
                ? '0 0 16px 4px rgba(255,117,31,0.3), 0 8px 24px rgba(0,0,0,0.3)'
                : '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            <img src={CARD_BACK} alt="Undiscovered card" className="w-full h-full object-cover rounded-2xl" />
            {hovered && (
              <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-2"
                style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
                <Icon name="LightBulbIcon" size={24} className="text-amber-400" />
                <span className="text-white text-xs font-sans font-semibold">Tap for hint</span>
              </div>
            )}
          </div>
        </div>
        {showViewer && <FullCardViewer card={card} onClose={() => setShowViewer(false)} />}
      </>
    );
  }

  // ── Collected — full card display, full viewer on click ───────────────────
  return (
    <>
      <div
        className="relative aspect-[750/1000] rounded-2xl cursor-pointer select-none"
        style={{ perspective: '600px' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setShowViewer(true)}
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
          <div
            className="w-full h-full rounded-2xl overflow-hidden flex flex-col relative"
            style={{
              borderWidth: rarityBorderWidth[card.rarity],
              borderStyle: 'solid',
              borderColor: card.borderColor,
              boxShadow: hovered
                ? `0 0 ${isShiny ? 30 : 16}px ${isShiny ? 8 : 4}px ${rarityGlowColors[card.rarity]}, 0 8px 24px rgba(0,0,0,0.2)`
                : '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <div className={`bg-gradient-to-br ${card.gradient} flex-1 flex flex-col items-center justify-center p-3 relative overflow-hidden`}>
              {card.rarity === 'Legendary' && (
                <>
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(135deg, rgba(255,0,128,0.25) 0%, rgba(255,165,0,0.25) 20%, rgba(255,255,0,0.25) 40%, rgba(0,255,128,0.25) 60%, rgba(0,128,255,0.25) 80%, rgba(128,0,255,0.25) 100%)', backgroundSize: '300% 300%', animation: 'legendaryRainbow 3s ease infinite', mixBlendMode: 'overlay' }} />
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(45deg, transparent 20%, rgba(255,255,255,0.8) 50%, transparent 80%)', backgroundSize: '200% 200%', animation: 'foilShimmer 2s ease infinite' }} />
                  <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-yellow-300 opacity-80 animate-ping" style={{ animationDuration: '1.5s' }} />
                  <div className="absolute bottom-2 left-1 w-2 h-2 rounded-full bg-amber-400 opacity-60 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                </>
              )}
              {card.rarity === 'Specimen' && (
                <>
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(135deg, rgba(147,197,253,0.3) 0%, rgba(196,181,253,0.3) 33%, rgba(167,243,208,0.3) 66%, rgba(147,197,253,0.3) 100%)', backgroundSize: '200% 200%', animation: 'specimenHolo 4s ease infinite', mixBlendMode: 'overlay' }} />
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(135deg, transparent 25%, rgba(255,255,255,0.6) 50%, transparent 75%)', backgroundSize: '200% 200%', animation: 'foilShimmer 2.5s ease infinite' }} />
                </>
              )}
              {card.foil && card.rarity !== 'Legendary' && card.rarity !== 'Specimen' && (
                <div className="absolute inset-0 opacity-30 pointer-events-none foil-shimmer" />
              )}
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
              {card.rarity === 'Legendary' && (
                <div className="absolute top-1.5 left-1.5 z-20">
                  <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shadow-lg">
                    <Icon name="StarIcon" size={11} className="text-white" />
                  </div>
                </div>
              )}
              {card.rarity === 'Specimen' && (
                <div className="absolute top-1.5 left-1.5 z-20">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                    <Icon name="SparklesIcon" size={10} className="text-white" />
                  </div>
                </div>
              )}
            </div>
            {card.rarity === 'Legendary' && (
              <div className="absolute inset-0 opacity-20 pointer-events-none z-10"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.5), transparent)', backgroundSize: '200% 100%', animation: 'foilShimmer 2s ease infinite' }} />
            )}
          </div>
          {hovered && (
            <div className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{ boxShadow: isShiny ? `0 0 0 2px ${card.borderColor}, 0 0 40px 8px ${rarityGlowColors[card.rarity]}` : `0 0 0 2px ${card.borderColor}60` }} />
          )}
        </div>
      </div>
      {showViewer && <FullCardViewer card={card} onClose={() => setShowViewer(false)} />}
    </>
  );
}

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

const rarityCardBack: Record<string, { bg: string; border: string; badge: string }> = {
  Widespread: { bg: 'from-earth-700 to-earth-900',     border: '#c49050', badge: 'bg-amber-700' },
  Elusive:    { bg: 'from-green-800 to-green-950',     border: '#2D6A4F', badge: 'bg-green-700' },
  Specimen:   { bg: 'from-blue-700 to-blue-950',       border: '#3B82F6', badge: 'bg-blue-600'  },
  Legendary:  { bg: 'from-amber-700 to-amber-950',     border: '#F59E0B', badge: 'bg-amber-500' },
};

// ── Hint modal for uncollected cards ─────────────────────────────────────────
function HintModal({ card, onClose }: { card: FishingCard; onClose: () => void }) {
  const rarity = rarityConfig[card.rarity];
  const back = rarityCardBack[card.rarity];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Card back image at top of modal */}
        <div className="relative h-40 overflow-hidden">
          <img
            src="https://raw.githubusercontent.com/Voyagers-hook/images/main/chronicle%20card%20back.png"
            alt="Card back"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center gap-2">
            <span className={`text-white text-xs font-bold px-3 py-1 rounded-full ${back.badge}`}>
              {card.rarity}
            </span>
            <p className="text-white/60 text-xs font-sans font-semibold tracking-widest">
              Card #{String(card.cardNumber).padStart(3, '0')}
            </p>
          </div>
        </div>

        {/* Hint content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${rarity?.color ?? '#ff751f'}20` }}>
              <Icon name="LightBulbIcon" size={16} style={{ color: rarity?.color ?? '#ff751f' }} />
            </div>
            <h3 className="font-display text-lg text-primary-800">Collector's Hint</h3>
          </div>

          {card.hint ? (
            <p className="text-sm font-sans text-earth-600 leading-relaxed bg-adventure-bg rounded-2xl p-4 border border-adventure-border">
              "{card.hint}"
            </p>
          ) : (
            <p className="text-sm font-sans text-earth-400 italic">
              No hint available yet. Keep fishing and exploring to unlock this card!
            </p>
          )}

          {card.habitat && (
            <div className="flex items-center gap-2 text-xs font-sans text-earth-500">
              <Icon name="MapPinIcon" size={14} className="text-earth-400" />
              <span>Habitat: <span className="font-semibold text-primary-700">{card.habitat}</span></span>
            </div>
          )}

          <p className="text-xs font-sans text-earth-400 text-center">
            Open a pack or complete challenges to collect this card!
          </p>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-white font-sans font-semibold text-sm transition-colors"
            style={{ backgroundColor: '#ff751f' }}
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CardSlot ──────────────────────────────────────────────────────────────────
export default function CardSlot({ card, onClick }: CardSlotProps) {
  const [hovered, setHovered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const rarity = rarityConfig[card.rarity];
  const isShiny = card.rarity === 'Specimen' || card.rarity === 'Legendary';
  const back = rarityCardBack[card.rarity];

  // ── Uncollected — show card back image, hint on click ────────────────
  if (!card.collected) {
    return (
      <>
        <div
          className="relative aspect-[2/3] rounded-2xl cursor-pointer select-none overflow-hidden"
          style={{ perspective: '600px' }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => setShowHint(true)}
          title={`Card #${String(card.cardNumber).padStart(3, '0')} — Click for a hint`}
        >
          <div
            className="w-full h-full rounded-2xl transition-all duration-300"
            style={{
              transform: hovered ? 'rotateY(6deg) rotateX(-4deg) scale(1.04)' : 'rotateY(0) rotateX(0) scale(1)',
              transformStyle: 'preserve-3d',
              boxShadow: hovered
                ? `0 0 16px 4px rgba(255,117,31,0.3), 0 8px 24px rgba(0,0,0,0.3)`
                : '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            {/* Card back image */}
            <img
              src="https://raw.githubusercontent.com/Voyagers-hook/images/main/chronicle%20card%20back.png"
              alt="Undiscovered card"
              className="w-full h-full object-cover rounded-2xl"
            />

            {/* Hover overlay with hint prompt */}
            {hovered && (
              <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-2"
                style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
                <Icon name="LightBulbIcon" size={24} className="text-amber-400" />
                <span className="text-white text-xs font-sans font-semibold tracking-wide">
                  Tap for hint
                </span>
              </div>
            )}
          </div>
        </div>

        {showHint && <HintModal card={card} onClose={() => setShowHint(false)} />}
      </>
    );
  }

  // ── Collected — full card display (unchanged) ─────────────────────────────
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
          <div className={`bg-gradient-to-br ${card.gradient} flex-1 flex flex-col items-center justify-center p-3 relative overflow-hidden`}>
            {card.rarity === 'Legendary' && (
              <>
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(135deg, rgba(255,0,128,0.25) 0%, rgba(255,165,0,0.25) 20%, rgba(255,255,0,0.25) 40%, rgba(0,255,128,0.25) 60%, rgba(0,128,255,0.25) 80%, rgba(128,0,255,0.25) 100%)', backgroundSize: '300% 300%', animation: 'legendaryRainbow 3s ease infinite', mixBlendMode: 'overlay' }} />
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(45deg, transparent 20%, rgba(255,255,255,0.8) 50%, transparent 80%)', backgroundSize: '200% 200%', animation: 'foilShimmer 2s ease infinite' }} />
                <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-yellow-300 opacity-80 animate-ping" style={{ animationDuration: '1.5s' }} />
                <div className="absolute bottom-2 left-1 w-2 h-2 rounded-full bg-amber-400 opacity-60 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
              </>
            )}
            {card.rarity === 'Specimen' && (
              <>
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(135deg, rgba(147,197,253,0.3) 0%, rgba(196,181,253,0.3) 33%, rgba(167,243,208,0.3) 66%, rgba(147,197,253,0.3) 100%)', backgroundSize: '200% 200%', animation: 'specimenHolo 4s ease infinite', mixBlendMode: 'overlay' }} />
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(135deg, transparent 25%, rgba(255,255,255,0.6) 50%, transparent 75%)', backgroundSize: '200% 200%', animation: 'foilShimmer 2.5s ease infinite' }} />
              </>
            )}
            {card.foil && card.rarity !== 'Legendary' && card.rarity !== 'Specimen' && (
              <div className="absolute inset-0 opacity-30 pointer-events-none foil-shimmer" />
            )}
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
            {card.rarity === 'Legendary' && (
              <div className="absolute top-1.5 left-1.5 z-20">
                <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shadow-lg">
                  <Icon name="StarIcon" size={11} className="text-white" />
                </div>
              </div>
            )}
            {card.rarity === 'Specimen' && (
              <div className="absolute top-1.5 left-1.5 z-20">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                  <Icon name="SparklesIcon" size={10} className="text-white" />
                </div>
              </div>
            )}
          </div>
          {card.rarity === 'Legendary' && (
            <div className="absolute inset-0 opacity-20 pointer-events-none z-10"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.5), transparent)', backgroundSize: '200% 100%', animation: 'foilShimmer 2s ease infinite' }} />
          )}
        </div>
        {hovered && (
          <div className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ boxShadow: isShiny ? `0 0 0 2px ${card.borderColor}, 0 0 40px 8px ${rarityGlowColors[card.rarity]}` : `0 0 0 2px ${card.borderColor}60` }} />
        )}
      </div>
    </div>
  );
}
