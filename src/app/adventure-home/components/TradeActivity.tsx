'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TradeItem {
  id: string;
  from_username: string;
  offered_card_name: string;
  offered_card_rarity: string;
  wanted_card_name: string;
  trade_status: string;
  created_at: string;
}

const rarityColors: Record<string, string> = {
  Widespread: '#c49050',
  Elusive:    '#2D6A4F',
  Specimen:   '#3B82F6',
  Legendary:  '#F59E0B',
};

export default function TradeActivity() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<TradeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const supabase = createClient();
    supabase
      .from('trades')
      .select(`
        id, trade_status, created_at,
        from_user:user_profiles!trades_from_user_id_fkey(username),
        offered_card:cards!trades_offered_card_id_fkey(name, rarity),
        wanted_card:cards!trades_wanted_card_id_fkey(name, rarity)
      `)
      .eq('to_user_id', user.id)
      .eq('trade_status', 'pending')
      .order('created_at', { ascending: false })
      .limit(4)
      .then(({ data }) => {
        const mapped = (data || []).map((t: Record<string, unknown>) => ({
          id: t.id as string,
          from_username: (t.from_user as { username: string } | null)?.username || 'Angler',
          offered_card_name: (t.offered_card as { name: string } | null)?.name || 'Unknown',
          offered_card_rarity: (t.offered_card as { rarity: string } | null)?.rarity || 'Widespread',
          wanted_card_name: (t.wanted_card as { name: string } | null)?.name || 'Unknown',
          trade_status: t.trade_status as string,
          created_at: t.created_at as string,
        }));
        setTrades(mapped);
        setLoading(false);
      });
  }, [user]);

  return (
    <div className="bg-white rounded-3xl p-5 shadow-card border border-adventure-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-xl text-primary-800">Trade Offers</h2>
          <p className="text-xs font-sans text-earth-400 mt-0.5">Incoming trade requests</p>
        </div>
        <Link href="/trading" className="text-xs font-sans font-semibold px-3 py-2 rounded-xl text-white" style={{ backgroundColor: '#ff751f' }}>
          Trading Post
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2].map(i => <div key={i} className="h-14 bg-earth-50 rounded-2xl animate-pulse" />)}
        </div>
      ) : trades.length === 0 ? (
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-2">
            <Icon name="ArrowsRightLeftIcon" size={20} className="text-primary-300" />
          </div>
          <p className="text-sm font-sans text-earth-400">No pending trades</p>
          <Link href="/trading" className="text-xs font-sans font-semibold mt-2 inline-block" style={{ color: '#ff751f' }}>
            Browse the Trading Post
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {trades.map((trade) => (
            <div key={trade.id} className="flex items-center gap-3 p-3 rounded-2xl bg-adventure-bg border border-adventure-border">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${rarityColors[trade.offered_card_rarity]}20` }}>
                <Icon name="ArrowsRightLeftIcon" size={16} style={{ color: rarityColors[trade.offered_card_rarity] }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-sans font-semibold text-primary-800 truncate">
                  <span style={{ color: '#ff751f' }}>{trade.from_username}</span> offers {trade.offered_card_name}
                </p>
                <p className="text-xs font-sans text-earth-400 truncate">Wants: {trade.wanted_card_name}</p>
              </div>
              <span className="text-xs font-sans font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex-shrink-0">
                Pending
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
