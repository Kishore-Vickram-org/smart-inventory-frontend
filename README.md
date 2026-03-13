# Harbor Frontend (Create React App)

This UI is a **React (JavaScript/JSX)** app built with **Create React App (`react-scripts`)**.

## Run locally

From this repo root:

```powershell
npm install
npm start
```

Frontend URL (CRA dev server): `http://localhost:3000`

## Backend API

The frontend calls the backend using this base URL (build-time env var):

- `REACT_APP_API_BASE_URL`

If `REACT_APP_API_BASE_URL` is not set, the app falls back to calling `/api` on the same origin.

Requests are made to `${REACT_APP_API_BASE_URL}/items`, `${REACT_APP_API_BASE_URL}/locations`, etc.

### Local development default

If `REACT_APP_API_BASE_URL` is not set and you are running on `localhost`, the app defaults to:

- `http://127.0.0.1:8080/api`

If you are not running a backend locally, set `REACT_APP_API_BASE_URL` to a hosted backend (example below).

To override locally, create `.env` (repo root):

```env
REACT_APP_API_BASE_URL=http://127.0.0.1:8080/api
```

Example using the older hosted backend:

```env
REACT_APP_API_BASE_URL=https://smart-ineventory-backend.onrender.com/api
```

Example using the Azure backend:

```env
REACT_APP_API_BASE_URL=https://inventory-backend-cxaqcqh9hnbdbpab.southeastasia-01.azurewebsites.net/api
```

Notes:

- CRA env vars are baked in at build time; restart `npm start` after changing `.env`.
- For Azure App Service, set the env var in **Configuration → Application settings** and redeploy to rebuild.

## Deploy to Vercel

This repo deploys the frontend as a static SPA.

Recommended Vercel settings:

1) Set **Root Directory** to the repo root
2) Add Environment Variable:
	- `REACT_APP_API_BASE_URL` = `https://<your-backend-host>/api`
3) Deploy

### `/api` proxy rewrite (fallback)

If `REACT_APP_API_BASE_URL` is not set in the Vercel build, the frontend falls back to calling `/api` on the same domain.

This repo’s Vercel config includes a rewrite that proxies `/api/*` to a hosted backend:

- `https://smart-ineventory-backend.onrender.com/api/*`

If you fork/host the backend elsewhere, update the rewrite destination in:

- `vercel.json` (repo root)

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

**Problem**: CRA environment variables are evaluated at **build time**. Your local `.env` won’t affect a cloud build unless those variables are also set in the cloud build environment.

**Fix**:

- For local dev, use `.env` and restart `npm run dev`.
- For Vercel/Azure, set `REACT_APP_API_BASE_URL` in the hosting provider’s environment variables and redeploy.

## Deploy to Azure App Service (Node.js)

This project is configured so Azure can build and serve the production SPA automatically:

- `postinstall` runs `npm run build` (CRA outputs to `build/`)
- Use `npm run serve` to serve `build/` on `$PORT` (via `scripts/serve-build.js` so it works on Azure Linux/Windows)

### 1) Create the App Service

- Create an **Azure App Service** for **Node.js** (Linux is recommended).
- Pick a Node LTS runtime (e.g. 18 or 20).

### 2) Configure the backend URL (required)

In **App Service → Configuration → Application settings**, add:

- `REACT_APP_API_BASE_URL` = `https://inventory-backend-cxaqcqh9hnbdbpab.southeastasia-01.azurewebsites.net/api`

Notes:

- You can also set it to the host only (`https://inventory-backend-cxaqcqh9hnbdbpab.southeastasia-01.azurewebsites.net`) and the frontend will assume `/api`.
- This value is evaluated at **build time**, so if you change this setting you must redeploy (or trigger a rebuild) for the new value to be baked into the JS bundle.

### 3) Deploy

Use any of these options:

- **Deployment Center → GitHub**: connect the repo and deploy.
- **Zip deploy**: upload the repo contents (must include `package.json`).

Azure will run:

1) `npm install` (installs dependencies)
2) `postinstall` → `npm run build`
3) `npm start` → serves `build/` on `$PORT`

### 4) Verify

- Browse to your App Service URL.
- Open DevTools → Network and confirm requests go to your backend host.

### 4) HTTP 409 “Operation violates data integrity constraints”

**Problem**: Creating an item can fail if it violates a backend constraint (commonly duplicates).

**Fix**:

- Use unique SKUs/codes when testing.
- If needed, reset the backend database and retry.

## Screenshots

![Alt text]_(https://github.com/kishorevic12/smart-inventory-frontend/blob/main/Screenshot%20(496).png)

## Presentation

[Download Project PPT]_(https://github.com/kishorevic12/smart-inventory-frontend/blob/main/Smart-Harbor-Inventory-System.pptx)

## Frontend Link
https://smart-inventory-harbor.vercel.app/
