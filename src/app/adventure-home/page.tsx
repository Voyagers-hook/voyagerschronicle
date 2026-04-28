import React from 'react';
import AppLayout from '@/components/AppLayout';
import HomeHero from './components/HomeHero';
import CardGameKpis from './components/CardGameKpis';
import RecentCatchesGallery from './components/RecentCatchesGallery';
import RecentCards from './components/RecentCards';
import TradeActivity from './components/TradeActivity';
import FeaturedTip from './components/FeaturedTip';

export default function AdventureHomePage() {
  return (
    <AppLayout currentPath="/adventure-home">
      <div className="space-y-6 fade-in">
        <HomeHero />
        <CardGameKpis />
        <RecentCatchesGallery />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <RecentCards />
          </div>
          <div className="space-y-6">
            <FeaturedTip />
            <TradeActivity />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
