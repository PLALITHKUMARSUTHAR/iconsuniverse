import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Crown, Sparkles, ArrowRight } from 'lucide-react';
import Button from '../common/Button';

const PricingTeaser = () => {
  return (
    <section className="w-full py-16 sm:py-24 bg-gradient-to-b from-transparent to-landing-surface-container-low/80">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-landing-vibrant-coral block mb-2">
            Transparent Plans
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-landing-primary tracking-tight mb-4">
            Free Forever. Upgrade for Unlimited Pro Power.
          </h2>
          <p className="text-sm sm:text-base text-landing-on-surface-variant font-normal">
            Choose the plan that matches your creative workflow.
          </p>
        </div>

        {/* Pricing Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="p-8 sm:p-10 rounded-4xl glass-landing bg-white/90 border border-white/80 shadow-glass flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-landing-on-surface-variant">
                  Free Starter
                </span>
                <span className="px-3 py-1 rounded-full bg-landing-surface-container text-xs font-bold text-landing-primary">
                  Standard
                </span>
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl sm:text-5xl font-extrabold font-heading text-landing-primary">₹0</span>
                <span className="text-xs text-landing-on-surface-variant">/ month</span>
              </div>
              <ul className="flex flex-col gap-3.5 text-sm text-landing-on-surface-variant mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Access to 40,000+ Free Vector Icons</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Live In-Browser Icon Editor</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Standard SVG and PNG Downloads</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>20 Downloads / day with attribution</span>
                </li>
              </ul>
            </div>

            <Link to="/signup" className="w-full">
              <Button variant="outline" size="lg" className="w-full">
                Get Started Free
              </Button>
            </Link>
          </div>

          {/* Pro Tier (Hero Card) */}
          <div className="relative p-8 sm:p-10 rounded-4xl bg-gradient-to-br from-[#001e52] to-[#00327d] text-white shadow-2xl border border-white/20 flex flex-col justify-between transform md:scale-105">
            <div className="absolute -top-4 right-8 px-4 py-1.5 rounded-full bg-energy-gradient text-white text-xs font-extrabold shadow-coral">
              MOST POPULAR
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-landing-electric-teal flex items-center gap-1.5">
                  <Crown className="w-4 h-4" />
                  <span>IconsUniverse Pro</span>
                </span>
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl sm:text-5xl font-extrabold font-heading text-white">₹99</span>
                <span className="text-xs text-landing-primary-container">/ month</span>
              </div>
              <ul className="flex flex-col gap-3.5 text-sm text-landing-primary-fixed-dim mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-landing-electric-teal shrink-0" />
                  <span className="text-white font-medium">Unlimited Downloads (No Daily Quota)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-landing-electric-teal shrink-0" />
                  <span className="text-white font-medium">No Attribution Required (Commercial License)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-landing-electric-teal shrink-0" />
                  <span className="text-white font-medium">Bulk Pack ZIP & Collection Asset Bundles</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-landing-electric-teal shrink-0" />
                  <span className="text-white font-medium">High-Res EPS Print Vectors & Premium Icons</span>
                </li>
              </ul>
            </div>

            <Link to="/pricing" className="w-full">
              <Button variant="primary" size="lg" className="w-full">
                Upgrade to Pro Plan
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingTeaser;
