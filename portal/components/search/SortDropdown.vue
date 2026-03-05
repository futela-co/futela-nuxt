<script setup lang="ts">
import { ChevronDownIcon } from '@heroicons/vue/24/outline'
import { onClickOutside } from '@vueuse/core'

interface Props {
  modelValue: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { t } = useLocale()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

onClickOutside(dropdownRef, () => {
  isOpen.value = false
})

const options = computed(() => [
  { value: 'recent', label: t('sort.recent') },
  { value: 'price_asc', label: t('sort.priceAsc') },
  { value: 'price_desc', label: t('sort.priceDesc') },
  { value: 'rating', label: t('sort.bestRating') },
  { value: 'popular', label: t('sort.popular') },
])

const currentLabel = computed(() => {
  return options.value.find(o => o.value === props.modelValue)?.label ?? t('sort.sortBy')
})

function selectOption(value: string) {
  emit('update:modelValue', value)
  isOpen.value = false
}
</script>

<template>
  <div
    ref="dropdownRef"
    class="relative"
  >
    <button
      class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      @click="isOpen = !isOpen"
    >
      <span>{{ currentLabel }}</span>
      <ChevronDownIcon
        class="w-4 h-4 transition-transform"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20"
      >
        <button
          v-for="option in options"
          :key="option.value"
          class="w-full text-left px-4 py-2.5 text-sm transition-colors"
          :class="option.value === modelValue
            ? 'bg-primary-50 text-primary-700 font-medium'
            : 'text-gray-700 hover:bg-gray-50'"
          @click="selectOption(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </Transition>
  </div>
</template>
