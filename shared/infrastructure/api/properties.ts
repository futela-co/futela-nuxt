import { api } from './client'
import { API_ENDPOINTS } from '~/domain/constants/api'
import type { Property, SearchFilters } from '~/domain/types/property'
import type { PaginatedResponse } from '~/domain/types/common'

export const propertiesApi = {
  list(params?: Record<string, any>): Promise<Property[] | PaginatedResponse<Property>> {
    return api.get(API_ENDPOINTS.PROPERTIES.LIST, params)
  },

  get(id: string): Promise<Property> {
    return api.get(API_ENDPOINTS.PROPERTIES.DETAIL(id))
  },

  create(data: Record<string, any>): Promise<Property> {
    return api.post(API_ENDPOINTS.PROPERTIES.CREATE, data)
  },

  update(id: string, data: Record<string, any>): Promise<Property> {
    return api.put(API_ENDPOINTS.PROPERTIES.UPDATE(id), data)
  },

  delete(id: string): Promise<void> {
    return api.delete(API_ENDPOINTS.PROPERTIES.DELETE(id))
  },

  publish(id: string): Promise<Property> {
    return api.post(API_ENDPOINTS.PROPERTIES.PUBLISH(id))
  },

  unpublish(id: string): Promise<Property> {
    return api.post(API_ENDPOINTS.PROPERTIES.UNPUBLISH(id))
  },

  search(filters: SearchFilters): Promise<Property[] | PaginatedResponse<Property>> {
    return api.get(API_ENDPOINTS.PROPERTIES.SEARCH, filters as Record<string, any>)
  },

  uploadPhoto(propertyId: string, formData: FormData): Promise<any> {
    return api.upload(API_ENDPOINTS.PROPERTIES.PHOTOS(propertyId), formData)
  },

  deletePhoto(propertyId: string, photoId: string): Promise<void> {
    return api.delete(API_ENDPOINTS.PROPERTIES.PHOTO_DELETE(propertyId, photoId))
  },

  contact(propertyId: string, data: { message: string }): Promise<any> {
    return api.post(API_ENDPOINTS.PROPERTIES.CONTACT(propertyId), data)
  },

  myProperties(params?: Record<string, any>): Promise<Property[] | PaginatedResponse<Property>> {
    return api.get(API_ENDPOINTS.PROPERTIES.MY_PROPERTIES, params)
  },
}
