import React, { memo, useState, useCallback, useEffect } from 'react';
import { Crown, CheckSquare, Square, ImageOff } from 'lucide-react';
import {
  getDirectR2Url,
  fetchAndCacheSvg,
  getCachedSvg,
  normalizeSvgForCanvas,
} from '../../services/svgCacheService';
import { cleanIconTitle } from '../../utils/titleCleaner';

const IconCard = ({
  icon,
  index = 0,
  isSelected = false,
  onToggleSelect = null,
}) => {
  const iconId = icon._id || icon.slug;
  const directCdnUrl = icon.r2Url || getDirectR2Url(icon);
  const proxyUrl = icon.svgUrl && icon.svgUrl.startsWith('/api')
    ? icon.svgUrl
    : (icon._id ? `/api/icons/svg/${icon._id}` : '');
  const primarySrc = directCdnUrl || proxyUrl;
  const displayTitle = cleanIconTitle(icon.title);

  // Check if SVG is already in memory
  const cachedSvg = icon.svgContent
    ? normalizeSvgForCanvas(icon.svgContent, iconId)
    : (getCachedSvg(iconId) || getCachedSvg(directCdnUrl) || getCachedSvg(proxyUrl));

  const [svgMarkup, setSvgMarkup] = useState(cachedSvg);
  const [imgSrc, setImgSrc] = useState(primarySrc);
  const [imgFailed, setImgFailed] = useState(false);
  const containerRef = React.useRef(null);

  // Active vector loader: fetch once per iconId if not already cached
  useEffect(() => {
    const fetchUrl = directCdnUrl || proxyUrl;
    setImgSrc(fetchUrl);
    setImgFailed(false);

    const cached = icon.svgContent
      ? normalizeSvgForCanvas(icon.svgContent, iconId)
      : (getCachedSvg(iconId) || getCachedSvg(directCdnUrl) || getCachedSvg(proxyUrl));
    
    if (cached) {
      setSvgMarkup(cached);
      return;
    }

    let isMounted = true;
    if (fetchUrl) {
      fetchAndCacheSvg(fetchUrl, iconId, proxyUrl)
        .then((raw) => {
          if (isMounted && raw) {
            setSvgMarkup(raw);
            setImgFailed(false);
          }
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [iconId, directCdnUrl, proxyUrl, icon.svgContent]);

  // On mount: Keep animated icons resting statically in their fully drawn visual state
  useEffect(() => {
    const isAnim = isAnimIcon || (svgMarkup && (svgMarkup.includes('<animate') || svgMarkup.includes('<animateTransform')));
    if (!isAnim || !svgMarkup) return;

    if (containerRef.current) {
      const svg = containerRef.current.querySelector('svg');
      if (svg && typeof svg.setCurrentTime === 'function') {
        try {
          svg.setCurrentTime(10);
        } catch (e) {}
      }
    }
  }, [isAnimIcon, svgMarkup]);

  // Trigger animation on hover and prefetch/inline vector SVG for instant high-def display
  const handleMouseEnter = useCallback(() => {
    if (containerRef.current) {
      const svg = containerRef.current.querySelector('svg');
      if (svg && typeof svg.setCurrentTime === 'function') {
        try {
          svg.setCurrentTime(0);
        } catch (e) {}
      }
      const animates = containerRef.current.querySelectorAll('animate, animateTransform');
      animates.forEach((a) => {
        if (typeof a.beginElement === 'function') {
          try {
            a.beginElement();
          } catch (e) {}
        }
      });
    }

    if (svgMarkup) return;
    const fetchUrl = proxyUrl || directCdnUrl;
    if (!fetchUrl) return;
    fetchAndCacheSvg(fetchUrl, iconId, directCdnUrl)
      .then((raw) => {
        if (raw) setSvgMarkup(raw);
      })
      .catch(() => {});
  }, [svgMarkup, proxyUrl, directCdnUrl, iconId]);

  // When hover ends, settle back to the completed static state
  const handleMouseLeave = useCallback(() => {
    const isAnim = isAnimIcon || (svgMarkup && (svgMarkup.includes('<animate') || svgMarkup.includes('<animateTransform')));
    if (!isAnim) return;

    if (containerRef.current) {
      const svg = containerRef.current.querySelector('svg');
      if (svg && typeof svg.setCurrentTime === 'function') {
        try {
          svg.setCurrentTime(10);
        } catch (e) {}
      }
    }
  }, [isAnimIcon, svgMarkup]);

  const handleImgError = () => {
    if (imgSrc === directCdnUrl && proxyUrl) {
      setImgSrc(proxyUrl);
    } else if (imgSrc === proxyUrl && directCdnUrl) {
      setImgSrc(directCdnUrl);
    }
    const fetchUrl = directCdnUrl || proxyUrl;
    if (fetchUrl && !svgMarkup) {
      fetchAndCacheSvg(fetchUrl, iconId, proxyUrl)
        .then((raw) => {
          if (raw) {
            setSvgMarkup(raw);
            setImgFailed(false);
          } else {
            setImgFailed(true);
          }
        })
        .catch(() => setImgFailed(true));
    }
  };

  // Immediate eager loading for initial viewport (top 24 cards), lazy for scrolled
  const isAboveFold = index < 24;

  return (
    <div
      className={`group relative flex flex-col items-center justify-center p-1.5 rounded-xl bg-white transition-all duration-150 transform hover:-translate-y-0.5 cursor-pointer select-none ${
        isSelected
          ? 'ring-2 ring-landing-primary border-transparent bg-landing-primary/5 shadow-sm'
          : 'border border-landing-surface-container/70 hover:border-landing-primary/30 shadow-2xs hover:shadow-xs'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        handleMouseEnter();
        if (onToggleSelect) {
          onToggleSelect(icon);
        }
      }}
    >
      {/* Crown indicator (top-left) */}
      {icon.isPremium && (
        <div className="absolute top-1 left-1 z-10">
          <Crown className="w-2.5 h-2.5 text-amber-500 shrink-0" />
        </div>
      )}

      {/* Select Box on Right Side Only */}
      {onToggleSelect && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(icon);
          }}
          className={`absolute top-1 right-1 z-10 p-0.5 rounded transition-all cursor-pointer ${
            isSelected
              ? 'text-landing-primary opacity-100'
              : 'text-landing-on-surface-variant opacity-0 group-hover:opacity-100 hover:text-landing-primary'
          }`}
          title={isSelected ? 'Deselect Icon' : 'Select for Download'}
        >
          {isSelected ? (
            <CheckSquare className="w-3.5 h-3.5 fill-landing-primary text-white" />
          ) : (
            <Square className="w-3.5 h-3.5 text-landing-on-surface-variant/80 hover:text-landing-primary" />
          )}
        </button>
      )}

      {/* Inner SVG Icon Container:
          The logo and its boundary with contrast container */}
      <div
        className="w-10 h-10 sm:w-11 sm:h-11 p-0.5 flex items-center justify-center text-slate-800 bg-slate-50/80 border border-slate-100 rounded-lg group-hover:bg-slate-100/90 group-hover:scale-105 transition-all duration-150 relative shrink-0 overflow-hidden"
      >
        {svgMarkup ? (
          <div
            ref={containerRef}
            className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:block [&>svg]:m-auto [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:overflow-hidden filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.12)]"
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
          />
        ) : imgFailed ? (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <ImageOff className="w-4 h-4" />
          </div>
        ) : (
          <img
            src={imgSrc}
            alt={displayTitle}
            className="w-full h-full block aspect-square max-w-full max-h-full object-contain m-auto pointer-events-none filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.12)]"
            loading={isAboveFold ? 'eager' : 'lazy'}
            fetchPriority={index < 12 ? 'high' : 'auto'}
            decoding="async"
            onError={handleImgError}
          />
        )}
      </div>

      {/* Clean Icon Title */}
      <div className="w-full text-center mt-1 px-0.5">
        <span
          className="block text-[9px] sm:text-[10px] font-semibold text-landing-on-surface hover:text-landing-vibrant-coral truncate transition-colors leading-tight"
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
    prevProps.index === nextProps.index &&
    (prevProps.icon._id || prevProps.icon.slug) === (nextProps.icon._id || nextProps.icon.slug) &&
    prevProps.icon.title === nextProps.icon.title
  );
});
