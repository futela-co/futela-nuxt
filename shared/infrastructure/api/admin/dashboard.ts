import { api } from '../client'

export const adminDashboardApi = {
  getOverview(): Promise<any> {
    return api.get('/admin/dashboard')
  },

  getStats(params?: Record<string, any>): Promise<any> {
    return api.get('/admin/dashboard/stats', params)
  },
}
