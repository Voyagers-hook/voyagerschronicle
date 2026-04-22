'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Rarity = 'Widespread' | 'Elusive' | 'Specimen' | 'Legendary';

interface Card {
  id?: string;
  card_number: number;
  name: string;
  species: string;
  rarity: Rarity;
  image_url: string | null;
  power: number;
  stealth: number;
  energy: number;
  beauty: number;
  habitat: string;
  description: string | null;
  foil: boolean;
  gradient: string;
  border_color: string;
  hp: number;
  card_level: number;
  drop_rate: number;
}

const RARITY_DEFAULTS: Record<Rarity, { hp: number; card_level: number; drop_rate: number; gradient: string; border_color: string }> = {
  Widespread: { hp: 50,  card_level: 1, drop_rate: 50, gradient: 'from-green-400 to-green-600',   border_color: '#22c55e' },
  Elusive:    { hp: 75,  card_level: 2, drop_rate: 25, gradient: 'from-blue-400 to-blue-600',    border_color: '#3b82f6' },
  Specimen:   { hp: 100, card_level: 3, drop_rate: 15, gradient: 'from-purple-400 to-purple-600', border_color: '#a855f7' },
  Legendary:  { hp: 150, card_level: 4, drop_rate: 5,  gradient: 'from-yellow-400 to-orange-500', border_color: '#f59e0b' },
};

const RARITY_BADGE: Record<Rarity, string> = {
  Widespread: 'bg-green-100 text-green-800',
  Elusive:    'bg-blue-100 text-blue-800',
  Specimen:   'bg-purple-100 text-purple-800',
  Legendary:  'bg-yellow-100 text-yellow-800',
};

const emptyCard = (): Omit<Card, 'id'> => ({
  card_number: 0,
  name: '',
  species: '',
  rarity: 'Widespread',
  image_url: null,
  power: 0,
  stealth: 0,
  energy: 0,
  beauty: 0,
  habitat: '',
  description: '',
  foil: false,
  gradient: RARITY_DEFAULTS.Widespread.gradient,
  border_color: RARITY_DEFAULTS.Widespread.border_color,
  hp: RARITY_DEFAULTS.Widespread.hp,
  card_level: RARITY_DEFAULTS.Widespread.card_level,
  drop_rate: RARITY_DEFAULTS.Widespread.drop_rate,
});

