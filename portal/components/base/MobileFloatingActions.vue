<script setup lang="ts">
/**
 * MobileFloatingActions.vue
 * Boutons flottants pour mobile - affiche des actions contextuelles
 * Utilisé dans les pages de détail pour accéder rapidement aux actions principales
 */
import {
  XMarkIcon,
  EllipsisVerticalIcon,
} from '@heroicons/vue/24/outline'

export interface FloatingAction {
  id: string
  label: string
  icon: any
  onClick: () => void
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  disabled?: boolean
}

interface Props {
  /** List of actions to display */
  actions: FloatingAction[]
  /** Position of the floating button */
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
}

const props = withDefaults(defineProps<Props>(), {
  position: 'bottom-right',
})

const isOpen = ref(false)

const positionClasses = computed(() => {
  switch (props.position) {
    case 'bottom-left':
      return 'bottom-4 left-4'
    case 'bottom-center':
      return 'bottom-4 left-1/2 -translate-x-1/2'
    case 'bottom-right':
    default:
      return 'bottom-4 right-4'
  }
})

const variantClasses: Record<string, string> = {
  primary: 'btn btn-primary',
  success: 'btn btn-success',
  warning: 'btn btn-warning',
  danger: 'btn btn-danger',
  info: 'btn btn-info',
}

function getVariantClass(variant?: string): string {
  return variantClasses[variant ?? 'primary'] ?? variantClasses['primary']!
}

function handleAction(action: FloatingAction) {
  if (action.disabled) return
  action.onClick()
  isOpen.value = false
}

function toggleMenu() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <!-- Only visible on mobile -->
  <div
    class="fixed z-50 sm:hidden"
    :class="positionClasses"
  >
    <!-- Backdrop when open -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/20"
        @click="isOpen = false"
      />
    </Transition>

    <!-- Action buttons (expanded) -->
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 translate-y-4 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-150"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-4 scale-95"
    >
      <div
        v-if="isOpen"
        class="fixed bottom-20 left-4 right-4 flex flex-col gap-2 items-stretch mb-2"
      >
        <button
          v-for="action in actions"
          :key="action.id"
          type="button"
          :disabled="action.disabled"
          class="flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium shadow-lg rounded-lg"
          :class="[
            getVariantClass(action.variant),
            action.disabled ? 'opacity-50 cursor-not-allowed' : ''
          ]"
          @click="handleAction(action)"
        >
          <component
            :is="action.icon"
            class="h-4 w-4 flex-shrink-0"
          />
          <span>{{ action.label }}</span>
        </button>
      </div>
    </Transition>

    <!-- Main toggle button -->
    <button
      type="button"
      class="flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all"
      :class="isOpen ? 'bg-gray-700 text-white rotate-90' : 'bg-primary-600 text-white hover:bg-primary-700'"
      @click="toggleMenu"
    >
      <XMarkIcon
        v-if="isOpen"
        class="h-6 w-6"
      />
      <EllipsisVerticalIcon
        v-else
        class="h-6 w-6"
      />
    </button>
  </div>
</template>
