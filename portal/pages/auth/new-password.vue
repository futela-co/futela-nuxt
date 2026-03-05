<script setup lang="ts">
import {
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'auth',
  guest: true,
})

const route = useRoute()
const auth = useAuth()
const { t } = useLocale()

const resetToken = computed(() => (route.query.token as string) || '')

const password = ref('')
const passwordConfirmation = ref('')
const showPassword = ref(false)
const showPasswordConfirmation = ref(false)

const error = ref('')
const success = ref(false)
const isSubmitting = ref(false)

// Password validation
const passwordErrors = computed(() => {
  const errors: string[] = []
  if (password.value.length > 0 && password.value.length < 8) {
    errors.push(t('auth.passwordTooShort'))
  }
  return errors
})

const passwordsMatch = computed(() => {
  return password.value === passwordConfirmation.value
})

const canSubmit = computed(() => {
  return password.value.length >= 8 &&
    passwordConfirmation.value.length >= 8 &&
    passwordsMatch.value &&
    passwordErrors.value.length === 0 &&
    resetToken.value &&
    !isSubmitting.value
})

async function handleSubmit() {
  if (!canSubmit.value) return

  error.value = ''
  isSubmitting.value = true

  try {
    const result = await auth.resetPassword({
      token: resetToken.value,
      password: password.value,
      passwordConfirmation: passwordConfirmation.value,
    })

    if (result.success) {
      success.value = true
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigateTo('/auth/login?reset=success')
      }, 2000)
    } else {
      error.value = result.message || t('auth.genericError')
    }
  } catch (err: any) {
    error.value = err?.message || t('auth.genericError')
  } finally {
    isSubmitting.value = false
  }
}

// Redirect if no token
onMounted(() => {
  if (!resetToken.value) {
    navigateTo('/auth/forgot-password')
  }
})
</script>

<template>
  <div>
    <!-- Success Message -->
    <div
      v-if="success"
      class="text-center"
    >
      <div class="auth-icon-container-success">
        <CheckCircleIcon class="auth-icon-success" />
      </div>
      <h1 class="auth-title">
        {{ t('auth.passwordChanged') }}
      </h1>
      <p class="auth-subtitle !mb-4">
        {{ t('auth.passwordChangedDesc') }}
        <br>
        <span class="text-sm">{{ t('auth.redirecting') }}</span>
      </p>
      <div class="flex items-center justify-center gap-1.5">
        <span class="w-2.5 h-2.5 bg-primary-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span class="w-2.5 h-2.5 bg-primary-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span class="w-2.5 h-2.5 bg-primary-600 rounded-full animate-bounce" />
      </div>
    </div>

    <!-- Form -->
    <div v-else>
      <!-- Icon -->
      <div class="auth-icon-container">
        <LockClosedIcon class="auth-icon" />
      </div>

      <!-- Title -->
      <h1 class="auth-title">
        {{ t('auth.newPasswordTitle') }}
      </h1>
      <p class="auth-subtitle">
        {{ t('auth.newPasswordSubtitle') }}
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

      <!-- Form -->
      <form
        class="space-y-5"
        @submit.prevent="handleSubmit"
      >
        <!-- Password Field -->
        <div>
          <label
            for="password"
            class="block text-sm font-normal text-slate-700 mb-1"
          >
            {{ t('auth.newPassword') }}
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
              <LockClosedIcon class="h-5 w-5 text-primary-500" />
            </div>
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              required
              :placeholder="t('auth.passwordMinChars')"
              :class="[
                'form-input !pl-11 !pr-11',
                passwordErrors.length > 0 ? '!border-red-500' : ''
              ]"
            >
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
            v-if="passwordErrors.length > 0"
            class="mt-1.5 text-xs text-red-500"
          >
            {{ passwordErrors[0] }}
          </p>
          <p
            v-else
            class="mt-1.5 text-sm text-slate-500"
          >
            {{ t('auth.passwordMinChars') }}
          </p>
        </div>

        <!-- Confirm Password Field -->
        <div>
          <label
            for="passwordConfirmation"
            class="block text-sm font-normal text-slate-700 mb-1"
          >
            {{ t('auth.confirmPassword') }}
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
              :class="[
                'form-input !pl-11 !pr-11',
                passwordConfirmation && !passwordsMatch ? '!border-red-500' : '',
                passwordConfirmation && passwordsMatch ? '!border-green-500' : ''
              ]"
            >
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
            class="mt-1.5 text-xs text-red-500"
          >
            {{ t('auth.passwordMismatch') }}
          </p>
          <p
            v-else-if="passwordConfirmation && passwordsMatch"
            class="mt-1.5 text-sm text-green-600"
          >
            {{ t('auth.passwordsMatch') }}
          </p>
        </div>

        <!-- Submit Button -->
        <BaseButton
          type="submit"
          variant="primary"
          size="lg"
          :loading="isSubmitting"
          :disabled="!canSubmit"
          class="w-full !py-2 mt-2"
        >
          {{ t('auth.resetButton') }}
        </BaseButton>

        <!-- Back link -->
        <div class="mt-4 text-center">
          <NuxtLink
            to="/auth/login"
            class="auth-back-link"
          >
            <ArrowLeftIcon class="h-4 w-4" />
            {{ t('auth.backToLogin') }}
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>
