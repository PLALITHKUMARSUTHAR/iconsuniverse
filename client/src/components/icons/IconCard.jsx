import React, { memo } from 'react';
import { Crown, CheckSquare, Square } from 'lucide-react';

const IconCard = ({
  icon,
  isSelected = false,
  onToggleSelect = null,
}) => {
  return (
    <div
      style={{ contentVisibility: 'auto', containIntrinsicSize: '80px 96px' }}
      className={`group relative flex flex-col items-center justify-between p-2 rounded-xl bg-white transition-all duration-150 transform hover:-translate-y-0.5 cursor-pointer select-none ${
        isSelected
          ? 'ring-2 ring-landing-primary border-transparent bg-landing-primary/5 shadow-sm'
          : 'border border-landing-surface-container/70 hover:border-landing-primary/30 shadow-2xs hover:shadow-xs'
      }`}
      onClick={() => {
        if (onToggleSelect) {
          onToggleSelect(icon);
        }
      }}
    >
      {/* Top Bar: Pro indicator (left) and Select Checkbox (right) */}
      <div className="w-full flex items-center justify-between z-10 -mb-1">
        <div>
          {icon.isPremium && <Crown className="w-2.5 h-2.5 text-amber-500 shrink-0" />}
        </div>

        {/* Select Box on Right Side Only */}
        {onToggleSelect && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(icon);
            }}
            className={`p-0.5 rounded transition-all ml-auto ${
              isSelected
                ? 'text-landing-primary opacity-100'
                : 'text-landing-on-surface-variant opacity-0 group-hover:opacity-100 hover:text-landing-primary'
            }`}
            title={isSelected ? 'Deselect Icon' : 'Select for Download'}
          >
            {isSelected ? (
              <CheckSquare className="w-4 h-4 fill-landing-primary text-white" />
            ) : (
              <Square className="w-4 h-4 text-landing-on-surface-variant/80 hover:text-landing-primary" />
            )}
          </button>
        )}
      </div>

      {/* Center SVG Icon with high-speed async loading */}
      <div className="my-1.5 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-landing-primary group-hover:scale-110 transition-transform duration-150">
        {icon.svgContent ? (
          <div
            className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full"
            dangerouslySetInnerHTML={{ __html: icon.svgContent }}
          />
        ) : (
          <img
            src={icon.svgUrl || icon.pngPreviewUrl}
            alt={icon.title}
            className="w-full h-full object-contain pointer-events-none"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
          />
        )}
      </div>

      {/* Title */}
      <div className="w-full text-center">
        <span
          className="block text-[10px] font-semibold text-landing-on-surface hover:text-landing-vibrant-coral truncate transition-colors"
          title={icon.title}
        >
          {icon.title}
        </span>
      </div>
    </div>
  );
};

export default memo(IconCard, (prevProps, nextProps) => {
  return (
    prevProps.isSelected === nextProps.isSelected &&
    (prevProps.icon._id || prevProps.icon.slug) === (nextProps.icon._id || nextProps.icon.slug) &&
    prevProps.icon.title === nextProps.icon.title
  );
});
