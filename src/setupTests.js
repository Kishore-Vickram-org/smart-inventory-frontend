// CRA automatically loads this file when present.
// Keep it minimal: just ensure fetch exists for tests.

// React 18 uses this flag to decide whether to warn about act().
// (We intentionally avoid bringing extra testing libraries into this repo.)
globalThis.IS_REACT_ACT_ENVIRONMENT = true

if (typeof global.fetch !== 'function') {
  global.fetch = () => Promise.reject(new Error('fetch not mocked'))
}
