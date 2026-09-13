require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function testGetIconSvg() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const Icon = require('../models/Icon');
  const Category = require('../models/Category');

  // Let's test a category with icons
  const cat = await Category.findOne({ slug: 'animals' });
  console.log('Category:', cat.name, cat.slug, cat._id);

  const icons = await Icon.find({ categoryId: cat._id }).limit(30).lean();
  console.log('Found icons:', icons.length);

  const cdnBase = process.env.R2_PUBLIC_URL || 'https://pub-2b1851a9e65c42c095e04c8a758bca43.r2.dev';

  for (const icon of icons) {
    const cleanPath = (icon.path || '').replace(/^\/?icons\//, '').replace(/^\/+/, '');
    const safePath = cleanPath.split('/').map(seg => encodeURIComponent(decodeURIComponent(seg))).join('/');
    const url = `${cdnBase}/icons/${safePath}`;

    const res = await fetch(url);
    if (!res.ok) {
      console.log(`[FAILED ${res.status}] ${icon.title} (path: ${icon.path}) -> ${url}`);
    } else {
      const raw = await res.text();
      // Let's see if normalizeAndFixSvg does anything bad or if raw is good
      console.log(`[OK] ${icon.title}: raw length = ${raw.length}, hasSvg = ${raw.includes('<svg')}`);
    }
  }

  await mongoose.disconnect();
}

testGetIconSvg();
