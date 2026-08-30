const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const Icon = require('../models/Icon');
const { cleanIconTitle } = require('../utils/titleCleaner');

async function cleanAllDatabaseTitles() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB. Starting database title cleanup...');

  const totalIcons = await Icon.countDocuments();
  console.log(`Total icons in DB: ${totalIcons}`);

  let updatedCount = 0;
  const cursor = Icon.find().select('_id title').cursor();

  const bulkOps = [];
  const BATCH_SIZE = 1000;

  for await (const doc of cursor) {
    const originalTitle = doc.title;
    const cleaned = cleanIconTitle(originalTitle);

    if (cleaned !== originalTitle) {
      bulkOps.push({
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: { title: cleaned } }
        }
      });
      updatedCount++;
    }

    if (bulkOps.length >= BATCH_SIZE) {
      await Icon.bulkWrite(bulkOps);
      bulkOps.length = 0;
      console.log(`Processed... updated ${updatedCount} titles so far.`);
    }
  }

  if (bulkOps.length > 0) {
    await Icon.bulkWrite(bulkOps);
  }

  console.log(`\nCleanup complete! Updated ${updatedCount} of ${totalIcons} icon titles.`);
  process.exit(0);
}

cleanAllDatabaseTitles().catch(console.error);
