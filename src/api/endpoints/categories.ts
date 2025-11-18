import { apiFetch } from '../index'
import type { Category, CreateCategoryInput, UpdateCategoryInput, PaginatedCategories } from '../types'

export const categoriesApi = {
  async getCategories(token: string, page = 1, limit = 50): Promise<PaginatedCategories> {
    return apiFetch<PaginatedCategories>(`/categories?page=${page}&limit=${limit}`, token)
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
