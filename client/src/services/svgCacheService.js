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

export function parseSvgPathData(d) {
  if (!d || typeof d !== 'string') return [];

  const commands = [];
  let i = 0;
  const len = d.length;

  function isWhitespace(ch) {
    return ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n' || ch === ',';
  }

  function isAlpha(ch) {
    return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z');
  }

  function isDigit(ch) {
    return ch >= '0' && ch <= '9';
  }

  function skipWhitespace() {
    while (i < len && isWhitespace(d[i])) i++;
  }

  function parseNumber() {
    skipWhitespace();
    if (i >= len) return null;

    const start = i;
    if (d[i] === '+' || d[i] === '-') i++;

    let hasDigits = false;
    while (i < len && isDigit(d[i])) {
      hasDigits = true;
      i++;
    }

    if (i < len && d[i] === '.') {
      i++;
      while (i < len && isDigit(d[i])) {
        hasDigits = true;
        i++;
      }
    }

    if (!hasDigits) {
      i = start;
      return null;
    }

    if (i < len && (d[i] === 'e' || d[i] === 'E')) {
      const ePos = i;
      i++;
      if (i < len && (d[i] === '+' || d[i] === '-')) i++;
      let hasExpDigits = false;
      while (i < len && isDigit(d[i])) {
        hasExpDigits = true;
        i++;
      }
      if (!hasExpDigits) {
        i = ePos;
      }
    }

    const numStr = d.slice(start, i);
    const val = parseFloat(numStr);
    return Number.isFinite(val) ? val : null;
  }

  function parseFlag() {
    skipWhitespace();
    if (i >= len) return null;
    const ch = d[i];
    if (ch === '0' || ch === '1') {
      i++;
      return ch === '1' ? 1 : 0;
    }
    return null;
  }

  let currentCmd = null;

  while (i < len) {
    skipWhitespace();
    if (i >= len) break;

    const ch = d[i];
    if (isAlpha(ch)) {
      currentCmd = ch;
      i++;
      skipWhitespace();
    } else if (!currentCmd) {
      i++;
      continue;
    }

    const type = currentCmd.toUpperCase();
    const isRel = currentCmd === currentCmd.toLowerCase();

    if (type === 'Z') {
      commands.push({ type: 'Z', isRel, args: [] });
      currentCmd = null;
      continue;
    }

    const args = [];
    if (type === 'A') {
      const rx = parseNumber();
      const ry = parseNumber();
      const rot = parseNumber();
      const large = parseFlag();
      const sweep = parseFlag();
      const x = parseNumber();
      const y = parseNumber();

      if (rx !== null && ry !== null && rot !== null && large !== null && sweep !== null && x !== null && y !== null) {
        commands.push({ type: 'A', isRel, args: [rx, ry, rot, large, sweep, x, y] });
      } else {
        break;
      }
    } else {
      const expectedArgs = (type === 'H' || type === 'V') ? 1 : (type === 'M' || type === 'L' || type === 'T') ? 2 : (type === 'S' || type === 'Q') ? 4 : (type === 'C') ? 6 : 2;
      for (let a = 0; a < expectedArgs; a++) {
        const num = parseNumber();
        if (num === null) break;
        args.push(num);
      }
      if (args.length === expectedArgs) {
        commands.push({ type, isRel, args });
        if (type === 'M') {
          currentCmd = isRel ? 'l' : 'L';
        }
      } else {
        break;
      }
    }
  }

  return commands;
}

