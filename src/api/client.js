const defaultBaseSameOrigin = '/api'
const defaultBaseLocalDev = 'http://127.0.0.1:8080/api'

function baseUrl() {
  const env = (
    (typeof process !== 'undefined' && process?.env?.REACT_APP_API_BASE_URL) ??
    ''
  ).toString()

  const normalized = env.trim()

  // Some environments accidentally inject placeholders like "false".
  // Treat these as "not set" so local dev can fall back correctly.
  if (
    normalized.length > 0 &&
    normalized.toLowerCase() !== 'false' &&
    normalized.toLowerCase() !== 'null' &&
    normalized.toLowerCase() !== 'undefined'
  ) {
    return normalized.replace(/\/$/, '')
  }

  // In local dev we call the backend directly (no proxy).
  if (typeof window !== 'undefined') {
    const { hostname } = window.location
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return defaultBaseLocalDev
    }
  }

  return defaultBaseSameOrigin
}

export async function apiFetch(path, init) {
  const apiBase = baseUrl()
  let res
  try {
    res = await fetch(`${apiBase}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      ...init,
    })
  } catch (err) {
    // Browser network/CORS failures surface as TypeError("Failed to fetch").
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(
      [
        msg || 'Failed to fetch',
        `Requested: ${path}`,
        `API base: ${apiBase}`,
        'Check that the backend is running and reachable, and that CORS allows this origin.',
      ].join('\n'),
    )
  }

  if (!res.ok) {
    const contentType = res.headers.get('content-type') ?? ''
    const text = await res.text()

    // Spring may return application/problem+json; treat all *json* as JSON.
    if (contentType.toLowerCase().includes('json') && text) {
      try {
        const data = JSON.parse(text)
        if (typeof data?.message === 'string' && data.message.trim().length > 0) {
          throw new Error(data.message)
        }
        if (typeof data?.error === 'string' && data.error.trim().length > 0) {
          throw new Error(data.error)
        }

        // RFC7807 / ProblemDetail-style payloads
        if (typeof data?.detail === 'string' && data.detail.trim().length > 0) {
          throw new Error(data.detail)
        }
        if (typeof data?.title === 'string' && data.title.trim().length > 0) {
          throw new Error(data.title)
        }
      } catch {
        // fall through to raw text
      }
    }

    throw new Error(text || `HTTP ${res.status}`)
  }

  // Many endpoints (especially DELETE) intentionally return no body.
  if (res.status === 204) return undefined

  const contentType = res.headers.get('content-type') ?? ''
  const text = await res.text()
  if (!text) return undefined

  // If the response is HTML, it almost always means the API URL is wrong
  // (e.g. Vercel SPA rewrite served index.html for /api/*).
  if (contentType.includes('text/html') || /^\s*</.test(text)) {
    throw new Error(
      [
        'API returned HTML instead of JSON.',
        'This usually means your backend is not running, or REACT_APP_API_BASE_URL is not set correctly.',
        `Requested: ${path}`,
        `API base: ${baseUrl()}`,
      ].join('\n'),
    )
  }

  if (!contentType.includes('application/json')) {
    if (!contentType.toLowerCase().includes('json')) {
      throw new Error(`Expected JSON but got content-type: ${contentType || '(unknown)'}`)
    }
  }

  return JSON.parse(text)
}
