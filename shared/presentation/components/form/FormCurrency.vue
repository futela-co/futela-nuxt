<script setup lang="ts">
type CurrencyCode = 'USD' | 'CDF' | 'EUR'

interface Props {
  modelValue?: number | null
  currency?: CurrencyCode
  locale?: string
  disabled?: boolean
  readonly?: boolean
  placeholder?: string
  error?: string
  id?: string
  name?: string
  size?: 'sm' | 'md' | 'lg'
  min?: number
  max?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  currency: 'USD',
  locale: 'fr-CD',
  disabled: false,
  readonly: false,
  placeholder: '0.00',
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const generatedId = `currency-${Math.random().toString(36).substring(2, 9)}`
const inputId = computed(() => props.id || generatedId)

const inputRef = ref<HTMLInputElement | null>(null)
const isFocused = ref(false)
const displayValue = ref('')

const currencySymbols: Record<CurrencyCode, string> = {
  USD: '$',
  CDF: 'FC',
  EUR: '\u20AC',
}

const currencyDecimals: Record<CurrencyCode, number> = {
  USD: 2,
  CDF: 0,
  EUR: 2,
}

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-4 py-3 text-base',
}

const inputClasses = computed(() => [
  'block w-full rounded border transition-colors duration-200',
  'focus:outline-none focus:ring-2 focus:ring-offset-0',
  'pl-12',
  sizeClasses[props.size],
  props.error
    ? 'border-red-500 text-red-900 placeholder-red-400 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500',
  props.disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white',
  props.readonly ? 'bg-gray-50' : '',
])

const currencySymbol = computed(() => currencySymbols[props.currency])
const decimals = computed(() => currencyDecimals[props.currency])

function formatNumber(value: number | null): string {
  if (value === null || value === undefined || isNaN(value)) {
    return ''
  }

  return new Intl.NumberFormat(props.locale, {
    minimumFractionDigits: decimals.value,
    maximumFractionDigits: decimals.value,
    useGrouping: true,
  }).format(value)
}

function parseNumber(value: string): number | null {
  if (!value || value.trim() === '') {
    return null
  }

  const cleanValue = value
    .replace(/[^\d,.-]/g, '')
    .replace(/\s/g, '')
    .replace(',', '.')

  const parsed = parseFloat(cleanValue)

  if (isNaN(parsed)) {
    return null
  }

  return Math.round(parsed * Math.pow(10, decimals.value)) / Math.pow(10, decimals.value)
}

function updateDisplayValue() {
  if (!isFocused.value) {
    displayValue.value = formatNumber(props.modelValue ?? null)
  }
}

watch(() => props.modelValue, updateDisplayValue, { immediate: true })
watch(() => props.currency, updateDisplayValue)

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  displayValue.value = target.value
}

function handleFocus(event: FocusEvent) {
  isFocused.value = true

  if (props.modelValue !== null && props.modelValue !== undefined) {
    displayValue.value = props.modelValue.toString().replace('.', ',')
  } else {
    displayValue.value = ''
  }

  emit('focus', event)
}

function handleBlur(event: FocusEvent) {
  isFocused.value = false
  const parsedValue = parseNumber(displayValue.value)

  let finalValue = parsedValue

  if (finalValue !== null) {
    if (props.min !== undefined && finalValue < props.min) {
      finalValue = props.min
    }
    if (props.max !== undefined && finalValue > props.max) {
      finalValue = props.max
    }
  }

  emit('update:modelValue', finalValue)
  displayValue.value = formatNumber(finalValue)
  emit('blur', event)
}

function handleKeydown(event: KeyboardEvent) {
  const allowedKeys = [
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'Home', 'End',
  ]

  if (allowedKeys.includes(event.key)) {
    return
  }

  if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x', 'z'].includes(event.key.toLowerCase())) {
    return
  }

  if (/^\d$/.test(event.key)) {
    return
  }

  if ([',', '.', '-'].includes(event.key)) {
    const target = event.target as HTMLInputElement
    const value = target.value

    if (event.key === '-' && target.selectionStart !== 0) {
      event.preventDefault()
      return
    }

    if ((event.key === ',' || event.key === '.') && (value.includes(',') || value.includes('.'))) {
      event.preventDefault()
      return
    }

    return
  }

  event.preventDefault()
}
</script>

<template>
  <div class="relative w-full">
    <div class="relative">
      <div
        class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
      >
        <span class="text-gray-900 sm:text-sm font-medium min-w-[24px]">
          {{ currencySymbol }}
        </span>
      </div>

      <input
        :id="inputId"
        ref="inputRef"
        type="text"
        inputmode="decimal"
        :value="displayValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :name="name"
        :class="inputClasses"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${inputId}-error` : undefined"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      >

      <div
        class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
      >
        <span class="text-gray-400 text-xs font-medium">
          {{ currency }}
        </span>
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
