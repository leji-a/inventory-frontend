// src/stores/products.ts
import { defineStore } from 'pinia'
import { ProductAPI } from '../api/endpoints/products'
import type { Product } from '../api/types'
import { useAuthStore } from './auth'

interface Pagination {
  page: number
  totalPages: number
  total: number
  hasNextPage: boolean
  hasPrevPage: boolean
  limit: number
}

interface ProductsState {
  items: Product[]
  loading: boolean
  error: string | null
  pagination: Pagination
  uploadingImage: boolean
  imageError: string | null
}

export const useProductsStore = defineStore('products', {
  state: (): ProductsState => ({
    items: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      totalPages: 1,
      total: 0,
      hasNextPage: false,
      hasPrevPage: false,
      limit: 20
    },
    uploadingImage: false,
    imageError: null,
  }),

  actions: {
async fetchAll(page = 1, limit = 20) {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      if (!auth.token) throw new Error("Not authenticated")
      const token = auth.token as string


      try {
        const res = await ProductAPI.list(token, page, limit)

        const backendPagination = res.pagination || {}

        this.items = res.data
        this.pagination = {
          page: backendPagination.page ?? page,
          limit: backendPagination.limit ?? limit,
          totalPages: backendPagination.totalPages ?? 1,
          total: backendPagination.total ?? 0,
          hasNextPage: backendPagination.hasNextPage ?? false,
          hasPrevPage: backendPagination.hasPrevPage ?? false,
        }
      } catch (err: any) {
        this.error = err.message || 'Error loading products'
      } finally {
        this.loading = false
      }
    },

    async addProduct(payload: { name: string; price: number; categoryIds?: number[] }) {
      const auth = useAuthStore()
      if (!auth.token) throw new Error('Not authenticated')
      this.error = null

      try {
        const normalizedPayload = {
          name: payload.name,
          price: payload.price,
          categoryIds: payload.categoryIds ?? []
        }

        const created = await ProductAPI.create(auth.token, normalizedPayload)
        this.items.push({
          ...created,
          categoryIds: created.categoryIds ?? [],
          images: created.images ?? []
        })
        return created
      } catch (err: any) {
        this.error = err.message ?? 'Error al crear producto'
        throw err
      }
    },

    async updateProduct(
      id: number,
      payload: { name?: string; price?: number; categoryIds?: number[] }
    ) {
      const auth = useAuthStore()
      if (!auth.token) throw new Error('Not authenticated')
      this.error = null

      try {
        const normalizedPayload: Partial<{ name: string; price: number; categoryIds: number[] }> = {}
        if (payload.name !== undefined) normalizedPayload.name = payload.name
        if (payload.price !== undefined) normalizedPayload.price = payload.price
        if (payload.categoryIds !== undefined) normalizedPayload.categoryIds = payload.categoryIds

        const updated = await ProductAPI.update(auth.token, id, normalizedPayload)
        const idx = this.items.findIndex(p => p.id === id)
        if (idx !== -1) {
          this.items[idx] = {
            ...this.items[idx],
            ...updated,
            categoryIds: updated.categoryIds ?? [],
            images: updated.images ?? []
          }
        }
        return updated
      } catch (err: any) {
        this.error = err.message ?? 'Error al actualizar producto'
        throw err
      }
    },

    async removeProduct(id: number) {
      const auth = useAuthStore()
      if (!auth.token) throw new Error('Not authenticated')
      this.error = null

      try {
        await ProductAPI.remove(auth.token, id)
        this.items = this.items.filter(p => p.id !== id)
      } catch (err: any) {
        this.error = err.message ?? 'Error al eliminar producto'
        throw err
      }
    },

    async addImageUrl(productId: number, imageUrl: string) {
      const auth = useAuthStore()
      if (!auth.token) throw new Error('Not authenticated')
      this.uploadingImage = true
      this.imageError = null

      try {
        const updatedProduct = await ProductAPI.addImageUrl(auth.token, productId, imageUrl)
        const idx = this.items.findIndex(p => p.id === productId)
        if (idx !== -1) this.items[idx] = updatedProduct
        return updatedProduct
      } catch (err: any) {
        this.imageError = err.message ?? 'Error al agregar imagen'
        throw err
      } finally {
        this.uploadingImage = false
      }
    },

    async uploadImageFile(productId: number, file: File) {
      const auth = useAuthStore()
      if (!auth.token) throw new Error('Not authenticated')
      this.uploadingImage = true
      this.imageError = null

      try {
        const updatedProduct = await ProductAPI.uploadImage(auth.token, productId, file)
        const idx = this.items.findIndex(p => p.id === productId)
        if (idx !== -1) this.items[idx] = updatedProduct
        return updatedProduct
      } catch (err: any) {
        this.imageError = err.message ?? 'Error al subir imagen'
        throw err
      } finally {
        this.uploadingImage = false
      }
    },

    async deleteImage(productId: number, imageId: number) {
      const auth = useAuthStore()
      if (!auth.token) throw new Error('Not authenticated')
      this.uploadingImage = true
      this.imageError = null

      try {
        const updatedProduct = await ProductAPI.deleteImage(auth.token, productId, imageId)
        const idx = this.items.findIndex(p => p.id === productId)
        if (idx !== -1) this.items[idx] = updatedProduct
        return updatedProduct
      } catch (err: any) {
        this.imageError = err.message ?? 'Error al eliminar imagen'
        throw err
      } finally {
        this.uploadingImage = false
      }
    },
  }
})
