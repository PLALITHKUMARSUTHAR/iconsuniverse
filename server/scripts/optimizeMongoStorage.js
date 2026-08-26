require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Icon = require('../models/Icon');

async function optimizeStorage() {
  console.log('[Optimizer] Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI, {
    socketTimeoutMS: 90000,
    connectTimeoutMS: 45000,
    serverSelectionTimeoutMS: 45000,
  });
  console.log('[Optimizer] Connected.');

  const count = await Icon.countDocuments();
  console.log(`[Optimizer] Found ${count.toLocaleString()} icons in MongoDB.`);

  const statsBefore = await mongoose.connection.db.stats();
  console.log(`[Before] Data Size: ${(statsBefore.dataSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`[Before] Index Size: ${(statsBefore.indexSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`[Before] Total Quota Used: ${((statsBefore.dataSize + statsBefore.indexSize) / 1024 / 1024).toFixed(2)} MB / 512 MB`);

  console.log('\n[Optimizer] Stripping redundant duplicate fields (pngPreviewUrl duplicate of svgUrl, null packId)...');
  
  const res = await Icon.updateMany(
    {},
    {
      $unset: {
        pngPreviewUrl: '',
        packId: '',
      }
    }
  );

  console.log(`[Optimizer] Cleaned redundant fields on ${res.modifiedCount.toLocaleString()} icons.`);

  const statsAfter = await mongoose.connection.db.stats();
  console.log(`\n[After] Data Size: ${(statsAfter.dataSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`[After] Index Size: ${(statsAfter.indexSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`[After] Total Quota Used: ${((statsAfter.dataSize + statsAfter.indexSize) / 1024 / 1024).toFixed(2)} MB / 512 MB`);
  console.log(`[Success] Storage freed: ${(((statsBefore.dataSize + statsBefore.indexSize) - (statsAfter.dataSize + statsAfter.indexSize)) / 1024 / 1024).toFixed(2)} MB`);

  process.exit(0);
}

optimizeStorage().catch(err => {
  console.error('[Optimizer Error]', err);
  process.exit(1);
});
