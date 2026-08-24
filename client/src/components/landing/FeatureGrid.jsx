import React from 'react';
import { Palette, Code2, Cloud, Sparkles, FolderHeart, ShieldCheck, Download, Zap } from 'lucide-react';

const features = [
  {
    icon: Palette,
    title: 'In-Browser Vector Editor',
    description: 'Recolor icons layer-by-layer, rotate, flip, and generate backdrop badges live in the browser without server roundtrips.',
    color: '#FF5F52',
  },
  {
    icon: Cloud,
    title: 'Google Drive Auto-Sync',
    description: 'Ingest and stream entire folders of icons directly from Google Drive with automated tag parsing and thumbnail caching.',
    color: '#00F5D4',
  },
  {
    icon: Code2,
    title: 'Custom WebFont Compiler',
    description: 'Select your favorite icons into a collection and compile them into standalone CSS WebFonts and SVG Sprite sheets.',
    color: '#6366f1',
  },
  {
    icon: Download,
    title: 'Multi-Format Export',
    description: 'Instant downloads in raw SVG, PNG (16px to 512px resolutions), EPS print vector, and Base64 Data URI strings.',
    color: '#FFD54F',
  },
  {
    icon: FolderHeart,
    title: 'Floating Collection Tray',
    description: 'Dock your favorite assets into personal boards, bulk recolor them with a click, and download full collections as ZIPs.',
    color: '#b32822',
  },
  {
    icon: ShieldCheck,
    title: 'Clear Freemium Licensing',
    description: 'Free tier with simple attribution snippets, or Pro subscription for unlimited attribution-free commercial licensing.',
    color: '#10b981',
  },
];

const FeatureGrid = () => {
  return (
    <section className="w-full py-16 sm:py-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-landing-vibrant-coral block mb-2">
            Why IconsUniverse
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-landing-primary tracking-tight mb-4">
            Built for Designers, Developers & Creators
          </h2>
          <p className="text-sm sm:text-base text-landing-on-surface-variant font-normal">
            Every feature of Flaticon.com elevated with modern speed, glassmorphism aesthetics, and cloud sync.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feat) => {
            const IconComp = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-8 rounded-4xl glass-landing bg-white/80 border border-white/80 shadow-glass hover:shadow-glass-hover transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm"
                  style={{ backgroundColor: `${feat.color}15`, color: feat.color }}
                >
                  <IconComp className="w-7 h-7" />
                </div>

                <div>
                  <h3 className="text-lg font-bold font-heading text-landing-on-surface mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-landing-on-surface-variant leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;
