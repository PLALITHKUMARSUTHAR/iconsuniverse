const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const Icon = require('../models/Icon');

async function markAnimated() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected.');

  // Find all animated icons by library / pattern
  const filter = {
    $or: [
      { path: /line-md/i },
      { slug: /line-md/i }
    ]
  };

  const count = await Icon.countDocuments(filter);
  console.log(`Found ${count} animated line-md icons to mark.`);

  const res = await Icon.updateMany(filter, {
    $set: { isAnimated: true, style: 'animated' }
  });

  console.log(`Updated: ${res.modifiedCount} icons set to isAnimated: true.`);

  // Create compound index for fast queries
  await Icon.collection.createIndex({ isAnimated: 1, categoryId: 1, style: 1 });
  console.log('Created index on { isAnimated: 1, categoryId: 1, style: 1 }');

  // Verify counts
  const animatedTotal = await Icon.countDocuments({ isAnimated: true });
  const staticTotal = await Icon.countDocuments({ isAnimated: { $ne: true } });
  console.log(`Verification:`);
  console.log(`  Animated icons: ${animatedTotal.toLocaleString()}`);
  console.log(`  Static icons:   ${staticTotal.toLocaleString()}`);

  process.exit(0);
}

markAnimated().catch(err => {
  console.error('Error marking animated icons:', err);
  process.exit(1);
});
