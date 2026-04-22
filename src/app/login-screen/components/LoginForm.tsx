'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';
import AppLogo from '@/components/ui/AppLogo';
import { createClient } from '@/lib/supabase/client';

interface LoginFormData {
  email: string;
}

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
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
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
      className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-14 xl:px-20 py-12 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #f0fdf4 0%, #fef9f0 50%, #fff7ed 100%)' }}
    >
      {/* Background dots */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { size: 80, x: '5%', y: '8%', color: 'rgba(255,117,31,0.08)' },
          { size: 60, x: '88%', y: '5%', color: 'rgba(45,106,79,0.08)' },
          { size: 100, x: '92%', y: '85%', color: 'rgba(255,117,31,0.06)' },
          { size: 50, x: '2%', y: '88%', color: 'rgba(59,130,246,0.08)' },
          { size: 40, x: '50%', y: '3%', color: 'rgba(245,158,11,0.1)' },
        ].map((dot, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{ width: dot.size, height: dot.size, left: dot.x, top: dot.y, background: dot.color }}
          />
        ))}
      </div>

      {/* Mobile logo */}
      <div className="lg:hidden flex items-center justify-center mb-8 relative z-10">
        <AppLogo size={80} />
      </div>

      <div className="w-full max-w-md mx-auto relative z-10">
        {/* Heading */}
        <div className="mb-8 text-center lg:text-left">
          <div
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 mb-4 font-sans font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #ff751f, #E9A23B)', color: 'white', boxShadow: '0 4px 16px rgba(255,117,31,0.3)', animation: 'pulseBadge 2.5s ease-in-out infinite' }}
          >
            <span>Ready to Fish?</span>
          </div>
          <h1 className="font-display text-4xl xl:text-5xl text-green-900 mb-3 leading-tight">
            Welcome Back,
            <br />
            <span style={{ color: '#ff751f' }}>Captain!</span>
          </h1>
          <p className="text-green-700 font-sans text-sm leading-relaxed">
            Enter your email to sign in and continue your fishing adventure!
          </p>
        </div>

        {sent ? (
          /* Success state */
          <div
            className="rounded-3xl p-8 shadow-2xl border-2 text-center"
            style={{ background: 'white', borderColor: 'rgba(45,106,79,0.2)', boxShadow: '0 20px 60px rgba(45,106,79,0.12)' }}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #2D6A4F, #3D9068)' }}>
              <Icon name="EnvelopeIcon" size={32} className="text-white" />
            </div>
            <h2 className="font-display text-2xl text-green-900 mb-2">Check Your Email!</h2>
            <p className="text-green-700 font-sans text-sm leading-relaxed mb-4">
              We sent a magic link to <strong>{email}</strong>. Click the link in your email to sign in — no password needed!
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
          /* Form */
          <div
            className="rounded-3xl p-6 shadow-2xl border-2"
            style={{ background: 'white', borderColor: 'rgba(255,117,31,0.2)', boxShadow: '0 20px 60px rgba(45,106,79,0.12), 0 4px 16px rgba(255,117,31,0.08)' }}
          >
            <form onSubmit={onSubmit} noValidate className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-sans font-bold text-green-800 mb-2">
                  Your Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-500">
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
                      bg-green-50/50 text-green-900 placeholder-green-300
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

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-2xl font-sans font-bold text-base text-white flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 relative overflow-hidden"
                style={{
                  background: isLoading ? '#ff9a5c' : 'linear-gradient(135deg, #ff751f, #e85a00)',
                  boxShadow: isLoading ? 'none' : '0 6px 24px rgba(255,117,31,0.45)',
                }}
              >
                {!isLoading && (
                  <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200"
                    style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15), transparent)' }}
                  />
                )}
                {isLoading ? (
                  <>
                    <Icon name="ArrowPathIcon" size={20} className="animate-spin" />
                    <span>Setting Sail...</span>
                  </>
                ) : (
                  <>
                    <span>Start My Adventure!</span>
                    <Icon name="ArrowRightIcon" size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Info note */}
        <div
          className="mt-5 rounded-2xl p-4 border-2"
          style={{ background: 'rgba(45,106,79,0.06)', borderColor: 'rgba(45,106,79,0.15)' }}
        >
          <div className="flex items-start gap-2">
            <Icon name="InformationCircleIcon" size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-sans text-green-700 leading-relaxed">
              Your email is set up when you join at{' '}
              <span className="font-bold text-green-800">Voyagers Hook</span>. Ask the shop if you need help!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}