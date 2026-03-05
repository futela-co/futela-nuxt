<script setup lang="ts">
export interface CountryOption {
  code: string
  name: string
  dialCode: string
  flag: string
}

interface Props {
  modelValue?: string | null
  countryCode?: string
  disabled?: boolean
  readonly?: boolean
  placeholder?: string
  error?: string
  id?: string
  name?: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  countryCode: 'CD',
  disabled: false,
  readonly: false,
  placeholder: '000 000 000',
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  'update:countryCode': [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const generatedId = `phone-${Math.random().toString(36).substring(2, 9)}`
const inputId = computed(() => props.id || generatedId)

const isDropdownOpen = ref(false)
const searchQuery = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

const countries: CountryOption[] = [
  { code: 'CD', name: 'RD Congo', dialCode: '+243', flag: '\ud83c\udde8\ud83c\udde9' },
  { code: 'CG', name: 'Congo', dialCode: '+242', flag: '\ud83c\udde8\ud83c\uddec' },
  { code: 'RW', name: 'Rwanda', dialCode: '+250', flag: '\ud83c\uddf7\ud83c\uddfc' },
  { code: 'BI', name: 'Burundi', dialCode: '+257', flag: '\ud83c\udde7\ud83c\uddee' },
  { code: 'UG', name: 'Ouganda', dialCode: '+256', flag: '\ud83c\uddfa\ud83c\uddec' },
  { code: 'TZ', name: 'Tanzanie', dialCode: '+255', flag: '\ud83c\uddf9\ud83c\uddff' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '\ud83c\uddf0\ud83c\uddea' },
  { code: 'ZA', name: 'Afrique du Sud', dialCode: '+27', flag: '\ud83c\uddff\ud83c\udde6' },
  { code: 'AO', name: 'Angola', dialCode: '+244', flag: '\ud83c\udde6\ud83c\uddf4' },
  { code: 'ZM', name: 'Zambie', dialCode: '+260', flag: '\ud83c\uddff\ud83c\uddf2' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '\ud83c\uddeb\ud83c\uddf7' },
  { code: 'BE', name: 'Belgique', dialCode: '+32', flag: '\ud83c\udde7\ud83c\uddea' },
  { code: 'US', name: 'Etats-Unis', dialCode: '+1', flag: '\ud83c\uddfa\ud83c\uddf8' },
  { code: 'GB', name: 'Royaume-Uni', dialCode: '+44', flag: '\ud83c\uddec\ud83c\udde7' },
  { code: 'CM', name: 'Cameroun', dialCode: '+237', flag: '\ud83c\udde8\ud83c\uddf2' },
  { code: 'SN', name: 'Senegal', dialCode: '+221', flag: '\ud83c\uddf8\ud83c\uddf3' },
  { code: 'CI', name: "Cote d'Ivoire", dialCode: '+225', flag: '\ud83c\udde8\ud83c\uddee' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '\ud83c\uddf3\ud83c\uddec' },
]

const selectedCountry = computed(() => {
  return countries.find(c => c.code === props.countryCode) ?? countries[0]!
})

const filteredCountries = computed(() => {
  if (!searchQuery.value) return countries
  const query = searchQuery.value.toLowerCase()
  return countries.filter(c =>
    c.name.toLowerCase().includes(query) ||
    c.dialCode.includes(query) ||
    c.code.toLowerCase().includes(query)
  )
})

const sizeClasses: Record<string, string> = {
  sm: 'py-1.5 text-sm',
  md: 'py-2 text-sm',
  lg: 'py-3 text-base',
}

const inputClasses = computed(() => [
  'block w-full rounded-r-lg border border-l-0 transition-colors duration-200',
  'focus:outline-none focus:ring-2 focus:ring-offset-0 focus:z-10',
  'pl-3 pr-4',
  sizeClasses[props.size],
  props.error
    ? 'border-red-500 text-red-900 placeholder-red-400 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500',
  props.disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white',
  props.readonly ? 'bg-gray-50' : '',
])

const buttonClasses = computed(() => [
  'inline-flex items-center gap-2 rounded-l-lg border transition-colors duration-200',
  'focus:outline-none focus:ring-2 focus:ring-offset-0 focus:z-10',
  'px-3',
  sizeClasses[props.size],
  props.error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
  props.disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-gray-50 hover:bg-gray-100 cursor-pointer',
])

function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '')

