# Security Practices — IconsUniverse

## Input Validation
- `express-validator` on all POST/PUT bodies (auth, icon/pack metadata, collection updates)
- Sanitize user-generated content before storage/render: uploaded SVGs are stripped of `<script>`, event-handler attributes, and external references via `DOMPurify` (server-side, on upload) and again client-side (`dompurify`) before inline injection for recoloring

## Rate Limiting
- `express-rate-limit` — 300 req / 15 min per IP on `/api/*`
- Stricter limit on auth routes: 10 req / 15 min per IP on `/api/auth/login` and `/api/auth/signup`
- Anonymous download endpoint additionally capped per-IP per-day (separate from the general rate limiter) to enforce the free-tier download cap

## CORS
- Allowed origins: `https://iconsuniverse.com`, `https://www.iconsuniverse.com`, `http://localhost:5173` (dev only)

## Secrets
- Never committed to repo — see `.env.example`
- Rotation policy: rotate `JWT_SECRET`, Cloudinary, and Razorpay keys immediately if a leak is suspected; rotate on a 6-month cadence otherwise

## Headers
- `helmet.js` enabled on all backend responses

## File Uploads
- Max size: 5MB per SVG, 20MB per pack ZIP submission
- Allowed types: `.svg`, `.png`, `.eps` for icon assets; images only for avatars/cover art
- Storage: Cloudinary — never store raw uploaded files on server disk; `multer` uses in-memory storage and streams directly to Cloudinary

## Known Risks / TODO
- [ ] Add CSRF protection (double-submit cookie) since auth uses cookie-based JWT
- [ ] Add 2FA for admin and editor accounts
- [ ] Add malware/AV scanning step on contributor pack uploads before they enter the moderation queue
