import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronUp, ChevronDown } from 'lucide-react';

const Footer = ({ collapsible = false }) => {
  const location = useLocation();
  const isSearchPage = location.pathname === '/search';
  const shouldBeCollapsible = collapsible || isSearchPage;

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <footer className="w-full bg-[#001e52] text-white transition-all duration-300 mt-12 border-t border-white/15 relative z-20">
      {/* If collapsible and currently collapsed, show the sleek expander bar */}
      {shouldBeCollapsible && !isExpanded ? (
        <div className="max-w-[1440px] mx-auto px-6 py-3.5 flex items-center justify-between text-xs text-white/80">
          <p className="text-white/90 font-medium">© 2026 IconsUniverse. All rights reserved.</p>

          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
            title="Expand Full Footer"
          >
            <span>Full Footer & Links</span>
            <ChevronUp className="w-4 h-4 text-landing-electric-teal" />
          </button>

          <Link to="/sitemap" className="text-white hover:text-landing-electric-teal font-semibold transition-colors">
            Sitemap
          </Link>
        </div>
      ) : (
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 pt-10 pb-8 animate-fade-in text-white">
          {/* If collapsible and expanded, show collapse button at top right */}
          {shouldBeCollapsible && (
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-colors cursor-pointer"
                title="Collapse Footer"
              >
                <span>Collapse Footer</span>
                <ChevronDown className="w-4 h-4 text-landing-electric-teal" />
              </button>
            </div>
          )}

          {/* Main 4-Column Grid: Brand + Content + Tools + Help */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-white/15">
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
              <ul className="flex flex-col gap-2 text-xs text-white/80">
                <li>
                  <Link to="/search" className="text-white/85 hover:text-white transition-colors">
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
              <ul className="flex flex-col gap-2 text-xs text-white/80">
                <li>
                  <Link to="/docs" className="text-white/85 hover:text-white transition-colors">
                    API
                  </Link>
                </li>
              </ul>
            </div>

            {/* Help (with Terms & Conditions, Privacy Policy included) */}
            <div>
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-landing-electric-teal mb-3">
                Help
              </h4>
              <ul className="flex flex-col gap-2 text-xs text-white/80">
                <li>
                  <Link to="/about" className="text-white/85 hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-white/85 hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/whats-new" className="text-white/85 hover:text-white transition-colors">
                    What's New
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-white/85 hover:text-white transition-colors">
                    Terms and Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-white/85 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Copyright on left, Sitemap on right */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/80 gap-3">
            <p className="text-white/90">© 2026 IconsUniverse. All rights reserved.</p>

            <Link to="/sitemap" className="text-white hover:text-landing-electric-teal font-semibold transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
