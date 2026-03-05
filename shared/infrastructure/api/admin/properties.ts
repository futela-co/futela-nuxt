import { api } from '../client'
import type { Property } from '~/domain/types/property'
import type { PaginatedResponse } from '~/domain/types/common'

export const adminPropertiesApi = {
  list(params?: Record<string, any>): Promise<PaginatedResponse<Property>> {
    return api.get('/admin/properties', params)
  },

  get(id: string): Promise<Property> {
    return api.get(`/admin/properties/${id}`)
  },

  update(id: string, data: Record<string, any>): Promise<Property> {
    return api.put(`/admin/properties/${id}`, data)
  },

  delete(id: string): Promise<void> {
    return api.delete(`/admin/properties/${id}`)
  },
}
