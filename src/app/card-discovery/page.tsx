'use client';

import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { allCards, rarityConfig, FishingCard, CardRarity } from '@/app/card-collection/data/cardData';

const RARITIES: CardRarity[] = ['Widespread', 'Elusive', 'Specimen', 'Legendary'];

const rarityMeta: Record<CardRarity, { gradient: string; glow: string; textColor: string; count: number; description: string }> = {
  Widespread: {
    gradient: 'from-amber-700 via-yellow-600 to-amber-500',
    glow: 'rgba(196,144,80,0.5)',
    textColor: 'text-amber-700',
    count: allCards.filter(c => c.rarity === 'Widespread').length,
    description: 'Common fish found in many waterways — perfect for beginners!',
  },
  Elusive: {
    gradient: 'from-emerald-700 via-green-600 to-teal-500',
    glow: 'rgba(45,106,79,0.5)',
    textColor: 'text-emerald-700',
    count: allCards.filter(c => c.rarity === 'Elusive').length,
    description: 'Tricky to find — these fish need patience and skill.',
  },
  Specimen: {
    gradient: 'from-blue-700 via-blue-500 to-cyan-400',
    glow: 'rgba(59,130,246,0.5)',
    textColor: 'text-blue-700',
    count: allCards.filter(c => c.rarity === 'Specimen').length,
    description: 'Trophy-worthy catches that every angler dreams of!',
  },
  Legendary: {
    gradient: 'from-amber-500 via-yellow-400 to-orange-400',
    glow: 'rgba(245,158,11,0.6)',
    textColor: 'text-amber-600',
    count: allCards.filter(c => c.rarity === 'Legendary').length,
    description: 'The rarest of the rare — only the greatest Voyagers find these.',
  },
};

