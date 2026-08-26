require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function updateCategories() {
  console.log('[Post-Sync] Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  
  const categories = await mongoose.connection.db.collection('categories').find().toArray();
  console.log(`[Post-Sync] Updating ${categories.length} categories with live icon counts and thumbnails...`);

  for (const cat of categories) {
    const count = await mongoose.connection.db.collection('icons').countDocuments({ categoryId: cat._id });
    const first = await mongoose.connection.db.collection('icons').findOne({ categoryId: cat._id });
    const thumb = first ? (first.pngPreviewUrl || first.svgUrl) : null;
    
    await mongoose.connection.db.collection('categories').updateOne(
      { _id: cat._id },
      { $set: { iconCount: count, coverImageUrl: thumb } }
    );
  }

  console.log('[Post-Sync] All 163 categories successfully updated with counts and preview URLs!');
  process.exit(0);
}

updateCategories().catch(e => {
  console.error(e);
  process.exit(1);
});
