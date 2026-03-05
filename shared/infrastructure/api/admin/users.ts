import { api } from '../client'
import type { User } from '~/domain/types/auth'
import type { PaginatedResponse } from '~/domain/types/common'

export const adminUsersApi = {
  list(params?: Record<string, any>): Promise<PaginatedResponse<User>> {
    return api.get('/admin/users', params)
  },

  get(id: string): Promise<User> {
    return api.get(`/admin/users/${id}`)
  },

  update(id: string, data: Record<string, any>): Promise<User> {
    return api.put(`/admin/users/${id}`, data)
  },

  delete(id: string): Promise<void> {
    return api.delete(`/admin/users/${id}`)
  },
}
