'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Reward {
  id?: string;
  title: string;
  description: string | null;
  points_cost: number;
  reward_type: string;
  icon: string;
  image_url: string | null;
  probability_weight: number;
  active: boolean;
  stock: number | null;
  link: string | null;
}

const REWARD_TYPES = [
  { value: 'general',     label: 'General',       emoji: '🎁' },
  { value: 'discount',    label: 'Discount',       emoji: '🏷️' },
  { value: 'product',     label: 'Product',        emoji: '📦' },
  { value: 'experience',  label: 'Experience',     emoji: '🎣' },
  { value: 'membership',  label: 'Membership',     emoji: '⭐' },
  { value: 'digital',     label: 'Digital',        emoji: '💻' },
];

const ICONS = ['🎁', '🏆', '🎣', '🐟', '⚓', '🌊', '🎯', '💎', '🔑', '🛒', '🎫', '🏅', '🎖️', '🌟', '💰', '🎊'];

const emptyReward = (): Omit<Reward, 'id'> => ({
  title: '',
  description: '',
  points_cost: 100,
  reward_type: 'general',
  icon: '🎁',
  image_url: '',
  probability_weight: 10,
  active: true,
  stock: null,
  link: '',
});

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [form, setForm] = useState<Omit<Reward, 'id'>>(emptyReward());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);

  useEffect(() => { fetchRewards(); }, []);

  async function fetchRewards() {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('rewards_catalogue')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) toast.error("Failed to load: " + error.message);
    else setRewards(data || []);
    setLoading(false);
  }

  function openCreate() {
    setEditingReward(null);
    setForm(emptyReward());
    setShowForm(true);
  }

  function openEdit(reward: Reward) {
    setEditingReward(reward);
    setForm({ ...reward });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.points_cost || form.points_cost < 1) { toast.error('Points cost must be at least 1'); return; }

    setSaving(true);
    const supabase = createClient();
    try {
      const payload = {
        ...form,
        link: form.link?.trim() || null,
        description: form.description?.trim() || null,
        image_url: form.image_url?.trim() || null,
        stock: form.stock ?? null,
      };

      if (editingReward?.id) {
        const { error } = await supabase.from('rewards_catalogue').update(payload).eq('id', editingReward.id);
        if (error) throw error;
        toast.success(`"${form.title}" updated successfully`);
      } else {
        const { error } = await supabase.from('rewards_catalogue').insert([payload]);
        if (error) throw error;
        toast.success(`"${form.title}" created successfully`);
      }
      setShowForm(false);
      await fetchRewards();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong while saving');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(reward: Reward) {
    const supabase = createClient();
    const { error } = await supabase
      .from('rewards_catalogue')
      .update({ active: !reward.active })
      .eq('id', reward.id!);
    if (error) { toast.error(error.message); return; }
    toast.success(`"${reward.title}" ${!reward.active ? 'is now active' : 'is now hidden'}`);
    await fetchRewards();
  }

  async function handleDelete(id: string, title: string) {
    if (confirmDelete !== id) { setConfirmDelete(id); return; }
    const supabase = createClient();
    const { error } = await supabase.from('rewards_catalogue').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    setConfirmDelete(null);
    toast.success(`"${title}" deleted`);
    await fetchRewards();
  }

  const activeCount = rewards.filter(r => r.active).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rewards & Card Manager</h1>
            <p className="text-sm text-gray-500 mt-1">
              {rewards.length} total · {activeCount} active
            </p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
          >
            <span className="text-lg leading-none">+</span> Add New
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-lg font-bold text-gray-900">
                  {editingReward ? `Edit: ${editingReward.title}` : 'Create New'}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>

              <div className="p-6 space-y-5">

                {/* Icon + Title row */}
                <div className="flex gap-3 items-start">
                  <div className="relative">
                    <button
                      onClick={() => setShowIconPicker(!showIconPicker)}
                      className="w-14 h-14 text-3xl bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center border border-gray-200 transition-colors"
                    >
                      {form.icon}
                    </button>
                    {showIconPicker && (
                      <div className="absolute top-16 left-0 z-10 bg-white border border-gray-200 rounded-xl shadow-xl p-3 grid grid-cols-4 gap-2 w-48">
                        {ICONS.map(icon => (
                          <button
                            key={icon}
                            onClick={() => { setForm(f => ({ ...f, icon })); setShowIconPicker(false); }}
                            className="text-2xl w-10 h-10 hover:bg-gray-100 rounded-lg flex items-center justify-center"
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text" value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g. 10% Discount Code"
                    />
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL <span className="text-gray-400 font-normal">(Paste image link here)</span>
                  </label>
                  <input
                    type="text" value={form.image_url || ''}
                    onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="https://example.com/my-card-image.png"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description || ''}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    placeholder="What does the member get?"
                  />
                </div>

                {/* Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="url" value={form.link || ''}
                    onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="https://your-store.com/discount"
                  />
                  <p className="text-xs text-gray-400 mt-1">Members will see a clickable button when redeeming this reward</p>
                </div>

                {/* Type + Points Cost + Probability */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={form.reward_type}
                      onChange={e => setForm(f => ({ ...f, reward_type: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {REWARD_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Points Cost *</label>
                    <input
                      type="number" min={1} value={form.points_cost}
                      onChange={e => setForm(f => ({ ...f, points_cost: Number(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Drop Chance (%)</label>
                    <input
                      type="number" min={1} max={100} value={form.probability_weight}
                      onChange={e => setForm(f => ({ ...f, probability_weight: Number(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock limit <span className="text-gray-400 font-normal">(leave blank for unlimited)</span>
                  </label>
                  <input
                    type="number" min={1}
                    value={form.stock ?? ''}
                    onChange={e => setForm(f => ({ ...f, stock: e.target.value ? Number(e.target.value) : null }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Unlimited"
                  />
                </div>

                {/* Active toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${form.active ? 'bg-emerald-600' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.active ? 'translate-x-5' : ''}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Active (visible to members)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving…' : editingReward ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rewards Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400">
            <div className="text-center"><div className="text-2xl mb-2">⏳</div><p className="text-sm">Loading rewards…</p></div>
          </div>
        ) : rewards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
            <div className="text-4xl mb-3">🎁</div>
            <p className="font-semibold text-gray-600">No rewards yet</p>
            <p className="text-sm mt-1">Create your first reward to get started</p>
            <button onClick={openCreate} className="mt-4 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
              Add First Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map(reward => {
              const typeInfo = REWARD_TYPES.find(t => t.value === reward.reward_type);
              return (
                <div
                  key={reward.id}
                  className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                    reward.active ? 'border-gray-100' : 'border-gray-200 opacity-60'
                  }`}
                >
                  <div className="p-5">
                    {reward.image_url && (
                      <div className="w-full h-32 mb-4 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                        <img src={reward.image_url} alt={reward.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {!reward.image_url && <span className="text-3xl">{reward.icon}</span>}
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm leading-tight">
                            {reward.title}
                          </h3>
                          <span className="text-xs text-gray-400">{typeInfo?.emoji} {typeInfo?.label}</span>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        reward.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {reward.active ? 'Active' : 'Hidden'}
                      </span>
                    </div>

                    {reward.description && (
                      <p className="text-xs text-gray-500 mb-3 leading-relaxed">{reward.description}</p>
                    )}

                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg text-xs font-semibold">
                        <span>⭐</span> {reward.points_cost} Pts
                      </div>
                      {reward.stock !== null && (
                        <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-semibold">
                          <span>📦</span> {reward.stock} in stock
                        </div>
                      )}
                      {reward.link && (
                        <div className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg text-xs font-semibold">
                          <span>🔗</span> Link
                        </div>
                      )}
                      <div className="flex items-center gap-1 bg-orange-50 text-orange-700 px-2.5 py-1 rounded-lg text-xs font-semibold">
                        <span>🎲</span> {reward.probability_weight}%
                      </div>
                    </div>

                    {reward.link && (
                      <a
                        href={reward.link} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:text-blue-700 underline truncate block mb-3"
                      >
                        {reward.link}
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-t border-gray-100">
                    <button
                      onClick={() => openEdit(reward)}
                      className="flex-1 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleActive(reward)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        reward.active
                          ? 'text-gray-500 bg-white border border-gray-200 hover:bg-gray-100'
                          : 'text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {reward.active ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => handleDelete(reward.id!, reward.title)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        confirmDelete === reward.id
                          ? 'bg-red-600 text-white'
                          : 'text-red-500 bg-white border border-gray-200 hover:bg-red-50'
                      }`}
                    >
                      {confirmDelete === reward.id ? 'Confirm?' : 'Delete'}
                    </button>
                    {confirmDelete === reward.id && (
                      <button onClick={() => setConfirmDelete(null)} className="text-gray-400 hover:text-gray-600 text-xs px-1">✕</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
