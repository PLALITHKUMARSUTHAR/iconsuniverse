require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Icon = require('../models/Icon');
const Category = require('../models/Category');

const { cleanIconTitle } = require('../utils/titleCleaner');

const ICONS_DIR = path.resolve(__dirname, '../../all icons');
const BATCH_SIZE = 4000;
const PROGRESS_FILE = path.resolve(__dirname, '.db_sync_progress.json');

function formatSlug(relPath) {
  return relPath
    .replace(/\.(svg|png)$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function safeBulkWrite(batch, retries = 7) {
  if (!batch || batch.length === 0) return;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await Icon.bulkWrite(batch, { ordered: false });
      return;
    } catch (err) {
      if (err.name === 'MongoBulkWriteError') {
        const nonDuplicateErrors = (err.writeErrors || []).filter(e => e.code !== 11000);
        if (nonDuplicateErrors.length === 0 && (!err.hasWriteConcernError || !err.hasWriteConcernError())) {
          return;
        }
      }

      const isTransient =
        err.name === 'MongoBulkWriteError' ||
        err.name === 'MongoNetworkError' ||
        err.name === 'MongoServerSelectionError' ||
        err.name === 'MongoTimeoutError' ||
        err.code === 'ECONNRESET' ||
        err.code === 'ETIMEDOUT' ||
        (err.message && (
          err.message.includes('ECONNRESET') ||
          err.message.includes('ETIMEDOUT') ||
          err.message.includes('socket') ||
          err.message.includes('connection timed out') ||
          err.message.includes('buffering timed out') ||
          err.message.includes('Topology is closed')
        ));

      if (isTransient && attempt < retries) {
        const delay = Math.min(2000 * Math.pow(1.5, attempt - 1), 10000);
        console.warn(`[Network Retry] Transient issue (Attempt ${attempt}/${retries}). Retrying in ${Math.round(delay/1000)}s...`);
        await new Promise(r => setTimeout(r, delay));
        try {
          if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGODB_URI, {
              socketTimeoutMS: 90000,
              connectTimeoutMS: 45000,
              serverSelectionTimeoutMS: 45000,
            });
          }
        } catch (reconnErr) {
          console.warn(`[Reconnect attempt warning]: ${reconnErr.message}`);
        }
      } else {
        throw err;
      }
    }
  }
}

async function syncToDatabase() {
  console.log('====================================================');
  console.log('    STREAMLINED 1M ICONS MONGODB SYNC PIPELINE      ');
  console.log('====================================================\n');

  console.log('[1/4] Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI, {
    socketTimeoutMS: 90000,
    connectTimeoutMS: 45000,
    serverSelectionTimeoutMS: 45000,
  });
  console.log('[Database] Connected successfully.');

  // Pre-load / cache categories
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

  // Load progress
  let progress = { completedCategories: {} };
  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    } catch (e) {}
  }

  const initialCount = await Icon.countDocuments();
  console.log(`\n[2/4] MongoDB currently has ${initialCount.toLocaleString()} icons.`);

  const pendingCategories = categories.filter(c => {
    const fullCatPath = path.join(ICONS_DIR, c);
    return fs.statSync(fullCatPath).isDirectory() && !progress.completedCategories[c];
  });

  console.log(`[Status] ${Object.keys(progress.completedCategories).length} categories already completed, ${pendingCategories.length} categories remaining.\n`);

  console.log('[3/4] Ingesting remaining icons with retry protection...');
  let totalProcessed = initialCount;
  let batch = [];
  const startTime = Date.now();
  let catIndex = 0;

  for (const catName of categories) {
    if (progress.completedCategories[catName]) continue;

    const fullCatPath = path.join(ICONS_DIR, catName);
    if (!fs.statSync(fullCatPath).isDirectory()) continue;

    catIndex++;
    const catId = categoryMap[catName];
    const files = fs.readdirSync(fullCatPath);
    let catIconsCount = 0;

    for (const file of files) {
      if (!file.endsWith('.svg') && !file.endsWith('.png')) continue;

      const relPath = `${catName}/${file}`;
      const slug = formatSlug(relPath);
      const title = cleanIconTitle(file);

      batch.push({
        updateOne: {
          filter: { slug },
          update: {
            $setOnInsert: {
              title,
              slug,
              path: relPath,
              categoryId: catId,
              style: 'outline',
              status: 'approved',
            }
          },
          upsert: true
        }
      });
      catIconsCount++;

      if (batch.length >= BATCH_SIZE) {
        await safeBulkWrite(batch);
        totalProcessed += batch.length;
        batch = [];
      }
    }

    if (batch.length > 0) {
      await safeBulkWrite(batch);
      totalProcessed += batch.length;
      batch = [];
    }

    progress.completedCategories[catName] = true;
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress));
    console.log(`[Category ${catIndex}/${pendingCategories.length}] "${catName}" synced (${catIconsCount.toLocaleString()} icons). Total in DB: ~${totalProcessed.toLocaleString()} / 1,000,000`);
  }

  const finalCount = await Icon.countDocuments();
  const durationSec = Math.round((Date.now() - startTime) / 1000);

  console.log('\n[4/4] Fast aggregating category counts and thumbnails...');
  const counts = await Icon.aggregate([
    {
      $group: {
        _id: '$categoryId',
        count: { $sum: 1 },
        firstSvgUrl: { $first: '$svgUrl' }
      }
    }
  ]);
  
  const catBulk = counts.map(item => ({
    updateOne: {
      filter: { _id: item._id },
      update: {
        $set: {
          iconCount: item.count,
          iconThumbnailUrl: item.firstSvgUrl
        }
      }
    }
  }));

  if (catBulk.length > 0) {
    await Category.bulkWrite(catBulk);
  }
  console.log(`[Post-Processing] Updated ${catBulk.length} categories with counts and thumbnails.`);

  const stats = await mongoose.connection.db.stats();

  console.log(`\n====================================================`);
  console.log(`[SUCCESS] Database Sync Completed!`);
  console.log(`Total Icons in MongoDB: ${finalCount.toLocaleString()} / 1,000,000`);
  console.log(`Data Size: ~${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total Quota Used: ~${((stats.dataSize + stats.indexSize) / 1024 / 1024).toFixed(2)} MB / 512 MB`);
  console.log(`Time Elapsed: ${durationSec} seconds`);
  console.log(`====================================================\n`);

  process.exit(0);
}

syncToDatabase().catch(err => {
  console.error('[Fatal Error]', err);
  process.exit(1);
});
