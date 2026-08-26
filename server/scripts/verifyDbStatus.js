require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function verify() {
  await mongoose.connect(process.env.MONGODB_URI);
  const iconCount = await mongoose.connection.db.collection('icons').countDocuments();
  const catCount = await mongoose.connection.db.collection('categories').countDocuments();
  const sampleCat = await mongoose.connection.db.collection('categories').findOne({ iconCount: { $gt: 0 } });
  const sampleIcon = await mongoose.connection.db.collection('icons').findOne();
  const stats = await mongoose.connection.db.stats();

  console.log('----------------------------------------------------');
  console.log('✅ TOTAL ICONS IN MONGODB:', iconCount.toLocaleString());
  console.log('✅ TOTAL CATEGORIES:', catCount);
  console.log('✅ DATABASE DATA SIZE:', (stats.dataSize / 1024 / 1024).toFixed(2), 'MB');
  console.log('✅ TOTAL QUOTA USED:', ((stats.dataSize + stats.indexSize) / 1024 / 1024).toFixed(2), 'MB / 512 MB');
  console.log('----------------------------------------------------');
  console.log('SAMPLE CATEGORY:', sampleCat);
  console.log('SAMPLE ICON:', sampleIcon);
  process.exit(0);
}

verify().catch(e => {
  console.error(e);
  process.exit(1);
});
