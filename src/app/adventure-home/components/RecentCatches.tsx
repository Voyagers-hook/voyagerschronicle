import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

// Backend integration point: fetch latest 5 catches from /api/catches?limit=5
const recentCatches = [
  {
    id: 'catch-047',
    species: 'Rainbow Trout',
    weight: '1.8 kg',
    location: 'Thredbo River',
    waterType: 'River',
    date: '21 Apr 2026',
    emoji: '🐟',
    color: 'bg-blue-50 border-blue-200',
  },
  {
    id: 'catch-046',
    species: 'Murray Cod',
    weight: '3.4 kg',
    location: 'Murray River',
    waterType: 'River',
    date: '14 Apr 2026',
    emoji: '🐠',
    color: 'bg-green-50 border-green-200',
  },
  {
    id: 'catch-045',
    species: 'Yellowbelly',
    weight: '1.2 kg',
    location: 'Lake Hume',
    waterType: 'Lake',
    date: '14 Apr 2026',
    emoji: '🦈',
    color: 'bg-yellow-50 border-yellow-200',
  },
  {
    id: 'catch-044',
    species: 'Flathead',
    weight: '0.9 kg',
    location: 'Port Phillip Bay',
    waterType: 'Sea',
    date: '7 Apr 2026',
    emoji: '🐡',
    color: 'bg-orange-50 border-orange-200',
  },
  {
    id: 'catch-043',
    species: 'Silver Perch',
    weight: '0.6 kg',
    location: 'Ovens River',
    waterType: 'River',
    date: '31 Mar 2026',
    emoji: '🐟',
    color: 'bg-purple-50 border-purple-200',
  },
];

const waterTypeBadge: Record<string, string> = {
  River: 'bg-blue-100 text-blue-700',
  Lake: 'bg-teal-100 text-teal-700',
  Sea: 'bg-indigo-100 text-indigo-700',
};

export default function RecentCatches() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-card border border-adventure-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-xl text-primary-800">Recent Catches</h2>
          <p className="text-xs font-sans text-earth-400 mt-0.5">Your last 5 logged fish</p>
        </div>
        <Link
          href="/catch-log"
          className="flex items-center gap-1.5 text-xs font-sans font-semibold text-primary-600 hover:text-primary-800 transition-colors bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg"
        >
          View All
          <Icon name="ArrowRightIcon" size={14} />
        </Link>
      </div>

      <div className="space-y-2">
        {recentCatches.map((catch_) => (
          <div
            key={catch_.id}
            className={`flex items-center gap-3 p-3 rounded-xl border ${catch_.color} transition-all duration-150 hover:shadow-sm cursor-pointer`}
          >
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm flex-shrink-0">
              {catch_.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-sans font-semibold text-sm text-primary-800 truncate">
                  {catch_.species}
                </p>
                <span className={`text-xs font-sans font-semibold px-1.5 py-0.5 rounded-full ${waterTypeBadge[catch_.waterType]}`}>
                  {catch_.waterType}
                </span>
              </div>
              <p className="text-xs font-sans text-earth-400 truncate">
                {catch_.location} · {catch_.date}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-sans font-semibold text-sm text-primary-700 tabular-nums">{catch_.weight}</p>
              <p className="text-xs font-sans text-earth-300">{catch_.id}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}