export default function AdminCardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [form, setForm] = useState<Omit<Card, 'id'>>(emptyCard());
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchCards(); }, []);

  async function fetchCards() {
    setLoading(true);
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('card_number', { ascending: true });
    if (error) setError(error.message);
    else setCards(data || []);
    setLoading(false);
  }

  function openCreate() {
    setEditingCard(null);
    setForm(emptyCard());
    setImagePreview(null);
    setImageFile(null);
    setShowForm(true);
  }

  function openEdit(card: Card) {
    setEditingCard(card);
    setForm({ ...card });
    setImagePreview(card.image_url || null);
    setImageFile(null);
    setShowForm(true);
  }

  function handleRarityChange(rarity: Rarity) {
    const defaults = RARITY_DEFAULTS[rarity];
    setForm(f => ({
      ...f,
      rarity,
      hp: defaults.hp,
      card_level: defaults.card_level,
      drop_rate: defaults.drop_rate,
      gradient: defaults.gradient,
      border_color: defaults.border_color,
    }));
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function uploadImage(file: File): Promise<string> {
    setUploadingImage(true);
    const ext = file.name.split('.').pop();
    const path = `cards/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('card-images').upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    setUploadingImage(false);
    if (error) throw new Error(`Image upload failed: ${error.message}`);
    const { data } = supabase.storage.from('card-images').getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSave() {
    setError(null);
    if (!form.name.trim()) { setError('Card name is required'); return; }
    if (!form.species.trim()) { setError('Species is required'); return; }
    if (!form.habitat.trim()) { setError('Habitat is required'); return; }
    if (!form.card_number) { setError('Card number is required'); return; }

    setSaving(true);
    try {
      let imageUrl = form.image_url;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const payload = { ...form, image_url: imageUrl };

      if (editingCard?.id) {
        const { error } = await supabase.from('cards').update(payload).eq('id', editingCard.id);
        if (error) throw error;
        setSuccess(`"${form.name}" updated successfully`);
      } else {
        const { error } = await supabase.from('cards').insert([payload]);
        if (error) throw error;
        setSuccess(`"${form.name}" created successfully`);
      }

      setShowForm(false);
      await fetchCards();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      return;
    }
    const { error } = await supabase.from('cards').delete().eq('id', id);
    if (error) { setError(error.message); return; }
    setConfirmDelete(null);
    setSuccess(`"${name}" deleted`);
    await fetchCards();
  }

  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(null), 3000); return () => clearTimeout(t); }
  }, [success]);

  const StatSlider = ({ label, field }: { label: string; field: 'power' | 'stealth' | 'energy' | 'beauty' }) => (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500 font-mono">{form[field]}</span>
      </div>
      <input
        type="range" min={0} max={100} value={form[field]}
        onChange={e => setForm(f => ({ ...f, [field]: Number(e.target.value) }))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cards Manager</h1>
            <p className="text-sm text-gray-500 mt-1">{cards.length} card{cards.length !== 1 ? 's' : ''} in collection</p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <span className="text-lg leading-none">+</span> New Card
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            <span className="text-red-500">⚠</span>
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
          </div>
        )}
        {success && (
          <div className="mb-4 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">
            <span>✓</span> {success}
          </div>
        )}

        {/* Card Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-lg font-bold text-gray-900">
                  {editingCard ? `Edit: ${editingCard.name}` : 'Create New Card'}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>

              <div className="p-6 space-y-6">

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Card Image</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative cursor-pointer rounded-xl border-2 border-dashed border-gray-300 hover:border-emerald-400 transition-colors flex items-center justify-center overflow-hidden"
                    style={{ height: 180 }}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <div className="text-4xl mb-2">🖼</div>
                        <p className="text-sm text-gray-500">Click to upload image</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · max 5 MB</p>
                      </div>
                    )}
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <div className="text-sm text-gray-600 font-medium">Uploading…</div>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageSelect} className="hidden"
                  />
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number *</label>
                    <input
                      type="number" min={1} value={form.card_number || ''}
                      onChange={e => setForm(f => ({ ...f, card_number: Number(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g. 001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rarity *</label>
                    <select
                      value={form.rarity}
                      onChange={e => handleRarityChange(e.target.value as Rarity)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {(['Widespread', 'Elusive', 'Specimen', 'Legendary'] as Rarity[]).map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Name *</label>
                    <input
                      type="text" value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g. Atlantic Salmon"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Species *</label>
                    <input
                      type="text" value={form.species}
                      onChange={e => setForm(f => ({ ...f, species: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g. Salmo salar"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Habitat *</label>
                    <input
                      type="text" value={form.habitat}
                      onChange={e => setForm(f => ({ ...f, habitat: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g. Fast-flowing rivers"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={form.description || ''}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                      placeholder="Flavour text shown on card…"
                    />
                  </div>
                </div>

                {/* Drop Rate */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-amber-800">Drop Rate</span>
                    <span className="text-amber-700 font-mono font-bold">{form.drop_rate}%</span>
                  </div>
                  <input
                    type="range" min={1} max={100} value={form.drop_rate}
                    onChange={e => setForm(f => ({ ...f, drop_rate: Number(e.target.value) }))}
                    className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                  />
                  <p className="text-xs text-amber-600 mt-2">
                    Higher % = more common in packs. Auto-set by rarity but adjustable.
                  </p>
                </div>

                {/* Stats */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Stats</h3>
                  <StatSlider label="⚔ Power" field="power" />
                  <StatSlider label="⚡ Energy" field="energy" />
                  <StatSlider label="🫧 Stealth" field="stealth" />
                  <StatSlider label="✨ Beauty" field="beauty" />
                </div>

                {/* Auto-set info */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Auto-set from Rarity</p>
                  <div className="flex gap-6 text-sm">
                    <div><span className="text-gray-500">HP: </span><span className="font-bold text-gray-800">{form.hp}</span></div>
                    <div><span className="text-gray-500">Card Level: </span><span className="font-bold text-gray-800">{form.card_level}</span></div>
                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${RARITY_BADGE[form.rarity]}`}>
                        {form.rarity}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Foil toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setForm(f => ({ ...f, foil: !f.foil }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${form.foil ? 'bg-emerald-600' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.foil ? 'translate-x-5' : ''}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Foil card ✨</span>
                </label>

              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || uploadingImage}
                  className="px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Saving…' : editingCard ? 'Save Changes' : 'Create Card'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cards Table */}
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400">
            <div className="text-center">
              <div className="text-2xl mb-2">⏳</div>
              <p className="text-sm">Loading cards…</p>
            </div>
          </div>
        ) : cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="text-4xl mb-3">🃏</div>
            <p className="font-semibold text-gray-600">No cards yet</p>
            <p className="text-sm mt-1">Create your first card to get started</p>
            <button onClick={openCreate} className="mt-4 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
              Create First Card
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Card</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Rarity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Drop Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Stats</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">HP / Lvl</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {cards.map(card => (
                  <tr key={card.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{String(card.card_number).padStart(3, '0')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {card.image_url ? (
                          <img src={card.image_url} alt={card.name} className="w-9 h-9 rounded-lg object-cover border border-gray-100" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-lg">🃏</div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{card.name}</p>
                          <p className="text-xs text-gray-400 italic">{card.species}</p>
                        </div>
                        {card.foil && <span className="text-xs">✨</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${RARITY_BADGE[card.rarity]}`}>
                        {card.rarity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                          <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${card.drop_rate}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 font-mono">{card.drop_rate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-500 space-y-0.5">
                        <div>⚔ {card.power} &nbsp; ⚡ {card.energy}</div>
                        <div>🫧 {card.stealth} &nbsp; ✨ {card.beauty}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      <span className="font-mono">{card.hp} HP</span>
                      <span className="mx-1 text-gray-300">/</span>
                      <span>Lv.{card.card_level}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(card)}
                          className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(card.id!, card.name)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            confirmDelete === card.id
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'text-red-500 bg-red-50 hover:bg-red-100'
                          }`}
                        >
                          {confirmDelete === card.id ? 'Confirm?' : 'Delete'}
                        </button>
                        {confirmDelete === card.id && (
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="px-2 py-1.5 text-xs text-gray-400 hover:text-gray-600"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
