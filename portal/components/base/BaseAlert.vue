<script setup lang="ts">
interface Props {
  type?: 'success' | 'warning' | 'danger' | 'info'
  dismissible?: boolean
  icon?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  dismissible: false,
  icon: true,
})

const emit = defineEmits<{
  dismiss: []
}>()

const isVisible = ref(true)

const typeClasses: Record<string, string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  danger: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

const iconColorClasses: Record<string, string> = {
  success: 'text-green-500',
  warning: 'text-yellow-500',
  danger: 'text-red-500',
  info: 'text-blue-500',
}

const dismissButtonClasses: Record<string, string> = {
  success: 'text-green-500 hover:bg-green-100 focus:ring-green-400',
  warning: 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-400',
  danger: 'text-red-500 hover:bg-red-100 focus:ring-red-400',
  info: 'text-blue-500 hover:bg-blue-100 focus:ring-blue-400',
}

function dismiss() {
  isVisible.value = false
  emit('dismiss')
}

const iconPaths: Record<string, string> = {
  success: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z',
  warning: 'M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z',
  danger: 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z',
  info: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z',
}
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-200 ease-out"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-150 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-2"
  >
    <div
      v-if="isVisible"
      class="rounded border p-4"
      :class="typeClasses[type]"
      role="alert"
    >
      <div class="flex">
        <div
          v-if="icon"
          class="flex-shrink-0"
        >
          <svg
            class="h-5 w-5"
            :class="iconColorClasses[type]"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              :d="iconPaths[type]"
              clip-rule="evenodd"
            />
          </svg>
        </div>

        <div
          class="flex-1"
          :class="icon ? 'ml-3' : ''"
        >
          <slot />
        </div>

        <div
          v-if="dismissible"
          class="ml-auto pl-3"
        >
          <button
            type="button"
            class="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
            :class="dismissButtonClasses[type]"
            @click="dismiss"
          >
            <span class="sr-only">Fermer</span>
            <svg
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
