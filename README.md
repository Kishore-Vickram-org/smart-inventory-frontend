# Harbor Frontend (React)

This UI is a **React (JavaScript/JSX)** app built with **Create React App (react-scripts)**.

## Run locally

From the repo root:

```powershell
cd frontend
npm install
npm start
```

Frontend URL: `http://localhost:3000`

## Backend API

The frontend calls the backend using this base URL:

- `REACT_APP_API_BASE_URL` (build-time env var)

Requests are made to `${REACT_APP_API_BASE_URL}/items`, `${REACT_APP_API_BASE_URL}/locations`, etc.

### Local development default

If `REACT_APP_API_BASE_URL` is not set and you are running on `localhost`, the app defaults to:

- `http://127.0.0.1:8080/api`

To override locally, create `frontend/.env`:

```env
REACT_APP_API_BASE_URL=http://127.0.0.1:8080/api
```

Notes:

- `frontend/.env` is intentionally ignored by git, so it will not affect deployments.
- CRA env vars are baked in at build time; restart the dev server after changing `.env`.

## Deploy to Vercel

This repo deploys the frontend as a static SPA.

Recommended Vercel settings:

1) Set **Root Directory** to `frontend/`
2) Add Environment Variable:
	- `REACT_APP_API_BASE_URL` = `https://<your-backend-host>/api`
3) Deploy

### `/api` proxy rewrite (fallback)

If `REACT_APP_API_BASE_URL` is not set in the Vercel build, the frontend falls back to calling `/api` on the same domain.

This repo’s Vercel config includes a rewrite that proxies `/api/*` to a hosted backend:

- `https://smart-ineventory-backend.onrender.com/api/*`

If you fork/host the backend elsewhere, update the rewrite destination in:

- `vercel.json` (repo root)
- `frontend/vercel.json`

## Challenges faced (and fixes)

### 1) Frontend and backend connection issues after deployment

**Problem**: Once deployed on Vercel, the frontend cannot call `localhost`, and API calls fail if the app is still pointing to a local backend.

**Fix**:

- Set `REACT_APP_API_BASE_URL` in the **Vercel Project → Environment Variables** to your hosted backend, e.g. `https://<backend-host>/api`.

### 2) “API returned HTML instead of JSON”

**Problem**: When the app falls back to `API base: /api`, some hosting setups can serve the SPA `index.html` for `/api/*`, so `fetch()` receives HTML instead of JSON.

**Fix**:

- This repo includes a Vercel rewrite that proxies `/api/*` to the hosted backend.
- If you move the backend, update the destination URL in the Vercel config.

### 3) Environment variables not taking effect

**Problem**: CRA environment variables are evaluated at **build time**. Also, `frontend/.env` is ignored by git so it won’t affect cloud builds.

**Fix**:

- For local dev, use `frontend/.env` and restart `npm start`.
- For Vercel, set `REACT_APP_API_BASE_URL` in the Vercel dashboard and redeploy.

### 4) HTTP 409 “Operation violates data integrity constraints”

**Problem**: Creating an item can fail if it violates a backend constraint (commonly duplicates).

**Fix**:

- Use unique SKUs/codes when testing.
- If needed, reset the backend database and retry.
