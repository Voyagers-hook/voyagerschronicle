'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RecentCatch {
  id: string;
  species: string;
  photo_url: string | null;
  submitted_at: string;
  catch_status: string;
}

export default function RecentCatchesGallery() {
  const { user } = useAuth();
  const [catches, setCatches] = useState<RecentCatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    let isCancelled = false;
    const supabase = createClient();

    supabase
      .from('catch_submissions')
      .select('id, species, photo_url, submitted_at, catch_status')
      .eq('user_id', user.id)
      .eq('catch_status', 'approved')
      .order('submitted_at', { ascending: false })
      .limit(3)
      .then(({ data, error }) => {
        if (isCancelled) return;
        if (error) console.error('Recent catches error:', error);
        setCatches(data ?? []);
        setLoading(false);
      });

    return () => { isCancelled = true; };
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-adventure-border shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-primary-800">Recent Catches</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="aspect-[4/3] rounded-2xl bg-earth-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (catches.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-adventure-border shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-primary-800">Recent Catches</h2>
          <Link href="/catch-log" className="text-xs font-sans font-semibold hover:underline" style={{ color: '#ff751f' }}>
            View All →
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-3">
            <Icon name="CameraIcon" size={28} className="text-primary-300" />
          </div>
          <p className="text-sm font-sans text-earth-400 max-w-xs">
            No approved catches yet. Log a catch and get it approved to see it here!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-adventure-border shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl text-primary-800">Recent Catches</h2>
        <Link href="/catch-log" className="text-xs font-sans font-semibold hover:underline" style={{ color: '#ff751f' }}>
          View All →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {catches.map(c => (
          <Link key={c.id} href="/catch-log" className="group block">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-earth-100 border border-adventure-border">
              {c.photo_url ? (
                <img
                  src={c.photo_url}
                  alt={c.species}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon name="CameraIcon" size={32} className="text-earth-300" />
                </div>
              )}
              {/* Overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                <p className="font-sans font-semibold text-white text-sm">{c.species}</p>
                <p className="text-white/70 text-xs font-sans">
                  {new Date(c.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
