import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Crown, ArrowRight } from 'lucide-react';
import { seedPacks } from '../../data/seedData';

const TrendingPacks = () => {
  return (
    <section className="w-full py-12 sm:py-16 bg-landing-surface-container-low/50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-landing-primary tracking-tight">
              Featured Icon Sets
            </h2>
          </div>
          <Link
            to="/search?type=packs"
            className="text-xs font-bold text-landing-primary hover:text-landing-vibrant-coral flex items-center gap-1 group"
          >
            <span>Explore all sets</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Clean Packs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {seedPacks.map((pack) => (
            <Link
              key={pack.slug}
              to={`/packs/${pack.slug}`}
              className="group rounded-3xl glass-landing bg-white border border-landing-surface-container shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
            >
              {/* Cover Thumbnail Image */}
              <div className="relative h-40 w-full overflow-hidden bg-landing-primary">
                <img
                  src={pack.coverImageUrl}
                  alt={pack.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001e52]/90 via-transparent to-transparent" />

                {/* Badge */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  {pack.isPremium ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-energy-gradient text-white text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                      <Crown className="w-3 h-3" />
                      <span>PRO</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold">
                      FREE
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 left-3 text-white">
                  <h3 className="text-base font-bold font-heading text-white">
                    {pack.title}
                  </h3>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-4 flex items-center justify-between">
                <p className="text-xs text-landing-on-surface-variant line-clamp-1">
                  {pack.description}
                </p>

                <span className="text-xs font-bold text-landing-primary group-hover:text-landing-vibrant-coral shrink-0 ml-2 flex items-center gap-1">
                  View <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingPacks;
