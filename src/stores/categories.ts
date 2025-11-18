import { defineStore } from 'pinia'
import { categoriesApi } from '../api/endpoints/categories'
import { useAuthStore } from './auth'
import type { Category, PaginatedCategories, CreateCategoryInput } from '../api/types'

interface CategoriesState {
  items: Category[]
  pagination: PaginatedCategories['pagination'] | null
  loading: boolean
  error: string | null
}

export const useCategoriesStore = defineStore('categories', {
  state: (): CategoriesState => ({
    items: [],
    pagination: null,
    loading: false,
    error: null
  }),

  persist: true,

  actions: {
    async fetchAll(page = 1, limit = 50) {
      const auth = useAuthStore()
      if (!auth.token) throw new Error('Not authenticated')

      this.loading = true
      this.error = null

      try {
        const res = await categoriesApi.getCategories(auth.token, page, limit)
        this.items = res.data
        this.pagination = res.pagination
      } catch (err: any) {
        this.error = err.message ?? String(err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async createCategory(input: CreateCategoryInput) {
      const auth = useAuthStore()
      if (!auth.token) throw new Error('Not authenticated')

      this.loading = true
      this.error = null
      try {
        const newCategory = await categoriesApi.createCategory(input, auth.token)
        this.items.unshift(newCategory)
        if (this.pagination) this.pagination.total += 1
        return newCategory
      } catch (err: any) {
        this.error = err.message ?? String(err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateCategory(id: number, input: { name: string; description?: string }) {
      const auth = useAuthStore()
      if (!auth.token) throw new Error('Not authenticated')

      this.loading = true
      this.error = null
      try {
        const updated = await categoriesApi.updateCategory(id, input, auth.token)
        const index = this.items.findIndex(c => c.id === id)
        if (index !== -1) this.items[index] = updated
        return updated
      } catch (err: any) {
        this.error = err.message ?? String(err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteCategory(id: number) {
      const auth = useAuthStore()
      if (!auth.token) throw new Error('Not authenticated')

      this.loading = true
      this.error = null
      try {
        await categoriesApi.deleteCategory(id, auth.token)
        this.items = this.items.filter(c => c.id !== id)
        if (this.pagination) this.pagination.total -= 1
      } catch (err: any) {
        this.error = err.message ?? String(err)
        throw err
      } finally {
        this.loading = false
      }
    }
  },

  getters: {
    getCategoryById: (state) => (id: number) => state.items.find(c => c.id === id),
    getCategoriesForSelect: (state) => state.items.map(c => ({ value: c.id, label: c.name }))
  }
})
