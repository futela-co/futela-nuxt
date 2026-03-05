<script setup lang="ts">
export interface AutocompleteOption {
  value: string | number
  label: string
  disabled?: boolean
}

interface Props {
  modelValue?: string | number | null
  options: AutocompleteOption[]
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  searchable?: boolean
  error?: string
  id?: string
  name?: string
  size?: 'sm' | 'md' | 'lg'
  emptyText?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  placeholder: 'Rechercher...',
  disabled: false,
  loading: false,
  searchable: true,
  size: 'md',
  emptyText: 'Aucun resultat trouve',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
  search: [query: string]
  select: [option: AutocompleteOption]
}>()

const generatedId = `autocomplete-${Math.random().toString(36).substring(2, 9)}`
const inputId = computed(() => props.id || generatedId)

const searchQuery = ref('')
const isOpen = ref(false)
const highlightedIndex = ref(-1)
const inputRef = ref<HTMLInputElement | null>(null)
const listRef = ref<HTMLUListElement | null>(null)

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-4 py-3 text-base',
}

const inputClasses = computed(() => [
  'block w-full rounded border transition-colors duration-200',
  'focus:outline-none focus:ring-2 focus:ring-offset-0',
  sizeClasses[props.size],
  props.error
    ? 'border-red-500 text-red-900 placeholder-red-400 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500',
  props.disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white',
])

const selectedOption = computed(() => {
  return props.options.find(opt => opt.value === props.modelValue)
})

const displayValue = computed(() => {
  if (isOpen.value) {
    return searchQuery.value
  }
  return selectedOption.value?.label || ''
})

const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) {
    return props.options
  }
  const query = searchQuery.value.toLowerCase()
  return props.options.filter(option =>
    option.label.toLowerCase().includes(query)
  )
})

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  searchQuery.value = target.value
  isOpen.value = true
  highlightedIndex.value = 0
  emit('search', target.value)
}

function handleFocus() {
  if (!props.disabled) {
    isOpen.value = true
    searchQuery.value = ''
    highlightedIndex.value = -1
  }
}

function handleBlur() {
  setTimeout(() => {
    isOpen.value = false
    searchQuery.value = ''
  }, 200)
}

function selectOption(option: AutocompleteOption) {
  if (option.disabled) return
  emit('update:modelValue', option.value)
  emit('select', option)
  isOpen.value = false
  searchQuery.value = ''
  inputRef.value?.blur()
}

function clearSelection() {
  emit('update:modelValue', null)
  searchQuery.value = ''
  inputRef.value?.focus()
}

function handleKeydown(event: KeyboardEvent) {
  if (!isOpen.value) {
    if (event.key === 'ArrowDown' || event.key === 'Enter') {
      isOpen.value = true
      highlightedIndex.value = 0
      event.preventDefault()
    }
    return
  }

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      highlightedIndex.value = Math.min(
        highlightedIndex.value + 1,
        filteredOptions.value.length - 1
      )
      scrollToHighlighted()
      break
    case 'ArrowUp':
      event.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
      scrollToHighlighted()
      break
    case 'Enter':
      event.preventDefault()
      if (highlightedIndex.value >= 0 && filteredOptions.value[highlightedIndex.value]) {
        selectOption(filteredOptions.value[highlightedIndex.value]!)
      }
      break
    case 'Escape':
      isOpen.value = false
      searchQuery.value = ''
      break
    case 'Tab':
      isOpen.value = false
      break
  }
}

function scrollToHighlighted() {
  nextTick(() => {
    const list = listRef.value
    if (!list) return
    const highlighted = list.querySelector('[data-highlighted="true"]')
    if (highlighted) {
      highlighted.scrollIntoView({ block: 'nearest' })
    }
  })
}
</script>

<template>
  <div class="relative w-full">
    <div class="relative">
      <input
        :id="inputId"
        ref="inputRef"
        type="text"
        :value="displayValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :name="name"
        :class="inputClasses"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${inputId}-error` : undefined"
        :aria-expanded="isOpen"
        :aria-controls="`${inputId}-listbox`"
        aria-autocomplete="list"
        role="combobox"
        autocomplete="off"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      >

      <div class="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
        <button
          v-if="modelValue && !disabled"
          type="button"
          class="p-1 text-gray-400 hover:text-gray-900 focus:outline-none"
          tabindex="-1"
          @mousedown.prevent="clearSelection"
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

        <div
          v-if="loading"
          class="p-1 inline-flex gap-0.5"
        >
          <span class="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span class="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span class="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
        </div>

        <div
          v-else
          class="pointer-events-none p-1"
        >
          <svg
            class="h-4 w-4 text-gray-400"
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
      </div>
    </div>

    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <ul
        v-if="isOpen && !disabled"
        :id="`${inputId}-listbox`"
        ref="listRef"
        class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        role="listbox"
      >
        <li
          v-if="loading"
          class="px-4 py-2 text-sm text-gray-900 text-center"
        >
          Chargement...
        </li>

        <li
          v-else-if="filteredOptions.length === 0"
          class="px-4 py-2 text-sm text-gray-900 text-center"
        >
          {{ emptyText }}
        </li>

        <li
          v-for="(option, index) in filteredOptions"
          v-else
          :key="option.value"
          :class="[
            'relative cursor-pointer select-none px-4 py-2 text-sm',
            highlightedIndex === index ? 'bg-primary-50 text-primary-900' : 'text-gray-900',
            option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50',
            modelValue === option.value ? 'font-medium' : '',
          ]"
          :data-highlighted="highlightedIndex === index"
          role="option"
          :aria-selected="modelValue === option.value"
          :aria-disabled="option.disabled"
          @mousedown.prevent="selectOption(option)"
          @mouseenter="highlightedIndex = index"
        >
          <span class="block truncate">{{ option.label }}</span>
          <span
            v-if="modelValue === option.value"
            class="absolute inset-y-0 right-0 flex items-center pr-4 text-primary-600"
          >
            <svg
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clip-rule="evenodd"
              />
            </svg>
          </span>
        </li>
      </ul>
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
