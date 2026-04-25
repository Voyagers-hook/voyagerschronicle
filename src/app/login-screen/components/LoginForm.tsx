'use client';

import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getFriendlyErrorMessage(err: unknown) {
  if (err instanceof Error) {
    const message = err.message.toLowerCase();

    if (message.includes('rate limit')) {
      return 'Too many attempts. Please wait a moment and try again.';
    }

    if (message.includes('invalid email')) {
      return 'Please enter a valid email address.';
    }

    return 'We couldn’t send your sign-in link. Please try again.';
  }

  return 'Sign in failed. Please try again.';
}

export default function LoginForm() {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const validateEmail = (value: string) => {
    if (!value) return 'Email address is required';
    if (!EMAIL_REGEX.test(value)) return 'Enter a valid email address';
    return '';
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const errorMessage = validateEmail(normalizedEmail);

    if (errorMessage) {
      setEmailError(errorMessage);
      return;
    }

    setEmailError('');
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setEmail(normalizedEmail);
      setSent(true);
      toast.success('Magic link sent! Check your email.');
    } catch (err: unknown) {
      toast.error(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className="overflow-hidden rounded-[28px] border border-white/10 bg-[#08140E]/80 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
      >
        <div className="h-1 w-full bg-[linear-gradient(90deg,#2D6A4F_0%,#ff751f_55%,#E9A23B_100%)]" />

        <div className="px-5 py-6 sm:px-8 sm:py-8">
          {sent ? (
            <div className="py-2 text-center">
              <div className="mb-5 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2D6A4F,#3D9068)] shadow-[0_8px_24px_rgba(45,106,79,0.35)]">
                  <Icon name="EnvelopeIcon" size={28} className="text-white" />
                </div>
              </div>

              <h2 className="mb-2 text-2xl font-semibold tracking-tight text-white sm:text-[28px]">
                Check your inbox
              </h2>

              <p className="mx-auto mb-6 max-w-sm text-sm leading-6 text-white/65">
                We sent a secure sign-in link to{' '}
                <span className="font-semibold text-white/90">{email}</span>.
                Open the email and tap the link to continue.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setEmailError('');
                }}
                className="text-sm font-semibold text-[#ff751f] transition-opacity hover:opacity-80"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              {/* Logo */}
              <div className="mb-6 flex justify-center sm:mb-7">
                {/* Replace this block with your actual logo if needed */}
                <img
                  src="/logo.png"
                  alt="Voyagers Hook"
                  className="h-16 w-auto sm:h-20 md:h-24"
                />
              </div>

              {/* Heading */}
              <div className="mb-6 text-center sm:mb-7">
                <h2 className="mb-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Welcome back
                </h2>
                <p className="mx-auto max-w-sm text-sm leading-6 text-white/55">
                  Enter your email and we’ll send you a secure magic link.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={onSubmit} noValidate className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                      <Icon name="EnvelopeIcon" size={16} className="text-white/25" />
                    </div>

                    <input
                      id="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError('');
                      }}
                      aria-invalid={!!emailError}
                      aria-describedby={emailError ? 'email-error' : undefined}
                      className={[
                        'w-full rounded-2xl border bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/20',
                        'outline-none transition-all duration-200',
                        'focus:bg-white/[0.07] focus:ring-4 focus:ring-[#ff751f]/10',
                        emailError
                          ? 'border-red-400/60'
                          : 'border-white/10 focus:border-[#ff751f]/50',
                      ].join(' ')}
                    />
                  </div>

                  {emailError && (
                    <p
                      id="email-error"
                      className="mt-2 flex items-center gap-1.5 text-xs text-red-400"
                    >
                      <Icon name="ExclamationCircleIcon" size={13} />
                      {emailError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={[
                    'flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white',
                    'transition-all duration-200 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60',
                    isLoading
                      ? 'bg-[#ff751f]/50 shadow-none'
                      : 'bg-[linear-gradient(135deg,#ff751f,#e85a00)] shadow-[0_10px_30px_rgba(255,117,31,0.32)] hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(255,117,31,0.38)]',
                  ].join(' ')}
                >
                  {isLoading ? (
                    <>
                      <Icon name="ArrowPathIcon" size={16} className="animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Magic Link</span>
                      <Icon name="ArrowRightIcon" size={15} />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-5 text-center text-xs leading-5 text-white/32">
                Secure passwordless sign-in for Voyagers Hook members.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
