require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function testAllCategoryQueries() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const { getIcons } = require('../controllers/iconController');
  const Category = require('../models/Category');
  const categories = await Category.find().lean();

  console.log(`Testing ${categories.length} categories...`);

  let categoriesWithZeroIcons = [];
  let categoriesWithBrokenIcons = [];

  const cdnBase = process.env.R2_PUBLIC_URL || 'https://pub-2b1851a9e65c42c095e04c8a758bca43.r2.dev';

  for (const cat of categories) {
    const req = {
      query: {
        category: cat.slug,
        limit: 30,
        sort: 'trending',
      }
    };

    let resultData = null;
    const res = {
      set: () => {},
      status: () => ({
        json: (payload) => { resultData = payload; }
      })
    };

    await getIcons(req, res, (err) => { console.error('Error in getIcons:', err); });

    if (!resultData || !resultData.data || !resultData.data.icons || resultData.data.icons.length === 0) {
      console.log(`[ZERO RESULTS] Category: ${cat.name} (${cat.slug}) -> 0 icons returned!`);
      categoriesWithZeroIcons.push(cat.slug);
      continue;
    }

    const icons = resultData.data.icons;
    // Check first 5 icons of this category
    for (const icon of icons.slice(0, 5)) {
      const cleanPath = (icon.path || '').replace(/^\/?icons\//, '').replace(/^\/+/, '');
      const safePath = cleanPath.split('/').map(seg => encodeURIComponent(decodeURIComponent(seg))).join('/');
      const url = `${cdnBase}/icons/${safePath}`;

      try {
        const fetchRes = await fetch(url);
        if (!fetchRes.ok) {
          console.log(`[BROKEN ICON] Cat: ${cat.slug} | Icon: ${icon.title} | status: ${fetchRes.status}`);
          categoriesWithBrokenIcons.push({ cat: cat.slug, icon: icon.title, status: fetchRes.status });
        }
      } catch (e) {
        console.log(`[FETCH ERR] Cat: ${cat.slug} | Icon: ${icon.title} | ${e.message}`);
      }
    }
  }

  console.log('\n--- SUMMARY ---');
  console.log('Categories with 0 icons:', categoriesWithZeroIcons);
  console.log('Categories with broken icons:', categoriesWithBrokenIcons);

  await mongoose.disconnect();
}

testAllCategoryQueries();
