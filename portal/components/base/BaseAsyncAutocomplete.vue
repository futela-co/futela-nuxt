<script setup lang="ts">
import { XMarkIcon, ChevronUpDownIcon } from '@heroicons/vue/24/outline'

export interface AsyncAutocompleteOption {
  value: string | number
  label: string
}

interface Props {
  modelValue?: string | number | null
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  error?: string
  id?: string
  name?: string
  clearable?: boolean
  position?: 'bottom' | 'top'
  options?: AsyncAutocompleteOption[]
  minChars?: number
  debounceMs?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  placeholder: 'Rechercher...',
  disabled: false,
  loading: false,
  clearable: true,
  position: 'bottom',
  options: () => [],
  minChars: 0,
  debounceMs: 300
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
  'search': [query: string]
}>()

const generatedId = `async-autocomplete-${Math.random().toString(36).substring(2, 9)}`
const inputId = computed(() => props.id || generatedId)

const searchQuery = ref('')
const isOpen = ref(false)
const highlightedIndex = ref(-1)
const debounceTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const justSelected = ref(false)

// Selected option
const selectedOption = computed(() => {
  if (!props.modelValue) return null
  return props.options.find(opt => opt.value === props.modelValue)
})

// Get highlight segments for safe rendering (no v-html)
function getHighlightSegments(text: string): { text: string; highlighted: boolean }[] {
  if (!searchQuery.value.trim()) return [{ text, highlighted: false }]
  const escaped = searchQuery.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  const parts = text.split(regex)
  return parts.filter(Boolean).map(part => ({
    text: part,
    highlighted: part.toLowerCase() === searchQuery.value.toLowerCase()
  }))
}

// Debounced search
function debouncedSearch(query: string) {
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
  }

  if (query.length < props.minChars) {
    return
  }

  debounceTimer.value = setTimeout(() => {
    emit('search', query)
  }, props.debounceMs)
}

watch(searchQuery, (newQuery, oldQuery) => {
  // Skip if we just selected an option (to prevent reopening dropdown)
  if (justSelected.value) {
    justSelected.value = false
    return
  }

  debouncedSearch(newQuery)

  // If user manually cleared the input (had text, now empty), clear the selection
  if (oldQuery && !newQuery && props.modelValue) {
    emit('update:modelValue', null)
  }

  // Open dropdown when user starts typing (after clearing or initially)
  if (newQuery && !isOpen.value && document.activeElement?.id === inputId.value) {
    isOpen.value = true
  }
})

function handleFocus() {
  if (!props.disabled) {
    isOpen.value = true
    highlightedIndex.value = -1
    // Trigger initial search if no options loaded
    if (props.options.length === 0) {
      emit('search', searchQuery.value)
    }
  }
}

function handleBlur() {
  // Delay closing to allow clicking on options
  setTimeout(() => {
    isOpen.value = false
  }, 200)
}

function selectOption(option: AsyncAutocompleteOption) {
  justSelected.value = true
  emit('update:modelValue', option.value)
  searchQuery.value = option.label
  isOpen.value = false
}

function clearSelection() {
  emit('update:modelValue', null)
  searchQuery.value = ''
  // Keep dropdown open and trigger search to load fresh options
  isOpen.value = true
  emit('search', '')
}

function handleKeydown(event: KeyboardEvent) {
  if (props.disabled) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (!isOpen.value) {
        isOpen.value = true
      } else {
        highlightedIndex.value = Math.min(
          highlightedIndex.value + 1,
          props.options.length - 1
        )
      }
      break
    case 'ArrowUp':
      event.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
      break
    case 'Enter':
      event.preventDefault()
      if (isOpen.value && highlightedIndex.value >= 0) {
        selectOption(props.options[highlightedIndex.value]!)
      }
      break
    case 'Escape':
      event.preventDefault()
      isOpen.value = false
      break
  }
}

// Initialize search query with selected value
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    const option = props.options.find(opt => opt.value === newValue)
    if (option) {
      searchQuery.value = option.label
    }
  } else {
    searchQuery.value = ''
  }
}, { immediate: true })

// Also update searchQuery when options change (for restored form data)
watch(() => props.options, (newOptions) => {
  if (props.modelValue && newOptions.length > 0) {
    const option = newOptions.find(opt => opt.value === props.modelValue)
    if (option && searchQuery.value !== option.label) {
      searchQuery.value = option.label
    }
  }
}, { immediate: true })
</script>

<template>
  <div class="relative w-full">
    <div class="relative">
      <input
        :id="inputId"
        v-model="searchQuery"
        type="text"
        :placeholder="placeholder"
        :disabled="disabled"
        :name="name"
        class="form-control pr-20"
        :class="{
          '!border-red-500 !text-red-900': error,
          '!bg-gray-100 cursor-not-allowed': disabled
        }"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${inputId}-error` : undefined"
        autocomplete="off"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      >

      <!-- Icons -->
      <div class="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
        <!-- Loading spinner -->
        <div
          v-if="loading"
          class="pointer-events-none"
        >
          <svg
            class="animate-spin h-4 w-4 text-primary-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>

        <!-- Clear button -->
        <button
          v-if="clearable && selectedOption && !disabled && !loading"
          type="button"
          class="p-1 hover:bg-red-50 rounded transition-colors"
          @click="clearSelection"
        >
          <XMarkIcon class="h-4 w-4 text-red-500 hover:text-red-600" />
        </button>

        <!-- Dropdown icon -->
        <div
          v-if="!loading"
          class="pointer-events-none"
        >
          <ChevronUpDownIcon class="h-5 w-5 text-gray-400" />
        </div>
      </div>
    </div>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute z-10 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto"
        :class="position === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'"
      >
        <ul class="py-1">
          <!-- Loading state -->
          <li
            v-if="loading"
            class="px-3 py-1.5 text-xs text-gray-500"
          >
            <span class="inline-flex items-center gap-2">
              <svg
                class="animate-spin h-3 w-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Recherche en cours...
            </span>
          </li>

          <!-- No results -->
          <li
            v-else-if="options.length === 0"
            class="px-3 py-1.5 text-xs text-gray-900"
          >
            {{ searchQuery.length < minChars ? `Tapez au moins ${minChars} caractère(s)` : 'Aucun résultat' }}
          </li>

          <!-- Options -->
          <li
            v-for="(option, index) in options"
            v-else
            :key="option.value"
            class="px-3 py-1.5 text-xs cursor-pointer hover:bg-primary-50 transition-colors"
            :class="{
              'bg-primary-100': index === highlightedIndex,
              'bg-primary-50 text-primary-700': selectedOption?.value === option.value
            }"
            @mousedown.prevent="selectOption(option)"
            @mouseenter="highlightedIndex = index"
          >
            <template v-for="(segment, i) in getHighlightSegments(option.label)" :key="i">
              <mark v-if="segment.highlighted" class="bg-yellow-300 text-yellow-900 rounded-sm px-0.5 font-normal">{{ segment.text }}</mark>
              <span v-else>{{ segment.text }}</span>
            </template>
          </li>
        </ul>
      </div>
    </Transition>

    <!-- Error message -->
    <p
      v-if="error"
      :id="`${inputId}-error`"
      class="mt-1.5 text-xs text-red-500"
    >
      {{ error }}
    </p>
  </div>
</template>
