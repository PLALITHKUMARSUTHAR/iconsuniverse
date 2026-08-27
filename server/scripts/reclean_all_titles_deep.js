const mongoose = require('mongoose');
const Icon = require('../models/Icon');
const { cleanIconTitle } = require('../utils/titleCleaner');
require('dotenv').config();

async function recleanDeep() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected.');

  const total = await Icon.countDocuments();
  console.log(`Deep cleaning titles for ${total.toLocaleString()} icons...`);

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
      console.log(`Processed ${processed.toLocaleString()} / ${total.toLocaleString()} icons (Deep Updated: ${updatedCount.toLocaleString()})...`);
    }
  }

  if (bulkOps.length > 0) {
    const res = await Icon.bulkWrite(bulkOps, { ordered: false });
    updatedCount += res.modifiedCount;
  }

  console.log(`\n🎉 Deep Title Clean Complete! Processed: ${processed.toLocaleString()}, Total Updated: ${updatedCount.toLocaleString()}`);
  process.exit(0);
}

recleanDeep().catch((err) => {
  console.error('Error during deep reclean:', err);
  process.exit(1);
});
