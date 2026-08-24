# Authentication Flow — IconsUniverse

## Strategy
JWT stored in an **httpOnly, Secure, SameSite=Lax cookie** (not localStorage) to reduce XSS token-theft risk, since IconsUniverse renders user-uploaded SVG content that must be sanitized but is still an elevated risk surface. A `Bearer` header fallback is also accepted for API-only/tooling clients.

## Signup
1. Client sends `POST /api/auth/signup` with `{ name, email, password }`
2. Server hashes password with bcrypt (12 rounds), creates `User` with `role: 'user'`, `plan: 'free'`
3. Server issues JWT (sets httpOnly cookie + returns token in body for API clients), sends verification email via Nodemailer

## Login
1. Client sends `POST /api/auth/login` with `{ email, password }`
2. Server verifies credentials via `bcrypt.compare`
3. Server issues JWT, sets cookie, returns `{ user, token }`

## Google OAuth
1. Client redirects to `GET /api/auth/google`
2. Google consent screen → callback hits `GET /api/auth/google/callback`
3. Server finds-or-creates `User` by `googleId`/email, issues JWT, redirects to `CLIENT_URL/oauth/callback?token=...`
4. Client stores token, redirects to `/dashboard`

## Token Verification
- `middleware/auth.js` (`protect`) checks the httpOnly cookie first, then `Authorization: Bearer` header, on protected routes
- Token expiry: 7 days (`JWT_EXPIRES_IN`)
- Refresh strategy: none in v1 — user re-logs in after expiry; revisit refresh-token rotation if session length becomes a complaint

## Roles & Permissions
| Role | Access |
|---|---|
| admin | Full access — moderation, analytics, category management, all user data |
| editor | Approve/reject icons & packs, manage categories; no billing/user admin |
| contributor | Upload icons/packs (pending review), manage own uploads |
| user | Browse, download (per plan limits), manage own collections |

## Password Reset
1. Client requests `POST /api/auth/forgot-password` with `{ email }`
2. Server generates a signed, time-limited (1 hour) reset token, emails a reset link via Nodemailer
3. Client submits new password to `POST /api/auth/reset-password` with `{ token, newPassword }`
4. Server verifies token + expiry, updates hashed password, invalidates the reset token
