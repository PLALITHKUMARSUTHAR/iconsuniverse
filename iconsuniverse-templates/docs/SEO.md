# SEO & Content Strategy — IconsUniverse

## Meta Defaults
- Site title template: `%s — IconsUniverse`
- Default description: "Search, customize, and download millions of icons, illustrations, and stickers in SVG, PNG, and EPS. Free with attribution, or unlimited with IconsUniverse Pro."
- Default OG image: `/favicon/og-image.png`

## Per-Page Requirements
- [ ] Unique `<title>` and meta description per route (e.g. icon detail pages: "{Icon Title} Icon — Free Download | IconsUniverse")
- [ ] Canonical URL set on every page (especially search/filter pages, to avoid duplicate-content penalties from query-string variants)
- [ ] Structured data (JSON-LD) for icon and pack detail pages using `ImageObject` / `Product`-style markup with license info

## Sitemap & Robots
- `sitemap.xml` generated: dynamically at build/deploy time from approved icons, packs, and categories (static shell for core pages, generated section appended for content)
- Submitted to: Google Search Console (property already configured for the domain)

## Content Guidelines
- Target keywords per icon/pack page: the icon's primary tag + "icon" (e.g. "shopping cart icon", "weather icon pack") in title, H1, and alt text
- Internal linking rule: link to 8–12 related icons and the parent category/pack on every icon detail page
- Image alt text: required for all icon thumbnails and preview images, using the icon's descriptive title (not just the filename)
