'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';

export default function LoginForm() {
  const router = useRouter();
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
        background: 'rgba(10, 25, 18, 0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(255,255,255,0.10)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,117,31,0.08)',
      }}
    >
      {/* Top accent bar */}
      <div
        className="h-1 w-full"
        style={{ background: 'linear-gradient(90deg, #2D6A4F, #ff751f, #E9A23B)' }}
      />

      <div className="px-7 pt-7 pb-8">
        {sent ? (
          /* ── Success state ── */
          <div className="text-center py-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: 'linear-gradient(135deg, #2D6A4F, #3D9068)', boxShadow: '0 8px 24px rgba(45,106,79,0.4)' }}
            >
              <Icon name="EnvelopeIcon" size={30} className="text-white" />
            </div>
            <h2 className="font-display text-2xl text-white mb-2">Check Your Inbox!</h2>
            <p className="text-white/60 font-sans text-sm leading-relaxed mb-6">
              We sent a magic link to{' '}
              <span className="font-semibold text-white/90">{email}</span>.
              <br />Click it to sign in — no password needed.
            </p>
            <button
              onClick={() => setSent(false)}
              className="text-xs font-sans font-semibold transition-colors"
              style={{ color: '#ff751f' }}
            >
              ← Use a different email
            </button>
          </div>
        ) : (
          /* ── Form ── */
          <>
            {/* Heading */}
            <div className="mb-7">
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-bold mb-4 tracking-wide uppercase"
                style={{
                  background: 'rgba(255,117,31,0.15)',
                  border: '1px solid rgba(255,117,31,0.35)',
                  color: '#ff9a5c',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse inline-block" />
                Members only
              </div>
              <h1 className="font-display text-3xl text-white leading-tight mb-2">
                Welcome back,<br />
                <span style={{ color: '#ff751f' }}>Captain!</span>
              </h1>
              <p className="text-white/50 font-sans text-sm">
                Enter your email to get a magic sign-in link.
              </p>
            </div>

            <form onSubmit={onSubmit} noValidate className="space-y-4">
              {/* Email field */}
              <div>
                <label htmlFor="email" className="block text-xs font-sans font-semibold text-white/50 uppercase tracking-widest mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Icon name="EnvelopeIcon" size={16} className="text-white/30" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl font-sans text-sm text-white placeholder-white/20 transition-all duration-200 focus:outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: emailError
                        ? '1.5px solid rgba(239,68,68,0.7)'
                        : '1.5px solid rgba(255,255,255,0.10)',
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
                    }}
                    onFocus={e => {
                      if (!emailError) e.currentTarget.style.border = '1.5px solid rgba(255,117,31,0.6)';
                    }}
                    onBlur={e => {
                      if (!emailError) e.currentTarget.style.border = '1.5px solid rgba(255,255,255,0.10)';
                    }}
                  />
                </div>
                {emailError && (
                  <p className="mt-2 text-xs font-sans text-red-400 flex items-center gap-1.5">
                    <Icon name="ExclamationCircleIcon" size={13} />
                    {emailError}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl font-sans font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 disabled:opacity-70"
                style={{
                  background: isLoading
                    ? 'rgba(255,117,31,0.5)'
                    : 'linear-gradient(135deg, #ff751f 0%, #e85a00 100%)',
                  boxShadow: isLoading ? 'none' : '0 8px 24px rgba(255,117,31,0.4)',
                }}
              >
                {isLoading ? (
                  <>
                    <Icon name="ArrowPathIcon" size={16} className="animate-spin" />
                    <span>Setting sail…</span>
                  </>
                ) : (
                  <>
                    <span>Send Magic Link</span>
                    <Icon name="ArrowRightIcon" size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Info note */}
            <div
              className="mt-5 flex items-start gap-2.5 rounded-2xl px-4 py-3"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <Icon name="InformationCircleIcon" size={15} className="text-white/30 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-sans text-white/35 leading-relaxed">
                Your account is set up when you join at{' '}
                <span className="text-white/60 font-semibold">Voyagers Hook</span>.
                Ask the shop if you need help!
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
