<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline-primary' | 'outline-secondary' | 'outline-success' | 'outline-danger' | 'outline-warning'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  disabled?: boolean
  icon?: string
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  type: 'button',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const variantClasses: Record<string, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  success: 'btn-success',
  danger: 'btn-danger',
  warning: 'btn-warning',
  'outline-primary': 'btn-outline-primary',
  'outline-secondary': 'btn-outline-secondary',
  'outline-success': 'btn-outline-success',
  'outline-danger': 'btn-outline-danger',
  'outline-warning': 'btn-outline-warning',
}

// Matching CSS .btn sizes from main.css
const sizeClasses: Record<string, string> = {
  xs: 'btn-xs',
  sm: 'btn-sm',
  md: '', // default size from .btn class
  lg: '', // use default size
  xl: 'btn-xl',
}

const iconSizeClasses: Record<string, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6',
}

// Bubble sizes for loading indicator based on button size
const bubbleSizeClasses: Record<string, string> = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-3.5 h-3.5',
}

const isDisabled = computed(() => props.disabled || props.loading)

const buttonClasses = computed(() => [
  'btn',
  variantClasses[props.variant],
  sizeClasses[props.size],
  'relative gap-2', // Add gap for icon spacing
  isDisabled.value ? 'opacity-50 cursor-not-allowed' : '',
])

function handleClick(event: MouseEvent) {
  if (!isDisabled.value) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :type="type"
    :disabled="isDisabled"
    :class="buttonClasses"
    @click="handleClick"
  >
    <!-- Content wrapper - stays visible to maintain size, but becomes transparent when loading -->
    <span
      :class="{ 'opacity-0': loading }"
      class="inline-flex items-center gap-2"
    >
      <slot name="icon">
        <span
          v-if="icon"
          :class="iconSizeClasses[size]"
        >
          <component
            :is="icon"
            class="w-full h-full"
          />
        </span>
      </slot>
      <slot />
    </span>
    <!-- Loading indicator - positioned absolutely to overlay content -->
    <span
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center gap-1"
    >
      <span
        class="rounded-full animate-bounce [animation-delay:-0.3s]"
        :class="[bubbleSizeClasses[size], variant.startsWith('outline') ? 'bg-current' : 'bg-white']"
      />
      <span
        class="rounded-full animate-bounce [animation-delay:-0.15s]"
        :class="[bubbleSizeClasses[size], variant.startsWith('outline') ? 'bg-current' : 'bg-white']"
      />
      <span
        class="rounded-full animate-bounce"
        :class="[bubbleSizeClasses[size], variant.startsWith('outline') ? 'bg-current' : 'bg-white']"
      />
    </span>
  </button>
</template>
