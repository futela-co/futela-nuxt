<script setup lang="ts">
export interface DateRange {
  start: string | null
  end: string | null
}

interface Props {
  modelValue?: DateRange
  startPlaceholder?: string
  endPlaceholder?: string
  disabled?: boolean
  readonly?: boolean
  error?: string
  startError?: string
  endError?: string
  id?: string
  name?: string
  size?: 'sm' | 'md' | 'lg'
  min?: string
  max?: string
  locale?: string
  clearable?: boolean
  layout?: 'horizontal' | 'vertical' | 'inline'
}

const props = withDefaults(defineProps<Props>(), {
  startPlaceholder: 'Date de debut',
  endPlaceholder: 'Date de fin',
  disabled: false,
  readonly: false,
  size: 'md',
  locale: 'fr-CD',
  clearable: true,
  layout: 'inline',
})

const emit = defineEmits<{
  'update:modelValue': [value: DateRange]
  change: [value: DateRange]
}>()

const generatedId = `daterange-${Math.random().toString(36).substring(2, 9)}`
const inputId = computed(() => props.id || generatedId)
const startInputRef = ref<HTMLInputElement | null>(null)
const endInputRef = ref<HTMLInputElement | null>(null)

const internalValue = computed<DateRange>(() => ({
  start: props.modelValue?.start || null,
  end: props.modelValue?.end || null,
}))

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-4 py-3 text-base',
}

const inputClasses = computed(() => (hasError: boolean) => [
  'block w-full rounded border transition-colors duration-200',
  'focus:outline-none focus:ring-2 focus:ring-offset-0',
  'pl-10 pr-8',
  sizeClasses[props.size],
  hasError
    ? 'border-red-500 text-red-900 placeholder-red-400 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500',
  props.disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white',
  props.readonly ? 'bg-gray-50' : '',
])

const containerClasses = computed(() => {
  switch (props.layout) {
    case 'horizontal':
      return 'flex flex-col sm:flex-row gap-3'
    case 'vertical':
      return 'flex flex-col gap-3'
    case 'inline':
    default:
      return 'flex items-center gap-2'
  }
})

const fieldClasses = computed(() => {
  switch (props.layout) {
    case 'horizontal':
      return 'flex-1 min-w-0'
    case 'vertical':
      return 'w-full'
    case 'inline':
    default:
      return 'flex-1 min-w-0'
  }
})

const computedMinEnd = computed(() => {
  if (internalValue.value.start) {
    return internalValue.value.start
  }
  return props.min
})

const computedMaxStart = computed(() => {
  if (internalValue.value.end) {
    return internalValue.value.end
  }
  return props.max
})

function updateStart(event: Event) {
  const target = event.target as HTMLInputElement
  const newValue: DateRange = {
    start: target.value || null,
    end: internalValue.value.end,
  }
  emit('update:modelValue', newValue)
  emit('change', newValue)
}

function updateEnd(event: Event) {
  const target = event.target as HTMLInputElement
  const newValue: DateRange = {
    start: internalValue.value.start,
    end: target.value || null,
  }
  emit('update:modelValue', newValue)
  emit('change', newValue)
}

function clearDates() {
  const newValue: DateRange = { start: null, end: null }
  emit('update:modelValue', newValue)
  emit('change', newValue)
}
</script>

<template>
  <div class="w-full">
    <div :class="containerClasses">
      <div :class="fieldClasses">
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
            :id="`${inputId}-start`"
            ref="startInputRef"
            type="date"
            :value="internalValue.start || ''"
            :placeholder="startPlaceholder"
            :disabled="disabled"
            :readonly="readonly"
            :name="name ? `${name}_start` : undefined"
            :min="min"
            :max="computedMaxStart"
            :class="inputClasses(!!startError || !!error)"
            :aria-invalid="!!startError || !!error"
            :aria-label="startPlaceholder"
            @input="updateStart"
          >
        </div>

        <p
          v-if="startError"
          class="mt-1 text-xs text-red-500"
        >
          {{ startError }}
        </p>
      </div>

      <div
        v-if="layout === 'inline'"
        class="flex-shrink-0 text-gray-400"
      >
        <svg
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
            clip-rule="evenodd"
          />
        </svg>
      </div>

      <div :class="fieldClasses">
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
            :id="`${inputId}-end`"
            ref="endInputRef"
            type="date"
            :value="internalValue.end || ''"
            :placeholder="endPlaceholder"
            :disabled="disabled"
            :readonly="readonly"
            :name="name ? `${name}_end` : undefined"
            :min="computedMinEnd"
            :max="max"
            :class="inputClasses(!!endError || !!error)"
            :aria-invalid="!!endError || !!error"
            :aria-label="endPlaceholder"
            @input="updateEnd"
          >
        </div>

        <p
          v-if="endError"
          class="mt-1 text-xs text-red-500"
        >
          {{ endError }}
        </p>
      </div>

      <button
        v-if="clearable && (internalValue.start || internalValue.end) && !disabled && !readonly"
        type="button"
        class="flex-shrink-0 p-2 text-gray-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
        @click="clearDates"
      >
        <svg
          class="h-5 w-5"
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
    </div>

    <p
      v-if="error"
      class="mt-1.5 text-xs text-red-500"
    >
      {{ error }}
    </p>
  </div>
</template>
