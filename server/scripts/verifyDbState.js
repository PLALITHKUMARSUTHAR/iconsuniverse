require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Icon = require('../models/Icon');
const Category = require('../models/Category');

async function verify() {
  await mongoose.connect(process.env.MONGODB_URI);

  const categories = await Category.find();
  for (const cat of categories) {
    const firstIcon = await Icon.findOne({ categoryId: cat._id });
    if (firstIcon && firstIcon.svgUrl) {
      await Category.updateOne({ _id: cat._id }, { $set: { iconThumbnailUrl: firstIcon.svgUrl } });
    }
  }

  const iconCount = await Icon.countDocuments();
  const categoryCount = await Category.countDocuments();
  const sampleIcon = await Icon.findOne().populate('categoryId', 'name slug');
  const sampleCategory = await Category.findOne({ iconThumbnailUrl: { $ne: null } });
  const dbStats = await mongoose.connection.db.stats();

  console.log('=== FINAL MONGODB STATUS ===');
  console.log('Total Icons in DB:', iconCount.toLocaleString());
  console.log('Total Categories in DB:', categoryCount.toLocaleString());
  console.log('Logical Data Size:', (dbStats.dataSize / 1024 / 1024).toFixed(2), 'MB');
  console.log('Total Disk/Quota Usage:', ((dbStats.dataSize + dbStats.indexSize) / 1024 / 1024).toFixed(2), 'MB / 512 MB');
  console.log('\nSample Ingested Icon:', JSON.stringify(sampleIcon, null, 2));
  console.log('\nSample Category with Count & Thumbnail:', JSON.stringify(sampleCategory, null, 2));

  process.exit(0);
}
verify().catch(e => { console.error('Verification error:', e); process.exit(1); });
