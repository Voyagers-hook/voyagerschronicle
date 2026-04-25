'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const validateEmail = (val: string) => {
    if (!val) return 'Email address is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Enter a valid email address';
    return '';
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) { setEmailError(err); return; }
    setEmailError('');
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      setSent(true);
      toast.success('Magic link sent! Check your email.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="w-full rounded-3xl overflow-hidden"
      style={{
        background: 'rgba(8, 20, 14, 0.78)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.10)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}
    >
      {/* Top gradient bar */}
      <div className="h-1" style={{ background: 'linear-gradient(90deg, #2D6A4F, #ff751f, #E9A23B)' }} />

      <div className="px-8 py-8">
        {sent ? (
          /* ── Success ── */
          <div className="text-center py-2">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: 'linear-gradient(135deg, #2D6A4F, #3D9068)', boxShadow: '0 8px 24px rgba(45,106,79,0.4)' }}
            >
              <Icon name="EnvelopeIcon" size={26} className="text-white" />
            </div>
            <h2 className="font-display text-2xl text-white mb-2">Check Your Inbox!</h2>
            <p className="text-white/55 font-sans text-sm leading-relaxed mb-6">
              We sent a magic link to{' '}
              <span className="text-white/90 font-semibold">{email}</span>.
              <br />Click it to sign in — no password needed.
            </p>
            <button
              onClick={() => setSent(false)}
              className="text-xs font-sans font-semibold transition-colors hover:opacity-80"
              style={{ color: '#ff751f' }}
            >
              ← Use a different email
            </button>
          </div>
        ) : (
          /* ── Form ── */
          <>
            <div className="mb-6">
              <h2 className="font-display text-3xl text-white mb-1">
                Welcome back,{' '}
                <span style={{ color: '#ff751f' }}>Captain!</span>
              </h2>
              <p className="text-white/45 font-sans text-sm">
                Enter your email to receive a sign-in link.
              </p>
            </div>

            <form onSubmit={onSubmit} noValidate className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-sans font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Icon name="EnvelopeIcon" size={15} className="text-white/25" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl font-sans text-sm text-white placeholder-white/20 transition-all duration-150 focus:outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: emailError ? '1.5px solid rgba(239,68,68,0.6)' : '1.5px solid rgba(255,255,255,0.09)',
                    }}
                    onFocus={e => { if (!emailError) e.currentTarget.style.border = '1.5px solid rgba(255,117,31,0.55)'; }}
                    onBlur={e => { if (!emailError) e.currentTarget.style.border = '1.5px solid rgba(255,255,255,0.09)'; }}
                  />
                </div>
                {emailError && (
                  <p className="mt-1.5 text-xs font-sans text-red-400 flex items-center gap-1.5">
                    <Icon name="ExclamationCircleIcon" size={13} />
                    {emailError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl font-sans font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98] disabled:opacity-60"
                style={{
                  background: isLoading ? 'rgba(255,117,31,0.45)' : 'linear-gradient(135deg, #ff751f, #e85a00)',
                  boxShadow: isLoading ? 'none' : '0 6px 20px rgba(255,117,31,0.38)',
                }}
              >
                {isLoading ? (
                  <>
                    <Icon name="ArrowPathIcon" size={16} className="animate-spin" />
                    <span>Sending…</span>
                  </>
                ) : (
                  <>
                    <span>Send Magic Link</span>
                    <Icon name="ArrowRightIcon" size={15} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-5 text-xs font-sans text-center" style={{ color: 'rgba(255,255,255,0.28)' }}>
              Your account is set up when you join the Little Voyagers Club at{' '}
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>Voyagers Hook</span>.
              Contact the shop if you need help.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
