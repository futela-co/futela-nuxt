<script setup lang="ts">
/**
 * AdminPageHeader.vue
 * Page header component with title, subtitle, breadcrumbs, and action buttons
 */
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import { useUiStore } from '../../../application/stores/ui'
import type { Component } from 'vue'

interface BreadcrumbItem {
  label: string
  to?: string
}

interface ActionButton {
  label: string
  icon?: Component
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  to?: string
  onClick?: () => void
}

interface Props {
  /** Page title */
  title: string
  /** Page subtitle/description */
  subtitle?: string
  /** Show back button */
  showBack?: boolean
  /** Back button route (default: go back in history) */
  backTo?: string
  /** Back button label */
  backLabel?: string
  /** Custom breadcrumb items (overrides auto-generation) */
  breadcrumbs?: BreadcrumbItem[]
  /** Show breadcrumbs */
  showBreadcrumb?: boolean
  /** Action buttons */
  actions?: ActionButton[]
  /** Icon to display before title */
  icon?: Component
}

const props = withDefaults(defineProps<Props>(), {
  showBack: false,
  backLabel: 'Retour',
  showBreadcrumb: false,
})

const emit = defineEmits<{
  back: []
}>()

const router = useRouter()
const uiStore = useUiStore()

// Set page title in UI store
onMounted(() => {
  if (props.title) {
    uiStore.setPageTitle(props.title)
  }
})

// Handle back button click
function handleBack() {
  emit('back')

  if (props.backTo) {
    navigateTo(props.backTo)
  } else {
    router.back()
  }
}

// Get button classes based on variant
function getButtonClasses(action: ActionButton): string {
  const baseClasses = 'inline-flex items-center gap-2 font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'

  const sizeClasses: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  }

  const variantClasses: Record<string, string> = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 disabled:bg-primary-300',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-300',
    success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 disabled:bg-success-300',
    danger: 'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500 disabled:bg-danger-300',
    warning: 'bg-warning-500 text-gray-900 hover:bg-warning-600 focus:ring-warning-500 disabled:bg-warning-300',
    outline: 'border border-gray-300 text-gray-900 hover:bg-gray-50 focus:ring-gray-500 disabled:bg-gray-100 disabled:text-gray-400',
  }

  const size = action.size || 'md'
  const variant = action.variant || 'primary'

  return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`
}

// Handle action button click
function handleActionClick(action: ActionButton) {
  if (action.disabled || action.loading) return

  if (action.to) {
    navigateTo(action.to)
  } else if (action.onClick) {
    action.onClick()
  }
}
</script>

<template>
  <div class="mb-4">
    <!-- Header Content -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <!-- Left: Back button, Icon, Title, Subtitle -->
      <div class="flex items-start gap-4">
        <!-- Back Button -->
        <button
          v-if="showBack"
          type="button"
          class="flex items-center gap-1 text-gray-900 hover:text-gray-900 transition-colors mt-1"
          @click="handleBack"
        >
          <ArrowLeftIcon class="w-5 h-5" />
          <span class="text-sm hidden sm:inline">{{ backLabel }}</span>
        </button>

        <!-- Icon -->
        <div
          v-if="icon"
          class="flex-shrink-0 w-12 h-12 bg-primary-100 rounded flex items-center justify-center"
        >
          <component
            :is="icon"
            class="w-6 h-6 text-primary-600"
          />
        </div>

        <!-- Title and Subtitle -->
        <div>
          <h1 class="text-lg font-bold text-gray-900">
            {{ title }}
          </h1>
          <p
            v-if="subtitle"
            class="mt-1 text-xs text-gray-900"
          >
            {{ subtitle }}
          </p>

          <!-- Slot for additional content below title -->
          <slot name="subtitle" />
        </div>
      </div>

      <!-- Right: Actions -->
      <div
        v-if="actions && actions.length > 0"
        class="flex items-center gap-2 flex-wrap"
      >
        <template
          v-for="(action, index) in actions"
          :key="index"
        >
          <!-- Link action -->
          <NuxtLink
            v-if="action.to && !action.onClick"
            :to="action.to"
            :class="getButtonClasses(action)"
          >
            <component
              :is="action.icon"
              v-if="action.icon"
              class="w-4 h-4"
            />
            {{ action.label }}
          </NuxtLink>

          <!-- Button action -->
          <button
            v-else
            type="button"
            :class="getButtonClasses(action)"
            :disabled="action.disabled || action.loading"
            @click="handleActionClick(action)"
          >
            <!-- Loading spinner -->
            <span
              v-if="action.loading"
              class="inline-flex gap-0.5"
            >
              <span class="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span class="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span class="w-1.5 h-1.5 bg-current rounded-full animate-bounce" />
            </span>
            <component
              :is="action.icon"
              v-else-if="action.icon"
              class="w-4 h-4"
            />
            {{ action.label }}
          </button>
        </template>
      </div>

      <!-- Slot for custom actions -->
      <slot name="actions" />
    </div>

    <!-- Slot for tabs or additional navigation -->
    <slot name="tabs" />
  </div>
</template>
