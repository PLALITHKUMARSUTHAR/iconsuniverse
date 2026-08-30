import React, { memo, useState, useEffect } from 'react';
import { Crown, CheckSquare, Square, ImageOff } from 'lucide-react';
import {
  getSafeIconUrl,
  getDirectR2Url,
  fetchAndCacheSvg,
  getCachedSvg,
  normalizeSvgForCanvas,
} from '../../services/svgCacheService';
import { cleanIconTitle } from '../../utils/titleCleaner';

const IconCard = ({
  icon,
  isSelected = false,
  onToggleSelect = null,
}) => {
  const iconId = icon._id || icon.slug;
  const directCdnUrl = getDirectR2Url(icon);
  const proxyUrl = icon.svgUrl && icon.svgUrl.startsWith('/api') ? icon.svgUrl : (icon._id ? `/api/icons/svg/${icon._id}` : '');
  const displayTitle = cleanIconTitle(icon.title);

  const [svgContent, setSvgContent] = useState(() => {
    if (icon.svgContent) return normalizeSvgForCanvas(icon.svgContent, iconId);
    const cached = getCachedSvg(iconId) || getCachedSvg(proxyUrl) || getCachedSvg(directCdnUrl);
    return cached ? normalizeSvgForCanvas(cached, iconId) : null;
  });

  const [imgFailed, setImgFailed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(Boolean(svgContent));

  useEffect(() => {
    if (icon.svgContent) {
      setSvgContent(normalizeSvgForCanvas(icon.svgContent, iconId));
      setIsLoaded(true);
      return;
    }

    const cached = getCachedSvg(iconId) || getCachedSvg(proxyUrl) || getCachedSvg(directCdnUrl);
    if (cached) {
      setSvgContent(normalizeSvgForCanvas(cached, iconId));
      setIsLoaded(true);
      return;
    }

    // Try fetching SVG vector via proxy with CORS enabled (falls back cleanly to direct CDN img)
    let isMounted = true;
    const fetchUrl = proxyUrl || directCdnUrl;

    if (fetchUrl) {
      fetchAndCacheSvg(fetchUrl, iconId, directCdnUrl)
        .then((raw) => {
          if (isMounted && raw) {
            setSvgContent(normalizeSvgForCanvas(raw, iconId));
            setIsLoaded(true);
          }
        })
        .catch(() => {
          // Silent fallback: <img src={directCdnUrl}> handles display seamlessly
        });
    }

    return () => {
      isMounted = false;
    };
  }, [iconId, proxyUrl, directCdnUrl, icon.svgContent]);

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

      {/* Inner SVG Icon Box Container: scaled to 44x44px (sm: 48x48px) preserving original colors */}
      <div className="my-1 w-11 h-11 sm:w-12 sm:h-12 p-0.5 flex items-center justify-center text-slate-800 group-hover:scale-110 transition-all duration-150 relative m-auto shrink-0 overflow-hidden">
        {svgContent ? (
          <div
            className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:block [&>svg]:m-auto [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:overflow-hidden"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : imgFailed ? (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <ImageOff className="w-5 h-5" />
          </div>
        ) : (
          <>
            {!isLoaded && (
              <div className="absolute inset-0 bg-slate-100/80 rounded-xl animate-pulse" />
            )}
            <img
              src={directCdnUrl}
              alt={displayTitle}
              className={`w-full h-full object-contain m-auto pointer-events-none transition-opacity duration-150 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              decoding="async"
              onLoad={() => setIsLoaded(true)}
              onError={() => {
                setImgFailed(true);
                setIsLoaded(true);
              }}
            />
          </>
        )}
      </div>

      {/* Title */}
      <div className="w-full text-center mt-auto pt-0.5">
        <span
          className="block text-[10px] font-semibold text-landing-on-surface hover:text-landing-vibrant-coral truncate transition-colors"
          title={displayTitle}
        >
          {displayTitle}
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
