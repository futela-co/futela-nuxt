<script setup lang="ts">
interface Props {
  modelValue?: string | null
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  error?: string
  id?: string
  name?: string
  size?: 'sm' | 'md' | 'lg'
  min?: string
  max?: string
  step?: number
  clearable?: boolean
  use24Hour?: boolean
}

const { t } = useLocale()

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  placeholder: undefined,
  disabled: false,
  readonly: false,
  size: 'md',
  step: 60,
  clearable: true,
  use24Hour: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  change: [value: string | null]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const generatedId = `timepicker-${Math.random().toString(36).substring(2, 9)}`
const inputId = computed(() => props.id || generatedId)
const inputRef = ref<HTMLInputElement | null>(null)

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-4 py-3 text-base',
}

const inputClasses = computed(() => [
  'block w-full rounded border transition-colors duration-200',
  'focus:outline-none focus:ring-2 focus:ring-offset-0',
  'pl-10 pr-10',
  sizeClasses[props.size],
  props.error
    ? 'border-red-500 text-red-900 placeholder-red-400 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500',
  props.disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white',
  props.readonly ? 'bg-gray-50' : '',
])

const displayValue = computed(() => {
  if (!props.modelValue) return ''
  if (props.use24Hour) return props.modelValue

  const [hours = 0, minutes = 0] = props.modelValue.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`
})

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value || null)
  emit('change', target.value || null)
}

function handleFocus(event: FocusEvent) {
  emit('focus', event)
}

function handleBlur(event: FocusEvent) {
  emit('blur', event)
}

function clearTime() {
  emit('update:modelValue', null)
  emit('change', null)
  inputRef.value?.focus()
}

function openPicker() {
  inputRef.value?.showPicker()
}
</script>

<template>
  <div class="relative w-full">
    <div class="relative">
      <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          class="h-5 w-5 text-gray-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
            clip-rule="evenodd"
          />
        </svg>
      </div>

      <input
        :id="inputId"
        ref="inputRef"
        type="time"
        :value="modelValue || ''"
        :placeholder="placeholder || t('form.selectTime')"
        :disabled="disabled"
        :readonly="readonly"
        :name="name"
        :min="min"
        :max="max"
        :step="step"
        :class="inputClasses"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${inputId}-error` : undefined"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      >

      <div class="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
        <button
          v-if="clearable && modelValue && !disabled && !readonly"
          type="button"
          class="p-1 text-gray-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
          tabindex="-1"
          @click="clearTime"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <button
          v-if="!disabled && !readonly"
          type="button"
          class="p-1 text-gray-400 hover:text-gray-900 focus:outline-none"
          tabindex="-1"
          @click="openPicker"
        >
          <svg
            class="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>

    <p
      v-if="error"
      :id="`${inputId}-error`"
      class="mt-1.5 text-xs text-red-500"
    >
      {{ error }}
    </p>
  </div>
</template>
