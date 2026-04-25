import React from 'react';
import { CatchEntry } from './catchData';

interface CatchStatsBarProps {
  catches: CatchEntry[];
}

export default function CatchStatsBar({ catches }: CatchStatsBarProps) {
  const totalCatches = catches.length;

  const uniqueSpecies = new Set(catches.map((c) => c.species)).size;

  // weight is now a number from Supabase, not a string
  const weights = catches.map((c) => Number(c.weight)).filter((w) => !isNaN(w) && w > 0);
  const biggestWeight = weights.length > 0 ? Math.max(...weights) : 0;
  const biggestCatch = catches.find((c) => Number(c.weight) === biggestWeight);

  const waterTypes = catches.reduce<Record<string, number>>((acc, c) => {
    if (c.waterType) acc[c.waterType] = (acc[c.waterType] || 0) + 1;
    return acc;
  }, {});
  const topWater = Object.entries(waterTypes).sort((a, b) => b[1] - a[1])[0];

  const stats = [
    {
      id: 'stat-total',
      icon: '🎣',
      label: 'Total Catches',
      value: String(totalCatches),
      sub: 'all time',
      color: 'border-primary-200 bg-primary-50',
      textColor: 'text-primary-700',
    },
    {
      id: 'stat-species',
      icon: '🔭',
      label: 'Species Found',
      value: String(uniqueSpecies),
      sub: 'unique types',
      color: 'border-green-200 bg-green-50',
      textColor: 'text-green-700',
    },
    {
      id: 'stat-biggest',
      icon: '🏆',
      label: 'Biggest Catch',
      value: biggestWeight > 0 ? `${biggestWeight} lbs` : '—',
      sub: biggestCatch?.species || '—',
      color: 'border-amber-200 bg-amber-50',
      textColor: 'text-amber-700',
    },
    {
      id: 'stat-water',
      icon: '🌊',
      label: 'Favourite Water',
      value: topWater ? topWater[0] : '—',
      sub: topWater ? `${topWater[1]} catches` : 'no data yet',
      color: 'border-blue-200 bg-blue-50',
      textColor: 'text-blue-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className={`flex items-center gap-3 p-4 rounded-2xl border shadow-card ${stat.color}`}
        >
          <span className="text-2xl flex-shrink-0">{stat.icon}</span>
          <div className="min-w-0">
            <p className="text-xs font-sans font-semibold text-earth-400 uppercase tracking-wider truncate">
              {stat.label}
            </p>
            <p className={`font-display text-xl tabular-nums font-bold ${stat.textColor}`}>
              {stat.value}
            </p>
            <p className="text-xs font-sans text-earth-400 truncate">{stat.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
