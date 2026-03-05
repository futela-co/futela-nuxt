import { useAuthStore } from '~shared/application/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  const { portalUrl } = useRuntimeConfig().public

  // All cpanel routes require authentication
  if (!authStore.isAuthenticated) {
    return navigateTo(`${portalUrl}/auth/login`, { external: true })
  }

  // All cpanel routes require admin role
  if (!authStore.isAdmin) {
    return navigateTo(`${portalUrl}/dashboard`, { external: true })
  }
})
