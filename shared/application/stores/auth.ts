import { defineStore } from 'pinia'
import { authApi } from '../../infrastructure/api/auth'
import { setTokens, clearTokens } from '../../infrastructure/api/client'
import { hasRole as checkRole, ROLES } from '../../domain/constants/roles'
import type { User, LoginRequest, RegisterRequest, TokenResponse } from '../../domain/types/auth'

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'futela_access_token',
  REFRESH_TOKEN: 'futela_refresh_token',
  USER: 'futela_user',
} as const

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const refreshTokenValue = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value ? checkRole(user.value.roles, ROLES.ADMIN) : false)
  const isLandlord = computed(() => user.value ? checkRole(user.value.roles, ROLES.LANDLORD) : false)
  const userFullName = computed(() => user.value?.fullName ?? '')
  const userRoles = computed(() => user.value?.roles ?? [])

  function hasRole(role: string): boolean {
    if (!user.value?.roles) return false
    return checkRole(user.value.roles, role as any)
  }

  // Actions
  function initializeAuth() {
    if (typeof window === 'undefined') return

    const storedToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    const storedRefresh = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER)

    if (storedToken && storedUser) {
      token.value = storedToken
      refreshTokenValue.value = storedRefresh
      try {
        user.value = JSON.parse(storedUser)
      } catch {
        clearAuthData()
      }
    }

    setupCrossTabSync()
  }

  function setupCrossTabSync() {
    if (typeof window === 'undefined') return

    window.addEventListener('storage', (event) => {
      if (event.key === STORAGE_KEYS.ACCESS_TOKEN && !event.newValue) {
        user.value = null
        token.value = null
        refreshTokenValue.value = null
        navigateTo('/auth/login')
      }
      if (event.key === STORAGE_KEYS.USER && event.newValue) {
        try { user.value = JSON.parse(event.newValue) } catch { /* ignore */ }
      }
      if (event.key === STORAGE_KEYS.ACCESS_TOKEN && event.newValue) {
        token.value = event.newValue
      }
    })
  }

  function setAuthData(tokens: TokenResponse, userData: User) {
    token.value = tokens.accessToken
    refreshTokenValue.value = tokens.refreshToken
    user.value = userData

    setTokens(tokens.accessToken, tokens.refreshToken)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData))
  }

  function clearAuthData() {
    user.value = null
    token.value = null
    refreshTokenValue.value = null
    error.value = null
    clearTokens()
    localStorage.removeItem(STORAGE_KEYS.USER)
  }

  async function login(credentials: LoginRequest): Promise<{ success: boolean; message?: string }> {
    isLoading.value = true
    error.value = null

    try {
      const tokens = await authApi.login(credentials)
      const userData = await authApi.me(tokens.accessToken)

      // Set everything atomically to avoid intermediate states
      setAuthData(tokens, userData)

      return { success: true }
    } catch (err: any) {
      // Clean up any partial state on failure
      clearAuthData()
      error.value = err.data?.message || 'Échec de la connexion'
      return { success: false, message: error.value ?? undefined }
    } finally {
      isLoading.value = false
    }
  }

  async function register(data: RegisterRequest): Promise<{ success: boolean; message?: string }> {
    isLoading.value = true
    error.value = null

    try {
      const tokens = await authApi.register(data)
      const userData = await authApi.me(tokens.accessToken)

      setAuthData(tokens, userData)

      return { success: true }
    } catch (err: any) {
      clearAuthData()
      error.value = err.data?.message || "Échec de l'inscription"
      return { success: false, message: error.value ?? undefined }
    } finally {
      isLoading.value = false
    }
  }

  async function loginWithGoogle(idToken: string): Promise<{ success: boolean; message?: string }> {
    isLoading.value = true
    error.value = null

    try {
      const tokens = await authApi.googleAuth(idToken)
      const userData = await authApi.me(tokens.accessToken)

      setAuthData(tokens, userData)

      return { success: true }
    } catch (err: any) {
      clearAuthData()
      error.value = err.data?.message || 'Échec de la connexion avec Google'
      return { success: false, message: error.value ?? undefined }
    } finally {
      isLoading.value = false
    }
  }

  async function logout(redirect = true) {
    try {
      await authApi.logout()
    } catch { /* ignore */ }

    clearAuthData()

    if (redirect && typeof window !== 'undefined') {
      navigateTo('/auth/login')
    }
  }

  async function fetchUser(): Promise<User | null> {
    if (!token.value) return null
    isLoading.value = true

    try {
      const userData = await authApi.me()
      user.value = userData
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData))
      return userData
    } catch {
      return null
    } finally {
      isLoading.value = false
    }
  }

  function updateUser(updates: Partial<User>) {
    if (user.value) {
      user.value = { ...user.value, ...updates }
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user.value))
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    user,
    token,
    refreshToken: refreshTokenValue,
    isLoading,
    error,
    // Getters
    isAuthenticated,
    isAdmin,
    isLandlord,
    userFullName,
    userRoles,
    // Actions
    initializeAuth,
    login,
    loginWithGoogle,
    register,
    logout,
    fetchUser,
    setAuthData,
    clearAuthData,
    updateUser,
    clearError,
    hasRole,
  }
})
