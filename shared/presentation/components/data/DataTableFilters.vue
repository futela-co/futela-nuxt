<script setup lang="ts">
export interface FilterOption {
  label: string
  value: string | number | boolean
}

export interface FilterConfig {
  key: string
  label: string
  type: 'text' | 'select' | 'date' | 'daterange' | 'number' | 'checkbox'
  placeholder?: string
  options?: FilterOption[]
  min?: number
  max?: number
  multiple?: boolean
}

export interface FilterValues {
  [key: string]: string | number | boolean | string[] | [Date | null, Date | null] | null
}

interface Props {
  filters: FilterConfig[]
  modelValue?: FilterValues
  loading?: boolean
  collapsible?: boolean
  collapsed?: boolean
  showReset?: boolean
  showApply?: boolean
  applyOnChange?: boolean
  variant?: 'inline' | 'stacked' | 'grid'
  columns?: 1 | 2 | 3 | 4
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({}),
  loading: false,
  collapsible: false,
  collapsed: false,
  showReset: true,
  showApply: true,
  applyOnChange: false,
  variant: 'inline',
  columns: 4,
})

const emit = defineEmits<{
  'update:modelValue': [values: FilterValues]
  'update:collapsed': [collapsed: boolean]
  apply: [values: FilterValues]
  reset: []
}>()

const isCollapsed = ref(props.collapsed)
const localValues = ref<FilterValues>({ ...props.modelValue })

watch(
  () => JSON.stringify(props.modelValue),
  () => {
    localValues.value = { ...props.modelValue }
  }
)

watch(
  () => props.collapsed,
  (newValue) => {
    isCollapsed.value = newValue
  }
)

const gridClasses = computed(() => {
  if (props.variant === 'inline') {
    return 'flex flex-wrap items-end gap-3'
  }
  if (props.variant === 'stacked') {
    return 'flex flex-col gap-3'
  }
  const colClasses: Record<number, string> = {
    1: 'grid grid-cols-1 gap-4',
    2: 'grid grid-cols-1 sm:grid-cols-2 gap-2',
    3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2',
    4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
  }
  return colClasses[props.columns]
})

const hasActiveFilters = computed(() => {
  return Object.values(localValues.value).some((value) => {
    if (Array.isArray(value)) {
      return value.some((v) => v !== null && v !== '')
    }
    return value !== null && value !== '' && value !== undefined
  })
})

function updateValue(key: string, value: FilterValues[string]) {
  localValues.value[key] = value
  emit('update:modelValue', { ...localValues.value })

  if (props.applyOnChange) {
    emit('apply', { ...localValues.value })
  }
}

function handleApply() {
  emit('apply', { ...localValues.value })
}

function handleReset() {
  const resetValues: FilterValues = {}
  props.filters.forEach((filter) => {
    resetValues[filter.key] = filter.type === 'checkbox' ? false : null
  })
  localValues.value = resetValues
  emit('update:modelValue', resetValues)
  emit('reset')
}

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
  emit('update:collapsed', isCollapsed.value)
}

function getFilterValue(key: string): FilterValues[string] {
  return localValues.value[key] ?? null
}

const { t } = useLocale()

defineExpose({
  apply: handleApply,
  reset: handleReset,
  values: localValues,
  hasActiveFilters,
})
</script>

<template>
  <div class="data-table-filters">
    <!-- Collapsible Header -->
    <div
      v-if="collapsible"
      class="flex items-center justify-between mb-3 cursor-pointer"
      @click="toggleCollapse"
    >
      <div class="flex items-center gap-2">
        <svg
          class="w-5 h-5 text-gray-900"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
          />
        </svg>
        <span class="text-sm font-medium text-gray-900">{{ t('search.filters') }}</span>
        <span
          v-if="hasActiveFilters"
          class="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-primary-500 rounded-full"
        >
          {{ Object.values(localValues).filter((v) => v !== null && v !== '').length }}
        </span>
      </div>
      <svg
        :class="[
          'w-5 h-5 text-gray-400 transition-transform duration-200',
          { 'rotate-180': !isCollapsed },
        ]"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>

    <!-- Filter Content -->
    <Transition name="collapse">
      <div v-show="!collapsible || !isCollapsed">
        <div :class="gridClasses">
          <!-- Filter Fields -->
          <div
            v-for="filter in filters"
            :key="filter.key"
            :class="[
              variant === 'inline' ? 'min-w-[180px] flex-1' : '',
            ]"
          >
            <label
              :for="`filter-${filter.key}`"
              class="block text-sm font-medium text-gray-900 mb-1"
            >
              {{ filter.label }}
            </label>

            <!-- Text Input -->
            <input
              v-if="filter.type === 'text'"
              :id="`filter-${filter.key}`"
              type="text"
              :value="getFilterValue(filter.key)"
              :placeholder="filter.placeholder || t('ui.search')"
              class="form-input w-full"
              :disabled="loading"
              @input="updateValue(filter.key, ($event.target as HTMLInputElement).value)"
            >

            <!-- Number Input -->
            <input
              v-else-if="filter.type === 'number'"
              :id="`filter-${filter.key}`"
              type="number"
              :value="getFilterValue(filter.key)"
              :placeholder="filter.placeholder"
              :min="filter.min"
              :max="filter.max"
              class="form-input w-full"
              :disabled="loading"
              @input="updateValue(filter.key, Number(($event.target as HTMLInputElement).value))"
            >

            <!-- Select -->
            <select
              v-else-if="filter.type === 'select'"
              :id="`filter-${filter.key}`"
              :value="getFilterValue(filter.key)"
              class="form-select w-full"
              :disabled="loading"
              @change="updateValue(filter.key, ($event.target as HTMLSelectElement).value)"
            >
              <option value="">
                {{ filter.placeholder || t('ui.all') }}
              </option>
              <option
                v-for="option in filter.options"
                :key="String(option.value)"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>

            <!-- Date Input -->
            <input
              v-else-if="filter.type === 'date'"
              :id="`filter-${filter.key}`"
              type="date"
              :value="getFilterValue(filter.key)"
              class="form-input w-full"
              :disabled="loading"
              @input="updateValue(filter.key, ($event.target as HTMLInputElement).value)"
            >

            <!-- Checkbox -->
            <div
              v-else-if="filter.type === 'checkbox'"
              class="flex items-center h-[38px]"
            >
              <input
                :id="`filter-${filter.key}`"
                type="checkbox"
                :checked="Boolean(getFilterValue(filter.key))"
                class="form-check-input"
                :disabled="loading"
                @change="updateValue(filter.key, ($event.target as HTMLInputElement).checked)"
              >
              <span class="ml-2 text-sm text-gray-900">{{ filter.placeholder }}</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div
            v-if="showApply || showReset"
            :class="[
              'flex items-end gap-2',
              variant === 'inline' ? 'flex-shrink-0' : 'mt-2',
            ]"
          >
            <button
              v-if="showApply"
              type="button"
              class="btn btn-primary"
              :disabled="loading"
              @click="handleApply"
            >
              <span
                v-if="loading"
                class="inline-flex gap-0.5 mr-2"
              >
                <span class="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span class="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span class="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
              </span>
              {{ t('ui.apply') }}
            </button>
            <button
              v-if="showReset && hasActiveFilters"
              type="button"
              class="btn btn-outline-secondary"
              :disabled="loading"
              @click="handleReset"
            >
              {{ t('ui.reset') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
