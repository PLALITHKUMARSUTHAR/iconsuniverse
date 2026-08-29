/**
 * High-Speed SVG Vector In-Memory Cache + Normalization, Recolor & Scoping Engine
 * Permanently solves SVG rendering issues, viewBox cutoffs, white-on-white assets, and DOM ID collisions.
 */

const memoryCache = new Map();
const inFlightPromises = new Map();
const CDN_BASE = 'https://pub-2b1851a9e65c42c095e04c8a758bca43.r2.dev';

/**
 * Cleanly encodes URL path segments for R2 / CDN or preserves internal API paths
 */
export function getSafeIconUrl(pathOrUrl) {
  if (!pathOrUrl) return '';

  // 1. Preserve local /api proxy routes
  if (pathOrUrl.startsWith('/api') || pathOrUrl.startsWith('api/')) {
    return pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  }

  // 2. Absolute HTTP/HTTPS URLs
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    try {
      const url = new URL(pathOrUrl);
      const parts = url.pathname.split('/');
      const encodedParts = parts.map((part) => {
        try {
          return decodeURIComponent(part) !== part ? part : encodeURIComponent(part);
        } catch (e) {
          return encodeURIComponent(part);
        }
      });
      url.pathname = encodedParts.join('/');
      return url.toString();
    } catch (e) {
      return pathOrUrl;
    }
  }

  // 3. Relative file path from MongoDB (e.g. "Abstract/in_icon.svg")
  const cleanPath = pathOrUrl.replace(/^\/?icons\//, '').replace(/^\/+/, '');
  const safePath = cleanPath
    .split('/')
    .map((seg) => encodeURIComponent(decodeURIComponent(seg)))
    .join('/');
  return `${CDN_BASE}/icons/${safePath}`;
}

/**
 * Builds guaranteed direct Cloudflare R2 CDN URL from icon metadata
 */
