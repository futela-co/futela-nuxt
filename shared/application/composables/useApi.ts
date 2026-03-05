import { $fetch, type FetchError } from 'ofetch'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'
import { getEnv } from '../../config/env'

// ============================================================================
// Token Refresh Queue System
// Prevents multiple simultaneous refresh requests
// ============================================================================
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else if (token) {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Storage keys (must match auth store)
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  SESSION_ID: 'auth_session_id',
  USER: 'auth_user',
  REMEMBER: 'auth_remember_me',
} as const

/**
 * API response wrapper interface
 */
export interface ApiResponse<T> {
  data: T
  message?: string
  meta?: {
    total?: number
    page?: number
    limit?: number
    totalPages?: number
  }
}

/**
 * API error interface
 */
export interface ApiError {
  message: string
  code?: string
  errors?: Record<string, string[]>
  status?: number
}

/**
 * Request options interface
 */
export interface RequestOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: Record<string, any>
  headers?: Record<string, string>
  timeout?: number
  retry?: number
  retryDelay?: number
  /** Skip automatic camelCase to snake_case transformation for request body */
  skipTransform?: boolean
}

/**
 * Transform request data (no-op: using camelCase everywhere now)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformRequest(data: any): any {
  return data
}

/**
 * Transform response data (no-op: using camelCase everywhere now)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformResponse<T>(data: any): T {
  return data as T
}

/**
 * Generic API client composable
 * Provides methods for making HTTP requests with automatic auth token injection,
 * global error handling, and token refresh queue system
 */
