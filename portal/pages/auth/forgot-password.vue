<script setup lang="ts">
import {
  KeyIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon,
  EnvelopeIcon,
  CheckCircleIcon,
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'auth',
  guest: true,
})

const auth = useAuth()
const { t } = useLocale()

const email = ref('')
const error = ref('')
const isSubmitting = ref(false)
const emailSent = ref(false)
const sentEmail = ref('')

// Validation
const emailError = computed(() => {
  if (!email.value) return null
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    return t('auth.emailError')
  }
  return null
})

const isEmailValid = computed(() => {
  if (!email.value) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.value)
})

const canSubmit = computed(() => {
  return isEmailValid.value && !isSubmitting.value
})

async function handleSubmit() {
  if (!canSubmit.value) return

  error.value = ''
  isSubmitting.value = true

  try {
    const result = await auth.forgotPassword({ email: email.value.trim() })

    if (result.success) {
      sentEmail.value = email.value.trim()
      emailSent.value = true
    } else {
      error.value = result.message || t('auth.noAccountFound')
    }
  } catch (err: any) {
    error.value = err?.message || t('auth.genericError')
  } finally {
    isSubmitting.value = false
  }
}

function goToVerification() {
  navigateTo({
    path: '/auth/verification',
    query: { type: 'password_reset', email: sentEmail.value },
  })
}

async function resendCode() {
  try {
    await auth.forgotPassword({ email: sentEmail.value })
  } catch {
    // silently fail
  }
}
</script>

<template>
  <div>
    <!-- Success State -->
    <template v-if="emailSent">
      <!-- Icon -->
      <div class="auth-icon-container-success">
        <CheckCircleIcon class="auth-icon-success" />
      </div>

      <h1 class="auth-title">
        {{ t('auth.codeSent') }}
      </h1>
      <p class="auth-subtitle !mb-2">
        {{ t('auth.codeSentDesc') }}
      </p>
      <p class="text-primary-600 font-medium text-center mb-6">
        {{ sentEmail }}
      </p>

      <p class="text-sm text-slate-500 text-center mb-6">
        {{ t('auth.checkInbox') }}
      </p>

      <div class="space-y-3">
        <BaseButton
          variant="primary"
          size="lg"
          class="w-full !py-2"
          @click="goToVerification"
        >
          {{ t('auth.continueVerification') }}
        </BaseButton>

        <p class="text-center text-sm text-slate-500">
          {{ t('auth.noEmail') }}
          <button
            type="button"
            class="text-primary-600 hover:text-primary-700 font-medium"
            @click="resendCode"
          >
            {{ t('auth.resend') }}
          </button>
        </p>
      </div>

      <!-- Back link -->
      <div class="mt-6 text-center">
        <NuxtLink
          to="/auth/login"
          class="auth-back-link"
        >
          <ArrowLeftIcon class="h-4 w-4" />
          {{ t('auth.backToLogin') }}
        </NuxtLink>
      </div>
    </template>

    <!-- Form State -->
    <template v-else>
      <!-- Icon -->
      <div class="auth-icon-container">
        <KeyIcon class="auth-icon" />
      </div>

      <!-- Title -->
      <h1 class="auth-title">
        {{ t('auth.forgotTitle') }}
      </h1>
      <p class="auth-subtitle">
        {{ t('auth.forgotSubtitle') }}
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
        <!-- Email Field -->
        <div>
          <label
            for="email"
            class="block text-sm font-normal text-slate-700 mb-1"
          >
            {{ t('auth.email') }}
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
              autofocus
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

        <!-- Submit Button -->
        <BaseButton
          type="submit"
          variant="primary"
          size="lg"
          :loading="isSubmitting"
          :disabled="!canSubmit"
          class="w-full !py-2 mt-2"
        >
          {{ t('auth.sendCode') }}
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
    </template>
  </div>
</template>
