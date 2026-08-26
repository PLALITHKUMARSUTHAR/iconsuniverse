import React, { useState } from 'react';
import {
  main17FeaturedCategories,
  all163CategoriesWithIcons,
} from '../../data/categories';
import { CategoryIconMap } from '../../data/categoryIcons';
import { ArrowRight, Grid3X3, Search, X, Layers, Folder } from 'lucide-react';
import CategoryStyleModal from './CategoryStyleModal';

const CategoryGrid = () => {
  const [isAllCategoriesOpen, setIsAllCategoriesOpen] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [activeCategoryModal, setActiveCategoryModal] = useState(null);

  const filtered163 = all163CategoriesWithIcons.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearchQuery.toLowerCase())
  );

  const handleCategoryClick = (cat) => {
    setActiveCategoryModal(cat);
  };

  return (
    <section className="w-full py-12 sm:py-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-landing-primary tracking-tight">
              Featured Categories
            </h2>
            <p className="text-xs text-landing-on-surface-variant mt-0.5">
              Explore curated categories or click Full List to view all 163 categories
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAllCategoriesOpen(true)}
            className="text-xs font-bold text-landing-primary hover:text-landing-vibrant-coral flex items-center gap-1 group transition-colors"
          >
            <span>View full list</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* 17 Main Categories + 1 "Full List" Box = 18 Clean Symmetric Boxes (6 cols x 3 rows) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-3.5">
          {main17FeaturedCategories.map((cat) => {
            const IconComp = CategoryIconMap[cat.iconName] || Layers;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                className="group p-3.5 sm:p-4 rounded-2xl bg-white hover:bg-white border border-landing-surface-container hover:border-landing-primary/30 shadow-2xs hover:shadow-xs transition-all duration-150 flex flex-col items-center text-center justify-center gap-2 cursor-pointer"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                >
                  <IconComp className="w-5 h-5" />
                </div>

                <h3 className="text-xs font-bold font-heading text-landing-on-surface group-hover:text-landing-primary transition-colors truncate w-full">
                  {cat.name}
                </h3>
              </button>
            );
          })}

          {/* 18th Box: Titled "Full List" */}
          <button
            type="button"
            onClick={() => setIsAllCategoriesOpen(true)}
            className="group p-3.5 sm:p-4 rounded-2xl bg-energy-gradient text-white border border-transparent shadow-xs hover:shadow-md transition-all duration-150 flex flex-col items-center text-center justify-center gap-2 transform hover:-translate-y-0.5 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center transition-transform group-hover:scale-110">
              <Grid3X3 className="w-5 h-5 text-white" />
            </div>

            <h3 className="text-xs font-extrabold font-heading text-white tracking-wide">
              Full List
            </h3>
          </button>
        </div>
      </div>

      {/* Fullscreen All 163 Categories Modal (10 categories per row format with respective icons) */}
      {isAllCategoriesOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col animate-fade-in overflow-hidden">
          {/* Top Fullscreen Header with Search and Close */}
          <div className="px-6 py-4 border-b border-landing-surface-container bg-white flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 shadow-xs">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-9 h-9 rounded-xl bg-energy-gradient p-0.5 flex items-center justify-center shadow-xs">
                <div className="w-full h-full bg-[#001e52] rounded-[10px] flex items-center justify-center text-white">
                  <Grid3X3 className="w-4 h-4 text-landing-electric-teal" />
                </div>
              </div>
              <div>
                <h2 className="font-heading font-extrabold text-base sm:text-lg text-landing-primary">
                  All 163 Categories — Full List
                </h2>
                <p className="text-xs text-landing-on-surface-variant">
                  Browse or search across all categories
                </p>
              </div>
            </div>

            {/* Quick Search Filter & Close */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-80">
                <Search className="w-4 h-4 text-landing-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  placeholder="Search 163 categories..."
                  className="w-full pl-10 pr-8 py-2 rounded-2xl bg-landing-surface-container-low border border-landing-outline-variant/30 text-xs font-medium text-landing-on-surface focus:outline-none focus:ring-2 focus:ring-landing-primary"
                />
                {categorySearchQuery && (
                  <button
                    type="button"
                    onClick={() => setCategorySearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-landing-on-surface-variant hover:text-landing-primary"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsAllCategoriesOpen(false)}
                className="p-2 rounded-xl text-landing-on-surface-variant hover:text-landing-primary hover:bg-landing-surface-container-low transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Fullscreen Grid (10 categories in a row on standard screens) */}
          <div className="flex-1 bg-[radial-gradient(#e2e2e9_1px,transparent_1px)] [background-size:16px_16px] bg-[#faf8ff] p-6 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
              {filtered163.map((cat) => {
                const IconComp = CategoryIconMap[cat.iconName] || Folder;
                return (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => {
                      setIsAllCategoriesOpen(false);
                      handleCategoryClick(cat);
                    }}
                    className="group p-3 rounded-2xl bg-white hover:bg-white border border-landing-surface-container/80 hover:border-landing-primary/30 shadow-2xs hover:shadow-xs transition-all duration-150 flex flex-col items-center text-center justify-center gap-2 cursor-pointer"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${cat.color || '#00327d'}15`, color: cat.color || '#00327d' }}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>

                    <h3 className="text-[11px] font-bold font-heading text-landing-on-surface group-hover:text-landing-primary transition-colors truncate w-full">
                      {cat.name}
                    </h3>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Category Style Picker Modal with Live 5-Icon Preview */}
      {activeCategoryModal && (
        <CategoryStyleModal
          isOpen={!!activeCategoryModal}
          onClose={() => setActiveCategoryModal(null)}
          category={activeCategoryModal}
        />
      )}
    </section>
  );
};

export default CategoryGrid;
