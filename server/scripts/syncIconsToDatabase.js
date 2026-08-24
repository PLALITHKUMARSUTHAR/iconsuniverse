require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Icon = require('../models/Icon');
const Category = require('../models/Category');

const ICONS_DIR = path.resolve(__dirname, '../../all icons');
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-2b1851a9e65c42c095e04c8a758bca43.r2.dev';
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
  console.log('    STREAMLINED 1M ICONS MONGODB SYNC PIPELINE      ');
  console.log('====================================================\n');

  console.log('[1/4] Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[Database] Connected.');

  console.log('[2/4] Resetting and optimizing Icons collection...');
  try {
    await mongoose.connection.db.collection('icons').drop();
    console.log('[Database] Dropped old collection to reclaim 100% free disk space.');
  } catch (e) {}

  console.log('\n[3/4] Scanning categories and files...');
  const categories = fs.readdirSync(ICONS_DIR);
  console.log(`Found ${categories.length} category folders.`);

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

  console.log('\n[4/4] Ingesting 1,000,000 lightweight icon records in chunks of 5,000...');
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
      const cdnUrl = `${R2_PUBLIC_URL}/icons/${relPath}`;
      const slug = formatSlug(relPath);
      const title = formatTitle(file);

      batch.push({
        insertOne: {
          document: {
            title,
            slug,
            svgUrl: cdnUrl,
            pngPreviewUrl: cdnUrl,
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

  const durationSec = Math.round((Date.now() - startTime) / 1000);
  const stats = await mongoose.connection.db.stats();
  console.log(`\n====================================================`);
  console.log(`[COMPLETED] All ${totalProcessed.toLocaleString()} icons synced to MongoDB!`);
  console.log(`Total Database Storage Used: ~${Math.round(stats.dataSize / 1024 / 1024)} MB (out of 512 MB Free Quota)`);
  console.log(`Time Elapsed: ${durationSec} seconds`);
  console.log(`====================================================\n`);

  process.exit(0);
}

syncToDatabase().catch(err => {
  console.error('[Fatal Error]', err);
  process.exit(1);
});
