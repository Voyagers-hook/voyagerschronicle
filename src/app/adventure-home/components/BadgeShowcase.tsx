'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

// Backend integration point: fetch badges from /api/badges?memberId=current
const badges = [
  { id: 'badge-first-cast', icon: 'FishIcon', name: 'First Cast', rarity: 'Common', earned: true, earnedDate: '12 Jan 2026' },
  { id: 'badge-river-ranger', icon: 'WaterIcon', name: 'River Ranger', rarity: 'Rare', earned: false, progress: 75, needed: 10, current: 8 },
  { id: 'badge-big-fish', icon: 'TrophyIcon', name: 'Big Fish', rarity: 'Epic', earned: true, earnedDate: '14 Apr 2026' },
  { id: 'badge-night-fisher', icon: 'MoonIcon', name: 'Night Fisher', rarity: 'Rare', earned: false, progress: 30, needed: 3, current: 1 },
  { id: 'badge-species-hunter', icon: 'MagnifyingGlassIcon', name: 'Species Hunter', rarity: 'Uncommon', earned: true, earnedDate: '31 Mar 2026' },
  { id: 'badge-sea-legs', icon: 'MapPinIcon', name: 'Sea Legs', rarity: 'Common', earned: false, progress: 0, needed: 5, current: 0 },
];

const rarityColor: Record<string, string> = {
  Common: 'text-earth-500',
  Uncommon: 'text-green-600',
  Rare: 'text-blue-600',
  Epic: 'text-purple-600',
  Legendary: 'text-amber-600',
};

export default function BadgeShowcase() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-card border border-adventure-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-xl text-primary-800">Badge Collection</h2>
          <p className="text-xs font-sans text-earth-400 mt-0.5">3 earned · 3 in progress</p>
        </div>
        <div className="bg-accent-50 border border-accent-200 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
          <Icon name="TrophyIcon" size={16} className="text-accent-600" />
          <span className="font-sans font-bold text-accent-700 text-sm tabular-nums">12</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className="relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-150 cursor-pointer"
            style={{
              background: badge.earned ? 'linear-gradient(135deg, #FEF7EB, #FDF6EC)' : '#F9F9F9',
              borderColor: badge.earned ? '#FAD08A' : '#E8DDD0',
            }}
            onMouseEnter={() => setHoveredId(badge.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Earned glow */}
            {badge.earned && (
              <div className="absolute inset-0 rounded-xl ring-1 ring-accent-300/50" />
            )}

            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-150 ${hoveredId === badge.id ? 'scale-110' : ''} ${!badge.earned ? 'opacity-40' : ''}`}
              style={{ background: badge.earned ? 'linear-gradient(135deg, #ff751f, #E9A23B)' : '#e5e7eb' }}
            >
              <Icon
                name={badge.icon as Parameters<typeof Icon>[0]['name']}
                size={20}
                className={badge.earned ? 'text-white' : 'text-gray-400'}
              />
            </div>

            <p className="text-xs font-sans font-semibold text-primary-800 text-center leading-tight">
              {badge.name}
            </p>

            <p className={`text-xs font-sans font-medium ${rarityColor[badge.rarity]}`}>
              {badge.rarity}
            </p>

            {/* Progress bar for unearned */}
            {!badge.earned && badge.progress !== undefined && badge.progress > 0 && (
              <div className="w-full h-1 bg-earth-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-400 rounded-full transition-all duration-300"
                  style={{ width: `${badge.progress}%` }}
                />
              </div>
            )}

            {badge.earned && (
              <div className="flex items-center gap-0.5 text-green-600">
                <Icon name="CheckCircleIcon" size={12} />
                <span className="text-xs font-sans font-medium">Earned</span>
              </div>
            )}

            {/* Hover tooltip */}
            {hoveredId === badge.id && !badge.earned && badge.current !== undefined && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary-900 text-white text-xs font-sans rounded-lg px-2.5 py-1.5 whitespace-nowrap z-20 pointer-events-none">
                {badge.current}/{badge.needed} to unlock
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-primary-900" />
              </div>
            )}
          </div>
        ))}
      </div>

      <button className="mt-4 w-full text-xs font-sans font-semibold text-primary-600 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 rounded-xl py-2.5 transition-colors flex items-center justify-center gap-1.5">
        <Icon name="TrophyIcon" size={14} />
        View All 48 Badges
      </button>
    </div>
  );
}