import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShoppingBag,
  CreditCard,
  Tag,
  ShoppingCart,
  Truck,
  Cloud,
  Server,
  Terminal,
  Database,
  Cpu,
  Wallet,
  TrendingUp,
  Coins,
  ShieldCheck,
  Landmark,
  MessageCircle,
  Send,
  Heart,
  User,
  Bell,
  Palette,
  Camera,
  Film,
  Sliders,
  PenTool,
  MapPin,
  Compass,
  Plane,
  Globe,
  Navigation,
  Layers,
} from 'lucide-react';
import { packService } from '../../services/packService';

const curatedRealPacks = [
  {
    slug: 'ecommerce-retail-set',
    title: 'E-Commerce & Retail Vectors',
    description: 'Shopping carts, bags, barcode tags, credit cards, and delivery tracking vectors.',
    iconCount: 48,
    categoryName: 'Shopping',
    categorySlug: 'shopping-ecommerce',
    gradient: 'from-rose-500/10 via-amber-500/5 to-transparent',
    accentColor: '#FF5F52',
    icons: [
      { comp: ShoppingCart, label: 'Cart' },
      { comp: ShoppingBag, label: 'Bag' },
      { comp: Tag, label: 'Tag' },
      { comp: CreditCard, label: 'Card' },
      { comp: Truck, label: 'Delivery' },
    ],
  },
  {
    slug: 'cloud-developer-stack',
    title: 'Cloud & Developer Stack',
    description: 'Cloud infrastructure, servers, terminals, microprocessors, and database vectors.',
    iconCount: 64,
    categoryName: 'Technology',
    categorySlug: 'technology-devices',
    gradient: 'from-teal-500/10 via-indigo-500/5 to-transparent',
    accentColor: '#00F5D4',
    icons: [
      { comp: Cloud, label: 'Cloud' },
      { comp: Server, label: 'Server' },
      { comp: Terminal, label: 'Code' },
      { comp: Database, label: 'Data' },
      { comp: Cpu, label: 'CPU' },
    ],
  },
  {
    slug: 'fintech-banking-crypto',
    title: 'Fintech, Banking & Currency',
    description: 'Digital wallets, coins, market growth charts, vaults, and financial security badges.',
    iconCount: 52,
    categoryName: 'Finance',
    categorySlug: 'finance-banking',
    gradient: 'from-amber-500/10 via-emerald-500/5 to-transparent',
    accentColor: '#FFD54F',
    icons: [
      { comp: Wallet, label: 'Wallet' },
      { comp: TrendingUp, label: 'Growth' },
      { comp: Coins, label: 'Coins' },
      { comp: Landmark, label: 'Bank' },
      { comp: ShieldCheck, label: 'Vault' },
    ],
  },
  {
    slug: 'social-communication-set',
    title: 'Social & Communication UI',
    description: 'Chat bubbles, paper planes, profiles, notifications, and engagement reactions.',
    iconCount: 40,
    categoryName: 'Social',
    categorySlug: 'social-communication',
    gradient: 'from-pink-500/10 via-rose-500/5 to-transparent',
    accentColor: '#ec4899',
    icons: [
      { comp: MessageCircle, label: 'Chat' },
      { comp: Send, label: 'Send' },
      { comp: Heart, label: 'Like' },
      { comp: User, label: 'User' },
      { comp: Bell, label: 'Alert' },
    ],
  },
  {
    slug: 'creative-media-studio',
    title: 'Creative Media & UI Essentials',
    description: 'Cameras, film reels, sliders, digital palettes, and vector design pens.',
    iconCount: 72,
    categoryName: 'Media',
    categorySlug: 'media',
    gradient: 'from-purple-500/10 via-pink-500/5 to-transparent',
    accentColor: '#8b5cf6',
    icons: [
      { comp: Palette, label: 'Color' },
      { comp: Camera, label: 'Photo' },
      { comp: Film, label: 'Video' },
      { comp: Sliders, label: 'Tune' },
      { comp: PenTool, label: 'Vector' },
    ],
  },
  {
    slug: 'navigation-travel-vectors',
    title: 'Global Navigation & Travel',
    description: 'Map pins, flight vectors, compasses, world globes, and trip navigation icons.',
    iconCount: 36,
    categoryName: 'Travel',
    categorySlug: 'transport',
    gradient: 'from-sky-500/10 via-blue-500/5 to-transparent',
    accentColor: '#0ea5e9',
    icons: [
      { comp: MapPin, label: 'Pin' },
      { comp: Compass, label: 'Compass' },
      { comp: Plane, label: 'Flight' },
      { comp: Globe, label: 'Globe' },
      { comp: Navigation, label: 'Route' },
    ],
  },
];

