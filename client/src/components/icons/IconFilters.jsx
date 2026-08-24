import React, { useState } from 'react';
import { SlidersHorizontal, RotateCcw, Crown, ChevronDown, ChevronUp, Check, Layers, Sparkles } from 'lucide-react';

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
  selectedColorType = 'all', // 'all' | 'black' | 'gradient' | 'colors'
  onChangeColorType,
  selectedColor = '',
  onChangeColor,
  selectedLicense = 'all',
  onChangeLicense,
  selectedSort = 'trending', // 'trending' | 'recent'
  onChangeSort,
  groupBy = 'all', // 'all' | 'style' | 'pack'
  onChangeGroupBy,
  onResetFilters,
  actionSlot = null,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGroupByOpen, setIsGroupByOpen] = useState(false);

  const activeFilterCount =
    (selectedShape !== 'all' ? 1 : 0) +
    (selectedColorType !== 'all' ? 1 : 0) +
    (selectedLicense !== 'all' ? 1 : 0);

  return (
    <div className="flex flex-col rounded-3xl bg-white border border-landing-surface-container shadow-sm mb-6 transition-all">
      {/* Top Filter Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Collapsible Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border ${
              isExpanded || activeFilterCount > 0
                ? 'bg-landing-primary text-white border-landing-primary shadow-sm'
                : 'bg-landing-surface-container-low hover:bg-landing-surface-container text-landing-on-surface border-landing-surface-container'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-landing-vibrant-coral text-white text-[10px] font-extrabold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Group By Dropdown Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsGroupByOpen(!isGroupByOpen)}
              className="px-3.5 py-2 rounded-2xl text-xs font-bold bg-landing-surface-container-low hover:bg-landing-surface-container text-landing-on-surface border border-landing-surface-container transition-all flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-landing-primary" />
              <span>
                Group By: <strong className="capitalize text-landing-primary">{groupBy === 'all' ? 'All Icons' : groupBy}</strong>
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-landing-on-surface-variant" />
            </button>

            {isGroupByOpen && (
              <div className="absolute left-0 mt-1.5 w-40 rounded-2xl bg-white border border-landing-surface-container shadow-xl p-1.5 z-40 animate-fade-in">
                {[
                  { id: 'all', label: 'All Icons' },
                  { id: 'style', label: 'Style' },
                  { id: 'pack', label: 'Pack' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onChangeGroupBy(opt.id);
                      setIsGroupByOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${
                      groupBy === opt.id
                        ? 'bg-landing-surface-container text-landing-primary'
                        : 'text-landing-on-surface hover:bg-landing-surface-container-low'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {groupBy === opt.id && <Check className="w-3 h-3 text-landing-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Slot (e.g. Open Download Button) */}
          {actionSlot}
        </div>

        {/* Right Side: Sort By Section */}
        <div className="flex items-center gap-2.5 ml-auto">
          <span className="text-xs font-bold text-landing-on-surface-variant hidden sm:inline-block">Sort:</span>
          <div className="flex p-0.5 rounded-xl bg-landing-surface-container-low border border-landing-outline-variant/30">
            <button
              type="button"
              onClick={() => onChangeSort('trending')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedSort === 'trending' ? 'bg-white shadow-xs text-landing-primary' : 'text-landing-on-surface-variant'
              }`}
            >
              Trending
            </button>
            <button
              type="button"
              onClick={() => onChangeSort('recent')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
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
              className="text-xs font-bold text-landing-vibrant-coral hover:underline flex items-center gap-1 ml-1"
              title="Reset Filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline-block">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Expanded Filter Panel */}
      {isExpanded && (
        <div className="p-4 sm:p-5 pt-0 border-t border-landing-surface-container mt-2 flex flex-col gap-4 animate-fade-in">
          {/* 1. Shape Section */}
          <div className="flex flex-col gap-1.5 pt-3">
            <label className="text-[11px] font-bold uppercase tracking-wider text-landing-on-surface-variant">
              Shape
            </label>
            <div className="flex flex-wrap gap-1.5">
              {shapeOptions.map((shape) => {
                const isSelected = selectedShape === shape.id;
                return (
                  <button
                    key={shape.id}
                    type="button"
                    onClick={() => onChangeShape(shape.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-landing-primary text-white shadow-xs scale-105'
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
          <div className="flex flex-col gap-2 pt-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-landing-on-surface-variant">
              Colors
            </label>
            <div className="flex flex-wrap items-center gap-2">
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
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
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
                <div className="flex items-center gap-1.5 pl-3 border-l border-landing-surface-container animate-fade-in">
                  {presetColorSwatches.map((color) => (
                    <button
                      key={color.label}
                      type="button"
                      onClick={() => onChangeColor(color.hex)}
                      className={`w-6 h-6 rounded-lg border transition-transform flex items-center justify-center shadow-xs ${
                        selectedColor === color.hex ? 'ring-2 ring-landing-primary ring-offset-1 scale-110' : 'border-black/10 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.label}
                    >
                      {selectedColor === color.hex && <Check className="w-3 h-3 text-white" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 3. License Section */}
          <div className="pt-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-landing-on-surface-variant block mb-1.5">
              License
            </label>
            <div className="flex gap-2 max-w-sm">
              {[
                { id: 'all', label: 'All' },
                { id: 'free', label: 'Free' },
                { id: 'premium', label: 'Pro Only', icon: Crown },
              ].map((lic) => {
                const IconC = lic.icon;
                return (
                  <button
                    key={lic.id}
                    type="button"
                    onClick={() => onChangeLicense(lic.id)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                      selectedLicense === lic.id
                        ? 'bg-landing-primary text-white border-landing-primary'
                        : 'bg-landing-surface-container-low text-landing-on-surface border-landing-surface-container hover:bg-landing-surface-container'
                    }`}
                  >
                    {IconC && <IconC className="w-3 h-3" />}
                    <span>{lic.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IconFilters;
