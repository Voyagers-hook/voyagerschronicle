'use client';

import React from 'react';
import Image from 'next/image';
import LoginForm from './components/LoginForm';

// SVG fish — decorative, no emoji
const FishSvg = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 60 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="28" cy="18" rx="22" ry="12" fill={color} opacity="0.9" />
    <polygon points="50,18 60,8 60,28" fill={color} opacity="0.7" />
    <circle cx="14" cy="14" r="3" fill="white" opacity="0.8" />
    <circle cx="13" cy="13" r="1.5" fill="#0a1f3c" />
  </svg>
);

const StarSvg = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
  </svg>
);

const FLOATS = [
  { type: 'fish', color: 'rgba(59,130,246,0.55)',  x: '8%',  y: '12%', size: 44, delay: '0s',   dur: '3.4s' },
  { type: 'star', color: 'rgba(249,115,22,0.7)',   x: '85%', y: '18%', size: 26, delay: '0.6s', dur: '2.8s' },
  { type: 'star', color: 'rgba(245,158,11,0.75)',  x: '88%', y: '62%', size: 20, delay: '1.2s', dur: '2.4s' },
  { type: 'fish', color: 'rgba(45,106,79,0.55)',   x: '4%',  y: '68%', size: 36, delay: '0.9s', dur: '3.8s' },
  { type: 'fish', color: 'rgba(255,117,31,0.45)',  x: '78%', y: '80%', size: 30, delay: '1.8s', dur: '3.1s' },
  { type: 'star', color: 'rgba(233,162,59,0.65)',  x: '42%', y: '6%',  size: 18, delay: '0.3s', dur: '2.1s' },
];

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">

      {/* Full-screen background */}
      <Image
        src="/assets/images/background_app-1776788407008.png"
        alt="Fishing adventure background"
        fill
        priority
        className="object-cover object-center"
        style={{ zIndex: 0 }}
      />

      {/* Layered overlays for depth */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(5,18,12,0.55) 0%, rgba(5,18,12,0.35) 50%, rgba(5,18,12,0.65) 100%)', zIndex: 1 }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(45,106,79,0.18) 0%, transparent 70%)', zIndex: 2 }} />

      {/* Floating decorative shapes */}
      {FLOATS.map((f, i) => (
        <div
          key={i}
          className="absolute pointer-events-none select-none hidden sm:block"
          style={{
            left: f.x,
            top: f.y,
            zIndex: 3,
            animation: `floatBob ${f.dur} ${f.delay} ease-in-out infinite`,
            filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.35))',
          }}
        >
          {f.type === 'fish'
            ? <FishSvg size={f.size} color={f.color} />
            : <StarSvg size={f.size} color={f.color} />
          }
        </div>
      ))}

      {/* Twinkling sparkle dots */}
      {[
        { x: '22%', y: '38%' }, { x: '68%', y: '28%' }, { x: '55%', y: '72%' },
        { x: '14%', y: '82%' }, { x: '90%', y: '44%' }, { x: '36%', y: '90%' },
      ].map((pos, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-white hidden sm:block"
          style={{
            left: pos.x,
            top: pos.y,
            zIndex: 3,
            animation: `twinkle ${1.4 + i * 0.35}s ${i * 0.5}s ease-in-out infinite`,
          }}
        />
      ))}

      {/* Main content */}
      <div className="relative flex flex-col items-center w-full px-5" style={{ zIndex: 10, maxWidth: 420 }}>

        {/* Logo */}
        <div
          className="mb-6"
          style={{ animation: 'logoWobble 6s ease-in-out infinite' }}
        >
          <Image
            src="/assets/images/little_voyagers_logo-1776778067350.png"
            alt="Little Voyagers Logo"
            width={120}
            height={120}
            priority
            className="object-contain drop-shadow-2xl"
          />
        </div>

        {/* Rarity tier pills — purely decorative */}
        <div className="flex items-center gap-2 mb-6">
          {[
            { label: 'Widespread', color: '#86a86e' },
            { label: 'Elusive',    color: '#3D9068' },
            { label: 'Specimen',   color: '#3B82F6' },
            { label: 'Legendary',  color: '#F59E0B' },
          ].map((t, i) => (
            <div
              key={t.label}
              className="px-2.5 py-1 rounded-full text-white font-sans font-bold text-[10px] tracking-wide"
              style={{
                backgroundColor: `${t.color}30`,
                border: `1px solid ${t.color}60`,
                color: t.color,
                animation: `cardPop 0.4s ${i * 0.08}s ease-out both`,
              }}
            >
              {t.label}
            </div>
          ))}
        </div>

        {/* Glass login card */}
        <div className="w-full">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
