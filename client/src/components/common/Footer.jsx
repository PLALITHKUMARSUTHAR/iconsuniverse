import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full bg-[#001e52] text-white pt-12 pb-8 mt-16 border-t border-white/10">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8">
        {/* Main Grid: Brand + Content + Tools + Help */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-white/10">
          {/* Brand & Description */}
          <div className="flex flex-col gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="IconsUniverse"
                className="h-8 w-auto object-contain rounded-lg"
              />
              <span className="font-heading font-extrabold text-xl text-white tracking-tight">
                Icons<span className="text-landing-vibrant-coral">Universe</span>
              </span>
            </Link>
            <p className="text-xs text-white leading-relaxed">
              Clean vector icons with in-browser recoloring and Google Drive synchronization.
            </p>
          </div>

          {/* Content */}
          <div>
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-landing-electric-teal mb-3">
              Content
            </h4>
            <ul className="flex flex-col gap-2 text-xs text-landing-primary-fixed-dim">
              <li>
                <Link to="/search" className="hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-landing-electric-teal mb-3">
              Tools
            </h4>
            <ul className="flex flex-col gap-2 text-xs text-landing-primary-fixed-dim">
              <li>
                <Link to="/docs" className="hover:text-white transition-colors">
                  API
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-landing-electric-teal mb-3">
              Help
            </h4>
            <ul className="flex flex-col gap-2 text-xs text-landing-primary-fixed-dim">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/whats-new" className="hover:text-white transition-colors">
                  What's New
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Secondary Row: Terms & Privacy */}
        <div className="py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-landing-primary-fixed-dim">
          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms and Conditions
            </Link>
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-white/60">
            <span>Free Attribution License</span>
            <span>•</span>
            <span>Commercial Pro Terms</span>
          </div>
        </div>

        {/* Bottom Bar with Sitemap on Left beside Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-landing-primary-fixed-dim gap-3">
          <div className="flex items-center gap-3">
            <Link to="/sitemap" className="text-white hover:text-landing-electric-teal font-semibold transition-colors">
              Sitemap
            </Link>
            <span>•</span>
            <p>© 2026 IconsUniverse. All rights reserved.</p>
          </div>
          <p className="text-[11px] text-white/50">
            Engineered for high-performance vector search and workflows.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
