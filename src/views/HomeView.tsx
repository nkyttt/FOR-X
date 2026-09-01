import React from 'react';
import { HeroBanner } from '../components/home/HeroBanner';
import { FeaturedVideoSidebar } from '../components/home/FeaturedVideoSidebar';
import { LatestNewsSidebar } from '../components/home/LatestNewsSidebar';
import { StatisticsSection } from '../components/home/StatisticsSection';
import { PopularGamesSection } from '../components/home/PopularGamesSection';
import { FeatureStrip } from '../components/home/FeatureStrip';
import { CommunityCTA } from '../components/home/CommunityCTA';

export const HomeView: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Main Section matching the reference layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Hero Banner (8 Cols) */}
        <div className="lg:col-span-8 w-full">
          <HeroBanner />
        </div>

        {/* Right: Sidebar with Featured Video & Latest News (4 Cols) */}
        <div className="lg:col-span-4 w-full flex flex-col gap-6">
          <FeaturedVideoSidebar />
          <LatestNewsSidebar />
        </div>
      </div>

      {/* 5 Statistics Cards matching reference */}
      <StatisticsSection />

      {/* Popular Games Section matching reference */}
      <PopularGamesSection />

      {/* Feature Strip matching reference */}
      <FeatureStrip />

      {/* Community Call To Action matching reference */}
      <CommunityCTA />
    </div>
  );
};
