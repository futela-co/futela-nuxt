<script setup lang="ts">
export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

interface Props {
  modelValue?: string | number | null
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  error?: string
  id?: string
  name?: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  placeholder: 'Selectionner...',
  disabled: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
  change: [value: string | number | null]
}>()

const generatedId = `select-${Math.random().toString(36).substring(2, 9)}`
const selectId = computed(() => props.id || generatedId)

const selectClasses = computed(() => {
  const classes = ['form-control', 'appearance-none', 'pr-10', 'cursor-pointer']

  // Size variants
  if (props.size === 'sm') classes.push('form-control-sm')
  if (props.size === 'lg') classes.push('form-control-lg')

  // Error state
  if (props.error) {
    classes.push('!border-red-500 !text-red-900')
  }

  // Disabled state
  if (props.disabled) {
    classes.push('!bg-gray-100 cursor-not-allowed opacity-60')
  }

  return classes
})

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const value = target.value === '' ? null : target.value
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<template>
  <div class="relative w-full">
    <select
      :id="selectId"
      :value="modelValue ?? ''"
      :disabled="disabled"
      :name="name"
      :class="selectClasses"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${selectId}-error` : undefined"
      @change="handleChange"
    >
      <option
        v-if="placeholder"
        value=""
        disabled
      >
        {{ placeholder }}
      </option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </option>
    </select>

    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
      <svg
        class="h-5 w-5 text-gray-400"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
          clip-rule="evenodd"
        />
      </svg>
    </div>

    <p
      v-if="error"
      :id="`${selectId}-error`"
      class="mt-1.5 text-xs text-red-500"
    >
      {{ error }}
    </p>
  </div>
</template>
