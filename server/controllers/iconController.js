const Icon = require('../models/Icon');
const Category = require('../models/Category');
const Pack = require('../models/Pack');
const Download = require('../models/Download');
const User = require('../models/User');
const { sanitizeSVG, extractColorsFromSVG, svgToDataUrl } = require('../utils/svgSanitizer');

// In-memory vector cache for high-speed serving
const svgCache = new Map();

function getPathBoundingBox(d) {
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

function getCorrectViewBox(svgText) {
  const vbMatch = svgText.match(/viewBox=["']([^"']+)["']/i);
  let curVb = null;
  if (vbMatch) {
    const parts = vbMatch[1].trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
      curVb = { x: parts[0], y: parts[1], w: parts[2], h: parts[3] };
    }
  }

  // Extract all shapes: path, circle, rect, polygon, polyline, line
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
    const safePath = icon.path.split('/').map(encodeURIComponent).join('/');
    const url = `${cdnBase}/icons/${safePath}`;

    const upstreamRes = await fetch(url);
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
