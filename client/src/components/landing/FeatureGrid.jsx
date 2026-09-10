import React from 'react';
import {
  Layers,
  Download,
  Palette,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Sliders,
  Maximize2,
  RotateCw,
} from 'lucide-react';

const coreFeatures = [
  {
    icon: Layers,
    title: 'Extensive Icon Library',
    description: 'Explore 1,000,000+ vector icons across 100+ categories and distinct visual styles with unified stroke weights.',
    gradient: 'from-indigo-500 via-indigo-600 to-purple-600',
    accentColor: '#6366f1',
    glow: 'shadow-indigo-500/25',
    tag: '1M+ Assets',
    previewChips: ['Line Style', 'Solid Fill', 'Dual-Tone', 'Flat Vector'],
  },
  {
    icon: Download,
    title: 'SVG & PNG Downloads',
    description: 'Download crisp vector SVG and transparent high-res PNG formats ready for websites, iOS/Android apps, and Figma.',
    gradient: 'from-emerald-400 via-teal-500 to-teal-700',
    accentColor: '#10b981',
    glow: 'shadow-teal-500/25',
    tag: 'Clean Vectors',
    previewChips: ['SVG Vector', 'PNG 512px', 'Zero Pixelation', 'Ready to Ship'],
  },
  {
    icon: Sliders,
    title: 'Built-In Icon Editor',
    description: 'Customize stroke width, rotate 360°, flip horizontally or vertically, and adjust padding directly in your browser.',
    gradient: 'from-rose-500 via-pink-600 to-amber-500',
    accentColor: '#FF5F52',
    glow: 'shadow-rose-500/25',
    tag: 'Zero Software Needed',
    previewChips: ['360° Rotation', 'Horizontal Flip', 'Canvas Scale', 'Custom Stroke'],
  },
  {
    icon: Palette,
    title: 'Recolor & Add Backdrops',
    description: 'Apply custom hex palettes to match your brand and generate squircle, circle, or rounded background frames.',
    gradient: 'from-amber-400 via-orange-500 to-rose-500',
    accentColor: '#f59e0b',
    glow: 'shadow-amber-500/25',
    tag: 'Brand Matching',
    colorSwatches: ['#00327d', '#FF5F52', '#00F5D4', '#FFD54F', '#ec4899'],
  },
];

const FeatureGrid = () => {
  return (
    <section className="w-full py-10 sm:py-14 bg-white/60 border-t border-landing-surface-container/60">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        {/* Compact Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-landing-primary tracking-tight">
            Built for Designers, Developers & Creators
          </h2>
          <p className="text-xs sm:text-sm text-landing-on-surface-variant mt-1.5">
            Everything you need to search, customize, and integrate vectors with zero friction.
          </p>
        </div>

        {/* 4 Unique High-Impact Feature Boxes (Modern 4-Column Responsive Layout) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {coreFeatures.map((feat) => {
            const IconComp = feat.icon;
            return (
              <div
                key={feat.title}
                className="group relative rounded-3xl p-5 sm:p-6 bg-white border border-landing-surface-container shadow-xs hover:shadow-xl hover:border-landing-primary/30 transition-all duration-300 flex flex-col justify-between overflow-hidden transform hover:-translate-y-1"
              >
                {/* Top Accent Gradient Bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${feat.gradient}`}
                />

                <div>
                  {/* Icon Badge with Glow */}
                  <div className="flex items-center justify-between mb-4 pt-1">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feat.gradient} text-white flex items-center justify-center shadow-md ${feat.glow} group-hover:scale-110 transition-transform duration-300`}
                    >
                      <IconComp className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold font-heading text-landing-primary group-hover:text-landing-vibrant-coral transition-colors mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-landing-on-surface-variant leading-relaxed font-medium">
                    {feat.description}
                  </p>
                </div>

                {/* Bottom Demonstration Element */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col gap-2">
                  {feat.previewChips ? (
                    <div className="flex flex-wrap gap-1.5">
                      {feat.previewChips.map((chip) => (
                        <span
                          key={chip}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-lg"
                        >
                          <CheckCircle2 className="w-3 h-3 text-landing-primary/70 shrink-0" />
                          <span>{chip}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-500 mr-1">Brand Presets:</span>
                      {feat.colorSwatches.map((col) => (
                        <div
                          key={col}
                          className="w-4 h-4 rounded-full border border-white shadow-2xs group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: col }}
                          title={col}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Subtle Hover Gradient Accent Glow */}
                <div
                  className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-15 pointer-events-none group-hover:opacity-35 transition-opacity"
                  style={{ backgroundColor: feat.accentColor }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;
