# Routes Map — IconsUniverse

## Frontend Routes (React Router)
| Path | Component | Auth Required | Notes |
|---|---|---|---|
| `/` | HomePage | No | Landing theme; hero search, trending icons, categories |
| `/search` | SearchResultsPage | No | Query/category/style filters |
| `/icons/:slug` | IconDetailPage | No | Preview, recolor, format selector, download CTA |
| `/packs/:slug` | PackDetailPage | No | Pack overview + contained icons grid |
| `/pricing` | PricingPage | No | Free vs Pro plan comparison, Razorpay checkout |
| `/login` | LoginPage | No | Email/password + "Continue with Google" |
| `/signup` | SignupPage | No | Email/password signup |
| `/oauth/callback` | OAuthCallbackPage | No | Consumes token from Google OAuth redirect |
| `/dashboard` | DashboardPage | Yes | My collections; contributors see upload form + their packs/icons |
| `/dashboard/admin` | AdminModerationPage | Yes (editor, admin) | Approve/reject queue, category management |
| `/dashboard/analytics` | AdminAnalyticsPage | Yes (admin) | Downloads/revenue overview |
| `*` | NotFound | No | 404 |

## Backend Routes (Express)
| Method | Path | Controller | Auth Required | Notes |
|---|---|---|---|---|
| POST | `/api/auth/signup` | authController.signup | No | |
| POST | `/api/auth/login` | authController.login | No | |
| GET | `/api/auth/google` | authController.googleRedirect | No | |
| GET | `/api/auth/google/callback` | authController.googleCallback | No | |
| GET | `/api/auth/me` | authController.getMe | Yes | |
| GET | `/api/icons` | iconController.getIcons | No | Search/filter/paginate |
| GET | `/api/icons/:slug` | iconController.getIconBySlug | No | |
| GET | `/api/icons/:id/download` | iconController.downloadIcon | No* | *Anonymous allowed with daily cap |
| POST | `/api/icons` | iconController.createIcon | Yes (contributor+) | multipart upload |
| PUT | `/api/icons/:id` | iconController.updateIcon | Yes (owner/editor/admin) | |
| DELETE | `/api/icons/:id` | iconController.deleteIcon | Yes (owner/editor/admin) | |
| GET | `/api/packs` | packController.getPacks | No | |
| GET | `/api/packs/:slug` | packController.getPackBySlug | No | |
| GET | `/api/packs/:id/download` | packController.downloadPack | Yes for premium | Streams ZIP |
| POST | `/api/packs` | packController.createPack | Yes (contributor+) | |
| GET | `/api/categories` | categoryController.getCategories | No | |
| POST | `/api/categories` | categoryController.createCategory | Yes (editor, admin) | |
| GET | `/api/collections` | collectionController.getMyCollections | Yes | |
| POST | `/api/collections` | collectionController.createCollection | Yes | |
| PUT | `/api/collections/:id/icons` | collectionController.updateIcons | Yes (owner) | |
| POST | `/api/subscriptions/create-order` | subscriptionController.createOrder | Yes | |
| POST | `/api/subscriptions/verify` | subscriptionController.verifyPayment | Yes | |
| POST | `/api/subscriptions/webhook` | subscriptionController.webhook | No (signature-verified) | Razorpay webhook |
| POST | `/api/subscriptions/cancel` | subscriptionController.cancel | Yes | |
| GET | `/api/admin/moderation/queue` | adminController.getQueue | Yes (editor, admin) | |
| PUT | `/api/admin/moderation/:type/:id` | adminController.moderate | Yes (editor, admin) | |
| GET | `/api/admin/analytics` | adminController.getAnalytics | Yes (admin) | |

## Route Guards
- `ProtectedRoute.jsx` — redirects to `/login` if no valid token in `AuthContext`
- `RoleRoute.jsx` — wraps `ProtectedRoute`; checks `user.role` is in an allowed list (used for `/dashboard/admin`)
