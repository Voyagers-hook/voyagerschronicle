import React from 'react';
import Icon from '@/components/ui/AppIcon';

const featuredTip = {
  id: 'tip-024',
  category: 'Technique',
  title: 'Reading the Water',
  teaser: 'Fish love to hide where fast water meets slow water. Look for the edge between currents — that\'s where the big ones wait.',
  readTime: '3 min read',
  level: 'Intermediate',
};

export default function FeaturedTip() {
  return (
    <div className="rounded-2xl p-5 shadow-card relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1A3D28 0%, #2D6A4F 100%)' }}>
      {/* Texture */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 70% 30%, white 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <Icon name="LightBulbIcon" size={16} className="text-amber-400" />
          </div>
          <span className="bg-white/10 border border-white/20 text-primary-200 text-xs font-sans font-semibold px-2.5 py-1 rounded-full">
            {featuredTip?.category}
          </span>
          <span className="bg-white/10 text-primary-200 text-xs font-sans px-2.5 py-1 rounded-full">
            {featuredTip?.level}
          </span>
        </div>

        <h3 className="font-display text-xl text-white mb-2">{featuredTip?.title}</h3>
        <p className="text-primary-200 font-sans text-sm leading-relaxed mb-4">
          {featuredTip?.teaser}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-primary-300 text-xs font-sans">
            <Icon name="ClockIcon" size={13} />
            <span>{featuredTip?.readTime}</span>
          </div>
          <button className="flex items-center gap-1.5 text-white text-xs font-sans font-semibold px-3 py-2 rounded-lg transition-all duration-150 active:scale-95" style={{ backgroundColor: '#ff751f' }}>
            Read Tip
            <Icon name="ArrowRightIcon" size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}