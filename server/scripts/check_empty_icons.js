require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    const Icon = require('../models/Icon');
    const Category = require('../models/Category');

    const totalIcons = await Icon.countDocuments();
    console.log('Total icons in DB:', totalIcons);

    const categories = await Category.find().lean();
    console.log('Total categories in DB:', categories.length);

    // Check categories with icon count
    const catCounts = [];
    for (const cat of categories) {
      const count = await Icon.countDocuments({ categoryId: cat._id });
      catCounts.push({ name: cat.name, slug: cat.slug, count, id: cat._id });
    }
    catCounts.sort((a, b) => a.count - b.count);
    console.log('Categories with lowest icon counts (first 10):');
    console.log(catCounts.slice(0, 10));

    // Check for icons with null, empty, or strange path
    const emptyPath = await Icon.countDocuments({ $or: [{ path: null }, { path: '' }, { path: { $exists: false } }] });
    console.log('Icons with empty or null path:', emptyPath);

    // Let's test icons from several categories by fetching their SVG through getIconSvg logic and R2 CDN logic
    const cdnBase = process.env.R2_PUBLIC_URL || 'https://pub-2b1851a9e65c42c095e04c8a758bca43.r2.dev';
    
    // Sample 100 icons across categories
    const sample = await Icon.find().limit(100).select('title slug path categoryId style').lean();
    let broken = 0;
    for (const icon of sample) {
      const cleanPath = (icon.path || '').replace(/^\/?icons\//, '').replace(/^\/+/, '');
      const safePath = cleanPath.split('/').map(seg => encodeURIComponent(decodeURIComponent(seg))).join('/');
      const url = `${cdnBase}/icons/${safePath}`;
      try {
        const res = await fetch(url);
        if (!res.ok) {
          console.log(`[BROKEN ${res.status}] Icon: ${icon.title} (slug: ${icon.slug}) | path: ${icon.path} | url: ${url}`);
          broken++;
        } else {
          const text = await res.text();
          if (!text || text.trim().length === 0 || !text.includes('<svg') || text.includes('<svg></svg>')) {
            console.log(`[EMPTY CONTENT] Icon: ${icon.title} (slug: ${icon.slug}) | length: ${text.length}`);
            broken++;
          }
        }
      } catch (err) {
        console.log(`[FETCH ERR] Icon: ${icon.title}: ${err.message}`);
        broken++;
      }
    }
    console.log(`Sample 100 test: broken/empty = ${broken}`);

    await mongoose.disconnect();
  } catch (e) {
    console.error('Error:', e);
  }
}

test();
