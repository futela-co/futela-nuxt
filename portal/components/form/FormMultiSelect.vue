<script setup lang="ts">
export interface MultiSelectOption {
  value: string | number
  label: string
  disabled?: boolean
  group?: string
}

interface Props {
  modelValue?: (string | number)[]
  options: MultiSelectOption[]
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  searchable?: boolean
  error?: string
  id?: string
  name?: string
  size?: 'sm' | 'md' | 'lg'
  maxSelections?: number
  emptyText?: string
  clearable?: boolean
  closeOnSelect?: boolean
  showCheckboxes?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  placeholder: '',
  disabled: false,
  loading: false,
  searchable: true,
  size: 'md',
  emptyText: '',
  clearable: true,
  closeOnSelect: false,
  showCheckboxes: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: (string | number)[]]
  search: [query: string]
  select: [option: MultiSelectOption]
  remove: [option: MultiSelectOption]
}>()

const generatedId = `multiselect-${Math.random().toString(36).substring(2, 9)}`
const inputId = computed(() => props.id || generatedId)

const searchQuery = ref('')
const isOpen = ref(false)
const highlightedIndex = ref(-1)
const inputRef = ref<HTMLInputElement | null>(null)
const listRef = ref<HTMLUListElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)

const sizeClasses: Record<string, string> = {
  sm: 'min-h-[34px] text-sm',
  md: 'min-h-[42px] text-sm',
  lg: 'min-h-[50px] text-base',
}

const tagSizeClasses: Record<string, string> = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2 py-1 text-xs',
  lg: 'px-2.5 py-1 text-sm',
}

const containerClasses = computed(() => [
  'relative w-full flex flex-wrap items-center gap-1.5 rounded border transition-colors duration-200',
  'px-3 py-1.5',
  sizeClasses[props.size],
  isOpen.value
    ? 'border-primary-500 ring-2 ring-primary-500 ring-offset-0'
    : props.error
      ? 'border-red-500'
      : 'border-gray-300',
  props.disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white cursor-text',
])

const selectedOptions = computed(() => {
  return props.options.filter(opt => props.modelValue.includes(opt.value))
})

const filteredOptions = computed(() => {
  let filtered = props.options

  if (props.searchable && searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(option =>
      option.label.toLowerCase().includes(query)
    )
  }

  return filtered
})

const groupedOptions = computed(() => {
  const groups: Record<string, MultiSelectOption[]> = {}
  const ungrouped: MultiSelectOption[] = []

  filteredOptions.value.forEach(option => {
    if (option.group) {
      if (!groups[option.group]) {
        groups[option.group] = []
      }
      groups[option.group]!.push(option)
    } else {
      ungrouped.push(option)
    }
  })

  return { groups, ungrouped }
})

const canSelectMore = computed(() => {
  if (!props.maxSelections) return true
  return props.modelValue.length < props.maxSelections
})

function isSelected(option: MultiSelectOption): boolean {
  return props.modelValue.includes(option.value)
}

function toggleOption(option: MultiSelectOption) {
  if (option.disabled) return

  const newValue = [...props.modelValue]
  const index = newValue.indexOf(option.value)

  if (index > -1) {
    newValue.splice(index, 1)
    emit('update:modelValue', newValue)
    emit('remove', option)
  } else if (canSelectMore.value) {
    newValue.push(option.value)
    emit('update:modelValue', newValue)
    emit('select', option)

    if (props.closeOnSelect) {
      isOpen.value = false
    }
  }

  searchQuery.value = ''
}

function removeOption(option: MultiSelectOption, event?: MouseEvent) {
  event?.stopPropagation()
  const newValue = props.modelValue.filter(v => v !== option.value)
  emit('update:modelValue', newValue)
  emit('remove', option)
}

function clearAll(event: MouseEvent) {
  event.stopPropagation()
  emit('update:modelValue', [])
}

function handleContainerClick() {
  if (!props.disabled) {
    isOpen.value = true
    inputRef.value?.focus()
  }
}

function handleInputFocus() {
  if (!props.disabled) {
    isOpen.value = true
    highlightedIndex.value = -1
  }
}

function handleInputBlur() {
  setTimeout(() => {
    isOpen.value = false
    searchQuery.value = ''
  }, 200)
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  searchQuery.value = target.value
  highlightedIndex.value = 0
  emit('search', target.value)
}

function handleKeydown(event: KeyboardEvent) {
  if (!isOpen.value && (event.key === 'ArrowDown' || event.key === 'Enter')) {
    isOpen.value = true
    highlightedIndex.value = 0
    event.preventDefault()
    return
  }

  const options = filteredOptions.value

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      highlightedIndex.value = Math.min(highlightedIndex.value + 1, options.length - 1)
      scrollToHighlighted()
      break
    case 'ArrowUp':
      event.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
      scrollToHighlighted()
      break
    case 'Enter':
      event.preventDefault()
      if (highlightedIndex.value >= 0 && options[highlightedIndex.value]) {
        toggleOption(options[highlightedIndex.value]!)
      }
      break
    case 'Escape':
      isOpen.value = false
      searchQuery.value = ''
      break
    case 'Backspace':
      if (!searchQuery.value && selectedOptions.value.length > 0) {
        const lastOption = selectedOptions.value[selectedOptions.value.length - 1]!
        removeOption(lastOption)
      }
      break
  }
}

