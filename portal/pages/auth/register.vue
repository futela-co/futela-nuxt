<script setup lang="ts">
import {
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
  UserPlusIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'auth',
  guest: true,
})

const authStore = useAuthStore()
const { t } = useLocale()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const role = ref<'tenant' | 'landlord'>('tenant')

const loading = ref(false)
const error = ref<string | null>(null)
const showPassword = ref(false)
const showPasswordConfirmation = ref(false)

// Validation
const emailError = computed(() => {
  if (!email.value) return null
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    return t('auth.emailError')
  }
  return null
})

const passwordError = computed(() => {
  if (!password.value) return null
  if (password.value.length < 8) {
    return t('auth.passwordTooShort')
  }
  return null
})

const passwordsMatch = computed(() => {
  return password.value === passwordConfirmation.value
})

const isFormValid = computed(() => {
  return firstName.value.length >= 2 &&
    lastName.value.length >= 2 &&
    email.value &&
    !emailError.value &&
    password.value.length >= 8 &&
    passwordConfirmation.value.length >= 8 &&
    passwordsMatch.value
})

async function handleSubmit() {
  if (!isFormValid.value) return

  error.value = null
  loading.value = true

  try {
    const result = await authStore.register({
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      email: email.value.trim(),
      password: password.value,
      phone: phone.value || undefined,
    })

    if (result.success) {
      await navigateTo('/auth/verification')
    } else {
      error.value = result.message || t('auth.registerError')
    }
  } catch (err: any) {
    error.value = err?.message || t('auth.genericError')
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
      await navigateTo('/dashboard')
    } else {
      error.value = result.message || t('auth.registerGoogleError')
    }
  } catch (err: any) {
    error.value = err?.message || t('auth.registerGoogleError')
  } finally {
    loading.value = false
  }
}

function selectRole(selectedRole: 'tenant' | 'landlord') {
  role.value = selectedRole
}
</script>

