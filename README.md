# Harbor Frontend (React)

This UI is a **React (JavaScript/JSX)** app.

It uses **Create React App (react-scripts)**.

## Run locally

From the repo root:

```powershell
cd frontend
npm install
npm start
```

Frontend URL: `http://localhost:5173`

`npm start` also works (it’s an alias for the dev server).

## Backend API

During development, the frontend calls the backend directly at `http://localhost:8081/api` by default.

You can override that by setting `REACT_APP_API_BASE_URL`.

## Deploy to Vercel (Frontend only)

This repo uses **Create React App**, so Vercel deploys it as a static SPA.

1) In Vercel, set **Root Directory** to `frontend/` (recommended)
2) Add an Environment Variable:
	- `REACT_APP_API_BASE_URL` = `https://<your-backend-host>/api`
3) Deploy

Notes:
- Vercel deploys the frontend only. Your Spring Boot backend must be hosted separately (Render/Railway/Azure/etc.).
- Without `REACT_APP_API_BASE_URL`, the deployed frontend will default to calling `/api` on the same domain and CRUD will fail.

If you want to point the UI at a different backend (without proxy), create an `.env` file:

```env
REACT_APP_API_BASE_URL=http://localhost:8081/api
```
