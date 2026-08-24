# IconsUniverse — AI Coding Rules

## Project Context
IconsUniverse is a MERN-stack icon/illustration marketplace (Flaticon-style). React + Vite + Tailwind frontend, Express + MongoDB backend, Cloudinary for asset storage, Razorpay for Pro subscriptions. Built with an AI-assisted "vibecoding" workflow (Antigravity) from this fixed set of planning docs.

## Tech Stack
See TECH_STACK.md

## Source of Truth Files
- `PRD.md` — product scope; do not add/remove MVP features without updating this file first
- `SCHEMA.md` — database structure; models must match exactly, no ad hoc fields
- `API_Contract.md` — all routes/controllers must match these exact paths, methods, and response shapes
- `tokens.json` — the only source for colors/typography/spacing values; never hardcode hex codes or px values in components
- `DESIGN_SYSTEM.md` — component-level styling rules (landing vs. subpage themes)
- `PROJECT_STRUCTURE.md` — folder/file layout and naming conventions

## Coding Conventions
- Language: JavaScript (ES2021+), no TypeScript in v1
- Style: Functional React components only, hooks-based state, no class components
- Error handling: All Express controllers wrapped in try/catch, always call `next(err)` to reach `errorHandler.js`; never leak stack traces in production responses
- Comments: JSDoc-style `@desc / @route / @access` header on every controller function; brief inline comments only where logic isn't self-evident
- File naming: Components `PascalCase.jsx`, hooks `useCamelCase.js`, utilities `camelCase.js`, Mongoose models `PascalCase.js` (singular, e.g. `Icon.js`), Express routes `camelCase.routes.js`, controllers `camelCase.controller.js`
- All async DB/network calls must be awaited inside try/catch — no unhandled promise rejections
- Never store secrets, API keys, or Cloudinary/Razorpay credentials in source — always via `process.env`

## Do Not
- Don't modify `tokens.json` or `tailwind.config.js` color/spacing values without explicit approval — all styling must derive from these tokens
- Don't add new npm dependencies without asking first
- Don't touch `/server/config/*` or `.env*` files directly — describe the required variable instead
- Don't bypass the Cloudinary upload pipeline to store files on server disk
- Don't write directly to `downloadCount` / `iconCount` fields outside the designated increment endpoints — these are denormalized counters and must stay consistent with the `downloads` collection
- Don't mix the two design themes (landing vs. subpage) within the same page — see DESIGN_SYSTEM.md for where each applies

## Workflow Preference
- Propose changes (files to touch + approach) before writing code — approval before execution
- Work in small, reviewable chunks (one resource/feature per PR-sized change)
- Reference the exact SCHEMA.md / API_Contract.md section being implemented at the top of the change summary

## Testing
- Run `npm run lint` and `npm test` before marking any backend task complete
- Manually verify the download flow (free-tier cap + Pro unlimited) and Razorpay checkout on staging before merging billing-related changes
