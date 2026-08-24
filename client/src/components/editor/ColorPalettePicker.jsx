import React, { useState } from 'react';
import { Pipette, Check, RefreshCw, Palette } from 'lucide-react';

const paletteGroups = {
  vibrant: {
    label: 'Brand & Vibrant',
    colors: ['#00327d', '#FF5F52', '#00F5D4', '#FFD54F', '#6366f1', '#10b981', '#f43f5e', '#8b5cf6'],
  },
  classic: {
    label: 'Classic & Neutral',
    colors: ['#1a1b20', '#374151', '#4b5563', '#6b7280', '#9ca3af', '#cbd5e1', '#001e52', '#0047AB'],
  },
  nature: {
    label: 'Nature & Warmth',
    colors: ['#059669', '#16a34a', '#84cc16', '#eab308', '#f97316', '#ef4444', '#b91c1c', '#78350f'],
  },
  neon: {
    label: 'Neon & Pastel',
    colors: ['#06b6d4', '#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#fb7185', '#34d399', '#a3e635'],
  },
};

const ColorPalettePicker = ({
  activeColor = '#00327d',
  onChangeColor,
  layerColors = [],
  onChangeLayerColor,
}) => {
  const [selectedGroup, setSelectedGroup] = useState('vibrant');
  const [customHex, setCustomHex] = useState(activeColor);

  const handleHexChange = (e) => {
    const val = e.target.value;
    setCustomHex(val);
    if (/^#([0-9A-F]{3}){1,2}$/i.test(val)) {
      onChangeColor(val);
    }
  };

  const handleColorPick = (hex) => {
    setCustomHex(hex);
    onChangeColor(hex);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Curated Palette Category Tabs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-landing-on-surface-variant flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-landing-primary" />
            <span>Preset Color Palettes</span>
          </label>

          <div className="flex gap-1">
            {Object.keys(paletteGroups).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedGroup(key)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize transition-colors ${
                  selectedGroup === key
                    ? 'bg-landing-primary text-white'
                    : 'bg-landing-surface-container-low text-landing-on-surface-variant hover:bg-landing-surface-container'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        {/* Palette Swatches */}
        <div className="grid grid-cols-8 gap-2 p-2.5 rounded-2xl bg-white border border-landing-surface-container shadow-sm">
          {paletteGroups[selectedGroup].colors.map((hex) => {
            const isSelected = activeColor.toLowerCase() === hex.toLowerCase();
            return (
              <button
                key={hex}
                type="button"
                onClick={() => handleColorPick(hex)}
                className={`h-8 rounded-xl border transition-all duration-150 transform hover:scale-110 flex items-center justify-center relative shadow-sm ${
                  isSelected
                    ? 'ring-2 ring-landing-primary ring-offset-2 scale-105'
                    : 'border-black/10'
                }`}
                style={{ backgroundColor: hex }}
                title={hex}
              >
                {isSelected && (
                  <Check
                    className={`w-4 h-4 ${
                      ['#ffffff', '#ffd54f', '#00f5d4', '#cbd5e1', '#a3e635'].includes(hex.toLowerCase())
                        ? 'text-black'
                        : 'text-white'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Custom Color Picker & Live Hex Input */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold text-landing-on-surface-variant mb-1.5">
          <span>Custom Hex Color</span>
          <span className="font-mono uppercase text-landing-primary font-bold">{activeColor}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* HTML5 Native EyeDropper & Color Wheel */}
          <label className="w-10 h-10 rounded-2xl overflow-hidden cursor-pointer border border-landing-surface-container shrink-0 shadow-sm flex items-center justify-center bg-white hover:scale-105 transition-transform">
            <input
              type="color"
              value={activeColor}
              onChange={(e) => handleColorPick(e.target.value)}
              className="w-14 h-14 -m-2 cursor-pointer border-0 p-0"
            />
          </label>

          <input
            type="text"
            value={customHex}
            onChange={handleHexChange}
            placeholder="#00327D"
            maxLength={7}
            className="w-full bg-landing-surface-container-low px-3.5 py-2.5 rounded-2xl text-xs font-mono font-bold text-landing-on-surface border border-landing-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-landing-primary uppercase"
          />

          <button
            type="button"
            onClick={() => handleColorPick('#00327d')}
            className="p-2.5 rounded-2xl bg-landing-surface-container-low hover:bg-landing-surface-container text-landing-on-surface-variant transition-colors"
            title="Reset to default brand color"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Layer-by-Layer Palette (if multiple SVG colors exist) */}
      {layerColors && layerColors.length > 1 && onChangeLayerColor && (
        <div className="pt-3 border-t border-landing-surface-container">
          <label className="text-xs font-bold uppercase tracking-wider text-landing-on-surface-variant block mb-2">
            Recolor Individual Layers ({layerColors.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {layerColors.map((layerColor, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 p-1.5 pr-2.5 rounded-xl bg-white border border-landing-surface-container shadow-sm"
              >
                <input
                  type="color"
                  defaultValue={layerColor}
                  onChange={(e) => onChangeLayerColor(layerColor, e.target.value)}
                  className="w-6 h-6 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                />
                <span className="text-[10px] font-mono font-bold uppercase text-landing-on-surface">
                  Layer {idx + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPalettePicker;
