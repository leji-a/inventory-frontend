// src/stores/products.ts
import { defineStore } from 'pinia'
import { ProductAPI } from '../api/endpoints/products'
import type { Product } from '../api/types'
import { useAuthStore } from './auth'

interface ProductsState {
  items: Product[]
  loading: boolean
  error: string | null
}

export const useProductsStore = defineStore('products', {
  state: (): ProductsState => ({
    items: [],
    loading: false,
    error: null,
  }),

  persist: true,

  actions: {
    async fetchAll() {
      const auth = useAuthStore()
      if (!auth.token) {
        this.error = 'Not authenticated'
        return
      }

      this.loading = true
      this.error = null
      try {
        const res = await ProductAPI.list(auth.token)
        // API returns { data, pagination }
        this.items = res.data ?? []
      } catch (err: any) {
        this.error = err.message ?? String(err)
      } finally {
        this.loading = false
      }
    },

    async addProduct(payload: Partial<Product>) {
      const auth = useAuthStore()
      if (!auth.token) throw new Error('Not authenticated')
      const created = await ProductAPI.create(auth.token, payload)
      this.items.push(created)
    },

    async removeProduct(id: number) {
      const auth = useAuthStore()
      if (!auth.token) throw new Error('Not authenticated')
      await ProductAPI.remove(auth.token, id)
      this.items = this.items.filter(i => i.id !== id)
    },
  },
})
