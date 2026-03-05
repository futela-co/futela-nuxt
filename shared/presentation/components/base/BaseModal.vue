<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  persistent?: boolean
  hideCloseButton?: boolean
  titleClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  persistent: false,
  hideCloseButton: false,
  titleClass: 'text-lg font-semibold text-gray-900',
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
  full: 'max-w-4xl',
}

const { t } = useLocale()
const modalRef = ref<HTMLElement | null>(null)

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function handleBackdropClick(event: MouseEvent) {
  if (!props.persistent && event.target === event.currentTarget) {
    close()
  }
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
      modalRef.value?.focus()
    })
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[10002] flex items-center justify-center p-4"
        @click="handleBackdropClick"
      >
        <div
          class="fixed inset-0 bg-black/30"
          aria-hidden="true"
        />

        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div
            v-if="modelValue"
            ref="modalRef"
            class="relative w-full bg-white rounded-xl shadow-xl"
            :class="sizeClasses[size]"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="title ? 'modal-title' : undefined"
            tabindex="-1"
          >
            <div
              v-if="title || !hideCloseButton"
              class="flex items-center justify-between px-6 py-4 border-b border-gray-200"
            >
              <h2
                v-if="title"
                id="modal-title"
                :class="titleClass"
              >
                {{ title }}
              </h2>
              <div v-else />
              <button
                v-if="!hideCloseButton"
                type="button"
                class="p-2 -m-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                :aria-label="t('ui.close')"
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

            <div class="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              <slot />
            </div>

            <div
              v-if="$slots.footer"
              class="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl"
            >
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