const TrendingPacks = () => {
  const [packs, setPacks] = useState(curatedRealPacks);

  useEffect(() => {
    const loadPacks = async () => {
      try {
        const res = await packService.getPacks({ limit: 6 });
        if (res.data && res.data.packs && res.data.packs.length > 0) {
          // Merge API packs with rich icons fallback
          const merged = res.data.packs.map((p, idx) => ({
            ...p,
            gradient: curatedRealPacks[idx % curatedRealPacks.length].gradient,
            accentColor: curatedRealPacks[idx % curatedRealPacks.length].accentColor,
            icons: curatedRealPacks[idx % curatedRealPacks.length].icons,
          }));
          setPacks(merged);
        }
      } catch (e) {
        // Fallback to curated packs
      }
    };

    loadPacks();
  }, []);

  return (
    <section className="w-full py-12 sm:py-16 bg-landing-surface-container-low/40">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-subpage-primary text-white text-[11px] font-bold uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5 text-landing-vibrant-coral" />
              <span>Cohesive Vector Families</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-landing-primary tracking-tight">
              Featured Icon Sets
            </h2>
            <p className="text-xs text-landing-on-surface-variant mt-0.5">
              Carefully curated sets with unified stroke weights, corner radii, and visual harmony.
            </p>
          </div>

          <Link
            to="/search?type=packs"
            className="text-xs font-bold text-landing-primary hover:text-landing-vibrant-coral flex items-center gap-1 group shrink-0"
          >
            <span>Explore all sets</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Real Icon Sets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packs.map((pack) => (
            <Link
              key={pack.slug}
              to={`/search?category=${pack.categorySlug || 'all'}`}
              className="group rounded-3xl glass-landing bg-white border border-landing-surface-container shadow-xs hover:shadow-xl hover:border-landing-primary/20 transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              {/* Top Vector Cluster Showcase Tab */}
              <div
                className={`relative h-44 w-full bg-gradient-to-br ${pack.gradient} border-b border-landing-surface-container p-4 flex flex-col justify-between overflow-hidden`}
              >
                {/* Header Pills: Category & Count (Free/Pro tags removed) */}
                <div className="flex items-center justify-between z-10">
                  <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-extrabold text-landing-primary shadow-2xs border border-white/80 uppercase tracking-wider">
                    {pack.categoryName || 'Vector Set'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#001e52] text-white text-[10px] font-bold shadow-2xs">
                    {pack.iconCount || 48} Icons
                  </span>
                </div>

                {/* Real Vector Icon Array Cluster */}
                <div className="flex items-center justify-center gap-3 py-2 z-10">
                  {(pack.icons || curatedRealPacks[0].icons).map((ic, i) => {
                    const Comp = ic.comp;
                    return (
                      <div
                        key={ic.label || i}
                        className="w-12 h-12 rounded-2xl bg-white/90 backdrop-blur-md border border-white/90 shadow-sm flex flex-col items-center justify-center transform group-hover:-translate-y-1 transition-transform duration-200"
                        style={{ transitionDelay: `${i * 35}ms` }}
                        title={ic.label}
                      >
                        <Comp
                          className="w-5 h-5 text-[#001e52] group-hover:scale-110 transition-transform"
                          style={{ strokeWidth: 2 }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Subtle Decorative Backdrop Elements */}
                <div
                  className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-30 pointer-events-none"
                  style={{ backgroundColor: pack.accentColor }}
                />
              </div>

              {/* Content Body */}
              <div className="p-5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold font-heading text-landing-primary group-hover:text-landing-vibrant-coral transition-colors">
                    {pack.title}
                  </h3>
                </div>

                <p className="text-xs text-landing-on-surface-variant line-clamp-2 leading-relaxed">
                  {pack.description}
                </p>

                <div className="pt-3 mt-1 border-t border-landing-surface-container flex items-center justify-between text-xs font-bold text-landing-primary">
                  <span className="text-[11px] text-landing-on-surface-variant font-medium">
                    Vector SVG & High-Res PNG
                  </span>
                  <span className="flex items-center gap-1 group-hover:translate-x-0.5 group-hover:text-landing-vibrant-coral transition-all">
                    Browse Set <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingPacks;
