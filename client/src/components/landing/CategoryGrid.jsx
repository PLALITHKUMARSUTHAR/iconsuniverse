import React, { useState } from 'react';
import {
  main17FeaturedCategories,
  all163CategoriesWithIcons,
} from '../../data/categories';
import { CategoryIconMap } from '../../data/categoryIcons';
import { ArrowRight, Grid3X3, Layers } from 'lucide-react';
import CategoryStyleModal from './CategoryStyleModal';
import AllCategoriesModal from '../common/AllCategoriesModal';

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
