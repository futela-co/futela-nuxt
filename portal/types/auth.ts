export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  phone: string | null
  avatar: string | null
  roles: string[]
  isVerified: boolean
  isAvailable: boolean
  emailVerifiedAt: string | null
  lastLoginAt: string | null
  companyId: string
  companyName: string
  createdAt: string
  updatedAt: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  sessionId: string
  expiresIn: number
  tokenType: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

export interface DeviceResponse {
  id: string
  deviceName: string
  ipAddress: string
  lastUsedAt: string
  isCurrent: boolean
}

export interface VerificationCodeResponse {
  message: string
  expiresIn: number
}
