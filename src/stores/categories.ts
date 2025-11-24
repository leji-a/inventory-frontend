import { defineStore } from 'pinia'
import { categoriesApi } from '../api/endpoints/categories'
import { useAuthStore } from './auth'
import type {
  Category,
  PaginatedCategories,
  CreateCategoryInput
} from '../api/types'

interface CategoriesState {
  items: Category[]
  pagination: PaginatedCategories['pagination'] | null
  loading: boolean
  error: string | null
  currentPage: number
  limit: number
}

export const useCategoriesStore = defineStore('categories', {
  state: (): CategoriesState => ({
    items: [],
    pagination: null,
    loading: false,
    error: null,
    currentPage: 1,
    limit: 20
  }),

  persist: true,

  getters: {
    totalPages: (state) =>
      state.pagination
        ? Math.ceil(state.pagination.total / state.pagination.limit)
        : 1
  },

  actions: {
    async fetchAll(page = 1, limit = 20) {
      const auth = useAuthStore()
      if (!auth.token) throw new Error('Not authenticated')

      this.loading = true
      this.error = null

      try {
        const res = await categoriesApi.getCategories(auth.token, page, limit)
        this.items = res.data
        this.pagination = res.pagination
        this.currentPage = page
        this.limit = limit
      } catch (err: any) {
        this.error = err.message ?? String(err)
        throw err
      } finally {
        this.loading = false
      }
    },

    // Verifica duplicado antes de enviar al backend
    async createCategory(input: CreateCategoryInput) {
      const auth = useAuthStore()
      if (!auth.token) throw new Error('Not authenticated')

      // Chequeo local de duplicado (insensible a may/minúsculas)
      const alreadyExists = this.items.some(
        c => c.name.toLowerCase() === input.name.toLowerCase()
      )

      if (alreadyExists) {
        throw new Error('Ya existe una categoría con ese nombre')
      }

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

      // Chequeo duplicado (excluyendo la categoría actual)
      const nameExists = this.items.some(
        c =>
          c.id !== id &&
          c.name.toLowerCase() === input.name.toLowerCase()
      )

      if (nameExists) {
        throw new Error('Ya existe otra categoría con ese nombre')
      }

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
  }
})
