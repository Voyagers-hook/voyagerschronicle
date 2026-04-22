'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

// Mock user for preview mode (no real auth session)
const PREVIEW_USER = {
  id: 'preview-user-id',
  email: 'preview@voyagershook.com',
  user_metadata: { full_name: 'Preview Angler', avatar_url: '' },
};

const PREVIEW_PROFILE = {
  id: 'preview-user-id',
  username: 'PreviewAngler',
  full_name: 'Preview Angler',
  avatar_url: '',
  xp: 1250,
  level: 5,
  total_points: 3400,
  membership_tier: 'Gold Explorer',
  badges_earned: ['First Catch', 'Card Collector'],
  created_at: new Date().toISOString(),
};

function isPreviewMode(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.location.hostname.includes('builtwithrocket.new') ||
    new URLSearchParams(window.location.search).get('preview') === '1'
  );
}

const AuthContext = createContext<any>({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (isPreviewMode()) {
      // Inject mock data so all pages render without a real session
      setPreview(true);
      setUser(PREVIEW_USER);
      setSession({ user: PREVIEW_USER });
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Email/Password Sign Up
  const signUp = async (email: string, password: string, metadata = {}) => {
    if (preview) return { user: PREVIEW_USER };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: (metadata as any)?.fullName || '',
          avatar_url: (metadata as any)?.avatarUrl || ''
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) throw error;
    return data;
  };

  // Email/Password Sign In
  const signIn = async (email: string, password: string) => {
    if (preview) return { user: PREVIEW_USER, session: { user: PREVIEW_USER } };
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  };

  // Sign Out
  const signOut = async () => {
    if (preview) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  // Get Current User
  const getCurrentUser = async () => {
    if (preview) return PREVIEW_USER;
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  };

  // Check if Email is Verified
  const isEmailVerified = () => {
    if (preview) return true;
    return user?.email_confirmed_at !== null;
  };

  // Get User Profile from Database
  const getUserProfile = async () => {
    if (preview) return PREVIEW_PROFILE;
    if (!user) return null;
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error) throw error;
    return data;
  };

  const value = {
    user,
    session,
    loading,
    preview,
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    isEmailVerified,
    getUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
