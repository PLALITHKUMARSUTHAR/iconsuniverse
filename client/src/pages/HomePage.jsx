import React from 'react';
import HeroSection from '../components/landing/HeroSection';
import CategoryGrid from '../components/landing/CategoryGrid';
import PricingTeaser from '../components/landing/PricingTeaser';

const HomePage = () => {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <CategoryGrid />
      <PricingTeaser />
    </div>
  );
};

export default HomePage;
