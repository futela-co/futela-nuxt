<script setup lang="ts">
import {
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  EnvelopeIcon,
  PhoneIcon,
  LockClosedIcon,
  UserIcon,
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'auth',
  guest: true,
})

const authStore = useAuthStore()
const route = useRoute()
const { t } = useLocale()

const identifier = ref('')
const password = ref('')

const loading = ref(false)
const error = ref<string | null>(null)
const showPassword = ref(false)
const rememberMe = ref(false)

// Flash messages from query params
const showResetSuccess = ref(route.query.reset === 'success')
const showInactivityMessage = ref(route.query.reason === 'inactivity')
const showExpiredMessage = ref(route.query.reason === 'expired')

// Detect input type
const isPhone = computed(() => /^[0-9+\s()-]+$/.test(identifier.value.trim()))
const isEmail = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.value.trim()))

// Validation
const identifierValid = computed(() => {
  if (!identifier.value) return false
  return isEmail.value || isPhone.value
})

const identifierError = computed(() => {
  if (!identifier.value) return null
  if (!isEmail.value && !isPhone.value) {
    return t('auth.identifierError')
  }
  return null
})

const isFormValid = computed(() => {
  return identifierValid.value && password.value.length >= 1
})

async function handleSubmit() {
  if (!isFormValid.value) return

  error.value = null
  loading.value = true

  try {
    const result = await authStore.login({
      username: identifier.value.trim(),
      password: password.value,
    })

    if (result.success) {
      const redirect = route.query.redirect as string
      // Validate redirect: must start with / and not be an auth page
      const safeRedirect = redirect && redirect.startsWith('/') && !redirect.startsWith('/auth/')
        ? redirect
        : '/dashboard'
      await navigateTo(safeRedirect)
    } else {
      error.value = result.message || t('auth.loginError')
    }
  } catch (err: any) {
    error.value = err?.message || t('auth.connectionError')
  } finally {
    loading.value = false
  }
}

async function handleGoogleAuth(idToken: string) {
  error.value = null
  loading.value = true

  try {
    const result = await authStore.loginWithGoogle(idToken)

    if (result.success) {
      const redirect = route.query.redirect as string
      const safeRedirect = redirect && redirect.startsWith('/') && !redirect.startsWith('/auth/')
        ? redirect
        : '/dashboard'
      await navigateTo(safeRedirect)
    } else {
      error.value = result.message || t('auth.googleError')
    }
  } catch (err: any) {
    error.value = err?.message || t('auth.googleError')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <!-- Icon -->
    <div class="auth-icon-container">
      <UserIcon class="auth-icon" />
    </div>

    <!-- Title -->
    <h1 class="auth-title">
      {{ t('auth.login') }}
    </h1>
    <p class="auth-subtitle">
      {{ t('auth.loginSubtitle') }}
    </p>

    <!-- Success message after password reset -->
    <div
      v-if="showResetSuccess"
      class="mb-4 p-4 bg-green-50 border border-green-200 rounded"
    >
      <div class="flex items-center gap-2 text-green-600">
        <CheckCircleIcon class="h-5 w-5" />
        <span class="text-sm font-medium">{{ t('auth.resetSuccess') }}</span>
      </div>
    </div>

    <!-- Inactivity logout message -->
    <div
      v-if="showInactivityMessage"
      class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded"
    >
      <div class="flex items-center gap-2 text-yellow-700">
        <ClockIcon class="h-5 w-5" />
        <span class="text-sm font-medium">{{ t('auth.inactivityMessage') }}</span>
      </div>
    </div>

    <!-- Token expired message -->
    <div
      v-if="showExpiredMessage"
      class="mb-4 p-4 bg-orange-50 border border-orange-200 rounded"
    >
      <div class="flex items-center gap-2 text-orange-700">
        <ExclamationCircleIcon class="h-5 w-5" />
        <span class="text-sm font-medium">{{ t('auth.expiredMessage') }}</span>
      </div>
    </div>

    <!-- Error Message -->
    <div
      v-if="error"
      class="mb-4 p-4 bg-red-50 border border-red-200 rounded"
    >
      <div class="flex items-center gap-2 text-red-600">
        <ExclamationCircleIcon class="h-5 w-5" />
        <span class="text-sm font-medium">{{ error }}</span>
      </div>
    </div>

    <!-- Login Form -->
    <form
      class="space-y-3"
      @submit.prevent="handleSubmit"
    >
      <!-- Email / Phone Field -->
      <div>
        <label
          for="identifier"
          class="block text-sm font-normal text-slate-700 mb-1"
        >
          {{ t('auth.identifier') }}
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <PhoneIcon
              v-if="isPhone"
              class="h-5 w-5 text-primary-500"
            />
            <EnvelopeIcon
              v-else
              :class="[
                'h-5 w-5',
                identifier && !identifierError ? 'text-primary-500' : 'text-slate-400'
              ]"
            />
          </div>
          <input
            id="identifier"
            v-model="identifier"
            type="text"
            autocomplete="username"
            required
            autofocus
            :placeholder="t('auth.identifierPlaceholder')"
            class="form-input !pl-11"
            :class="[
              identifier && identifierError ? '!border-red-500' : '',
              identifier && !identifierError ? '!border-primary-300' : ''
            ]"
          >
        </div>
        <p
          v-if="identifierError"
          class="mt-1 text-xs text-red-500"
        >
          {{ identifierError }}
        </p>
      </div>

      <!-- Password Field -->
      <div>
        <label
          for="password"
          class="block text-sm font-normal text-slate-700 mb-1"
        >
          {{ t('auth.password') }}
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <LockClosedIcon class="h-5 w-5 text-slate-400" />
          </div>
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            required
            :placeholder="t('auth.passwordPlaceholder')"
            class="form-input !pl-11 !pr-11"
          >
          <button
            type="button"
            class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
            @click="showPassword = !showPassword"
          >
            <EyeSlashIcon
              v-if="showPassword"
              class="h-5 w-5"
            />
            <EyeIcon
              v-else
              class="h-5 w-5"
            />
          </button>
        </div>
      </div>

      <!-- Remember Me & Forgot Password -->
      <div class="flex items-center justify-between">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            v-model="rememberMe"
            type="checkbox"
            class="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          >
          <span class="text-sm text-slate-600">{{ t('auth.rememberMe') }}</span>
        </label>
        <NuxtLink
          to="/auth/forgot-password"
          class="text-sm text-primary-600 hover:underline"
        >
          {{ t('auth.forgotPassword') }}
        </NuxtLink>
      </div>

      <!-- Submit Button -->
      <BaseButton
        type="submit"
        variant="primary"
        size="lg"
        :loading="loading"
        :disabled="!isFormValid"
        class="w-full !py-2 mt-2"
      >
        {{ t('auth.loginButton') }}
      </BaseButton>
    </form>

    <!-- Divider -->
    <AuthDivider />

    <!-- Google Auth -->
    <AuthGoogleAuthButton @auth="handleGoogleAuth" />

    <!-- Register Link -->
    <p class="mt-6 text-center text-sm text-slate-600">
      {{ t('auth.noAccount') }}
      <NuxtLink
        to="/auth/register"
        class="text-primary-600 hover:text-primary-700 font-medium"
      >
        {{ t('auth.createAccount') }}
      </NuxtLink>
    </p>
  </div>
</template>
