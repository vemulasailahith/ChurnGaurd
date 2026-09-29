# Deploying ChurnGuard to Render

This guide outlines how to deploy both the **FastAPI Backend** and **React (Vite) Frontend** to [Render](https://render.com) using either the **Automated Blueprint (Recommended)** or **Manual Setup**.

---

## Architecture Overview

| Component | Render Service Type | Root Directory | Build Command | Start / Publish |
| :--- | :--- | :--- | :--- | :--- |
| **Backend** | **Web Service** (Python 3.11) | `backend` | `pip install -r requirements.txt` | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Frontend** | **Static Site** | `frontend` | `npm install && npm run build` | Publish: `./dist`<br>Rewrite: `/*` &rarr; `/index.html` |

---

## Method 1: Render Blueprint (Recommended — 1-Click)

The repository includes a ready-to-use [`render.yaml`](./render.yaml).

### Step 1: Push Changes to GitHub
```bash
git add .
git commit -m "Configure Render deployment and blueprint"
git push origin main
```

### Step 2: Create Blueprint in Render
1. Log in to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** in the top right corner and choose **Blueprint**.
3. Connect your GitHub repository (`ChurnGaurd`).
4. Render will parse [`render.yaml`](./render.yaml) and automatically prepare two services:
   - `churnguard-api` (Web Service)
   - `churnguard-web` (Static Site)
5. Under Environment Variables for `churnguard-api`, provide your Supabase keys:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
6. Click **Apply**.

### Step 3: Link Frontend to Backend URL
1. Once `churnguard-api` is deployed, copy its URL (e.g., `https://churnguard-api.onrender.com`).
2. Go to the `churnguard-web` static site &rarr; **Environment**.
3. Set:
   - `VITE_API_URL`: `https://churnguard-api.onrender.com`
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
4. Click **Save Changes** and trigger a manual redeploy (**Manual Deploy &rarr; Clear build cache & deploy**).

---

## Method 2: Manual Setup on Render

If you prefer to configure each service manually in the Render dashboard:

### 1. Backend Web Service
1. In Render Dashboard, click **New +** &rarr; **Web Service**.
2. Select your repository.
3. Configure the following fields:
   - **Name**: `churnguard-api`
   - **Language**: `Python 3`
   - **Region**: Any (e.g., `Oregon (US West)` or closest to you)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
4. Expand **Advanced** &rarr; **Add Environment Variable**:
   | Key | Value / Note |
   | :--- | :--- |
   | `PYTHON_VERSION` | `3.11.9` |
   | `DATABASE_URL` | `sqlite:///./churnguard.db` (or Render PostgreSQL URL) |
   | `SUPABASE_URL` | `https://your-project-id.supabase.co` |
   | `SUPABASE_ANON_KEY` | `your-supabase-anon-key` |
   | `SUPABASE_SERVICE_ROLE_KEY` | `your-supabase-service-role-key` |
   | `ALLOWED_COMPANY_DOMAIN` | *(Optional, e.g. company.com)* |
5. Click **Create Web Service**. Wait for the build to finish, then copy your backend URL.

---

### 2. Frontend Static Site
1. In Render Dashboard, click **New +** &rarr; **Static Site**.
2. Select your repository.
3. Configure the following fields:
   - **Name**: `churnguard-web`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. In the left navigation, click **Redirects / Rewrites**:
   - Add a rewrite rule:
     - **Type**: `Rewrite`
     - **Source**: `/*`
     - **Destination**: `/index.html`
5. Go to **Environment** &rarr; **Add Environment Variable**:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://churnguard-api.onrender.com` (Your backend URL) |
   | `VITE_SUPABASE_URL` | `https://your-project-id.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `your-supabase-anon-key` |
   | `VITE_ALLOWED_COMPANY_DOMAIN` | *(Optional)* |
6. Click **Create Static Site** (or **Save Changes** & trigger deploy).

---

## Step 4: Supabase Redirect Configuration

To ensure OAuth login and authentication redirects work on your live Render domain:

1. Open your **Supabase Dashboard** &rarr; **Authentication** &rarr; **URL Configuration**.
2. Under **Site URL**, enter your frontend Render URL:
   ```
   https://churnguard-web.onrender.com
   ```
3. Under **Redirect URLs**, add:
   ```
   https://churnguard-web.onrender.com/**
   http://localhost:5173/**
   ```
4. Click **Save**.

---

## Testing Your Live Deployment

1. **Backend Health Check**:
   Open `https://churnguard-api.onrender.com/api/health` in your browser:
   ```json
   { "status": "ok", "service": "ChurnGuard API", "version": "1.0.0" }
   ```
2. **Interactive Swagger API Docs**:
   Open `https://churnguard-api.onrender.com/docs`.
3. **Frontend Application**:
   Open `https://churnguard-web.onrender.com` and log in. Test:
   - Single customer prediction
   - Customer segmentation
   - Executive analytics dashboard
   - Model performance metrics
