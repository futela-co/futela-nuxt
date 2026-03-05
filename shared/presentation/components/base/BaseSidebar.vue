<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'
  persistent?: boolean
  hideCloseButton?: boolean
  hideHeader?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  persistent: false,
  hideCloseButton: false,
  hideHeader: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const sizeClasses: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
}

const sidebarRef = ref<HTMLElement | null>(null)
const isShaking = ref(false)

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function handleBackdropClick() {
  // Shake the sidebar instead of closing
  isShaking.value = true
  setTimeout(() => {
    isShaking.value = false
  }, 500)
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && !props.persistent) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden'
    nextTick(() => {
      sidebarRef.value?.focus()
    })
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[10000] bg-black/30"
        aria-hidden="true"
        @click="handleBackdropClick"
      />
    </Transition>

    <!-- Sidebar Panel -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="modelValue"
        ref="sidebarRef"
        class="fixed inset-y-0 right-0 z-[10001] flex flex-col w-full bg-white shadow-2xl"
        :class="[sizeClasses[size], { 'animate-shake': isShaking }]"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="title ? 'sidebar-title' : undefined"
        tabindex="-1"
      >
        <!-- Header -->
        <div
          v-if="!hideHeader && (title || $slots.header || !hideCloseButton)"
          class="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0"
        >
          <slot name="header">
            <h2
              v-if="title"
              id="sidebar-title"
              class="text-sm font-semibold text-gray-900"
            >
              {{ title }}
            </h2>
            <div v-else />
          </slot>
          <button
            v-if="!hideCloseButton"
            type="button"
            class="p-2 -m-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            aria-label="Fermer"
            @click="close"
          >
            <svg
              class="w-5 h-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 px-6 py-4 overflow-y-auto">
          <slot />
        </div>

        <!-- Footer -->
        <div
          v-if="$slots.footer"
          class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0"
        >
          <slot name="footer" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