export function useApi() {
  const authStore = useAuthStore()
  const uiStore = useUiStore()

  /**
   * Handle token refresh from response headers (transparent server-side refresh)
   * Backend can include X-Token-Refreshed header with new tokens on ANY response
   *
   * IMPORTANT: Backend must expose these headers via CORS:
   * Access-Control-Expose-Headers: X-Token-Refreshed, X-New-Access-Token, X-New-Refresh-Token
   */
  function handleTokenRefreshHeaders(response: Response) {
    try {
      const tokenRefreshed = response.headers.get('x-token-refreshed')
      const newAccessToken = response.headers.get('x-new-access-token')
      const newRefreshToken = response.headers.get('x-new-refresh-token')

      if (import.meta.env.DEV && tokenRefreshed) {
        console.log('[Auth] Token refresh headers detected:', {
          tokenRefreshed,
          hasNewAccessToken: !!newAccessToken,
          hasNewRefreshToken: !!newRefreshToken
        })
      }

      if (tokenRefreshed === 'true') {
        if (newAccessToken) {
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken)
          authStore.token = newAccessToken
          if (import.meta.env.DEV) {
            console.log('[Auth] Access token refreshed automatically')
          }
        }

        if (newRefreshToken) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken)
          authStore.refreshToken = newRefreshToken
          if (import.meta.env.DEV) {
            console.log('[Auth] Refresh token rotated automatically')
          }
        }
      }
    } catch (error) {
      console.error('[Auth] Error handling token refresh headers:', error)
    }
  }

  /**
   * Base fetch configuration
   */
  function createFetchOptions(options: RequestOptions = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    }

    // Inject auth token if available
    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`
    }

    return {
      baseURL: getEnv().API_BASE_URL,
      headers,
      timeout: options.timeout ?? 30000,
      retry: options.retry ?? 0,
      retryDelay: options.retryDelay ?? 1000,
      onResponse: ({ response }: { response: Response }) => {
        if (response && response.headers) {
          handleTokenRefreshHeaders(response)
        }
      },
      onResponseError: handleResponseError
    }
  }

  /**
   * Handle response errors globally
   * Includes automatic token refresh with queue system for 401 errors
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function handleResponseError({ response, request, options }: { response: Response; request: RequestInfo; options: any }) {
    const status = response.status

    // Handle 401 - Unauthorized (token expired or invalid)
    if (status === 401) {
      const url = typeof request === 'string' ? request : (request.url || options.url || '')
      if (url.includes('/auth/')) {
        if (import.meta.env.DEV) {
          console.log('[Auth] 401 on auth endpoint, skipping refresh:', url)
        }
        return
      }

      if (import.meta.env.DEV) {
        console.log('[Auth] 401 received, attempting token refresh...', { isRefreshing, url })
      }

      if (!isRefreshing) {
        isRefreshing = true

        try {
          const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
          if (!refreshToken) {
            if (import.meta.env.DEV) {
              console.log('[Auth] No refresh token in localStorage')
            }
            throw new Error('No refresh token available')
          }

          if (import.meta.env.DEV) {
            console.log('[Auth] Calling /auth/refresh with token:', refreshToken.substring(0, 10) + '...')
          }

          const refreshResponse = await $fetch<{
            accessToken: string
            refreshToken?: string
          }>(`${getEnv().API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            body: { refreshToken: refreshToken },
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          })

          if (import.meta.env.DEV) {
            console.log('[Auth] Refresh successful:', {
              hasNewAccessToken: !!refreshResponse.accessToken,
              hasNewRefreshToken: !!refreshResponse.refreshToken
            })
          }

          const newAccessToken = refreshResponse.accessToken
          const newRefreshToken = refreshResponse.refreshToken

          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken)
          if (newRefreshToken) {
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken)
          }

          authStore.token = newAccessToken
          if (newRefreshToken) {
            authStore.refreshToken = newRefreshToken
          }

          processQueue(null, newAccessToken)

        } catch (refreshError) {
          if (import.meta.env.DEV) {
            console.error('[Auth] Refresh failed:', refreshError)
          }
          processQueue(refreshError, null)

          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
          localStorage.removeItem(STORAGE_KEYS.SESSION_ID)
          localStorage.removeItem(STORAGE_KEYS.USER)

          authStore.logout(false)
        } finally {
          isRefreshing = false
        }
      } else {
        if (import.meta.env.DEV) {
          console.log('[Auth] Refresh already in progress, request will be queued')
        }
      }
    }

    // Handle 403 - Forbidden
    if (status === 403) {
      navigateTo('/unauthorized')
    }

    // Handle 404 - Not Found
    if (status === 404) {
      // Could navigate to 404 page or handle differently
    }

    // Handle 422 - Validation Error
    if (status === 422) {
      // Validation errors are returned to caller
    }

    // Handle 500+ - Server errors
    if (status >= 500) {
      uiStore.showError('Server Error', 'An unexpected error occurred. Please try again later.')
    }
  }

  /**
   * Parse error response from FetchError
   * Extracts user-friendly message from various error formats
   */
  function parseError(error: FetchError): ApiError {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = error.response?.status ?? error.status ?? (error as any).statusCode

    const errorData = error.data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ?? (error.response as any)?._data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ?? (error as any)._data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ?? (error as any).response?.data

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsedData: Record<string, any> | undefined
    if (typeof errorData === 'string') {
      try {
        parsedData = JSON.parse(errorData)
      } catch {
        return { message: errorData, status }
      }
    } else if (errorData && typeof errorData === 'object') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      parsedData = errorData as Record<string, any>
    }

    let message = 'Une erreur est survenue'
    if (parsedData) {
      if (typeof parsedData.message === 'string') {
        message = parsedData.message
      } else if (parsedData.error && typeof parsedData.error === 'object' && typeof parsedData.error.message === 'string') {
        message = parsedData.error.message
      } else if (typeof parsedData.error === 'string') {
        message = parsedData.error
      } else if (typeof parsedData.detail === 'string') {
        // API Platform format
        message = parsedData.detail
      }
    } else if (error.statusMessage && error.statusMessage !== 'Internal Server Error') {
      message = error.statusMessage
    }

    const result: ApiError = { message, status }

    if (parsedData?.errors) {
      result.errors = parsedData.errors
    }
    if (parsedData?.code !== undefined) {
      result.code = String(parsedData.code)
    } else if (parsedData?.error?.code !== undefined) {
      result.code = String(parsedData.error.code)
    }

    return result
  }

  /**
   * GET request
   * Includes automatic retry after 401 token refresh
   */
  async function get<T>(url: string, options: RequestOptions = {}, _isRetry = false): Promise<T> {
    const fetchOptions = createFetchOptions(options)

    try {
      const params = options.params ? transformRequest(options.params) : undefined

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await $fetch<any>(url, {
        ...fetchOptions,
        method: 'GET',
        ...(params && { params })
      })

      return transformResponse<T>(response)
    } catch (error) {
      const fetchError = error as FetchError

      if (fetchError.response?.status === 401 && !_isRetry && !url.includes('/auth/')) {
        if (isRefreshing) {
          return new Promise<T>((resolve, reject) => {
            failedQueue.push({
              resolve: () => {
                get<T>(url, options, true).then(resolve).catch(reject)
              },
              reject
            })
          })
        }
        await new Promise(resolve => setTimeout(resolve, 100))
        if (authStore.token) {
          return get<T>(url, options, true)
        }
      }

      throw parseError(fetchError)
    }
  }

  /**
   * POST request
   * Includes automatic retry after 401 token refresh
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function post<T>(url: string, body?: any, options: RequestOptions = {}, _isRetry = false): Promise<T> {
    const fetchOptions = createFetchOptions(options)

    // When sending FormData, remove Content-Type so the browser sets it with the correct boundary
    if (body instanceof FormData) {
      delete fetchOptions.headers['Content-Type']
    }

    try {
      const transformedBody = body ? (body instanceof FormData || options.skipTransform ? body : transformRequest(body)) : undefined

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await $fetch<any>(url, {
        ...fetchOptions,
        method: 'POST',
        body: transformedBody
      })

      return transformResponse<T>(response)
    } catch (error) {
      const fetchError = error as FetchError

      if (fetchError.response?.status === 401 && !_isRetry && !url.includes('/auth/')) {
        if (isRefreshing) {
          return new Promise<T>((resolve, reject) => {
            failedQueue.push({
              resolve: () => {
                post<T>(url, body, options, true).then(resolve).catch(reject)
              },
              reject
            })
          })
        }
        await new Promise(resolve => setTimeout(resolve, 100))
        if (authStore.token) {
          return post<T>(url, body, options, true)
        }
      }

      throw parseError(fetchError)
    }
  }

  /**
   * PUT request
   * Includes automatic retry after 401 token refresh
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function put<T>(url: string, body?: any, options: RequestOptions = {}, _isRetry = false): Promise<T> {
    const fetchOptions = createFetchOptions(options)

    try {
      const transformedBody = body ? transformRequest(body) : undefined

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await $fetch<any>(url, {
        ...fetchOptions,
        method: 'PUT',
        body: transformedBody
      })

      return transformResponse<T>(response)
    } catch (error) {
      const fetchError = error as FetchError

      if (fetchError.response?.status === 401 && !_isRetry && !url.includes('/auth/')) {
        if (isRefreshing) {
          return new Promise<T>((resolve, reject) => {
            failedQueue.push({
              resolve: () => {
                put<T>(url, body, options, true).then(resolve).catch(reject)
              },
              reject
            })
          })
        }
        await new Promise(resolve => setTimeout(resolve, 100))
        if (authStore.token) {
          return put<T>(url, body, options, true)
        }
      }

      throw parseError(fetchError)
    }
  }

  /**
   * PATCH request
   * Uses application/merge-patch+json content-type for API Platform compatibility
   * Includes automatic retry after 401 token refresh
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function patch<T>(url: string, body?: any, options: RequestOptions = {}, _isRetry = false): Promise<T> {
    const fetchOptions = createFetchOptions(options)

    // Override content-type for PATCH requests (API Platform requires merge-patch+json)
    fetchOptions.headers['Content-Type'] = 'application/merge-patch+json'

    try {
      const transformedBody = body ? transformRequest(body) : undefined

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await $fetch<any>(url, {
        ...fetchOptions,
        method: 'PATCH',
        body: transformedBody
      })

      return transformResponse<T>(response)
    } catch (error) {
      const fetchError = error as FetchError

      if (fetchError.response?.status === 401 && !_isRetry && !url.includes('/auth/')) {
        if (isRefreshing) {
          return new Promise<T>((resolve, reject) => {
            failedQueue.push({
              resolve: () => {
                patch<T>(url, body, options, true).then(resolve).catch(reject)
              },
              reject
            })
          })
        }
        await new Promise(resolve => setTimeout(resolve, 100))
        if (authStore.token) {
          return patch<T>(url, body, options, true)
        }
      }

      throw parseError(fetchError)
    }
  }

  /**
   * DELETE request
   * Includes automatic retry after 401 token refresh
   */
  async function del<T>(url: string, options: RequestOptions = {}, _isRetry = false): Promise<T> {
    const fetchOptions = createFetchOptions(options)

    try {
      const params = options.params ? transformRequest(options.params) : undefined

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await $fetch<any>(url, {
        ...fetchOptions,
        method: 'DELETE',
        ...(params && { params })
      })

      return transformResponse<T>(response)
    } catch (error) {
      const fetchError = error as FetchError

      if (fetchError.response?.status === 401 && !_isRetry && !url.includes('/auth/')) {
        if (isRefreshing) {
          return new Promise<T>((resolve, reject) => {
            failedQueue.push({
              resolve: () => {
                del<T>(url, options, true).then(resolve).catch(reject)
              },
              reject
            })
          })
        }
        await new Promise(resolve => setTimeout(resolve, 100))
        if (authStore.token) {
          return del<T>(url, options, true)
        }
      }

      throw parseError(fetchError)
    }
  }

  /**
   * Upload file(s)
   */
  async function upload<T>(
    url: string,
    files: File | File[],
    fieldName = 'file',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    additionalData?: Record<string, any>,
    options: RequestOptions = {}
  ): Promise<T> {
    const formData = new FormData()

    const fileArray = Array.isArray(files) ? files : [files]
    fileArray.forEach((file, index) => {
      const name = fileArray.length === 1 ? fieldName : `${fieldName}[${index}]`
      formData.append(name, file)
    })

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
      })
    }

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      ...options.headers
    }

    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`
    }

    try {
      return await $fetch<T>(url, {
        baseURL: getEnv().API_BASE_URL,
        method: 'POST',
        body: formData,
        headers,
        timeout: options.timeout ?? 60000,
        onResponseError: handleResponseError
      })
    } catch (error) {
      throw parseError(error as FetchError)
    }
  }

  /**
   * Download file
   */
  async function download(
    url: string,
    filename: string,
    options: RequestOptions = {}
  ): Promise<void> {
    const fetchOptions = createFetchOptions(options)

    try {
      const blob = await $fetch<Blob>(url, {
        ...fetchOptions,
        method: 'GET',
        ...(options.params && { params: options.params }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        responseType: 'blob' as any
      })

      if (typeof window !== 'undefined') {
        const downloadUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(downloadUrl)
      }
    } catch (error) {
      throw parseError(error as FetchError)
    }
  }

  /**
   * Build URL with query parameters
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function buildUrl(baseUrl: string, params?: Record<string, any>): string {
    if (!params) return baseUrl

    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(`${key}[]`, String(v)))
        } else {
          searchParams.append(key, String(value))
        }
      }
    })

    const queryString = searchParams.toString()
    return queryString ? `${baseUrl}?${queryString}` : baseUrl
  }

  return {
    get,
    post,
    put,
    patch,
    delete: del,
    upload,
    download,
    buildUrl
  }
}

/**
 * Type alias for the useApi return type
 */
export type ApiClient = ReturnType<typeof useApi>

/**
 * Extract error message from various error formats
 * Handles API errors, FetchErrors, and plain error objects
 * Always returns a user-friendly string message
 */
export function extractErrorMessage(error: unknown, defaultMessage = 'Une erreur est survenue'): string {
  if (!error) return defaultMessage

  if (typeof error === 'string') return error

  if (typeof error === 'object' && error !== null) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as Record<string, any>

    if (typeof err.message === 'string') {
      return err.message
    }

    if (err.error && typeof err.error === 'object' && typeof err.error.message === 'string') {
      return err.error.message
    }

    if (err.data && typeof err.data.message === 'string') {
      return err.data.message
    }

    if (err.data?.error && typeof err.data.error === 'object' && typeof err.data.error.message === 'string') {
      return err.data.error.message
    }

    if (typeof err.error === 'string') {
      return err.error
    }

    if (typeof err.statusMessage === 'string') {
      return err.statusMessage
    }
  }

  return defaultMessage
}
