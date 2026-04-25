'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Icon from '@/components/ui/AppIcon';
import CatchStatsBar from './CatchStatsBar';
import CatchTable from './CatchTable';
import LogCatchPanel from './LogCatchPanel';
import { CatchEntry } from './catchData';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function CatchLogClient() {
  const { user } = useAuth();
  const supabase = createClient();

  const [catches, setCatches] = useState<CatchEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecies, setFilterSpecies] = useState('all');
  const [filterWater, setFilterWater] = useState('all');
  const [sortField, setSortField] = useState<keyof CatchEntry>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // ── Fetch this user's catches from Supabase ──────────────────────────────
  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const fetchCatches = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('catch_submissions')
        .select('*')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching catches:', error);
        setLoading(false);
        return;
      }

      // Map Supabase rows → CatchEntry shape the UI expects
      const mapped: CatchEntry[] = (data ?? []).map((row) => ({
        id: row.id,
        species: row.species,
        weight: row.weight_kg ?? 0,
        length: row.length_cm ?? 0,
        location: row.location ?? '',
        notes: row.notes ?? '',
        waterType: row.water_type ?? 'River',
        date: row.submitted_at,
        status: row.catch_status as 'pending' | 'approved' | 'rejected',
        imageUrl: row.image_url ?? '',
      }));

      setCatches(mapped);
      setLoading(false);
    };

    fetchCatches();
  }, [user]);

  // ── Add a new catch (inserts into Supabase as pending) ───────────────────
  const handleAddCatch = async (entry: CatchEntry) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('catch_submissions')
      .insert({
        user_id: user.id,
        species: entry.species,
        weight_kg: entry.weight,
        length_cm: entry.length,
        location: entry.location,
        notes: entry.notes,
        water_type: entry.waterType,
        image_url: entry.imageUrl ?? null,
        catch_status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving catch:', error);
      return;
    }

    // Prepend the new row to local state immediately
    const newEntry: CatchEntry = {
      id: data.id,
      species: data.species,
      weight: data.weight_kg ?? 0,
      length: data.length_cm ?? 0,
      location: data.location ?? '',
      notes: data.notes ?? '',
      waterType: data.water_type ?? 'River',
      date: data.submitted_at,
      status: data.catch_status,
      imageUrl: data.image_url ?? '',
    };

    setCatches((prev) => [newEntry, ...prev]);
    setPanelOpen(false);
  };

  // ── Delete a catch ────────────────────────────────────────────────────────
  const handleDeleteCatch = async (id: string) => {
    const { error } = await supabase
      .from('catch_submissions')
      .delete()
      .eq('id', id)
      .eq('user_id', user!.id); // safety: only delete own rows

    if (error) {
      console.error('Error deleting catch:', error);
      return;
    }

    setCatches((prev) => prev.filter((c) => c.id !== id));
    setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
  };

  // ── Bulk delete ───────────────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);

    const { error } = await supabase
      .from('catch_submissions')
      .delete()
      .in('id', ids)
      .eq('user_id', user!.id);

    if (error) {
      console.error('Error bulk deleting catches:', error);
      return;
    }

    setCatches((prev) => prev.filter((c) => !selectedIds.has(c.id)));
    setSelectedIds(new Set());
  };

  // ── Filtering & sorting ───────────────────────────────────────────────────
  const allSpecies = useMemo(() => {
    const s = new Set(catches.map((c) => c.species));
    return ['all', ...Array.from(s)];
  }, [catches]);

  const filtered = useMemo(() => {
    let data = [...catches];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (c) =>
          c.species.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          (c.notes ?? '').toLowerCase().includes(q)
      );
    }
    if (filterSpecies !== 'all') data = data.filter((c) => c.species === filterSpecies);
    if (filterWater !== 'all') data = data.filter((c) => c.waterType === filterWater);

    data.sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return data;
  }, [catches, searchQuery, filterSpecies, filterWater, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (field: keyof CatchEntry) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(paginated.map((c) => c.id)));
  };

  const lastCatch = catches[0]
    ? new Date(catches[0].date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-primary-800">Catch Log</h1>
          <p className="text-sm font-sans text-earth-400 mt-0.5">
            {loading
              ? 'Loading your catches...'
              : catches.length === 0
              ? 'No catches yet — log your first one!'
              : `${catches.length} catch${catches.length !== 1 ? 'es' : ''} recorded${lastCatch ? ` · Last logged ${lastCatch}` : ''}`}
          </p>
        </div>
        <button
          onClick={() => setPanelOpen(true)}
          className="
            inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600
            text-white font-sans font-semibold text-sm
            px-5 py-3 rounded-xl shadow-card
            transition-all duration-150 active:scale-95
          "
        >
          <Icon name="PlusIcon" size={18} />
          Log New Catch
        </button>
      </div>

      {/* Stats bar */}
      {!loading && <CatchStatsBar catches={catches} />}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-adventure-border p-4 shadow-card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400">
              <Icon name="MagnifyingGlassIcon" size={16} />
            </div>
            <input
              type="text"
              placeholder="Search species, location, notes..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-adventure-border bg-adventure-bg text-sm font-sans text-primary-800 placeholder-earth-300 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all"
            />
          </div>

          <select
            value={filterSpecies}
            onChange={(e) => { setFilterSpecies(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2.5 rounded-xl border border-adventure-border bg-adventure-bg text-sm font-sans text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all cursor-pointer"
          >
            {allSpecies.map((s) => (
              <option key={`species-opt-${s}`} value={s}>
                {s === 'all' ? 'All Species' : s}
              </option>
            ))}
          </select>

          <select
            value={filterWater}
            onChange={(e) => { setFilterWater(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2.5 rounded-xl border border-adventure-border bg-adventure-bg text-sm font-sans text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all cursor-pointer"
          >
            {['all', 'River', 'Lake', 'Sea', 'Dam', 'Creek'].map((w) => (
              <option key={`water-opt-${w}`} value={w}>
                {w === 'all' ? 'All Water Types' : w}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 text-xs font-sans text-earth-400 bg-adventure-bg rounded-xl px-3 py-2.5 border border-adventure-border whitespace-nowrap">
            <Icon name="FunnelIcon" size={14} />
            {loading ? '...' : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
          </div>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 rounded-2xl bg-earth-100 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && catches.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
            <Icon name="FishIcon" size={32} className="text-primary-300" />
          </div>
          <h3 className="font-display text-xl text-primary-700 mb-1">No catches yet</h3>
          <p className="text-sm font-sans text-earth-400 max-w-xs">
            Log your first catch and it will appear here once submitted. Approved catches earn you XP!
          </p>
        </div>
      )}

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-primary-900 text-white rounded-2xl px-5 py-3 shadow-panel flex items-center gap-4 fade-in">
          <span className="text-sm font-sans font-medium">
            {selectedIds.size} catch{selectedIds.size !== 1 ? 'es' : ''} selected
          </span>
          <div className="w-px h-4 bg-white/30" />
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 bg-red-500 hover:bg-red-400 text-white text-sm font-sans font-semibold px-3 py-1.5 rounded-lg transition-colors active:scale-95"
          >
            <Icon name="TrashIcon" size={14} />
            Delete Selected
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-white/60 hover:text-white text-sm font-sans transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && catches.length > 0 && (
        <CatchTable
          catches={paginated}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          allSelected={selectedIds.size === paginated.length && paginated.length > 0}
          onDelete={handleDeleteCatch}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-2xl border border-adventure-border px-5 py-3.5 shadow-card">
          <p className="text-xs font-sans text-earth-400">
            Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} catches
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-primary-50 text-primary-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <Icon name="ChevronLeftIcon" size={16} />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={`page-${i + 1}`}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-xs font-sans font-semibold transition-colors ${
                  currentPage === i + 1
                    ? 'bg-primary-500 text-white'
                    : 'text-primary-600 hover:bg-primary-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-primary-50 text-primary-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <Icon name="ChevronRightIcon" size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Log Catch Panel */}
      {panelOpen && (
        <LogCatchPanel
          onClose={() => setPanelOpen(false)}
          onSave={handleAddCatch}
          totalCatches={catches.length}
        />
      )}
    </div>
  );
}
