'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CatchEntry {
  id: string;
  species: string;
  weight_lbs: number | null;
  length_cm: number | null;
  location: string | null;
  catch_status: string;
  submitted_at: string;
  photo_url: string | null;
}

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  approved: { label: 'Approved', bg: 'bg-green-100', text: 'text-green-700' },
  pending:  { label: 'Pending',  bg: 'bg-amber-100', text: 'text-amber-700' },
  rejected: { label: 'Rejected', bg: 'bg-red-100',   text: 'text-red-700'  },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)} weeks ago`;
}

// Check if URL is likely a HEIC file (can't render in browser)
function isHeic(url: string): boolean {
  return url.toLowerCase().includes('.heic') || url.toLowerCase().includes('.heif');
}

export default function RecentCatchActivity() {
  const { user } = useAuth();
  const [catches, setCatches] = useState<CatchEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const supabase = createClient();
    supabase
      .from('catch_submissions')
      .select('id, species, weight_lbs, length_cm, location, catch_status, submitted_at, photo_url')
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false })
      .limit(5)
      .then(({ data, error }) => {
        if (error) console.error('Catch fetch error:', error);
        setCatches(data || []);
        setLoading(false);
      });
  }, [user]);

  return (
    <div className="bg-white rounded-3xl p-5 shadow-card border border-adventure-border">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-xl text-primary-800">My Catch Log</h2>
          <p className="text-xs font-sans text-earth-400 mt-0.5">Your recent fishing adventures</p>
        </div>
        <Link
          href="/catch-log"
          className="flex items-center gap-1.5 text-xs font-sans font-semibold px-3 py-2 rounded-xl text-white transition-all"
          style={{ backgroundColor: '#ff751f' }}
        >
          <Icon name="PlusIcon" size={14} />
          Log Catch
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-16 bg-earth-50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : catches.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-3">
            <Icon name="ClipboardDocumentListIcon" size={28} className="text-primary-300" />
          </div>
          <p className="font-display text-lg text-primary-700 mb-1">No catches yet!</p>
          <p className="text-xs font-sans text-earth-400 mb-4">Start logging your fishing adventures</p>
          <Link
            href="/catch-log"
            className="inline-flex items-center gap-2 text-white font-sans font-semibold text-sm px-4 py-2.5 rounded-xl"
            style={{ backgroundColor: '#ff751f' }}
          >
            <Icon name="PlusCircleIcon" size={16} />
            Log Your First Catch
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {catches.map((c) => {
            const status = statusConfig[c.catch_status] || statusConfig.pending;
            const hasPhoto = !!c.photo_url && !isHeic(c.photo_url);
            const isHeicPhoto = !!c.photo_url && isHeic(c.photo_url);

            return (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-2xl bg-adventure-bg border border-adventure-border hover:border-primary-200 transition-colors">
                {/* Photo or fallback icon */}
                <div className="w-11 h-11 rounded-2xl flex-shrink-0 overflow-hidden">
                  {hasPhoto ? (
                    <img
                      src={c.photo_url!}
                      alt={c.species}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #2D6A4F, #3D9068)' }}
                      title={isHeicPhoto ? 'HEIC photo — upload as JPG/PNG to display' : ''}
                    >
                      {isHeicPhoto
                        ? <Icon name="PhotoIcon" size={18} className="text-white/60" />
                        : <Icon name="SparklesIcon" size={20} className="text-white" />
                      }
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-sans font-semibold text-primary-800 text-sm truncate">{c.species}</p>
                  <p className="text-xs font-sans text-earth-400">
                    {c.weight_lbs ? `${c.weight_lbs} lbs` : ''}
                    {c.weight_lbs && c.length_cm ? ' · ' : ''}
                    {c.length_cm ? `${c.length_cm}cm` : ''}
                    {(c.weight_lbs || c.length_cm) && c.location ? ' · ' : ''}
                    {c.location || ''}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={`text-xs font-sans font-bold px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>
                    {status.label}
                  </span>
                  <span className="text-xs font-sans text-earth-300">{timeAgo(c.submitted_at)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
