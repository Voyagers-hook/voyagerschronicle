'use client';

import React from 'react';
import Image from 'next/image';
import LoginForm from './components/LoginForm';

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      <Image
        src="/assets/images/background_app-1776788407008.png"
        alt="Fishing adventure background"
        fill
        priority
        className="object-cover object-center"
        style={{ zIndex: 0 }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.32) 100%)', zIndex: 1 }}
      />
      <div className="relative z-10 flex flex-col items-center w-full px-4" style={{ maxWidth: 420 }}>
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
        <LoginForm />
        <p className="mt-5 text-center text-xs font-sans text-white/80" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
          Please use the email you signed up for your Little Voyagers Account with. Contact us if you need help!
        </p>
      </div>
    </div>
  );
}
