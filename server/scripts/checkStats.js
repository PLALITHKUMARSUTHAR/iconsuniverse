const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const Icon = require('../models/Icon');

async function checkDbStats() {
  await mongoose.connect(process.env.MONGODB_URI);
  const total = await Icon.countDocuments();
  const withSvgContent = await Icon.countDocuments({ svgContent: { $exists: true, $ne: null, $ne: '' } });
  console.log('Total icons in DB:', total);
  console.log('Icons with svgContent already populated in DB:', withSvgContent);
  const sample = await Icon.findOne().select('title slug path svgContent isFilled style colors');
  console.log('Sample icon:', JSON.stringify(sample, null, 2));
  process.exit(0);
}

checkDbStats().catch(e => { console.error(e); process.exit(1); });
