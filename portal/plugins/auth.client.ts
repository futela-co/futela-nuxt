import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(async () => {
  try {
    const authStore = useAuthStore()
    await authStore.initializeAuth()
  } catch (e) {
    console.warn('[auth] Failed to initialize auth:', e)
  }
})
