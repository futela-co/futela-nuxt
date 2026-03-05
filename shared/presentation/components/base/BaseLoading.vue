<script setup lang="ts">
interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'white' | 'gray'
  text?: string
  overlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'primary',
  overlay: false,
})

const sizeClasses: Record<string, string> = {
  xs: 'gap-1',
  sm: 'gap-1',
  md: 'gap-1.5',
  lg: 'gap-2',
  xl: 'gap-2.5',
}

const bubbleSizeClasses: Record<string, string> = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-4 h-4',
}

const textSizeClasses: Record<string, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
}

const colorClasses: Record<string, string> = {
  primary: 'bg-primary-600',
  secondary: 'bg-gray-600',
  white: 'bg-white',
  gray: 'bg-gray-400',
}

const textColorClasses: Record<string, string> = {
  primary: 'text-primary-600',
  secondary: 'text-gray-900',
  white: 'text-white',
  gray: 'text-gray-400',
}
</script>

<template>
  <div
    v-if="overlay"
    class="fixed inset-0 z-50 flex items-center justify-center bg-white/80"
  >
    <div class="flex flex-col items-center gap-3">
      <span :class="['inline-flex gap-1.5', sizeClasses[size]]">
        <span :class="[bubbleSizeClasses[size], colorClasses[color], 'rounded-full animate-bounce [animation-delay:-0.3s]']" />
        <span :class="[bubbleSizeClasses[size], colorClasses[color], 'rounded-full animate-bounce [animation-delay:-0.15s]']" />
        <span :class="[bubbleSizeClasses[size], colorClasses[color], 'rounded-full animate-bounce']" />
      </span>
      <span
        v-if="text"
        :class="[textSizeClasses[size], textColorClasses[color]]"
      >{{ text }}</span>
    </div>
  </div>

  <div
    v-else
    class="flex flex-col items-center justify-center gap-3"
  >
    <span :class="['inline-flex gap-1.5', sizeClasses[size]]">
      <span :class="[bubbleSizeClasses[size], colorClasses[color], 'rounded-full animate-bounce [animation-delay:-0.3s]']" />
      <span :class="[bubbleSizeClasses[size], colorClasses[color], 'rounded-full animate-bounce [animation-delay:-0.15s]']" />
      <span :class="[bubbleSizeClasses[size], colorClasses[color], 'rounded-full animate-bounce']" />
    </span>
    <span
      v-if="text"
      :class="[textSizeClasses[size], textColorClasses[color]]"
    >{{ text }}</span>
  </div>
</template>
