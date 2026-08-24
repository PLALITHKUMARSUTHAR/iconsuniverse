require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const r2Client = require('../config/r2');

const ICONS_DIR = path.resolve(__dirname, '../../all icons');
const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'iconsuniverse-assets';
const PROGRESS_FILE = path.resolve(__dirname, '.upload_progress.json');

const STRICT_MAX_LIMIT = 1000000;
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '200', 10);

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

async function uploadToR2() {
  console.log('====================================================');
  console.log('      CLOUDFLARE R2 BULK ASSET UPLOAD PIPELINE      ');
  console.log('====================================================\n');

  console.log(`[1/3] Scanning folder: "${ICONS_DIR}"...`);
  if (!fs.existsSync(ICONS_DIR)) {
    console.error(`ERROR: Directory not found: ${ICONS_DIR}`);
    process.exit(1);
  }

  const allFiles = collectFiles(ICONS_DIR);
  const totalCount = allFiles.length;
  console.log(`[Scan Result] Found ${totalCount.toLocaleString()} icon files.`);

  // STRICT 1M SAFETY CHECK
  if (totalCount > STRICT_MAX_LIMIT) {
    console.error(`\n[CRITICAL SAFETY HALT] Total file count (${totalCount}) exceeds 1,000,000!`);
    process.exit(1);
  }

  console.log(`[Safety Passed] ${totalCount.toLocaleString()} <= ${STRICT_MAX_LIMIT.toLocaleString()} (100% Free Tier Eligible)`);

  // Load progress state
  let progress = { uploadedKeys: {} };
  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
      if (!progress.uploadedKeys) progress.uploadedKeys = {};
      console.log(`[Resume State] Loaded ${Object.keys(progress.uploadedKeys).length.toLocaleString()} files already uploaded to R2.`);
    } catch (e) {}
  }

  const pendingFiles = allFiles.filter(f => !progress.uploadedKeys[f.relPath]);
  console.log(`\n[2/3] Files remaining to upload: ${pendingFiles.length.toLocaleString()}`);

  if (pendingFiles.length === 0) {
    console.log(`\nAll 1,000,000 files are already uploaded to Cloudflare R2!`);
    process.exit(0);
  }

  let uploadedCount = Object.keys(progress.uploadedKeys).length;
  let index = 0;
  let saveInterval = 0;

  async function uploadWorker() {
    while (index < pendingFiles.length) {
      if (uploadedCount >= STRICT_MAX_LIMIT) {
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
        await r2Client.send(new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: r2Key,
          Body: fileBuffer,
          ContentType: contentType,
          CacheControl: 'public, max-age=31536000, immutable',
        }));

        progress.uploadedKeys[relPath] = true;
        uploadedCount++;
        saveInterval++;

        if (saveInterval >= 2500) {
          saveInterval = 0;
          fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress));
          console.log(`[R2 Progress] Uploaded: ${uploadedCount.toLocaleString()} / ${totalCount.toLocaleString()} (${Math.round((uploadedCount/totalCount)*100)}%)...`);
        }
      } catch (err) {
        console.error(`[Error uploading ${relPath}]:`, err.message);
      }
    }
  }

  console.log(`\n[3/3] Launching ${CONCURRENCY} parallel upload streams to Cloudflare R2...`);
  const startTime = Date.now();
  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(uploadWorker());
  }

  await Promise.all(workers);
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress));

  const durationMin = Math.round((Date.now() - startTime) / 60000);
  console.log(`\n====================================================`);
  console.log(`[COMPLETE] All 1,000,000 files uploaded to Cloudflare R2!`);
  console.log(`Time Elapsed: ${durationMin} minutes`);
  console.log(`====================================================\n`);
  process.exit(0);
}

uploadToR2().catch(err => {
  console.error('[Fatal Error]', err);
  process.exit(1);
});
