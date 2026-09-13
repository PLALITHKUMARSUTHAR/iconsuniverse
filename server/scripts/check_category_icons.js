require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function testAllCategories() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas');

  const Icon = require('../models/Icon');
  const Category = require('../models/Category');

  // Let's import the actual getIcons logic or test categories
  const categories = await Category.find().lean();
  console.log(`Checking ${categories.length} categories...`);

  const cdnBase = process.env.R2_PUBLIC_URL || 'https://pub-2b1851a9e65c42c095e04c8a758bca43.r2.dev';

  let totalEmptyFound = 0;

  for (const cat of categories) {
    // Find the first 20 icons in this category, just like getIcons does
    const icons = await Icon.find({ categoryId: cat._id, status: { $ne: 'rejected' } })
      .sort({ downloadCount: -1, _id: 1 })
      .limit(30)
      .select('title slug path isFilled style')
      .lean();

    if (icons.length === 0) {
      console.log(`[EMPTY CATEGORY] Category "${cat.name}" (slug: ${cat.slug}) has 0 icons!`);
      continue;
    }

    // Check each icon's SVG
    for (const icon of icons) {
      const cleanPath = (icon.path || '').replace(/^\/?icons\//, '').replace(/^\/+/, '');
      const safePath = cleanPath.split('/').map(seg => encodeURIComponent(decodeURIComponent(seg))).join('/');
      const url = `${cdnBase}/icons/${safePath}`;

      try {
        const res = await fetch(url);
        if (!res.ok) {
          console.log(`[BROKEN URL ${res.status}] Cat: "${cat.name}" | Icon: "${icon.title}" | url: ${url}`);
          totalEmptyFound++;
          continue;
        }
        const svg = await res.text();
        
        // Let's analyze the SVG:
        // 1. Is it empty?
        if (!svg || svg.trim().length === 0) {
          console.log(`[ZERO LENGTH] Cat: "${cat.name}" | Icon: "${icon.title}"`);
          totalEmptyFound++;
          continue;
        }

        // 2. Does it have 0 visible graphic elements?
        const hasGraphics = /<(path|circle|rect|polygon|polyline|line|ellipse|g|image|text)\b/i.test(svg);
        if (!hasGraphics) {
          console.log(`[NO GRAPHICS] Cat: "${cat.name}" | Icon: "${icon.title}" | SVG: ${svg.slice(0, 100)}`);
          totalEmptyFound++;
          continue;
        }

        // 3. Check if all paths have d="" or empty
        const paths = [...svg.matchAll(/<path\b([^>]*)>/gi)];
        if (paths.length > 0) {
          const allPathsEmpty = paths.every(p => {
            const d = p[1].match(/\bd=["']([^"']*)["']/i);
            return !d || !d[1].trim();
          });
          const hasOtherShapes = /<(circle|rect|polygon|polyline|line|ellipse|image|text)\b/i.test(svg);
          if (allPathsEmpty && !hasOtherShapes) {
            console.log(`[EMPTY PATHS] Cat: "${cat.name}" | Icon: "${icon.title}"`);
            totalEmptyFound++;
            continue;
          }
        }

        // 4. Check viewBox or width/height
        const vbMatch = svg.match(/viewBox=["']([^"']+)["']/i);
        if (vbMatch) {
          const parts = vbMatch[1].trim().split(/[\s,]+/).map(Number);
          if (parts.length === 4 && (parts[2] <= 0 || parts[3] <= 0)) {
            console.log(`[ZERO VIEWBOX] Cat: "${cat.name}" | Icon: "${icon.title}" | vb: ${vbMatch[1]}`);
            totalEmptyFound++;
            continue;
          }
        }

        // 5. Check if it's all white or transparent or hidden
        // In client or server normalization, does normalizeAndFixSvg break it?
      } catch (err) {
        console.log(`[FETCH FAILED] Cat: "${cat.name}" | Icon: "${icon.title}" | error: ${err.message}`);
        totalEmptyFound++;
      }
    }
  }

  console.log(`\nDONE. Total empty/broken icons found in top 30 of all categories: ${totalEmptyFound}`);
  await mongoose.disconnect();
}

testAllCategories();
