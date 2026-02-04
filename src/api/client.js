const defaultBaseSameOrigin = '/api'
const defaultBaseLocalDev = 'http://localhost:8081/api'

function baseUrl() {
  const env = (
    (typeof process !== 'undefined' && process?.env?.REACT_APP_API_BASE_URL) ??
    ''
  ).toString()
  if (env.trim().length > 0) return env.replace(/\/$/, '')

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
  const res = await fetch(`${baseUrl()}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!res.ok) {
    const contentType = res.headers.get('content-type') ?? ''
    const text = await res.text()

    if (contentType.includes('application/json') && text) {
      try {
        const data = JSON.parse(text)
        if (typeof data?.message === 'string' && data.message.trim().length > 0) {
          throw new Error(data.message)
        }
        if (typeof data?.error === 'string' && data.error.trim().length > 0) {
          throw new Error(data.error)
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
    throw new Error(`Expected JSON but got content-type: ${contentType || '(unknown)'}`)
  }

  return JSON.parse(text)
}
