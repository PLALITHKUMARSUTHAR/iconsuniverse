import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryIconMap } from '../../data/categoryIcons';
import { X, Search, Check, Layers, CircleDot, Palette, Grid3X3, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { getAptPreloadedIcons } from '../../data/categoryPreloadData';

const styleOptions = [
  { id: 'filled', label: 'Fill / Bold', icon: CircleDot, desc: 'Solid filled glyphs' },
  { id: 'outline', label: 'Outline', icon: Layers, desc: 'Clean stroke line icons' },
  { id: 'color', label: 'Color / Flat', icon: Palette, desc: 'Multi-color vibrant assets' },
  { id: 'all', label: 'All Styles', icon: Grid3X3, desc: 'Complete category collection' },
];

/**
 * Retained for backwards compatibility across callers (CategoryGrid, AllCategoriesModal, SearchResultsPage)
 */
export const prefetchCategoryPreviews = () => {};

const CategoryStyleModal = ({ isOpen, onClose, category }) => {
  const navigate = useNavigate();
  const [selectedStyle, setSelectedStyle] = useState('filled');

  if (!isOpen || !category) return null;

  const IconComp = CategoryIconMap[category.iconName] || Layers;
  const preloadedList = getAptPreloadedIcons(category.slug || category.name);

  const handleSearch = () => {
    navigate(`/search?category=${category.slug}&style=${selectedStyle}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-lg rounded-3xl bg-white border border-landing-surface-container shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-landing-surface-container flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs"
              style={{ backgroundColor: `${category.color || '#00327d'}18`, color: category.color || '#00327d' }}
            >
              <IconComp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold font-heading text-landing-primary">
                {category.name} Icons
              </h2>
              <p className="text-xs text-landing-on-surface-variant font-medium">
                Choose the icon style you want to explore
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-landing-on-surface-variant hover:text-landing-primary hover:bg-landing-surface-container transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 flex flex-col gap-5">
          {/* Style Selection Cards / Chips */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-landing-primary tracking-wide flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-landing-primary" />
              <span>Select Icon Style</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {styleOptions.map((opt) => {
                const OptIcon = opt.icon;
                const isSelected = selectedStyle === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedStyle(opt.id)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer relative ${
                      isSelected
                        ? 'bg-landing-primary text-white border-landing-primary shadow-sm scale-102'
                        : 'bg-landing-surface-container-low hover:bg-landing-surface-container border-landing-surface-container text-landing-on-surface'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-white">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                    <OptIcon className={`w-4 h-4 ${isSelected ? 'text-landing-sunny-yellow' : 'text-landing-primary'}`} />
                    <span className="text-xs font-bold">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5-Icon Preloaded Preview Strip */}
          <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-landing-surface-container-low border border-landing-surface-container">
            <div className="flex items-center justify-between text-[11px] font-bold text-landing-on-surface-variant">
              <span>Live Preview ({selectedStyle.toUpperCase()})</span>
              <span className="text-landing-primary font-bold">5 apt icons</span>
            </div>

            <div className="grid grid-cols-5 gap-2 pt-1">
              {preloadedList.map((item, idx) => {
                const Comp = item.comp;
                const catColor = category.color || '#00327d';
                const isFilledStyle = selectedStyle === 'filled';
                const isColorStyle = selectedStyle === 'color';
                const isOutlineStyle = selectedStyle === 'outline';

                const iconColor = isColorStyle ? catColor : '#0f172a';
                const iconBg = isColorStyle ? `${catColor}18` : (isFilledStyle ? '#f1f5f9' : '#f8fafc');

                return (
                  <div
                    key={item.title || idx}
                    className="h-16 rounded-xl bg-white border border-landing-surface-container flex flex-col items-center justify-center p-1.5 shadow-2xs hover:shadow-xs transition-all group overflow-hidden cursor-default"
                    title={item.title}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 shrink-0 overflow-hidden"
                      style={{
                        backgroundColor: iconBg,
                        color: iconColor,
                      }}
                    >
                      <Comp
                        className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-all overflow-hidden"
                        style={{
                          strokeWidth: isFilledStyle ? 1.5 : (isOutlineStyle ? 2 : 1.75),
                          fill: isFilledStyle ? (isColorStyle ? catColor : '#0f172a') : (isColorStyle ? `${catColor}25` : 'none'),
                          color: iconColor,
                        }}
                      />
                    </div>
                    <span className="text-[9px] font-semibold text-landing-on-surface truncate w-full text-center mt-1 px-0.5 leading-tight">
                      {item.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer with Search Button on Right Corner */}
        <div className="px-5 sm:px-6 py-4 bg-landing-surface-container/40 border-t border-landing-surface-container flex items-center justify-between gap-3">
          <p className="text-[11px] text-landing-on-surface-variant font-medium hidden sm:block">
            Showing <strong className="capitalize text-landing-primary">{selectedStyle}</strong> icons first, followed by others.
          </p>

          <button
            type="button"
            onClick={handleSearch}
            className="ml-auto px-5 py-2.5 rounded-2xl bg-energy-gradient text-white text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-2 transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search & Explore</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryStyleModal;
