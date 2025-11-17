export interface AuthResponse {
  token: string
  user: { id: number; email: string }
}

export interface Product {
  id: number
  name: string
  price: number
  categoryIds?: number[]
  categoryNames?: string[]
  images?: string[]
}

export interface PaginatedProducts {
  data: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface InventoryPeriod {
  id: number
  name: string
  start_date: string
  end_date?: string
  is_active: boolean
  notes: string
}

export interface CreatePeriodInput {
  name: string
  start_date: string
}

export interface InventoryRecord {
  id: number
  product_id: number
  period_id: number
  quantity: number
  notes?: string
  counted_at?: string
  created_at?: string
  updated_at?: string
  product?: Product
}

export interface ProductHistory {
  product: Product
  history: Array<{
    period: InventoryPeriod
    quantity: number
  }>
}
