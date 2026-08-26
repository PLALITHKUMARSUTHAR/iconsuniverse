const mongoose = require('mongoose');
const Icon = require('../models/Icon');
const { cleanIconTitle } = require('../utils/titleCleaner');
require('dotenv').config();

async function recleanAllTitles() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected.');

  const total = await Icon.countDocuments();
  console.log(`Total icons to verify and re-clean: ${total.toLocaleString()}`);

  const batchSize = 5000;
  let processed = 0;
  let updatedCount = 0;

  const cursor = Icon.find({}, '_id path title').cursor({ batchSize });

  let bulkOps = [];

  for await (const doc of cursor) {
    processed++;
    const newTitle = cleanIconTitle(doc.path || doc.title);

    if (newTitle && newTitle !== doc.title) {
      bulkOps.push({
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: { title: newTitle } },
        },
      });
    }

    if (bulkOps.length >= batchSize) {
      const res = await Icon.bulkWrite(bulkOps, { ordered: false });
      updatedCount += res.modifiedCount;
      bulkOps = [];
      console.log(`Processed ${processed.toLocaleString()} / ${total.toLocaleString()} icons (Updated: ${updatedCount.toLocaleString()})...`);
    }
  }

  if (bulkOps.length > 0) {
    const res = await Icon.bulkWrite(bulkOps, { ordered: false });
    updatedCount += res.modifiedCount;
  }

  console.log(`\n🎉 Title Re-Cleaning Complete! Processed: ${processed.toLocaleString()}, Total Updated: ${updatedCount.toLocaleString()}`);
  process.exit(0);
}

recleanAllTitles().catch((err) => {
  console.error('Error during title re-cleaning:', err);
  process.exit(1);
});
