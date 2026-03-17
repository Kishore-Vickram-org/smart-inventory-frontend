describe('index', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  test('throws when #root is missing', () => {
    document.body.innerHTML = ''

    jest.isolateModules(() => {
      expect(() => require('./index')).toThrow('Root element #root not found')
    })
  })

  test('renders App into #root when present', () => {
    document.body.innerHTML = '<div id="root"></div>'

    jest.isolateModules(() => {
      jest.doMock('react-dom/client', () => {
        return {
          createRoot: jest.fn(() => ({ render: jest.fn() })),
        }
      })

      // Avoid pulling in the real app tree here; we just care that index wires up routing.
      jest.doMock('./App', () => () => null)

      const ReactDomClient = require('react-dom/client')
      require('./index')

      expect(ReactDomClient.createRoot).toHaveBeenCalledTimes(1)
      const rootArg = ReactDomClient.createRoot.mock.calls[0][0]
      expect(rootArg && rootArg.id).toBe('root')

      const rootObj = ReactDomClient.createRoot.mock.results[0].value
      expect(rootObj.render).toHaveBeenCalledTimes(1)
    })
  })
})
