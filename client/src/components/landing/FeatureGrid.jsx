import React from 'react';
import { Layers, Download, Palette, Sparkles, RotateCw, Archive } from 'lucide-react';

const features = [
  {
    icon: Layers,
    title: 'Extensive Icon Library',
    description: 'Explore a growing collection of icons across diverse styles, categories, and use cases.',
    color: '#6366f1',
  },
  {
    icon: Download,
    title: 'SVG & PNG Downloads',
    description: 'Download icons in SVG and PNG formats, ready for websites, apps, presentations, and designs.',
    color: '#00F5D4',
  },
  {
    icon: Palette,
    title: 'Built-In Icon Editor',
    description: 'Customize icons directly in the browser before downloading, without external design software.',
    color: '#FF5F52',
  },
  {
    icon: Sparkles,
    title: 'Recolor & Add Backdrops',
    description: 'Change icon colors and add custom backdrops to match your design, brand, or project.',
    color: '#FFD54F',
  },
  {
    icon: RotateCw,
    title: 'Rotate, Flip & Transform',
    description: 'Rotate, flip, and transform icons directly from the built-in editor.',
    color: '#ec4899',
  },
  {
    icon: Archive,
    title: 'Bulk Download as ZIP',
    description: 'Select multiple icons and download them together in a convenient ZIP file.',
    color: '#0ea5e9',
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
