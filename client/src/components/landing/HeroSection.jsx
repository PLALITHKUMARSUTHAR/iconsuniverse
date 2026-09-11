import React from 'react';
import SearchBar from '../common/SearchBar';

const HeroSection = () => {
  return (
    <section className="relative w-full pt-8 pb-8 sm:pt-10 sm:pb-12 overflow-hidden">
      {/* Soft Background Decorative Glows */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-landing-vibrant-coral/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-24 w-72 h-72 rounded-full bg-landing-electric-teal/15 blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 text-center relative z-10">
        {/* Brand Top Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-landing border border-white/80 shadow-2xs mb-3 animate-fade-in">
          <img src="/logo.png" alt="Logo" className="w-3.5 h-3.5 object-contain rounded" />
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-landing-primary">
            Vector Icon Marketplace & Studio
          </span>
        </div>

        {/* Clean Headline */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-landing-primary tracking-tight max-w-2xl mx-auto leading-snug mb-2.5">
          Free Vector Icons with <span className="text-transparent bg-clip-text bg-energy-gradient">In-Browser Live Editing</span>
        </h1>

        <p className="text-xs sm:text-sm text-landing-on-surface-variant max-w-md mx-auto mb-5 font-normal leading-relaxed">
          Search, recolor live, and download SVG, PNG, or bulk ZIP packages.
        </p>

        {/* Hero Search Bar */}
        <div className="max-w-xl mx-auto">
          <SearchBar isHero={true} />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
