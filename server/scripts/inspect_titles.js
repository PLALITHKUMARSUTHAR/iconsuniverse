const mongoose = require('mongoose');
const Icon = require('../models/Icon');
require('dotenv').config();

async function checkTitles() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  // 1. General sample
  const sample = await Icon.find().limit(25).select('title path');
  console.log('\n--- General Sample (25) ---');
  sample.forEach(i => console.log(`Title: "${i.title}" | Path: "${i.path}"`));

  // 2. Check titles with prefixes, underscores, or digits
  const prefixes = await Icon.find({
    title: { $regex: /^(in_|in-|bi-|fa-|bx-|ai-|mdi-|arcticons|lucide|tabler|fontawesome|material|radix|heroicons|feather|carbon)/i }
  }).limit(20).select('title path');
  console.log(`\n--- Titles with Pack/Library Prefixes (${prefixes.length}) ---`);
  prefixes.forEach(i => console.log(`Title: "${i.title}" | Path: "${i.path}"`));

  // 3. Check titles with dashes or underscores or strange characters
  const dashes = await Icon.find({
    title: { $regex: /[-_]/ }
  }).limit(20).select('title path');
  console.log(`\n--- Titles with remaining dashes/underscores (${dashes.length}) ---`);
  dashes.forEach(i => console.log(`Title: "${i.title}" | Path: "${i.path}"`));

  // 4. Check very short titles (<= 2 chars) or numeric titles
  const shortOrNum = await Icon.find({
    title: { $regex: /^[0-9a-zA-Z]{1,2}$/ }
  }).limit(20).select('title path');
  console.log(`\n--- Very short / Numeric Titles (${shortOrNum.length}) ---`);
  shortOrNum.forEach(i => console.log(`Title: "${i.title}" | Path: "${i.path}"`));

  process.exit(0);
}

checkTitles().catch(e => {
  console.error(e);
  process.exit(1);
});
