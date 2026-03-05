<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'gray' | 'orange' | 'purple'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  rounded?: boolean
  dot?: boolean
  iconOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  rounded: false,
  dot: false,
  iconOnly: false,
})

const slots = useSlots()

const variantClasses: Record<string, string> = {
  primary: 'bg-primary-100 text-primary-800 ring-primary-600/20',
  secondary: 'bg-gray-100 text-gray-800 ring-gray-600/20',
  success: 'bg-green-100 text-green-800 ring-green-600/20',
  danger: 'bg-red-100 text-red-800 ring-red-600/20',
  warning: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
  info: 'bg-blue-100 text-blue-800 ring-blue-600/20',
  gray: 'bg-gray-100 text-gray-800 ring-gray-500/20',
  orange: 'bg-orange-100 text-orange-800 ring-orange-600/20',
  purple: 'bg-purple-100 text-purple-800 ring-purple-600/20',
}

const dotColorClasses: Record<string, string> = {
  primary: 'bg-primary-500',
  secondary: 'bg-gray-500',
  success: 'bg-green-500',
  danger: 'bg-red-500',
  warning: 'bg-yellow-500',
  info: 'bg-blue-500',
  gray: 'bg-gray-400',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
}

const sizeClasses: Record<string, string> = {
  xs: 'px-1.5 py-0.5 text-xs',
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-sm',
}

const iconOnlySizeClasses: Record<string, string> = {
  xs: 'w-5 h-5',
  sm: 'w-6 h-6',
  md: 'w-7 h-7',
  lg: 'w-8 h-8',
}

const iconSizeClasses: Record<string, string> = {
  xs: 'w-3 h-3',
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
}

const dotSizeClasses: Record<string, string> = {
  xs: 'w-1 h-1',
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
}

const badgeClasses = computed(() => {
  if (props.iconOnly) {
    return [
      'inline-flex items-center justify-center rounded-full ring-1 ring-inset',
      variantClasses[props.variant],
      iconOnlySizeClasses[props.size],
    ]
  }
  return [
    'inline-flex items-center gap-1 ring-1 ring-inset font-medium',
    variantClasses[props.variant],
    sizeClasses[props.size],
    props.rounded ? 'rounded-full' : 'rounded-md',
  ]
})

const hasIcon = computed(() => !!slots.icon)
</script>

<template>
  <!-- Icon only mode -->
  <span
    v-if="iconOnly"
    :class="badgeClasses"
  >
    <slot
      name="icon"
      :icon-class="iconSizeClasses[size]"
    />
  </span>

  <!-- Full badge with optional icon -->
  <span
    v-else
    :class="badgeClasses"
  >
    <span
      v-if="dot"
      class="flex-shrink-0 rounded-full"
      :class="[dotColorClasses[variant], dotSizeClasses[size]]"
      aria-hidden="true"
    />
    <slot
      v-else-if="hasIcon"
      name="icon"
      :icon-class="iconSizeClasses[size]"
    />
    <slot />
  </span>
</template>
