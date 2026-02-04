export type LocationType = 'DOCK' | 'YARD' | 'WAREHOUSE' | 'ZONE' | 'AISLE' | 'BIN'

export interface Location {
  id: number
  code: string
  name: string
  type: LocationType
}

export interface Item {
  id: number
  sku: string
  name: string
  description?: string | null
  location?: Location | null
}

export type MovementType = 'IN' | 'OUT' | 'ADJUST'

export interface StockMovement {
  id: number
  itemId: number
  type: MovementType
  quantity: number
  fromLocationId?: number | null
  toLocationId?: number | null
  note?: string | null
  occurredAt: string
}
