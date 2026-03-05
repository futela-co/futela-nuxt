import { useAuthStore } from '~shared/application/stores/auth'
import { useUiStore } from '~shared/application/stores/ui'

let lastUserCheck = 0
const USER_CHECK_INTERVAL = 60000

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  const uiStore = useUiStore()
  const { cpanelUrl } = useRuntimeConfig().public

  uiStore.clearErrorPage()

  // Public routes - bypass
  if (to.meta.public) {
    return
  }

  // Guest routes - redirect if authenticated
  if (to.meta.guest) {
    if (authStore.isAuthenticated) {
      const redirectFromQuery = to.query.redirect as string
      const redirectFromStorage = import.meta.client
        ? localStorage.getItem('auth_redirect_url')
        : null
      const redirectUrl = redirectFromQuery || redirectFromStorage

      if (redirectUrl && !redirectUrl.startsWith('/auth/')) {
        if (import.meta.client) {
          localStorage.removeItem('auth_redirect_url')
        }
        return navigateTo(redirectUrl)
      }

      // Redirect based on role
      if (authStore.isAdmin) {
        return navigateTo(String(cpanelUrl), { external: true })
      }
      return navigateTo('/dashboard')
    }
    return
  }

  // Protected routes - redirect if not authenticated
  if (!authStore.isAuthenticated) {
    // Don't redirect back to auth pages (prevents loops like ?redirect=/login)
    const redirectPath = to.fullPath.startsWith('/auth/') ? undefined : to.fullPath

    if (import.meta.client && redirectPath) {
      localStorage.setItem('auth_redirect_url', redirectPath)
    }

    return navigateTo({
      path: '/auth/login',
      query: redirectPath ? { redirect: redirectPath } : undefined,
    })
  }

  // Periodic user refresh (every 60s)
  const now = Date.now()
  if (now - lastUserCheck > USER_CHECK_INTERVAL) {
    lastUserCheck = now
    try {
      await authStore.fetchUser()
    } catch {
      // Ignore errors - will use cached data
    }
  }

  // Landlord-only routes
  if (to.meta.landlord) {
    if (!authStore.isLandlord && !authStore.isAdmin) {
      uiStore.showErrorPage('403')
      return abortNavigation()
    }
  }

  // Admin routes redirect to cpanel
  if (to.meta.admin) {
    return navigateTo(String(cpanelUrl), { external: true })
  }

  // Set page title
  if (import.meta.client) {
    const appName = useRuntimeConfig().public.appName || 'Futela'
    if (to.meta.title) {
      document.title = `${to.meta.title} - ${appName}`
    } else {
      document.title = String(appName)
    }
  }
})
