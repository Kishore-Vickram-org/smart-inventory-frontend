const defaultBase = '/api'

function baseUrl() {
  const env = import.meta.env.VITE_API_BASE_URL as string | undefined
  return (env && env.trim().length > 0 ? env : defaultBase).replace(/\/$/, '')
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
    const text = await res.text()
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
