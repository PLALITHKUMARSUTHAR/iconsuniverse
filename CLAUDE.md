# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

IconsUniverse (iconsuniverse.com) is a Flaticon-style vector icon marketplace: in-browser SVG editor (recolor, transform, badges), collections with bulk ZIP/webfont/sprite export, a Google Drive-based ingestion pipeline for icon assets, and Free/Pro subscriptions via Razorpay. MERN-ish stack: React/Vite frontend, Express/MongoDB backend, Cloudflare R2 for asset serving.

## Commands

There is no root-level build; the client and server are independent npm projects with no shared tooling.

```bash
# Backend (server/)
cd server
npm install
npm run dev        # nodemon, http://localhost:5000
npm run seed        # seed.js — populate MongoDB with starter icons/packs/categories
node scripts/<name>.js   # one-off maintenance scripts (see server/scripts/)

# Frontend (client/)
cd client
npm install
npm run dev         # Vite dev server, http://localhost:5188 (proxies /api to VITE_API_URL)
npm run build        # production build to client/dist
npm run preview
```

There is no lint script, no test runner, and no test files in either package — don't invent `npm test`/`npm run lint` invocations; verify changes by running the dev servers and exercising the flow in the browser, or by reading the affected code paths carefully.

## Architecture

### Two independent apps, one repo
`client/` (Vite/React SPA) and `server/` (Express API) deploy separately — client to Vercel, server to Northflank (`server/Dockerfile` + `server/northflank.json`) — and only communicate over the REST API under `/api`. There's no shared code between them; duplication of shapes (e.g. icon fields) between `client/src/services` and `server/controllers` is expected and must be kept in sync by hand.

### Data flow: Google Drive → R2 → MongoDB → client
Icons are not uploaded through the app. The real pipeline is:
1. Vector SVGs live in a Google Drive folder structure (per-category).
2. `server/utils/googleDriveService.js` + `server/scripts/syncIconsToDatabase.js` / `bulkUploadAndSync.js` walk Drive, extract metadata (bounding box, colors, keywords), and push the file bytes to Cloudflare R2 (`server/config/r2.js`, an S3-compatible client).
3. A Mongo `Icon` document is created/updated per file (`server/models/Icon.js`) storing only `path`/`categoryId`/flags — no binary data and no stored URL.
4. `Icon.svgUrl`/`pngPreviewUrl` are Mongoose **virtuals** computed at read time from `path` + `R2_PUBLIC_URL` — never stored, never trust a DB field for the asset URL, derive it the same way if you need it elsewhere.
5. The admin Google Drive sync console (`client/src/components/admin/GoogleDriveSyncPanel.jsx` → `server/controllers/googleDriveController.js` → `DriveSyncLog` model) lets an admin trigger/inspect sync runs from the UI.

Cloudinary is configured (`server/config/cloudinary.js`) but is secondary — used for derived/composite thumbnails, not primary storage. Local `all icons/` at the repo root is a gitignored scratch folder for raw assets used by the sync scripts; it is not read by the running app.

### Auth
JWT-based, dual-mode: `middleware/auth.js`'s `protect` checks an httpOnly cookie first, then falls back to an `Authorization: Bearer` header (for API/tooling clients). The client (`client/src/services/api.js`) also mirrors the token into `localStorage` (`iu_token`) and attaches it as a Bearer header via an axios interceptor — so cookie and header auth both work simultaneously by design, not redundantly. Full flow (signup/login/Google OAuth/password reset, role table: admin/editor/contributor/user) is documented in `docs/AUTH_FLOW.md`.

Route protection on the client is enforced by wrapping routes in `<ProtectedRoute>` inside `client/src/App.jsx` — nearly every route is wrapped except auth pages and legal pages; check `App.jsx` before assuming a page is public.

### Client state
Three React Contexts wrap the app (see `client/src/main.jsx`/`App.jsx`): `AuthContext`, `CollectionsContext`, `ToastContext`. `CollectionsContext` is the "floating collection tray" feature — it persists the in-progress collection to `localStorage` (`iu_collection_icons`) independent of the server-side `Collection` model, so a logged-out user can build a collection before ever hitting the API; reconciliation with server-side collections happens through `apiServices.js`'s `collectionService`.

Layout is a single `client/src/layouts/AppLayout.jsx` (not the two-theme Landing/Subpage split described in `docs/PROJECT_STRUCTURE.md` — that doc is stale on this point). `AppLayout` switches styling by `location.pathname` (`isLanding`, `isSearchPage`) rather than by separate layout components.

### Server structure
Standard layered Express app: `routes/` → `controllers/` → `models/`, wired up in `server.js`. All Mongoose models are required eagerly in `server.js` before routes mount (needed for `ref` population to resolve). Centralized `errorHandler` middleware is mounted last; controllers should `next(err)` rather than handling errors inline. `middleware/rateLimiter.js` exposes distinct limiters (`apiLimiter`, `authLimiter`) — SVG proxy requests (`/api/icons/svg*`) are explicitly exempted from the general API limiter in `server.js` since icon grids fire many of these per page.

### Source-of-truth docs (read before changing related code, but verify against current code first)
`docs/` contains planning docs from the project's original spec-driven build process. Some have drifted from the current implementation (e.g. `docs/PROJECT_STRUCTURE.md` and `docs/TECH_STACK.md` still describe a `tokens.json`-driven design system and dual landing/subpage layouts that no longer exist on disk — `tokens.json` and both layout files were removed in favor of Tailwind config + `AppLayout.jsx`). Still useful as the intended contract when accurate:
- `docs/SCHEMA.md` — data model reference for `server/models/`
- `docs/API_Contract.md` — route/response shape reference
- `docs/AUTH_FLOW.md` — accurate as of this writing, matches `middleware/auth.js`
- `docs/Coding_Rules.md` — conventions (functional components only, JSDoc `@desc/@route/@access` headers on controllers, no ad hoc schema fields, don't hardcode colors that belong in the design system)

When a doc and the code disagree, the code wins — but flag the discrepancy rather than silently trusting either.

### SVG handling
User/ingested SVG markup is sanitized server-side via `server/utils/svgSanitizer.js` (DOMPurify + jsdom, allowlisted attributes only) before it's trusted anywhere. The in-browser icon editor (`client/src/components/editor/`) does live recolor/transform on SVG DOM directly — if you touch sanitization, check both the server allowlist and what attributes the editor actually needs to round-trip.
