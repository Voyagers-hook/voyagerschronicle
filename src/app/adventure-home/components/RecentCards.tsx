'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RecentCard {
  id: string;
  name: string;
  rarity: string;
  habitat: string;
  image_url: string | null;
  gradient: string;
  border_color: string;
  foil: boolean;
  power: number;
  collected_at: string;
}

const rarityColors: Record<string, string> = {
  Widespread: 'text-earth-600',
  Elusive:    'text-green-700',
  Specimen:   'text-blue-700',
  Legendary:  'text-amber-700',
};

export default function RecentCards() {
  const { user } = useAuth();
  const [cards, setCards] = useState<RecentCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let isCancelled = false;
    const supabase = createClient();

    supabase
      .from('user_cards')
      .select('collected_at, cards(id, name, rarity, habitat, image_url, gradient, border_color, foil, power)')
      .eq('user_id', user.id)
      .order('collected_at', { ascending: false })
      .limit(4)
      .then(({ data, error }) => {
        if (isCancelled) return;
        if (error) console.error('Recent cards error:', error);
        const mapped = (data || []).map((uc: Record<string, unknown>) => {
          const card = uc.cards as Record<string, unknown> | null;
          return card ? {
            id: card.id as string,
            name: card.name as string,
            rarity: card.rarity as string,
            habitat: card.habitat as string,
            image_url: card.image_url as string | null,
            gradient: card.gradient as string,
            border_color: card.border_color as string,
            foil: card.foil as boolean,
            power: card.power as number,
            collected_at: uc.collected_at as string,
          } : null;
        }).filter(Boolean) as RecentCard[];
        setCards(mapped);
        setLoading(false);
      });

    return () => { isCancelled = true; };
  }, [user]);

  return (
    <div className="bg-white rounded-3xl p-5 shadow-card border border-adventure-border">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-xl text-primary-800">Recent Cards</h2>
          <p className="text-xs font-sans text-earth-400 mt-0.5">Your latest additions</p>
        </div>
        <Link href="/card-collection" className="text-xs font-sans font-semibold px-3 py-2 rounded-xl text-white" style={{ backgroundColor: '#ff751f' }}>
          View All
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[2/3] rounded-2xl bg-earth-100 animate-pulse" />)}
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-3">
            <Icon name="BookOpenIcon" size={24} className="text-primary-300" />
          </div>
          <p className="font-display text-lg text-primary-700 mb-1">No cards yet!</p>
          <p className="text-xs font-sans text-earth-400 mb-4">Open a pack to start your collection</p>
          <Link href="/card-opening" className="inline-flex items-center gap-2 text-white font-sans font-semibold text-sm px-4 py-2.5 rounded-xl" style={{ backgroundColor: '#ff751f' }}>
            <Icon name="GiftIcon" size={16} />
            Open a Pack
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {cards.map((card) => (
            <Link key={card.id} href="/card-collection" className="group block">
              <div
                className="aspect-[2/3] rounded-2xl overflow-hidden relative cursor-pointer transition-transform duration-200 group-hover:scale-105"
                style={{ border: `2px solid ${card.border_color}` }}
              >
                {/* Card image or gradient fallback */}
                {card.image_url ? (
                  <img
                    src={card.image_url}
                    alt={card.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className={`bg-gradient-to-br ${card.gradient} w-full h-full flex flex-col items-center justify-center p-2 relative`}>
                    {card.foil && (
                      <div className="absolute inset-0 opacity-30 pointer-events-none foil-shimmer" />
                    )}
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-1 relative z-10">
                      <Icon name="SparklesIcon" size={18} className="text-white/80" />
                    </div>
                    <p className="text-white font-display text-xs text-center leading-tight drop-shadow relative z-10">{card.name}</p>
                  </div>
                )}

                {/* Foil overlay on images */}
                {card.image_url && card.foil && (
                  <div className="absolute inset-0 opacity-30 pointer-events-none foil-shimmer" />
                )}

                {/* Bottom bar with name and rarity */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm px-2 py-1.5">
                  <p className="text-white font-display text-[10px] leading-tight truncate">{card.name}</p>
                  <span className={`text-[10px] font-sans font-bold ${card.image_url ? 'text-white/80' : rarityColors[card.rarity] || 'text-earth-600'}`}>
                    {card.rarity}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
