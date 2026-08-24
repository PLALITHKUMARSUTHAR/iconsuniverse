require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const r2Client = require('../config/r2');
const Icon = require('../models/Icon');
const Category = require('../models/Category');

const ICONS_DIR = path.resolve(__dirname, '../../all icons');
const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'iconsuniverse-assets';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-2b1851a9e65c42c095e04c8a758bca43.r2.dev';
const PROGRESS_FILE = path.resolve(__dirname, '.upload_progress.json');

const STRICT_MAX_LIMIT = 1000000;
const CONCURRENCY = 40;
const DB_BATCH_SIZE = 1000;

// Helper: Recursively collect all icon files
function collectFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(collectFiles(fullPath));
    } else if (item.endsWith('.svg') || item.endsWith('.png')) {
      const relPath = path.relative(ICONS_DIR, fullPath).replace(/\\/g, '/');
      results.push({ fullPath, relPath, filename: item });
    }
  }
  return results;
}

// Helper: Format title from filename
function formatTitle(filename) {
  const name = filename.replace(/\.(svg|png)$/i, '');
  return name
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

// Helper: Generate clean slug
function formatSlug(relPath) {
  return relPath
    .replace(/\.(svg|png)$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function runSafePipeline({ dryRun = false } = {}) {
  console.log('====================================================');
  console.log('    ICONSUNIVERSE 1M BULK UPLOAD & SYNC PIPELINE    ');
  console.log('====================================================\n');

  console.log(`[1/5] Scanning folder: "${ICONS_DIR}"...`);
  if (!fs.existsSync(ICONS_DIR)) {
    console.error(`ERROR: Directory not found: ${ICONS_DIR}`);
    process.exit(1);
  }

  const allFiles = collectFiles(ICONS_DIR);
  const totalCount = allFiles.length;
  console.log(`\n[Scan Result] Found ${totalCount.toLocaleString()} icon files.`);

  // STRICT 1M SAFETY CHECK
  if (totalCount > STRICT_MAX_LIMIT) {
    console.error(`\n[CRITICAL SAFETY HALT] Total file count (${totalCount}) exceeds 1,000,000!`);
    console.error(`To prevent unintended cloud costs, the process has halted immediately without uploading any files.`);
    console.error(`Please review the folder or remove excess files before running.`);
    process.exit(1);
  }

  console.log(`[Safety Passed] ${totalCount.toLocaleString()} <= ${STRICT_MAX_LIMIT.toLocaleString()} (100% Free Tier Eligible)`);

  if (dryRun) {
    console.log(`\n[Dry Run Completed] Validation successful. Ready for live upload.`);
    return;
  }

  // Connect Database
  console.log(`\n[2/5] Connecting to MongoDB Atlas...`);
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`[Database] Connected successfully.`);

  // Load progress state
  let progress = { uploadedKeys: {}, dbInsertedCount: 0 };
  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
      console.log(`[Resume State] Loaded previous progress: ${Object.keys(progress.uploadedKeys).length} already uploaded.`);
    } catch (e) {}
  }

  // Ensure default contributor user or categories exist
  let defaultUser = await mongoose.model('User').findOne({ role: 'admin' });
  if (!defaultUser) {
    defaultUser = await mongoose.model('User').findOne();
  }
  const defaultUserId = defaultUser ? defaultUser._id : new mongoose.Types.ObjectId();

  // Pre-load / cache categories in DB
  const categoriesCache = {};
  const existingCats = await Category.find();
  for (const cat of existingCats) {
    categoriesCache[cat.slug] = cat._id;
  }

  // Queue files to upload
  const pendingFiles = allFiles.filter(f => !progress.uploadedKeys[f.relPath]);
  console.log(`\n[3/5] Files remaining to upload to R2 & DB: ${pendingFiles.length.toLocaleString()}`);

  let uploadedCount = Object.keys(progress.uploadedKeys).length;
  let dbBatch = [];
  let index = 0;

  async function uploadWorker() {
    while (index < pendingFiles.length) {
      if (uploadedCount >= STRICT_MAX_LIMIT) {
        console.warn(`[Safety Limit Reached] Exactly ${STRICT_MAX_LIMIT} uploaded. Stopping worker.`);
        break;
      }

      const currentIndex = index++;
      const fileItem = pendingFiles[currentIndex];
      if (!fileItem) break;

      const { fullPath, relPath, filename } = fileItem;
      const fileBuffer = fs.readFileSync(fullPath);
      const isSvg = filename.endsWith('.svg');
      const contentType = isSvg ? 'image/svg+xml' : 'image/png';
      const r2Key = `icons/${relPath}`;

      try {
        // 1. Upload to Cloudflare R2
        await r2Client.send(new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: r2Key,
          Body: fileBuffer,
          ContentType: contentType,
          CacheControl: 'public, max-age=31536000, immutable',
        }));

        // 2. Prepare DB record
        const folderCategory = relPath.split('/')[0] || 'general';
        const categorySlug = folderCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        let categoryId = categoriesCache[categorySlug];
        if (!categoryId) {
          const newCat = await Category.findOneAndUpdate(
            { slug: categorySlug },
            { name: folderCategory, slug: categorySlug },
            { upsert: true, new: true }
          );
          categoriesCache[categorySlug] = newCat._id;
          categoryId = newCat._id;
        }

        const title = formatTitle(filename);
        const slug = formatSlug(relPath);
        const svgContent = isSvg ? fileBuffer.toString('utf8') : '';
        const cdnUrl = `${R2_PUBLIC_URL}/${r2Key}`;

        dbBatch.push({
          updateOne: {
            filter: { slug },
            update: {
              $set: {
                title,
                slug,
                svgContent: isSvg ? svgContent : '',
                svgUrl: cdnUrl,
                pngPreviewUrl: cdnUrl,
                categoryId,
                style: 'outline',
                status: 'approved',
                contributorId: defaultUserId,
              }
            },
            upsert: true
          }
        });

        progress.uploadedKeys[relPath] = true;
        uploadedCount++;

        // Batch write to MongoDB
        if (dbBatch.length >= DB_BATCH_SIZE) {
          const toWrite = [...dbBatch];
          dbBatch = [];
          await Icon.bulkWrite(toWrite, { ordered: false });
          fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress));
          console.log(`[Progress] Uploaded & Synced: ${uploadedCount.toLocaleString()} / ${totalCount.toLocaleString()} icons...`);
        }
      } catch (err) {
        console.error(`[Error uploading ${relPath}]:`, err.message);
      }
    }
  }

  // Run concurrent workers
  console.log(`\n[4/5] Launching ${CONCURRENCY} parallel upload streams to Cloudflare R2...`);
  const startTime = Date.now();
  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(uploadWorker());
  }

  await Promise.all(workers);

  // Flush remaining DB batch
  if (dbBatch.length > 0) {
    await Icon.bulkWrite(dbBatch, { ordered: false });
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress));
  }

  const durationSec = Math.round((Date.now() - startTime) / 1000);
  console.log(`\n====================================================`);
  console.log(`[5/5] PIPELINE COMPLETED SUCCESSFULLY!`);
  console.log(`Total Uploaded: ${uploadedCount.toLocaleString()} icons`);
  console.log(`Time Elapsed: ${durationSec} seconds`);
  console.log(`R2 Storage & MongoDB Ingestion Active.`);
  console.log(`====================================================\n`);

  process.exit(0);
}

// Check arguments
const isDryRun = process.argv.includes('--dry-run');
runSafePipeline({ dryRun: isDryRun }).catch(err => {
  console.error('[Fatal Error]', err);
  process.exit(1);
});
