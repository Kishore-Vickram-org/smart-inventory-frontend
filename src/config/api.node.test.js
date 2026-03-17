/** @jest-environment node */

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

describe('config/api (node env)', () => {
  test('ignores relative api base when window is not available', () => {
    const v = loadApiBaseUrl({ env: { REACT_APP_API_BASE_URL: '/api' } })
    expect(v).toBe(
      'https://inventory-backend-cxaqcqh9hnbdbpab.southeastasia-01.azurewebsites.net/api',
    )
  })

  test('falls back to default backend origin when no env vars exist', () => {
    const v = loadApiBaseUrl({ env: {} })
    expect(v).toBe(
      'https://inventory-backend-cxaqcqh9hnbdbpab.southeastasia-01.azurewebsites.net/api',
    )
  })
})
