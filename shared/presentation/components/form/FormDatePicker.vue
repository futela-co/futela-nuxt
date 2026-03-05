<script setup lang="ts">
interface Props {
  modelValue?: string | Date | null
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  error?: string
  id?: string
  name?: string
  label?: string
  size?: 'sm' | 'md' | 'lg'
  min?: string
  max?: string
  format?: string
  locale?: string
  clearable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  placeholder: '',
  disabled: false,
  readonly: false,
  size: 'md',
  format: 'dd/MM/yyyy',
  locale: 'fr-CD',
  clearable: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  change: [value: string | null]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const generatedId = `datepicker-${Math.random().toString(36).substring(2, 9)}`
const inputId = computed(() => props.id || generatedId)
const inputRef = ref<HTMLInputElement | null>(null)

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-4 py-3 text-base',
}

const inputClasses = computed(() => [
  'block w-full rounded-md border shadow-sm transition-colors duration-200',
  'focus:outline-none focus:ring-1 focus:ring-primary-100',
  'pl-10 pr-10',
  sizeClasses[props.size],
  props.error
    ? 'border-red-500 text-red-900 placeholder-red-400 focus:border-red-500 focus:ring-red-200'
    : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-400',
  props.disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white',
  props.readonly ? 'bg-gray-50' : '',
])

const internalValue = computed({
  get() {
    if (!props.modelValue) return ''
    if (props.modelValue instanceof Date) {
      return formatDateForInput(props.modelValue)
    }
    return props.modelValue
  },
  set(value: string) {
    emit('update:modelValue', value || null)
    emit('change', value || null)
  },
})

const displayValue = computed(() => {
  if (!props.modelValue) return ''
  const date = props.modelValue instanceof Date ? props.modelValue : new Date(props.modelValue)
  if (isNaN(date.getTime())) return ''
  return formatDisplayDate(date)
})

function formatDateForInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDisplayDate(date: Date): string {
  return new Intl.DateTimeFormat(props.locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  internalValue.value = target.value
}

function handleFocus(event: FocusEvent) {
  emit('focus', event)
}

function handleBlur(event: FocusEvent) {
  emit('blur', event)
}

function clearDate() {
  emit('update:modelValue', null)
  emit('change', null)
  inputRef.value?.focus()
}

const { t } = useLocale()

function openPicker() {
  inputRef.value?.showPicker()
}
</script>

<template>
  <div class="w-full">
    <label
      v-if="label"
      :for="inputId"
      class="label"
    >
      {{ label }}
    </label>
    <div class="relative">
      <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          class="h-5 w-5 text-gray-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
            clip-rule="evenodd"
          />
        </svg>
      </div>

      <input
        :id="inputId"
        ref="inputRef"
        type="date"
        :value="internalValue"
        :placeholder="placeholder || t('form.selectDate')"
        :disabled="disabled"
        :readonly="readonly"
        :name="name"
        :min="min"
        :max="max"
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
          @click="clearDate"
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
