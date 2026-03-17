function loadApiBaseUrl({ env = {} } = {}) {
  const keys = [
    'VITE_API_BASE_URL',
    'REACT_APP_API_BASE_URL',
    'VITE_BACKEND_URL',
    'REACT_APP_BACKEND_URL',
  ]

  const saved = {}
  keys.forEach((k) => {
    saved[k] = process.env[k]
  })

  try {
    keys.forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(env, k)) process.env[k] = env[k]
      else delete process.env[k]
    })

    jest.resetModules()
    let API_BASE_URL
    jest.isolateModules(() => {
      ;({ API_BASE_URL } = require('./api'))
    })
    return API_BASE_URL
  } finally {
    keys.forEach((k) => {
      if (saved[k] === undefined) delete process.env[k]
      else process.env[k] = saved[k]
    })
    jest.resetModules()
  }
}

describe('config/api', () => {
  test('adds /api when env URL has no path', () => {
    const v = loadApiBaseUrl({ env: { REACT_APP_API_BASE_URL: 'https://example.com' } })
    expect(v).toBe('https://example.com/api')
  })

  test('enforces https for non-local host and strips trailing slashes', () => {
    const v = loadApiBaseUrl({ env: { REACT_APP_API_BASE_URL: 'http://example.com/api///' } })
    expect(v).toBe('https://example.com/api')
  })

  test('allows relative api base only for localhost dev', () => {
    const v = loadApiBaseUrl({ env: { REACT_APP_API_BASE_URL: '/api' } })
    expect(v).toBe('/api')
  })

  test('treats placeholder env values as not set (falls back to localhost default)', () => {
    const v = loadApiBaseUrl({ env: { REACT_APP_API_BASE_URL: 'false' } })
    expect(v).toBe('http://127.0.0.1:8080/api')
  })

  test('uses non-absolute env values as-is', () => {
    const v = loadApiBaseUrl({ env: { REACT_APP_API_BASE_URL: 'api' } })
    expect(v).toBe('api')
  })
})
