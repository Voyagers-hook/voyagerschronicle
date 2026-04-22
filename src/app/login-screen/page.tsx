'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
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
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setEmailError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      {/* Full-screen background image */}
      <Image
        src="/assets/images/background_app-1776788407008.png"
        alt="Fishing adventure background"
        fill
        priority
        className="object-cover object-center"
        style={{ zIndex: 0 }}
      />

      {/* Subtle dark overlay for readability */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.32) 100%)', zIndex: 1 }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full px-4" style={{ maxWidth: 420 }}>
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center">
          <Image
            src="/assets/images/little_voyagers_logo-1776778067350.png"
            alt="Little Voyagers Logo"
            width={260}
            height={260}
            priority
            className="drop-shadow-2xl"
            style={{ objectFit: 'contain' }}
          />
        </div>

        {/* Login Modal */}
        <div
          className="w-full rounded-3xl p-8"
          style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(18px)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.12)',
          }}
        >
          {sent ? (
            <div className="text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'linear-gradient(135deg, #2D6A4F, #3D9068)' }}
              >
                <Icon name="EnvelopeIcon" size={28} className="text-white" />
              </div>
              <h2 className="font-display text-2xl text-green-900 mb-2">Check Your Email!</h2>
              <p className="text-green-700 font-sans text-sm leading-relaxed mb-4">
                We sent a magic link to <strong>{email}</strong>. Click the link to sign in — no password needed!
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-sm font-sans font-semibold underline"
                style={{ color: '#ff751f' }}
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-sans font-bold text-green-900 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none">
                    <Icon name="EnvelopeIcon" size={18} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
                    className={`
                      w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 font-sans text-sm
                      bg-white text-green-900 placeholder-green-300
                      transition-all duration-200
                      focus:outline-none focus:ring-0 focus:bg-white
                      ${emailError ? 'border-red-400 bg-red-50' : 'border-green-200 hover:border-green-300 focus:border-orange-400'}
                    `}
                  />
                </div>
                {emailError && (
                  <p className="mt-1.5 text-xs font-sans text-red-600 flex items-center gap-1">
                    <Icon name="ExclamationCircleIcon" size={14} />
                    {emailError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-2xl font-sans font-bold text-base text-white flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 relative overflow-hidden"
                style={{
                  background: isLoading ? '#ff9a5c' : 'linear-gradient(135deg, #ff751f, #e85a00)',
                  boxShadow: isLoading ? 'none' : '0 6px 24px rgba(255,117,31,0.5)',
                }}
              >
                {isLoading ? (
                  <>
                    <Icon name="ArrowPathIcon" size={20} className="animate-spin" />
                    <span>Setting Sail...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <Icon name="ArrowRightIcon" size={18} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer hint */}
        <p className="mt-5 text-center text-xs font-sans text-white/80" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
          Your email is registered at Voyagers Hook. Ask the shop if you need help!
        </p>
      </div>
    </div>
  );
}