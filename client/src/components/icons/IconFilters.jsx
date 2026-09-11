import React, { useState } from 'react';
import { SlidersHorizontal, RotateCcw, ChevronDown, ChevronUp, Check, Layers, Film } from 'lucide-react';

const shapeOptions = [
  { id: 'all', label: 'All Shapes' },
  { id: 'outline', label: 'Outline' },
  { id: 'filled', label: 'Fill' },
  { id: 'color', label: 'Color' },
  { id: 'flat', label: 'Flat' },
  { id: 'gradient', label: 'Gradient' },
  { id: 'hand-drawn', label: 'Hand Drawn' },
  { id: '3d', label: '3D / Isometric' },
];

const presetColorSwatches = [
  { label: 'Navy', hex: '#00327d' },
  { label: 'Coral', hex: '#FF5F52' },
  { label: 'Teal', hex: '#00F5D4' },
  { label: 'Yellow', hex: '#FFD54F' },
  { label: 'Purple', hex: '#6366f1' },
  { label: 'Green', hex: '#10b981' },
  { label: 'Red', hex: '#ef4444' },
];

const IconFilters = ({
  selectedShape = 'all',
  onChangeShape,
  availableStyles = null,
  selectedColorType = 'all', // 'all' | 'black' | 'gradient' | 'colors'
  onChangeColorType,
  selectedColor = '',
  onChangeColor,
  selectedSort = 'trending', // 'trending' | 'recent'
  onChangeSort,
  groupBy = 'all', // 'all' | 'style' | 'pack'
  onChangeGroupBy,
  hasMultipleStyles = true,
  hasMultiplePacks = true,
  isAnimatedOnly = false,
  onToggleAnimated,
  onResetFilters,
  actionSlot = null,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeFilterCount =
    (selectedShape !== 'all' ? 1 : 0) +
    (selectedColorType !== 'all' ? 1 : 0);

  // Dynamic grouping options: hide Style if only 1 style, hide Pack if only 1 pack
  const groupingOptions = [
    { id: 'all', label: 'All Icons' },
    ...(hasMultipleStyles ? [{ id: 'style', label: 'Style' }] : []),
    ...(hasMultiplePacks ? [{ id: 'pack', label: 'Pack' }] : []),
  ];

  return (
    <div className="flex flex-col rounded-2xl bg-white border border-landing-surface-container shadow-2xs mb-2.5 transition-all">
      {/* Top Filter Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Collapsible Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border cursor-pointer ${
              isExpanded || activeFilterCount > 0
                ? 'bg-landing-primary text-white border-landing-primary shadow-xs'
                : 'bg-landing-surface-container-low hover:bg-landing-surface-container text-landing-on-surface border-landing-surface-container'
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-3.5 h-3.5 rounded-full bg-landing-vibrant-coral text-white text-[9px] font-extrabold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Individual Grouping Buttons: All Icons, Style (if >1), Pack (if >1) */}
          <div className="flex items-center gap-1">
            {groupingOptions.map((opt) => {
              const isSelected = groupBy === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChangeGroupBy(opt.id)}
                  className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-landing-primary text-white border-landing-primary shadow-xs'
                      : 'bg-landing-surface-container-low hover:bg-landing-surface-container text-landing-on-surface border-landing-surface-container'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Animated Icons Button (Beside Group By on the right) */}
          <button
            type="button"
            onClick={onToggleAnimated}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer select-none ${
              isAnimatedOnly
                ? 'bg-energy-gradient text-white border-transparent shadow-xs hover:shadow-md'
                : 'bg-landing-surface-container-low hover:bg-landing-surface-container text-landing-on-surface border-landing-surface-container'
            }`}
            title={isAnimatedOnly ? "Switch to Static Icons" : "Show Animated Icons only"}
          >
            <Film className={`w-3 h-3 ${isAnimatedOnly ? 'text-white animate-pulse' : 'text-amber-500'}`} />
            <span>Animated Icons</span>
            {isAnimatedOnly && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>

          {/* Action Slot (e.g. Open Download Button) */}
          {actionSlot}
        </div>

        {/* Right Side: Sort By Section */}
        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
          <span className="text-[11px] font-semibold text-landing-on-surface-variant hidden sm:inline-block">Sort:</span>
          <div className="flex p-0.5 rounded-lg bg-landing-surface-container-low border border-landing-outline-variant/30">
            <button
              type="button"
              onClick={() => onChangeSort('trending')}
              className={`px-2.5 py-0.5 rounded-md text-xs font-semibold transition-all ${
                selectedSort === 'trending' ? 'bg-white shadow-xs text-landing-primary' : 'text-landing-on-surface-variant'
              }`}
            >
              Trending
            </button>
            <button
              type="button"
              onClick={() => onChangeSort('recent')}
              className={`px-2.5 py-0.5 rounded-md text-xs font-semibold transition-all ${
                selectedSort === 'recent' ? 'bg-white shadow-xs text-landing-primary' : 'text-landing-on-surface-variant'
              }`}
            >
              Recent
            </button>
          </div>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs font-semibold text-landing-vibrant-coral hover:underline flex items-center gap-1 ml-1 cursor-pointer"
              title="Reset Filters"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span className="hidden sm:inline-block">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Expanded Filter Panel */}
      {isExpanded && (
        <div className="p-3 sm:p-3.5 pt-0 border-t border-landing-surface-container/60 mt-1.5 flex flex-col gap-2.5 animate-fade-in">
          {/* 1. Shape Section: Only show buttons that actually exist in the category */}
          <div className="flex flex-col gap-1 pt-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-landing-on-surface-variant">
              Shape
            </label>
            <div className="flex flex-wrap gap-1">
              {shapeOptions
                .filter((shape) => {
                  if (shape.id === 'all') return true;
                  if (!availableStyles || availableStyles.length === 0) return true;
                  if (shape.id === '3d') {
                    return availableStyles.includes('3d') || availableStyles.includes('isometric');
                  }
                  return availableStyles.includes(shape.id);
                })
                .map((shape) => {
                  const isSelected = selectedShape === shape.id;
                  return (
                    <button
                      key={shape.id}
                      type="button"
                      onClick={() => onChangeShape(shape.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-landing-primary text-white shadow-xs scale-102'
                          : 'bg-landing-surface-container-low hover:bg-landing-surface-container text-landing-on-surface'
                      }`}
                    >
                      {shape.label}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* 2. Colors Section (Black, Gradient, Colors with preset swatches) */}
          <div className="flex flex-col gap-1.5 pt-0.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-landing-on-surface-variant">
              Colors
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'All' },
                { id: 'black', label: 'Black' },
                { id: 'gradient', label: 'Gradient' },
                { id: 'colors', label: 'Colors' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onChangeColorType(opt.id);
                    if (opt.id !== 'colors') {
                      onChangeColor('');
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    selectedColorType === opt.id
                      ? 'bg-landing-primary text-white border-landing-primary shadow-xs'
                      : 'bg-landing-surface-container-low text-landing-on-surface border-landing-surface-container hover:bg-landing-surface-container'
                  }`}
                >
                  {opt.label}
                </button>
              ))}

              {/* When "Colors" is selected, show the preset color swatches */}
              {selectedColorType === 'colors' && (
                <div className="flex items-center gap-1 pl-2 border-l border-landing-surface-container animate-fade-in">
                  {presetColorSwatches.map((color) => (
                    <button
                      key={color.label}
                      type="button"
                      onClick={() => onChangeColor(color.hex)}
                      className={`w-5 h-5 rounded-md border transition-transform flex items-center justify-center shadow-2xs ${
                        selectedColor === color.hex ? 'ring-2 ring-landing-primary ring-offset-1 scale-110' : 'border-black/10 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.label}
                    >
                      {selectedColor === color.hex && <Check className="w-2.5 h-2.5 text-white" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IconFilters;
