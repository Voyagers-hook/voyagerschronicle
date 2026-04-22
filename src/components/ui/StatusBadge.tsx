import React from 'react';

type BadgeVariant = 'earned' | 'inprogress' | 'locked' | 'gold' | 'silver' | 'bronze' | 'rare';

interface StatusBadgeProps {
  variant: BadgeVariant;
  label: string;
  size?: 'sm' | 'md';
}

const variantStyles: Record<BadgeVariant, string> = {
  earned: 'bg-green-100 text-green-800 border border-green-200',
  inprogress: 'bg-amber-100 text-amber-800 border border-amber-200',
  locked: 'bg-gray-100 text-gray-500 border border-gray-200',
  gold: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  silver: 'bg-slate-100 text-slate-700 border border-slate-300',
  bronze: 'bg-orange-100 text-orange-800 border border-orange-200',
  rare: 'bg-purple-100 text-purple-800 border border-purple-200',
};

export default function StatusBadge({ variant, label, size = 'sm' }: StatusBadgeProps) {
  const sizeClass = size === 'sm' ?'text-xs px-2 py-0.5' :'text-sm px-2.5 py-1';

  return (
    <span className={`inline-flex items-center rounded-full font-sans font-semibold ${sizeClass} ${variantStyles[variant]}`}>
      {label}
    </span>
  );
}