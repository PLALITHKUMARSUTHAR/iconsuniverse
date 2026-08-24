const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

/**
 * Sanitizes raw SVG markup to prevent XSS.
 */
exports.sanitizeSVG = (rawSvg) => {
  if (!rawSvg) return '';
  return DOMPurify.sanitize(rawSvg, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_ATTR: ['viewBox', 'xmlns', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'd', 'style', 'class'],
  });
};

/**
 * Extracts unique hex and rgb color values present in an SVG string.
 */
exports.extractColorsFromSVG = (svgContent) => {
  if (!svgContent) return [];
  const colorMatches = svgContent.match(/#([0-9a-fA-F]{3,8})|rgb\([^)]+\)/gi) || [];
  const uniqueColors = [...new Set(colorMatches.map(c => c.toLowerCase()))];
  return uniqueColors;
};

/**
 * Generates an optimized Data URL from SVG markup.
 */
exports.svgToDataUrl = (svgContent) => {
  if (!svgContent) return '';
  const base64 = Buffer.from(svgContent).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
};
