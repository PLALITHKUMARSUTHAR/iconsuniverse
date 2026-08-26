require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Icon = require('../models/Icon');
const Category = require('../models/Category');

const ICONS_DIR = path.resolve(__dirname, '../../all icons');
const BATCH_SIZE = 5000;

function formatTitle(filename) {
  return filename
    .replace(/\.(svg|png)$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function formatSlug(relPath) {
  return relPath
    .replace(/\.(svg|png)$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function syncToDatabase() {
  console.log('====================================================');
  console.log('  ULTRA-COMPACT 1M ICONS MONGODB SYNC PIPELINE     ');
  console.log('====================================================\n');

  console.log('[1/4] Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI, {
    socketTimeoutMS: 90000,
    connectTimeoutMS: 45000,
  });
  console.log('[Database] Connected successfully.');

  console.log('[2/4] Resetting and dropping bloated collection to reclaim 100% free disk space...');
  try {
    await mongoose.connection.db.collection('icons').drop();
    console.log('[Database] Dropped icons collection.');
  } catch (e) {}

  console.log('\n[3/4] Initializing categories...');
  const categories = fs.readdirSync(ICONS_DIR);
  const categoryMap = {};
  for (const catName of categories) {
    const fullCatPath = path.join(ICONS_DIR, catName);
    if (!fs.statSync(fullCatPath).isDirectory()) continue;

    const catSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const catDoc = await Category.findOneAndUpdate(
      { slug: catSlug },
      { name: catName, slug: catSlug },
      { upsert: true, new: true }
    );
    categoryMap[catName] = catDoc._id;
  }

  console.log('\n[4/4] Ingesting ultra-compact icon records (under 120MB total database size)...');
  let totalProcessed = 0;
  let batch = [];
  const startTime = Date.now();

  for (const catName of categories) {
    const fullCatPath = path.join(ICONS_DIR, catName);
    if (!fs.statSync(fullCatPath).isDirectory()) continue;

    const catId = categoryMap[catName];
    const files = fs.readdirSync(fullCatPath);

    for (const file of files) {
      if (!file.endsWith('.svg') && !file.endsWith('.png')) continue;

      const relPath = `${catName}/${file}`;
      const slug = formatSlug(relPath);
      const title = formatTitle(file);

      batch.push({
        insertOne: {
          document: {
            title,
            slug,
            path: relPath,
            categoryId: catId,
            style: 'outline',
            status: 'approved',
          }
        }
      });

      totalProcessed++;

      if (batch.length >= BATCH_SIZE) {
        await Icon.bulkWrite(batch, { ordered: false });
        batch = [];
        console.log(`[DB Ingestion] Synced ${totalProcessed.toLocaleString()} / 1,000,000 icons into MongoDB...`);
      }
    }
  }

  if (batch.length > 0) {
    await Icon.bulkWrite(batch, { ordered: false });
  }

  // Update Category counts & sample previews
  console.log('\n[Post-Processing] Updating category icon counts and thumbnails...');
  const allDbCategories = await Category.find();
  for (const cat of allDbCategories) {
    const count = await Icon.countDocuments({ categoryId: cat._id });
    const firstIcon = await Icon.findOne({ categoryId: cat._id });
    const thumb = firstIcon ? firstIcon.svgUrl : null;
    await Category.updateOne(
      { _id: cat._id },
      { $set: { iconCount: count, coverImageUrl: thumb } }
    );
  }

  const finalCount = await Icon.countDocuments();
  const durationSec = Math.round((Date.now() - startTime) / 1000);
  const stats = await mongoose.connection.db.stats();

  console.log(`\n====================================================`);
  console.log(`[SUCCESS] Database Sync Completed!`);
  console.log(`Total Icons in MongoDB: ${finalCount.toLocaleString()}`);
  console.log(`Total Database Storage Used: ~${Math.round(stats.dataSize / 1024 / 1024)} MB (Out of 512 MB Free Quota)`);
  console.log(`Time Elapsed: ${durationSec} seconds`);
  console.log(`====================================================\n`);

  process.exit(0);
}

syncToDatabase().catch(err => {
  console.error('[Fatal Error]', err);
  process.exit(1);
});
