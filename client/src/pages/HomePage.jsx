import React from 'react';
import HeroSection from '../components/landing/HeroSection';
import CategoryGrid from '../components/landing/CategoryGrid';
import LiveEditorTeaser from '../components/landing/LiveEditorTeaser';
import TrendingPacks from '../components/landing/TrendingPacks';
import FeatureGrid from '../components/landing/FeatureGrid';
import PricingTeaser from '../components/landing/PricingTeaser';
import SEOHead from '../components/common/SEOHead';

const HomePage = () => {
  return (
    <div className="flex flex-col">
      <SEOHead
        title="IconsUniverse — 1,000,000 Free Vector Icons & Icon Packs"
        description="Search, live-recolor, and download 1,000,000 vector icons in SVG, PNG, EPS, and Base64 format with Google Drive synchronization."
        keywords={['vector icons', 'free icons', 'svg icons', 'icon packs', 'png icons', 'vector editor']}
      />
      {/* 1. Hero Search & Quick Style Badges */}
      <HeroSection />

      {/* 2. Curated Category Showcase & Browse Drawer */}
      <CategoryGrid />

      {/* 3. Featured Icon Sets (Compact single row carousel) */}
      <TrendingPacks />

      {/* 4. Built for Designers, Developers & Creators Feature Grid */}
      <FeatureGrid />

      {/* 5. Live In-Browser Editor Demonstration */}
      <LiveEditorTeaser />

      {/* 6. Transparent Pricing Plans & Pro CTA */}
      <PricingTeaser />
    </div>
  );
};

export default HomePage;
