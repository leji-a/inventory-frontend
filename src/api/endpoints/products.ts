// src/api/products.ts
import { apiFetch } from '../index'
import type { Product, PaginatedProducts, ProductHistory } from '../types'

export const ProductAPI = {
  list: (token: string, page = 1, limit = 20) =>
    apiFetch<PaginatedProducts>(`/products?page=${page}&limit=${limit}`, token),

  get: (token: string, id: number) =>
    apiFetch<Product>(`/products/${id}`, token),

  create: (token: string, data: Partial<Product>) =>
    apiFetch<Product>('/products', token, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (token: string, id: number, data: Partial<Product>) =>
    apiFetch<Product>(`/products/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  remove: (token: string, id: number) =>
    apiFetch<void>(`/products/${id}`, token, { method: 'DELETE' }),

  history: (token: string, id: number) =>
    apiFetch<ProductHistory>(`/inventory/products/${id}/history`, token),
}
