'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

const BUBBLES = [
  { size: 12, x: '15%', delay: '0s', duration: '4s' },
  { size: 8, x: '30%', delay: '1s', duration: '3.5s' },
  { size: 16, x: '55%', delay: '0.5s', duration: '5s' },
  { size: 10, x: '70%', delay: '2s', duration: '3.8s' },
  { size: 14, x: '88%', delay: '1.5s', duration: '4.5s' },
  { size: 6, x: '45%', delay: '0.8s', duration: '3.2s' },
];

// SVG fish shape — no emoji
const FishSvg = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 60 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="28" cy="18" rx="22" ry="12" fill={color} opacity="0.9" />
    <polygon points="50,18 60,8 60,28" fill={color} opacity="0.7" />
    <circle cx="14" cy="14" r="3" fill="white" opacity="0.8" />
    <circle cx="13" cy="13" r="1.5" fill="#0a1f3c" />
  </svg>
);

// SVG star shape — no emoji
const StarSvg = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
  </svg>
);

const FLOAT_SHAPES = [
  { type: 'fish', color: 'rgba(59,130,246,0.7)', x: '10%', y: '20%', size: 56, delay: '0s', duration: '3.2s' },
  { type: 'star', color: 'rgba(249,115,22,0.8)', x: '75%', y: '15%', size: 32, delay: '0.8s', duration: '2.8s' },
  { type: 'star', color: 'rgba(245,158,11,0.9)', x: '85%', y: '55%', size: 28, delay: '0.3s', duration: '2.5s' },
  { type: 'fish', color: 'rgba(45,106,79,0.7)', x: '5%', y: '65%', size: 44, delay: '1.2s', duration: '3.5s' },
  { type: 'fish', color: 'rgba(236,72,153,0.6)', x: '60%', y: '80%', size: 36, delay: '0.6s', duration: '3s' },
  { type: 'star', color: 'rgba(233,162,59,0.8)', x: '40%', y: '10%', size: 24, delay: '1.5s', duration: '2.2s' },
];

export default function LoginBrand() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div
      className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-12"
      style={{ background: 'linear-gradient(160deg, #0a1f3c 0%, #0d3b2e 35%, #1a5c42 65%, #2D6A4F 100%)' }}
    >
      {/* Animated wave background */}
      <div className="absolute inset-0 overflow-hidden">
        <svg className="absolute bottom-0 left-0 w-full" style={{ animation: 'waveMove 6s ease-in-out infinite' }} viewBox="0 0 1440 320" preserveAspectRatio="none" height="200">
          <path fill="rgba(45,106,79,0.3)" d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,181.3C672,192,768,160,864,138.7C960,117,1056,107,1152,117.3C1248,128,1344,160,1392,176L1440,192L1440,320L0,320Z" />
        </svg>
        <svg className="absolute bottom-0 left-0 w-full" style={{ animation: 'waveMove 8s ease-in-out infinite reverse' }} viewBox="0 0 1440 320" preserveAspectRatio="none" height="160">
          <path fill="rgba(255,117,31,0.12)" d="M0,224L60,213.3C120,203,240,181,360,181.3C480,181,600,203,720,208C840,213,960,203,1080,186.7C1200,171,1320,149,1380,138.7L1440,128L1440,320L0,320Z" />
        </svg>
      </div>

      {/* Floating bubbles */}
      {mounted && BUBBLES.map((b, i) => (
        <div
          key={i}
          className="absolute rounded-full border-2 border-white/20"
          style={{
            width: b.size,
            height: b.size,
            left: b.x,
            bottom: '-20px',
            animation: `bubbleRise ${b.duration} ${b.delay} ease-in infinite`,
            background: 'rgba(255,255,255,0.08)',
          }}
        />
      ))}

      {/* Floating SVG shapes — no emoji */}
      {mounted && FLOAT_SHAPES.map((shape, i) => (
        <div
          key={i}
          className="absolute select-none pointer-events-none"
          style={{
            left: shape.x,
            top: shape.y,
            animation: `floatBob ${shape.duration} ${shape.delay} ease-in-out infinite`,
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
            zIndex: 5,
          }}
        >
          {shape.type === 'fish'
            ? <FishSvg size={shape.size} color={shape.color} />
            : <StarSvg size={shape.size} color={shape.color} />
          }
        </div>
      ))}

      {/* Sparkle dots */}
      {mounted && [
        { x: '20%', y: '40%' }, { x: '65%', y: '30%' }, { x: '50%', y: '60%' },
        { x: '80%', y: '70%' }, { x: '35%', y: '85%' }, { x: '90%', y: '40%' },
      ].map((pos, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-white"
          style={{
            left: pos.x,
            top: pos.y,
            animation: `twinkle ${1.5 + i * 0.3}s ${i * 0.4}s ease-in-out infinite`,
            zIndex: 4,
          }}
        />
      ))}

      {/* Top area — logo only, centred, no text */}
      <div className="relative z-10 flex justify-center">
        <div style={{ animation: 'logoWobble 4s ease-in-out infinite' }}>
          <Image
            src="/assets/images/little_voyagers_logo-1776778067350.png"
            alt="Little Voyagers Project Somerset logo"
            width={160}
            height={160}
            className="object-contain drop-shadow-2xl"
          />
        </div>
      </div>

      {/* Centre — hero content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center py-8">
        <div
          className="inline-block mb-4 px-4 py-2 rounded-2xl font-display text-sm uppercase tracking-widest"
          style={{ background: 'rgba(255,117,31,0.25)', color: '#ff9a5c', border: '2px solid rgba(255,117,31,0.4)', animation: 'pulseBadge 2s ease-in-out infinite' }}
        >
          Your Fishing Adventure Awaits!
        </div>

        <h1 className="font-display text-5xl xl:text-6xl text-white leading-tight mb-4 drop-shadow-lg">
          Catch Cards,
          <br />
          <span style={{ color: '#ff751f', textShadow: '0 0 30px rgba(255,117,31,0.5)' }}>Win Big!</span>
        </h1>

        <p className="text-green-100 text-lg font-sans font-normal leading-relaxed max-w-md">
          Collect amazing fish cards, trade with friends, and become the ultimate Little Voyager!
        </p>
      </div>

      {/* Bottom — decorative rarity tier labels only, no fake stats */}
      <div className="relative z-10">
        <div className="grid grid-cols-4 gap-2">
          {[
            { tier: 'Widespread', bg: 'linear-gradient(135deg, #d4a96a, #c49050)' },
            { tier: 'Elusive', bg: 'linear-gradient(135deg, #2D6A4F, #3D9068)' },
            { tier: 'Specimen', bg: 'linear-gradient(135deg, #3B82F6, #2563EB)' },
            { tier: 'Legendary', bg: 'linear-gradient(135deg, #F59E0B, #D97706)' },
          ].map((t, i) => (
            <div
              key={t.tier}
              className="rounded-2xl p-3 border-2 border-white/20 text-center"
              style={{
                background: t.bg,
                animation: `cardPop 0.5s ${0.1 * i}s ease-out both, floatBob 3s ${i * 0.5}s ease-in-out infinite`,
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              }}
            >
              <p className="text-white text-xs font-bold leading-tight">{t.tier}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}