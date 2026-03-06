import { useAuthStore } from '~shared/application/stores/auth'
import { setTokens } from '~shared/infrastructure/api/client'

export default defineNuxtPlugin(async () => {
  try {
    const authStore = useAuthStore()

    // Check for auth tokens passed via URL hash (cross-app auth from portal)
    if (window.location.hash) {
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)
      const token = params.get('auth_token')
      const refresh = params.get('auth_refresh')
      const userJson = params.get('auth_user')

      if (token && refresh && userJson) {
        try {
          const user = JSON.parse(decodeURIComponent(userJson))
          // Store tokens and user in localStorage
          setTokens(token, refresh)
          localStorage.setItem('futela_access_token', token)
          localStorage.setItem('futela_refresh_token', refresh)
          localStorage.setItem('futela_user', JSON.stringify(user))
          // Clean URL hash
          history.replaceState(null, '', window.location.pathname + window.location.search)
        } catch {
          // Invalid data, ignore
        }
      }
    }

    authStore.initializeAuth()
  } catch (e) {
    console.warn('[auth] Failed to initialize auth:', e)
  }
})
