<script setup lang="ts">
interface AccordionItem {
  key: string
  title: string
  content?: string
  disabled?: boolean
}

interface Props {
  items: AccordionItem[]
  modelValue?: string | string[]
  multiple?: boolean
  bordered?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  multiple: false,
  bordered: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]]
  toggle: [key: string, isOpen: boolean]
}>()

const openItems = computed({
  get: () => {
    if (Array.isArray(props.modelValue)) {
      return props.modelValue
    }
    return props.modelValue ? [props.modelValue] : []
  },
  set: (value: string[]) => {
    if (props.multiple) {
      emit('update:modelValue', value)
    } else {
      emit('update:modelValue', value[0] || '')
    }
  }
})

function isOpen(key: string): boolean {
  return openItems.value.includes(key)
}

function toggle(item: AccordionItem) {
  if (item.disabled) return

  const key = item.key
  const currentOpen = isOpen(key)

  if (props.multiple) {
    if (currentOpen) {
      openItems.value = openItems.value.filter(k => k !== key)
    } else {
      openItems.value = [...openItems.value, key]
    }
  } else {
    openItems.value = currentOpen ? [] : [key]
  }

  emit('toggle', key, !currentOpen)
}
</script>

<template>
  <div
    :class="[
      'accordion',
      { 'border border-gray-200 rounded divide-y divide-gray-200 overflow-hidden': bordered }
    ]"
  >
    <div
      v-for="item in items"
      :key="item.key"
      class="accordion-item"
      :class="{ 'active': isOpen(item.key) }"
    >
      <!-- Header -->
      <button
        type="button"
        :disabled="item.disabled"
        class="accordion-header"
        :class="{ 'opacity-50 cursor-not-allowed': item.disabled }"
        @click="toggle(item)"
      >
        <slot
          name="header"
          :item="item"
          :is-open="isOpen(item.key)"
        >
          <span class="font-medium text-gray-900">{{ item.title }}</span>
        </slot>

        <svg
          class="accordion-icon w-5 h-5 text-gray-400 transition-transform duration-200"
          :class="{ 'rotate-180': isOpen(item.key) }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <!-- Content -->
      <Transition name="accordion">
        <div
          v-show="isOpen(item.key)"
          class="accordion-body"
        >
          <slot
            :name="item.key"
            :item="item"
          >
            <slot
              name="content"
              :item="item"
            >
              {{ item.content }}
            </slot>
          </slot>
        </div>
      </Transition>
    </div>
  </div>
</template>
