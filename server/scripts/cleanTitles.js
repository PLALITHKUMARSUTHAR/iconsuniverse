const mongoose = require('mongoose');
const Icon = require('../models/Icon');
const { cleanIconTitle } = require('../utils/titleCleaner');
require('dotenv').config();

async function cleanTitles() {
  const isDryRun = process.argv.includes('--dry-run') || process.argv.includes('--inspect');
  console.log(`Connecting to MongoDB Atlas... [Mode: ${isDryRun ? 'DRY-RUN / INSPECT' : 'APPLY UPDATES'}]`);
  
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  const total = await Icon.countDocuments();
  console.log(`Scanning titles for ${total.toLocaleString()} icons...`);

  const batchSize = 5000;
  let processed = 0;
  let needsUpdateCount = 0;
  let updatedCount = 0;

  const cursor = Icon.find({}, '_id path title').cursor({ batchSize });
  let bulkOps = [];
  const samples = [];

  for await (const doc of cursor) {
    processed++;
    const newTitle = cleanIconTitle(doc.path || doc.title);

    if (newTitle && newTitle !== doc.title) {
      needsUpdateCount++;
      if (samples.length < 10) {
        samples.push({ id: doc._id, from: doc.title, to: newTitle });
      }

      if (!isDryRun) {
        bulkOps.push({
          updateOne: {
            filter: { _id: doc._id },
            update: { $set: { title: newTitle } },
          },
        });
      }
    }

    if (!isDryRun && bulkOps.length >= batchSize) {
      const res = await Icon.bulkWrite(bulkOps, { ordered: false });
      updatedCount += res.modifiedCount;
      bulkOps = [];
      console.log(`Processed ${processed.toLocaleString()} / ${total.toLocaleString()} icons (Updated: ${updatedCount.toLocaleString()})...`);
    } else if (isDryRun && processed % 20000 === 0) {
      console.log(`Inspected ${processed.toLocaleString()} / ${total.toLocaleString()} icons (Needs update: ${needsUpdateCount.toLocaleString()})...`);
    }
  }

  if (!isDryRun && bulkOps.length > 0) {
    const res = await Icon.bulkWrite(bulkOps, { ordered: false });
    updatedCount += res.modifiedCount;
  }

  console.log('\n--- Title Cleaning Summary ---');
  console.log(`Total Icons Processed: ${processed.toLocaleString()}`);
  console.log(`Icons Requiring Update: ${needsUpdateCount.toLocaleString()}`);
  if (!isDryRun) {
    console.log(`Successfully Updated in DB: ${updatedCount.toLocaleString()}`);
  } else {
    console.log('Dry-run complete. No database changes made. Pass no flags to apply updates.');
  }

  if (samples.length > 0) {
    console.log('\nSample Changes:');
    samples.forEach((s, idx) => {
      console.log(`  ${idx + 1}. "${s.from}" -> "${s.to}"`);
    });
  }

  process.exit(0);
}

cleanTitles().catch((err) => {
  console.error('Error during title cleaning:', err);
  process.exit(1);
});
