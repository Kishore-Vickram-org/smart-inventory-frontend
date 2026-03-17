jest.mock('./client', () => ({
  apiFetch: jest.fn(),
}))

const { apiFetch } = require('./client')
const api = require('./inventoryApi')

describe('inventoryApi', () => {
  beforeEach(() => {
    apiFetch.mockReset()
  })

  test('items endpoints call correct paths', () => {
    api.listItems()
    expect(apiFetch).toHaveBeenCalledWith('/items')

    api.createItem({ a: 1 })
    expect(apiFetch).toHaveBeenCalledWith('/items', { method: 'POST', body: JSON.stringify({ a: 1 }) })

    api.updateItem(5, { b: 2 })
    expect(apiFetch).toHaveBeenCalledWith('/items/5', { method: 'PUT', body: JSON.stringify({ b: 2 }) })

    api.deleteItem(7)
    expect(apiFetch).toHaveBeenCalledWith('/items/7', { method: 'DELETE' })
  })

  test('locations endpoints call correct paths', () => {
    api.listLocations()
    expect(apiFetch).toHaveBeenCalledWith('/locations')

    api.createLocation({ c: 3 })
    expect(apiFetch).toHaveBeenCalledWith('/locations', { method: 'POST', body: JSON.stringify({ c: 3 }) })

    api.updateLocation(9, { d: 4 })
    expect(apiFetch).toHaveBeenCalledWith('/locations/9', { method: 'PUT', body: JSON.stringify({ d: 4 }) })

    api.deleteLocation(11)
    expect(apiFetch).toHaveBeenCalledWith('/locations/11', { method: 'DELETE' })
  })

  test('movement endpoints call correct paths', () => {
    api.createMovement(1, { x: true })
    expect(apiFetch).toHaveBeenCalledWith('/items/1/movements', { method: 'POST', body: JSON.stringify({ x: true }) })

    api.listMovements({ itemId: 2, type: 'IN', locationId: 3, limit: 10 })
    expect(apiFetch).toHaveBeenCalledWith('/movements?itemId=2&type=IN&locationId=3&limit=10')

    api.listMovements({})
    expect(apiFetch).toHaveBeenCalledWith('/movements')
  })
})
