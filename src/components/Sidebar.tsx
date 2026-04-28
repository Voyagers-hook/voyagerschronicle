'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

interface NavItem {
  label: string;
  icon: string;
  href: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: 'Adventure Home',  icon: 'HomeIcon',                  href: '/adventure-home' },
  { label: 'Card Collection', icon: 'BookOpenIcon',              href: '/card-collection' },
  { label: 'Card Discovery',  icon: 'MagnifyingGlassIcon',       href: '/card-discovery' },
  { label: 'Open a Pack',     icon: 'GiftIcon',                  href: '/card-opening' },
  { label: 'Trading Post',    icon: 'ArrowsRightLeftIcon',       href: '/trading' },
  { label: 'Quiz Zone',       icon: 'AcademicCapIcon',           href: '/quiz' },
  { label: 'Leaderboard',     icon: 'TrophyIcon',                href: '/leaderboard' },
  { label: 'Fun Facts',       icon: 'LightBulbIcon',             href: '/fun-facts' },
  { label: 'Rewards',         icon: 'StarIcon',                  href: '/rewards' },
  { label: 'Catch Log',       icon: 'ClipboardDocumentListIcon', href: '/catch-log' },
];

const adminItems: NavItem[] = [
  { label: 'Admin Panel', icon: 'Cog6ToothIcon', href: '/admin' },
  { label: 'Analytics',   icon: 'ChartBarIcon',  href: '/admin-analytics' },
];

interface Profile {
  username: string | null;
  membership_tier: string | null;
  avatar_url: string | null;
  role: string | null;
}

// ─────────────────────────────────────────────────────────────
// AccountPanel — top-level component so inputs never unmount
// ─────────────────────────────────────────────────────────────
interface AccountPanelProps {
  userId: string;
  userEmail: string;
  profile: Profile;
  onProfileUpdate: (updates: Partial<Profile>) => void;
  onSignOut: () => void;
}

