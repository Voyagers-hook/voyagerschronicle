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

  return (
    <div className="bg-white rounded-2xl border border-adventure-border shadow-card p-5">
      {/* Header with buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="font-display text-xl text-primary-800">My Catch Log</h2>
        <div className="flex items-center gap-2">
          <Link
            href="/catch-log"
            className="inline-flex items-center gap-2 text-white font-sans font-semibold text-xs px-4 py-2.5 rounded-xl transition-all active:scale-95 hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, #ff751f, #e85a00)' }}
          >
            <Icon name="PlusCircleIcon" size={14} />
            Log a Catch
          </Link>
          <Link
            href="/catch-log"
            className="inline-flex items-center gap-2 font-sans font-semibold text-xs px-4 py-2.5 rounded-xl border border-adventure-border text-earth-500 hover:bg-adventure-bg transition-all active:scale-95"
          >
            <Icon name="EyeIcon" size={14} />
            View All
          </Link>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="aspect-[4/3] rounded-2xl bg-earth-100 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && catches.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-3">
            <Icon name="CameraIcon" size={28} className="text-primary-300" />
          </div>
          <p className="text-sm font-sans text-earth-400 max-w-xs">
            No approved catches yet. Log a catch and get it approved to see it here!
          </p>
        </div>
      )}

      {/* Gallery */}
      {!loading && catches.length > 0 && (
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
      )}
    </div>
  );
}
