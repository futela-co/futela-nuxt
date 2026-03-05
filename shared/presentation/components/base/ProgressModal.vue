<script setup lang="ts">
import { CheckCircleIcon, XCircleIcon } from '@heroicons/vue/24/outline'

interface Props {
  modelValue: boolean
  status?: 'loading' | 'success' | 'error'
  title?: string
  message?: string
}

const props = withDefaults(defineProps<Props>(), {
  status: 'loading',
  title: '',
  message: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { t } = useLocale()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const statusConfig = computed(() => {
  switch (props.status) {
    case 'success':
      return {
        icon: CheckCircleIcon,
        iconClass: 'text-green-500',
        bgClass: 'bg-green-100',
        title: props.title || t('progress.success'),
        message: props.message || t('progress.redirecting')
      }
    case 'error':
      return {
        icon: XCircleIcon,
        iconClass: 'text-red-500',
        bgClass: 'bg-red-100',
        title: props.title || t('progress.error'),
        message: props.message || t('progress.errorOccurred')
      }
    default:
      return {
        icon: null,
        iconClass: '',
        bgClass: 'bg-primary-100',
        title: props.title || t('progress.processing'),
        message: props.message || t('progress.pleaseWait')
      }
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[9999] flex items-center justify-center"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/30" />

        <!-- Modal -->
        <div class="relative bg-white rounded-lg shadow-xl p-8 max-w-sm w-full mx-4 text-center">
          <!-- Loading spinner or status icon -->
          <div class="flex justify-center mb-4">
            <div
              v-if="status === 'loading'"
              class="relative"
            >
              <!-- Outer ring -->
              <div class="w-16 h-16 rounded-full border-4 border-gray-200" />
              <!-- Spinning ring -->
              <div class="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-primary-600 animate-spin" />
              <!-- Inner dot -->
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-3 h-3 bg-primary-600 rounded-full animate-pulse" />
              </div>
            </div>
            <div
              v-else
              :class="['w-16 h-16 rounded-full flex items-center justify-center', statusConfig.bgClass]"
            >
              <component
                :is="statusConfig.icon"
                :class="['w-10 h-10', statusConfig.iconClass]"
              />
            </div>
          </div>

          <!-- Title -->
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            {{ statusConfig.title }}
          </h3>

          <!-- Message -->
          <p class="text-sm text-gray-500">
            {{ statusConfig.message }}
          </p>

          <!-- Progress bar for loading state -->
          <div
            v-if="status === 'loading'"
            class="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden"
          >
            <div class="h-full bg-primary-600 rounded-full animate-progress" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
