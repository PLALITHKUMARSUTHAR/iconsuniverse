import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Shield, FileText, HelpCircle, Sparkles, Code, Mail, Map, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

const pageData = {
  '/about': {
    title: 'About IconsUniverse',
    badge: 'Our Mission',
    icon: HelpCircle,
    content: (
      <div className="flex flex-col gap-4 text-sm text-subpage-on-surface-variant leading-relaxed">
        <p>
          IconsUniverse is a next-generation vector icon platform housing over 1,000,000 meticulously indexed icons and curated packs.
        </p>
        <p>
          Built for modern developers, designers, and creative agencies, IconsUniverse delivers high-speed asset discovery, in-browser live recoloring, and direct Google Drive cloud synchronization.
        </p>
        <div className="p-6 rounded-3xl bg-subpage-surface-container-low border border-subpage-outline-variant/30 mt-4">
          <h3 className="font-heading font-bold text-subpage-primary text-base mb-2">Key Highlights</h3>
          <ul className="list-disc list-inside space-y-1.5 text-xs">
            <li>1,000,000+ vector icons across 163 specialized categories</li>
            <li>In-browser SVG layer recoloring & badge generator</li>
            <li>Instant multi-format exports in SVG, PNG, EPS, and Base64</li>
            <li>Attribution-free commercial licensing for Pro subscribers</li>
          </ul>
        </div>
      </div>
    ),
  },
  '/contact': {
    title: 'Contact Us',
    badge: 'Support & Inquiries',
    icon: Mail,
    content: (
      <div className="flex flex-col gap-4 text-sm text-subpage-on-surface-variant leading-relaxed">
        <p>
          Have questions, feedback, or need enterprise licensing assistance? Our dedicated support team is here to help.
        </p>
        <div className="p-6 rounded-3xl bg-subpage-surface-container-low border border-subpage-outline-variant/30 flex flex-col gap-3">
          <div>
            <span className="text-xs font-bold text-subpage-primary uppercase">Support Email</span>
            <p className="text-sm font-semibold text-landing-vibrant-coral">support@iconsuniverse.com</p>
          </div>
          <div>
            <span className="text-xs font-bold text-subpage-primary uppercase">Response Time</span>
            <p className="text-xs">We typically respond within 24 hours on business days.</p>
          </div>
        </div>
      </div>
    ),
  },
  '/whats-new': {
    title: "What's New in IconsUniverse",
    badge: 'Changelog',
    icon: Sparkles,
    content: (
      <div className="flex flex-col gap-6 text-sm text-subpage-on-surface-variant leading-relaxed">
        <div className="border-l-2 border-landing-electric-teal pl-4">
          <span className="text-xs font-bold text-landing-primary uppercase">Version 2.4 — Live Release</span>
          <h3 className="font-heading font-bold text-subpage-primary text-base mt-1">1,000,000 Icons & Interactive Category Styler</h3>
          <p className="text-xs mt-1">
            Added dynamic style preview modal for all 163 categories with live 5-icon preview, bold/outline streaming prioritization, and high-performance compound indexing.
          </p>
        </div>
        <div className="border-l-2 border-subpage-outline-variant/40 pl-4">
          <span className="text-xs font-bold text-subpage-primary uppercase">Version 2.3</span>
          <h3 className="font-heading font-bold text-subpage-primary text-base mt-1">Optimized MongoDB Vector Store</h3>
          <p className="text-xs mt-1">
            Optimized logical database payloads, reducing storage footprint while cleaning titles across all 1,000,000 icon records.
          </p>
        </div>
      </div>
    ),
  },
  '/terms': {
    title: 'Terms and Conditions',
    badge: 'Legal',
    icon: FileText,
    content: (
      <div className="flex flex-col gap-4 text-xs text-subpage-on-surface-variant leading-relaxed">
        <p>Last updated: August 2026</p>
        <p>
          By accessing or using IconsUniverse, you agree to be bound by these Terms and Conditions and all applicable laws and regulations.
        </p>
        <h4 className="font-bold text-subpage-primary text-sm mt-2">1. Free Tier Usage</h4>
        <p>
          Free tier accounts are granted access to download icons with appropriate attribution link back to IconsUniverse.com.
        </p>
        <h4 className="font-bold text-subpage-primary text-sm mt-2">2. Pro Subscription</h4>
        <p>
          Pro subscribers receive attribution-free commercial rights for digital and print media, subject to active subscription status.
        </p>
      </div>
    ),
  },
  '/privacy': {
    title: 'Privacy Policy',
    badge: 'Privacy',
    icon: Shield,
    content: (
      <div className="flex flex-col gap-4 text-xs text-subpage-on-surface-variant leading-relaxed">
        <p>Last updated: August 2026</p>
        <p>
          Your privacy is important to us. IconsUniverse collects minimal account information (such as email and display name) solely for authentication, subscription fulfillment, and personal collection management.
        </p>
        <p>
          We do not sell, rent, or trade your personal data to third parties.
        </p>
      </div>
    ),
  },
  '/sitemap': {
    title: 'Sitemap',
    badge: 'Navigation',
    icon: Map,
    content: (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-subpage-surface-container-low border border-subpage-outline-variant/30 flex flex-col gap-2">
          <h4 className="font-bold text-subpage-primary text-sm">Main Sections</h4>
          <Link to="/" className="hover:text-landing-vibrant-coral">Home Page</Link>
          <Link to="/search" className="hover:text-landing-vibrant-coral">Browse 1,000,000 Icons</Link>
          <Link to="/search?type=packs" className="hover:text-landing-vibrant-coral">Curated Icon Packs</Link>
          <Link to="/pricing" className="hover:text-landing-vibrant-coral">Pro Pricing & Licensing</Link>
        </div>
        <div className="p-4 rounded-2xl bg-subpage-surface-container-low border border-subpage-outline-variant/30 flex flex-col gap-2">
          <h4 className="font-bold text-subpage-primary text-sm">Company & Legal</h4>
          <Link to="/about" className="hover:text-landing-vibrant-coral">About Us</Link>
          <Link to="/contact" className="hover:text-landing-vibrant-coral">Contact Support</Link>
          <Link to="/whats-new" className="hover:text-landing-vibrant-coral">What's New</Link>
          <Link to="/terms" className="hover:text-landing-vibrant-coral">Terms & Conditions</Link>
          <Link to="/privacy" className="hover:text-landing-vibrant-coral">Privacy Policy</Link>
        </div>
      </div>
    ),
  },
  '/docs': {
    title: 'IconsUniverse Developer API',
    badge: 'Documentation',
    icon: Code,
    content: (
      <div className="flex flex-col gap-4 text-xs text-subpage-on-surface-variant leading-relaxed">
        <p>
          Integrate IconsUniverse vector search and icon streaming directly into your applications.
        </p>
        <div className="p-4 rounded-2xl bg-[#001e52] text-landing-electric-teal font-mono text-[11px] overflow-x-auto">
          <code>
            GET https://iconsuniverse.com/api/icons?category=health-medical&style=filled&limit=30
          </code>
        </div>
        <p>
          Returns JSON formatted results with verified direct SVG vector URLs and metadata.
        </p>
      </div>
    ),
  },
};

const InfoPage = () => {
  const { pathname } = useLocation();
  const info = pageData[pathname] || pageData['/about'];
  const PageIcon = info.icon;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-subpage-on-surface-variant hover:text-subpage-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-energy-gradient text-white flex items-center justify-center shadow-sm">
            <PageIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-landing-vibrant-coral">
              {info.badge}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-subpage-primary">
              {info.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 rounded-4xl bg-white border border-subpage-surface-container shadow-xs">
        {info.content}
      </div>
    </div>
  );
};

export default InfoPage;
