# API Contract — IconsUniverse

Base URL (Dev): `http://localhost:5000/api`  
Base URL (Northflank Prod): `https://api.iconsuniverse.com/api`  
Standard Response Format: `{ "success": boolean, "data"?: any, "message"?: string }`

---

## 1. Authentication Endpoints

- `POST /api/auth/signup` — Public. Body: `{ name, email, password }` -> Returns `{ user, token }`
- `POST /api/auth/login` — Public. Body: `{ email, password }` -> Returns `{ user, token }`
- `GET /api/auth/me` — Protected (JWT). Returns `{ user }` with current daily quota & subscription info
- `PUT /api/auth/profile` — Protected. Body: `{ name, avatarUrl }` -> Returns `{ user }`

---

## 2. Icons Endpoints

- `GET /api/icons` — Public. Query parameters:
  - `q`: Search keyword
  - `category`: Category slug or ID
  - `style`: `outline` | `filled` | `color` | `flat` | `gradient` | `hand-drawn` | `3d`
  - `isPremium`: `true` | `false`
  - `color`: Hex color filter
  - `sort`: `popular` | `recent` | `downloads`
  - `page`: Page number (default 1)
  - `limit`: Items per page (default 40)
  - Response: `{ icons: Icon[], total: number, page: number, totalPages: number }`

- `GET /api/icons/:slug` — Public. Returns `{ icon, related: Icon[] }` with raw SVG content and pack info
- `GET /api/icons/:id/download` — Public / Protected. Query: `format=svg|png|eps|base64`, `size=16..512`. Checks daily free quota; returns download stream or base64 JSON
- `POST /api/icons` — Protected (Contributor/Admin). Body: `multipart/form-data` with SVG file, title, tags, style, categoryId, packId
- `PUT /api/icons/:id` — Protected (Owner/Admin). Body: Icon metadata updates
- `DELETE /api/icons/:id` — Protected (Owner/Admin)

---

## 3. Icon Packs Endpoints

- `GET /api/packs` — Public. Query: `q`, `category`, `page`, `limit`
- `GET /api/packs/:slug` — Public. Returns `{ pack, icons: Icon[] }`
- `GET /api/packs/:id/download` — Protected (Pro for premium packs, Free for standard). Returns ZIP stream of all pack icons in requested formats
- `POST /api/packs` — Protected (Contributor/Admin). Create pack with cover and multiple SVGs

---

## 4. Categories Endpoints

- `GET /api/categories` — Public. Returns category tree with icon counts
- `GET /api/categories/:slug` — Public. Returns category info + featured icons
- `POST /api/categories` — Protected (Admin). Create new category

---

## 5. Collections (User Boards) Endpoints

- `GET /api/collections` — Protected. Returns all boards owned by the authenticated user
- `POST /api/collections` — Protected. Body: `{ name, isPublic }` -> Creates new board
- `GET /api/collections/:id` — Public if `isPublic`, otherwise Protected (Owner). Returns populated collection icons
- `POST /api/collections/:id/icons` — Protected (Owner). Body: `{ iconId }` -> Adds icon to collection
- `DELETE /api/collections/:id/icons/:iconId` — Protected (Owner). Removes icon from collection
- `POST /api/collections/:id/bulk-download` — Protected. Query: `format=svg|png`, `size=64`. Returns ZIP archive stream of all collection assets
- `POST /api/collections/:id/webfont` — Protected. Generates and streams custom `.woff`/`.ttf` WebFont bundle + `icons.css` stylesheet
- `PUT /api/collections/:id/recolor` — Protected. Body: `{ colorPalette: string[] }` -> Saves custom recolor preferences for the collection

---

## 6. Subscriptions Endpoints

- `POST /api/subscriptions/create-order` — Protected. Body: `{ plan: "pro_monthly" | "pro_annual" }` -> Returns Razorpay order details
- `POST /api/subscriptions/verify` — Protected. Body: `{ razorpay_payment_id, razorpay_order_id, razorpay_signature, plan }` -> Activates Pro subscription
- `POST /api/subscriptions/cancel` — Protected. Cancels active subscription
- `POST /api/subscriptions/webhook` — Public (Verified via Razorpay HMAC signature header)

---

## 7. Google Drive Sync & Ingestion Endpoints

- `POST /api/drive/sync` — Protected (Admin). Body: `{ folderId?: string, forceRefresh?: boolean }` -> Triggers background Google Drive crawler and imports icons
- `GET /api/drive/status` — Protected (Admin). Returns current sync state, last sync timestamp, and history logs
- `GET /api/drive/preview` — Protected (Admin). Query: `folderId`. Previews Google Drive files without writing to DB

---

## 8. Admin Moderation & Analytics Endpoints

- `GET /api/admin/moderation/queue` — Protected (Admin). Returns pending icon/pack submissions
- `PUT /api/admin/moderation/:type/:id` — Protected (Admin). Body: `{ status: "approved" | "rejected", feedback?: string }`
- `GET /api/admin/analytics` — Protected (Admin). Returns system metrics: total downloads, active Pro users, top search queries, and revenue
