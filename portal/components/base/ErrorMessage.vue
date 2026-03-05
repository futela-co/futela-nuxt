<script setup lang="ts">
/**
 * ErrorMessage Component
 * Displays API error messages and exceptions in a consistent format
 * Used for displaying backend error responses (409 Conflict, validation errors, etc.)
 */
import { ExclamationTriangleIcon, XCircleIcon } from '@heroicons/vue/24/outline'

interface Props {
  /** The error message to display */
  message: string
  /** Error title (optional) */
  title?: string
  /** Error variant: 'danger' for critical errors, 'warning' for non-critical */
  variant?: 'danger' | 'warning'
  /** Size variant */
  size?: 'sm' | 'md'
  /** Show icon */
  showIcon?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  variant: 'danger',
  size: 'md',
  showIcon: true
})

const containerClasses = computed(() => {
  const base = 'rounded border'
  const sizeClass = props.size === 'sm' ? 'p-3' : 'p-4'
  const variantClass = props.variant === 'danger'
    ? 'bg-red-50 border-red-200'
    : 'bg-yellow-50 border-yellow-200'
  return `${base} ${sizeClass} ${variantClass}`
})

const iconClasses = computed(() => {
  const sizeClass = props.size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
  const colorClass = props.variant === 'danger' ? 'text-red-500' : 'text-yellow-500'
  return `${sizeClass} ${colorClass}`
})

const titleClasses = computed(() => {
  const sizeClass = props.size === 'sm' ? 'text-xs' : 'text-sm'
  const colorClass = props.variant === 'danger' ? 'text-red-800' : 'text-yellow-800'
  return `${sizeClass} font-semibold ${colorClass}`
})

const messageClasses = computed(() => {
  const sizeClass = props.size === 'sm' ? 'text-xs' : 'text-sm'
  const colorClass = props.variant === 'danger' ? 'text-red-700' : 'text-yellow-700'
  return `${sizeClass} ${colorClass}`
})

const IconComponent = computed(() => {
  return props.variant === 'danger' ? XCircleIcon : ExclamationTriangleIcon
})
</script>

<template>
  <div
    :class="containerClasses"
    role="alert"
  >
    <div class="flex items-start gap-3">
      <component
        :is="IconComponent"
        v-if="showIcon"
        :class="iconClasses"
        class="flex-shrink-0 mt-0.5"
      />
      <div class="flex-1 min-w-0">
        <p
          v-if="title"
          :class="titleClasses"
        >
          {{ title }}
        </p>
        <p :class="[messageClasses, title ? 'mt-1' : '']">
          {{ message }}
        </p>
      </div>
    </div>
  </div>
</template>
