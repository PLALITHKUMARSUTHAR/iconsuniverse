import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full bg-[#001e52] text-white pt-12 pb-8 mt-16 border-t border-white/10">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-white/10">
          {/* Brand */}
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
            <p className="text-xs text-landing-primary-container leading-relaxed">
              Clean vector icons with in-browser recoloring, custom WebFont generation, and Google Drive synchronization.
            </p>
          </div>

          {/* Formats & Tools */}
          <div>
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-landing-electric-teal mb-3">
              Tools & Formats
            </h4>
            <ul className="flex flex-col gap-2 text-xs text-landing-primary-fixed-dim">
              <li><Link to="/editor" className="hover:text-white transition-colors">In-Browser Vector Editor</Link></li>
              <li><Link to="/search?format=svg" className="hover:text-white transition-colors">SVG Vector Downloads</Link></li>
              <li><Link to="/search?format=png" className="hover:text-white transition-colors">PNG Multi-Resolution</Link></li>
              <li><Link to="/search" className="hover:text-white transition-colors">Custom WebFont Bundles</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-landing-electric-teal mb-3">
              Categories
            </h4>
            <ul className="flex flex-col gap-2 text-xs text-landing-primary-fixed-dim">
              <li><Link to="/search?category=shopping-ecommerce" className="hover:text-white transition-colors">Shopping & E-Commerce</Link></li>
              <li><Link to="/search?category=technology-devices" className="hover:text-white transition-colors">Technology & Devices</Link></li>
              <li><Link to="/search?category=finance-banking" className="hover:text-white transition-colors">Finance & Banking</Link></li>
              <li><Link to="/search?category=ui-interface" className="hover:text-white transition-colors">UI & Interface</Link></li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-landing-electric-teal mb-3">
              Platform
            </h4>
            <ul className="flex flex-col gap-2 text-xs text-landing-primary-fixed-dim">
              <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing & Pro License</Link></li>
              <li><Link to="/admin" className="hover:text-white transition-colors">Admin & Drive Sync</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Account Login</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-landing-primary-fixed-dim gap-3">
          <p>© 2026 IconsUniverse. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Free Attribution License</span>
            <span>Commercial Pro Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
