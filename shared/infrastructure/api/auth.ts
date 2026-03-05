import { ofetch } from 'ofetch'
import { api, apiClient, setTokens, clearTokens, getApiBaseUrl } from './client'
import { API_ENDPOINTS } from '../../domain/constants/api'
import type { User, TokenResponse, LoginRequest, RegisterRequest, DeviceResponse } from '../../domain/types/auth'

export const authApi = {
  login(data: LoginRequest): Promise<TokenResponse> {
    return api.post<TokenResponse>(API_ENDPOINTS.AUTH.LOGIN, data)
  },

  register(data: RegisterRequest): Promise<TokenResponse> {
    return api.post<TokenResponse>(API_ENDPOINTS.AUTH.REGISTER, data)
  },

  logout(): Promise<void> {
    return api.post<void>(API_ENDPOINTS.AUTH.LOGOUT).finally(() => clearTokens())
  },

  refresh(refreshToken: string): Promise<TokenResponse> {
    return api.post<TokenResponse>(API_ENDPOINTS.AUTH.REFRESH, { refreshToken })
  },

  me(accessToken?: string): Promise<User> {
    if (accessToken) {
      // Use raw ofetch to bypass apiClient interceptors (avoids header merging issues)
      return ofetch<User>(`${getApiBaseUrl()}${API_ENDPOINTS.AUTH.ME}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      })
    }
    return api.get<User>(API_ENDPOINTS.AUTH.ME)
  },

  googleAuth(idToken: string): Promise<TokenResponse> {
    return api.post<TokenResponse>(API_ENDPOINTS.AUTH.GOOGLE, { idToken })
  },

  sendEmailCode(email: string): Promise<{ message: string }> {
    return api.post(API_ENDPOINTS.AUTH.SEND_EMAIL_CODE, { email })
  },

  sendPhoneCode(phone: string): Promise<{ message: string }> {
    return api.post(API_ENDPOINTS.AUTH.SEND_PHONE_CODE, { phone })
  },

  confirmEmail(email: string, code: string): Promise<{ message: string }> {
    return api.post(API_ENDPOINTS.AUTH.CONFIRM_EMAIL, { email, code })
  },

  confirmPhone(phone: string, code: string): Promise<{ message: string }> {
    return api.post(API_ENDPOINTS.AUTH.CONFIRM_PHONE, { phone, code })
  },

  getDevices(): Promise<DeviceResponse[]> {
    return api.get<DeviceResponse[]>(API_ENDPOINTS.AUTH.DEVICES)
  },

  revokeAllDevices(): Promise<{ message: string }> {
    return api.post(API_ENDPOINTS.AUTH.REVOKE_ALL)
  },

  storeTokens(tokens: TokenResponse): void {
    setTokens(tokens.accessToken, tokens.refreshToken)
  },
}
