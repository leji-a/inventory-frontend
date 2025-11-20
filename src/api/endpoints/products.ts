// src/api/endpoints/products.ts
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

  addImageUrl: (token: string, productId: number, imageUrl: string) =>
    apiFetch<Product>(`/products/${productId}/images/url`, token, {
      method: 'POST',
      body: JSON.stringify({ image_url: imageUrl }),
    }),

  uploadImage: (token: string, productId: number, file: Blob) => {
    const fd = new FormData()
    fd.append('file', file)

    return apiFetch<Product>(`/products/${productId}/images`, token, {
      method: 'POST',
      body: fd,
    })
  },

  deleteImage: (token: string, productId: number, imageId: number) =>
    apiFetch<Product>(`/products/${productId}/images/${imageId}`, token, { 
      method: 'DELETE' 
    }),

  reorderImages: (token: string, productId: number, order: number[]) =>
    apiFetch<Product>(`/products/${productId}/images/reorder`, token, {
      method: 'PUT',
      body: JSON.stringify({ order }),
    }),

  history: (token: string, id: number) =>
    apiFetch<ProductHistory>(`/inventory/products/${id}/history`, token),
}