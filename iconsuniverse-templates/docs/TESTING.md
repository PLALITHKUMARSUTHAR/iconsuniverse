# Testing Strategy — IconsUniverse

## Scope
Unit tests for utils (SVG sanitizer, ZIP builder, download-limit logic), integration tests for API routes (auth, icons, packs, subscriptions), manual QA for UI flows (search, preview/recolor, checkout).

## Tools
- Backend: Jest + Supertest
- Frontend: Vitest + React Testing Library

## What to Test
| Area | Type | Priority |
|---|---|---|
| Auth endpoints (signup/login/Google OAuth) | Integration | High |
| Download flow (free-tier cap, Pro unlimited, premium lock) | Integration | High |
| Subscription checkout + Razorpay webhook handling | Integration | High |
| Icon/pack search & filtering | Integration | Medium |
| SVG sanitization before inline render | Unit | High |
| Contributor upload form validation | Unit | Medium |
| UI components (IconCard, FormatSelector, ColorPicker) | Unit | Low |

## Running Tests
```bash
cd server && npm test
cd client && npm run test
```

## Pre-Deploy Checklist
- [ ] All critical-path tests passing (auth, download, payment)
- [ ] Manual test of the Razorpay checkout flow on staging with a test key
- [ ] Manual test of free-tier daily download cap resetting correctly
- [ ] No console errors on home, search, icon detail, and pricing pages
