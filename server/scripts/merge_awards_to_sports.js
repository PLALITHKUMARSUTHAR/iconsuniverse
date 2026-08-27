const mongoose = require('mongoose');
const Category = require('../models/Category');
const Icon = require('../models/Icon');
require('dotenv').config();

async function mergeAwardsToSports() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected.');

  const awardsCat = await Category.findOne({ slug: 'awards' });
  let sportsCat = await Category.findOne({ slug: 'sports' });

  if (!sportsCat) {
    sportsCat = await Category.create({ name: 'Sports', slug: 'sports', iconCount: 0 });
    console.log('Created "Sports" category.');
  }

  if (awardsCat) {
    const resAwards = await Icon.updateMany(
      { categoryId: awardsCat._id },
      { $set: { categoryId: sportsCat._id } }
    );
    console.log(`Merged "Awards" -> "Sports": Moved ${resAwards.modifiedCount.toLocaleString()} icons.`);
    await Category.deleteOne({ _id: awardsCat._id });
    console.log('Deleted "Awards" category.');
  }

  // Recalculate icon count for sports
  const sportsCount = await Icon.countDocuments({ categoryId: sportsCat._id });
  await Category.updateOne({ _id: sportsCat._id }, { $set: { iconCount: sportsCount } });
  console.log(`Sports total icons: ${sportsCount.toLocaleString()}`);

  const totalCategories = await Category.countDocuments();
  console.log(`Total canonical categories remaining: ${totalCategories}`);
  process.exit(0);
}

mergeAwardsToSports().catch((err) => {
  console.error('Error during merge:', err);
  process.exit(1);
});
