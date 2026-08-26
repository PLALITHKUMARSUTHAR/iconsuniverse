import React, { useState } from 'react';
import { all163CategoriesWithIcons } from '../../data/categories';
import { CategoryIconMap } from '../../data/categoryIcons';
import { Grid3X3, Search, X, Folder } from 'lucide-react';

const AllCategoriesModal = ({ isOpen, onClose, onSelectCategory, excludeSlug = '' }) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredCategories = all163CategoriesWithIcons.filter(
    (cat) =>
      cat.slug !== excludeSlug &&
      cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 163 categories..."
              className="w-full pl-10 pr-8 py-2 rounded-2xl bg-landing-surface-container-low border border-landing-outline-variant/30 text-xs font-medium text-landing-on-surface focus:outline-none focus:ring-2 focus:ring-landing-primary"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-landing-on-surface-variant hover:text-landing-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-landing-on-surface-variant hover:text-landing-primary hover:bg-landing-surface-container-low transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Fullscreen Grid (10 categories in a row on standard screens) */}
      <div className="flex-1 bg-[radial-gradient(#e2e2e9_1px,transparent_1px)] [background-size:16px_16px] bg-[#faf8ff] p-6 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
          {filteredCategories.map((cat) => {
            const IconComp = CategoryIconMap[cat.iconName] || Folder;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => {
                  onClose();
                  onSelectCategory(cat);
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
  );
};

export default AllCategoriesModal;