export function parseTransform(transformStr) {
  if (!transformStr || typeof transformStr !== 'string') return null;

  let tx = 0, ty = 0, sx = 1, sy = 1;
  let hasTransform = false;

  const translateMatch = transformStr.match(/translate\(\s*([0-9.-]+)(?:[\s,]+([0-9.-]+))?\s*\)/i);
  if (translateMatch) {
    tx = parseFloat(translateMatch[1]) || 0;
    ty = parseFloat(translateMatch[2]) || 0;
    hasTransform = true;
  }

  const scaleMatch = transformStr.match(/scale\(\s*([0-9.-]+)(?:[\s,]+([0-9.-]+))?\s*\)/i);
  if (scaleMatch) {
    sx = parseFloat(scaleMatch[1]) || 1;
    sy = scaleMatch[2] ? parseFloat(scaleMatch[2]) : sx;
    hasTransform = true;
  }

  const matrixMatch = transformStr.match(/matrix\(\s*([0-9.-]+)[\s,]+([0-9.-]+)[\s,]+([0-9.-]+)[\s,]+([0-9.-]+)[\s,]+([0-9.-]+)[\s,]+([0-9.-]+)\s*\)/i);
  if (matrixMatch) {
    const a = parseFloat(matrixMatch[1]), b = parseFloat(matrixMatch[2]);
    const c = parseFloat(matrixMatch[3]), d = parseFloat(matrixMatch[4]);
    const e = parseFloat(matrixMatch[5]), f = parseFloat(matrixMatch[6]);
    return (x, y) => ({ x: a * x + c * y + e, y: b * x + d * y + f });
  }

  if (!hasTransform) return null;
  return (x, y) => ({ x: x * sx + tx, y: y * sy + ty });
}

