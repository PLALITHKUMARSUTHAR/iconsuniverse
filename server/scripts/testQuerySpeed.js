const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const Icon = require('../models/Icon');
const Category = require('../models/Category');

async function benchmark() {
  await mongoose.connect(process.env.MONGODB_URI);
  const cat = await Category.findOne({ slug: 'shopping' });
  console.log('Category:', cat._id, cat.name);

  // 1. Current query executed when modal opens (style: 'filled', category: 'shopping', limit: 5)
  const filter = {
    categoryId: cat._id,
    isAnimated: { $ne: true },
    $or: [{ style: 'filled' }, { isFilled: true }]
  };
  const sortQuery = { isFilled: -1, downloadCount: -1, _id: 1 };

  console.log('\n--- 1. FULL QUERY WITH countDocuments ---');
  const t0 = Date.now();
  const [icons1, total1] = await Promise.all([
    Icon.find(filter)
      .sort(sortQuery)
      .limit(5)
      .select('title slug path isFilled isAnimated isPremium style tags downloadCount colors categoryId packId')
      .lean(),
    Icon.countDocuments(filter)
  ]);
  console.log(`Took: ${Date.now() - t0}ms. Total count: ${total1}, icons returned: ${icons1.length}`);

  console.log('\n--- 2. WITHOUT countDocuments (if preview only needs 5 icons) ---');
  const t1 = Date.now();
  const icons2 = await Icon.find(filter)
    .sort(sortQuery)
    .limit(5)
    .select('title slug path isFilled isAnimated isPremium style tags downloadCount colors categoryId packId')
    .lean();
  console.log(`Took: ${Date.now() - t1}ms. Icons returned: ${icons2.length}`);

  console.log('\n--- 3. EXPLAIN PLAN FOR CURRENT QUERY ---');
  const explain = await Icon.find(filter)
    .sort(sortQuery)
    .limit(5)
    .explain('executionStats');
  console.log('Execution time ms:', explain.executionStats.executionTimeMillis);
  console.log('Total docs examined:', explain.executionStats.totalDocsExamined);
  console.log('Stages:', JSON.stringify(explain.executionStats.executionStages, (key, value) => {
    if (key === 'inputStages' || key === 'inputStage') return value;
    if (['stage', 'indexName', 'nReturned', 'executionTimeMillisEstimate'].includes(key)) return value;
    return undefined;
  }, 2));

  process.exit(0);
}

benchmark().catch(e => { console.error(e); process.exit(1); });
