import { api } from './client'
import { API_ENDPOINTS } from '~/constants/api'
import type { Review } from '~/types/user'
import type { PaginatedResponse } from '~/types/common'

export const reviewsApi = {
  list(params?: Record<string, any>): Promise<PaginatedResponse<Review>> {
    return api.get(API_ENDPOINTS.REVIEWS.LIST, params)
  },

  get(id: string): Promise<Review> {
    return api.get(API_ENDPOINTS.REVIEWS.DETAIL(id))
  },

  create(data: Record<string, any>): Promise<Review> {
    return api.post(API_ENDPOINTS.REVIEWS.CREATE, data)
  },

  update(id: string, data: Record<string, any>): Promise<Review> {
    return api.put(API_ENDPOINTS.REVIEWS.UPDATE(id), data)
  },

  delete(id: string): Promise<void> {
    return api.delete(API_ENDPOINTS.REVIEWS.DELETE(id))
  },

  approve(id: string): Promise<Review> {
    return api.post(API_ENDPOINTS.REVIEWS.APPROVE(id))
  },

  reject(id: string): Promise<Review> {
    return api.post(API_ENDPOINTS.REVIEWS.REJECT(id))
  },

  flag(id: string): Promise<Review> {
    return api.post(API_ENDPOINTS.REVIEWS.FLAG(id))
  },

  pending(params?: Record<string, any>): Promise<PaginatedResponse<Review>> {
    return api.get(API_ENDPOINTS.REVIEWS.PENDING, params)
  },

  propertyReviews(propertyId: string, params?: Record<string, any>): Promise<PaginatedResponse<Review>> {
    return api.get(API_ENDPOINTS.REVIEWS.PROPERTY(propertyId), params)
  },

  myReviews(params?: Record<string, any>): Promise<PaginatedResponse<Review>> {
    return api.get(API_ENDPOINTS.REVIEWS.MY_REVIEWS, params)
  },
}
