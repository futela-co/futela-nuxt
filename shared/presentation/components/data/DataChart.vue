<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
  height?: number
  loading?: boolean
  error?: string
  variant?: 'default' | 'bordered' | 'flat'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  showHeader?: boolean
  showToolbar?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  height: 300,
  loading: false,
  error: '',
  variant: 'default',
  padding: 'md',
  showHeader: true,
  showToolbar: false,
})

const emit = defineEmits<{
  refresh: []
  download: []
  fullscreen: []
}>()

const isFullscreen = ref(false)
const containerRef = ref<HTMLElement>()

const containerClasses = computed(() => {
  const variantClasses: Record<string, string> = {
    default: 'bg-white border border-gray-200 rounded',
    bordered: 'bg-white border-2 border-gray-300 rounded',
    flat: 'bg-gray-50 rounded',
  }
  return variantClasses[props.variant]
})

const paddingClasses = computed(() => {
  const paddingMap: Record<string, string> = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }
  return paddingMap[props.padding]
})

const chartContainerStyle = computed(() => ({
  height: isFullscreen.value ? 'calc(100vh - 120px)' : `${props.height}px`,
}))

function handleRefresh() {
  emit('refresh')
}

function handleDownload() {
  emit('download')
}

function toggleFullscreen() {
  if (!containerRef.value) return

  if (!isFullscreen.value) {
    if (containerRef.value.requestFullscreen) {
      containerRef.value.requestFullscreen()
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }
}

function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement
  emit('fullscreen')
}

onMounted(() => {
  document.addEventListener('fullscreenchange', onFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange)
})

defineExpose({
  isFullscreen,
  toggleFullscreen,
})
</script>

<template>
  <div
    ref="containerRef"
    :class="[containerClasses, paddingClasses, { 'fixed inset-0 z-50 p-6': isFullscreen }]"
  >
    <!-- Header -->
    <div
      v-if="showHeader && (title || subtitle || showToolbar || $slots.header)"
      class="flex items-start justify-between mb-4"
    >
      <div>
        <slot name="header">
          <h3
            v-if="title"
            class="text-base font-semibold text-gray-900"
          >
            {{ title }}
          </h3>
          <p
            v-if="subtitle"
            class="text-sm text-gray-900 mt-0.5"
          >
            {{ subtitle }}
          </p>
        </slot>
      </div>

      <!-- Toolbar -->
      <div
        v-if="showToolbar || $slots.toolbar"
        class="flex items-center gap-2"
      >
        <slot name="toolbar">
          <!-- Refresh Button -->
          <button
            type="button"
            class="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            title="Actualiser"
            @click="handleRefresh"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </button>

          <!-- Download Button -->
          <button
            type="button"
            class="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            title="Telecharger"
            @click="handleDownload"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
          </button>

          <!-- Fullscreen Button -->
          <button
            type="button"
            class="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            :title="isFullscreen ? 'Quitter plein ecran' : 'Plein ecran'"
            @click="toggleFullscreen"
          >
            <svg
              v-if="!isFullscreen"
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
              />
            </svg>
            <svg
              v-else
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
              />
            </svg>
          </button>
        </slot>
      </div>
    </div>

    <!-- Chart Container -->
    <div
      :style="chartContainerStyle"
      class="relative"
    >
      <!-- Loading State -->
      <div
        v-if="loading"
        class="absolute inset-0 flex items-center justify-center bg-white/80 z-10"
      >
        <div class="flex flex-col items-center">
          <div class="flex items-center justify-center gap-1.5 mb-2">
            <span class="w-2.5 h-2.5 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span class="w-2.5 h-2.5 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span class="w-2.5 h-2.5 bg-primary-500 rounded-full animate-bounce" />
          </div>
          <span class="text-sm text-gray-900">Chargement...</span>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="absolute inset-0 flex items-center justify-center"
      >
        <div class="flex flex-col items-center text-center px-4">
          <div class="w-12 h-12 rounded-full bg-danger-100 flex items-center justify-center mb-3">
            <svg
              class="w-6 h-6 text-danger-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <p class="text-sm text-gray-900 font-medium mb-1">
            Erreur de chargement
          </p>
          <p class="text-xs text-gray-900 mb-3">
            {{ error }}
          </p>
          <button
            type="button"
            class="btn btn-sm btn-outline-primary"
            @click="handleRefresh"
          >
            Reessayer
          </button>
        </div>
      </div>

      <!-- Chart Content -->
      <div
        v-else
        class="h-full"
      >
        <slot />
      </div>
    </div>

    <!-- Footer -->
    <div
      v-if="$slots.footer"
      class="mt-4 pt-4 border-t border-gray-100"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
