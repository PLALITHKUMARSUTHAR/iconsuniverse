# Tech Stack — IconsUniverse

## Frontend
- **Framework**: React 18 + Vite 5
- **Styling**: TailwindCSS 3 (custom extended theme with design tokens from `tokens.json` & glassmorphism)
- **Typography**: Google Fonts — **Sora** (Headlines & Labels) + **Inter** (Body text & dense UI)
- **Routing**: React Router DOM 6
- **State Management**: React Context API (`AuthContext`, `CollectionsContext`, `ToastContext`)
- **Data Fetching**: Axios HTTP client with interceptors
- **In-Browser SVG Editor & Canvas**: Native HTML5 Canvas API + SVG DOM parser + dynamic recolor & matrix transforms
- **Bulk Packaging & Webfont**: JSZip (client-side export) + SVG sprite builder
- **Hosting / Deployment**: **Vercel** (configured with `vercel.json` and client SPA rewrites)

## Backend
- **Runtime**: Node.js 20.x + Express 4 REST API
- **Database**: **MongoDB Atlas** (cluster connection with Mongoose 8.x ODM)
- **Authentication**: JWT (JSON Web Tokens via httpOnly cookies & Authorization Bearer headers) + Google OAuth 2.0
- **Asset Storage & Sync**:
  - **Google Drive API (`googleapis`)**: Primary asset loading & synchronization engine for icons, folders, and metadata
  - **Cloudinary**: Secondary image transformation & composite cover thumbnail generator
- **Packaging & Webfont Engine**:
  - `archiver` — High-performance server-side ZIP stream generator
  - `svg2ttf` / `ttf2woff` — Dynamic CSS WebFont compiler from SVG collections
  - `dompurify` + `jsdom` — Secure SVG sanitization
- **Payment & Subscriptions**: Razorpay SDK (Order creation, webhook signature verification)
- **Hosting / Deployment**: **Northflank** (`Dockerfile` multi-stage container + `northflank.json` service spec)

## Key Dependencies Overview

| Package | Purpose |
|---|---|
| `express` | HTTP Server & REST API routing |
| `mongoose` | MongoDB object modeling & indexing |
| `jsonwebtoken` | Token-based stateless authentication |
| `bcryptjs` | Secure password hashing |
| `googleapis` | Google Drive API integration for icon ingestion |
| `archiver` | Multi-file ZIP streaming for packs & collections |
| `razorpay` | Pro subscription payments & webhooks |
| `cors` | Cross-Origin Resource Sharing for Vercel <-> Northflank |
| `helmet` | Security headers |
| `express-rate-limit` | Rate limiting & download quota protection |
| `multer` | Multipart form uploads for contributor SVGs |
| `react` & `react-dom` | Reactive UI view layer |
| `react-router-dom` | Single Page Application routing |
| `lucide-react` / Material Icons | UI control iconography |
| `jszip` | In-browser ZIP packaging for instantaneous bulk downloads |
| `tailwindcss` | Utility-first responsive design system |