export function getDirectR2Url(icon) {
  if (!icon) return '';
  if (icon.r2Url && icon.r2Url.startsWith('http')) {
    return getSafeIconUrl(icon.r2Url);
  }
  if (icon.svgUrl && icon.svgUrl.startsWith('http')) {
    return getSafeIconUrl(icon.svgUrl);
  }
  if (icon.path) {
    const cleanPath = icon.path.replace(/^\/?icons\//, '').replace(/^\/+/, '');
    const safePath = cleanPath
      .split('/')
      .map((seg) => {
        try {
          return encodeURIComponent(decodeURIComponent(seg));
        } catch (e) {
          return encodeURIComponent(seg);
        }
      })
      .join('/');
    return `${CDN_BASE}/icons/${safePath}`;
  }
  return '';
}

/**
 * Scope and isolate all SVG definition IDs (clipPath, linearGradient, mask, filter)
 * to permanently eliminate cross-icon DOM collisions when multiple SVGs render inline.
 */
export function scopeSvgIds(svgText, scopeId = null) {
  if (!svgText || typeof svgText !== 'string' || !svgText.includes('<svg')) {
    return svgText;
  }

  const idPrefix = `iu_${(scopeId || Math.random().toString(36).slice(2, 8)).replace(/[^a-zA-Z0-9]/g, '_')}_`;
  const idMatches = svgText.match(/\bid=["']([^"']+)["']/g);
  if (!idMatches || idMatches.length === 0) {
    return svgText;
  }

  let result = svgText;
  const ids = Array.from(new Set(idMatches.map((m) => m.slice(4, -1))));

  ids.forEach((originalId) => {
    if (originalId.startsWith('iu_')) return;
    const scopedId = `${idPrefix}${originalId}`;

    // Replace definition id="originalId"
    const defRegex = new RegExp(`\\bid=["']${originalId}["']`, 'g');
    result = result.replace(defRegex, `id="${scopedId}"`);

    // Replace url(#originalId) or url('#originalId')
    const urlRegex = new RegExp(`url\\((['"]?)#${originalId}(['"]?)\\)`, 'g');
    result = result.replace(urlRegex, `url($1#${scopedId}$2)`);

    // Replace xlink:href="#originalId" or href="#originalId"
    const hrefRegex = new RegExp(`(xlink:href|href)=["']#${originalId}["']`, 'g');
    result = result.replace(hrefRegex, `$1="#${scopedId}"`);
  });

  return result;
}

/**
 * Fetch raw SVG vector text with instant in-memory cache, in-flight deduplication,
 * and dual-tier failover (Direct CDN primary + Server Proxy fallback).
 */
export async function fetchAndCacheSvg(url, iconId = null, fallbackUrl = null) {
  if (!url && !fallbackUrl) return null;
  const primaryUrl = url || fallbackUrl;
  const secondaryUrl = url && fallbackUrl && url !== fallbackUrl ? fallbackUrl : null;
  const key = iconId || primaryUrl;

  if (memoryCache.has(key)) {
    return memoryCache.get(key);
  }

  // Deduplicate concurrent requests for the exact same key
  if (inFlightPromises.has(key)) {
    return inFlightPromises.get(key);
  }

  const promise = (async () => {
    const tryFetch = async (targetUrl) => {
      if (!targetUrl) return null;
      try {
        const res = await fetch(targetUrl);
        if (!res.ok) return null;
        const text = await res.text();
        if (text && text.includes('<svg')) {
          return text;
        }
        return null;
      } catch (e) {
        return null;
      }
    };

    let rawSvg = await tryFetch(primaryUrl);

    // Failover: if primary direct CDN fetch fails, try secondary fallback
    if (!rawSvg && secondaryUrl) {
      rawSvg = await tryFetch(secondaryUrl);
    }

    if (rawSvg) {
      const normalized = normalizeSvgForCanvas(rawSvg, key);
      memoryCache.set(key, normalized);
      if (iconId && iconId !== primaryUrl) {
        memoryCache.set(iconId, normalized);
      }
      return normalized;
    }

    return null;
  })().finally(() => {
    inFlightPromises.delete(key);
  });

  inFlightPromises.set(key, promise);
  return promise;
}

/**
 * Get synchronously from cache
 */
export function getCachedSvg(iconIdOrUrl) {
  if (!iconIdOrUrl) return null;
  return memoryCache.get(iconIdOrUrl) || null;
}

/**
 * Pre-cache a known SVG string
 */
export function setCachedSvg(iconIdOrUrl, svgText) {
  if (!iconIdOrUrl || !svgText) return;
  const normalized = normalizeSvgForCanvas(svgText, iconIdOrUrl);
  memoryCache.set(iconIdOrUrl, normalized);
}

/**
 * Validates and normalizes hex color code
 */
export function normalizeHexColor(hex, fallback = '#00327d') {
  if (!hex || typeof hex !== 'string') return fallback;
  let clean = hex.trim();
  if (!clean.startsWith('#')) {
    clean = '#' + clean;
  }
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(clean)) {
    return clean;
  }
  return fallback;
}

/**
 * Comprehensive Recolor Engine for Vector SVGs
 */
