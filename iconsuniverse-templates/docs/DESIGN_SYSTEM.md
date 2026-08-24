# Design System — IconsUniverse

IconsUniverse uses **two coordinated themes** from the same design language, applied by page type. Both are Sora-based glassmorphic systems; the landing page is louder and more playful to sell the brand, while every functional subpage is calmer and more "productivity tool"-like so search/browse/download stays easy to use. Full token values live in `tokens.json`; full narrative specs live in `landing_page_layout.md` and `subpage_layout.md` (kept as reference design docs).

## Where each theme applies
| Theme | Token namespace | Pages |
|---|---|---|
| **Vibrant Glass & Energy** | `tokens.landing` | Home / landing page only |
| **Premium Glass & Geometry** | `tokens.subpage` | Search results, category pages, icon/pack detail, pricing, login/signup, dashboard (contributor + admin), 404 |

Never mix themes on the same page. Shared chrome (Navbar, Footer) uses the **subpage** theme by default, except when rendered on the landing page itself, where it inherits the landing theme's glass-nav treatment.

## Brand
- **Primary color:** Landing `#001E52` (Deep Navy) — Subpage `#00327D` (Royal Blue)
- **Secondary/accent color:** Landing `#FF5F52` (Vibrant Coral) — Subpage `#4648D4` (Indigo)
- **Extra energy accents (landing only):** Sunny Yellow `#FFD54F`, Electric Teal `#00F5D4`
- **Background:** Landing `#FAF8FF` — Subpage `#F8F9FF`
- **Text (primary):** Landing `#1A1B20` — Subpage `#0B1C30`
- **Text (muted):** Landing `#434651` — Subpage `#434653`
- **Gradients:** Landing `energy-gradient` (marketing) / `tech-gradient` (interactive) — Subpage `primary-gradient` (main actions) / `accent-gradient` (chips/decorative)

## Typography
- **Landing:** Sora exclusively — Display 64px/800, Headline 36px/700, Body 18px–16px/400, Labels 14px–12px/800 ("sticker" style)
- **Subpage:** Sora for headings (32px/600 headline, 24px/600 sub-headline), Inter for body copy (18px–16px/400) and labels (14px/600, 12px/700) — favors legibility for search results, forms, and data tables
- Base font size: 16px on both themes

## Spacing Scale
- Base unit: 8px on both themes
- Landing: section gaps 120px (lg) / 80px (md), card padding 40px, gutter 32px
- Subpage: section gaps 80px, card padding 32px min, gutter 24px, mobile margin 20px / desktop margin 48px
- Container max-width: 1440px (both)

## Shape
- Pill-shaped (`rounded-full`) for all interactive elements — buttons, inputs, chips, tags — on both themes; sharp corners are never used
- Structural containers: Landing uses `rounded-3xl` (48px) for a "squishy" feel; Subpage uses a minimum 32px radius for a more refined feel

## Components
- **Buttons:** Landing — `energy-gradient` fill, 1.05x hover scale, vibrant colored shadow. Subpage — `primary-gradient` fill with inner glow, 1.02x hover scale.
- **Cards:** Landing — glassmorphic, 48px radius, `surface-glass` (60% opacity white) + 24px blur. Subpage — glassmorphic, 32px radius, `surface-glass` (70% opacity white) + 12px blur, thin 10%-opacity white border.
- **Inputs:** Landing — pill stroke 2px, focus ring `electric-teal`. Subpage — pill with inset shadow (recessed look), 16px horizontal padding.
- **Chips/Tags (category, style, format filters):** Landing — `label-sm` ExtraBold, 15% opacity accent background. Subpage — `label-sm` Bold, `accent-gradient` at 10–15% opacity.
- **Modals:** Subpage theme always (even when triggered from the landing page) — center-screen, 20px+ backdrop blur, since modals (icon preview, login) are functional UI.

## Theme
Light only for v1. Both themes share the same near-white base philosophy (no true dark mode), so no separate dark-mode toggle is required — revisit if user research requests it.

## Logo & Favicon
- Brand mark: abstract navy "pinwheel/aperture" glyph (see `assets/favicon/logo-master-transparent.png`), used standalone in the navbar and as the favicon
- Favicon set generated from the master logo at `assets/favicon/`: `favicon.ico`, `favicon-16x16.png` through `favicon-512x512.png`, `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`, plus `site.webmanifest`
- Wordmark: "IconsUniverse" set in Sora 700, Deep Navy `#001E52` (landing) / Royal Blue `#00327D` (subpage), lockup with the glyph to its left
