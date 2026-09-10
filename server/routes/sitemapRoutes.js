const express = require('express');
const Icon = require('../models/Icon');
const Category = require('../models/Category');
const Pack = require('../models/Pack');

const router = express.Router();

router.get('/sitemap.xml', async (req, res) => {
  try {
    const siteUrl = process.env.CLIENT_URL || 'https://iconsuniverse.com';
    const today = new Date().toISOString().split('T')[0];

    // Static public routes
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

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // 1. Static Pages
    staticRoutes.forEach((route) => {
      xml += `  <url>\n`;
      xml += `    <loc>${siteUrl}${route.path}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    // 2. Categories
    try {
      const categories = await Category.find().select('slug updatedAt').limit(500);
      categories.forEach((cat) => {
        const lastMod = cat.updatedAt ? cat.updatedAt.toISOString().split('T')[0] : today;
        xml += `  <url>\n`;
        xml += `    <loc>${siteUrl}/search?category=${encodeURIComponent(cat.slug)}</loc>\n`;
        xml += `    <lastmod>${lastMod}</lastmod>\n`;
        xml += `    <changefreq>daily</changefreq>\n`;
        xml += `    <priority>0.85</priority>\n`;
        xml += `  </url>\n`;
      });
    } catch (e) {
      console.warn('[Sitemap] Could not fetch categories from DB:', e.message);
    }

    // 3. Featured / Top Icon Packs
    try {
      const packs = await Pack.find({ status: 'approved' }).select('slug updatedAt').limit(200);
      packs.forEach((pack) => {
        const lastMod = pack.updatedAt ? pack.updatedAt.toISOString().split('T')[0] : today;
        xml += `  <url>\n`;
        xml += `    <loc>${siteUrl}/packs/${encodeURIComponent(pack.slug)}</loc>\n`;
        xml += `    <lastmod>${lastMod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
      });
    } catch (e) {
      console.warn('[Sitemap] Could not fetch packs from DB:', e.message);
    }

    // 4. Popular & Recent Icons (Top 10,000 index batch)
    try {
      const icons = await Icon.find({ status: { $ne: 'rejected' } })
        .select('slug updatedAt')
        .sort({ downloadCount: -1, createdAt: -1 })
        .limit(10000);

      icons.forEach((icon) => {
        const lastMod = icon.updatedAt ? icon.updatedAt.toISOString().split('T')[0] : today;
        xml += `  <url>\n`;
        xml += `    <loc>${siteUrl}/icons/${encodeURIComponent(icon.slug)}</loc>\n`;
        xml += `    <lastmod>${lastMod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
      });
    } catch (e) {
      console.warn('[Sitemap] Could not fetch icons from DB:', e.message);
    }

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    return res.status(200).send(xml);
  } catch (err) {
    console.error('[Sitemap Error]', err);
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;
