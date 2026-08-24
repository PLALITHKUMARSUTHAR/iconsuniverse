import React from 'react';
import IconCard from './IconCard';
import { SearchX } from 'lucide-react';

const IconGrid = ({
  icons = [],
  loading = false,
  selectedIds = new Set(),
  onToggleSelect = null,
}) => {
  if (loading && icons.length === 0) {
    return (
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2 sm:gap-2.5">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-xl bg-landing-surface-container-low border border-white/60 animate-shimmer"
          />
        ))}
      </div>
    );
  }

  if (!icons || icons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl glass-landing border border-white/60 my-6">
        <div className="w-12 h-12 rounded-2xl bg-landing-surface-container-low flex items-center justify-center mb-3 text-landing-on-surface-variant">
          <SearchX className="w-6 h-6 opacity-60" />
        </div>
        <h3 className="text-base font-bold font-heading text-landing-on-surface mb-1">No vector icons found</h3>
        <p className="text-xs text-landing-on-surface-variant max-w-sm">
          Try adjusting your search query or expanding your filter selection.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2 sm:gap-2.5">
      {icons.map((icon) => {
        const id = icon._id || icon.slug;
        const isSelected = selectedIds.has(id);
        return (
          <IconCard
            key={id}
            icon={icon}
            isSelected={isSelected}
            onToggleSelect={onToggleSelect}
          />
        );
      })}
    </div>
  );
};

export default IconGrid;
