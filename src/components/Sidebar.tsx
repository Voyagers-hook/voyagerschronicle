'use client';

import React, { useState, useEffect } from 'react';
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

const memberBottomItems: NavItem[] = [
  { label: 'Settings', icon: 'UserCircleIcon', href: '/settings' },
];

const adminBottomItems: NavItem[] = [
  { label: 'Settings',         icon: 'UserCircleIcon', href: '/settings' },
  { label: 'Admin Panel',      icon: 'Cog6ToothIcon',  href: '/admin' },
  { label: 'Analytics',        icon: 'ChartBarIcon',   href: '/admin-analytics' },
];

interface SidebarProps {
  currentPath?: string;
}

export default function Sidebar({ currentPath }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingTrades, setPendingTrades] = useState(0);
  const [profile, setProfile] = useState<{ username: string | null; membership_tier: string | null; role: string | null } | null>(null);
  const { user, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from('user_profiles')
      .select('username, membership_tier, role')
      .eq('id', user.id)
      .single()
      .then(({ data }) => { if (data) setProfile(data); });
    supabase
      .from('trades')
      .select('id', { count: 'exact', head: true })
      .eq('to_user_id', user.id)
      .eq('trade_status', 'pending')
      .then(({ count }) => setPendingTrades(count || 0));
  }, [user]);

  const handleSignOut = async () => {
    try { await signOut(); } catch {}
    router.push('/login-screen');
  };

  const isAdmin = profile?.role === 'admin';
  const bottomItems = isAdmin ? adminBottomItems : memberBottomItems;
  const isActive = (href: string) => currentPath === href;

  const displayName = profile?.username || user?.email?.split('@')[0] || 'Captain';
  const tier = profile?.membership_tier || 'Explorer';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const navWithBadges = navItems.map(item =>
    item.href === '/trading' ? { ...item, badge: pendingTrades } : item
  );

  const NavLink = ({ item, compact }: { item: NavItem; compact: boolean }) => (
    <Link
      href={item.href}
      className={`
        group relative flex items-center gap-3 px-3 py-2.5 rounded-xl
        transition-all duration-150 font-sans font-medium text-sm
        ${isActive(item.href)
          ? 'bg-orange-500 text-white shadow-sm'
          : 'text-primary-700 hover:bg-primary-50 hover:text-primary-800'
        }
        ${compact ? 'justify-center px-2' : ''}
      `}
      style={isActive(item.href) ? { backgroundColor: '#ff751f' } : {}}
      onClick={() => setMobileOpen(false)}
    >
      <Icon
        name={item.icon as Parameters<typeof Icon>[0]['name']}
        size={20}
        className={isActive(item.href) ? 'text-white' : 'text-primary-500 group-hover:text-primary-700'}
      />
      {!compact && <span className="truncate">{item.label}</span>}
      {!compact && item.badge && item.badge > 0 ? (
        <span className="ml-auto text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center" style={{ backgroundColor: '#ff751f' }}>
          {item.badge}
        </span>
      ) : null}
      {compact && (
        <span className="absolute left-full ml-3 px-2 py-1 bg-primary-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 font-sans font-medium">
          {item.label}
          {item.badge && item.badge > 0 ? ` (${item.badge})` : ''}
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
          alt="Little Voyagers Project Somerset logo"
          width={compact ? 40 : 80}
          height={compact ? 40 : 80}
          className="object-contain"
        />
      </div>

      {/* Member badge */}
      {!compact && (
        <div className="mx-3 mt-4 mb-2 rounded-xl p-3" style={{ background: 'linear-gradient(135deg, #2D6A4F 0%, #1A3D28 100%)' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white font-display flex-shrink-0" style={{ backgroundColor: '#ff751f' }}>
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-sans font-semibold truncate">{displayName}</p>
              <p className="text-primary-200 text-xs font-sans">{tier}</p>
            </div>
            <Link href="/settings" className="ml-auto p-1 rounded-lg hover:bg-white/10 transition-colors" title="Settings">
              <Icon name="UserCircleIcon" size={16} className="text-primary-200" />
            </Link>
          </div>
        </div>
      )}

      {/* Main nav */}
      <nav className="flex-1 px-2 pt-3 space-y-0.5 overflow-y-auto">
        {!compact && (
          <p className="text-xs font-sans font-semibold text-primary-400 uppercase tracking-widest mb-2 px-3">
            Explore
          </p>
        )}
        {navWithBadges.map((item) => (
          <NavLink key={`nav-${item.href}`} item={item} compact={compact} />
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="px-2 pb-4 border-t border-primary-100 pt-3 space-y-0.5">
        {!compact && (
          <p className="text-xs font-sans font-semibold text-primary-400 uppercase tracking-widest mb-2 px-3">
            {isAdmin ? 'Admin' : 'Account'}
          </p>
        )}
        {bottomItems.map((item) => (
          <NavLink key={`bottom-${item.href}`} item={item} compact={compact} />
        ))}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-primary-500 hover:bg-primary-50 transition-all duration-150 text-sm font-sans font-medium"
        >
          <Icon name={collapsed ? 'ChevronRightIcon' : 'ChevronLeftIcon'} size={18} />
          {!compact && <span>Collapse</span>}
        </button>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-earth-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150 text-sm font-sans font-medium"
        >
          <Icon name="ArrowLeftOnRectangleIcon" size={18} />
          {!compact && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-adventure-border transition-all duration-300 ease-in-out flex-shrink-0 ${collapsed ? 'w-16' : 'w-64'}`}
        style={{ minHeight: '100vh' }}
      >
        <SidebarContent compact={collapsed} />
      </aside>

      {/* Mobile hamburger */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-10 h-10 bg-white rounded-xl shadow-card flex items-center justify-center border border-adventure-border"
          aria-label="Open navigation"
        >
          <Icon name="Bars3Icon" size={20} className="text-primary-600" />
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-panel" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end p-3">
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-primary-50 text-primary-500" aria-label="Close navigation">
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
