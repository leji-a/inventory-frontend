// ========================
// AUTH
// ========================
export interface AuthResponse {
  token: string
  user: { id: number; email: string }
}

// ========================
// PRODUCTS
// ========================
export interface ProductImage {
  id: number
  image_url: string
  display_order: number
}

export interface Product {
  id: number
  name: string
  price: number
  categoryIds?: number[]
  categoryNames?: string[]
  images?: ProductImage[]
}

export interface CreateProductInput {
  name: string
  price: number
  categoryIds?: number[]
  images?: string[]
}

export interface UpdateProductInput {
  name?: string
  price?: number
  categoryIds?: number[]
  images?: string[]
}

// ========================
// PAGINATED PRODUCTS
// ========================
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

// ========================
// INVENTORY PERIODS
// ========================
export interface InventoryPeriod {
  id: number
  name: string
  start_date: string
  end_date?: string
  is_active?: boolean 
  notes?: string
  status?: 'active' | 'closed'
}

export interface CreatePeriodInput {
  name: string
  start_date: string
  notes?: string
}

// ========================
// INVENTORY RECORDS
// ========================
export interface InventoryRecord {
  id: number
  product_id: number
  period_id: number
  quantity: number
  notes?: string
  counted_at?: string
  created_at?: string
  updated_at?: string

  product?: {
    id: number
    name: string
    price: number
  }
}

export interface ProductHistory {
  product: Product
  history: Array<{
    period: InventoryPeriod
    quantity: number
  }>
}

// ========================
// CATEGORIES
// ========================
export interface Category {
  id: number
  name: string
  description?: string
  owner_id: string
  created_at: string
  updated_at?: string | null
}

export interface CreateCategoryInput {
  name: string
  description?: string
}

export interface UpdateCategoryInput {
  name?: string
  description?: string | null
}

export interface Pagination {
  page: number
  limit: number
  total: number
}

export interface PaginatedCategories {
  data: Category[]
  pagination: Pagination
}