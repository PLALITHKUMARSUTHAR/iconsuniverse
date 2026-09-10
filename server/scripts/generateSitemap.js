require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

async function generateStaticSitemap() {
  console.log('[Sitemap Generator] Starting static sitemap generation...');
  const siteUrl = process.env.CLIENT_URL || 'https://iconsuniverse.com';
  const today = new Date().toISOString().split('T')[0];
  const outputPath = path.resolve(__dirname, '../../client/public/sitemap.xml');

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static routes
  const staticRoutes = [
    { path: '', changefreq: 'daily', priority: '1.0' },
    { path: '/search', changefreq: 'daily', priority: '0.9' },
    { path: '/pricing', changefreq: 'weekly', priority: '0.8' },
    { path: '/editor', changefreq: 'weekly', priority: '0.8' },
    { path: '/about', changefreq: 'monthly', priority: '0.5' },
    { path: '/contact', changefreq: 'monthly', priority: '0.5' },
    { path: '/terms', changefreq: 'monthly', priority: '0.4' },
    { path: '/privacy', changefreq: 'monthly', priority: '0.4' },
    { path: '/whats-new', changefreq: 'weekly', priority: '0.6' },
  ];

  staticRoutes.forEach((route) => {
    xml += `  <url>\n`;
    xml += `    <loc>${siteUrl}${route.path}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += `  </url>\n`;
  });

  if (process.env.MONGODB_URI) {
    try {
      console.log('[Sitemap Generator] Connecting to MongoDB Atlas...');
      await mongoose.connect(process.env.MONGODB_URI);

      // Categories
      const categories = await mongoose.connection.db.collection('categories').find({}).toArray();
      console.log(`[Sitemap Generator] Appending ${categories.length} categories...`);
      categories.forEach((cat) => {
        xml += `  <url>\n`;
        xml += `    <loc>${siteUrl}/search?category=${encodeURIComponent(cat.slug)}</loc>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += `    <changefreq>daily</changefreq>\n`;
        xml += `    <priority>0.85</priority>\n`;
        xml += `  </url>\n`;
      });

      // Packs
      const packs = await mongoose.connection.db.collection('packs').find({ status: 'approved' }).toArray();
      console.log(`[Sitemap Generator] Appending ${packs.length} packs...`);
      packs.forEach((pack) => {
        xml += `  <url>\n`;
        xml += `    <loc>${siteUrl}/packs/${encodeURIComponent(pack.slug)}</loc>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
      });

      // Top 5,000 icons
      const icons = await mongoose.connection.db.collection('icons')
        .find({ status: { $ne: 'rejected' } })
        .project({ slug: 1, updatedAt: 1 })
        .sort({ downloadCount: -1 })
        .limit(5000)
        .toArray();
      console.log(`[Sitemap Generator] Appending ${icons.length} top icons...`);
      icons.forEach((icon) => {
        xml += `  <url>\n`;
        xml += `    <loc>${siteUrl}/icons/${encodeURIComponent(icon.slug)}</loc>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
      });
    } catch (e) {
      console.warn('[Sitemap Generator] DB fetch error, continuing with static entries:', e.message);
    }
  }

  xml += `</urlset>`;

  fs.writeFileSync(outputPath, xml, 'utf8');
  console.log(`[Sitemap Generator] Successfully written sitemap to: ${outputPath}`);
  process.exit(0);
}

generateStaticSitemap().catch((err) => {
  console.error('[Sitemap Generator Error]', err);
  process.exit(1);
});
