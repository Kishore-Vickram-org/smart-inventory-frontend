const DEFAULT_BACKEND_ORIGIN = 'https://inventory-backend-cxaqcqh9hnbdbpab.southeastasia-01.azurewebsites.net'

function readEnv(key) {
  // Vite: import.meta.env (only variables matching envPrefix are exposed)
  try {
    // eslint-disable-next-line no-undef
    if (typeof import.meta !== 'undefined' && import.meta?.env) {
      // eslint-disable-next-line no-undef
      const v = import.meta.env[key]
      if (v != null) return String(v)
    }
  } catch {
    // ignore
  }

  // Fallback for non-Vite environments (tests / older builds)
  const v = (typeof process !== 'undefined' && process?.env?.[key]) ?? ''
  return String(v ?? '')
}

function normalizeApiBase(raw) {
  const trimmed = (raw ?? '').toString().trim().replace(/\/+$/, '')
  if (!trimmed) return ''

  // If a full URL is provided but no path, assume the API is under /api
  // (matches the current backend deployment pattern).
  try {
    const url = new URL(trimmed)

    // Enforce HTTPS for any non-local host to avoid mixed-content blocks
    // when the frontend is hosted on GitHub Pages (HTTPS).
    const isLocalHost = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
    if (!isLocalHost && url.protocol === 'http:') {
      url.protocol = 'https:'
    }

    const path = (url.pathname ?? '').trim()
    if (path === '' || path === '/') {
      url.pathname = '/api'
    }
    return url.toString().replace(/\/+$/, '')
  } catch {
    // Non-absolute values like "/api" should be used as-is.
    return trimmed
  }
}

function computeApiBaseUrl() {
  const env = (
    readEnv('VITE_API_BASE_URL') ||
    readEnv('REACT_APP_API_BASE_URL') ||
    readEnv('VITE_BACKEND_URL') ||
    readEnv('REACT_APP_BACKEND_URL')
  ).toString()

  const normalizedEnv = normalizeApiBase(env)
  if (normalizedEnv) {
    // If someone sets API base to a relative path (e.g. "/api"), GitHub Pages will
    // return the SPA 404.html, not your backend. Allow this only for localhost dev.
    if (normalizedEnv.startsWith('/')) {
      if (typeof window !== 'undefined') {
        const { hostname } = window.location
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          return normalizedEnv
        }
      }
      // Ignore relative API base in production-like environments.
    } else {
      return normalizedEnv
    }
  }

  // Local dev convenience: if you run backend locally without setting env vars.
  if (typeof window !== 'undefined') {
    const { hostname } = window.location
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://127.0.0.1:8080/api'
    }
  }

  // Default for GitHub Pages / production builds.
  return normalizeApiBase(DEFAULT_BACKEND_ORIGIN) || '/api'
}

// Central source of truth for all API calls.
export const API_BASE_URL = computeApiBaseUrl()

// Optional debug hook (safe in prod): lets you verify the resolved value in DevTools.
// Example: window.__SMART_INVENTORY_API_BASE_URL__
if (typeof window !== 'undefined') {
  // eslint-disable-next-line no-underscore-dangle
  window.__SMART_INVENTORY_API_BASE_URL__ = API_BASE_URL
}
