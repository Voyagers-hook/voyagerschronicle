import React from 'react';
import Icon from '@/components/ui/AppIcon';

const kpiData = [
  {
    id: 'kpi-total-catches',
    label: 'Total Catches',
    value: '47',
    unit: 'fish',
    change: '+3 this week',
    trend: 'up',
    accent: 'bg-primary-50 border-primary-200',
    valueColor: 'text-primary-700',
    iconName: 'ClipboardDocumentListIcon',
    iconColor: 'text-primary-500',
    iconBg: 'bg-primary-100',
    hero: true,
    desc: 'All-time logged catches',
  },
  {
    id: 'kpi-badges',
    label: 'Badges Earned',
    value: '12',
    unit: 'of 48',
    change: '+1 this month',
    trend: 'up',
    accent: 'bg-amber-50 border-amber-200',
    valueColor: 'text-amber-700',
    iconName: 'TrophyIcon',
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-100',
    hero: false,
    desc: 'Achievement collection',
  },
  {
    id: 'kpi-biggest',
    label: 'Biggest Catch',
    value: '3.4',
    unit: 'kg',
    change: 'Murray Cod',
    trend: 'neutral',
    accent: 'bg-blue-50 border-blue-200',
    valueColor: 'text-blue-700',
    iconName: 'StarIcon',
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-100',
    hero: false,
    desc: 'Personal record',
  },
  {
    id: 'kpi-species',
    label: 'Species Found',
    value: '9',
    unit: 'types',
    change: 'Trout added Apr 14',
    trend: 'up',
    accent: 'bg-green-50 border-green-200',
    valueColor: 'text-green-700',
    iconName: 'MagnifyingGlassIcon',
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    hero: false,
    desc: 'Unique species logged',
  },
  {
    id: 'kpi-streak',
    label: 'Current Streak',
    value: '4',
    unit: 'weeks',
    change: 'Keep it up!',
    trend: 'warning',
    accent: 'bg-red-50 border-red-300',
    valueColor: 'text-red-600',
    iconName: 'FireIcon',
    iconColor: 'text-red-500',
    iconBg: 'bg-red-100',
    hero: false,
    desc: 'Keep the streak alive',
  },
];

export default function KpiBentoGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpiData?.map((kpi) => (
        <div
          key={kpi?.id}
          className={`
            bg-white rounded-2xl p-5 shadow-card border card-lift
            ${kpi?.hero ? 'col-span-2 md:col-span-2' : 'col-span-1'}
            ${kpi?.accent}
          `}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs font-sans font-semibold text-earth-400 uppercase tracking-widest mb-0.5">
                {kpi?.label}
              </p>
              <p className="text-xs font-sans text-earth-300">{kpi?.desc}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${kpi?.iconBg}`}>
              <Icon name={kpi?.iconName as Parameters<typeof Icon>[0]['name']} size={20} className={kpi?.iconColor} />
            </div>
          </div>

          <div className="flex items-end gap-2 mb-2">
            <span className={`font-display text-4xl tabular-nums font-bold ${kpi?.valueColor}`}>
              {kpi?.value}
            </span>
            <span className="text-earth-400 font-sans text-sm mb-1">{kpi?.unit}</span>
          </div>

          <div className={`flex items-center gap-1 text-xs font-sans font-medium ${
            kpi?.trend === 'up' ? 'text-green-600' :
            kpi?.trend === 'warning'? 'text-red-600' : 'text-earth-400'
          }`}>
            {kpi?.trend === 'up' && <Icon name="ArrowTrendingUpIcon" size={14} />}
            {kpi?.trend === 'warning' && <Icon name="ExclamationTriangleIcon" size={14} />}
            {kpi?.trend === 'neutral' && <Icon name="MinusIcon" size={14} />}
            <span>{kpi?.change}</span>
          </div>
        </div>
      ))}
    </div>
  );
}