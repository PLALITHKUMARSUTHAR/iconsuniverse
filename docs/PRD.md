# IconsUniverse — Product Requirements Document (PRD)

## 1. Overview
**IconsUniverse** (iconsuniverse.com) is a next-generation vector icon, sticker, and illustration ecosystem inspired by **Flaticon.com**. It empowers designers, developers, marketers, and content creators to search, preview, customize via an in-browser vector editor, organize into personal collections, generate custom webfonts/sprites, and download digital assets in multiple formats (SVG, PNG at multiple resolutions, EPS, Base64, CSS Webfont).

The platform operates on a freemium model:
- **Free Tier**: Access to free assets with attribution requirement, daily download quota counter, standard PNG/SVG downloads.
- **Pro Subscription**: Unlimited attribution-free downloads, premium-only assets, high-res & EPS formats, bulk pack ZIP downloads, and custom webfont generation.
- **Automated Google Drive Asset Ingestion**: Main content and icon libraries can be loaded and synchronized directly from designated Google Drive folders with automated metadata extraction, SVG streaming, and thumbnail caching.

---

## 2. Target Users & Personas
1. **Free / Indie Creators & Students**: Need quick icons for decks, mockups, or school projects; accept attribution requirements.
2. **Pro Designers & UX Engineers**: Need high-resolution vector assets (SVG, EPS), custom webfont bundles, bulk collection ZIPs, and in-browser recoloring without attribution.
3. **Frontend Developers**: Want one-click SVG markup copying, Base64 strings, CSS icon classes, and SVG sprite integration.
4. **Contributors / Icon Designers**: Upload icon packs and individual vectors with metadata tagging; earn royalties and track download metrics.
5. **Platform Administrators**: Moderate submissions, curate categories, monitor revenue and download analytics, and manage Google Drive synchronization jobs.

---

## 3. Flaticon.com Full-Feature Specifications

### A. Asset Library & Taxonomy
- **Styles Supported**:
  - `Outline` (Minimalist stroke lines)
  - `Filled` / `Solid` (Bold solid silhouettes)
  - `Color` / `Lineal Color` (Outline with color fills)
  - `Flat` (Modern clean flat illustration style)
  - `Gradient` (Multi-tone smooth gradients)
  - `Hand-drawn` / `Doodle` (Playful sketch styles)
  - `3D` / `Isometric` (Dimensioned icons)
- **Asset Categories**: E-Commerce, UI/UX, Technology, Finance, Health, Social Media, Food, Education, Travel, Business, etc.
- **Icon Packs & Families**: Sets of 20–200 cohesive icons with consistent stroke weight, corner radius, and aesthetic unity.
- **Animated & Interface Icons**: Support for Lottie JSON, animated SVG, and GIF formats.

### B. In-Browser Vector Icon Editor (Flaticon Signature Feature)
- **Live SVG Recolor Engine**:
  - Global single-color fill & stroke tinting.
  - Multi-layer color picker: auto-detects distinct color groups in complex SVGs and allows individual swatch replacement.
  - Preset curated color palettes (Vibrant, Pastel, Dark, Tech Neon, Minimalist).
- **Transformations**:
  - Rotate (90° increments + free angle rotation).
  - Flip Horizontal & Flip Vertical.
  - Scale / Zoom within canvas bounds.
  - Pan / Offset positioning.
- **Shape Backdrop & Badges**:
  - Add background shapes behind icons: `None`, `Circle`, `Rounded Rectangle`, `Square`, `Hexagon`.
  - Configurable background fill color, opacity slider, and margin/padding.
- **Real-Time Export**:
  - Export customized icon directly as SVG or PNG (16px, 32px, 64px, 128px, 256px, 512px, custom).

### C. Download & Conversion Engine
- **Multi-Format Downloads**:
  - `SVG`: Raw vector code with inline optimization.
  - `PNG`: Multi-resolution rasterizer (16px, 24px, 32px, 64px, 128px, 256px, 512px).
  - `EPS`: Vector format for Adobe Illustrator and print design.
  - `Base64`: Data URI string for rapid inline embedding in web projects.
