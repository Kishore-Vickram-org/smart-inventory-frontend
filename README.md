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