function AccountPanel({ userId, userEmail, profile, onProfileUpdate, onSignOut }: AccountPanelProps) {
  const [username, setUsername]           = useState(profile.username || '');
  const [password, setPassword]           = useState('');
  const [confirmPassword, setConfirm]     = useState('');
  const [msg, setMsg]                     = useState('');
  const [err, setErr]                     = useState('');
  const [savingUsername, setSavingUser]   = useState(false);
  const [savingPassword, setSavingPass]   = useState(false);
  const [uploadingAvatar, setUploading]   = useState(false);
  const fileRef                           = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErr('');
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop();
      const path = `${userId}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      await supabase.from('user_profiles').update({ avatar_url: url }).eq('id', userId);
      onProfileUpdate({ avatar_url: url });
      setMsg('Profile picture updated!');
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      setErr('Upload failed: ' + e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveUsername = async () => {
    if (!username.trim()) return;
    setSavingUser(true);
    setErr('');
    const supabase = createClient();
    const { error } = await supabase.from('user_profiles').update({ username: username.trim() }).eq('id', userId);
    setSavingUser(false);
    if (error) { setErr('Could not update username.'); return; }
    onProfileUpdate({ username: username.trim() });
    setMsg('Username updated!');
    setTimeout(() => setMsg(''), 3000);
  };

  const handleSavePassword = async () => {
    setErr('');
    if (password.length < 8) { setErr('Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword) { setErr('Passwords do not match.'); return; }
    setSavingPass(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setSavingPass(false);
    if (error) { setErr(error.message); return; }
    setPassword('');
    setConfirm('');
    setMsg('Password set!');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div
      className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50"
      style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}
    >
      {/* Change photo */}
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploadingAvatar}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-50 transition-colors border-b border-adventure-border text-left"
      >
        <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
          {uploadingAvatar
            ? <Icon name="ArrowPathIcon" size={16} className="text-primary-500 animate-spin" />
            : <Icon name="CameraIcon" size={16} className="text-primary-500" />
          }
        </div>
        <span className="text-sm font-sans font-semibold text-primary-700">
          {uploadingAvatar ? 'Uploading…' : 'Change Profile Picture'}
        </span>
      </button>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarUpload} />

      <div className="px-4 py-3 space-y-3">
        {msg && <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl">{msg}</p>}
        {err && <p className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-2 rounded-xl">{err}</p>}

        {/* Username */}
        <div>
          <label className="block text-xs font-sans font-bold text-earth-500 uppercase tracking-widest mb-1.5">Username</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="flex-1 border border-adventure-border rounded-xl px-3 py-2 text-sm font-sans text-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white min-w-0"
            />
            <button
              onClick={handleSaveUsername}
              disabled={savingUsername}
              className="px-3 py-2 rounded-xl text-white text-xs font-bold disabled:opacity-50 flex-shrink-0"
              style={{ backgroundColor: '#ff751f' }}
            >
              {savingUsername ? '…' : 'Save'}
            </button>
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-sans font-bold text-earth-500 uppercase tracking-widest mb-1.5">
            Set Password <span className="normal-case font-normal">(optional)</span>
          </label>
          <div className="space-y-2">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="New password (min 8 chars)"
              className="w-full border border-adventure-border rounded-xl px-3 py-2 text-sm font-sans text-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Confirm password"
              className="w-full border border-adventure-border rounded-xl px-3 py-2 text-sm font-sans text-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
            />
            <button
              onClick={handleSavePassword}
              disabled={savingPassword || !password}
              className="w-full py-2 rounded-xl text-white text-xs font-bold disabled:opacity-40 transition-opacity"
              style={{ backgroundColor: '#2D6A4F' }}
            >
              {savingPassword ? 'Saving…' : 'Set Password'}
            </button>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={onSignOut}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 text-sm font-sans font-semibold transition-colors"
        >
          <Icon name="ArrowLeftOnRectangleIcon" size={15} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Sidebar
// ─────────────────────────────────────────────────────────────
export default function Sidebar({ currentPath }: { currentPath?: string }) {
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [pendingTrades, setPending]   = useState(0);
  const [profile, setProfile]         = useState<Profile | null>(null);
  const [showAccount, setShowAccount] = useState(false);
  const { user, signOut }             = useAuth();
  const router                        = useRouter();
  const badgeRef                      = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase.from('user_profiles').select('username, membership_tier, avatar_url, role').eq('id', user.id).single()
      .then(({ data }) => { if (data) setProfile(data); });
    supabase.from('trades').select('id', { count: 'exact', head: true }).eq('to_user_id', user.id).eq('trade_status', 'pending')
      .then(({ count }) => setPending(count || 0));
  }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (badgeRef.current && !badgeRef.current.contains(e.target as Node)) setShowAccount(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = async () => {
    try { await signOut(); } catch {}
    router.push('/login-screen');
  };

  const isActive  = (href: string) => currentPath === href;
  const isAdmin   = profile?.role === 'admin';
  const displayName = profile?.username || user?.email?.split('@')[0] || 'Captain';
  const tier      = profile?.membership_tier || 'Explorer';
  const initials  = displayName.slice(0, 2).toUpperCase();

  const navWithBadges = navItems.map(item =>
    item.href === '/trading' ? { ...item, badge: pendingTrades } : item
  );

  const AvatarCircle = ({ size }: { size: number }) => (
    profile?.avatar_url ? (
      <img src={profile.avatar_url} alt={displayName}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
    ) : (
      <div style={{
        width: size, height: size, borderRadius: '50%', backgroundColor: '#ff751f',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.36, fontWeight: 700, color: 'white', flexShrink: 0,
      }}>
        {initials}
      </div>
    )
  );

  const NavLink = ({ item, compact }: { item: NavItem; compact: boolean }) => (
    <Link
      href={item.href}
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 font-sans font-medium text-sm ${isActive(item.href) ? 'text-white shadow-sm' : 'text-primary-700 hover:bg-primary-50 hover:text-primary-800'} ${compact ? 'justify-center px-2' : ''}`}
      style={isActive(item.href) ? { backgroundColor: '#ff751f' } : {}}
      onClick={() => setMobileOpen(false)}
    >
      <Icon name={item.icon as any} size={20} className={isActive(item.href) ? 'text-white' : 'text-primary-500 group-hover:text-primary-700'} />
      {!compact && <span className="truncate">{item.label}</span>}
      {!compact && item.badge && item.badge > 0 ? (
        <span className="ml-auto text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center" style={{ backgroundColor: '#ff751f' }}>{item.badge}</span>
      ) : null}
      {compact && (
        <span className="absolute left-full ml-3 px-2 py-1 bg-primary-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          {item.label}{item.badge && item.badge > 0 ? ` (${item.badge})` : ''}
        </span>
      )}
    </Link>
  );

  const SidebarContent = ({ compact }: { compact: boolean }) => (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className={`flex items-center justify-center px-4 py-5 border-b border-primary-100 ${compact ? 'px-2 py-3' : ''}`}>
        <Image
          src="/assets/images/little_voyagers_logo-1776778067350.png"
          alt="Little Voyagers Project Somerset"
          width={compact ? 40 : 80}
          height={compact ? 40 : 80}
          className="object-contain"
        />
      </div>

      {/* Member badge — clickable, dropdown below */}
      {!compact && user && (
        <div className="mx-3 mt-4 mb-2 relative" ref={badgeRef}>
          <button
            onClick={() => setShowAccount(v => !v)}
            className="w-full rounded-2xl p-3 text-left transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #2D6A4F 0%, #1A3D28 100%)' }}
          >
            <div className="flex items-center gap-3">
              <AvatarCircle size={44} />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-sans font-semibold truncate">{displayName}</p>
                <p className="text-primary-200 text-xs font-sans">{tier}</p>
              </div>
              <Icon
                name="ChevronDownIcon"
                size={14}
                className={`text-primary-300 transition-transform flex-shrink-0 ${showAccount ? 'rotate-180' : ''}`}
              />
            </div>
          </button>

          {showAccount && profile && (
            <AccountPanel
              userId={user.id}
              userEmail={user.email || ''}
              profile={profile}
              onProfileUpdate={updates => setProfile(p => p ? { ...p, ...updates } : p)}
              onSignOut={handleSignOut}
            />
          )}
        </div>
      )}

      {/* Main nav */}
      <nav className="flex-1 px-2 pt-3 space-y-0.5 overflow-y-auto">
        {!compact && (
          <p className="text-xs font-sans font-semibold text-primary-400 uppercase tracking-widest mb-2 px-3">Explore</p>
        )}
        {navWithBadges.map(item => <NavLink key={item.href} item={item} compact={compact} />)}
      </nav>

      {/* Admin nav */}
      {isAdmin && (
        <div className="px-2 pb-2 border-t border-primary-100 pt-3 space-y-0.5">
          {!compact && (
            <p className="text-xs font-sans font-semibold text-primary-400 uppercase tracking-widest mb-2 px-3">Admin</p>
          )}
          {adminItems.map(item => <NavLink key={item.href} item={item} compact={compact} />)}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col bg-white border-r border-adventure-border w-64 flex-shrink-0" style={{ minHeight: '100vh' }}>
        <SidebarContent compact={false} />
      </aside>

      {/* Mobile hamburger */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-10 h-10 bg-white rounded-xl shadow-card flex items-center justify-center border border-adventure-border"
        >
          <Icon name="Bars3Icon" size={20} className="text-primary-600" />
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-panel" onClick={e => e.stopPropagation()}>
            <div className="flex justify-end p-3">
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-primary-50 text-primary-500">
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>
            <SidebarContent compact={false} />
          </aside>
        </div>
      )}
    </>
  );
}
