import { api } from './client'
import { API_ENDPOINTS } from '~/constants/api'
import type { Visit } from '~/types/reservation'
import type { PaginatedResponse } from '~/types/common'

export const visitsApi = {
  schedule(data: Record<string, any>): Promise<Visit> {
    return api.post(API_ENDPOINTS.VISITS.SCHEDULE, data)
  },

  get(id: string): Promise<Visit> {
    return api.get(API_ENDPOINTS.VISITS.DETAIL(id))
  },

  cancel(id: string): Promise<Visit> {
    return api.post(API_ENDPOINTS.VISITS.CANCEL(id))
  },

  confirm(id: string): Promise<Visit> {
    return api.post(API_ENDPOINTS.VISITS.CONFIRM(id))
  },

  complete(id: string): Promise<Visit> {
    return api.post(API_ENDPOINTS.VISITS.COMPLETE(id))
  },

  myVisits(params?: Record<string, any>): Promise<PaginatedResponse<Visit>> {
    return api.get(API_ENDPOINTS.VISITS.MY_VISITS, params)
  },

  upcoming(params?: Record<string, any>): Promise<Visit[]> {
    return api.get(API_ENDPOINTS.VISITS.UPCOMING, params)
  },

  propertyRequests(propertyId: string, params?: Record<string, any>): Promise<PaginatedResponse<Visit>> {
    return api.get(API_ENDPOINTS.VISITS.PROPERTY_REQUESTS(propertyId), params)
  },
}
