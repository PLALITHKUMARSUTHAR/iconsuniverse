const archiver = require('archiver');

/**
 * Creates and streams a ZIP archive containing the provided icons.
 * @param {Array} icons Array of Icon objects { title, slug, svgContent }
 * @param {string} format Format to output: 'svg' | 'png'
 * @param {Response} res Express response stream
 */
exports.streamIconsZip = (icons, zipFilename, res) => {
  const archive = archiver('zip', {
    zlib: { level: 9 }, // Maximum compression
  });

  res.attachment(`${zipFilename}.zip`);

  archive.on('error', (err) => {
    throw err;
  });

  archive.pipe(res);

  // Add individual SVG files into the archive
  icons.forEach((icon) => {
    const filename = `${icon.slug || icon.title.toLowerCase().replace(/\s+/g, '-')}.svg`;
    const content = icon.svgContent || `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/></svg>`;
    archive.append(content, { name: filename });
  });

  // Include License & Attribution file
  const readmeContent = `IconsUniverse — Asset Download Package
======================================
Downloaded from IconsUniverse (https://iconsuniverse.com)
Total Assets: ${icons.length}

Licensing:
- Free Tier Assets: Attribution required ("Icons by IconsUniverse - https://iconsuniverse.com")
- Pro Tier Assets: Unlimited commercial use, no attribution required.

Thank you for choosing IconsUniverse!`;

  archive.append(readmeContent, { name: 'README-LICENSE.txt' });

  archive.finalize();
};
