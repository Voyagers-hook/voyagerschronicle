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
    <>
      {/* Fun Google Font — Nunito */}
     <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Henny+Penny&display=swap');
`}</style>

      <div
        className="w-full rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.20)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1.5px solid rgba(255,255,255,0.28)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.25)',
        }}
      >
        {/* Top accent bar */}
        <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #2D6A4F, #ff751f, #E9A23B)' }} />

        <div className="px-7 py-7">
          {sent ? (
            /* ── Success ── */
            <div className="text-center py-2">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'linear-gradient(135deg, #2D6A4F, #3D9068)', boxShadow: '0 8px 24px rgba(45,106,79,0.45)' }}
              >
                <Icon name="EnvelopeIcon" size={26} className="text-white" />
              </div>
              <h2 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: '1.6rem', color: '#FFFFFF', marginBottom: '0.5rem' }}>
                Check Your Inbox! 
              </h2>
              <p className="font-sans text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Magic link sent to{' '}
                <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{email}</span>.
                <br />Click it to dive in — no password needed!
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-xs font-sans font-bold transition-opacity hover:opacity-70"
                style={{ color: '#ff9a5c' }}
              >
                ← Use a different email
              </button>
            </div>
          ) : (
            <>
              {/* Heading */}
              <div className="mb-6" style={{ textAlign: 'center' }}>
                <h2 style={{ fontFamily: "'Henny Penny', cursive", fontWeight: 900, fontSize: '2rem', lineHeight: 1.15, color: '#FFFFFF', marginBottom: '0.35rem' }}>
  Welcome back,{' '}
  <span 
    style={{ 
      color: '#ff751f',
      fontFamily: "'Henny Penny', cursive",
      fontWeight: 400
    }}
  >
    Voyager!
  </span>
</h2>
                <p className="font-sans text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Enter your email to get your magic sign-in link.
                </p>
              </div>

              <form onSubmit={onSubmit} noValidate className="space-y-4">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-sans font-bold uppercase tracking-widest mb-2"
                    style={{ color: 'rgba(255,255,255,0.55)' }}
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Icon name="EnvelopeIcon" size={16} className="text-white/40" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={e => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl font-sans text-sm text-white placeholder-white/30 transition-all duration-150 focus:outline-none"
                      style={{
                        background: 'rgba(255,255,255,0.10)',
                        border: emailError
                          ? '1.5px solid rgba(239,68,68,0.7)'
                          : '1.5px solid rgba(255,255,255,0.20)',
                      }}
                      onFocus={e => { if (!emailError) e.currentTarget.style.border = '1.5px solid rgba(255,117,31,0.7)'; }}
                      onBlur={e => { if (!emailError) e.currentTarget.style.border = '1.5px solid rgba(255,255,255,0.20)'; }}
                    />
                  </div>
                  {emailError && (
                    <p className="mt-1.5 text-xs font-sans text-red-300 flex items-center gap-1.5">
                      <Icon name="ExclamationCircleIcon" size={13} />
                      {emailError}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-2xl font-sans font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98] disabled:opacity-60"
                  style={{
                    fontFamily: "'Henny Penny', cursive",
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    background: isLoading ? 'rgba(255,117,31,0.5)' : 'linear-gradient(135deg, #ff751f, #e85a00)',
                    boxShadow: isLoading ? 'none' : '0 6px 20px rgba(255,117,31,0.45)',
                  }}
                >
                  {isLoading ? (
                    <><Icon name="ArrowPathIcon" size={16} className="animate-spin" /><span>Sending…</span></>
                  ) : (
                    <><span>Send Magic Link</span><Icon name="ArrowRightIcon" size={15} /></>
                  )}
                </button>
              </form>

              {/* Footer note */}
              <p className="mt-5 text-xs font-sans text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Account set up at <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Voyagers Hook</span> — ask the shop if you need help!
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
