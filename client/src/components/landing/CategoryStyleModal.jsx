import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryIconMap } from '../../data/categoryIcons';
import { iconService } from '../../services/iconService';
import { X, Search, Sparkles, Check, Layers, CircleDot, Palette, Grid3X3, ArrowRight } from 'lucide-react';

const styleOptions = [
  { id: 'filled', label: 'Fill / Bold', icon: CircleDot, desc: 'Solid filled glyphs' },
  { id: 'outline', label: 'Outline', icon: Layers, desc: 'Clean stroke line icons' },
  { id: 'color', label: 'Color / Flat', icon: Palette, desc: 'Multi-color vibrant assets' },
  { id: 'all', label: 'All Styles', icon: Grid3X3, desc: 'Complete category collection' },
];

const CategoryStyleModal = ({ isOpen, onClose, category }) => {
  const navigate = useNavigate();
  const [selectedStyle, setSelectedStyle] = useState('filled');
  const [previewIcons, setPreviewIcons] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    if (!isOpen || !category) return;

    let isMounted = true;
    const fetchPreviews = async () => {
      setLoadingPreview(true);
      try {
        const params = {
          category: category.slug,
          style: selectedStyle !== 'all' ? selectedStyle : undefined,
          strict: selectedStyle !== 'all' ? 'true' : undefined,
          limit: 5,
        };
        const res = await iconService.getIcons(params);
        if (isMounted && res.data && res.data.icons) {
          setPreviewIcons(res.data.icons.slice(0, 5));
        }
      } catch (err) {
        if (isMounted) setPreviewIcons([]);
      } finally {
        if (isMounted) setLoadingPreview(false);
      }
    };

    fetchPreviews();
    return () => {
      isMounted = false;
    };
  }, [isOpen, category, selectedStyle]);

  if (!isOpen || !category) return null;

  const IconComp = CategoryIconMap[category.iconName] || Layers;

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
            className="p-2 rounded-xl text-landing-on-surface-variant hover:text-landing-primary hover:bg-landing-surface-container transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 flex flex-col gap-5">
          {/* Style Selection Cards / Chips */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-landing-primary tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-landing-vibrant-coral" />
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

          {/* 5-Icon Preview Strip */}
          <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-landing-surface-container-low border border-landing-surface-container">
            <div className="flex items-center justify-between text-[11px] font-bold text-landing-on-surface-variant">
              <span>Live Preview ({selectedStyle.toUpperCase()})</span>
              <span>5 sample icons</span>
            </div>

            <div className="grid grid-cols-5 gap-2 pt-1">
              {loadingPreview ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 rounded-xl bg-white border border-landing-surface-container/60 animate-shimmer"
                  />
                ))
              ) : previewIcons.length > 0 ? (
                previewIcons.map((ic) => (
                  <div
                    key={ic._id || ic.slug}
                    className="h-16 rounded-xl bg-white border border-landing-surface-container flex flex-col items-center justify-center p-1.5 shadow-2xs hover:shadow-xs transition-all group"
                    title={ic.title}
                  >
                    <img
                      src={ic.svgUrl || ic.pngPreviewUrl}
                      alt={ic.title}
                      className="w-7 h-7 object-contain group-hover:scale-110 transition-transform"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <span className="text-[9px] font-medium text-landing-on-surface-variant truncate w-full text-center mt-1">
                      {ic.title}
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-5 py-4 text-center text-xs text-landing-on-surface-variant">
                  No preview icons available for this style
                </div>
              )}
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
