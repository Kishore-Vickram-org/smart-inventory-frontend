import { apiFetch } from './client'

function makeResponse({ ok, status = 200, contentType = 'application/json', body = '' }) {
  return {
    ok,
    status,
    headers: {
      get: (name) => (name.toLowerCase() === 'content-type' ? contentType : null),
    },
    text: async () => body,
  }
}

describe('apiFetch', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  test('returns undefined for 204', async () => {
    global.fetch.mockResolvedValueOnce(makeResponse({ ok: true, status: 204, body: '' }))
    await expect(apiFetch('/x')).resolves.toBeUndefined()
  })

  test('throws helpful error on network failure', async () => {
    global.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    try {
      await apiFetch('/x')
      throw new Error('Expected apiFetch to throw')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      expect(msg).toMatch(/Failed to fetch/)
      expect(msg).toMatch(/Requested: \/x/)
    }
  })

  test('throws HTML error if response looks like HTML', async () => {
    global.fetch.mockResolvedValueOnce(
      makeResponse({ ok: false, status: 404, contentType: 'text/html', body: '<!doctype html><html></html>' }),
    )
    await expect(apiFetch('/x')).rejects.toThrow(/returned HTML/i)
  })

  test('throws message from JSON error payload', async () => {
    global.fetch.mockResolvedValueOnce(
      makeResponse({ ok: false, status: 400, contentType: 'application/problem+json', body: JSON.stringify({ message: 'Bad' }) }),
    )
    await expect(apiFetch('/x')).rejects.toThrow('Bad')
  })

  test('throws raw text for non-JSON error', async () => {
    global.fetch.mockResolvedValueOnce(makeResponse({ ok: false, status: 500, contentType: 'text/plain', body: 'no' }))
    await expect(apiFetch('/x')).rejects.toThrow('no')
  })

  test('throws if ok response is not json', async () => {
    global.fetch.mockResolvedValueOnce(makeResponse({ ok: true, status: 200, contentType: 'text/plain', body: 'hi' }))
    await expect(apiFetch('/x')).rejects.toThrow(/Expected JSON/)
  })

  test('returns parsed JSON when ok', async () => {
    global.fetch.mockResolvedValueOnce(makeResponse({ ok: true, status: 200, contentType: 'application/json', body: '{"a":1}' }))
    await expect(apiFetch('/x')).resolves.toEqual({ a: 1 })
  })
})
