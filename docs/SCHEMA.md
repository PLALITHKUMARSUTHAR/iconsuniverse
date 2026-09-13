# Database Schema — IconsUniverse

## Collection: users
| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| name | String | Yes | — | Display name |
| email | String | Yes | — | Unique, lowercase, indexed |
| password | String | No | — | Hashed with bcrypt; absent for Google OAuth accounts |
| googleId | String | No | null | Set when authenticated via Google OAuth |
| avatarUrl | String | No | default avatar | Profile avatar URL |
| role | String (enum: user, contributor, editor, admin) | Yes | 'user' | Access control |
| plan | String (enum: free, pro_monthly, pro_annual) | Yes | 'free' | Active subscription tier |
| subscriptionId | ObjectId (ref: subscriptions) | No | null | Active subscription document |
| downloadCountToday | Number | Yes | 0 | Daily free quota counter |
| lastDownloadResetAt | Date | Yes | now | Daily reset timestamp |
| collections | [ObjectId] (ref: collections) | No | [] | Array of user-created board IDs |
| isVerified | Boolean | Yes | false | Email verification flag |
| createdAt / updatedAt | Date | Yes | auto | Timestamps |

---

## Collection: icons
| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| title | String | Yes | — | Asset name e.g. "Shopping Cart" |
| slug | String | Yes | — | Unique, URL-safe slug |
| svgContent | String | No | '' | Raw SVG XML string for instant inline recoloring & editor |
| svgUrl | String | Yes | — | Master SVG URL (Google Drive / Cloudinary) |
| pngPreviewUrl | String | Yes | — | High-speed PNG preview URL |
| epsUrl | String | No | null | EPS vector file link |
| googleDriveFileId | String | No | null | Source Google Drive file ID if synced from Drive |
| googleDriveFolderId | String | No | null | Source Google Drive parent folder ID |
| tags | [String] | Yes | [] | Lowercase search keywords (Indexed) |
| categoryId | ObjectId (ref: categories) | Yes | — | Primary category reference |
| packId | ObjectId (ref: packs) | No | null | Associated icon pack / family ID |
| style | String (enum: outline, filled, color, flat, gradient, hand-drawn, 3d) | Yes | 'outline' | Visual style filter |
| colors | [String] | No | [] | Extracted hex colors in the SVG for palette filtering |
| isPremium | Boolean | Yes | false | Restricts download to Pro subscribers |
| contributorId | ObjectId (ref: users) | Yes | — | Uploader or System curator |
| downloadCount | Number | Yes | 0 | Popularity counter |
| status | String (enum: pending, approved, rejected) | Yes | 'approved' | Moderation status |
| createdAt / updatedAt | Date | Yes | auto | Timestamps |

---

## Collection: packs
| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| title | String | Yes | — | Pack name e.g. "E-Commerce Essential Outline" |
| slug | String | Yes | — | Unique slug |
| description | String | No | '' | Overview & design notes |
| coverImageUrl | String | Yes | — | Thumbnail banner |
| iconCount | Number | Yes | 0 | Cached count of icons in pack |
| categoryId | ObjectId (ref: categories) | Yes | — | Primary category |
| contributorId | ObjectId (ref: users) | Yes | — | Creator |
| googleDriveFolderId | String | No | null | Google Drive folder source |
| isPremium | Boolean | Yes | false | Gated to Pro subscribers |
| status | String (enum: pending, approved, rejected) | Yes | 'approved' | Moderation state |
| createdAt / updatedAt | Date | Yes | auto | Timestamps |

---

## Collection: categories
| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| name | String | Yes | — | e.g. "Shopping & E-Commerce", "Finance" |
| slug | String | Yes | — | Unique slug |
| iconThumbnailUrl | String | No | null | Representative icon illustration |
| iconCount | Number | No | 0 | Total icons count in category |
| parentCategoryId | ObjectId (ref: categories) | No | null | Nested subcategory support |

---

## Collection: collections (User Boards)
| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| name | String | Yes | — | e.g. "Mobile App Icons" |
| userId | ObjectId (ref: users) | Yes | — | Owner reference |
| iconIds | [ObjectId] (ref: icons) | Yes | [] | Array of saved icon references |
| isPublic | Boolean | Yes | false | Shareable public link switch |
| customPalette | [String] | No | [] | Bulk recolor palette applied to board |
| createdAt / updatedAt | Date | Yes | auto | Timestamps |

---

## Collection: subscriptions
| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| userId | ObjectId (ref: users) | Yes | — | User reference |
| razorpaySubscriptionId | String | Yes | — | Razorpay subscription ID |
| plan | String (enum: pro_monthly, pro_annual) | Yes | — | Billing cadence |
| status | String (enum: created, active, halted, cancelled, expired) | Yes | 'created' | Subscription status |
| currentPeriodEnd | Date | Yes | — | Access expiration date |
| createdAt / updatedAt | Date | Yes | auto | Timestamps |

---

## Collection: downloads
| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| userId | ObjectId (ref: users) | No | null | User (null for anonymous) |
| iconId | ObjectId (ref: icons) | No | null | Downloaded single icon |
| packId | ObjectId (ref: packs) | No | null | Downloaded pack ZIP |
| format | String (enum: svg, png, eps, zip, webfont, base64) | Yes | — | Output format |
| resolution | Number | No | null | PNG resolution (16..512) |
| ipAddress | String | No | null | Rate limit & analytics IP |
| createdAt | Date | Yes | auto | Timestamp |

---

## Collection: drive_sync_logs
| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| folderId | String | Yes | — | Synced Google Drive folder ID |
| status | String (enum: running, completed, failed) | Yes | 'completed' | Job outcome |
| totalFound | Number | Yes | 0 | Files discovered |
| iconsIngested | Number | Yes | 0 | New icons saved to DB |
| iconsUpdated | Number | Yes | 0 | Existing icons refreshed |
| errors | [String] | No | [] | Error log traces |
| triggeredBy | ObjectId (ref: users) | No | null | Admin user |
| createdAt | Date | Yes | auto | Timestamp |