<template>
  <div>
    <!-- Icon -->
    <div class="auth-icon-container">
      <UserPlusIcon class="auth-icon" />
    </div>

    <!-- Title -->
    <h1 class="auth-title">
      {{ t('auth.registerTitle') }}
    </h1>
    <p class="auth-subtitle">
      {{ t('auth.registerSubtitle') }}
    </p>

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

    <!-- Register Form -->
    <form
      class="space-y-3"
      @submit.prevent="handleSubmit"
    >
      <!-- First Name / Last Name -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label
            for="firstName"
            class="block text-sm font-normal text-slate-700 mb-1"
          >
            {{ t('auth.firstName') }} <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
              <UserIcon class="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="firstName"
              v-model="firstName"
              type="text"
              autocomplete="given-name"
              required
              autofocus
              :placeholder="t('auth.firstName')"
              class="form-input !pl-11"
            >
          </div>
        </div>

        <div>
          <label
            for="lastName"
            class="block text-sm font-normal text-slate-700 mb-1"
          >
            {{ t('auth.lastName') }} <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
              <UserIcon class="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="lastName"
              v-model="lastName"
              type="text"
              autocomplete="family-name"
              required
              :placeholder="t('auth.lastName')"
              class="form-input !pl-11"
            >
          </div>
        </div>
      </div>

      <!-- Email -->
      <div>
        <label
          for="email"
          class="block text-sm font-normal text-slate-700 mb-1"
        >
          {{ t('auth.email') }} <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <EnvelopeIcon
              :class="[
                'h-5 w-5',
                email.length > 0 && !emailError ? 'text-primary-500' : 'text-slate-400'
              ]"
            />
          </div>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            :placeholder="t('auth.emailPlaceholder')"
            class="form-input !pl-11"
            :class="[
              email.length > 0 && emailError ? '!border-red-500' : '',
              email.length > 0 && !emailError ? '!border-primary-300' : ''
            ]"
          >
        </div>
        <p
          v-if="emailError"
          class="mt-1 text-xs text-red-500"
        >
          {{ emailError }}
        </p>
      </div>

      <!-- Phone -->
      <div>
        <label
          for="phone"
          class="block text-sm font-normal text-slate-700 mb-1"
        >
          {{ t('auth.phone') }}
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <PhoneIcon class="h-5 w-5 text-slate-400" />
          </div>
          <input
            id="phone"
            v-model="phone"
            type="tel"
            autocomplete="tel"
            :placeholder="t('auth.phonePlaceholder')"
            class="form-input !pl-11"
          >
        </div>
      </div>

      <!-- Password -->
      <div>
        <label
          for="password"
          class="block text-sm font-normal text-slate-700 mb-1"
        >
          {{ t('auth.password') }} <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <LockClosedIcon class="h-5 w-5 text-slate-400" />
          </div>
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            required
            :placeholder="t('auth.passwordMinChars')"
            class="form-input !pl-11 !pr-11"
            :class="[
              passwordError ? '!border-red-500' : ''
            ]"
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
        <p
          v-if="passwordError"
          class="mt-1 text-xs text-red-500"
        >
          {{ passwordError }}
        </p>
        <p
          v-else-if="!password"
          class="mt-1 text-xs text-slate-500"
        >
          {{ t('auth.passwordMinChars') }}
        </p>
      </div>

      <!-- Password Confirmation -->
      <div>
        <label
          for="passwordConfirmation"
          class="block text-sm font-normal text-slate-700 mb-1"
        >
          {{ t('auth.confirmPassword') }} <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <LockClosedIcon class="h-5 w-5 text-primary-500" />
          </div>
          <input
            id="passwordConfirmation"
            v-model="passwordConfirmation"
            :type="showPasswordConfirmation ? 'text' : 'password'"
            autocomplete="new-password"
            required
            :placeholder="t('auth.confirmPasswordPlaceholder')"
            class="form-input !pl-11 !pr-11"
            :class="[
              passwordConfirmation && !passwordsMatch ? '!border-red-500' : '',
              passwordConfirmation && passwordsMatch ? '!border-green-500' : ''
            ]"
          >
          <button
            type="button"
            class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
            @click="showPasswordConfirmation = !showPasswordConfirmation"
          >
            <EyeSlashIcon
              v-if="showPasswordConfirmation"
              class="h-5 w-5"
            />
            <EyeIcon
              v-else
              class="h-5 w-5"
            />
          </button>
        </div>
        <p
          v-if="passwordConfirmation && !passwordsMatch"
          class="mt-1 text-xs text-red-500"
        >
          {{ t('auth.passwordMismatch') }}
        </p>
        <p
          v-else-if="passwordConfirmation && passwordsMatch"
          class="mt-1 text-xs text-green-600"
        >
          {{ t('auth.passwordsMatch') }}
        </p>
      </div>

      <!-- Role Selector -->
      <div class="pt-1">
        <p class="text-sm font-normal text-slate-700 mb-2">
          {{ t('auth.youAre') }}
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            class="p-3 rounded-lg border-2 text-left transition-all"
            :class="role === 'tenant'
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 bg-white hover:border-gray-400'"
            @click="selectRole('tenant')"
          >
            <div class="flex items-center gap-2">
              <div
                class="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                :class="role === 'tenant' ? 'border-primary-500' : 'border-gray-400'"
              >
                <div
                  v-if="role === 'tenant'"
                  class="w-2 h-2 rounded-full bg-primary-500"
                />
              </div>
              <span class="text-sm font-medium text-gray-900">{{ t('auth.tenant') }}</span>
            </div>
            <p class="text-xs text-gray-500 mt-1 ml-6">
              {{ t('auth.tenantDesc') }}
            </p>
          </button>

          <button
            type="button"
            class="p-3 rounded-lg border-2 text-left transition-all"
            :class="role === 'landlord'
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 bg-white hover:border-gray-400'"
            @click="selectRole('landlord')"
          >
            <div class="flex items-center gap-2">
              <div
                class="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                :class="role === 'landlord' ? 'border-primary-500' : 'border-gray-400'"
              >
                <div
                  v-if="role === 'landlord'"
                  class="w-2 h-2 rounded-full bg-primary-500"
                />
              </div>
              <span class="text-sm font-medium text-gray-900">{{ t('auth.landlord') }}</span>
            </div>
            <p class="text-xs text-gray-500 mt-1 ml-6">
              {{ t('auth.landlordDesc') }}
            </p>
          </button>
        </div>
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
        {{ t('auth.registerButton') }}
      </BaseButton>
    </form>

    <!-- Divider -->
    <AuthDivider />

    <!-- Google Auth -->
    <AuthGoogleAuthButton @auth="handleGoogleAuth" />

    <!-- Login Link -->
    <p class="mt-6 text-center text-sm text-slate-600">
      {{ t('auth.hasAccount') }}
      <NuxtLink
        to="/auth/login"
        class="text-primary-600 hover:text-primary-700 font-medium"
      >
        {{ t('auth.loginButton') }}
      </NuxtLink>
    </p>
  </div>
</template>
