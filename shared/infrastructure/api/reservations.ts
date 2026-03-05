import { api } from './client'
import { API_ENDPOINTS } from '../../domain/constants/api'
import type { Reservation } from '../../domain/types/reservation'
import type { PaginatedResponse } from '../../domain/types/common'

export const reservationsApi = {
  list(params?: Record<string, any>): Promise<PaginatedResponse<Reservation>> {
    return api.get(API_ENDPOINTS.RESERVATIONS.LIST, params)
  },

  get(id: string): Promise<Reservation> {
    return api.get(API_ENDPOINTS.RESERVATIONS.DETAIL(id))
  },

  create(data: Record<string, any>): Promise<Reservation> {
    return api.post(API_ENDPOINTS.RESERVATIONS.CREATE, data)
  },

  cancel(id: string): Promise<Reservation> {
    return api.post(API_ENDPOINTS.RESERVATIONS.CANCEL(id))
  },

  confirm(id: string): Promise<Reservation> {
    return api.post(API_ENDPOINTS.RESERVATIONS.CONFIRM(id))
  },

  getInvoice(id: string): Promise<any> {
    return api.get(API_ENDPOINTS.RESERVATIONS.INVOICE(id))
  },

  pay(id: string, data: Record<string, any>): Promise<any> {
    return api.post(API_ENDPOINTS.RESERVATIONS.PAY(id), data)
  },

  myReservations(params?: Record<string, any>): Promise<PaginatedResponse<Reservation>> {
    return api.get(API_ENDPOINTS.RESERVATIONS.MY_RESERVATIONS, params)
  },

  myBookings(params?: Record<string, any>): Promise<PaginatedResponse<Reservation>> {
    return api.get(API_ENDPOINTS.RESERVATIONS.MY_BOOKINGS, params)
  },

  getCalendar(propertyId: string, params?: Record<string, any>): Promise<any> {
    return api.get(API_ENDPOINTS.RESERVATIONS.CALENDAR(propertyId), params)
  },
}
