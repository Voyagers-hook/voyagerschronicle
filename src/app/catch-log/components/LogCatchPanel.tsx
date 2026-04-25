'use client';

import React, { useState, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';
import { CatchEntry, UK_SPECIES } from './catchData';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LogCatchPanelProps {
  onClose: () => void;
  onSave: (entry: CatchEntry) => void;
  totalCatches: number;
}

const WATER_TYPES = ['River', 'Lake', 'Sea', 'Dam', 'Creek'];

export default function LogCatchPanel({ onClose, onSave, totalCatches }: LogCatchPanelProps) {
  const { user } = useAuth();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    species: '',
    speciesInput: '',       // for the typeahead input
    weight: '',             // lbs
    length: '',             // cm
    location: '',
    waterType: 'River',
    notes: '',
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Species typeahead filtering
  const suggestions = form.speciesInput.length > 0
    ? UK_SPECIES.filter(s => s.toLowerCase().includes(form.speciesInput.toLowerCase())).slice(0, 8)
    : [];

  const handleSpeciesSelect = (species: string) => {
    setForm(p => ({ ...p, species, speciesInput: species }));
    setShowSuggestions(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.species.trim()) { setError('Please select or enter a species.'); return; }
    if (!user) return;

    setSaving(true);
    setError('');

    // Upload photo if one was selected
    let photoUrl: string | null = null;
    if (photoFile) {
      const ext = photoFile.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('catch-photos')
        .upload(path, photoFile);

      if (uploadError) {
        setError('Photo upload failed: ' + uploadError.message);
        setSaving(false);
        return;
      }

      const { data } = supabase.storage.from('catch-photos').getPublicUrl(path);
      photoUrl = data.publicUrl;
    }

    // Insert into Supabase
    const { data, error: insertError } = await supabase
      .from('catch_submissions')
      .insert({
        user_id:     user.id,
        species:     form.species.trim(),
        weight_lbs:  form.weight ? Number(form.weight) : null,
        length_cm:   form.length ? Number(form.length) : null,
        location:    form.location.trim() || null,
        water_type:  form.waterType,
        notes:       form.notes.trim() || null,
        photo_url:   photoUrl,
        catch_status: 'pending',
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    // Pass back to parent
    onSave({
      id:       data.id,
      species:  data.species,
      weight:   data.weight_lbs ?? 0,
      length:   data.length_cm ?? 0,
      location: data.location ?? '',
      waterType: data.water_type ?? 'River',
      date:     data.submitted_at,
      notes:    data.notes ?? '',
      status:   data.catch_status,
      photoUrl: data.photo_url ?? undefined,
    });

    setSaving(false);
  };

  const inputCls = 'w-full border border-adventure-border rounded-xl px-4 py-2.5 text-sm font-sans text-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white placeholder-earth-300 transition-all';
  const labelCls = 'block text-xs font-sans font-semibold text-earth-500 uppercase tracking-wide mb-1.5';

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-adventure-border px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-display text-xl text-primary-800">Log a Catch</h2>
            <p className="text-xs font-sans text-earth-400">{totalCatches} catches logged so far</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-earth-100 text-earth-400 transition-colors">
            <Icon name="XMarkIcon" size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Photo upload */}
          <div>
            <label className={labelCls}>Photo of your catch</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-full h-44 rounded-2xl border-2 border-dashed border-adventure-border bg-adventure-bg hover:border-primary-300 hover:bg-primary-50 transition-all cursor-pointer flex items-center justify-center overflow-hidden group"
            >
              {photoPreview ? (
                <>
                  <img src={photoPreview} alt="Catch preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm font-sans font-semibold">Change photo</span>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <Icon name="CameraIcon" size={36} className="text-earth-300 mx-auto mb-2" />
                  <p className="text-sm font-sans text-earth-400 font-semibold">Tap to add a photo</p>
                  <p className="text-xs font-sans text-earth-300 mt-1">JPG, PNG, WebP or HEIC · max 10 MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>

          {/* Species typeahead */}
          <div className="relative">
            <label className={labelCls}>Species *</label>
            <input
              type="text"
              value={form.speciesInput}
              onChange={e => {
                setForm(p => ({ ...p, speciesInput: e.target.value, species: e.target.value }));
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Start typing — e.g. Carp, Pike, Mackerel..."
              className={inputCls}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-20 bg-white border border-adventure-border rounded-xl shadow-lg mt-1 overflow-hidden max-h-52 overflow-y-auto">
                {suggestions.map(s => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={() => handleSpeciesSelect(s)}
                    className="w-full text-left px-4 py-2.5 text-sm font-sans text-primary-800 hover:bg-primary-50 transition-colors border-b border-adventure-border last:border-0"
                  >
                    🐟 {s}
                  </button>
                ))}
              </div>
            )}
            <p className="text-xs font-sans text-earth-400 mt-1">
              Can't find it? Just type the name and continue.
            </p>
          </div>

          {/* Weight (lbs) + Length (cm) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Weight (lbs)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={form.weight}
                onChange={e => setForm(p => ({ ...p, weight: e.target.value }))}
                placeholder="e.g. 4.5"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Length (cm)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={form.length}
                onChange={e => setForm(p => ({ ...p, length: e.target.value }))}
                placeholder="e.g. 45"
                className={inputCls}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className={labelCls}>Location</label>
            <input
              type="text"
              value={form.location}
              onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
              placeholder="e.g. River Severn, Bewdley"
              className={inputCls}
            />
          </div>

          {/* Water type */}
          <div>
            <label className={labelCls}>Water Type</label>
            <div className="flex flex-wrap gap-2">
              {WATER_TYPES.map(w => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, waterType: w }))}
                  className={`px-4 py-2 rounded-xl text-sm font-sans font-semibold border transition-all ${
                    form.waterType === w
                      ? 'text-white border-transparent'
                      : 'bg-adventure-bg border-adventure-border text-earth-500 hover:text-primary-700'
                  }`}
                  style={form.waterType === w ? { backgroundColor: '#ff751f', borderColor: '#ff751f' } : {}}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelCls}>Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Any details about the catch, conditions, bait used..."
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-sans rounded-xl px-4 py-3 flex items-center gap-2">
              <Icon name="ExclamationCircleIcon" size={16} />
              {error}
            </div>
          )}

          {/* Pending notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <p className="text-xs font-sans text-amber-700">
              <span className="font-bold">Heads up:</span> Your catch will be submitted for review. Once approved by the Voyagers Hook team it'll appear in your log and earn you XP!
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pb-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-adventure-border text-sm font-sans font-semibold text-earth-500 hover:bg-earth-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || !form.species.trim()}
              className="flex-1 py-3 rounded-xl text-white text-sm font-sans font-semibold disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              style={{ backgroundColor: '#ff751f' }}
            >
              {saving ? (
                <>
                  <Icon name="ArrowPathIcon" size={16} className="animate-spin" />
                  {photoFile ? 'Uploading...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Icon name="CheckIcon" size={16} />
                  Submit Catch
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
