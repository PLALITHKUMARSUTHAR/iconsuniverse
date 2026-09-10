const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const Icon = require('../models/Icon');

function normalizeName(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(?:outline|solid|filled|fill|line|regular|bold|thin|light|sharp|round|rounded|square|circle|16|20|24|28|32|48|o)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function deepInspect() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  const total = await Icon.countDocuments();
  console.log(`Current total icons in DB: ${total}`);

  // 1. Same Title + Same Category (regardless of style)
  const titleCatMap = new Map();
  // 2. Normalized Title + Same Category (e.g. "Arrow Right", "Arrow-Right-24", "Arrow Right Solid")
  const normTitleCatMap = new Map();
  // 3. Global Exact Title (e.g. "Calendar" across all categories)
  const globalTitleMap = new Map();
  // 4. Global Normalized Title
  const globalNormTitleMap = new Map();
  // 5. File Base Name (e.g. "chevron-down.svg" from different directories/packs)
  const baseNameMap = new Map();

  let processed = 0;
  const cursor = Icon.find().select('title categoryId path style slug').lean().cursor();

  for await (const doc of cursor) {
    const t = (doc.title || '').trim();
    const normT = normalizeName(t);
    const cat = String(doc.categoryId || '');
    const pathBase = doc.path ? doc.path.split('/').pop().toLowerCase().replace(/^in_/, '').replace(/\.svg$/, '') : '';
    const normBase = normalizeName(pathBase);

    // 1. Same Title + Category
    if (t && cat) {
      const k1 = `${t.toLowerCase()}::${cat}`;
      titleCatMap.set(k1, (titleCatMap.get(k1) || 0) + 1);

      // 2. Norm Title + Category
      if (normT) {
        const k2 = `${normT}::${cat}`;
        normTitleCatMap.set(k2, (normTitleCatMap.get(k2) || 0) + 1);
      }
    }

    // 3. Global Title
    if (t) {
      globalTitleMap.set(t.toLowerCase(), (globalTitleMap.get(t.toLowerCase()) || 0) + 1);
    }

    // 4. Global Norm Title
    if (normT) {
      globalNormTitleMap.set(normT, (globalNormTitleMap.get(normT) || 0) + 1);
    }

    // 5. File base name
    if (normBase) {
      baseNameMap.set(normBase, (baseNameMap.get(normBase) || 0) + 1);
    }

    processed++;
    if (processed % 100000 === 0) {
      console.log(`Scanned ${processed} / ${total} icons...`);
    }
  }

  function report(map, name) {
    let dupGroups = 0;
    let extraDocs = 0;
    let maxC = 0;
    let topK = '';
    for (const [k, count] of map.entries()) {
      if (count > 1) {
        dupGroups++;
        extraDocs += (count - 1);
        if (count > maxC) {
          maxC = count;
          topK = k;
        }
      }
    }
    console.log(`\n=== ${name} ===`);
    console.log(`- Unique keys: ${map.size}`);
    console.log(`- Duplicate clusters: ${dupGroups}`);
    console.log(`- Total duplicate extra records: ${extraDocs}`);
    console.log(`- Top duplicate: ${topK} (${maxC} times)`);
    return { dupGroups, extraDocs };
  }

  console.log('\n================================================================');
  console.log('REMAINING DUPLICATE ANALYSIS');
  console.log('================================================================');
  report(titleCatMap, '1. Same Title + Same Category (across all styles)');
  report(normTitleCatMap, '2. Normalized Title + Same Category (ignoring style words like solid/outline/24/line)');
  report(globalTitleMap, '3. Same Exact Title Globally (across all categories)');
  report(globalNormTitleMap, '4. Normalized Title Globally (across all categories)');
  report(baseNameMap, '5. Normalized File Base Name Globally');
  console.log('================================================================');

  process.exit(0);
}

deepInspect().catch(console.error);
