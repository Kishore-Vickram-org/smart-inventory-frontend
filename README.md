# Harbor Frontend (React)

This UI is a **React (JavaScript/JSX)** app.

It uses **Parcel** as the dev server and build tool.

## Run locally

From the repo root:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

`npm start` also works (it’s an alias for the dev server).

## Backend API

During development, the frontend calls the backend directly at `http://localhost:8081/api` by default.

You can override that by setting `REACT_APP_API_BASE_URL`.

If you want to point the UI at a different backend (without proxy), create an `.env` file:

```env
REACT_APP_API_BASE_URL=http://localhost:8081/api
```
