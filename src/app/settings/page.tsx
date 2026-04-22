'use client';

import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase.from('user_profiles').select('username, avatar_url, email, membership_tier, level, total_points').eq('id', user.id).single()
      .then(({ data }) => {
        if (data) {
          setUsername(data.username || '');
          setAvatarUrl(data.avatar_url || '');
          setAvatarPreview(data.avatar_url || '');
        }
        setLoading(false);
      });
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const supabase = createClient();

      // Upload avatar to Supabase Storage if a new file was selected
      let finalAvatarUrl = avatarUrl;
      const file = fileRef.current?.files?.[0];
      if (file) {
        setUploading(true);
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const path = `avatars/${user.id}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, file, { upsert: true, contentType: file.type });

        if (uploadError) {
          toast.error('Avatar upload failed: ' + uploadError.message);
          setUploading(false);
          setSaving(false);
          return;
        }

        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
        // Append cache-busting timestamp so the new image loads immediately
        finalAvatarUrl = urlData.publicUrl + '?t=' + Date.now();
        setAvatarPreview(finalAvatarUrl);
        setUploading(false);
      }

      const { error } = await supabase.from('user_profiles')
        .update({ username: username.trim(), avatar_url: finalAvatarUrl, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;
      setAvatarUrl(finalAvatarUrl);
      toast.success('Profile updated! Looking great, Captain!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const initials = username ? username.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : user?.email?.[0]?.toUpperCase() || 'A';

  return (
    <AppLayout currentPath="/settings">
      <div className="fade-in space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8" style={{ background: 'linear-gradient(135deg, #091408 0%, #1A3D28 50%, #2D6A4F 100%)' }}>
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #ff751f, transparent)', transform: 'translate(30%, -30%)' }} />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Icon name="UserCircleIcon" size={22} className="text-white" />
              </div>
              <h1 className="font-display text-3xl text-white">My Profile</h1>
            </div>
            <p className="text-primary-200 font-sans text-sm">Customise your Voyager identity.</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-3xl animate-pulse border border-adventure-border" />)}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-adventure-border shadow-card p-6 space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Your avatar"
                    className="w-24 h-24 rounded-full object-cover border-4 shadow-lg"
                    style={{ borderColor: '#ff751f' }}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg" style={{ backgroundColor: '#ff751f' }}>
                    {initials}
                  </div>
                )}
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
                  style={{ backgroundColor: '#ff751f' }}
                >
                  <Icon name="CameraIcon" size={14} />
                </button>
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={handleAvatarChange} />
              <button
                onClick={() => fileRef.current?.click()}
                className="text-xs font-sans font-semibold px-4 py-2 rounded-xl border border-adventure-border text-primary-600 hover:bg-primary-50 transition-colors"
              >
                {uploading ? 'Uploading...' : 'Change Photo'}
              </button>
              <p className="text-xs text-earth-400 font-sans">JPG, PNG, GIF or WebP — max 2MB</p>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-sans font-semibold text-primary-800 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your angler name"
                maxLength={30}
                className="w-full px-4 py-3 rounded-xl border border-adventure-border font-sans text-sm bg-white text-primary-900 placeholder-earth-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
              />
              <p className="text-xs font-sans text-earth-400 mt-1">This is how you appear on the leaderboard and trading post.</p>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-sans font-semibold text-primary-800 mb-2">
                Email Address
              </label>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-adventure-border bg-earth-50">
                <Icon name="EnvelopeIcon" size={16} className="text-earth-400" />
                <span className="font-sans text-sm text-earth-500">{user?.email}</span>
                <span className="ml-auto text-xs font-sans text-earth-400 bg-earth-100 px-2 py-0.5 rounded-full">Read only</span>
              </div>
              <p className="text-xs font-sans text-earth-400 mt-1">Email is managed by Voyagers Hook. Contact the shop to change it.</p>
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              className="w-full py-3.5 rounded-xl font-sans font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
              style={{ backgroundColor: '#ff751f' }}
            >
              {saving ? (
                <>
                  <Icon name="ArrowPathIcon" size={18} className="animate-spin" />
                  {uploading ? 'Uploading photo...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Icon name="CheckCircleIcon" size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
