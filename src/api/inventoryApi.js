import { apiFetch } from './client'

export function listItems() {
  return apiFetch('/items')
}

export function createItem(body) {
  return apiFetch('/items', { method: 'POST', body: JSON.stringify(body) })
}

export function updateItem(id, body) {
  return apiFetch(`/items/${id}`, { method: 'PUT', body: JSON.stringify(body) })
}

export function deleteItem(id) {
  return apiFetch(`/items/${id}`, { method: 'DELETE' })
}

// (Optional) endpoints kept here if you later add Locations/Movements back into the UI.
export function listLocations() {
  return apiFetch('/locations')
}

export function createLocation(body) {
  return apiFetch('/locations', { method: 'POST', body: JSON.stringify(body) })
}

export function updateLocation(id, body) {
  return apiFetch(`/locations/${id}`, { method: 'PUT', body: JSON.stringify(body) })
}

export function deleteLocation(id) {
  return apiFetch(`/locations/${id}`, { method: 'DELETE' })
}

export function createMovement(itemId, body) {
  return apiFetch(`/items/${itemId}/movements`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function listMovements(params) {
  const qs = new URLSearchParams()
  if (params?.itemId != null) qs.set('itemId', String(params.itemId))
  if (params?.type != null) qs.set('type', String(params.type))
  if (params?.locationId != null) qs.set('locationId', String(params.locationId))
  if (params?.limit != null) qs.set('limit', String(params.limit))
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return apiFetch(`/movements${suffix}`)
}
