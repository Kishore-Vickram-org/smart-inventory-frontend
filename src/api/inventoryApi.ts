import { apiFetch } from './client'
import type { Item, Location, LocationType, MovementType, StockMovement } from './types'

export function listItems() {
  return apiFetch<Item[]>('/items')
}

export function createItem(body: {
  sku: string
  name: string
  description?: string
  quantity: number
  unit?: string
  locationId?: number
}) {
  return apiFetch<Item>('/items', { method: 'POST', body: JSON.stringify(body) })
}

export function updateItem(
  id: number,
  body: { name?: string; description?: string; unit?: string; locationId?: number },
) {
  return apiFetch<Item>(`/items/${id}`, { method: 'PUT', body: JSON.stringify(body) })
}

export function deleteItem(id: number) {
  return apiFetch<void>(`/items/${id}`, { method: 'DELETE' })
}

export function listLocations() {
  return apiFetch<Location[]>('/locations')
}

export function createLocation(body: { code: string; name: string; type: LocationType }) {
  return apiFetch<Location>('/locations', { method: 'POST', body: JSON.stringify(body) })
}

export function updateLocation(id: number, body: { name: string; type?: LocationType }) {
  return apiFetch<Location>(`/locations/${id}`, { method: 'PUT', body: JSON.stringify(body) })
}

export function deleteLocation(id: number) {
  return apiFetch<void>(`/locations/${id}`, { method: 'DELETE' })
}

export function createMovement(
  itemId: number,
  body: { type: MovementType; quantity: number; toLocationId?: number; note?: string },
) {
  return apiFetch<StockMovement>(`/items/${itemId}/movements`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function listMovements(params?: {
  itemId?: number
  type?: MovementType
  locationId?: number
  limit?: number
}) {
  const qs = new URLSearchParams()
  if (params?.itemId != null) qs.set('itemId', String(params.itemId))
  if (params?.type != null) qs.set('type', String(params.type))
  if (params?.locationId != null) qs.set('locationId', String(params.locationId))
  if (params?.limit != null) qs.set('limit', String(params.limit))
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return apiFetch<StockMovement[]>(`/movements${suffix}`)
}
