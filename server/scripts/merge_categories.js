const mongoose = require('mongoose');
const Category = require('../models/Category');
const Icon = require('../models/Icon');
require('dotenv').config();

const categoryMergeMap = {
  // Architecture & Buildings
  'architecture': 'buildings',
  'house': 'buildings',
  'home-decor': 'furniture',

  // Brands & Logos
  'brand': 'brands',
  'logos': 'brands',

  // Design, Edit & Writing
  'design-tools': 'design',
  'graphics-extra': 'design',
  'editor': 'edit',
  'writing': 'edit',

  // Education & Books
  'books': 'education',

  // Body, Health & Medical
  'eye': 'body-parts',
  'gestures': 'body-parts',
  'medical': 'health-medical',
  'dental': 'health-medical',

  // Business & Finance
  'finance': 'business',
  'fintech': 'business',
  'payment': 'business',
  'cryptocurrency': 'business',

  // Gaming, Media & Entertainment
  'game-icons-extra': 'game',
  'entertainment': 'media',
  'theater': 'media',
  'streaming': 'media',
  'video': 'media',
  'player': 'media',
  'animation': 'media',

  // Emotions & Love
  'love': 'emotions',

  // Tech, Hardware, Code & Devices
  'device': 'devices',
  'phone': 'devices',
  'servers': 'devices',
  'operating-systems': 'code',
  'frameworks': 'code',
  'backend-tools': 'code',
  'devops': 'code',
  'programming': 'code',
  'databases': 'code',
  'vscode-extra': 'code',
  'browsers': 'code',

  // Food & Kitchen
  'food-drink': 'food',
  'kitchen': 'food',

  // Clothing & Fashion
  'bags': 'clothing',
  'hats': 'clothing',
  'shoes': 'clothing',
  'textiles': 'clothing',
  'cosmetics': 'clothing',

  // Nature, Plants & Agriculture
  'nature-extra': 'nature',
  'plants': 'nature',
  'agriculture': 'nature',
  'marine': 'nature',

  // Communication & Messages
  'messaging': 'communication',
  'messages': 'communication',
  'postal': 'mail',

  // People & Users
  'users': 'people',

  // Maps, Location & Navigation
  'places': 'maps',
  'navigation': 'maps',
  'countries': 'maps',

  // Travel & Transport
  'travel': 'transport',
  'vehicles': 'transport',

  // Security
  'security-extra': 'security',
  'auth': 'security',

  // Tools & Construction
  'construction': 'tools',
  'mining': 'tools',
  'ruler': 'tools',

  // Audio & Music
  'instruments': 'music',
  'volume': 'audio',

  // Photography & Images
  'images': 'photography',

  // Interface & Pack Extras
  'bootstrap-extra': 'interface',
  'boxicons-extra': 'interface',
  'css-gg-extra': 'interface',
  'css-gg-extra2': 'interface',
  'dripicons-extra': 'interface',
  'flat-color-extra': 'interface',
  'fontawesome-extra': 'interface',
  'fontawesome6-extra': 'interface',
  'grommet-extra': 'interface',
  'heroicons-extra': 'interface',
  'heroicons2-extra': 'interface',
  'icomoon-extra': 'interface',
  'ionicons-extra': 'interface',
  'ionicons5-extra': 'interface',
  'line-awesome-extra': 'interface',
  'lineicons': 'interface',
  'lucide-extra': 'interface',
  'lucide-extra2': 'interface',
  'material-design-extra': 'interface',
  'material-icons': 'interface',
  'phosphor-extra': 'interface',
  'radix-extra': 'interface',
  'remix-extra': 'interface',
  'simple-icons-extra': 'interface',
  'sl-icons-extra': 'interface',
  'tabler-extra': 'interface',
  'tf-icons-extra': 'interface',
  'themify-extra': 'interface',
  'visibility': 'interface',
  'chevrons': 'interface',
  'check': 'interface',
  'filters': 'interface',
  'grid': 'layout',
  'move': 'interface',
  'action': 'interface',
};

async function executeMerge() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected.');

  const allDbCategories = await Category.find();
  const categoryBySlug = {};
  allDbCategories.forEach((c) => {
    categoryBySlug[c.slug] = c;
  });

  // Ensure all target categories exist
  for (const [sourceSlug, targetSlug] of Object.entries(categoryMergeMap)) {
    if (!categoryBySlug[targetSlug]) {
      // Create target category if it doesn't exist
      const name = targetSlug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      const newCat = await Category.create({
        name,
        slug: targetSlug,
        iconCount: 0,
      });
      categoryBySlug[targetSlug] = newCat;
      console.log(`Created target category: ${name} (${targetSlug})`);
    }
  }

  let totalIconsMoved = 0;
  const deletedCategoryIds = [];

  for (const [sourceSlug, targetSlug] of Object.entries(categoryMergeMap)) {
    const sourceCat = categoryBySlug[sourceSlug];
    const targetCat = categoryBySlug[targetSlug];

    if (!sourceCat) {
      continue;
    }

    if (sourceCat._id.toString() === targetCat._id.toString()) {
      continue;
    }

    // Move all icons from source category to target category
    const updateResult = await Icon.updateMany(
      { categoryId: sourceCat._id },
      {
        $set: {
          categoryId: targetCat._id,
        },
      }
    );

    totalIconsMoved += updateResult.modifiedCount;
    deletedCategoryIds.push(sourceCat._id);
    console.log(`Merged "${sourceCat.name}" (${sourceSlug}) -> "${targetCat.name}" (${targetSlug}): Moved ${updateResult.modifiedCount.toLocaleString()} icons.`);
  }

  // Delete merged source categories from DB
  if (deletedCategoryIds.length > 0) {
    const delRes = await Category.deleteMany({ _id: { $in: deletedCategoryIds } });
    console.log(`Deleted ${delRes.deletedCount} merged source categories.`);
  }

  // Recalculate iconCount for all remaining categories
  const remainingCategories = await Category.find();
  console.log(`\nRecalculating icon counts for ${remainingCategories.length} remaining canonical categories...`);

  for (const cat of remainingCategories) {
    const count = await Icon.countDocuments({ categoryId: cat._id });
    await Category.updateOne({ _id: cat._id }, { $set: { iconCount: count } });
    console.log(` - ${cat.name} (${cat.slug}): ${count.toLocaleString()} icons`);
  }

  console.log(`\n🎉 Category Merge Complete! Total Icons Reassigned: ${totalIconsMoved.toLocaleString()}`);
  console.log(`Remaining Canonical Categories in DB: ${remainingCategories.length}`);
  process.exit(0);
}

executeMerge().catch((err) => {
  console.error('Error during category merge:', err);
  process.exit(1);
});