const { t } = useLocale()

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
    <div
      ref="containerRef"
      :class="containerClasses"
      @click="handleContainerClick"
    >
      <span
        v-for="option in selectedOptions"
        :key="option.value"
        :class="[
          'inline-flex items-center gap-1 rounded-md bg-primary-100 text-primary-800',
          tagSizeClasses[size],
        ]"
      >
        <span class="truncate max-w-[150px]">{{ option.label }}</span>
        <button
          v-if="!disabled"
          type="button"
          class="flex-shrink-0 hover:text-primary-600 focus:outline-none"
          tabindex="-1"
          @click="removeOption(option, $event)"
        >
          <svg
            class="h-3.5 w-3.5"
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
      </span>

      <input
        :id="inputId"
        ref="inputRef"
        type="text"
        :value="searchQuery"
        :placeholder="selectedOptions.length === 0 ? (placeholder || t('form.select')) : ''"
        :disabled="disabled"
        :name="name"
        :class="[
          'flex-1 min-w-[60px] border-0 bg-transparent p-0 focus:outline-none focus:ring-0',
          disabled ? 'cursor-not-allowed' : '',
        ]"
        :aria-expanded="isOpen"
        :aria-controls="`${inputId}-listbox`"
        role="combobox"
        aria-autocomplete="list"
        autocomplete="off"
        @input="handleInput"
        @focus="handleInputFocus"
        @blur="handleInputBlur"
        @keydown="handleKeydown"
      >

      <div class="flex-shrink-0 flex items-center gap-1 ml-1">
        <button
          v-if="clearable && selectedOptions.length > 0 && !disabled"
          type="button"
          class="p-1 text-gray-400 hover:text-gray-900 focus:outline-none"
          tabindex="-1"
          @click="clearAll"
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
        :aria-multiselectable="true"
      >
        <li
          v-if="loading"
          class="px-4 py-2 text-sm text-gray-900 text-center"
        >
          {{ t('ui.loading') }}
        </li>

        <li
          v-else-if="filteredOptions.length === 0"
          class="px-4 py-2 text-sm text-gray-900 text-center"
        >
          {{ emptyText || t('form.noResultsFound') }}
        </li>

        <template v-else>
          <template v-if="groupedOptions.ungrouped.length > 0">
            <li
              v-for="(option, index) in groupedOptions.ungrouped"
              :key="option.value"
              :class="[
                'relative cursor-pointer select-none px-4 py-2 text-sm flex items-center gap-3',
                highlightedIndex === index ? 'bg-primary-50 text-primary-900' : 'text-gray-900',
                option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50',
              ]"
              :data-highlighted="highlightedIndex === index"
              role="option"
              :aria-selected="isSelected(option)"
              :aria-disabled="option.disabled"
              @mousedown.prevent="toggleOption(option)"
              @mouseenter="highlightedIndex = index"
            >
              <span
                v-if="showCheckboxes"
                :class="[
                  'flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center',
                  isSelected(option)
                    ? 'bg-primary-500 border-primary-500 text-white'
                    : 'border-gray-300',
                ]"
              >
                <svg
                  v-if="isSelected(option)"
                  class="h-3 w-3"
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
              <span class="flex-1 truncate">{{ option.label }}</span>
            </li>
          </template>

          <template
            v-for="(groupOptions, groupName) in groupedOptions.groups"
            :key="groupName"
          >
            <li class="px-4 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wide bg-gray-50">
              {{ groupName }}
            </li>
            <li
              v-for="option in groupOptions"
              :key="option.value"
              :class="[
                'relative cursor-pointer select-none px-4 py-2 text-sm flex items-center gap-3 pl-6',
                isSelected(option) ? 'bg-primary-50 text-primary-900' : 'text-gray-900',
                option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50',
              ]"
              role="option"
              :aria-selected="isSelected(option)"
              :aria-disabled="option.disabled"
              @mousedown.prevent="toggleOption(option)"
            >
              <span
                v-if="showCheckboxes"
                :class="[
                  'flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center',
                  isSelected(option)
                    ? 'bg-primary-500 border-primary-500 text-white'
                    : 'border-gray-300',
                ]"
              >
                <svg
                  v-if="isSelected(option)"
                  class="h-3 w-3"
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
              <span class="flex-1 truncate">{{ option.label }}</span>
            </li>
          </template>
        </template>
      </ul>
    </Transition>

    <div
      v-if="maxSelections"
      class="mt-1 text-xs text-gray-900"
    >
      {{ modelValue.length }} / {{ maxSelections }} {{ t('table.selected') }}
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
