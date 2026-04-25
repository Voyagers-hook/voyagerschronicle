'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { CatchEntry } from './catchData';
import { toast } from 'sonner';

interface CatchTableProps {
  catches: CatchEntry[];
  sortField: keyof CatchEntry;
  sortDir: 'asc' | 'desc';
  onSort: (field: keyof CatchEntry) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  allSelected: boolean;
  onDelete: (id: string) => void;
}

const waterTypeBadge: Record<string, string> = {
  River: 'bg-blue-100 text-blue-700 border-blue-200',
  Lake:  'bg-teal-100 text-teal-700 border-teal-200',
  Sea:   'bg-indigo-100 text-indigo-700 border-indigo-200',
  Other: 'bg-gray-100 text-gray-600 border-gray-200',
};

const statusStyle: Record<string, string> = {
  pending:  'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const SortIcon = ({ field, sortField, sortDir }: { field: string; sortField: string; sortDir: string }) => {
  if (sortField !== field) return <Icon name="ChevronUpDownIcon" size={14} className="text-earth-300" />;
  return sortDir === 'asc'
    ? <Icon name="ChevronUpIcon" size={14} className="text-primary-500" />
    : <Icon name="ChevronDownIcon" size={14} className="text-primary-500" />;
};

export default function CatchTable({
  catches, sortField, sortDir, onSort,
  selectedIds, onToggleSelect, onToggleSelectAll, allSelected, onDelete,
}: CatchTableProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const confirmDelete = (id: string) => {
    onDelete(id);
    setDeleteConfirmId(null);
    toast.success('Catch deleted from your log');
  };

  if (catches.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-adventure-border shadow-card p-12 flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #2D6A4F, #3D9068)' }}>
          <Icon name="ClipboardDocumentListIcon" size={32} className="text-white" />
        </div>
        <h3 className="font-display text-xl text-primary-800">No catches found</h3>
        <p className="text-sm font-sans text-earth-400 max-w-xs">
          No catches match your current filters. Try adjusting the search or log a new catch!
        </p>
      </div>
    );
  }

  const cols: Array<{ key: keyof CatchEntry; label: string; sortable: boolean }> = [
    { key: 'species',   label: 'Species',  sortable: true  },
    { key: 'date',      label: 'Date',     sortable: true  },
    { key: 'weight',    label: 'Weight',   sortable: true  },
    { key: 'length',    label: 'Length',   sortable: false },
    { key: 'location',  label: 'Location', sortable: true  },
    { key: 'waterType', label: 'Water',    sortable: true  },
    { key: 'status',    label: 'Status',   sortable: false },
    { key: 'notes',     label: 'Notes',    sortable: false },
  ];

  return (
    <div className="bg-white rounded-2xl border border-adventure-border shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-gradient-to-r from-primary-50 to-earth-50 border-b border-adventure-border">
              <th className="pl-4 pr-2 py-3 w-10">
                <input type="checkbox" checked={allSelected} onChange={onToggleSelectAll}
                  className="w-4 h-4 rounded border-adventure-border accent-primary-600"
                  aria-label="Select all" />
              </th>
              {cols.map((col) => (
                <th key={`th-${col.key}`}
                  className={`px-4 py-3 text-left text-xs font-sans font-semibold text-earth-500 uppercase tracking-wider whitespace-nowrap ${col.sortable ? 'cursor-pointer hover:text-primary-700 select-none' : ''}`}
                  onClick={col.sortable ? () => onSort(col.key) : undefined}>
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && <SortIcon field={col.key} sortField={sortField} sortDir={sortDir} />}
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-sans font-semibold text-earth-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-adventure-border">
            {catches.map((c, idx) => (
              <tr key={c.id}
                className={`group transition-colors duration-100 ${
                  selectedIds.has(c.id) ? 'bg-primary-50' : idx % 2 === 0 ? 'bg-white' : 'bg-earth-50/30'
                } hover:bg-primary-50/60`}>

                <td className="pl-4 pr-2 py-3">
                  <input type="checkbox" checked={selectedIds.has(c.id)}
                    onChange={() => onToggleSelect(c.id)}
                    className="w-4 h-4 rounded border-adventure-border accent-primary-600" />
                </td>

                {/* Species */}
                <td className="px-4 py-3">
                  <span className="font-sans font-semibold text-sm text-primary-800 whitespace-nowrap">
                    🐟 {c.species}
                  </span>
                </td>

                {/* Date */}
                <td className="px-4 py-3 text-sm font-sans text-primary-700 whitespace-nowrap tabular-nums">
                  {new Date(c.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>

                {/* Weight — number in lbs from Supabase */}
                <td className="px-4 py-3 text-sm font-sans font-semibold text-primary-800 tabular-nums whitespace-nowrap">
                  {c.weight > 0 ? `${c.weight} lbs` : '—'}
                </td>

                {/* Length — number from Supabase */}
                <td className="px-4 py-3 text-sm font-sans text-earth-500 tabular-nums whitespace-nowrap">
                  {c.length > 0 ? `${c.length} cm` : '—'}
                </td>

                {/* Location */}
                <td className="px-4 py-3 text-sm font-sans text-primary-700 max-w-[140px]">
                  <span className="truncate block">{c.location || '—'}</span>
                </td>

                {/* Water type */}
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center text-xs font-sans font-semibold px-2 py-0.5 rounded-full border ${waterTypeBadge[c.waterType] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {c.waterType || '—'}
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  {c.status && (
                    <span className={`inline-flex items-center text-xs font-sans font-semibold px-2 py-0.5 rounded-full ${statusStyle[c.status] ?? statusStyle.pending}`}>
                      {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                    </span>
                  )}
                </td>

                {/* Notes */}
                <td className="px-4 py-3 text-xs font-sans text-earth-400 max-w-[180px]">
                  <span className="truncate block">{c.notes || '—'}</span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {deleteConfirmId === c.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => confirmDelete(c.id)}
                          className="px-2 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-sans font-semibold transition-colors">
                          Delete
                        </button>
                        <button onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 rounded-lg hover:bg-earth-100 text-earth-500 text-xs font-sans transition-colors">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirmId(c.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-earth-400 hover:text-red-500 transition-colors"
                        aria-label={`Delete ${c.species} catch`}>
                        <Icon name="TrashIcon" size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
