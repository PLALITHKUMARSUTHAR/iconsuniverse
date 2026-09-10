import React from 'react';
import HeroSection from '../components/landing/HeroSection';
import CategoryGrid from '../components/landing/CategoryGrid';
import LiveEditorTeaser from '../components/landing/LiveEditorTeaser';
import TrendingPacks from '../components/landing/TrendingPacks';
import SEOHead from '../components/common/SEOHead';

const HomePage = () => {
  return (
    <div className="flex flex-col">
      <SEOHead
        title="IconsUniverse — 1,000,000 Free Vector Icons & Icon Packs"
        description="Search, live-recolor, and download 1,000,000 vector icons in SVG, PNG, EPS, and Base64 format."
        keywords={['vector icons', 'free icons', 'svg icons', 'icon packs', 'png icons', 'vector editor']}
      />
      {/* 1. Hero Search & Quick Style Badges */}
      <HeroSection />

      {/* 2. Curated Category Showcase & Browse Drawer */}
      <CategoryGrid />

      {/* 3. Featured Icon Sets (Compact single row carousel) */}
      <TrendingPacks />

      {/* 4. Live In-Browser Editor Demonstration */}
      <LiveEditorTeaser />
    </div>
  );
};

export default HomePage;
