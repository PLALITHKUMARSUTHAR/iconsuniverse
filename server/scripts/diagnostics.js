const mongoose = require('mongoose');
const { ListObjectsV2Command } = require('@aws-sdk/client-s3');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const Icon = require('../models/Icon');
const Category = require('../models/Category');
const r2Client = require('../config/r2');

async function runDiagnostics() {
  console.log('=== IconsUniverse System Diagnostics ===\n');

  // 1. MongoDB Connection & Stats
  console.log('[1/3] Checking MongoDB connection and collection stats...');
  try {
    const tStart = Date.now();
    await mongoose.connect(process.env.MONGODB_URI);
    const dbPing = Date.now() - tStart;
    console.log(`  ✓ MongoDB Connected in ${dbPing}ms`);

    const totalIcons = await Icon.countDocuments();
    const totalCategories = await Category.countDocuments();
    const withSvgContent = await Icon.countDocuments({ svgContent: { $exists: true, $ne: null, $ne: '' } });

    console.log(`  - Total Icons: ${totalIcons.toLocaleString()}`);
    console.log(`  - Total Categories: ${totalCategories.toLocaleString()}`);
    console.log(`  - Icons with embedded SVG content: ${withSvgContent.toLocaleString()}`);
  } catch (err) {
    console.error('  ✗ MongoDB Diagnostic failed:', err.message);
  }

  // 2. Cloudflare R2 Storage Test
  console.log('\n[2/3] Checking Cloudflare R2 Storage connectivity...');
  const bucket = process.env.R2_BUCKET_NAME || 'iconsuniverse-assets';
  try {
    const tStart = Date.now();
    const listCmd = new ListObjectsV2Command({
      Bucket: bucket,
      MaxKeys: 5,
    });
    const res = await r2Client.send(listCmd);
    const r2Ping = Date.now() - tStart;
    console.log(`  ✓ R2 Bucket "${bucket}" reachable in ${r2Ping}ms`);
    console.log(`  - Sample key count: ${res.KeyCount || 0}`);
  } catch (err) {
    console.error(`  ✗ R2 Test failed for bucket "${bucket}":`, err.message);
  }

  // 3. Database Query Latency Benchmark
  console.log('\n[3/3] Benchmarking Query Latency...');
  try {
    const sampleCategory = await Category.findOne();
    if (sampleCategory) {
      const filter = {
        categoryId: sampleCategory._id,
        isAnimated: { $ne: true },
        $or: [{ style: 'filled' }, { isFilled: true }],
      };

      const tQueryStart = Date.now();
      const icons = await Icon.find(filter)
        .sort({ isFilled: -1, downloadCount: -1, _id: 1 })
        .limit(10)
        .select('title slug path isFilled isPremium style')
        .lean();
      const queryDuration = Date.now() - tQueryStart;

      console.log(`  ✓ Sample category query ("${sampleCategory.name}") returned ${icons.length} icons in ${queryDuration}ms`);
    } else {
      console.log('  - No categories found to run query benchmark.');
    }
  } catch (err) {
    console.error('  ✗ Query Benchmark failed:', err.message);
  }

  console.log('\n=== Diagnostics Complete ===');
  process.exit(0);
}

runDiagnostics().catch((err) => {
  console.error('Diagnostics execution error:', err);
  process.exit(1);
});
