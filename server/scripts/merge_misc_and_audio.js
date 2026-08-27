const mongoose = require('mongoose');
const Category = require('../models/Category');
const Icon = require('../models/Icon');
require('dotenv').config();

async function mergeMiscAndAudio() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected.');

  // 1. Merge miscellaneous -> others
  const miscCat = await Category.findOne({ slug: 'miscellaneous' });
  let othersCat = await Category.findOne({ slug: 'others' });

  if (!othersCat) {
    othersCat = await Category.create({ name: 'Others', slug: 'others', iconCount: 0 });
    console.log('Created "Others" category.');
  }

  if (miscCat) {
    const resMisc = await Icon.updateMany(
      { categoryId: miscCat._id },
      { $set: { categoryId: othersCat._id } }
    );
    console.log(`Merged "Miscellaneous" -> "Others": Moved ${resMisc.modifiedCount.toLocaleString()} icons.`);
    await Category.deleteOne({ _id: miscCat._id });
    console.log('Deleted "Miscellaneous" category.');
  }

  // 2. Merge audio -> music
  const audioCat = await Category.findOne({ slug: 'audio' });
  let musicCat = await Category.findOne({ slug: 'music' });

  if (!musicCat) {
    musicCat = await Category.create({ name: 'Music', slug: 'music', iconCount: 0 });
    console.log('Created "Music" category.');
  }

  if (audioCat) {
    const resAudio = await Icon.updateMany(
      { categoryId: audioCat._id },
      { $set: { categoryId: musicCat._id } }
    );
    console.log(`Merged "Audio" -> "Music": Moved ${resAudio.modifiedCount.toLocaleString()} icons.`);
    await Category.deleteOne({ _id: audioCat._id });
    console.log('Deleted "Audio" category.');
  }

  // 3. Recalculate iconCount for all remaining categories
  const allCategories = await Category.find().sort({ name: 1 });
  console.log(`\nRecalculating icon counts for ${allCategories.length} remaining categories...`);

  for (const cat of allCategories) {
    const count = await Icon.countDocuments({ categoryId: cat._id });
    await Category.updateOne({ _id: cat._id }, { $set: { iconCount: count } });
    console.log(` - ${cat.name} (${cat.slug}): ${count.toLocaleString()} icons`);
  }

  console.log(`\n🎉 Complete! Remaining categories in DB: ${allCategories.length}`);
  process.exit(0);
}

mergeMiscAndAudio().catch((err) => {
  console.error('Error during merge:', err);
  process.exit(1);
});
