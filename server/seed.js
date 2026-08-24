require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Category = require('./models/Category');
const Pack = require('./models/Pack');
const Icon = require('./models/Icon');
const Collection = require('./models/Collection');
const { seedCategories, seedPacks, seedIcons } = require('./utils/seedData');
const { sanitizeSVG, extractColorsFromSVG, svgToDataUrl } = require('./utils/svgSanitizer');

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany(),
      Category.deleteMany(),
      Pack.deleteMany(),
      Icon.deleteMany(),
      Collection.deleteMany(),
    ]);

    console.log('[Seed] Creating demo users...');
    const adminUser = await User.create({
      name: 'IconsUniverse Admin',
      email: 'admin@iconsuniverse.com',
      password: 'password123',
      role: 'admin',
      plan: 'pro_annual',
      isVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
    });

    const contributorUser = await User.create({
      name: 'Aria VectorCraft',
      email: 'aria.contributor@example.com',
      password: 'password123',
      role: 'contributor',
      plan: 'free',
      isVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
    });

    const regularUser = await User.create({
      name: 'Demo Creator',
      email: 'demo@iconsuniverse.com',
      password: 'password123',
      role: 'user',
      plan: 'free',
      isVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80',
    });

    console.log('[Seed] Inserting categories...');
    const categoryMap = {};
    for (const cat of seedCategories) {
      const created = await Category.create(cat);
      categoryMap[cat.slug] = created._id;
    }

    console.log('[Seed] Inserting packs...');
    const packMap = {};
    for (const pack of seedPacks) {
      const created = await Pack.create({
        title: pack.title,
        slug: pack.slug,
        description: pack.description,
        coverImageUrl: pack.coverImageUrl,
        iconCount: pack.iconCount,
        categoryId: categoryMap[pack.categorySlug] || Object.values(categoryMap)[0],
        contributorId: contributorUser._id,
        isPremium: pack.isPremium,
        status: 'approved',
      });
      packMap[pack.slug] = created._id;
    }

    console.log('[Seed] Inserting icons with SVG vector content...');
    const createdIconIds = [];
    for (const icon of seedIcons) {
      const sanitized = sanitizeSVG(icon.svgContent);
      const colors = extractColorsFromSVG(sanitized);
      const dataUrl = svgToDataUrl(sanitized);

      const created = await Icon.create({
        title: icon.title,
        slug: icon.slug,
        svgContent: sanitized,
        svgUrl: dataUrl,
        pngPreviewUrl: dataUrl,
        tags: icon.tags,
        categoryId: categoryMap[icon.categorySlug] || Object.values(categoryMap)[0],
        packId: icon.packSlug ? packMap[icon.packSlug] : null,
        style: icon.style,
        colors,
        isPremium: icon.isPremium,
        contributorId: contributorUser._id,
        status: 'approved',
        downloadCount: Math.floor(Math.random() * 450) + 50,
      });
      createdIconIds.push(created._id);
    }

    console.log('[Seed] Creating starter user collection board...');
    const sampleBoard = await Collection.create({
      name: 'Essential Launch UI',
      userId: regularUser._id,
      isPublic: true,
      iconIds: createdIconIds.slice(0, 4),
    });

    regularUser.collections.push(sampleBoard._id);
    await regularUser.save();

    console.log('✅ [Seed] Database seeded successfully with users, categories, packs, and icons!');
    process.exit(0);
  } catch (error) {
    console.error('❌ [Seed Error]', error);
    process.exit(1);
  }
};

seedDatabase();
