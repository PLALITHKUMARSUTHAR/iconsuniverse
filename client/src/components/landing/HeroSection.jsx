import React from 'react';
import SearchBar from '../common/SearchBar';

const HeroSection = () => {
  return (
    <section className="relative w-full pt-10 pb-10 sm:pt-13 sm:pb-14 overflow-hidden">
      {/* Soft Background Decorative Glows */}
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-landing-vibrant-coral/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-landing-electric-teal/15 blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 text-center relative z-10">
        {/* Brand Top Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-landing border border-white/80 shadow-2xs mb-3.5 animate-fade-in">
          <img src="/logo.png" alt="Logo" className="w-4 h-4 object-contain rounded" />
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-landing-primary">
            Vector Icon Marketplace & Studio
          </span>
        </div>

        {/* Clean Headline */}
        <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-extrabold font-heading text-landing-primary tracking-tight max-w-3xl mx-auto leading-tight mb-3">
          Free Vector Icons with <span className="text-transparent bg-clip-text bg-energy-gradient">In-Browser Live Editing</span>
        </h1>

        <p className="text-xs sm:text-base text-landing-on-surface-variant max-w-lg mx-auto mb-6 font-normal leading-relaxed">
          Search, recolor live, and download SVG, PNG, or bulk ZIP packages.
        </p>

        {/* Hero Search Bar */}
        <div className="max-w-2xl mx-auto">
          <SearchBar isHero={true} />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
