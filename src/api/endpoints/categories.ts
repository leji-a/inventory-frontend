import { apiFetch } from '../index'
import type { Category, CreateCategoryInput, UpdateCategoryInput, PaginatedCategories } from '../types'

export const categoriesApi = {
async getCategories(token: string, page = 1, limit = 50): Promise<PaginatedCategories> {
  try {
    const res = await apiFetch<PaginatedCategories | Category>(`/categories?page=${page}&limit=${limit}`, token)

    if ((res as PaginatedCategories).data) {
      return res as PaginatedCategories
    }

    const singleCategory = res as unknown as Category
    return {
      data: [singleCategory],
      pagination: { page: 1, limit, total: 1 }
    }
  } catch (err) {
    if ((err as any)?.found) {
      const singleCategory = (err as any).found as Category
      return {
        data: [singleCategory],
        pagination: { page: 1, limit, total: 1 }
      }
    }
    throw err
  }
},

  async getCategory(id: number, token: string): Promise<Category> {
    return apiFetch<Category>(`/categories/${id}`, token)
  },

  async createCategory(input: CreateCategoryInput, token: string): Promise<Category> {
    return apiFetch<Category>('/categories', token, {
      method: 'POST',
      body: JSON.stringify(input)
    })
  },

  async updateCategory(id: number, data: UpdateCategoryInput, token: string): Promise<Category> {
    return apiFetch<Category>(`/categories/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  async deleteCategory(id: number, token: string): Promise<void> {
    await apiFetch(`/categories/${id}`, token, { method: 'DELETE' })
  }
}
