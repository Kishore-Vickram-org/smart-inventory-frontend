const DEFAULT_BACKEND_ORIGIN =
  'https://inventory-backend-cxaqcqh9hnbdbpab.southeastasia-01.azurewebsites.net'

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
  if (normalizedEnv) return normalizedEnv

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