  if (digits.length <= 3) {
    return digits
  } else if (digits.length <= 6) {
    return `${digits.slice(0, 3)} ${digits.slice(3)}`
  } else if (digits.length <= 9) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
  } else {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9, 12)}`
  }
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  const cursorPosition = target.selectionStart || 0
  const oldValue = target.value
  const oldDigits = oldValue.replace(/\D/g, '')

  const digits = target.value.replace(/\D/g, '').slice(0, 12)
  const formatted = formatPhoneNumber(digits)

  emit('update:modelValue', digits || null)

  nextTick(() => {
    const newDigits = formatted.replace(/\D/g, '')
    const digitsBeforeCursor = oldValue.slice(0, cursorPosition).replace(/\D/g, '').length

    let newCursorPosition = 0
    let digitCount = 0

    for (let i = 0; i < formatted.length; i++) {
      if (/\d/.test(formatted[i]!)) {
        digitCount++
      }
      if (digitCount === digitsBeforeCursor) {
        newCursorPosition = i + 1
        break
      }
    }

    if (digitsBeforeCursor === 0) {
      newCursorPosition = 0
    }

    target.value = formatted
    target.setSelectionRange(newCursorPosition, newCursorPosition)
  })
}

function handleFocus(event: FocusEvent) {
  emit('focus', event)
}

function handleBlur(event: FocusEvent) {
  emit('blur', event)
}

function toggleDropdown() {
  if (props.disabled) return
  isDropdownOpen.value = !isDropdownOpen.value
  if (isDropdownOpen.value) {
    searchQuery.value = ''
  }
}

function selectCountry(country: CountryOption) {
  emit('update:countryCode', country.code)
  isDropdownOpen.value = false
  inputRef.value?.focus()
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest(`#${inputId.value}-dropdown`)) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const { t } = useLocale()

const displayValue = computed(() => {
  if (!props.modelValue) return ''
  return formatPhoneNumber(props.modelValue)
})
</script>

<template>
  <div class="relative w-full">
    <div
      :id="`${inputId}-dropdown`"
      class="flex"
    >
      <button
        type="button"
        :class="buttonClasses"
        :disabled="disabled"
        @click="toggleDropdown"
      >
        <span class="text-base">{{ selectedCountry.flag }}</span>
        <span class="text-gray-900 font-medium">{{ selectedCountry.dialCode }}</span>
        <svg
          class="h-4 w-4 text-gray-400 transition-transform"
          :class="{ 'rotate-180': isDropdownOpen }"
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

      <input
        :id="inputId"
        ref="inputRef"
        type="tel"
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
      >
    </div>

    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isDropdownOpen"
        class="absolute z-50 mt-1 w-72 rounded bg-white shadow-lg ring-1 ring-black ring-opacity-5"
      >
        <div class="p-2 border-b border-gray-100">
          <input
            v-model="searchQuery"
            type="text"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            :placeholder="t('filter.searchCountry')"
          >
        </div>

        <ul class="max-h-60 overflow-auto py-1">
          <li
            v-for="country in filteredCountries"
            :key="country.code"
            class="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
            :class="{ 'bg-primary-50': country.code === countryCode }"
            @click="selectCountry(country)"
          >
            <span class="text-xl">{{ country.flag }}</span>
            <span class="flex-1 text-gray-900">{{ country.name }}</span>
            <span class="text-gray-900">{{ country.dialCode }}</span>
          </li>

          <li
            v-if="filteredCountries.length === 0"
            class="px-3 py-2 text-sm text-gray-900 text-center"
          >
            {{ t('filter.noCountry') }}
          </li>
        </ul>
      </div>
    </Transition>

    <p
      v-if="error"
      :id="`${inputId}-error`"
      class="mt-1.5 text-xs text-red-500"
    >
      {{ error }}
    </p>
  </div>
</template>
