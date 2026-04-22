'use client';

import React, { useState, useMemo } from 'react';
import Icon from '@/components/ui/AppIcon';
import CatchStatsBar from './CatchStatsBar';
import CatchTable from './CatchTable';
import LogCatchPanel from './LogCatchPanel';
import { CatchEntry } from './catchData';
import { initialCatches } from './catchData';

export default function CatchLogClient() {
  const [catches, setCatches] = useState<CatchEntry[]>(initialCatches);
  const [panelOpen, setPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecies, setFilterSpecies] = useState('all');
  const [filterWater, setFilterWater] = useState('all');
  const [sortField, setSortField] = useState<keyof CatchEntry>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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
          c.notes.toLowerCase().includes(q)
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

  const handleAddCatch = (entry: CatchEntry) => {
    setCatches((prev) => [entry, ...prev]);
    setPanelOpen(false);
  };

  const handleDeleteCatch = (id: string) => {
    setCatches((prev) => prev.filter((c) => c.id !== id));
    setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
  };

  const handleBulkDelete = () => {
    setCatches((prev) => prev.filter((c) => !selectedIds.has(c.id)));
    setSelectedIds(new Set());
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

  return (
    <div className="space-y-5 fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-primary-800">Catch Log</h1>
          <p className="text-sm font-sans text-earth-400 mt-0.5">
            {catches.length} catches recorded · Last logged 21 Apr 2026
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
      <CatchStatsBar catches={catches} />

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-adventure-border p-4 shadow-card">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
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

          {/* Species filter */}
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

          {/* Water type filter */}
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

          {/* Results count */}
          <div className="flex items-center gap-1.5 text-xs font-sans text-earth-400 bg-adventure-bg rounded-xl px-3 py-2.5 border border-adventure-border whitespace-nowrap">
            <Icon name="FunnelIcon" size={14} />
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

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
                    ? 'bg-primary-500 text-white' :'text-primary-600 hover:bg-primary-50'
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