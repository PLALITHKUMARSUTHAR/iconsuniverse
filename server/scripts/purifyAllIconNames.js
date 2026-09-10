/**
 * Dynamic High-Speed Icon Title Purification Engine
 * 
 * Renames all improper named icons across the entire MongoDB database in one go.
 * Strips library prefixes (e.g., Is1, Arcticons, Fluent, Streamline, Material Symbols, etc.),
 * leading noise ('Color', 'Brand', 'Logo', 'Outline'), trailing style words ('Filled', '24px', 'Regular', 'Fill'),
 * and duplicates words, producing clean, human-readable icon titles.
 * 
 * Usage:
 *   node server/scripts/purifyAllIconNames.js --dry-run             # Test run, previews changes without writing
 *   node server/scripts/purifyAllIconNames.js --dry-run --limit=500 # Test on first 500 icons
 *   node server/scripts/purifyAllIconNames.js                       # Live run across entire database
 *   node server/scripts/purifyAllIconNames.js --batch=10000         # Custom batch size
 *   node server/scripts/purifyAllIconNames.js --category=transport  # Purify only a specific category
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const Icon = require('../models/Icon');
const Category = require('../models/Category');
const { cleanIconTitle } = require('../utils/titleCleaner');

// Parse CLI flags
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const limitArg = args.find(a => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : null;
const batchArg = args.find(a => a.startsWith('--batch='));
const batchSize = batchArg ? parseInt(batchArg.split('=')[1], 10) : 5000;
const catArg = args.find(a => a.startsWith('--category='));
const categoryFilter = catArg ? catArg.split('=')[1] : null;

function formatDuration(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

async function runPurification() {
  console.log('='.repeat(70));
  console.log('🚀 IconsUniverse Dynamic Title Purification Engine');
  console.log('='.repeat(70));
  console.log(`Mode:       ${isDryRun ? '🔍 DRY RUN (Preview only, no DB writes)' : '⚡ LIVE RUN (Updating MongoDB)'}`);
  console.log(`Batch Size: ${batchSize.toLocaleString()}`);
  if (limit) console.log(`Limit:      ${limit.toLocaleString()} icons`);
  if (categoryFilter) console.log(`Category:   ${categoryFilter}`);

  console.log('\nConnecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✓ Connected to MongoDB.\n');

  // Build query
  const query = {};
  if (categoryFilter) {
    const cat = await Category.findOne({
      $or: [{ slug: new RegExp(categoryFilter, 'i') }, { name: new RegExp(categoryFilter, 'i') }]
    });
    if (cat) {
      query.categoryId = cat._id;
      console.log(`Filtering for category: "${cat.name}" (ID: ${cat._id})`);
    } else {
      console.error(`❌ Category "${categoryFilter}" not found.`);
      process.exit(1);
    }
  }

  const totalIcons = limit || await Icon.countDocuments(query);
  console.log(`Total icons to process: ${totalIcons.toLocaleString()}`);
  console.log('-'.repeat(70));

  const startTime = Date.now();
  let processed = 0;
  let renamedCount = 0;
  let bulkOps = [];
  const sampleChanges = [];

  // Stream cursor with optimized batching
  let cursorQuery = Icon.find(query).select('_id title slug path').lean();
  if (limit) {
    cursorQuery = cursorQuery.limit(limit);
  }
  const cursor = cursorQuery.cursor({ batchSize });

  for await (const doc of cursor) {
    processed++;
    const currentTitle = doc.title || '';
    
    // Purify title using comprehensive cleaning engine
    const cleaned = cleanIconTitle(currentTitle || doc.slug || doc.path);

    // Only update if cleaned title is non-empty and actually different
    if (cleaned && cleaned !== currentTitle) {
      renamedCount++;

      if (sampleChanges.length < 15) {
        sampleChanges.push({ old: currentTitle, new: cleaned });
      }

      if (!isDryRun) {
        bulkOps.push({
          updateOne: {
            filter: { _id: doc._id },
            update: { $set: { title: cleaned } },
          },
        });
      }
    }

    // Flush batch write
    if (!isDryRun && bulkOps.length >= batchSize) {
      await Icon.bulkWrite(bulkOps, { ordered: false });
      bulkOps = [];
    }

    // Periodic progress report (every 10,000 icons or at the end)
    if (processed % 10000 === 0 || processed === totalIcons) {
      const elapsed = Date.now() - startTime;
      const speed = Math.round((processed / (elapsed / 1000)) || 0);
      const remaining = totalIcons - processed;
      const etaMs = speed > 0 ? (remaining / speed) * 1000 : 0;
      const percent = ((processed / totalIcons) * 100).toFixed(1);

      console.log(
        `[Progress] ${processed.toLocaleString()} / ${totalIcons.toLocaleString()} (${percent}%) | ` +
        `Renamed: ${renamedCount.toLocaleString()} | ` +
        `Speed: ${speed.toLocaleString()} icons/s | ` +
        `ETA: ${formatDuration(etaMs)}`
      );
    }
  }

  // Flush any remaining operations
  if (!isDryRun && bulkOps.length > 0) {
    await Icon.bulkWrite(bulkOps, { ordered: false });
    bulkOps = [];
  }

  const totalTime = Date.now() - startTime;
  console.log('\n' + '='.repeat(70));
  console.log('🎉 Title Purification Finished!');
  console.log('='.repeat(70));
  console.log(`Total Scanned:  ${processed.toLocaleString()}`);
  console.log(`Total Renamed:  ${renamedCount.toLocaleString()} (${((renamedCount / (processed || 1)) * 100).toFixed(1)}%)`);
  console.log(`Total Time:     ${formatDuration(totalTime)}`);
  console.log(`Average Speed:  ${Math.round(processed / (totalTime / 1000)).toLocaleString()} icons/sec`);

  if (sampleChanges.length > 0) {
    console.log('\nSample Improvements:');
    console.log('-'.repeat(70));
    sampleChanges.forEach((sample, idx) => {
      console.log(`  ${idx + 1}. "${sample.old}"  ==>  "${sample.new}"`);
    });
  }

  console.log('='.repeat(70));
  process.exit(0);
}

runPurification().catch((err) => {
  console.error('\n❌ Error during title purification:', err);
  process.exit(1);
});
