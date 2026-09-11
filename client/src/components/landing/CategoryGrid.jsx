import React, { useState } from 'react';
import {
  main17FeaturedCategories,
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
      main17FeaturedCategories.forEach((cat, index) => {
        setTimeout(() => {
          prefetchCategoryPreviews(cat.slug, 'filled');
        }, index * 80);
      });
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const filtered163 = all163CategoriesWithIcons.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearchQuery.toLowerCase())
  );

  const handleCategoryClick = (cat) => {
    setActiveCategoryModal(cat);
  };

  return (
    <section className="w-full py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-3.5 sm:mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold font-heading text-landing-primary tracking-tight">
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

        {/* 17 Main Categories + 1 "Full List" Box = 18 Compact Square Boxes in Exactly 3 Rows (6 cols x 3 rows) */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3">
          {main17FeaturedCategories.map((cat) => {
            const IconComp = CategoryIconMap[cat.iconName] || Layers;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                onMouseEnter={() => prefetchCategoryPreviews(cat.slug, 'filled')}
                onPointerDown={() => prefetchCategoryPreviews(cat.slug, 'filled')}
                className="group aspect-square p-2 sm:p-2.5 rounded-xl bg-white hover:bg-white border border-landing-surface-container hover:border-landing-primary/40 shadow-2xs hover:shadow-xs transition-all duration-150 flex flex-col items-center text-center justify-center gap-1.5 cursor-pointer"
              >
                <div
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 shrink-0"
                  style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                >
                  <IconComp className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </div>

                <h3 className="text-[11px] sm:text-xs font-bold font-heading text-landing-on-surface group-hover:text-landing-primary transition-colors truncate w-full px-1">
                  {cat.name}
                </h3>
              </button>
            );
          })}

          {/* 18th Box: Titled "Full List" */}
          <button
            type="button"
            onClick={() => setIsAllCategoriesOpen(true)}
            className="group aspect-square p-2 sm:p-2.5 rounded-xl bg-energy-gradient text-white border border-transparent shadow-2xs hover:shadow-xs transition-all duration-150 flex flex-col items-center text-center justify-center gap-1.5 transform hover:-translate-y-0.5 cursor-pointer"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/20 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
              <Grid3X3 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
            </div>

            <h3 className="text-[11px] sm:text-xs font-extrabold font-heading text-white tracking-tight truncate w-full px-1">
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
