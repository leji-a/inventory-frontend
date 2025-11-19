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
      if (!auth.token) return

      this.loading = true
      this.error = null
      try {
        const res = await ProductAPI.list(auth.token)
        this.items = res.data ?? []
      } catch (err: any) {
        this.error = err.message ?? String(err)
      } finally {
        this.loading = false
      }
    },

    async addProduct(
      payload: { name: string; price: number },
      opts?: { imageUrl?: string | null; imageFile?: File | null }
    ) {
      const auth = useAuthStore()
      if (!auth.token) throw new Error('Not authenticated')

      const created = await ProductAPI.create(auth.token, payload)
      this.items.push(created)

      // Solo enviar si la URL es válida
      const url = opts?.imageUrl?.trim()
      if (url && url.startsWith('http')) {
        try {
          await ProductAPI.addImageUrl(auth.token, created.id, url)
        } catch (e) {
          console.warn('addImageUrl failed', e)
        }
      }

      if (opts?.imageFile) {
        try {
          await ProductAPI.uploadImage(auth.token, created.id, opts.imageFile)
        } catch (e) {
          console.warn('uploadImage failed', e)
        }
      }

      return created
    },

    async removeProduct(id: number) {
      const auth = useAuthStore()
      if (!auth.token) throw new Error('Not authenticated')

      await ProductAPI.remove(auth.token, id)
      this.items = this.items.filter(i => i.id !== id)
    },

    async updateProduct(
      id: number,
      payload: { name?: string; price?: number },
      opts?: { imageUrl?: string | null; imageFile?: File | null }
    ) {
      const auth = useAuthStore()
      if (!auth.token) throw new Error('Not authenticated')

      const updated = await ProductAPI.update(auth.token, id, payload)

      const idx = this.items.findIndex(p => p.id === id)
      if (idx !== -1) {
        this.items[idx] = { ...this.items[idx], ...updated }
      }

      // URL válida
      const url = opts?.imageUrl?.trim()
      if (url && url.startsWith('http')) {
        try {
          await ProductAPI.addImageUrl(auth.token, id, url)
        } catch (e) {
          console.warn('addImageUrl failed', e)
        }
      }

      // Archivo
      if (opts?.imageFile) {
        try {
          await ProductAPI.uploadImage(auth.token, id, opts.imageFile)
        } catch (e) {
          console.warn('uploadImage failed', e)
        }
      }

      return updated
    },
  },
})
