import { api } from './client'
import { API_ENDPOINTS } from '~/constants/api'
import type { Category } from '~/types/property'

export const categoriesApi = {
  list(): Promise<Category[]> {
    return api.get(API_ENDPOINTS.CATEGORIES.LIST)
  },

  get(id: string): Promise<Category> {
    return api.get(API_ENDPOINTS.CATEGORIES.DETAIL(id))
  },
}
