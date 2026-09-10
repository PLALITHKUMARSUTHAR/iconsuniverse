import React from 'react';
import { Layers, Download, Palette, Sparkles, RotateCw, Archive } from 'lucide-react';

const features = [
  {
    icon: Layers,
    title: 'Extensive Icon Library',
    description: 'Explore a growing collection of icons across diverse styles, categories, and use cases.',
    gradient: 'from-indigo-500 to-violet-600',
    glow: 'shadow-indigo-500/20',
    borderHover: 'hover:border-indigo-400/50',
    accent: '#6366f1',
  },
  {
    icon: Download,
    title: 'SVG & PNG Downloads',
    description: 'Download icons in SVG and PNG formats, ready for websites, apps, presentations, and designs.',
    gradient: 'from-teal-400 to-emerald-600',
    glow: 'shadow-emerald-500/20',
    borderHover: 'hover:border-emerald-400/50',
    accent: '#10b981',
  },
  {
    icon: Palette,
    title: 'Built-In Icon Editor',
    description: 'Customize icons directly in the browser before downloading, without external design software.',
    gradient: 'from-rose-500 to-amber-500',
    glow: 'shadow-rose-500/20',
    borderHover: 'hover:border-rose-400/50',
    accent: '#FF5F52',
  },
  {
    icon: Sparkles,
    title: 'Recolor & Add Backdrops',
    description: 'Change icon colors and add custom backdrops to match your design, brand, or project.',
    gradient: 'from-amber-400 to-orange-500',
    glow: 'shadow-amber-500/20',
    borderHover: 'hover:border-amber-400/50',
    accent: '#f59e0b',
  },
  {
    icon: RotateCw,
    title: 'Rotate, Flip & Transform',
    description: 'Rotate, flip, and transform icons directly from the built-in editor.',
    gradient: 'from-fuchsia-500 to-pink-600',
    glow: 'shadow-fuchsia-500/20',
    borderHover: 'hover:border-pink-400/50',
    accent: '#ec4899',
  },
  {
    icon: Archive,
    title: 'Bulk Download as ZIP',
    description: 'Select multiple icons and download them together in a convenient ZIP file.',
    gradient: 'from-sky-400 to-blue-600',
    glow: 'shadow-sky-500/20',
    borderHover: 'hover:border-sky-400/50',
    accent: '#0ea5e9',
  },
];

const FeatureGrid = () => {
  return (
    <section className="w-full py-8 sm:py-12 bg-white/50 border-t border-landing-surface-container/50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        {/* Compact Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-landing-vibrant-coral bg-rose-50 border border-rose-200/60 px-2.5 py-0.5 rounded-full mb-1.5 shadow-2xs">
            Why IconsUniverse
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold font-heading text-landing-primary tracking-tight">
            Built for Designers, Developers & Creators
          </h2>
          <p className="text-xs sm:text-sm text-landing-on-surface-variant mt-1">
            Engineered for high-velocity workflows with zero friction.
          </p>
        </div>

        {/* Vibrant Compact Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {features.map((feat) => {
            const IconComp = feat.icon;
            return (
              <div
                key={feat.title}
                className={`group p-4 rounded-2xl glass-landing bg-white border border-landing-surface-container shadow-2xs hover:shadow-md transition-all duration-200 flex items-start gap-3.5 ${feat.borderHover}`}
              >
                {/* Vibrant Gradient Icon Badge */}
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feat.gradient} text-white flex items-center justify-center shrink-0 shadow-sm ${feat.glow} group-hover:scale-105 transition-transform duration-200`}
                >
                  <IconComp className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold font-heading text-landing-primary group-hover:text-landing-vibrant-coral transition-colors line-clamp-1 mb-1">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-landing-on-surface-variant leading-relaxed line-clamp-2">
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
