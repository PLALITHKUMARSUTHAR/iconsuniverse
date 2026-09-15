import JSZip from 'jszip';
import {
  fetchAndCacheSvg,
  getCachedSvg,
  normalizeSvgForCanvas,
  recolorSvg,
  getDirectR2Url,
  getSafeIconUrl,
} from '../services/svgCacheService';
import api from '../services/api';

const CDN_BASE = 'https://pub-2b1851a9e65c42c095e04c8a758bca43.r2.dev';

/**
 * Triggers native browser file download of a Blob or URL
 */
export function triggerBrowserDownload(blobOrUrl, filename) {
  const isUrl = typeof blobOrUrl === 'string';
  const url = isUrl ? blobOrUrl : URL.createObjectURL(blobOrUrl);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  if (!isUrl) {
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }
}

/**
 * Ensures root SVG has valid namespaces, explicit width/height, viewBox,
 * and solid visible colors (replaces invisible currentColor).
 */
export function prepareSvgForExport(rawSvg, options = {}) {
  if (!rawSvg || typeof rawSvg !== 'string') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512"></svg>`;
  }

  const targetSize = options.size || 512;
  const targetColor = options.color || '#1e293b';
  let svg = rawSvg.trim();

  // 1. Recolor if color option is provided and not using original color
  if (options.useOriginalColor === false && options.color) {
    svg = recolorSvg(svg, options.color);
  }

  // 2. Replace any remaining currentColor with visible target color
  svg = svg.replace(/currentColor/gi, targetColor);

  // 3. Extract existing viewBox or compute from width/height
  const vbMatch = svg.match(/viewBox=["']([^"']+)["']/i);
  let viewBox = vbMatch ? vbMatch[1] : null;

  if (!viewBox) {
    const wMatch = svg.match(/width=["']([0-9.]+)["']/i);
    const hMatch = svg.match(/height=["']([0-9.]+)["']/i);
    if (wMatch && hMatch) {
      viewBox = `0 0 ${wMatch[1]} ${hMatch[1]}`;
    } else {
      viewBox = '0 0 512 512';
    }
  }

  // 4. Ensure xmlns namespace
  if (!svg.includes('xmlns="http://www.w3.org/2000/svg"')) {
    svg = svg.replace(/<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  // 5. Handle backdrop shape and transforms if specified
  const shape = options.shape || 'none';
  const rotation = options.rotation || 0;
  const flipH = options.flipH || false;
  const flipV = options.flipV || false;

  if (shape !== 'none' || rotation || flipH || flipV) {
    const opacity = (options.badgeOpacity ?? 100) / 100;
    const badgeColor = options.badgeColor || '#f4f3fa';
    let bgElement = '';
    let innerScale = shape === 'none' ? 0.88 : 0.72;

    if (shape === 'circle') {
      bgElement = `<circle cx="${targetSize / 2}" cy="${targetSize / 2}" r="${targetSize / 2}" fill="${badgeColor}" fill-opacity="${opacity}" />`;
      innerScale = 0.58;
    } else if (shape === 'rounded') {
      const rx = targetSize * 0.22;
      bgElement = `<rect x="0" y="0" width="${targetSize}" height="${targetSize}" rx="${rx}" fill="${badgeColor}" fill-opacity="${opacity}" />`;
      innerScale = 0.66;
    } else if (shape === 'hexagon') {
      const p1 = `${targetSize * 0.5},0`;
      const p2 = `${targetSize * 0.933},${targetSize * 0.25}`;
      const p3 = `${targetSize * 0.933},${targetSize * 0.75}`;
      const p4 = `${targetSize * 0.5},${targetSize}`;
      const p5 = `${targetSize * 0.067},${targetSize * 0.75}`;
      const p6 = `${targetSize * 0.067},${targetSize * 0.25}`;
      bgElement = `<polygon points="${p1} ${p2} ${p3} ${p4} ${p5} ${p6}" fill="${badgeColor}" fill-opacity="${opacity}" />`;
      innerScale = 0.54;
    }

    const iconSize = targetSize * innerScale;
    const offset = (targetSize - iconSize) / 2;
    const sx = flipH ? -1 : 1;
    const sy = flipV ? -1 : 1;

    let transformAttr = '';
    if (rotation || sx !== 1 || sy !== 1) {
      transformAttr = `transform="translate(${targetSize / 2}, ${targetSize / 2}) rotate(${rotation}) scale(${sx}, ${sy}) translate(-${targetSize / 2}, -${targetSize / 2})"`;
    }

    const innerBody = svg.replace(/<svg\b[^>]*>/i, '').replace(/<\/svg>/i, '');

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${targetSize} ${targetSize}" width="${targetSize}" height="${targetSize}">
  ${bgElement}
  <g ${transformAttr}>
    <svg x="${offset}" y="${offset}" width="${iconSize}" height="${iconSize}" viewBox="${viewBox}">
      ${innerBody}
    </svg>
  </g>
</svg>`;
  }

  // 6. Enforce explicit width, height, and viewBox on root <svg>
  svg = svg.replace(/<svg\b([^>]*)>/i, (match, attrs) => {
    let cleanAttrs = attrs
      .replace(/\bwidth=["'][^"']*["']/gi, '')
      .replace(/\bheight=["'][^"']*["']/gi, '')
      .replace(/\bviewBox=["'][^"']*["']/gi, '')
      .trim();
    return `<svg ${cleanAttrs} width="${targetSize}" height="${targetSize}" viewBox="${viewBox}">`;
  });

  if (!svg.startsWith('<?xml')) {
    svg = `<?xml version="1.0" encoding="UTF-8"?>\n` + svg;
  }

  return svg;
}

/**
 * Converts vector SVG XML to a crisp PNG Blob using HTML5 Canvas
 */
export async function renderSvgToPngBlob(svgString, resolution = 512) {
  const preparedSvg = prepareSvgForExport(svgString, { size: resolution });
  const base64Svg = btoa(unescape(encodeURIComponent(preparedSvg)));
  const dataUrl = `data:image/svg+xml;base64,${base64Svg}`;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = resolution;
        canvas.height = resolution;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to create canvas 2D context'));
          return;
        }

        // Clean transparent canvas
        ctx.clearRect(0, 0, resolution, resolution);
        ctx.drawImage(img, 0, 0, resolution, resolution);

        canvas.toBlob((blob) => {
          if (blob && blob.size > 0) {
            resolve(blob);
          } else {
            reject(new Error('Canvas generated empty PNG blob'));
          }
        }, 'image/png');
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load SVG into raster image element'));
    };

    img.src = dataUrl;
  });
}

/**
 * Fetches SVG vector content for an icon with multi-tier failovers
 */
export async function fetchIconSvgContent(icon) {
  if (!icon) return null;

  // 1. Inlined svgContent
  if (icon.svgContent && icon.svgContent.includes('<svg')) {
    return normalizeSvgForCanvas(icon.svgContent, icon._id || icon.slug);
  }

  const iconId = icon._id || icon.slug;

  // 2. Synchronous in-memory / session storage cache
  const cached = getCachedSvg(iconId);
  if (cached && cached.includes('<svg')) {
    return cached;
  }

  // 3. Direct R2 CDN URL & Proxy URL
  const directCdnUrl = icon.r2Url || getDirectR2Url(icon);
  const proxyUrl = icon.svgUrl ? getSafeIconUrl(icon.svgUrl) : (icon._id ? `/api/icons/svg/${icon._id}` : '');

  const primaryUrl = directCdnUrl || proxyUrl;
  const secondaryUrl = proxyUrl && proxyUrl !== primaryUrl ? proxyUrl : directCdnUrl;

  if (primaryUrl) {
    const fetched = await fetchAndCacheSvg(primaryUrl, iconId, secondaryUrl);
    if (fetched && fetched.includes('<svg')) {
      return fetched;
    }
  }

  // 4. Fallback: manual fetch from R2 path
  if (icon.path) {
    const cleanPath = icon.path.replace(/^\/?icons\//, '').replace(/^\/+/, '');
    const safePath = cleanPath.split('/').map(seg => encodeURIComponent(decodeURIComponent(seg))).join('/');
    const directUrl = `${CDN_BASE}/icons/${safePath}`;
    try {
      const res = await fetch(directUrl);
      if (res.ok) {
        const text = await res.text();
        if (text && text.includes('<svg')) {
          return normalizeSvgForCanvas(text, iconId);
        }
      }
    } catch (e) {}
  }

  // 5. Fallback: server proxy
  if (icon._id) {
    try {
      const res = await fetch(`/api/icons/svg/${icon._id}`);
      if (res.ok) {
        const text = await res.text();
        if (text && text.includes('<svg')) {
          return normalizeSvgForCanvas(text, iconId);
        }
      }
    } catch (e) {}
  }

  return null;
}

/**
 * Downloads a SINGLE icon directly as .svg or .png (NEVER a zip file).
 */
export async function downloadSingleIcon({
  icon,
  format = 'svg',
  size = 512,
  customOptions = null,
}) {
  if (!icon) throw new Error('No icon provided for download');

  const rawSvg = await fetchIconSvgContent(icon);
  if (!rawSvg) {
    throw new Error(`Failed to load vector content for icon "${icon.title || icon.slug}"`);
  }

  const slug = (icon.slug || icon.title || 'icon')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const targetSize = parseInt(size, 10) || 512;
  const normalizedFormat = (format || 'svg').toLowerCase();

  if (normalizedFormat === 'svg') {
    const preparedSvg = prepareSvgForExport(rawSvg, {
      size: targetSize,
      ...customOptions,
    });
    const blob = new Blob([preparedSvg], { type: 'image/svg+xml;charset=utf-8' });
    triggerBrowserDownload(blob, `${slug}.svg`);
  } else if (normalizedFormat === 'png') {
    const pngBlob = await renderSvgToPngBlob(rawSvg, targetSize);
    triggerBrowserDownload(pngBlob, `${slug}-${targetSize}px.png`);
  } else if (normalizedFormat === 'base64') {
    const preparedSvg = prepareSvgForExport(rawSvg, {
      size: targetSize,
      ...customOptions,
    });
    const base64Svg = btoa(unescape(encodeURIComponent(preparedSvg)));
    const dataUri = `data:image/svg+xml;base64,${base64Svg}`;
    return { dataUri, svgContent: preparedSvg };
  } else if (normalizedFormat === 'eps') {
    // Generate EPS vector wrapper
    const preparedSvg = prepareSvgForExport(rawSvg, {
      size: targetSize,
      ...customOptions,
    });
    const epsHeader = `%!PS-Adobe-3.0 EPSF-3.0\n%%BoundingBox: 0 0 ${targetSize} ${targetSize}\n%%Title: ${slug}.eps\n%%Creator: IconsUniverse Vector Engine\n%%Pages: 1\n%%EndComments\n`;
    const epsBlob = new Blob([epsHeader + preparedSvg], { type: 'application/postscript' });
    triggerBrowserDownload(epsBlob, `${slug}.eps`);
  } else {
    // Fallback: SVG
    const preparedSvg = prepareSvgForExport(rawSvg, {
      size: targetSize,
      ...customOptions,
    });
    const blob = new Blob([preparedSvg], { type: 'image/svg+xml;charset=utf-8' });
    triggerBrowserDownload(blob, `${slug}.svg`);
  }

  // Record download count & daily quota asynchronously in backend
  if (icon._id) {
    try {
      api.get(`/icons/${icon._id}/download`, {
        params: {
          format: normalizedFormat,
          size: targetSize,
          trackOnly: 'true',
        },
      }).catch(() => {});
    } catch (e) {}
  }

  return { success: true, format: normalizedFormat, size: targetSize };
}

/**
 * Downloads a BULK set of icons packaged inside a ZIP file.
 * Contains only .svg or .png according to user selection.
 */
export async function downloadBulkIconsZip({
  icons = [],
  format = 'svg',
  resolution = 512,
  customMap = {},
  bundleName = 'icons-bundle',
  onProgress = null,
}) {
  if (!icons || icons.length === 0) {
    throw new Error('No icons selected for bulk download');
  }

  const zip = new JSZip();
  const folderName = bundleName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const folder = zip.folder(folderName);
  const normalizedFormat = (format || 'svg').toLowerCase();
  const resSize = parseInt(resolution, 10) || 512;

  let completed = 0;

  for (const icon of icons) {
    const id = icon._id || icon.slug;
    const slug = (icon.slug || icon.title || `icon-${completed + 1}`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const custom = customMap[id] || {};
    const rawSvg = await fetchIconSvgContent(icon);

    if (rawSvg) {
      if (normalizedFormat === 'png') {
        const preparedSvg = prepareSvgForExport(rawSvg, {
          ...custom,
          size: resSize,
        });
        try {
          const pngBlob = await renderSvgToPngBlob(preparedSvg, resSize);
          folder.file(`${slug}-${resSize}px.png`, pngBlob);
        } catch (err) {
          // If canvas fails on edge-case, fallback to SVG with warning
          folder.file(`${slug}.svg`, preparedSvg);
        }
      } else {
        const preparedSvg = prepareSvgForExport(rawSvg, {
          ...custom,
          size: 512,
        });
        folder.file(`${slug}.svg`, preparedSvg);
      }
    }

    completed++;
    if (onProgress) {
      onProgress({ current: completed, total: icons.length });
    }
  }

  // Include License & Attribution file
  const readmeContent = `IconsUniverse Download Package
======================================
Downloaded from IconsUniverse (https://iconsuniverse.com)
Total Assets: ${completed} icons
Selected Format: ${normalizedFormat.toUpperCase()}
Resolution: ${normalizedFormat === 'png' ? `${resSize}x${resSize}px` : 'Scalable Vector'}

Licensing:
- Free Tier Assets: Attribution required ("Icons by IconsUniverse - https://iconsuniverse.com")
- Pro Tier Assets: Unlimited commercial use, no attribution required.

Thank you for using IconsUniverse!`;

  folder.file('README-LICENSE.txt', readmeContent);

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  triggerBrowserDownload(zipBlob, `${folderName}-${normalizedFormat}-bundle.zip`);

  return { success: true, count: completed, format: normalizedFormat };
}
