import { useAuthStore } from '../stores/auth'
import type { User } from '../../domain/types/auth'
import { useUiStore } from '../stores/ui'

/**
 * Register request interface
 */
export interface RegisterRequest {
  email: string
  phone?: string
  password: string
  passwordConfirmation: string
  firstName: string
  lastName: string
}

/**
 * Forgot password request interface
 */
export interface ForgotPasswordRequest {
  email?: string
  phone?: string
}

/**
 * Check identifier request interface
 */
export interface CheckIdentifierRequest {
  email?: string
  phone?: string
}

/**
 * Check identifier response interface
 */
export interface CheckIdentifierResponse {
  exists: boolean
}

/**
 * Reset password request interface
 */
export interface ResetPasswordRequest {
  token: string
  password: string
  passwordConfirmation: string
}

/**
 * Change password request interface
 */
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  newPasswordConfirmation: string
}

/**
 * Verify email request interface
 */
export interface VerifyEmailRequest {
  code: string
}

/**
 * Verify phone request interface
 */
export interface VerifyPhoneRequest {
  code: string
}

/**
 * Google auth request interface
 */
export interface GoogleAuthRequest {
  idToken: string
}

/**
 * Auth result interface
 */
export interface AuthResult {
  success: boolean
  message?: string
  errors?: Record<string, string[]>
  user?: User
}

/**
 * Auth helper composable
 * Provides authentication methods using the auth store
 */
