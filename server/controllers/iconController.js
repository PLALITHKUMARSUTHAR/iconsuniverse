const Icon = require('../models/Icon');
const Category = require('../models/Category');
const Pack = require('../models/Pack');
const Download = require('../models/Download');
const User = require('../models/User');
const { sanitizeSVG, extractColorsFromSVG, svgToDataUrl } = require('../utils/svgSanitizer');

// In-memory vector cache for high-speed serving
const svgCache = new Map();

function parseSvgPathData(d) {
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

function parseTransform(transformStr) {
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

function getPathBoundingBoxExact(d, transformFn = null) {
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

function getCorrectViewBox(svgText) {
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

function normalizeAndFixSvg(svgText) {
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

  return result;
}

// @desc    List/search icons with multi-facet filters
// @route   GET /api/icons
// @access  Public
exports.getIcons = async (req, res, next) => {
  try {
    const { q, category, style, colorType, color, isPremium, sort = 'trending', page = 1, limit = 40 } = req.query;
    const filter = { status: { $ne: 'rejected' } };

    // Text search (title, slug, tags)
    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { title: searchRegex },
        { slug: searchRegex },
        { tags: { $in: [searchRegex] } },
      ];
    }

    // Category filter
    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        filter.categoryId = category;
      } else {
        const cleanCatSlug = category.toLowerCase().trim();
        const cat = await Category.findOne({
          $or: [
            { slug: cleanCatSlug },
            { name: new RegExp(`^${cleanCatSlug.replace(/-/g, ' ')}$`, 'i') },
          ]
        });
        if (cat) {
          filter.categoryId = cat._id;
        } else {
          return res.status(200).json({
            success: true,
            data: {
              icons: [],
              total: 0,
              page: parseInt(page, 10) || 1,
              totalPages: 0,
            },
          });
        }
      }
    }

    // Shape / Style filter
    if (style && style !== 'all') {
      if (style === 'filled') {
        filter.$or = [{ style: 'filled' }, { isFilled: true }];
      } else if (style === 'outline') {
        filter.$or = [{ style: 'outline' }, { isFilled: false, style: { $nin: ['color', 'gradient', '3d'] } }];
      } else if (style === 'color' || style === 'flat') {
        filter.style = { $in: ['color', 'flat', '3d', 'gradient'] };
      } else if (style === 'gradient') {
        filter.style = 'gradient';
      } else if (style === '3d') {
        filter.style = '3d';
      } else {
        filter.style = style;
      }
    }

    // Color Type filter (all | black | gradient | colors)
    if (colorType && colorType !== 'all') {
      if (colorType === 'black') {
        filter.style = { $in: ['outline', 'filled'] };
      } else if (colorType === 'gradient') {
        filter.style = 'gradient';
      } else if (colorType === 'colors') {
        filter.style = { $in: ['color', 'flat', '3d'] };
      }
    }

    // Premium filter
    if (isPremium !== undefined && isPremium !== '') {
      filter.isPremium = isPremium === 'true' || isPremium === true;
    }

    // Color filter
    if (color) {
      filter.colors = { $in: [color.toLowerCase()] };
    }

    // Sorting: consistent predictable style clustering
    let sortQuery = { isFilled: 1, style: 1, downloadCount: -1, _id: 1 };
    if (style === 'outline') {
      sortQuery = { isFilled: 1, style: 1, downloadCount: -1, _id: 1 };
    } else if (style === 'color' || style === 'flat') {
      sortQuery = { style: 1, downloadCount: -1, _id: 1 };
    } else if (style === 'filled') {
      sortQuery = { isFilled: -1, downloadCount: -1, _id: 1 };
    } else if (sort === 'recent') {
      sortQuery = { _id: -1 };
    } else if (sort === 'downloads') {
      sortQuery = { downloadCount: -1, _id: 1 };
    } else if (sort === 'title') {
      sortQuery = { title: 1, _id: 1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 40, 100);
    const skip = (pageNum - 1) * limitNum;

    let [rawIcons, total] = await Promise.all([
      Icon.find(filter)
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum)
        .populate('categoryId', 'name slug')
        .populate('packId', 'title slug')
        .select('title slug path isFilled isPremium style tags downloadCount colors categoryId packId')
        .lean(),
      Icon.countDocuments(filter),
    ]);

    // Fallback: If style filter yielded 0 icons in this category, relax the style filter so user always gets icons
    if (total === 0 && style && style !== 'all') {
      delete filter.$or;
      delete filter.style;
      [rawIcons, total] = await Promise.all([
        Icon.find(filter)
          .sort(sortQuery)
          .skip(skip)
          .limit(limitNum)
          .populate('categoryId', 'name slug')
          .populate('packId', 'title slug')
          .select('title slug path isFilled isPremium style tags downloadCount colors categoryId packId')
          .lean(),
        Icon.countDocuments(filter),
      ]);
    }

    const cdnBase = process.env.R2_PUBLIC_URL || 'https://pub-2b1851a9e65c42c095e04c8a758bca43.r2.dev';
    const icons = rawIcons.map((icon) => {
      const safePath = icon.path ? icon.path.split('/').map(encodeURIComponent).join('/') : null;
      const r2Url = safePath ? `${cdnBase}/icons/${safePath}` : null;
      const proxyUrl = `/api/icons/svg/${icon._id}`;
      return {
        ...icon,
        svgUrl: proxyUrl,
        r2Url: r2Url,
        pngPreviewUrl: proxyUrl,
      };
    });

    res.set('Cache-Control', 'public, max-age=600, stale-while-revalidate=86400');
    res.status(200).json({
      success: true,
      data: {
        icons,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Serve normalized, unclipped SVG vector with CORS enabled & high cache performance
// @route   GET /api/icons/svg/:id
// @access  Public
exports.getIconSvg = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check in-memory cache first
    if (svgCache.has(id)) {
      res.set('Content-Type', 'image/svg+xml');
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
      return res.send(svgCache.get(id));
    }

    let icon;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      icon = await Icon.findById(id).select('path title');
    } else {
      icon = await Icon.findOne({ slug: id }).select('path title');
    }

    if (!icon || !icon.path) {
      return res.status(404).send('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"></svg>');
    }

    const cdnBase = process.env.R2_PUBLIC_URL || 'https://pub-2b1851a9e65c42c095e04c8a758bca43.r2.dev';
    const cleanPath = icon.path.replace(/^\/?icons\//, '').replace(/^\/+/, '');
    const safePath = cleanPath.split('/').map(seg => encodeURIComponent(decodeURIComponent(seg))).join('/');
    const url = `${cdnBase}/icons/${safePath}`;

    let upstreamRes = await fetch(url);
    if (!upstreamRes.ok && cleanPath !== icon.path) {
      const fallbackUrl = `${cdnBase}/icons/${icon.path.split('/').map(encodeURIComponent).join('/')}`;
      upstreamRes = await fetch(fallbackUrl);
    }

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).send('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"></svg>');
    }

    const rawSvg = await upstreamRes.text();
    const normalized = normalizeAndFixSvg(rawSvg);

    // Cache in memory (cap at 10,000 items)
    if (svgCache.size > 10000) {
      const firstKey = svgCache.keys().next().value;
      svgCache.delete(firstKey);
    }
    svgCache.set(id, normalized);

    res.set('Content-Type', 'image/svg+xml');
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    return res.send(normalized);
  } catch (err) {
    next(err);
  }
};

// @desc    Get single icon by slug
// @route   GET /api/icons/:slug
// @access  Public
exports.getIconBySlug = async (req, res, next) => {
  try {
    const iconDoc = await Icon.findOne({ slug: req.params.slug, status: { $ne: 'rejected' } })
      .populate('categoryId', 'name slug iconThumbnailUrl')
      .populate('packId', 'title slug description coverImageUrl iconCount isPremium')
      .populate('contributorId', 'name avatarUrl');

    if (!iconDoc) {
      return res.status(404).json({ success: false, message: 'Icon not found' });
    }

    const cdnBase = process.env.R2_PUBLIC_URL || 'https://pub-2b1851a9e65c42c095e04c8a758bca43.r2.dev';
    const safePath = iconDoc.path ? iconDoc.path.split('/').map(encodeURIComponent).join('/') : null;
    const r2Url = safePath ? `${cdnBase}/icons/${safePath}` : null;
    const proxyUrl = `/api/icons/svg/${iconDoc._id}`;

    const icon = {
      ...iconDoc.toJSON(),
      svgUrl: proxyUrl,
      r2Url: r2Url,
      pngPreviewUrl: proxyUrl,
    };

    // Related icons in same category
    const rawRelated = await Icon.find({
      categoryId: iconDoc.categoryId,
      _id: { $ne: iconDoc._id },
      status: { $ne: 'rejected' },
    })
      .limit(12)
      .select('title slug path isPremium style')
      .lean();

    const related = rawRelated.map((rel) => {
      const relSafePath = rel.path ? rel.path.split('/').map(encodeURIComponent).join('/') : null;
      return {
        ...rel,
        svgUrl: `/api/icons/svg/${rel._id}`,
        r2Url: relSafePath ? `${cdnBase}/icons/${relSafePath}` : null,
        pngPreviewUrl: `/api/icons/svg/${rel._id}`,
      };
    });

    res.status(200).json({
      success: true,
      data: { icon, related },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Download an icon in SVG / PNG / EPS / Base64 format
// @route   GET /api/icons/:id/download
// @access  Public (rate-limited for free users)
exports.downloadIcon = async (req, res, next) => {
  try {
    const { format = 'svg', size = 512 } = req.query;
    const icon = await Icon.findById(req.params.id);

    if (!icon) {
      return res.status(404).json({ success: false, message: 'Icon not found' });
    }

    const user = req.user;
    const isPro = user && (user.plan === 'pro_monthly' || user.plan === 'pro_annual');

    // Premium asset check
    if (icon.isPremium && !isPro) {
      return res.status(403).json({
        success: false,
        message: 'This is a Pro asset. Upgrade your subscription to unlock unlimited access.',
        isPremiumLocked: true,
      });
    }

    // Daily limit check for non-Pro users
    if (user && !isPro) {
      if (user.downloadCountToday >= 20) {
        return res.status(403).json({
          success: false,
          message: 'Daily download quota of 20 icons reached. Upgrade to Pro for unlimited downloads!',
          isLimitReached: true,
        });
      }
      user.downloadCountToday += 1;
      await user.save();
    }

    // Increment denormalized counter & create download log
    icon.downloadCount += 1;
    await icon.save();

    await Download.create({
      userId: user ? user._id : null,
      iconId: icon._id,
      format,
      resolution: format === 'png' ? parseInt(size, 10) : null,
      ipAddress: req.ip,
    });

    const filename = `${icon.slug || 'icon'}.${format === 'base64' ? 'json' : format}`;

    let svgData = icon.svgContent;
    if (!svgData && icon.svgUrl) {
      try {
        const fetchRes = await fetch(icon.svgUrl);
        if (fetchRes.ok) {
          svgData = await fetchRes.text();
        }
      } catch (e) {}
    }

    if (format === 'base64') {
      const dataUri = svgData ? svgToDataUrl(svgData) : '';
      return res.status(200).json({
        success: true,
        data: {
          title: icon.title,
          format: 'base64',
          dataUri,
          svgContent: svgData,
        },
      });
    }

    if (format === 'svg') {
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(svgData || '');
    }

    // Fallback: return SVG
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(svgData || '');
  } catch (err) {
    next(err);
  }
};

// @desc    Upload / create a new icon
// @route   POST /api/icons
// @access  Private (Contributor / Admin)
exports.createIcon = async (req, res, next) => {
  try {
    const { title, categoryId, style, tags, packId, isPremium, svgContent } = req.body;

    let cleanSvg = svgContent;
    if (req.file) {
      cleanSvg = req.file.buffer.toString('utf8');
    }

    if (!cleanSvg || !title || !categoryId) {
      return res.status(400).json({ success: false, message: 'Please provide SVG file/content, title, and category' });
    }

    const sanitized = sanitizeSVG(cleanSvg);
    const colors = extractColorsFromSVG(sanitized);
    const dataUrl = svgToDataUrl(sanitized);
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);

    const parsedTags = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim().toLowerCase()) : []);

    const icon = await Icon.create({
      title,
      slug,
      svgContent: sanitized,
      svgUrl: dataUrl,
      pngPreviewUrl: dataUrl,
      tags: parsedTags,
      categoryId,
      packId: packId || null,
      style: style || 'outline',
      colors,
      isPremium: isPremium === true || isPremium === 'true',
      contributorId: req.user.id,
      status: req.user.role === 'admin' ? 'approved' : 'pending',
    });

    res.status(201).json({ success: true, data: icon });
  } catch (err) {
    next(err);
  }
};

// @desc    Update icon
// @route   PUT /api/icons/:id
// @access  Private (Owner / Admin)
exports.updateIcon = async (req, res, next) => {
  try {
    const icon = await Icon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!icon) return res.status(404).json({ success: false, message: 'Icon not found' });
    res.status(200).json({ success: true, data: icon });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete icon
// @route   DELETE /api/icons/:id
// @access  Private (Owner / Admin)
exports.deleteIcon = async (req, res, next) => {
  try {
    const icon = await Icon.findByIdAndDelete(req.params.id);
    if (!icon) return res.status(404).json({ success: false, message: 'Icon not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
