import React from 'react';
import { Pipette } from 'lucide-react';

const presetBadgeColors = [
  '#00327d', '#FF5F52', '#00F5D4', '#FFD54F', '#6366f1', '#10b981', '#1a1b20', '#f4f3fa', '#ffffff'
];

const ShapeBadgeControls = ({
  shape = 'none',
  badgeColor = '#00327d',
  badgeOpacity = 100,
  onUpdateBadge,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Shape Selector */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-landing-on-surface-variant block mb-2">
          Backdrop Badge Shape
        </label>
        <div className="grid grid-cols-4 gap-2">
          {/* None */}
          <button
            type="button"
            onClick={() => onUpdateBadge({ shape: 'none' })}
            className={`p-2.5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 ${
              shape === 'none'
                ? 'bg-landing-primary text-white border-landing-primary shadow-sm'
                : 'bg-landing-surface-container-low hover:bg-landing-surface-container border-white/60 text-landing-on-surface'
            }`}
          >
            <div className="w-5 h-5 flex items-center justify-center font-bold text-xs">✕</div>
            <span className="text-[10px] font-bold">None</span>
          </button>

          {/* Circle */}
          <button
            type="button"
            onClick={() => onUpdateBadge({ shape: 'circle' })}
            className={`p-2.5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 ${
              shape === 'circle'
                ? 'bg-landing-primary text-white border-landing-primary shadow-sm'
                : 'bg-landing-surface-container-low hover:bg-landing-surface-container border-white/60 text-landing-on-surface'
            }`}
          >
            <div className="w-5 h-5 rounded-full border-2 border-current" />
            <span className="text-[10px] font-bold">Circle</span>
          </button>

          {/* Rounded Square */}
          <button
            type="button"
            onClick={() => onUpdateBadge({ shape: 'rounded' })}
            className={`p-2.5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 ${
              shape === 'rounded'
                ? 'bg-landing-primary text-white border-landing-primary shadow-sm'
                : 'bg-landing-surface-container-low hover:bg-landing-surface-container border-white/60 text-landing-on-surface'
            }`}
          >
            <div className="w-5 h-5 rounded-md border-2 border-current" />
            <span className="text-[10px] font-bold">Square</span>
          </button>

          {/* True Mathematical Hexagon */}
          <button
            type="button"
            onClick={() => onUpdateBadge({ shape: 'hexagon' })}
            className={`p-2.5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 ${
              shape === 'hexagon'
                ? 'bg-landing-primary text-white border-landing-primary shadow-sm'
                : 'bg-landing-surface-container-low hover:bg-landing-surface-container border-white/60 text-landing-on-surface'
            }`}
          >
            <div
              className="w-5 h-5 bg-current"
              style={{
                clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
              }}
            />
            <span className="text-[10px] font-bold">Hexagon</span>
          </button>
        </div>
      </div>

      {shape !== 'none' && (
        <div className="flex flex-col gap-3 pt-2 border-t border-landing-surface-container animate-fade-in">
          {/* Preset Swatches */}
          <div>
            <span className="text-[11px] font-bold text-landing-on-surface-variant block mb-1.5">
              Quick Badge Color
            </span>
            <div className="flex flex-wrap gap-1.5">
              {presetBadgeColors.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => onUpdateBadge({ badgeColor: hex })}
                  className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 shadow-sm ${
                    badgeColor.toLowerCase() === hex.toLowerCase() ? 'ring-2 ring-landing-primary ring-offset-1 scale-110' : 'border-black/10'
                  }`}
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
              ))}
            </div>
          </div>

          {/* Badge Color Inputs */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-landing-on-surface-variant mb-1">
              <span>Custom Color</span>
              <span className="font-mono uppercase">{badgeColor}</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="w-9 h-9 rounded-xl overflow-hidden cursor-pointer border border-landing-surface-container shrink-0 shadow-sm flex items-center justify-center bg-white">
                <input
                  type="color"
                  value={badgeColor}
                  onChange={(e) => onUpdateBadge({ badgeColor: e.target.value })}
                  className="w-12 h-12 -m-2 cursor-pointer border-0 p-0"
                />
              </label>
              <input
                type="text"
                value={badgeColor}
                onChange={(e) => onUpdateBadge({ badgeColor: e.target.value })}
                placeholder="#00327D"
                className="w-full bg-landing-surface-container-low px-3 py-2 rounded-xl text-xs font-mono font-bold border border-landing-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-landing-primary"
              />
            </div>
          </div>

          {/* Opacity Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-landing-on-surface-variant mb-1">
              <span>Backdrop Opacity</span>
              <span className="font-mono">{badgeOpacity}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={badgeOpacity}
              onChange={(e) => onUpdateBadge({ badgeOpacity: parseInt(e.target.value, 10) })}
              className="w-full h-2 bg-landing-surface-container rounded-lg appearance-none cursor-pointer accent-landing-primary"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ShapeBadgeControls;
