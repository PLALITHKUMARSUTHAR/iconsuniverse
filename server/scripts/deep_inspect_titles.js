const mongoose = require('mongoose');
const Icon = require('../models/Icon');
require('dotenv').config();

async function inspect() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  const regexList = [
    { label: 'Pack prefixes (Ai, Bi, Bs, Bx, Mdi, Fa, Tb, Ri, etc.)', regex: /^(ai|bi|bs|bx|bxs|bxl|ci|cg|di|fa|fa6|fi|fc|gi|go|gr|hi|hi2|im|io|io5|lu|md|mdi|pi|ri|rx|si|si2|tb|ti|vsc|wi|cil|cib|cif|cbi|clarity|eva|feather|hero|jam|lineicons|oct|radix|remix|tabler|lucide|arcticons|carbon|ionicons|fontawesome|boxicons|material)\b/i },
    { label: 'Starting with style words (Outline, Filled, Solid, Sharp, etc.)', regex: /^(outline|filled|solid|sharp|rounded|twotone|regular|light|thin|bold|duotone)\s+/i },
    { label: 'Leftover dashes or underscores', regex: /[-_]/ },
    { label: 'Repetitive words in title (e.g. Word Word)', regex: /\b(\w+)\s+\1\b/i },
  ];

  for (const check of regexList) {
    const sample = await Icon.find({ title: { $regex: check.regex } }).limit(10).select('title path');
    console.log(`\n=== Pattern: ${check.label} (Found ${sample.length}+ samples) ===`);
    sample.forEach(i => console.log(` - Current: "${i.title}"  <-- Path: "${i.path}"`));
  }

  // Also random sample across 5 different categories
  const categories = ['Interface', 'Health & Medical', 'Brands', 'Code', 'Weather'];
  for (const catName of categories) {
    console.log(`\n=== Random 5 samples from path containing "${catName}" ===`);
    const catSample = await Icon.find({ path: { $regex: new RegExp(catName, 'i') } }).limit(5).select('title path');
    catSample.forEach(i => console.log(` - "${i.title}"  (Path: ${i.path})`));
  }

  process.exit(0);
}

inspect().catch(e => {
  console.error(e);
  process.exit(1);
});
