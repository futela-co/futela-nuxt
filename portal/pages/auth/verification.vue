<script setup lang="ts">
import {
  ShieldCheckIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'auth',
  guest: true,
})

const route = useRoute()
const auth = useAuth()
const { t } = useLocale()

const verificationType = computed(() => (route.query.type as string) || 'email')
const emailParam = computed(() => route.query.email as string || '')

// 6-digit code inputs
const codeInputs = ref<string[]>(['', '', '', '', '', ''])
const inputRefs = ref<(HTMLInputElement | null)[]>([])
const error = ref('')
const isSubmitting = ref(false)
const isResending = ref(false)
const resendCooldown = ref(0)
const resendCount = ref(0)

let cooldownInterval: ReturnType<typeof setInterval> | null = null

const title = computed(() => {
  switch (verificationType.value) {
    case 'email': return t('auth.verifyEmail')
    case 'phone': return t('auth.verifyPhone')
    default: return t('auth.verificationCode')
  }
})

const maskedContact = computed(() => {
  if (emailParam.value) {
    const parts = emailParam.value.split('@')
    if (parts.length === 2) {
      const name = parts[0]!
      const domain = parts[1]!
      return `${name[0]}***@***.${domain.split('.').pop()}`
    }
  }
  return ''
})

// Computed full code
const fullCode = computed(() => codeInputs.value.join(''))
const isCodeComplete = computed(() => fullCode.value.length === 6 && codeInputs.value.every(c => /^\d$/.test(c)))

// Handle input on each code box
function handleInput(index: number, event: Event) {
  const target = event.target as HTMLInputElement
  let value = target.value

  // Remove all non-digit characters
  value = value.replace(/\D/g, '')

  if (value.length === 0) {
    target.value = ''
    codeInputs.value[index] = ''
    return
  }

  // Handle paste of multiple digits
  if (value.length > 1) {
    const digits = value.slice(0, 6 - index).split('')
    digits.forEach((digit, i) => {
      if (index + i < 6) {
        codeInputs.value[index + i] = digit
      }
    })
    target.value = digits[0] ?? ''
    const nextEmptyIndex = codeInputs.value.findIndex((c, i) => i >= index && c === '')
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex
    nextTick(() => {
      inputRefs.value[focusIndex]?.focus()
    })
    return
  }

  const digit = value.charAt(0)
  target.value = digit
  codeInputs.value[index] = digit

  // Auto-advance to next input
  if (digit && index < 5) {
    nextTick(() => {
      inputRefs.value[index + 1]?.focus()
    })
  }

  // Auto-submit when complete
  if (isCodeComplete.value) {
    handleSubmit()
  }
}

// Handle keypress to block non-numeric characters
function handleKeypress(event: KeyboardEvent) {
  const char = event.key
  if (!/^\d$/.test(char)) {
    event.preventDefault()
  }
}

// Handle keydown for navigation
function handleKeydown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace') {
    if (!codeInputs.value[index] && index > 0) {
      event.preventDefault()
      codeInputs.value[index - 1] = ''
      nextTick(() => {
        inputRefs.value[index - 1]?.focus()
      })
    } else {
      codeInputs.value[index] = ''
    }
  } else if (event.key === 'ArrowLeft' && index > 0) {
    event.preventDefault()
    inputRefs.value[index - 1]?.focus()
  } else if (event.key === 'ArrowRight' && index < 5) {
    event.preventDefault()
    inputRefs.value[index + 1]?.focus()
  } else if (event.key === 'Delete') {
    codeInputs.value[index] = ''
  }
}

// Handle paste anywhere
function handlePaste(event: ClipboardEvent) {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData('text') || ''
  const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('')

  digits.forEach((digit, i) => {
    codeInputs.value[i] = digit
  })

  const nextEmptyIndex = codeInputs.value.findIndex(c => c === '')
  const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex
  nextTick(() => {
    inputRefs.value[focusIndex]?.focus()
  })

  if (digits.length === 6) {
    nextTick(() => handleSubmit())
  }
}

// Focus on input click
function handleFocus(index: number) {
  inputRefs.value[index]?.select()
}

async function handleSubmit() {
  if (!isCodeComplete.value || isSubmitting.value) return

  error.value = ''
  isSubmitting.value = true

  try {
    let result

    if (verificationType.value === 'email') {
      result = await auth.verifyEmail(fullCode.value)
    } else if (verificationType.value === 'phone') {
      result = await auth.verifyPhone(fullCode.value)
    } else {
      // password_reset
      result = await auth.verifyEmail(fullCode.value)
    }

    if (result.success) {
      if (verificationType.value === 'password_reset') {
        await navigateTo({ path: '/auth/new-password', query: { email: emailParam.value } })
      } else if (verificationType.value === 'email') {
        await navigateTo('/auth/login')
      } else {
        await navigateTo('/dashboard')
      }
    } else {
      error.value = result.message || t('auth.codeInvalid')
      // Clear code on error
      codeInputs.value = ['', '', '', '', '', '']
      nextTick(() => {
        inputRefs.value[0]?.focus()
      })
    }
  } catch {
    error.value = t('auth.codeExpired')
    codeInputs.value = ['', '', '', '', '', '']
    nextTick(() => {
      inputRefs.value[0]?.focus()
    })
  } finally {
    isSubmitting.value = false
  }
}

