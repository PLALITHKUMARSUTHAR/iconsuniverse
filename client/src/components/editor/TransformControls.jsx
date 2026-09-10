import React from 'react';
import { RotateCw, FlipHorizontal, FlipVertical, RotateCcw } from 'lucide-react';

const TransformControls = ({
  rotation = 0,
  flipH = false,
  flipV = false,
  padding = 12,
  onUpdateTransform,
  onReset,
}) => {
  const rotateRight = () => onUpdateTransform({ rotation: (rotation + 90) % 360 });
  const rotateLeft = () => onUpdateTransform({ rotation: (rotation - 90 + 360) % 360 });
  const toggleFlipH = () => onUpdateTransform({ flipH: !flipH });
  const toggleFlipV = () => onUpdateTransform({ flipV: !flipV });

  return (
    <div className="flex flex-col gap-4">
      {/* Quick Action Transform Buttons */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-landing-on-surface-variant block mb-2">
          Orientation & Flip
        </label>
        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={rotateLeft}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border-2 border-transparent text-slate-700 transition-all flex flex-col items-center gap-1 cursor-pointer"
            title="Rotate -90°"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-[10px] font-bold">-90°</span>
          </button>

          <button
            type="button"
            onClick={rotateRight}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border-2 border-transparent text-slate-700 transition-all flex flex-col items-center gap-1 cursor-pointer"
            title="Rotate +90°"
          >
            <RotateCw className="w-4 h-4" />
            <span className="text-[10px] font-bold">+90°</span>
          </button>

          <button
            type="button"
            onClick={toggleFlipH}
            className={`p-2.5 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 cursor-pointer ${
              flipH
                ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs font-bold'
                : 'bg-slate-100 hover:bg-slate-200 border-transparent text-slate-700'
            }`}
            title="Flip Horizontal"
          >
            <FlipHorizontal className="w-4 h-4" />
            <span className="text-[10px] font-bold">Flip H</span>
          </button>

          <button
            type="button"
            onClick={toggleFlipV}
            className={`p-2.5 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 cursor-pointer ${
              flipV
                ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs font-bold'
                : 'bg-slate-100 hover:bg-slate-200 border-transparent text-slate-700'
            }`}
            title="Flip Vertical"
          >
            <FlipVertical className="w-4 h-4" />
            <span className="text-[10px] font-bold">Flip V</span>
          </button>
        </div>
      </div>

      {/* Padding Slider */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold text-landing-on-surface-variant mb-1">
          <span>Canvas Margin / Padding</span>
          <span className="font-mono">{padding}px</span>
        </div>
        <input
          type="range"
          min="0"
          max="36"
          step="2"
          value={padding}
          onChange={(e) => onUpdateTransform({ padding: parseInt(e.target.value, 10) })}
          className="w-full h-2 bg-landing-surface-container rounded-lg appearance-none cursor-pointer accent-landing-primary"
        />
      </div>

      <button
        type="button"
        onClick={onReset}
        className="text-xs font-bold text-landing-on-surface-variant hover:text-landing-error transition-colors text-right mt-1"
      >
        Reset Transformations
      </button>
    </div>
  );
};

export default TransformControls;