function getArcBoundingBoxExact(x1, y1, rx, ry, phiDeg, largeArc, sweep, x2, y2) {
  if (rx === 0 || ry === 0) {
    return { minX: Math.min(x1, x2), minY: Math.min(y1, y2), maxX: Math.max(x1, x2), maxY: Math.max(y1, y2) };
  }

  rx = Math.abs(rx);
  ry = Math.abs(ry);
  const phi = ((phiDeg || 0) * Math.PI) / 180;
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);

  const dx = (x1 - x2) / 2;
  const dy = (y1 - y2) / 2;
  const x1p = cosPhi * dx + sinPhi * dy;
  const y1p = -sinPhi * dx + cosPhi * dy;

  let lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (lambda > 1) {
    const sqrtLambda = Math.sqrt(lambda);
    rx *= sqrtLambda;
    ry *= sqrtLambda;
  }

  const sign = largeArc === sweep ? -1 : 1;
  const num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
  const den = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
  const factor = sign * Math.sqrt(Math.max(0, num / den));
  const cxp = factor * ((rx * y1p) / ry);
  const cyp = factor * (-(ry * x1p) / rx);

  const cx = cosPhi * cxp - sinPhi * cyp + (x1 + x2) / 2;
  const cy = sinPhi * cxp + cosPhi * cyp + (y1 + y2) / 2;

  function angle(uX, uY, vX, vY) {
    const dot = uX * vX + uY * vY;
    const len = Math.sqrt(uX * uX + uY * uY) * Math.sqrt(vX * vX + vY * vY);
    let ang = Math.acos(Math.max(-1, Math.min(1, dot / (len || 1))));
    if (uX * vY - uY * vX < 0) ang = -ang;
    return ang;
  }

  const theta1 = angle(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
  let dTheta = angle((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);

  if (!sweep && dTheta > 0) dTheta -= 2 * Math.PI;
  if (sweep && dTheta < 0) dTheta += 2 * Math.PI;

  const theta2 = theta1 + dTheta;
  const startAng = Math.min(theta1, theta2);
  const endAng = Math.max(theta1, theta2);

  let minX = Math.min(x1, x2);
  let maxX = Math.max(x1, x2);
  let minY = Math.min(y1, y2);
  let maxY = Math.max(y1, y2);

  const tX = Math.atan2(-ry * sinPhi, rx * cosPhi);
  for (const ang of [tX, tX + Math.PI, tX - Math.PI, tX + 2 * Math.PI]) {
    const norm = ang - 2 * Math.PI * Math.floor((ang - startAng) / (2 * Math.PI));
    if (norm >= startAng && norm <= endAng) {
      const ex = cx + rx * Math.cos(norm) * cosPhi - ry * Math.sin(norm) * sinPhi;
      if (ex < minX) minX = ex;
      if (ex > maxX) maxX = ex;
    }
  }

  const tY = Math.atan2(ry * cosPhi, rx * sinPhi);
  for (const ang of [tY, tY + Math.PI, tY - Math.PI, tY + 2 * Math.PI]) {
    const norm = ang - 2 * Math.PI * Math.floor((ang - startAng) / (2 * Math.PI));
    if (norm >= startAng && norm <= endAng) {
      const ey = cy + rx * Math.cos(norm) * sinPhi + ry * Math.sin(norm) * cosPhi;
      if (ey < minY) minY = ey;
      if (ey > maxY) maxY = ey;
    }
  }

  return { minX, minY, maxX, maxY };
}

export function getPathBoundingBoxExact(d, transformFn = null) {
  const commands = parseSvgPathData(d);
  if (commands.length === 0) return null;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let curX = 0, curY = 0, startX = 0, startY = 0;

  function updateBounds(x, y) {
    if (Number.isFinite(x) && Number.isFinite(y)) {
      let px = x, py = y;
      if (transformFn) {
        const pt = transformFn(x, y);
        px = pt.x;
        py = pt.y;
      }
      if (px < minX) minX = px;
      if (py < minY) minY = py;
      if (px > maxX) maxX = px;
      if (py > maxY) maxY = py;
    }
  }

  for (const cmd of commands) {
    const { type, isRel, args } = cmd;

    if (type === 'M') {
      const [x, y] = args;
      if (isRel) { curX += x; curY += y; } else { curX = x; curY = y; }
      startX = curX; startY = curY;
      updateBounds(curX, curY);
    } else if (type === 'L') {
      const [x, y] = args;
      if (isRel) { curX += x; curY += y; } else { curX = x; curY = y; }
      updateBounds(curX, curY);
    } else if (type === 'H') {
      const [x] = args;
      if (isRel) { curX += x; } else { curX = x; }
      updateBounds(curX, curY);
    } else if (type === 'V') {
      const [y] = args;
      if (isRel) { curY += y; } else { curY = y; }
      updateBounds(curX, curY);
    } else if (type === 'C') {
      const [x1, y1, x2, y2, x, y] = args;
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
      const [x2, y2, x, y] = args;
      if (isRel) {
        updateBounds(curX + x2, curY + y2);
        curX += x; curY += y;
      } else {
        updateBounds(x2, y2);
        curX = x; curY = y;
      }
      updateBounds(curX, curY);
    } else if (type === 'Q') {
      const [x1, y1, x, y] = args;
      if (isRel) {
        updateBounds(curX + x1, curY + y1);
        curX += x; curY += y;
      } else {
        updateBounds(x1, y1);
        curX = x; curY = y;
      }
      updateBounds(curX, curY);
    } else if (type === 'T') {
      const [x, y] = args;
      if (isRel) { curX += x; curY += y; } else { curX = x; curY = y; }
      updateBounds(curX, curY);
    } else if (type === 'A') {
      const [rx, ry, rot, large, sweep, x, y] = args;
      const endX = isRel ? curX + x : x;
      const endY = isRel ? curY + y : y;

      const arcB = getArcBoundingBoxExact(curX, curY, rx, ry, rot, large, sweep, endX, endY);
      updateBounds(arcB.minX, arcB.minY);
      updateBounds(arcB.maxX, arcB.maxY);

      curX = endX;
      curY = endY;
      updateBounds(curX, curY);
    } else if (type === 'Z') {
      curX = startX;
      curY = startY;
    }
  }

  if (minX === Infinity || maxX === -Infinity) return null;
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

function composeTransforms(tf1, tf2) {
  if (!tf1) return tf2;
  if (!tf2) return tf1;
  return (x, y) => {
    const p = tf2(x, y);
    return tf1(p.x, p.y);
  };
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

  let overallMinX = Infinity, overallMinY = Infinity, overallMaxX = -Infinity, overallMaxY = -Infinity;

  function recordPoint(x, y) {
    if (Number.isFinite(x) && Number.isFinite(y)) {
      if (x < overallMinX) overallMinX = x;
      if (y < overallMinY) overallMinY = y;
      if (x > overallMaxX) overallMaxX = x;
      if (y > overallMaxY) overallMaxY = y;
    }
  }

  function processSnippet(snippet, inheritedTf = null) {
    // 1. Process nested/child groups with their own transforms
    for (const g of snippet.matchAll(/<g\b([^>]*)>([\s\S]*?)<\/g>/gi)) {
      const gAttrs = g[1];
      const gContent = g[2];
      const gTfMatch = gAttrs.match(/\btransform=["']([^"']+)["']/i);
      const gTf = gTfMatch ? parseTransform(gTfMatch[1]) : null;
      const combinedTf = composeTransforms(inheritedTf, gTf);
      processSnippet(gContent, combinedTf);
    }

    // 2. Paths
    for (const p of snippet.matchAll(/<path\b([^>]*)>/gi)) {
      const attrs = p[1];
      const dMatch = attrs.match(/\bd=["']([^"']+)["']/i);
      if (dMatch) {
        const dVal = dMatch[1].trim();
        const isGuidePath = /^M\s*0\s*0\s*h\s*[0-9.]+\s*v\s*[0-9.]+\s*H\s*0[zZ]?$/i.test(dVal);
        const isFillNone = /fill=["'](?:none|transparent)["']/i.test(attrs) && !/stroke=/i.test(attrs);
        if (isGuidePath && isFillNone) continue;

        const tfMatch = attrs.match(/\btransform=["']([^"']+)["']/i);
        const shapeTf = tfMatch ? parseTransform(tfMatch[1]) : null;
        const finalTf = composeTransforms(inheritedTf, shapeTf);
        const b = getPathBoundingBoxExact(dVal, finalTf);
        if (b) {
          if (b.minX < overallMinX) overallMinX = b.minX;
          if (b.minY < overallMinY) overallMinY = b.minY;
          if (b.maxX > overallMaxX) overallMaxX = b.maxX;
          if (b.maxY > overallMaxY) overallMaxY = b.maxY;
        }
      }
    }

    // 3. Rects
    for (const r of snippet.matchAll(/<rect\b([^>]*)>/gi)) {
      const attrs = r[1];
      const isFillNone = (/fill=["'](?:none|transparent)["']/i.test(attrs) || /opacity=["']0["']/i.test(attrs)) && !/stroke=/i.test(attrs);
      if (isFillNone) continue;

      const xMatch = attrs.match(/\bx=["']([0-9.-]+)["']/i);
      const yMatch = attrs.match(/\by=["']([0-9.-]+)["']/i);
      const wMatch = attrs.match(/\bwidth=["']([0-9.-]+)["']/i);
      const hMatch = attrs.match(/\bheight=["']([0-9.-]+)["']/i);
      const x = xMatch ? parseFloat(xMatch[1]) : 0;
      const y = yMatch ? parseFloat(yMatch[1]) : 0;
      const w = wMatch ? parseFloat(wMatch[1]) : 0;
      const h = hMatch ? parseFloat(hMatch[1]) : 0;
      if (w > 0 && h > 0) {
        const tfMatch = attrs.match(/\btransform=["']([^"']+)["']/i);
        const shapeTf = tfMatch ? parseTransform(tfMatch[1]) : null;
        const tfFn = composeTransforms(inheritedTf, shapeTf);
        if (tfFn) {
          const p1 = tfFn(x, y);
          const p2 = tfFn(x + w, y + h);
          recordPoint(p1.x, p1.y);
          recordPoint(p2.x, p2.y);
        } else {
          recordPoint(x, y);
          recordPoint(x + w, y + h);
        }
      }
    }

    // 4. Circles
    for (const c of snippet.matchAll(/<circle\b([^>]*)>/gi)) {
      const attrs = c[1];
      if (/opacity=["']0["']/i.test(attrs)) continue;
      const cxMatch = attrs.match(/\bcx=["']([0-9.-]+)["']/i);
      const cyMatch = attrs.match(/\bcy=["']([0-9.-]+)["']/i);
      const rMatch = attrs.match(/\br=["']([0-9.-]+)["']/i);
      if (rMatch) {
        let cx = cxMatch ? parseFloat(cxMatch[1]) : 0;
        let cy = cyMatch ? parseFloat(cyMatch[1]) : 0;
        const r = parseFloat(rMatch[1]);
        const tfMatch = attrs.match(/\btransform=["']([^"']+)["']/i);
        const shapeTf = tfMatch ? parseTransform(tfMatch[1]) : null;
        const tfFn = composeTransforms(inheritedTf, shapeTf);
        if (tfFn) {
          const pt = tfFn(cx, cy);
          cx = pt.x; cy = pt.y;
        }
        recordPoint(cx - r, cy - r);
        recordPoint(cx + r, cy + r);
      }
    }

    // 5. Ellipses
    for (const e of snippet.matchAll(/<ellipse\b([^>]*)>/gi)) {
      const attrs = e[1];
      if (/opacity=["']0["']/i.test(attrs)) continue;
      const cxMatch = attrs.match(/\bcx=["']([0-9.-]+)["']/i);
      const cyMatch = attrs.match(/\bcy=["']([0-9.-]+)["']/i);
      const rxMatch = attrs.match(/\brx=["']([0-9.-]+)["']/i);
      const ryMatch = attrs.match(/\bry=["']([0-9.-]+)["']/i);
      if (rxMatch && ryMatch) {
        let cx = cxMatch ? parseFloat(cxMatch[1]) : 0;
        let cy = cyMatch ? parseFloat(cyMatch[1]) : 0;
        const rx = parseFloat(rxMatch[1]);
        const ry = parseFloat(ryMatch[1]);
        const tfMatch = attrs.match(/\btransform=["']([^"']+)["']/i);
        const shapeTf = tfMatch ? parseTransform(tfMatch[1]) : null;
        const tfFn = composeTransforms(inheritedTf, shapeTf);
        if (tfFn) {
          const pt = tfFn(cx, cy);
          cx = pt.x; cy = pt.y;
        }
        recordPoint(cx - rx, cy - ry);
        recordPoint(cx + rx, cy + ry);
      }
    }

    // 6. Polygons / Polylines
    for (const poly of snippet.matchAll(/<(?:polygon|polyline)\b([^>]*)>/gi)) {
      const attrs = poly[1];
      if (/opacity=["']0["']/i.test(attrs)) continue;
      const ptsMatch = attrs.match(/\bpoints=["']([^"']+)["']/i);
      if (ptsMatch) {
        const tfMatch = attrs.match(/\btransform=["']([^"']+)["']/i);
        const shapeTf = tfMatch ? parseTransform(tfMatch[1]) : null;
        const tfFn = composeTransforms(inheritedTf, shapeTf);
        const nums = ptsMatch[1].trim().split(/[\s,]+/).map(Number);
        for (let j = 0; j < nums.length; j += 2) {
          let px = nums[j], py = nums[j + 1];
          if (Number.isFinite(px) && Number.isFinite(py)) {
            if (tfFn) {
              const pt = tfFn(px, py);
              px = pt.x; py = pt.y;
            }
            recordPoint(px, py);
          }
        }
      }
    }

    // 7. Lines
    for (const l of snippet.matchAll(/<line\b([^>]*)>/gi)) {
      const attrs = l[1];
      if (/opacity=["']0["']/i.test(attrs)) continue;
      const x1Match = attrs.match(/\bx1=["']([0-9.-]+)["']/i);
      const y1Match = attrs.match(/\by1=["']([0-9.-]+)["']/i);
      const x2Match = attrs.match(/\bx2=["']([0-9.-]+)["']/i);
      const y2Match = attrs.match(/\by2=["']([0-9.-]+)["']/i);
      if (x1Match && y1Match && x2Match && y2Match) {
        let x1 = parseFloat(x1Match[1]), y1 = parseFloat(y1Match[1]);
        let x2 = parseFloat(x2Match[1]), y2 = parseFloat(y2Match[1]);
        const tfMatch = attrs.match(/\btransform=["']([^"']+)["']/i);
        const shapeTf = tfMatch ? parseTransform(tfMatch[1]) : null;
        const tfFn = composeTransforms(inheritedTf, shapeTf);
        if (tfFn) {
          const p1 = tfFn(x1, y1), p2 = tfFn(x2, y2);
          x1 = p1.x; y1 = p1.y; x2 = p2.x; y2 = p2.y;
        }
        recordPoint(x1, y1);
        recordPoint(x2, y2);
      }
    }
  }

  processSnippet(svgText);

  if (overallMinX === Infinity) {
    if (curVb) return `${curVb.x} ${curVb.y} ${curVb.w} ${curVb.h}`;
    return '0 0 24 24';
  }

  // Account for stroke thickness so strokes never clip or exceed boundaries
  const strokeMatch = svgText.match(/\bstroke-width=["']([0-9.]+)["']|\bstroke-width:\s*([0-9.]+)/i);
  const strokeWidth = strokeMatch ? parseFloat(strokeMatch[1] || strokeMatch[2]) : (svgText.includes('stroke=') ? 1.5 : 0);
  const halfStroke = strokeWidth / 2;

  overallMinX -= halfStroke;
  overallMinY -= halfStroke;
  overallMaxX += halfStroke;
  overallMaxY += halfStroke;

  const spanX = overallMaxX - overallMinX;
  const spanY = overallMaxY - overallMinY;
  const maxSpan = Math.max(spanX, spanY);

  if (spanX <= 0 || spanY <= 0 || maxSpan <= 0) {
    if (curVb) return `${curVb.x} ${curVb.y} ${curVb.w} ${curVb.h}`;
    return '0 0 24 24';
  }

  // Calibrated 8% optical breathing padding ensures icons never exceed boundaries and are centered
  const pad = Math.max(maxSpan * 0.08, 1.2);
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

  // 4. Strip hardcoded width & height attributes and artificial display:none on root <svg>
  result = result.replace(/<svg\b([^>]*)>/i, (match, attrs) => {
    let cleanAttrs = attrs
      .replace(/\bwidth=["'][^"']*["']/gi, '')
      .replace(/\bheight=["'][^"']*["']/gi, '')
      .replace(/\bdisplay=["']none["']/gi, '')
      .replace(/\bvisibility=["']hidden["']/gi, '');
    return `<svg width="100%" height="100%" ${cleanAttrs.trim()}>`;
  });

  // 5. Intelligent stroke & fill recovery for unstyled icons without mutating multi-color assets
  const hasVisibleStroke = /stroke=["'](?!none|transparent)[^"']+["']/i.test(result) || /stroke:\s*(?!none|transparent)[^;"]+/i.test(result);
  const hasVisibleFill = /fill=["'](?!none|transparent)[^"']+["']/i.test(result) || /fill:\s*(?!none|transparent)[^;"]+/i.test(result);
  const hasExplicitColor = /#(?:[0-9a-fA-F]{3,8})|rgb\([^)]+\)|rgba\([^)]+\)/i.test(result);
  const hasFillNone = /fill=["']none["']/i.test(result) || /fill:\s*none/i.test(result);

  if (!hasVisibleStroke && !hasVisibleFill && !hasExplicitColor) {
    if (hasFillNone) {
      result = result.replace(/<svg\b([^>]*)>/i, '<svg $1 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">');
    } else {
      result = result.replace(/<svg\b([^>]*)>/i, '<svg $1 fill="currentColor">');
    }
  } else if (hasVisibleStroke && !/stroke-width=/i.test(result) && !/stroke-width:/i.test(result)) {
    result = result.replace(/<svg\b([^>]*)>/i, '<svg $1 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">');
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
