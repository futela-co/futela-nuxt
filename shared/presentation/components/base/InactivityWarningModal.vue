<script setup lang="ts">
/**
 * InactivityWarningModal.vue
 * Modal displayed when user session is about to expire due to inactivity
 * Design matches RSSP project
 */
import { ClockIcon } from '@heroicons/vue/24/outline'

interface Props {
  modelValue: boolean
  remainingSeconds: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  extend: []
  logout: []
}>()

const isExtending = ref(false)

const formattedTime = computed(() => {
  const minutes = Math.floor(props.remainingSeconds / 60)
  const seconds = props.remainingSeconds % 60
  if (minutes > 0) {
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`
  }
  return `${seconds}s`
})

async function handleExtend() {
  if (isExtending.value) return

  isExtending.value = true
  try {
    emit('extend')
    // Small delay to allow token refresh to complete
    await new Promise(resolve => setTimeout(resolve, 500))
    emit('update:modelValue', false)
  } finally {
    isExtending.value = false
  }
}

function handleLogout() {
  emit('logout')
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[100] overflow-y-auto"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/30" />

        <!-- Modal -->
        <div class="flex min-h-full items-center justify-center p-4">
          <Transition
            enter-active-class="transition-all duration-300"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition-all duration-200"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="modelValue"
              class="relative bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 z-10"
            >
              <!-- Content -->
              <div class="text-center">
                <!-- Icon -->
                <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100 mb-4">
                  <ClockIcon class="h-7 w-7 text-yellow-600 animate-pulse" />
                </div>

                <!-- Title -->
                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                  Session sur le point d'expirer
                </h3>

                <!-- Description -->
                <p class="text-sm text-gray-600 mb-3">
                  Votre session va expirer dans
                </p>

                <!-- Countdown -->
                <p class="text-4xl font-bold text-gray-900 mb-4 font-mono">
                  {{ formattedTime }}
                </p>

                <!-- Info text -->
                <p class="text-sm text-gray-500 mb-4">
                  Cliquez sur "Continuer" pour rester connecté ou vous serez automatiquement déconnecté.
                </p>

                <!-- Progress bar -->
                <div class="w-full bg-gray-200 rounded-full h-1.5 mb-4 overflow-hidden">
                  <div
                    class="bg-yellow-500 h-1.5 rounded-full transition-all duration-1000 ease-linear"
                    :style="{ width: `${(remainingSeconds / 60) * 100}%` }"
                  />
                </div>

                <!-- Actions -->
                <div class="flex gap-3">
                  <button
                    type="button"
                    class="flex-1 btn btn-secondary btn-lg"
                    :disabled="isExtending"
                    @click="handleLogout"
                  >
                    Déconnexion
                  </button>
                  <button
                    type="button"
                    class="flex-1 btn btn-primary btn-lg gap-2"
                    :disabled="isExtending"
                    @click="handleExtend"
                  >
                    <span
                      v-if="isExtending"
                      class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                    />
                    {{ isExtending ? 'Renouvellement...' : 'Continuer' }}
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