export function useAuth() {
  const authStore = useAuthStore()
  const api = useApi()
  const uiStore = useUiStore()

  /**
   * Login with email/phone and password
   */
  async function login(username: string, password: string): Promise<AuthResult> {
    try {
      const success = await authStore.login({ username, password })

      if (success) {
        uiStore.showSuccess('Login Successful', 'Welcome back!')
        const result: AuthResult = { success: true }
        if (authStore.user) {
          result.user = authStore.user
        }
        return result
      }

      return {
        success: false,
        message: authStore.error ?? 'Login failed'
      }
    } catch (error) {
      const err = error as { message?: string; errors?: Record<string, string[]> }
      const result: AuthResult = {
        success: false,
        message: err.message ?? 'Login failed'
      }
      if (err.errors) {
        result.errors = err.errors
      }
      return result
    }
  }

  /**
   * Logout current user
   */
  function logout() {
    authStore.logout()
    uiStore.showInfo('Logged Out', 'You have been logged out successfully.')
  }

  /**
   * Register a new user
   */
  async function register(data: RegisterRequest): Promise<AuthResult> {
    try {
      const response = await api.post<{
        accessToken: string
        refreshToken: string
        user: {
          id: string
          email: string
          name: string
          firstname: string
          lastname: string
          roles: string[]
        }
      }>('/auth/register', {
        email: data.email,
        phone: data.phone,
        password: data.password,
        password_confirmation: data.passwordConfirmation,
        firstName: data.firstName,
        lastName: data.lastName
      })

      // Map backend user response to frontend User interface
      const firstName = response.user.firstname || response.user.name
      const lastName = response.user.lastname || ''
      const mappedUser: User = {
        id: response.user.id,
        email: response.user.email,
        phone: data.phone || null,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`.trim(),
        roles: response.user.roles,
        avatar: null,
        isVerified: false,
        emailVerifiedAt: null,
        lastLoginAt: new Date().toISOString(),
        companyId: '',
        companyName: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isAvailable: false
      }

      // Store auth data
      authStore.setAuthData({ accessToken: response.accessToken, refreshToken: response.refreshToken } as any, mappedUser)

      uiStore.showSuccess('Registration Successful', 'Your account has been created.')

      return { success: true, user: mappedUser }
    } catch (error) {
      const err = error as { message?: string; errors?: Record<string, string[]> }
      return {
        success: false,
        message: err.message ?? 'Registration failed',
        errors: err.errors
      }
    }
  }

  /**
   * Check if identifier (email or phone) exists
   */
  async function checkIdentifier(request: CheckIdentifierRequest): Promise<CheckIdentifierResponse> {
    try {
      const response = await api.post<CheckIdentifierResponse>('/auth/check-identifier', request)
      return response
    } catch {
      // If API fails, assume not found to prevent enumeration
      return { exists: false }
    }
  }

  /**
   * Send forgot password email/SMS
   */
  async function forgotPassword(request: ForgotPasswordRequest): Promise<AuthResult> {
    try {
      await api.post('/auth/forgot-password', request)

      const identifier = request.phone ? 'phone' : 'email'
      uiStore.showSuccess(
        'Code envoy\u00e9',
        identifier === 'phone'
          ? 'Un code de v\u00e9rification a \u00e9t\u00e9 envoy\u00e9 \u00e0 votre num\u00e9ro.'
          : 'Un code de v\u00e9rification a \u00e9t\u00e9 envoy\u00e9 \u00e0 votre email.'
      )

      return { success: true }
    } catch (error) {
      const err = error as { message?: string }
      return {
        success: false,
        message: err.message ?? '\u00c9chec de l\'envoi du code'
      }
    }
  }

  /**
   * Reset password with token
   */
  async function resetPassword(data: ResetPasswordRequest): Promise<AuthResult> {
    try {
      await api.post('/auth/reset-password', {
        token: data.token,
        password: data.password,
        passwordConfirmation: data.passwordConfirmation
      })

      uiStore.showSuccess('Password Reset', 'Your password has been reset successfully.')

      return { success: true }
    } catch (error) {
      const err = error as { message?: string; errors?: Record<string, string[]> }
      return {
        success: false,
        message: err.message ?? 'Password reset failed',
        errors: err.errors
      }
    }
  }

  /**
   * Change password for authenticated user
   */
  async function changePassword(data: ChangePasswordRequest): Promise<AuthResult> {
    try {
      await api.post('/auth/change-password', {
        current_password: data.currentPassword,
        new_password: data.newPassword,
        new_password_confirmation: data.newPasswordConfirmation
      })

      uiStore.showSuccess('Password Changed', 'Your password has been changed successfully.')

      return { success: true }
    } catch (error) {
      const err = error as { message?: string; status?: number; statusCode?: number; errors?: Record<string, string[]> }
      if (err.status === 404 || err.statusCode === 404) {
        return {
          success: false,
          message: 'Cette fonctionnalit\u00e9 n\'est pas encore disponible'
        }
      }
      return {
        success: false,
        message: err.message ?? 'Password change failed',
        errors: err.errors
      }
    }
  }

  /**
   * Send email verification code
   */
  async function sendEmailVerificationCode(): Promise<AuthResult> {
    try {
      await api.post('/auth/send-email-code')

      uiStore.showSuccess('Code Sent', 'A verification code has been sent to your email.')

      return { success: true }
    } catch (error) {
      const err = error as { message?: string }
      return {
        success: false,
        message: err.message ?? 'Failed to send verification code'
      }
    }
  }

  /**
   * Verify email with code
   */
  async function verifyEmail(code: string): Promise<AuthResult> {
    try {
      await api.post('/auth/confirm-email', { code })

      // Update user state
      authStore.updateUser({ emailVerifiedAt: new Date().toISOString() })

      uiStore.showSuccess('Email Verified', 'Your email has been verified successfully.')

      return { success: true }
    } catch (error) {
      const err = error as { message?: string; errors?: Record<string, string[]> }
      return {
        success: false,
        message: err.message ?? 'Email verification failed',
        errors: err.errors
      }
    }
  }

  /**
   * Send phone verification code
   */
  async function sendPhoneVerificationCode(): Promise<AuthResult> {
    try {
      await api.post('/auth/send-phone-code')

      uiStore.showSuccess('Code Sent', 'A verification code has been sent to your phone.')

      return { success: true }
    } catch (error) {
      const err = error as { message?: string }
      return {
        success: false,
        message: err.message ?? 'Failed to send verification code'
      }
    }
  }

  /**
   * Verify phone with code
   */
  async function verifyPhone(code: string): Promise<AuthResult> {
    try {
      await api.post('/auth/confirm-phone', { code })

      // Update user state
      authStore.updateUser({ isVerified: true })

      uiStore.showSuccess('Phone Verified', 'Your phone number has been verified successfully.')

      return { success: true }
    } catch (error) {
      const err = error as { message?: string; errors?: Record<string, string[]> }
      return {
        success: false,
        message: err.message ?? 'Phone verification failed',
        errors: err.errors
      }
    }
  }

  /**
   * Login with Google OAuth
   */
  async function loginWithGoogle(idToken: string): Promise<AuthResult> {
    const result = await authStore.loginWithGoogle(idToken)
    if (result.success) {
      uiStore.showSuccess('Connexion r\u00e9ussie', 'Bienvenue !')
      return { success: true, user: authStore.user ?? undefined }
    }
    return {
      success: false,
      message: result.message ?? 'Echec de la connexion avec Google'
    }
  }

  /**
   * Update user profile
   */
  async function updateProfile(data: Partial<User>): Promise<AuthResult> {
    try {
      const response = await api.patch<User>('/auth/profile', {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone
      })

      // Update local user state
      authStore.updateUser(response)

      uiStore.showSuccess('Profile Updated', 'Your profile has been updated successfully.')

      return { success: true, user: response }
    } catch (error) {
      const err = error as { message?: string; status?: number; statusCode?: number; errors?: Record<string, string[]> }
      if (err.status === 404 || err.statusCode === 404) {
        return {
          success: false,
          message: 'Cette fonctionnalit\u00e9 n\'est pas encore disponible'
        }
      }
      return {
        success: false,
        message: err.message ?? 'Profile update failed',
        errors: err.errors
      }
    }
  }

  /**
   * Update user avatar
   */
  async function updateAvatar(file: File): Promise<AuthResult> {
    try {
      const response = await api.upload<User>('/auth/avatar', file, 'avatar')

      // Update local user state
      authStore.updateUser({ avatar: response.avatar })

      uiStore.showSuccess('Avatar Updated', 'Your avatar has been updated successfully.')

      return { success: true, user: response }
    } catch (error) {
      const err = error as { message?: string; status?: number; statusCode?: number }
      if (err.status === 404 || err.statusCode === 404) {
        return {
          success: false,
          message: 'Cette fonctionnalit\u00e9 n\'est pas encore disponible'
        }
      }
      return {
        success: false,
        message: err.message ?? 'Avatar update failed'
      }
    }
  }

  /**
   * Delete user account
   */
  async function deleteAccount(password: string): Promise<AuthResult> {
    try {
      await api.delete('/auth/account', {
        params: { password }
      })

      // Logout after account deletion
      authStore.logout()

      uiStore.showInfo('Account Deleted', 'Your account has been deleted.')

      return { success: true }
    } catch (error) {
      const err = error as { message?: string; status?: number; statusCode?: number; errors?: Record<string, string[]> }
      if (err.status === 404 || err.statusCode === 404) {
        return {
          success: false,
          message: 'Cette fonctionnalit\u00e9 n\'est pas encore disponible'
        }
      }
      return {
        success: false,
        message: err.message ?? 'Account deletion failed',
        errors: err.errors
      }
    }
  }

  /**
   * Get authenticated user
   */
  async function getUser(): Promise<User | null> {
    return authStore.fetchUser()
  }

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = computed(() => authStore.isAuthenticated)

  /**
   * Get current user
   */
  const user = computed(() => authStore.user)

  /**
   * Check if user is admin
   */
  const isAdmin = computed(() => authStore.isAdmin)

  /**
   * Check if auth is loading
   */
  const isLoading = computed(() => authStore.isLoading)

  /**
   * Get auth error
   */
  const error = computed(() => authStore.error)

  /**
   * Check if user has any of the specified roles
   */
  function hasAnyRole(roles: string[]): boolean {
    const currentUser = authStore.user
    if (!currentUser || !currentUser.roles) return false
    return roles.some(role => currentUser.roles.includes(role))
  }

  /**
   * Check if user has a specific role
   */
  function hasRole(role: string): boolean {
    const currentUser = authStore.user
    if (!currentUser || !currentUser.roles) return false
    return currentUser.roles.includes(role)
  }

  return {
    // Methods
    login,
    logout,
    register,
    checkIdentifier,
    forgotPassword,
    resetPassword,
    changePassword,
    sendEmailVerificationCode,
    verifyEmail,
    sendPhoneVerificationCode,
    verifyPhone,
    loginWithGoogle,
    updateProfile,
    updateAvatar,
    deleteAccount,
    getUser,
    hasAnyRole,
    hasRole,

    // Computed
    isAuthenticated,
    user,
    isAdmin,
    isLoading,
    error
  }
}
