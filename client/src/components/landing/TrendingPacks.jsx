import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
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
} from 'lucide-react';
import { packService } from '../../services/packService';

const curatedRealPacks = [
  {
    slug: 'ecommerce-retail-set',
    title: 'E-Commerce & Retail Vectors',
    description: 'Shopping carts, barcode tags, credit cards, and express delivery tracking.',
    categoryName: 'Shopping',
    categorySlug: 'shopping',
    gradient: 'from-rose-500/25 via-orange-500/15 to-amber-500/10',
    cardBg: 'bg-gradient-to-b from-rose-50/60 via-white to-orange-50/20',
    borderColor: 'border-rose-200/80 hover:border-rose-400/80',
    tagBg: 'bg-rose-100/90 text-rose-800 border-rose-200/80',
    btnHover: 'group-hover:bg-rose-600 group-hover:text-white',
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
    description: 'Cloud infrastructure, servers, terminals, microprocessors, and databases.',
    categoryName: 'Code & Dev',
    categorySlug: 'code',
    gradient: 'from-emerald-500/25 via-teal-500/15 to-cyan-500/10',
    cardBg: 'bg-gradient-to-b from-teal-50/60 via-white to-cyan-50/20',
    borderColor: 'border-teal-200/80 hover:border-teal-400/80',
    tagBg: 'bg-teal-100/90 text-teal-800 border-teal-200/80',
    btnHover: 'group-hover:bg-teal-600 group-hover:text-white',
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
    description: 'Digital wallets, coins, market growth charts, vaults, and bank security.',
    categoryName: 'Business',
    categorySlug: 'business',
    gradient: 'from-amber-500/25 via-yellow-500/15 to-emerald-500/10',
    cardBg: 'bg-gradient-to-b from-amber-50/60 via-white to-yellow-50/20',
    borderColor: 'border-amber-200/80 hover:border-amber-400/80',
    tagBg: 'bg-amber-100/90 text-amber-800 border-amber-200/80',
    btnHover: 'group-hover:bg-amber-600 group-hover:text-white',
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
    description: 'Chat bubbles, paper planes, profiles, notifications, and engagement badges.',
    categoryName: 'Social',
    categorySlug: 'social',
    gradient: 'from-indigo-500/25 via-purple-500/15 to-pink-500/10',
    cardBg: 'bg-gradient-to-b from-indigo-50/60 via-white to-purple-50/20',
    borderColor: 'border-indigo-200/80 hover:border-indigo-400/80',
    tagBg: 'bg-indigo-100/90 text-indigo-800 border-indigo-200/80',
    btnHover: 'group-hover:bg-indigo-600 group-hover:text-white',
    accentColor: '#6366f1',
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
    categoryName: 'Media',
    categorySlug: 'media',
    gradient: 'from-purple-500/25 via-fuchsia-500/15 to-rose-500/10',
    cardBg: 'bg-gradient-to-b from-purple-50/60 via-white to-pink-50/20',
    borderColor: 'border-purple-200/80 hover:border-purple-400/80',
    tagBg: 'bg-purple-100/90 text-purple-800 border-purple-200/80',
    btnHover: 'group-hover:bg-purple-600 group-hover:text-white',
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
    description: 'Map pins, flight vectors, compasses, world globes, and trip routes.',
    categoryName: 'Transport',
    categorySlug: 'transport',
    gradient: 'from-sky-500/25 via-cyan-500/15 to-indigo-500/10',
    cardBg: 'bg-gradient-to-b from-sky-50/60 via-white to-blue-50/20',
    borderColor: 'border-sky-200/80 hover:border-sky-400/80',
    tagBg: 'bg-sky-100/90 text-sky-800 border-sky-200/80',
    btnHover: 'group-hover:bg-sky-600 group-hover:text-white',
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
  const [page, setPage] = useState(0);
  const pageSize = 3;

  useEffect(() => {
    const loadPacks = async () => {
      try {
        const res = await packService.getPacks({ limit: 9 });
        if (res.data && res.data.packs && res.data.packs.length > 0) {
          const merged = res.data.packs.map((p, idx) => ({
            ...p,
            gradient: curatedRealPacks[idx % curatedRealPacks.length].gradient,
            accentColor: curatedRealPacks[idx % curatedRealPacks.length].accentColor,
            icons: curatedRealPacks[idx % curatedRealPacks.length].icons,
            categorySlug: p.categorySlug || curatedRealPacks[idx % curatedRealPacks.length].categorySlug,
          }));
          setPacks(merged);
        }
      } catch (e) {
        // Fallback to curated packs
      }
    };

    loadPacks();
  }, []);

  const totalPages = Math.max(1, Math.ceil(packs.length / pageSize));
  const currentPacks = packs.slice(page * pageSize, page * pageSize + pageSize);

  const handlePrev = () => {
    setPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  return (
    <section className="w-full py-8 sm:py-10 bg-landing-surface-container-low/30">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-landing-primary tracking-tight">
              Featured Icon Sets
            </h2>
          </div>

          {/* Right Controls: Browse Link */}
          <div className="flex items-center gap-3 self-end sm:self-center">
            <Link
              to="/search?type=packs"
              className="text-xs font-bold text-landing-primary hover:text-landing-vibrant-coral flex items-center gap-1 group shrink-0"
            >
              <span>Explore all sets</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Row of 3 Sets with Left & Right Arrows on the sides */}
        <div className="relative flex items-center gap-2 sm:gap-3">
          {/* Left Arrow on the left of the row */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous sets"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-landing-surface-container shadow-sm hover:bg-[#001e52] hover:text-white flex items-center justify-center transition-all shrink-0 z-10 cursor-pointer group"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-landing-primary group-hover:text-white transition-colors" />
          </button>

          {/* Single Row of 3 Sets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 flex-1 w-full min-w-0">
            {currentPacks.map((pack) => (
              <Link
                key={pack.slug}
                to={`/search?category=${pack.categorySlug || 'all'}`}
                className={`group rounded-3xl ${pack.cardBg || 'bg-white'} border ${pack.borderColor || 'border-landing-surface-container'} shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer transform hover:-translate-y-1`}
              >
                {/* Prominent Icon Showcase Tab */}
                <div
                  className={`relative w-full bg-gradient-to-br ${pack.gradient} border-b border-landing-surface-container/60 p-4 sm:p-5 flex flex-col justify-between overflow-hidden`}
                >
                  {/* Category Tag Only (Vector Icons text removed) */}
                  <div className="flex items-center justify-between z-10 mb-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold shadow-2xs border uppercase tracking-wider ${pack.tagBg || 'bg-white/95 text-landing-primary border-white/80'}`}>
                      {pack.categoryName || 'Vector Set'}
                    </span>
                  </div>

                  {/* 5 Prominent Icons evenly filling the width */}
                  <div className="grid grid-cols-5 gap-2 sm:gap-2.5 z-10 w-full">
                    {(pack.icons || curatedRealPacks[0].icons).map((ic, i) => {
                      const Comp = ic.comp;
                      return (
                        <div
                          key={ic.label || i}
                          className="aspect-square rounded-2xl bg-white/95 backdrop-blur-md border border-white/90 shadow-2xs flex flex-col items-center justify-center p-1.5 group-hover:scale-105 transition-all duration-200"
                          title={ic.label}
                        >
                          <Comp
                            className="w-6 h-6 sm:w-7 sm:h-7 group-hover:scale-110 transition-transform"
                            style={{ color: pack.accentColor || '#001e52', strokeWidth: 1.85 }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Subtle Decorative Backdrop Element */}
                  <div
                    className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-xl opacity-30 pointer-events-none"
                    style={{ backgroundColor: pack.accentColor }}
                  />
                </div>

                {/* Content Body: Title, and Description with Browse Set button on the right */}
                <div className="p-5 flex flex-col gap-2.5 flex-1 justify-between">
                  <h3 className="text-base sm:text-lg font-bold font-heading text-landing-primary group-hover:text-landing-vibrant-coral transition-colors line-clamp-1">
                    {pack.title}
                  </h3>

                  <div className="flex items-center justify-between gap-3 pt-0.5">
                    <p className="text-xs text-landing-on-surface-variant line-clamp-2 leading-relaxed flex-1 font-medium">
                      {pack.description}
                    </p>

                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold text-landing-primary bg-white/90 border border-landing-surface-container ${pack.btnHover || 'group-hover:bg-[#001e52] group-hover:text-white'} px-3.5 py-2 rounded-xl shrink-0 transition-all duration-200 shadow-2xs`}>
                      <span>Browse Set</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Right Arrow on the right of the row */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next sets"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-landing-surface-container shadow-sm hover:bg-[#001e52] hover:text-white flex items-center justify-center transition-all shrink-0 z-10 cursor-pointer group"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-landing-primary group-hover:text-white transition-colors" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TrendingPacks;
