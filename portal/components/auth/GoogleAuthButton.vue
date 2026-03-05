<script setup lang="ts">
const emit = defineEmits<{
  auth: [idToken: string]
}>()

const isLoading = ref(false)
const isReady = ref(false)
const googleBtnRef = ref<HTMLElement | null>(null)

const config = useRuntimeConfig()
const GOOGLE_CLIENT_ID = config.public.googleClientId as string

function handleCredentialResponse(response: { credential: string }) {
  isLoading.value = true
  emit('auth', response.credential)
  setTimeout(() => {
    isLoading.value = false
  }, 8000)
}

function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).google?.accounts?.id) {
      resolve()
      return
    }
    if (document.getElementById('google-gsi-script')) {
      const check = setInterval(() => {
        if ((window as any).google?.accounts?.id) {
          clearInterval(check)
          resolve()
        }
      }, 100)
      return
    }
    const script = document.createElement('script')
    script.id = 'google-gsi-script'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      const check = setInterval(() => {
        if ((window as any).google?.accounts?.id) {
          clearInterval(check)
          resolve()
        }
      }, 100)
    }
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'))
    document.head.appendChild(script)
  })
}

onMounted(async () => {
  if (!GOOGLE_CLIENT_ID) return

  try {
    await loadGoogleScript()
    const google = (window as any).google
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      auto_select: false,
    })
    // Render the real Google button inside the hidden container
    if (googleBtnRef.value) {
      google.accounts.id.renderButton(googleBtnRef.value, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        width: 500,
      })
    }
    isReady.value = true
  } catch {
    // Google Sign-In unavailable
  }
})
</script>

<template>
  <div class="relative w-full h-12">
    <!-- Our visible custom button (visual only) -->
    <div
      class="absolute inset-0 flex items-center justify-center gap-3 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium text-sm pointer-events-none"
      :class="{ 'opacity-70': isLoading || !isReady }"
    >
      <!-- Google G Logo -->
      <svg
        v-if="!isLoading"
        class="h-5 w-5"
        viewBox="0 0 24 24"
      >
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>

      <!-- Loading Spinner -->
      <div
        v-if="isLoading"
        class="h-5 w-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"
      />

      <span>{{ isLoading ? 'Redirection...' : 'Continuer avec Google' }}</span>
    </div>

    <!-- Google's real rendered button (invisible but clickable, on top) -->
    <div
      ref="googleBtnRef"
      class="absolute inset-0 overflow-hidden rounded-lg"
      :class="isLoading ? 'pointer-events-none' : ''"
      :style="{ opacity: '0.01' }"
    />
  </div>
</template>
