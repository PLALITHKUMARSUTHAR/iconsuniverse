# Project Structure — IconsUniverse

```
iconsuniverse/
├── client/                       # React + Vite frontend
│   ├── public/
│   │   └── favicon/              # favicon.ico, favicon-*.png, apple-touch-icon.png, site.webmanifest
│   ├── src/
│   │   ├── components/
│   │   │   ├── landing/          # Hero, SearchBar, CategoryGrid, TrendingIcons, PricingTeaser (Vibrant Glass & Energy theme)
│   │   │   ├── common/           # Navbar, Footer, Button, GlassCard, Modal, Pagination (shared)
│   │   │   ├── icons/            # IconCard, IconGrid, IconPreviewModal, FormatSelector, ColorPicker
│   │   │   └── dashboard/        # ContributorUploadForm, AdminModerationTable, AnalyticsChart
│   │   ├── pages/                # HomePage, SearchResultsPage, IconDetailPage, PackDetailPage, CategoryPage, PricingPage, LoginPage, SignupPage, DashboardPage, AdminPage, NotFound
│   │   ├── layouts/               # LandingLayout.jsx (theme A), SubpageLayout.jsx (theme B)
│   │   ├── context/               # AuthContext.jsx, CollectionsContext.jsx
│   │   ├── hooks/                 # useAuth.js, useIcons.js, useDebounce.js
│   │   ├── services/              # api.js (axios instance), iconsService.js, authService.js, subscriptionService.js
│   │   ├── styles/                # index.css (Tailwind base + font imports)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── server/                       # Node + Express backend
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   └── cloudinary.js         # Cloudinary SDK config
│   ├── models/                   # User.js, Icon.js, Pack.js, Category.js, Collection.js, Subscription.js, Download.js
│   ├── controllers/              # authController.js, iconController.js, packController.js, categoryController.js, collectionController.js, subscriptionController.js, adminController.js
│   ├── routes/                   # authRoutes.js, iconRoutes.js, packRoutes.js, categoryRoutes.js, collectionRoutes.js, subscriptionRoutes.js, adminRoutes.js
│   ├── middleware/                # auth.js (protect/authorize), errorHandler.js, upload.js (multer), rateLimiter.js
│   ├── utils/                     # zipBuilder.js, svgSanitizer.js, downloadLimit.js
│   ├── server.js
│   └── package.json
├── docs/                          # PRD.md, TECH_STACK.md, SCHEMA.md, API_Contract.md, Coding_Rules.md, DESIGN_SYSTEM.md, ROUTES.md, AUTH_FLOW.md, DEPLOYMENT.md, TESTING.md, SECURITY.md, SEO.md
├── .env.example
├── .gitignore
├── tokens.json
├── seed-data.json
└── README.md
```

## Key Files (Single Source of Truth)
- `tokens.json` — the only source for color/typography/spacing values consumed by `tailwind.config.js`
- `SCHEMA.md` — authoritative data model; all Mongoose schemas in `server/models/` must match it exactly
- `API_Contract.md` — authoritative route/response contract; `server/routes/` and `client/src/services/` must match it exactly
- `layouts/LandingLayout.jsx` — applies the "Vibrant Glass & Energy" theme (home page only)
- `layouts/SubpageLayout.jsx` — applies the "Premium Glass & Geometry" theme (search, icon detail, pricing, dashboard, auth, admin pages)

## Naming Conventions
- Components: PascalCase — `IconCard.jsx`
- Utilities/hooks: camelCase — `useDebounce.js`, `formatDate.js`
- Mongoose models: PascalCase singular — `Icon.js`, `Pack.js`
- Routes: kebab-case paths — `/api/icon-packs`, `/api/collections/:id/icons`
- Route/controller files: camelCase with suffix — `iconRoutes.js`, `iconController.js`
