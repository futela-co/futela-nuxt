<script setup lang="ts">
interface Props {
  modelValue?: boolean
  title?: string
  position?: 'left' | 'right'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closable?: boolean
  overlay?: boolean
  overlayClose?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  title: '',
  position: 'right',
  size: 'md',
  closable: true,
  overlay: true,
  overlayClose: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
  open: []
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isShaking = ref(false)

const sizeClasses = computed(() => {
  const sizes: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full'
  }
  return sizes[props.size]
})

const positionClasses = computed(() => {
  if (props.position === 'left') {
    return {
      container: 'left-0',
      enter: '-translate-x-full',
      leave: '-translate-x-full'
    }
  }
  return {
    container: 'right-0',
    enter: 'translate-x-full',
    leave: 'translate-x-full'
  }
})

function close() {
  isOpen.value = false
  emit('close')
}

function onOverlayClick() {
  // Shake the drawer instead of closing
  isShaking.value = true
  setTimeout(() => {
    isShaking.value = false
  }, 500)
}

watch(isOpen, (value) => {
  if (value) {
    emit('open')
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div
        v-if="isOpen"
        :class="['fixed inset-0 z-[1050] flex', position === 'left' ? 'drawer-left' : 'drawer-right']"
      >
        <!-- Overlay -->
        <div
          v-if="overlay"
          class="absolute inset-0 bg-black/30 transition-opacity"
          @click="onOverlayClick"
        />

        <!-- Drawer Panel -->
        <div
          :class="[
            'fixed inset-y-0 w-full bg-white shadow-xl z-10 flex flex-col transition-transform duration-300',
            sizeClasses,
            positionClasses.container,
            { 'animate-shake': isShaking }
          ]"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              <slot name="title">
                {{ title }}
              </slot>
            </h3>
            <button
              v-if="closable"
              type="button"
              class="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              @click="close"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto p-4">
            <slot />
          </div>

          <!-- Footer -->
          <div
            v-if="$slots.footer"
            class="px-4 py-3 border-t border-gray-200 bg-gray-50"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
