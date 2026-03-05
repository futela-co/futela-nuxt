<script setup lang="ts">
interface Props {
  modelValue?: string | number | null
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'datetime-local' | 'time'
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  error?: string
  id?: string
  name?: string
  autocomplete?: string
  maxlength?: number
  minlength?: number
  min?: number
  max?: number
  step?: number
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  readonly: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
  input: [event: Event]
}>()

const generatedId = `input-${Math.random().toString(36).substring(2, 9)}`
const inputId = computed(() => props.id || generatedId)

const inputClasses = computed(() => {
  const classes = ['form-control']

  // Size variants
  if (props.size === 'sm') classes.push('form-control-sm')
  if (props.size === 'lg') classes.push('form-control-lg')

  // Error state
  if (props.error) {
    classes.push('!border-red-500 !text-red-900 placeholder-red-400')
  }

  // Disabled state
  if (props.disabled) {
    classes.push('!bg-gray-100 cursor-not-allowed opacity-60')
  }

  // Readonly state
  if (props.readonly) {
    classes.push('!bg-gray-50')
  }

  return classes
})

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
  emit('input', event)
}

function handleBlur(event: FocusEvent) {
  emit('blur', event)
}

function handleFocus(event: FocusEvent) {
  emit('focus', event)
}
</script>

<template>
  <div class="w-full">
    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :name="name"
      :autocomplete="autocomplete"
      :maxlength="maxlength"
      :minlength="minlength"
      :min="min"
      :max="max"
      :step="step"
      :class="inputClasses"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${inputId}-error` : undefined"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
    >
    <p
      v-if="error"
      :id="`${inputId}-error`"
      class="mt-1.5 text-xs text-red-500"
    >
      {{ error }}
    </p>
  </div>
</template>
