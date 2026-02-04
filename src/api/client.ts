const defaultBaseSameOrigin = '/api'
const defaultBaseLocalDev = 'http://localhost:8081/api'

function baseUrl() {
  const env = (process.env.REACT_APP_API_BASE_URL as string | undefined) ?? ''
  if (env.trim().length > 0) return env.replace(/\/$/, '')

  // Without Vite/CRA proxy, call the backend directly in local dev.
  if (typeof window !== 'undefined') {
    const { hostname } = window.location
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return defaultBaseLocalDev
    }
  }

  return defaultBaseSameOrigin
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
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
        const data = JSON.parse(text) as { message?: unknown; error?: unknown }
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
	if (res.status === 204) {
		return undefined as T
	}

	const text = await res.text()
	if (!text) {
		return undefined as T
	}

	return JSON.parse(text) as T
}
