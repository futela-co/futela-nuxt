<script setup lang="ts">
interface Props {
  modelValue?: boolean
  label?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'success' | 'danger' | 'warning'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  label: '',
  disabled: false,
  size: 'md',
  variant: 'primary'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  change: [value: boolean]
}>()

const inputRef = ref<HTMLInputElement>()

const sizeClasses = computed(() => {
  const sizes: Record<string, { track: string; thumb: string; translate: string }> = {
    sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
    md: { track: 'w-10 h-5', thumb: 'w-4 h-4', translate: 'translate-x-5' },
    lg: { track: 'w-12 h-6', thumb: 'w-5 h-5', translate: 'translate-x-6' }
  }
  return sizes[props.size]
})

const variantClasses = computed(() => {
  const variants: Record<string, string> = {
    primary: 'peer-checked:bg-primary-600',
    success: 'peer-checked:bg-success-500',
    danger: 'peer-checked:bg-danger-500',
    warning: 'peer-checked:bg-warning-500'
  }
  return variants[props.variant]
})

function toggle() {
  if (props.disabled) return
  const newValue = !props.modelValue
  emit('update:modelValue', newValue)
  emit('change', newValue)
}

defineExpose({ inputRef })
</script>

<template>
  <label
    class="inline-flex items-center gap-2 cursor-pointer"
    :class="{ 'opacity-60 cursor-not-allowed': disabled }"
  >
    <div class="relative">
      <input
        ref="inputRef"
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        class="sr-only peer"
        @change="toggle"
      >
      <div
        :class="[
          'rounded-full bg-gray-200 transition-colors duration-200',
          sizeClasses?.track,
          variantClasses
        ]"
      />
      <div
        :class="[
          'absolute top-0.5 left-0.5 bg-white rounded-full shadow transition-transform duration-200',
          sizeClasses?.thumb,
          { [sizeClasses?.translate ?? '']: modelValue }
        ]"
      />
    </div>
    <span
      v-if="label || $slots.default"
      class="text-sm text-gray-900"
    >
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>
