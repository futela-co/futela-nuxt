import { api } from './client'
import { API_ENDPOINTS } from '~/constants/api'
import type { Notification } from '~/types/user'
import type { PaginatedResponse } from '~/types/common'

export const notificationsApi = {
  list(params?: Record<string, any>): Promise<PaginatedResponse<Notification>> {
    return api.get(API_ENDPOINTS.NOTIFICATIONS.LIST, params)
  },

  get(id: string): Promise<Notification> {
    return api.get(API_ENDPOINTS.NOTIFICATIONS.DETAIL(id))
  },

  markAsRead(id: string): Promise<void> {
    return api.put(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id))
  },

  markAllAsRead(): Promise<void> {
    return api.put(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ)
  },

  delete(id: string): Promise<void> {
    return api.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id))
  },

  getUnreadCount(): Promise<{ count: number }> {
    return api.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT)
  },

  getUnread(params?: Record<string, any>): Promise<Notification[]> {
    return api.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD, params)
  },
}
