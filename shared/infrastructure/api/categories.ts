import { api } from './client'
import { API_ENDPOINTS } from '~/domain/constants/api'
import type { Category } from '~/domain/types/property'

export const categoriesApi = {
  list(): Promise<Category[]> {
    return api.get(API_ENDPOINTS.CATEGORIES.LIST)
  },

  get(id: string): Promise<Category> {
    return api.get(API_ENDPOINTS.CATEGORIES.DETAIL(id))
  },
}
