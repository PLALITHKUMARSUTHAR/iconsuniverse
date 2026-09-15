const archiver = require('archiver');

const CDN_BASE = process.env.R2_PUBLIC_URL || 'https://pub-2b1851a9e65c42c095e04c8a758bca43.r2.dev';

async function fetchSvgForIcon(icon) {
  if (icon.svgContent && icon.svgContent.includes('<svg')) {
    return icon.svgContent;
  }
  if (icon.path) {
    const cleanPath = icon.path.replace(/^\/?icons\//, '').replace(/^\/+/, '');
    const safePath = cleanPath.split('/').map((seg) => encodeURIComponent(decodeURIComponent(seg))).join('/');
    const url = `${CDN_BASE}/icons/${safePath}`;
    try {
      let upstreamRes = await fetch(url);
      if (!upstreamRes.ok && cleanPath !== icon.path) {
        const fallbackUrl = `${CDN_BASE}/icons/${icon.path.split('/').map(encodeURIComponent).join('/')}`;
        upstreamRes = await fetch(fallbackUrl);
      }
      if (upstreamRes.ok) {
        const text = await upstreamRes.text();
        if (text && text.includes('<svg')) {
          return text;
        }
      }
    } catch (e) {}
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`;
}

/**
 * Creates and streams a ZIP archive containing the provided icons.
 * @param {Array} icons Array of Icon objects { title, slug, path, svgContent }
 * @param {string} zipFilename Output ZIP archive filename
 * @param {Response} res Express response stream
 */
exports.streamIconsZip = async (icons, zipFilename, res) => {
  const archive = archiver('zip', {
    zlib: { level: 9 }, // Maximum compression
  });

  res.attachment(`${zipFilename}.zip`);

  archive.on('error', (err) => {
    console.error('Archive streaming error:', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Archive generation failed' });
    }
  });

  archive.pipe(res);

  // Fetch all icon SVGs in parallel
  const iconContents = await Promise.all(
    icons.map(async (icon) => {
      const content = await fetchSvgForIcon(icon);
      const slug = (icon.slug || icon.title || 'icon')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      return { slug, content };
    })
  );

  // Add individual SVG files into the archive
  iconContents.forEach(({ slug, content }) => {
    archive.append(content, { name: `${slug}.svg` });
  });

  await archive.finalize();
};
