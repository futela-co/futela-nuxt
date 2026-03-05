<script setup lang="ts">
interface Props {
  color?: 'white' | 'primary' | 'gray'
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  color: 'white',
  size: 'md',
})

const colorClasses: Record<string, string> = {
  white: 'bg-white',
  primary: 'bg-primary-600',
  gray: 'bg-gray-400',
}

const sizeClasses: Record<string, string> = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-3 h-3',
}
</script>

<template>
  <span class="inline-flex gap-1">
    <span :class="[sizeClasses[size], colorClasses[color], 'rounded-full animate-bounce [animation-delay:-0.3s]']" />
    <span :class="[sizeClasses[size], colorClasses[color], 'rounded-full animate-bounce [animation-delay:-0.15s]']" />
    <span :class="[sizeClasses[size], colorClasses[color], 'rounded-full animate-bounce']" />
  </span>
</template>