async function resendCode() {
  if (isResending.value || resendCooldown.value > 0 || resendCount.value >= 5) return

  isResending.value = true
  error.value = ''

  try {
    await auth.sendEmailVerificationCode()
    resendCount.value++

    // Start cooldown
    resendCooldown.value = 60
    cooldownInterval = setInterval(() => {
      resendCooldown.value--
      if (resendCooldown.value <= 0) {
        if (cooldownInterval) clearInterval(cooldownInterval)
      }
    }, 1000)
  } catch {
    error.value = t('auth.resendError')
  } finally {
    isResending.value = false
  }
}

// Set ref for each input
function setInputRef(el: HTMLInputElement | null, index: number) {
  inputRefs.value[index] = el
}

onMounted(() => {
  // Focus first input
  nextTick(() => {
    inputRefs.value[0]?.focus()
  })
})

onUnmounted(() => {
  if (cooldownInterval) {
    clearInterval(cooldownInterval)
  }
})
</script>

<template>
  <div>
    <!-- Icon -->
    <div class="auth-icon-container">
      <ShieldCheckIcon class="auth-icon" />
    </div>

    <!-- Title -->
    <h1 class="auth-title">
      {{ title }}
    </h1>
    <p class="auth-subtitle !mb-2">
      {{ t('auth.verifySubtitle') }}
    </p>
    <p
      v-if="maskedContact"
      class="text-primary-600 font-medium text-center mb-4"
    >
      {{ maskedContact }}
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

    <!-- Code Input Form -->
    <form
      @submit.prevent
      @paste="handlePaste"
    >
      <!-- 6 Code Inputs -->
      <div class="flex justify-center gap-2 sm:gap-3 mb-4">
        <input
          v-for="(_, index) in 6"
          :key="index"
          :ref="(el) => setInputRef(el as HTMLInputElement, index)"
          v-model="codeInputs[index]"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength="6"
          autocomplete="one-time-code"
          :disabled="isSubmitting"
          :class="[
            'w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold rounded border-2 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            codeInputs[index]
              ? 'border-primary-400 bg-primary-50 text-primary-700'
              : 'border-slate-300 bg-white text-slate-900'
          ]"
          @input="handleInput(index, $event)"
          @keypress="handleKeypress"
          @keydown="handleKeydown(index, $event)"
          @focus="handleFocus(index)"
        >
      </div>

      <!-- Auto-validation indicator -->
      <div
        v-if="isSubmitting"
        class="flex items-center justify-center gap-2 py-3 text-primary-600"
      >
        <span class="inline-flex gap-1">
          <span class="w-2 h-2 bg-primary-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span class="w-2 h-2 bg-primary-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span class="w-2 h-2 bg-primary-600 rounded-full animate-bounce" />
        </span>
        <span class="font-medium">{{ t('auth.verifying') }}</span>
      </div>
      <p
        v-else
        class="text-center text-sm text-slate-500"
      >
        {{ t('auth.autoVerify') }}
      </p>
    </form>

    <!-- Resend Code -->
    <div class="mt-4 text-center">
      <p class="text-sm text-slate-500 mb-2">
        {{ t('auth.noCode') }}
      </p>
      <button
        :disabled="isResending || resendCooldown > 0 || resendCount >= 5"
        :class="[
          'text-sm font-medium transition-colors',
          isResending || resendCooldown > 0
            ? 'text-slate-400 cursor-not-allowed'
            : 'text-primary-600 hover:text-primary-700'
        ]"
        @click="resendCode"
      >
        <span
          v-if="isResending"
          class="flex items-center justify-center gap-1"
        >
          <span class="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span class="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span class="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce" />
        </span>
        <span v-else-if="resendCooldown > 0">
          {{ t('auth.resendIn', { seconds: resendCooldown }) }}
        </span>
        <span v-else>{{ t('auth.resendCode') }}</span>
      </button>
    </div>

    <!-- Help text -->
    <div class="mt-8 p-4 bg-slate-50 rounded">
      <div class="flex items-start gap-3">
        <DevicePhoneMobileIcon class="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
        <div class="text-sm text-slate-500">
          <p class="font-medium text-slate-700 mb-1">
            {{ t('auth.tip') }}
          </p>
          <p>{{ t('auth.checkSpam') }}</p>
        </div>
      </div>
    </div>

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
  </div>
</template>
