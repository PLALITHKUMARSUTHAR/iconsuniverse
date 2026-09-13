# IconsUniverse

A searchable icon, illustration, and sticker marketplace — free downloads with attribution, or unlimited attribution-free downloads on a Pro plan. Built with the MERN stack.

## Setup
```bash
git clone https://github.com/[your-org]/iconsuniverse.git
cd iconsuniverse
cd client && npm install
cd ../server && npm install
```

## Environment Variables
Copy `.env.example` to `.env` in `server/` (and the `VITE_`-prefixed values into `client/.env`) and fill in values — see the file for the full list (MongoDB, JWT, Google OAuth, Cloudinary, Razorpay, MSG91, SMTP).

## Running Locally
```bash
# Terminal 1 — backend
cd server && npm run dev     # http://localhost:5000

# Terminal 2 — frontend
cd client && npm run dev     # http://localhost:5173
```

## Build
```bash
cd client && npm run build
```

## Deployment
- Frontend: Vercel — auto-deploys `client/` from `main` branch, `iconsuniverse.com`
- Backend: Render — auto-deploys `server/` from `main` branch, `api.iconsuniverse.com`
- Database: MongoDB Atlas (cluster0.qlmyfit.mongodb.net)
- Assets: Cloudinary

See `docs/DEPLOYMENT.md` for the full checklist.

## Folder Structure
See `docs/PROJECT_STRUCTURE.md`

## Design System
Two themes apply across the site — see `docs/DESIGN_SYSTEM.md` and `tokens.json`:
- **Landing page** — "Vibrant Glass & Energy" (playful, high-saturation)
- **All subpages** (search, icon/pack detail, pricing, auth, dashboard, admin) — "Premium Glass & Geometry" (refined glassmorphism)

## Branding
- Site name: **IconsUniverse**
- Domain: iconsuniverse.com
- Favicon/logo assets: see `assets/favicon/` (generated from the master logo)
