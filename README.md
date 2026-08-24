# 🌌 IconsUniverse — Flaticon-Grade Vector Icon Marketplace

**IconsUniverse** (iconsuniverse.com) is an open-standard digital asset platform with all signature features of **Flaticon.com**, built on modern cloud architecture.

---

## ✨ Core Features

1. **In-Browser Vector Icon Editor**:
   - Real-time SVG layer recoloring & curated palette presets.
   - Transformations: Rotate (90° / free), Flip Horizontal, Flip Vertical, Zoom/Scale, Padding.
   - Geometric shape backdrop badges (Circle, Rounded Square, Hexagon) with custom opacity and fills.
   - Instant export to SVG, PNG (16px to 512px / custom), and Base64 Data URIs.

2. **Collections & Bulk Management**:
   - Floating persistent collection tray across the entire website.
   - Bulk download entire collections as unified ZIP archives.
   - **Custom WebFont Generator**: Compiles collections into downloadable `.woff`/`.ttf` fonts + `iconsuniverse.css` stylesheets.
   - **SVG Sprite Generator**: Produces single `<svg><defs></defs></svg>` symbol sprite sheets.

3. **Google Drive Asset Ingestion & Sync Engine**:
   - Ingests and streams vector icons directly from designated Google Drive folders.
   - Automated SVG metadata extraction, bounding box detection, color grouping, and keyword tagging.
   - Admin synchronization console with scan preview and history telemetry.

4. **Multi-Format Downloads & Attribution Engine**:
   - SVG, PNG (16px to 512px), EPS print vector, and Base64 formats.
   - 1-click clipboard copy for SVG markup and PNG images.
   - Automated HTML attribution snippet generator for free downloads.

5. **Freemium & Pro Subscriptions**:
   - Free tier (20 downloads/day with link attribution).
   - Pro subscription (unlimited downloads, commercial license, high-res EPS vectors, custom WebFonts) via Razorpay.

---

## 🛠️ Technology Stack & Deployment

- **Frontend**: React 18, Vite 5, TailwindCSS 3, Sora & Inter Google Fonts → Hosted on **Vercel** (`vercel.json`)
- **Backend**: Node.js 20, Express 4 REST API, Archiver, Google APIs → Hosted on **Northflank** (`Dockerfile` + `northflank.json`)
- **Database**: **MongoDB Atlas** with full-text search indexing on `title` and `tags`
- **Asset Pipeline**: **Google Drive API** (primary vector storage) + Cloudinary

---

## 🚀 Quick Start

### 1. Server Setup (Backend)
```bash
cd server
npm install
cp .env.example .env
npm run seed      # Populate MongoDB with starter icons & packs
npm run dev       # Start API server on http://localhost:5000
```

### 2. Client Setup (Frontend)
```bash
cd client
npm install
npm run dev       # Start Vite client on http://localhost:5173
```

---

## ☁️ Deployment

- **Vercel**: Deploy the `/client` directory with Vite preset.
- **Northflank**: Connect repository and deploy `/server` directory using `server/Dockerfile`.
