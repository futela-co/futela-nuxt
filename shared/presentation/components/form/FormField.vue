<script setup lang="ts">
interface Props {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  id?: string
  labelClass?: string
  horizontal?: boolean
  labelWidth?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  horizontal: false,
  labelWidth: 'md',
})

const generatedId = `field-${Math.random().toString(36).substring(2, 9)}`
const fieldId = computed(() => props.id || generatedId)

const labelWidthClasses: Record<string, string> = {
  sm: 'sm:w-24',
  md: 'sm:w-32',
  lg: 'sm:w-40',
}

const containerClasses = computed(() => [
  'w-full',
  props.horizontal ? 'sm:flex sm:items-start sm:gap-4' : '',
])

const labelContainerClasses = computed(() => [
  props.horizontal ? `flex-shrink-0 ${labelWidthClasses[props.labelWidth]} sm:pt-2` : 'mb-1.5',
])

const contentClasses = computed(() => [
  props.horizontal ? 'flex-1 min-w-0' : '',
])
</script>

<template>
  <div :class="containerClasses">
    <div
      v-if="label"
      :class="labelContainerClasses"
    >
      <label
        :for="fieldId"
        :class="[
          'block text-sm font-medium text-gray-900',
          labelClass,
        ]"
      >
        {{ label }}
        <span
          v-if="props.required"
          class="text-red-500 ml-0.5"
        >*</span>
      </label>
    </div>

    <div :class="contentClasses">
      <slot
        :id="fieldId"
        :error="error"
      />

      <p
        v-if="hint && !error"
        class="mt-1.5 text-sm text-gray-900"
      >
        {{ hint }}
      </p>

      <p
        v-if="error"
        :id="`${fieldId}-error`"
        class="mt-1.5 text-xs text-red-500"
        role="alert"
      >
        {{ error }}
      </p>
    </div>
  </div>
</template>
