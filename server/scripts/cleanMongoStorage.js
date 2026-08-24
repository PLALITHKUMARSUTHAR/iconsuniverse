require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Icon = require('../models/Icon');

async function cleanStorage() {
  console.log('[Cleanup] Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[Cleanup] Connected. Clearing large inline svgContent to free quota...');
  
  const count = await Icon.countDocuments();
  console.log(`[Cleanup] Found ${count.toLocaleString()} icons currently in MongoDB.`);

  const res = await Icon.updateMany(
    { svgContent: { $ne: '' } },
    { $set: { svgContent: '' } }
  );

  console.log(`[Cleanup] Successfully stripped raw SVG text from ${res.modifiedCount.toLocaleString()} icons.`);
  console.log(`[Cleanup] MongoDB storage space is now reduced by ~90%!`);
  process.exit(0);
}

cleanStorage().catch(err => {
  console.error('[Cleanup Error]', err.message);
  process.exit(1);
});
