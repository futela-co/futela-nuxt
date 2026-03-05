<script setup lang="ts">
import { HomeIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  error: {
    statusCode: number
    statusMessage?: string
    message?: string
  }
}>()

const errorMessages: Record<number, { title: string; description: string }> = {
  403: {
    title: 'Acces refuse',
    description: 'Vous n\'avez pas les droits necessaires pour acceder a cette page.',
  },
  404: {
    title: 'Page introuvable',
    description: 'La page que vous recherchez n\'existe pas ou a ete deplacee.',
  },
  500: {
    title: 'Erreur serveur',
    description: 'Une erreur inattendue est survenue. Veuillez reessayer plus tard.',
  },
}

const errorInfo = computed(() => {
  return errorMessages[props.error.statusCode] ?? {
    title: 'Erreur',
    description: props.error.message || 'Une erreur est survenue.',
  }
})

function handleGoHome() {
  clearError({ redirect: '/' })
}

function handleRetry() {
  clearError({ redirect: useRoute().fullPath })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="max-w-md w-full text-center">
      <div class="text-6xl font-bold text-gray-200 mb-4">
        {{ error.statusCode }}
      </div>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">
        {{ errorInfo.title }}
      </h1>
      <p class="text-gray-500 mb-8">
        {{ errorInfo.description }}
      </p>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          class="btn btn-primary btn-lg gap-2"
          @click="handleGoHome"
        >
          <HomeIcon class="w-5 h-5" />
          Retour a l'accueil
        </button>
        <button
          v-if="error.statusCode >= 500"
          class="btn btn-secondary btn-lg gap-2"
          @click="handleRetry"
        >
          <ArrowPathIcon class="w-5 h-5" />
          Reessayer
        </button>
      </div>
    </div>
  </div>
</template>
