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
  notes: string | null;
  water_type: string | null;
}

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  approved: { label: 'Approved', bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  pending:  { label: 'Pending',  bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  rejected: { label: 'Rejected', bg: 'bg-red-100',   text: 'text-red-700',   dot: 'bg-red-500'   },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)} weeks ago`;
}

function canDisplay(url: string | null): boolean {
  if (!url) return false;
  const l = url.toLowerCase();
  return !l.includes('.heic') && !l.includes('.heif');
}

// ── Catch detail modal ───────────────────────────────────────────────────────
function CatchDetailModal({ c, onClose }: { c: CatchEntry; onClose: () => void }) {
  const status = statusConfig[c.catch_status] || statusConfig.pending;
  const hasPhoto = canDisplay(c.photo_url);
  const isHeic = !!c.photo_url && !hasPhoto;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div className="bg-white rounded-3xl overflow-hidden w-full max-w-sm shadow-2xl"
        onClick={e => e.stopPropagation()}>

        {/* Photo or placeholder */}
        <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
          {hasPhoto ? (
            <img src={c.photo_url!} alt={c.species} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #2D6A4F, #3D9068)' }}>
              <Icon name="PhotoIcon" size={48} className="text-white/30 mb-2" />
              {isHeic && <p className="text-white/50 text-xs font-sans px-6 text-center">iPhone HEIC photo — upload as JPG to display</p>}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-10">
            <p className="font-display text-2xl text-white drop-shadow leading-tight">{c.species}</p>
            <p className="text-white/65 text-sm font-sans">{timeAgo(c.submitted_at)}</p>
          </div>
          <button onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors">
            <Icon name="XMarkIcon" size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className={`flex items-center gap-1.5 text-xs font-sans font-bold px-3 py-1.5 rounded-full ${status.bg} ${status.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
            <span className="text-xs font-sans text-earth-400">
              {new Date(c.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            {!!c.weight_lbs && c.weight_lbs > 0 && (
              <div className="bg-adventure-bg rounded-2xl p-3 border border-adventure-border">
                <p className="text-xs font-sans text-earth-400 uppercase tracking-wide mb-1">Weight</p>
                <p className="font-display text-xl text-primary-800">{c.weight_lbs} lbs</p>
              </div>
            )}
            {!!c.length_cm && c.length_cm > 0 && (
              <div className="bg-adventure-bg rounded-2xl p-3 border border-adventure-border">
                <p className="text-xs font-sans text-earth-400 uppercase tracking-wide mb-1">Length</p>
                <p className="font-display text-xl text-primary-800">{c.length_cm} cm</p>
              </div>
            )}
            {c.location && (
              <div className="bg-adventure-bg rounded-2xl p-3 border border-adventure-border">
                <p className="text-xs font-sans text-earth-400 uppercase tracking-wide mb-1">Location</p>
                <p className="text-sm font-sans font-semibold text-primary-700 truncate">{c.location}</p>
              </div>
            )}
            {c.water_type && (
              <div className="bg-adventure-bg rounded-2xl p-3 border border-adventure-border">
                <p className="text-xs font-sans text-earth-400 uppercase tracking-wide mb-1">Water</p>
                <p className="text-sm font-sans font-semibold text-primary-700">{c.water_type}</p>
              </div>
            )}
          </div>

          {/* Notes */}
          {c.notes && (
            <div className="bg-adventure-bg rounded-2xl p-3 border border-adventure-border">
              <p className="text-xs font-sans text-earth-400 uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm font-sans text-primary-700 leading-relaxed">{c.notes}</p>
            </div>
          )}

          {/* Status message */}
          {c.catch_status === 'pending' && (
            <p className="text-xs font-sans text-earth-400 text-center">⏳ Awaiting approval from the Voyagers Hook team</p>
          )}
          {c.catch_status === 'approved' && (
            <p className="text-xs font-sans text-green-600 text-center font-semibold">✓ Approved — XP added to your account!</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function RecentCatchActivity() {
  const { user } = useAuth();
  const [catches, setCatches] = useState<CatchEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CatchEntry | null>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const supabase = createClient();
    supabase
      .from('catch_submissions')
      .select('id, species, weight_lbs, length_cm, location, catch_status, submitted_at, photo_url, notes, water_type')
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false })
      .limit(6)
      .then(({ data, error }) => {
        if (error) console.error('Catch fetch error:', error);
        setCatches(data || []);
        setLoading(false);
      });
  }, [user]);

  const photocatches = catches.filter(c => canDisplay(c.photo_url));
  const listCatches  = catches.filter(c => !canDisplay(c.photo_url));

  return (
    <>
      <div className="bg-white rounded-3xl p-5 shadow-card border border-adventure-border">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-xl text-primary-800">My Catch Log</h2>
            <p className="text-xs font-sans text-earth-400 mt-0.5">Your recent fishing adventures</p>
          </div>
          <Link href="/catch-log"
            className="flex items-center gap-1.5 text-xs font-sans font-semibold px-3 py-2 rounded-xl text-white"
            style={{ backgroundColor: '#ff751f' }}>
            <Icon name="PlusIcon" size={14} />
            Log Catch
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-earth-50 rounded-2xl animate-pulse" />)}
          </div>
        ) : catches.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-3">
              <Icon name="ClipboardDocumentListIcon" size={28} className="text-primary-300" />
            </div>
            <p className="font-display text-lg text-primary-700 mb-1">No catches yet!</p>
            <p className="text-xs font-sans text-earth-400 mb-4">Start logging your fishing adventures</p>
            <Link href="/catch-log"
              className="inline-flex items-center gap-2 text-white font-sans font-semibold text-sm px-4 py-2.5 rounded-xl"
              style={{ backgroundColor: '#ff751f' }}>
              <Icon name="PlusCircleIcon" size={16} />
              Log Your First Catch
            </Link>
          </div>
        ) : (
          <div className="space-y-3">

            {/* Photo grid */}
            {photocatches.length > 0 && (
              <div className={`grid gap-2 ${photocatches.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {photocatches.map(c => {
                  const status = statusConfig[c.catch_status] || statusConfig.pending;
                  return (
                    <div key={c.id}
                      className="relative rounded-2xl overflow-hidden cursor-pointer group"
                      style={{ aspectRatio: '4/3' }}
                      onClick={() => setSelected(c)}>
                      <img src={c.photo_url!} alt={c.species}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      {/* Status dot */}
                      <span className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full border-2 border-white ${status.dot}`} title={status.label} />
                      {/* Name + time */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="font-sans font-bold text-white text-sm truncate">{c.species}</p>
                        <p className="text-white/60 text-xs font-sans">{timeAgo(c.submitted_at)}</p>
                      </div>
                      {/* Hover overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black/40 rounded-full px-3 py-1.5 flex items-center gap-1.5">
                          <Icon name="EyeIcon" size={14} className="text-white" />
                          <span className="text-white text-xs font-sans font-semibold">View details</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* List rows for catches without photos */}
            {listCatches.map(c => {
              const status = statusConfig[c.catch_status] || statusConfig.pending;
              return (
                <div key={c.id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-adventure-bg border border-adventure-border hover:border-primary-200 transition-colors cursor-pointer"
                  onClick={() => setSelected(c)}>
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #2D6A4F, #3D9068)' }}>
                    <Icon name="SparklesIcon" size={20} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans font-semibold text-primary-800 text-sm truncate">{c.species}</p>
                    <p className="text-xs font-sans text-earth-400">
                      {c.weight_lbs ? `${c.weight_lbs} lbs` : ''}
                      {c.weight_lbs && c.location ? ' · ' : ''}
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

      {selected && <CatchDetailModal c={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