- **Clipboard Fast Actions**:
  - One-click `Copy SVG Code` to clipboard.
  - One-click `Copy PNG Image` to clipboard.
  - One-click `Copy CSS Class / HTML Embed`.
- **Attribution Modal (Free Users)**:
  - Generates HTML attribution snippet with 1-click copy: `"Icons created by IconsUniverse - https://iconsuniverse.com"`.
  - Pro upgrade CTA button to download without attribution.

### D. Collections & Bulk Management (My Collection Drawer)
- **Persistent Floating Collection Tray**:
  - Docked at bottom/side with real-time icon count badge.
  - Quick-add button on every icon hover card.
- **Slide-out Collection Drawer**:
  - Thumbnail reel of saved icons.
  - **Bulk Download**: Export whole collection as a single ZIP archive in chosen format and size.
  - **Bulk Recolor**: Apply a unified color theme to all icons in the collection simultaneously.
  - **Custom WebFont Generator**: Compiles collection into `.woff`/`.ttf` font files + `icons.css` stylesheet with unique class names (e.g. `icon-cart`, `icon-user`).
  - **SVG Sprite Bundle**: Generates a single `<svg><defs>...</defs></svg>` sprite sheet for frontend developers.
  - **Shareable Collection Link**: Public board URL for collaborative design reviews.

### E. Search & Discovery Engine
- Instant live search with debounce auto-suggestions and popular search tags.
- Multi-dimensional sidebar filters:
  - Style: Outline, Filled, Color, Flat, Gradient, Hand-drawn, 3D.
  - Color palette filter (Monochrome, Specific Hex/Hue, Multi-color).
  - Format: SVG, PNG, EPS, Lottie.
  - License: Free vs Pro.
  - Sort: Popularity, Recent / Newest, Most Downloaded.
- Breadcrumb navigation and related icon recommendation engine.

### F. Google Drive Asset Sync & Ingestion Engine
- Admin capability to designate Google Drive folder IDs.
- Automated scanner:
  - Scans Drive folders recursively for `.svg` and `.png` files.
  - Extracts title, tags from file name and folder hierarchy.
  - Computes SVG bounding box and color palettes.
  - Stores direct streaming URLs and preview thumbnails in MongoDB Atlas.
- Manual "Sync Now" trigger in Admin Dashboard + background cron synchronization.

### G. Contributor & Admin Portals
- **Contributor Dashboard**:
  - Multi-SVG drag & drop batch upload.
  - Tagging, style classification, pack association, licensing choice.
  - Submission status tracker: `Draft` -> `Pending Review` -> `Approved` -> `Rejected`.
  - Royalty & download earnings metrics.
- **Admin Dashboard**:
  - Moderation queue with side-by-side SVG preview and approve/reject controls with feedback notes.
  - Category and tag manager with hierarchy nesting.
  - Revenue, daily download volume, top search terms, and active subscriber analytics.
  - Google Drive sync status monitor and log inspection.

---

## 4. Technology & Infrastructure
- **Frontend**: React 18 + Vite 5 + TailwindCSS 3 + Sora & Inter Google Fonts. Deployed on **Vercel** (`vercel.json`).
- **Backend**: Node.js 20.x + Express 4 REST API + MongoDB Atlas (Mongoose ODM). Deployed on **Northflank** (`Dockerfile` + `northflank.json`).
- **Storage**: **Google Drive API** (primary asset sync & ingestion) + Cloudinary (composite thumbnails & transformations).
- **Billing**: Razorpay Pro Subscription integration (Monthly & Annual).

---

## 5. Success Criteria
1. Search queries return relevant results in under 500ms.
2. In-browser editor modifies colors and exports high-res PNG/SVG instantaneously without server roundtrip.
3. Collection drawer allows 50+ icons to be bundled into a custom WebFont or ZIP in under 2 seconds.
4. Google Drive sync ingests a 100-icon folder and makes it searchable within seconds.
5. Frontend passes production build with zero errors and deploys smoothly to Vercel; Backend builds via Docker on Northflank.
