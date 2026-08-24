# Deployment Guide — IconsUniverse

## Architecture Overview
- **Frontend SPA**: Hosted on **Vercel** (`client/`)
- **Backend API**: Hosted on **Northflank** (`server/` via Docker)
- **Database**: **MongoDB Atlas** (Managed Cloud Database)
- **Asset Storage**: **Google Drive API** (primary asset sync) + Cloudinary (composite imagery)

---

## 1. Frontend Deployment — Vercel

1. **Repository Root Settings**:
   - Framework Preset: `Vite`
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
2. **Environment Variables**:
   - `VITE_API_BASE_URL`: `https://api.iconsuniverse.com/api` (or your Northflank API URL)
   - `VITE_RAZORPAY_KEY_ID`: `rzp_live_xxxxxxxx` (or test key)
3. **Vercel Configuration (`client/vercel.json`)**:
   ```json
   {
     "rewrites": [
       { "source": "/api/(.*)", "destination": "https://api.iconsuniverse.com/api/$1" },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

---

## 2. Backend Deployment — Northflank

1. **Service Setup**:
   - Service Type: Combined / Web Service
   - Source: GitHub repository
   - Context Path: `/server`
   - Build Type: **Dockerfile** (uses `server/Dockerfile`)
   - Port: `5000` (HTTP)
2. **Environment Variables**:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `mongodb+srv://<username>:<password>@cluster0.qlmyfit.mongodb.net/iconsuniverse?retryWrites=true&w=majority`
   - `JWT_SECRET`: `<secure-random-jwt-secret>`
   - `CLIENT_URL`: `https://iconsuniverse.com` (and preview URLs if testing)
   - `GOOGLE_DRIVE_FOLDER_ID`: `<root-google-drive-icon-folder-id>`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: `<service-account@project.iam.gserviceaccount.com>`
   - `GOOGLE_PRIVATE_KEY`: `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`
   - `RAZORPAY_KEY_ID`: `rzp_live_xxxxxxxx`
   - `RAZORPAY_KEY_SECRET`: `xxxxxxxxxxxxxxxxxxxx`
   - `CLOUDINARY_CLOUD_NAME`: `iconsuniverse`
   - `CLOUDINARY_API_KEY`: `xxxxxxxx`
   - `CLOUDINARY_API_SECRET`: `xxxxxxxx`

---

## 3. Database — MongoDB Atlas

1. **Cluster**: MongoDB Atlas Cluster (`cluster0.qlmyfit.mongodb.net`)
2. **Database Name**: `iconsuniverse`
3. **Network Access**:
   - Allow Northflank egress IP addresses or `0.0.0.0/0` (secured with strong database password authentication).
4. **Database Indexes**:
   - Full text search indexes on `title`, `tags` in `icons` collection.
   - Unique indexes on `email` (users), `slug` (icons, packs, categories).

---

## 4. Google Drive Asset Ingestion Setup

1. Create a Google Cloud Project and enable the **Google Drive API**.
2. Create a **Service Account** and generate a JSON key.
3. Share your Google Drive icon folders with the Service Account email (Viewer / Editor permission).
4. Set `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, and `GOOGLE_DRIVE_FOLDER_ID` in your backend environment variables.
5. In the IconsUniverse Admin Panel, click **Sync from Google Drive** to ingest all vector assets and thumbnails into MongoDB automatically.
