import { defineStore } from 'pinia'
import { ProductAPI } from '../api/endpoints/products'
import type { Product } from '../api/types'
import { useAuthStore } from './auth'

interface ProductsState {
  items: Product[]
  loading: boolean
  error: string | null
  uploadingImage: boolean
  imageError: string | null
}

export const useProductsStore = defineStore('products', {
  state: (): ProductsState => ({
    items: [],
    loading: false,
    error: null,
    uploadingImage: false,
    imageError: null,
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

    async addProduct(payload: { name: string; price: number }) {
      const auth = useAuthStore()
      if (!auth.token) throw new Error('Not authenticated')

      this.error = null

      const created = await ProductAPI.create(auth.token, payload)
      this.items.push(created)

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
      payload: { name?: string; price?: number }
    ) {
      const auth = useAuthStore()
      if (!auth.token) throw new Error('Not authenticated')

      this.error = null

      const updated = await ProductAPI.update(auth.token, id, payload)

      const idx = this.items.findIndex(p => p.id === id)
      if (idx !== -1) {
        this.items[idx] = { ...this.items[idx], ...updated }
      }

      return updated
    },

    // ✅ Agregar imagen desde URL
    async addImageUrl(productId: number, imageUrl: string) {
      const auth = useAuthStore()
      if (!auth.token) throw new Error('Not authenticated')

      this.uploadingImage = true
      this.imageError = null

      try {
        console.log('📤 Agregando URL de imagen...', imageUrl)
        const updatedProduct = await ProductAPI.addImageUrl(auth.token, productId, imageUrl)
        console.log('✅ URL agregada correctamente')

        // Actualizar el producto en el store
        const idx = this.items.findIndex(p => p.id === productId)
        if (idx !== -1) {
          this.items[idx] = updatedProduct
        }

        return updatedProduct
      } catch (err: any) {
        console.error('❌ Error al agregar URL:', err)
        this.imageError = err.message ?? 'Error al agregar la imagen'
        throw err
      } finally {
        this.uploadingImage = false
      }
    },

    // ✅ Subir imagen desde archivo
    async uploadImageFile(productId: number, file: File) {
      const auth = useAuthStore()
      if (!auth.token) throw new Error('Not authenticated')

      this.uploadingImage = true
      this.imageError = null

      try {
        console.log('📤 Subiendo archivo de imagen...', file.name)
        const updatedProduct = await ProductAPI.uploadImage(auth.token, productId, file)
        console.log('✅ Imagen subida correctamente')

        // Actualizar el producto en el store
        const idx = this.items.findIndex(p => p.id === productId)
        if (idx !== -1) {
          this.items[idx] = updatedProduct
        }

        return updatedProduct
      } catch (err: any) {
        console.error('❌ Error al subir imagen:', err)
        
        // Mejorar el mensaje de error de RLS
        if (err.message?.includes('row-level security')) {
          this.imageError = 'Error de permisos: No tienes acceso para subir imágenes. Contacta al administrador.'
        } else {
          this.imageError = err.message ?? 'Error al subir la imagen'
        }
        
        throw err
      } finally {
        this.uploadingImage = false
      }
    },

    // ✅ Eliminar imagen
    async deleteImage(productId: number, imageId: number) {
      const auth = useAuthStore()
      if (!auth.token) throw new Error('Not authenticated')

      this.uploadingImage = true
      this.imageError = null

      try {
        console.log('🗑️ Eliminando imagen...', imageId)
        const updatedProduct = await ProductAPI.deleteImage(auth.token, productId, imageId)
        console.log('✅ Imagen eliminada correctamente')

        // Actualizar el producto en el store
        const idx = this.items.findIndex(p => p.id === productId)
        if (idx !== -1) {
          this.items[idx] = updatedProduct
        }

        return updatedProduct
      } catch (err: any) {
        console.error('❌ Error al eliminar imagen:', err)
        this.imageError = err.message ?? 'Error al eliminar la imagen'
        throw err
      } finally {
        this.uploadingImage = false
      }
    },
  },
})