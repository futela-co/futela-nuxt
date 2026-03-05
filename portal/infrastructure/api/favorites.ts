import { api } from './client'
import { API_ENDPOINTS } from '~/constants/api'
import type { Property } from '~/types/property'
import type { PaginatedResponse } from '~/types/common'

export const favoritesApi = {
  list(params?: Record<string, any>): Promise<PaginatedResponse<Property>> {
    return api.get(API_ENDPOINTS.FAVORITES.LIST, params)
  },

  add(propertyId: string): Promise<void> {
    return api.post(API_ENDPOINTS.FAVORITES.LIST, { propertyId })
  },

  remove(propertyId: string): Promise<void> {
    return api.delete(API_ENDPOINTS.FAVORITES.REMOVE(propertyId))
  },
}
