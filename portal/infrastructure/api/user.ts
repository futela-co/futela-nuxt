import { api } from './client'
import { API_ENDPOINTS } from '~/constants/api'
import type { User } from '~/types/auth'

export const userApi = {
  getProfile(): Promise<User> {
    return api.get(API_ENDPOINTS.USER.PROFILE)
  },

  updateProfile(data: Record<string, any>): Promise<User> {
    return api.put(API_ENDPOINTS.USER.UPDATE_PROFILE, data)
  },

  updatePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    return api.put(API_ENDPOINTS.USER.UPDATE_PASSWORD, data)
  },

  toggleAvailability(isAvailable: boolean): Promise<User> {
    return api.put(API_ENDPOINTS.USER.TOGGLE_AVAILABILITY, { isAvailable })
  },
}
