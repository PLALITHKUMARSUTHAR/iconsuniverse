# IconsUniverse — Template Package

This is the full set of filled-in planning/scaffold files for **IconsUniverse** (iconsuniverse.com), a Flaticon-style icon/illustration/sticker marketplace. Feed this whole package to Antigravity (or any AI coding agent) as project context to generate the actual application code.

## How this package is organized

```
iconsuniverse-templates/
├── docs/                        # All planning docs — READ THESE FIRST
│   ├── PRD.md                   # Product scope & features
│   ├── TECH_STACK.md            # Stack decisions
│   ├── SCHEMA.md                # Database structure
│   ├── API_Contract.md          # API routes & response shapes
│   ├── Coding_Rules.md          # AI coding agent rules — give this to Antigravity as system context
│   ├── PROJECT_STRUCTURE.md     # Folder/file layout
│   ├── DESIGN_SYSTEM.md         # Merged theme rules (landing vs subpage)
│   ├── ROUTES.md                # Full frontend + backend route map
│   ├── AUTH_FLOW.md             # Auth/JWT/OAuth flow
│   ├── DEPLOYMENT.md            # Vercel/Render/Atlas deploy steps
│   ├── TESTING.md               # Test strategy
│   ├── SECURITY.md              # Security practices
│   ├── SEO.md                   # SEO/content strategy
│   ├── CONTRIBUTING.md, CHANGELOG.md
│   ├── README.md                # Project-level README (also duplicated at package root)
│   ├── color_palette_landing.md         # Your original "Vibrant Glass & Energy" spec (reference)
│   ├── landing_page_layout_reference.md # Your original landing layout spec (reference)
│   └── subpage_layout_reference.md      # Your original "Premium Glass & Geometry" spec (reference)
│
├── models/                      # Mongoose models matching SCHEMA.md exactly
│   ├── User.js
│   ├── Icon.js
│   ├── Pack.js
│   ├── Category.js
│   ├── Collection.js
│   ├── Subscription.js
│   └── Download.js
│
├── server-templates/            # Backend scaffold (place inside server/ per PROJECT_STRUCTURE.md)
│   ├── server.js
│   ├── db.js                    # config/db.js
│   ├── cloudinary.js            # config/cloudinary.js
│   ├── errorHandler.js          # middleware/errorHandler.js
│   ├── auth.js                  # middleware/auth.js
│   ├── iconController.js        # controllers/iconController.js — worked example; replicate pattern for packs/categories/etc
│   ├── iconRoutes.js            # routes/iconRoutes.js — worked example
│   ├── .env.example
│   └── package.json
│
├── client-templates/            # Frontend scaffold (place inside client/ per PROJECT_STRUCTURE.md)
│   ├── index.html               # wired to /favicon assets below
│   ├── App.jsx                  # routes landing vs subpage theme layouts
│   ├── main.jsx
│   ├── NotFound.jsx
│   ├── tailwind.config.js       # reads tokens.json directly
│   ├── vite.config.js
│   ├── postcss.config.js
│   ├── package.json
│   ├── .eslintrc.json
│   ├── robots.txt
│   └── sitemap.xml
│
├── assets/favicon/               # Generated from your logo (screen.png) — copy this folder to client/public/favicon/
│   ├── favicon.ico
│   ├── favicon-16x16.png ... favicon-512x512.png
│   ├── apple-touch-icon.png
│   ├── android-chrome-192x192.png / 512x512.png
│   ├── site.webmanifest
│   ├── logo-master-transparent.png   # full-res transparent logo, for navbar/branding use
│   └── og-image.png                  # 1200x630 social share image
│
├── tokens.json                   # Design tokens (both themes) — single source of truth for Tailwind
├── seed-data.json                # Sample categories/users/packs/icons for local dev
├── README.md                     # Root project README
├── LICENSE
├── .gitignore
├── .prettierrc
├── .nvmrc
└── .github-ci.yml                # Rename to .github/workflows/ci.yml in the actual repo
```

## Quick start for using this with Antigravity
1. Give the agent `docs/Coding_Rules.md`, `docs/PRD.md`, `docs/SCHEMA.md`, `docs/API_Contract.md`, and `docs/PROJECT_STRUCTURE.md` as context first.
2. Then provide `tokens.json` and `docs/DESIGN_SYSTEM.md` for styling.
3. Ask it to scaffold the actual `client/` and `server/` folders using the files in `client-templates/`, `server-templates/`, and `models/` as the starting point — it should replicate the `iconController.js` / `iconRoutes.js` pattern for `packs`, `categories`, `collections`, `subscriptions`, and `admin`.
4. Copy `assets/favicon/*` into `client/public/favicon/`.
