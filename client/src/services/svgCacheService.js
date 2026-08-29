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

export function getPathBoundingBox(d) {
  if (!d || typeof d !== 'string') return null;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let curX = 0, curY = 0, startX = 0, startY = 0;

  function updateBounds(x, y) {
    if (Number.isFinite(x) && Number.isFinite(y)) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  const commandRegex = /([a-df-z])|([+-]?(?:[0-9]*\.[0-9]+|[0-9]+)(?:[eE][+-]?[0-9]+)?)/gi;
  let match;
  const tokens = [];
  while ((match = commandRegex.exec(d)) !== null) {
    if (match[1]) {
      tokens.push({ type: 'cmd', val: match[1] });
    } else if (match[2]) {
      tokens.push({ type: 'num', val: parseFloat(match[2]) });
    }
  }

  function processCommand(cmd, params) {
    if (!cmd) return;
    let i = 0;
    const isRel = cmd === cmd.toLowerCase();
    const type = cmd.toUpperCase();

    while (i < params.length || (params.length === 0 && type === 'Z')) {
      if (type === 'M') {
        const x = params[i++], y = params[i++];
        if (x === undefined || y === undefined) break;
        if (isRel) { curX += x; curY += y; } else { curX = x; curY = y; }
        startX = curX; startY = curY;
        updateBounds(curX, curY);
        cmd = isRel ? 'l' : 'L';
      } else if (type === 'L') {
        const x = params[i++], y = params[i++];
        if (x === undefined || y === undefined) break;
        if (isRel) { curX += x; curY += y; } else { curX = x; curY = y; }
        updateBounds(curX, curY);
      } else if (type === 'H') {
        const x = params[i++];
        if (x === undefined) break;
        if (isRel) { curX += x; } else { curX = x; }
        updateBounds(curX, curY);
      } else if (type === 'V') {
        const y = params[i++];
        if (y === undefined) break;
        if (isRel) { curY += y; } else { curY = y; }
        updateBounds(curX, curY);
      } else if (type === 'C') {
        const x1 = params[i++], y1 = params[i++];
        const x2 = params[i++], y2 = params[i++];
        const x = params[i++], y = params[i++];
        if (x === undefined || y === undefined) break;
        if (isRel) {
          updateBounds(curX + x1, curY + y1);
          updateBounds(curX + x2, curY + y2);
          curX += x; curY += y;
        } else {
          updateBounds(x1, y1);
          updateBounds(x2, y2);
          curX = x; curY = y;
        }
        updateBounds(curX, curY);
      } else if (type === 'S') {
        const x2 = params[i++], y2 = params[i++];
        const x = params[i++], y = params[i++];
        if (x === undefined || y === undefined) break;
        if (isRel) {
          updateBounds(curX + x2, curY + y2);
          curX += x; curY += y;
        } else {
          updateBounds(x2, y2);
          curX = x; curY = y;
        }
        updateBounds(curX, curY);
      } else if (type === 'Q') {
        const x1 = params[i++], y1 = params[i++];
        const x = params[i++], y = params[i++];
        if (x === undefined || y === undefined) break;
        if (isRel) {
          updateBounds(curX + x1, curY + y1);
          curX += x; curY += y;
        } else {
          updateBounds(x1, y1);
          curX = x; curY = y;
        }
        updateBounds(curX, curY);
      } else if (type === 'T') {
        const x = params[i++], y = params[i++];
        if (x === undefined || y === undefined) break;
        if (isRel) { curX += x; curY += y; } else { curX = x; curY = y; }
        updateBounds(curX, curY);
      } else if (type === 'A') {
        const rx = params[i++], ry = params[i++], rot = params[i++], large = params[i++], sweep = params[i++];
        const x = params[i++], y = params[i++];
        if (x === undefined || y === undefined) break;
        if (isRel) { curX += x; curY += y; } else { curX = x; curY = y; }
        updateBounds(curX, curY);
      } else if (type === 'Z') {
        curX = startX; curY = startY;
        break;
      } else {
        break;
      }
    }
  }

  let activeCmd = null;
  let activeParams = [];

  for (const token of tokens) {
    if (token.type === 'cmd') {
      if (activeCmd) processCommand(activeCmd, activeParams);
      activeCmd = token.val;
      activeParams = [];
    } else {
      activeParams.push(token.val);
    }
  }
  if (activeCmd) processCommand(activeCmd, activeParams);

  if (minX === Infinity || maxX === -Infinity) return null;
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

export function getCorrectViewBox(svgText) {
  const vbMatch = svgText.match(/viewBox=["']([^"']+)["']/i);
  let curVb = null;
  if (vbMatch) {
    const parts = vbMatch[1].trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
      curVb = { x: parts[0], y: parts[1], w: parts[2], h: parts[3] };
    }
  }

  const dMatches = Array.from(svgText.matchAll(/<path[^>]*\bd=["']([^"']+)["']/gi)).map(m => m[1]);
  let overallMinX = Infinity, overallMinY = Infinity, overallMaxX = -Infinity, overallMaxY = -Infinity;

  for (const d of dMatches) {
    const b = getPathBoundingBox(d);
    if (b) {
      if (b.minX < overallMinX) overallMinX = b.minX;
      if (b.minY < overallMinY) overallMinY = b.minY;
      if (b.maxX > overallMaxX) overallMaxX = b.maxX;
      if (b.maxY > overallMaxY) overallMaxY = b.maxY;
    }
  }

  for (const c of svgText.matchAll(/<circle[^>]*>/gi)) {
    const cxMatch = c[0].match(/\bcx=["']([0-9.-]+)["']/i);
    const cyMatch = c[0].match(/\bcy=["']([0-9.-]+)["']/i);
    const rMatch = c[0].match(/\br=["']([0-9.-]+)["']/i);
    if (cxMatch && cyMatch && rMatch) {
      const cx = parseFloat(cxMatch[1]), cy = parseFloat(cyMatch[1]), r = parseFloat(rMatch[1]);
      if (cx - r < overallMinX) overallMinX = cx - r;
      if (cy - r < overallMinY) overallMinY = cy - r;
      if (cx + r > overallMaxX) overallMaxX = cx + r;
      if (cy + r > overallMaxY) overallMaxY = cy + r;
    }
  }

  for (const r of svgText.matchAll(/<rect[^>]*>/gi)) {
    const xMatch = r[0].match(/\bx=["']([0-9.-]+)["']/i);
    const yMatch = r[0].match(/\by=["']([0-9.-]+)["']/i);
    const wMatch = r[0].match(/\bwidth=["']([0-9.-]+)["']/i);
    const hMatch = r[0].match(/\bheight=["']([0-9.-]+)["']/i);
    const x = xMatch ? parseFloat(xMatch[1]) : 0;
    const y = yMatch ? parseFloat(yMatch[1]) : 0;
    const w = wMatch ? parseFloat(wMatch[1]) : 0;
    const h = hMatch ? parseFloat(hMatch[1]) : 0;
    if (w > 0 && h > 0) {
      if (x < overallMinX) overallMinX = x;
      if (y < overallMinY) overallMinY = y;
      if (x + w > overallMaxX) overallMaxX = x + w;
      if (y + h > overallMaxY) overallMaxY = y + h;
    }
  }

  for (const poly of svgText.matchAll(/<(?:polygon|polyline)[^>]*\bpoints=["']([^"']+)["']/gi)) {
    const nums = poly[1].trim().split(/[\s,]+/).map(Number);
    for (let i = 0; i < nums.length; i += 2) {
      const px = nums[i], py = nums[i + 1];
      if (Number.isFinite(px) && Number.isFinite(py)) {
        if (px < overallMinX) overallMinX = px;
        if (py < overallMinY) overallMinY = py;
        if (px > overallMaxX) overallMaxX = px;
        if (py > overallMaxY) overallMaxY = py;
      }
    }
  }

  for (const line of svgText.matchAll(/<line[^>]*>/gi)) {
    const x1Match = line[0].match(/\bx1=["']([0-9.-]+)["']/i);
    const y1Match = line[0].match(/\by1=["']([0-9.-]+)["']/i);
    const x2Match = line[0].match(/\bx2=["']([0-9.-]+)["']/i);
    const y2Match = line[0].match(/\by2=["']([0-9.-]+)["']/i);
    if (x1Match && y1Match && x2Match && y2Match) {
      const x1 = parseFloat(x1Match[1]), y1 = parseFloat(y1Match[1]);
      const x2 = parseFloat(x2Match[1]), y2 = parseFloat(y2Match[1]);
      if (Math.min(x1, x2) < overallMinX) overallMinX = Math.min(x1, x2);
      if (Math.min(y1, y2) < overallMinY) overallMinY = Math.min(y1, y2);
      if (Math.max(x1, x2) > overallMaxX) overallMaxX = Math.max(x1, x2);
      if (Math.max(y1, y2) > overallMaxY) overallMaxY = Math.max(y1, y2);
    }
  }

  if (overallMinX === Infinity) {
    if (curVb) {
      return `${curVb.x} ${curVb.y} ${curVb.w} ${curVb.h}`;
    }
    const wMatch = svgText.match(/\bwidth=["']([0-9.]+)(?:px)?["']/i);
    const hMatch = svgText.match(/\bheight=["']([0-9.]+)(?:px)?["']/i);
    if (wMatch && hMatch && parseFloat(wMatch[1]) > 0 && parseFloat(hMatch[1]) > 0) {
      return `0 0 ${wMatch[1]} ${hMatch[1]}`;
    }
    return '0 0 24 24';
  }

  const spanX = overallMaxX - overallMinX;
  const spanY = overallMaxY - overallMinY;
  const maxSpan = Math.max(spanX, spanY);

  if (curVb) {
    const minDim = Math.min(curVb.w, curVb.h);
    const fitsInVb =
      overallMinX >= curVb.x - curVb.w * 0.1 &&
      overallMaxX <= curVb.x + curVb.w * 1.1 &&
      overallMinY >= curVb.y - curVb.h * 0.1 &&
      overallMaxY <= curVb.y + curVb.h * 1.1;

    if (fitsInVb && maxSpan >= minDim * 0.35) {
      return `${curVb.x} ${curVb.y} ${curVb.w} ${curVb.h}`;
    }
  }

  // Calculate centered, padded square viewBox
  const pad = Math.max(maxSpan * 0.06, 1);
  const squareSize = Math.round((maxSpan + pad * 2) * 100) / 100;
  const cx = (overallMinX + overallMaxX) / 2;
  const cy = (overallMinY + overallMaxY) / 2;
  const vx = Math.round((cx - squareSize / 2) * 100) / 100;
  const vy = Math.round((cy - squareSize / 2) * 100) / 100;
  return `${vx} ${vy} ${squareSize} ${squareSize}`;
}

/**
 * Normalizes SVG element attributes for flawless mathematical and optical centering
 */
export function normalizeSvgForCanvas(svgText, scopeId = null) {
  if (!svgText || typeof svgText !== 'string' || !svgText.includes('<svg')) {
    return svgText;
  }

  let result = svgText.trim()
    .replace(/<\?xml[^>]*\?>/gi, '')
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();

  // 1. Calculate & inject perfect, unclipped, centered viewBox
  const finalViewBox = getCorrectViewBox(result);
  if (/viewBox=["'][^"']*["']/i.test(result)) {
    result = result.replace(/viewBox=["'][^"']*["']/i, `viewBox="${finalViewBox}"`);
  } else {
    result = result.replace(/<svg\b([^>]*)>/i, `<svg $1 viewBox="${finalViewBox}">`);
  }

  // 2. Ensure preserveAspectRatio="xMidYMid meet" is present
  if (!/preserveAspectRatio=/i.test(result)) {
    result = result.replace(/<svg\b([^>]*)>/i, '<svg $1 preserveAspectRatio="xMidYMid meet">');
  } else {
    result = result.replace(/preserveAspectRatio=["'][^"']*["']/i, 'preserveAspectRatio="xMidYMid meet"');
  }

  // 3. Ensure overflow="visible"
  if (!/overflow=/i.test(result)) {
    result = result.replace(/<svg\b([^>]*)>/i, '<svg $1 overflow="visible">');
  }

  // 4. Strip hardcoded width & height attributes on root <svg> and set responsive 100% dimensions
  result = result.replace(/<svg\b([^>]*)>/i, (match, attrs) => {
    let cleanAttrs = attrs
      .replace(/\bwidth=["'][^"']*["']/gi, '')
      .replace(/\bheight=["'][^"']*["']/gi, '');
    return `<svg width="100%" height="100%" ${cleanAttrs.trim()}>`;
  });

  // 5. Intelligent stroke & fill recovery for unstyled icons without mutating multi-color assets
  const hasFillNone = /fill=["']none["']/i.test(result);
  const hasStroke = /stroke=/i.test(result);
  const hasExplicitColor = /#(?:[0-9a-fA-F]{3,8})|rgb\([^)]+\)|rgba\([^)]+\)/i.test(result);
  const hasFillAttr = /fill=["'](?!none)[^"']+["']/i.test(result);

  if (hasFillNone && !hasStroke && !hasFillAttr) {
    result = result.replace(/<svg\b([^>]*)>/i, '<svg $1 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">');
  } else if (!hasStroke && !hasFillAttr && !hasFillNone && !hasExplicitColor) {
    result = result.replace(/<svg\b([^>]*)>/i, '<svg $1 fill="currentColor">');
  }

  // 6. Fix pure white-on-white ONLY if the ENTIRE icon is monochrome white with zero other colors
  const allColors = (result.match(/#(?:[0-9a-fA-F]{3,8})|rgb\([^)]+\)|rgba\([^)]+\)|fill=["']([a-zA-Z]+)["']/gi) || [])
    .map(c => c.toLowerCase());
  
  const isAllWhite = allColors.length > 0 && allColors.every(c => 
    c.includes('#fff') || c.includes('white') || c.includes('rgb(255, 255, 255)') || c.includes('rgba(255, 255, 255')
  );

  if (isAllWhite) {
    result = result.replace(/fill=["'](?:#fff(?:fff)?|white)["']/gi, 'fill="currentColor"');
    result = result.replace(/stroke=["'](?:#fff(?:fff)?|white)["']/gi, 'stroke="currentColor"');
  }

  // 7. Scope IDs to prevent cross-icon collisions in DOM
  if (scopeId || result.includes('id="')) {
    result = scopeSvgIds(result, scopeId);
  }

  return result;
}