export function recolorSvg(svgText, targetHex, options = {}) {
  if (!svgText || typeof svgText !== 'string' || !svgText.includes('<svg')) {
    return svgText;
  }

  const hex = normalizeHexColor(targetHex);
  let result = normalizeSvgForCanvas(svgText);

  // 1. Replace currentColor with target hex
  result = result.replace(/currentColor/gi, hex);

  // 2. Replace stroke values (except none, transparent, url(...))
  result = result.replace(/stroke="(?!(?:none|transparent|url\()[^"]*)[^"]*"/gi, `stroke="${hex}"`);
  result = result.replace(/stroke:\s*(?!(?:none|transparent|url\()[^;"]*)[^;"]*/gi, `stroke: ${hex}`);

  // 3. Replace fill values (except none, transparent, url(...))
  result = result.replace(/fill="(?!(?:none|transparent|url\()[^"]*)[^"]*"/gi, `fill="${hex}"`);
  result = result.replace(/fill:\s*(?!(?:none|transparent|url\()[^;"]*)[^;"]*/gi, `fill: ${hex}`);

  // 4. If root <svg> has no fill and no stroke, enforce fill
  if (!/fill=/i.test(result) && !/stroke=/i.test(result)) {
    result = result.replace(/<svg\b([^>]*)>/i, `<svg $1 fill="${hex}">`);
  }

  // 5. Update root style color
  result = result.replace(/<svg\b([^>]*)>/i, (match, attrs) => {
    if (/style="/i.test(attrs)) {
      return `<svg ${attrs.replace(/style="([^"]*)"/i, `style="$1; color: ${hex};"`)}>`;
    }
    return `<svg ${attrs} style="color: ${hex};">`;
  });

  return result;
}

/**
 * Normalizes SVG element attributes for flawless mathematical and optical centering
 */
export function normalizeSvgForCanvas(svgText, scopeId = null) {
  if (!svgText || typeof svgText !== 'string' || !svgText.includes('<svg')) {
    return svgText;
  }

  let result = svgText.trim();

  // 1. Remove XML declaration, DOCTYPE, and HTML comments
  result = result
    .replace(/<\?xml[^>]*\?>/gi, '')
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();

  // 2. Ensure viewBox is present; if missing, extract from width/height before stripping them
  const hasViewBox = /viewBox=["']([^"']+)["']/i.test(result);
  if (!hasViewBox) {
    const wMatch = result.match(/\bwidth=["']([0-9.]+)(?:px)?["']/i);
    const hMatch = result.match(/\bheight=["']([0-9.]+)(?:px)?["']/i);
    if (wMatch && hMatch && parseFloat(wMatch[1]) > 0 && parseFloat(hMatch[1]) > 0) {
      result = result.replace(/<svg\b([^>]*)>/i, `<svg $1 viewBox="0 0 ${wMatch[1]} ${hMatch[1]}">`);
    } else {
      result = result.replace(/<svg\b([^>]*)>/i, `<svg $1 viewBox="0 0 24 24">`);
    }
  }

  // 3. Ensure preserveAspectRatio="xMidYMid meet" is present
  if (!/preserveAspectRatio=/i.test(result)) {
    result = result.replace(/<svg\b([^>]*)>/i, '<svg $1 preserveAspectRatio="xMidYMid meet">');
  } else {
    result = result.replace(/preserveAspectRatio=["'][^"']*["']/i, 'preserveAspectRatio="xMidYMid meet"');
  }

  // 4. Ensure overflow="visible"
  if (!/overflow=/i.test(result)) {
    result = result.replace(/<svg\b([^>]*)>/i, '<svg $1 overflow="visible">');
  }

  // 5. Strip hardcoded width & height attributes on root <svg> and set responsive 100% dimensions
  result = result.replace(/<svg\b([^>]*)>/i, (match, attrs) => {
    let cleanAttrs = attrs
      .replace(/\bwidth=["'][^"']*["']/gi, '')
      .replace(/\bheight=["'][^"']*["']/gi, '');
    return `<svg width="100%" height="100%" ${cleanAttrs.trim()}>`;
  });

  // 6. Fix invisible stroke icons
  const hasFillNone = /fill=["']none["']/i.test(result);
  const hasStroke = /stroke=/i.test(result);
  const hasFillAttr = /fill=["'](?!none)[^"']+["']/i.test(result);

  if (hasFillNone && !hasStroke && !hasFillAttr) {
    result = result.replace(/<svg\b([^>]*)>/i, '<svg $1 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">');
  } else if (!hasStroke && !hasFillAttr && !hasFillNone) {
    result = result.replace(/<svg\b([^>]*)>/i, '<svg $1 fill="currentColor">');
  }

  // 7. Fix pure white icons on light surfaces
  const isPureWhite =
    (result.includes('fill="#fff"') ||
      result.includes('fill="#ffffff"') ||
      result.includes('fill="white"') ||
      result.includes("fill='#fff'") ||
      result.includes("fill='#ffffff'") ||
      result.includes("fill='white'")) &&
    !result.includes('stroke="#00') &&
    !result.includes('fill="#00') &&
    !result.includes('fill="currentColor"');

  if (isPureWhite) {
    result = result.replace(/fill=["'](?:#fff(?:fff)?|white)["']/gi, 'fill="currentColor"');
  }

  // 8. Scope IDs to prevent cross-icon collisions in DOM
  if (scopeId || result.includes('id="')) {
    result = scopeSvgIds(result, scopeId);
  }

  return result;
}