function StatBar({ label, value, colorClass, delay }: { label: string; value: number; colorClass: string; delay: number }) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs font-sans font-semibold text-primary-500 uppercase tracking-wide">{label}</span>
        <span className="text-xs font-display text-primary-800 tabular-nums">{value}</span>
      </div>
      <div className="h-2 bg-primary-100 rounded-full overflow-hidden">
        <div
          ref={ref}
          className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function DiscoveryCard({ card, index, isSelected, onClick }: { card: FishingCard; index: number; isSelected: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), index * 60);
    return () => clearTimeout(t);
  }, [index]);

  const isLocked = !card.collected;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        relative rounded-2xl border-2 overflow-hidden cursor-pointer text-left
        transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2
        ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
        ${isSelected ? 'ring-2 ring-offset-2 scale-[1.03]' : ''}
        ${hovered && !isSelected ? 'scale-[1.02] -translate-y-1' : ''}
      `}
      style={{
        borderColor: isSelected ? card.borderColor : `${card.borderColor}55`,
        boxShadow: isSelected
          ? `0 0 24px ${card.borderColor}80, 0 8px 32px rgba(0,0,0,0.15)`
          : hovered
          ? `0 0 16px ${card.borderColor}50, 0 4px 16px rgba(0,0,0,0.1)`
          : '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transitionDelay: mounted ? '0ms' : `${index * 60}ms`,
      }}
    >
      {/* Card gradient header */}
      <div className={`relative h-24 bg-gradient-to-br ${card.gradient} flex items-center justify-center overflow-hidden`}>
        {/* Foil shimmer */}
        {card.foil && (
          <div className="absolute inset-0 foil-shimmer opacity-60 pointer-events-none" />
        )}
        {/* Lock overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Icon name="LockClosedIcon" size={20} className="text-white" />
            </div>
          </div>
        )}
        {/* Card number badge */}
        <span className="absolute top-2 left-2 text-xs font-display text-white/80 bg-black/20 rounded-full px-2 py-0.5">
          #{card.cardNumber}
        </span>
        {/* Foil badge */}
        {card.foil && (
          <span className="absolute top-2 right-2 text-xs font-sans font-bold text-white bg-white/20 rounded-full px-2 py-0.5">
            FOIL
          </span>
        )}
        {/* Fish silhouette placeholder */}
        <div className={`w-14 h-14 rounded-full bg-white/20 flex items-center justify-center ${isLocked ? 'opacity-30' : ''}`}>
          <Icon name="QuestionMarkCircleIcon" size={28} className="text-white/80" />
        </div>
      </div>

      {/* Card body */}
      <div className="bg-white p-3 space-y-2">
        <div>
          <h3 className={`font-display text-base leading-tight ${isLocked ? 'text-primary-300' : 'text-primary-800'}`}>
            {isLocked ? '???' : card.name}
          </h3>
          <p className={`text-xs font-sans italic ${isLocked ? 'text-primary-200' : 'text-earth-400'}`}>
            {isLocked ? 'Undiscovered' : card.species}
          </p>
        </div>

        {/* Rarity badge */}
        <span className={`inline-flex items-center gap-1 text-xs font-sans font-semibold px-2 py-0.5 rounded-full ${rarityConfig[card.rarity].badge}`}>
          {card.rarity}
        </span>

        {/* Collected indicator */}
        {card.collected && (
          <div className="flex items-center gap-1 text-xs font-sans text-emerald-600">
            <Icon name="CheckCircleIcon" size={12} />
            <span>Collected</span>
          </div>
        )}
      </div>
    </button>
  );
}

function CardDetailPanel({ card, onClose }: { card: FishingCard; onClose: () => void }) {
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStatsVisible(true), 150);
    return () => clearTimeout(t);
  }, [card.id]);

  const isLocked = !card.collected;

  return (
    <div className="slide-in-panel bg-white rounded-3xl border border-adventure-border shadow-panel overflow-hidden flex flex-col">
      {/* Header gradient */}
      <div className={`relative h-48 bg-gradient-to-br ${card.gradient} flex items-center justify-center overflow-hidden flex-shrink-0`}>
        {card.foil && <div className="absolute inset-0 foil-shimmer opacity-70 pointer-events-none" />}
        {isLocked && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 z-10">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <Icon name="LockClosedIcon" size={32} className="text-white" />
            </div>
            <p className="text-white font-sans font-semibold text-sm">Not Yet Discovered</p>
          </div>
        )}
        <div className={`w-24 h-24 rounded-full bg-white/25 flex items-center justify-center ${isLocked ? 'opacity-20' : ''}`}>
          <Icon name="QuestionMarkCircleIcon" size={48} className="text-white/80" />
        </div>
        {/* Card number */}
        <div className="absolute top-3 left-3 bg-black/25 rounded-xl px-3 py-1">
          <span className="text-white font-display text-sm">#{card.cardNumber} / {card.totalCards}</span>
        </div>
        {card.foil && (
          <div className="absolute top-3 right-3 bg-white/25 rounded-xl px-3 py-1">
            <span className="text-white font-sans font-bold text-xs tracking-widest">FOIL</span>
          </div>
        )}
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/25 flex items-center justify-center hover:bg-black/40 transition-colors"
        >
          <Icon name="XMarkIcon" size={16} className="text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Name & rarity */}
        <div>
          <h2 className="font-display text-2xl text-primary-800 leading-tight">
            {isLocked ? '???' : card.name}
          </h2>
          <p className="font-sans text-sm italic text-earth-400 mb-2">
            {isLocked ? 'Undiscovered species' : card.species}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-xs font-sans font-bold px-3 py-1 rounded-full ${rarityConfig[card.rarity].badge}`}>
              {card.rarity}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-sans text-earth-500 bg-earth-50 px-3 py-1 rounded-full">
              <Icon name="MapPinIcon" size={12} />
              {card.habitat}
            </span>
          </div>
        </div>

        {/* Description */}
        {!isLocked && (
          <p className="font-sans text-sm text-earth-600 leading-relaxed bg-adventure-bg rounded-2xl p-3">
            {card.description}
          </p>
        )}

        {/* Stats */}
        <div className="space-y-3">
          <h3 className="font-display text-base text-primary-700">Stats</h3>
          {statsVisible ? (
            <div className="space-y-3">
              <StatBar label="Power" value={isLocked ? 0 : card.power} colorClass="stat-bar-power" delay={0} />
              <StatBar label="Stealth" value={isLocked ? 0 : card.stealth} colorClass="stat-bar-stealth" delay={80} />
              <StatBar label="Stamina" value={isLocked ? 0 : card.stamina} colorClass="stat-bar-stamina" delay={160} />
              <StatBar label="Beauty" value={isLocked ? 0 : card.beauty} colorClass="stat-bar-beauty" delay={240} />
            </div>
          ) : (
            <div className="space-y-3">
              {['Power', 'Stealth', 'Stamina', 'Beauty'].map(s => (
                <div key={s} className="h-8 bg-primary-50 rounded-xl animate-pulse" />
              ))}
            </div>
          )}
        </div>

        {/* Collected date */}
        {card.collected && card.collectedDate && (
          <div className="flex items-center gap-2 bg-emerald-50 rounded-2xl p-3">
            <Icon name="CheckCircleIcon" size={18} className="text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-sans font-semibold text-emerald-700">Collected!</p>
              <p className="text-xs font-sans text-emerald-600">{card.collectedDate}</p>
            </div>
          </div>
        )}

        {/* Locked hint */}
        {isLocked && (
          <div className="flex items-start gap-2 bg-amber-50 rounded-2xl p-3">
            <Icon name="SparklesIcon" size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-sans text-amber-700 leading-relaxed">
              Open packs and log catches to discover this card and reveal its secrets!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CardDiscoveryPage() {
  const [activeRarity, setActiveRarity] = useState<CardRarity | 'All'>('All');
  const [selectedCard, setSelectedCard] = useState<FishingCard | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCollectedOnly, setShowCollectedOnly] = useState(false);

  const filteredCards = allCards.filter(card => {
    const matchesRarity = activeRarity === 'All' || card.rarity === activeRarity;
    const matchesSearch = searchQuery === '' ||
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.habitat.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCollected = !showCollectedOnly || card.collected;
    return matchesRarity && matchesSearch && matchesCollected;
  });

  const totalCollected = allCards.filter(c => c.collected).length;
  const totalCards = allCards.length;
  const progressPct = Math.round((totalCollected / totalCards) * 100);

  return (
    <AppLayout currentPath="/card-discovery">
      <div className="fade-in space-y-6">

        {/* Hero header */}
        <div
          className="relative overflow-hidden rounded-3xl p-6 lg:p-8"
          style={{ background: 'linear-gradient(135deg, #091408 0%, #1A3D28 50%, #2D6A4F 100%)' }}
        >
          {/* Animated glow orbs */}
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #F59E0B, transparent)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #3B82F6, transparent)', transform: 'translate(-30%, 30%)' }} />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Icon name="MagnifyingGlassIcon" size={22} className="text-amber-400" />
                </div>
                <h1 className="font-display text-3xl lg:text-4xl text-white">Card Discovery</h1>
              </div>
              <p className="text-primary-200 font-sans text-sm">Explore all {totalCards} cards across every rarity — how many can you collect?</p>
            </div>

            {/* Progress */}
            <div className="bg-white/10 border border-white/20 rounded-2xl px-5 py-3 min-w-[160px]">
              <p className="text-primary-200 text-xs font-sans font-semibold uppercase tracking-wide mb-1">Collection</p>
              <p className="font-display text-2xl text-white tabular-nums">{totalCollected} <span className="text-primary-300 text-lg">/ {totalCards}</span></p>
              <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #ff751f, #F59E0B)' }}
                />
              </div>
              <p className="text-primary-300 text-xs font-sans mt-1">{progressPct}% complete</p>
            </div>
          </div>
        </div>

        {/* Rarity filter tabs */}
        <div className="flex flex-wrap gap-3">
          {/* All tab */}
          <button
            onClick={() => setActiveRarity('All')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-sans font-semibold text-sm transition-all duration-200 ${
              activeRarity === 'All' ?'bg-primary-800 text-white shadow-md scale-105' :'bg-white text-primary-600 border border-adventure-border hover:border-primary-300 hover:bg-primary-50'
            }`}
          >
            <Icon name="Squares2X2Icon" size={16} />
            All Cards
            <span className={`text-xs rounded-full px-2 py-0.5 font-bold ${activeRarity === 'All' ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-600'}`}>
              {totalCards}
            </span>
          </button>

          {RARITIES.map((rarity) => {
            const meta = rarityMeta[rarity];
            const isActive = activeRarity === rarity;
            return (
              <button
                key={rarity}
                onClick={() => setActiveRarity(rarity)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-sans font-semibold text-sm transition-all duration-200 border ${
                  isActive
                    ? 'text-white shadow-md scale-105 border-transparent'
                    : 'bg-white border-adventure-border hover:scale-102'
                }`}
                style={isActive ? {
                  background: `linear-gradient(135deg, ${meta.gradient.replace('from-', '').split(' ')[0]}, ${meta.gradient.split(' ').pop()})`,
                  boxShadow: `0 4px 16px ${meta.glow}`,
                } : {}}
              >
                <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${meta.gradient}`} />
                <span className={isActive ? 'text-white' : meta.textColor}>{rarity}</span>
                <span className={`text-xs rounded-full px-2 py-0.5 font-bold ${isActive ? 'bg-white/25 text-white' : `${rarityConfig[rarity].badge}`}`}>
                  {meta.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Rarity description banner */}
        {activeRarity !== 'All' && (
          <div
            className="rounded-2xl px-4 py-3 flex items-center gap-3 fade-in"
            style={{ background: `linear-gradient(135deg, ${rarityMeta[activeRarity].glow.replace('0.5)', '0.12)')}, ${rarityMeta[activeRarity].glow.replace('0.5)', '0.04)')})` }}
          >
            <span className={`w-3 h-3 rounded-full bg-gradient-to-br ${rarityMeta[activeRarity].gradient} flex-shrink-0`} />
            <p className={`font-sans text-sm font-medium ${rarityMeta[activeRarity].textColor}`}>
              {rarityMeta[activeRarity].description}
            </p>
          </div>
        )}

        {/* Search & filter bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, species or habitat…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-adventure-border bg-white font-sans text-sm text-primary-800 placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all"
            />
          </div>
          <button
            onClick={() => setShowCollectedOnly(v => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-sans font-semibold text-sm border transition-all duration-200 flex-shrink-0 ${
              showCollectedOnly
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                : 'bg-white text-primary-600 border-adventure-border hover:border-emerald-300'
            }`}
          >
            <Icon name="CheckCircleIcon" size={16} />
            Collected Only
          </button>
        </div>

        {/* Main content: grid + detail panel */}
        <div className="flex gap-6 items-start">
          {/* Card grid */}
          <div className={`flex-1 min-w-0 transition-all duration-300 ${selectedCard ? 'lg:max-w-[calc(100%-340px)]' : ''}`}>
            {filteredCards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                  <Icon name="MagnifyingGlassIcon" size={28} className="text-primary-400" />
                </div>
                <p className="font-display text-xl text-primary-700 mb-1">No cards found</p>
                <p className="font-sans text-sm text-earth-400">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                {filteredCards.map((card, i) => (
                  <DiscoveryCard
                    key={card.id}
                    card={card}
                    index={i}
                    isSelected={selectedCard?.id === card.id}
                    onClick={() => setSelectedCard(prev => prev?.id === card.id ? null : card)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Detail panel */}
          {selectedCard && (
            <div className="hidden lg:block w-80 flex-shrink-0 sticky top-6">
              <CardDetailPanel
                card={selectedCard}
                onClose={() => setSelectedCard(null)}
              />
            </div>
          )}
        </div>

        {/* Mobile detail panel (bottom sheet style) */}
        {selectedCard && (
          <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto rounded-t-3xl shadow-2xl">
            <CardDetailPanel
              card={selectedCard}
              onClose={() => setSelectedCard(null)}
            />
          </div>
        )}
        {selectedCard && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedCard(null)}
          />
        )}
      </div>
    </AppLayout>
  );
}
