import React, { useState } from 'react';
import {
  main29FeaturedCategories,
  all163CategoriesWithIcons,
} from '../../data/categories';
import { CategoryIconMap } from '../../data/categoryIcons';
import { ArrowRight, Grid3X3, Layers } from 'lucide-react';
import CategoryStyleModal, { prefetchCategoryPreviews } from './CategoryStyleModal';
import AllCategoriesModal from '../common/AllCategoriesModal';

const CategoryGrid = () => {
  const [isAllCategoriesOpen, setIsAllCategoriesOpen] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [activeCategoryModal, setActiveCategoryModal] = useState(null);

  // Background warm featured categories during idle time for 0ms instant preview modal
  React.useEffect(() => {
    const timer = setTimeout(() => {
      main29FeaturedCategories.forEach((cat, index) => {
        setTimeout(() => {
          prefetchCategoryPreviews(cat.slug, 'filled');
        }, index * 60);
      });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const filtered163 = all163CategoriesWithIcons.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearchQuery.toLowerCase())
  );

  const handleCategoryClick = (cat) => {
    setActiveCategoryModal(cat);
  };

  return (
    <section className="w-full py-4 sm:py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-3 sm:mb-3.5">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold font-heading text-landing-primary tracking-tight">
              Categories
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setIsAllCategoriesOpen(true)}
            className="text-xs font-bold text-landing-primary hover:text-landing-vibrant-coral flex items-center gap-1 group transition-colors cursor-pointer"
          >
            <span>View full list</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Exactly 3 Rows of 10 Categories (29 Featured + 1 "Full List" = 30 Compact Square Boxes) */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
          {main29FeaturedCategories.map((cat) => {
            const IconComp = CategoryIconMap[cat.iconName] || Layers;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                onMouseEnter={() => prefetchCategoryPreviews(cat.slug, 'filled')}
                onPointerDown={() => prefetchCategoryPreviews(cat.slug, 'filled')}
                className="group aspect-square p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white hover:bg-white border border-landing-surface-container hover:border-landing-primary/40 shadow-2xs hover:shadow-xs transition-all duration-150 flex flex-col items-center text-center justify-center gap-1 cursor-pointer"
              >
                <div
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 shrink-0"
                  style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                >
                  <IconComp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>

                <h3 className="text-[10px] sm:text-[11px] font-bold font-heading text-landing-on-surface group-hover:text-landing-primary transition-colors truncate w-full px-0.5 leading-tight">
                  {cat.name}
                </h3>
              </button>
            );
          })}

          {/* 30th Box: Titled "Full List" */}
          <button
            type="button"
            onClick={() => setIsAllCategoriesOpen(true)}
            className="group aspect-square p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-energy-gradient text-white border border-transparent shadow-2xs hover:shadow-xs transition-all duration-150 flex flex-col items-center text-center justify-center gap-1 transform hover:-translate-y-0.5 cursor-pointer"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/20 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
              <Grid3X3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>

            <h3 className="text-[10px] sm:text-[11px] font-extrabold font-heading text-white tracking-tight truncate w-full px-0.5 leading-tight">
              Full List
            </h3>
          </button>
        </div>
      </div>

      {/* Fullscreen All 163 Categories Modal */}
      <AllCategoriesModal
        isOpen={isAllCategoriesOpen}
        onClose={() => setIsAllCategoriesOpen(false)}
        onSelectCategory={(cat) => handleCategoryClick(cat)}
      />

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
