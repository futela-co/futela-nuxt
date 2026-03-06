import { useAuthStore } from '~shared/application/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  const { portalUrl } = useRuntimeConfig().public

  // Ensure auth state is restored from localStorage (handles race conditions with plugin)
  if (import.meta.client && !authStore.isAuthenticated) {
    authStore.initializeAuth()
  }

  // All cpanel routes require authentication
  if (!authStore.isAuthenticated) {
    return navigateTo(`${portalUrl}/auth/login`, { external: true })
  }

  // All cpanel routes require admin role
  if (!authStore.isAdmin) {
    return navigateTo(`${portalUrl}/dashboard`, { external: true })
  }
})
