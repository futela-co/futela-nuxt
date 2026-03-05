import { ofetch, type FetchOptions } from 'ofetch'
import { getEnv } from '../../config/env'

const STORAGE_KEY_TOKEN = 'futela_access_token'
const STORAGE_KEY_REFRESH = 'futela_refresh_token'
const STORAGE_KEY_LOCALE = 'futela_locale'

let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null

function getToken(): string | null {
  if (import.meta.server) return null
  return localStorage.getItem(STORAGE_KEY_TOKEN)
}

function getRefreshToken(): string | null {
  if (import.meta.server) return null
  return localStorage.getItem(STORAGE_KEY_REFRESH)
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(STORAGE_KEY_TOKEN, accessToken)
  localStorage.setItem(STORAGE_KEY_REFRESH, refreshToken)
}

export function clearTokens(): void {
  localStorage.removeItem(STORAGE_KEY_TOKEN)
  localStorage.removeItem(STORAGE_KEY_REFRESH)
}

export function getApiBaseUrl(): string {
  return getEnv().API_BASE_URL
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null

  try {
    const response = await ofetch<{ accessToken: string; refreshToken: string }>(
      `${getApiBaseUrl()}/auth/refresh`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { refreshToken },
      }
    )
    setTokens(response.accessToken, response.refreshToken)
    return response.accessToken
  } catch {
    clearTokens()
    return null
  }
}

async function getValidToken(): Promise<string | null> {
  const token = getToken()
  if (token) return token

  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true
  refreshPromise = refreshAccessToken().finally(() => {
    isRefreshing = false
    refreshPromise = null
  })

  return refreshPromise
}

export const apiClient = ofetch.create({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },

  async onRequest({ options }) {
    // Set baseURL dynamically (useRuntimeConfig not available at module level)
    if (!options.baseURL) {
      options.baseURL = getApiBaseUrl()
    }

    // Normalize headers to a plain object
    const h: Record<string, string> = {}
    const raw = options.headers as HeadersInit | undefined
    if (raw) {
      if (raw instanceof Headers) {
        raw.forEach((v: string, k: string) => { h[k] = v })
      } else if (Array.isArray(raw)) {
        (raw as string[][]).forEach(([k, v]) => { h[k] = v })
      } else {
        Object.assign(h, raw)
      }
    }

    // Add Authorization token
    const token = getToken()
    if (token) {
      h['Authorization'] = `Bearer ${token}`
    }

    // Add Accept-Language from user locale
    if (import.meta.client) {
      h['Accept-Language'] = localStorage.getItem(STORAGE_KEY_LOCALE) || 'fr'
    }

    // Remove undefined values (e.g. Content-Type: undefined for multipart uploads)
    for (const key of Object.keys(h)) {
      if ((h as any)[key] === undefined || (h as any)[key] === 'undefined') {
        delete h[key]
      }
    }

    ;(options as any).headers = h
  },

  async onResponseError({ response, options, request }) {
    const url = typeof request === 'string' ? request : (request as Request)?.url ?? ''
    if (/\/(login|auth\/(login|register|google|refresh))/.test(url)) return

    if (response.status === 401 && !(options as any)._retry) {
      // Token is invalid/expired — try to refresh it
      const newToken = await refreshAccessToken()
      if (newToken) {
        ;(options as any)._retry = true
        const h: Record<string, string> = {}
        const raw = options.headers as HeadersInit | undefined
        if (raw) {
          if (raw instanceof Headers) {
            raw.forEach((v: string, k: string) => { h[k] = v })
          } else if (Array.isArray(raw)) {
            (raw as string[][]).forEach(([k, v]) => { h[k] = v })
          } else {
            Object.assign(h, raw)
          }
        }
        h['Authorization'] = `Bearer ${newToken}`
        ;(options as any).headers = h
        // Use response.url (full URL) so remove baseURL to avoid doubling
        const retryOptions = { ...options, baseURL: undefined } as FetchOptions
        await ofetch(response.url, retryOptions)
        return
      }
      // Refresh failed — clear everything and redirect to login
      clearTokens()
      if (import.meta.client) {
        // Also clear auth store state
        try {
          const { useAuthStore } = await import('../../application/stores/auth')
          const authStore = useAuthStore()
          authStore.logout(false)
        } catch { /* ignore */ }
        navigateTo('/auth/login')
      }
    }
  },
})

// Typed API methods
export const api = {
  get<T>(url: string, params?: Record<string, any>): Promise<T> {
    return apiClient<T>(url, { method: 'GET', params })
  },

  post<T>(url: string, body?: any): Promise<T> {
    return apiClient<T>(url, { method: 'POST', body })
  },

  put<T>(url: string, body?: any): Promise<T> {
    return apiClient<T>(url, { method: 'PUT', body })
  },

  patch<T>(url: string, body?: any): Promise<T> {
    return apiClient<T>(url, { method: 'PATCH', body })
  },

  delete<T>(url: string): Promise<T> {
    return apiClient<T>(url, { method: 'DELETE' })
  },

  upload<T>(url: string, formData: FormData): Promise<T> {
    return apiClient<T>(url, {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': undefined as any },
    })
  },
}
