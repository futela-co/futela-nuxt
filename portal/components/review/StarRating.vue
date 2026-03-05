<script setup lang="ts">
import { StarIcon } from '@heroicons/vue/24/solid'
import { StarIcon as StarOutline } from '@heroicons/vue/24/outline'

interface Props {
  modelValue?: number
  max?: number
  readonly?: boolean
  showValue?: boolean
  showCount?: boolean
  count?: number
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  max: 5,
  readonly: true,
  showValue: true,
  showCount: false,
  count: 0,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  hover: [value: number | null]
}>()

const hoverValue = ref<number | null>(null)

const displayValue = computed(() => {
  if (!props.readonly && hoverValue.value !== null) return hoverValue.value
  return props.modelValue
})

const sizeClasses = computed(() => {
  const map = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4.5 h-4.5',
    lg: 'w-6 h-6',
  }
  return map[props.size]
})

function getStarType(index: number): 'full' | 'half' | 'empty' {
  const val = displayValue.value
  if (index <= Math.floor(val)) return 'full'
  if (index === Math.ceil(val) && val % 1 >= 0.25) return 'half'
  return 'empty'
}

function handleMouseEnter(index: number) {
  if (props.readonly) return
  hoverValue.value = index
  emit('hover', index)
}

function handleMouseLeave() {
  if (props.readonly) return
  hoverValue.value = null
  emit('hover', null)
}

function handleClick(index: number) {
  if (props.readonly) return
  emit('update:modelValue', index)
}
</script>

<template>
  <div class="inline-flex items-center gap-1">
    <div
      class="flex items-center"
      :class="{ 'gap-0.5': true, 'cursor-pointer': !readonly }"
      @mouseleave="handleMouseLeave"
    >
      <button
        v-for="i in max"
        :key="i"
        type="button"
        class="focus:outline-none transition-transform"
        :class="{ 'hover:scale-110': !readonly }"
        :disabled="readonly"
        @mouseenter="handleMouseEnter(i)"
        @click="handleClick(i)"
      >
        <StarIcon
          v-if="getStarType(i) === 'full'"
          :class="sizeClasses"
          class="text-yellow-400"
        />
        <div
          v-else-if="getStarType(i) === 'half'"
          class="relative"
          :class="sizeClasses"
        >
          <StarOutline :class="sizeClasses" class="text-gray-300 absolute inset-0" />
          <div class="absolute inset-0 overflow-hidden w-1/2">
            <StarIcon :class="sizeClasses" class="text-yellow-400" />
          </div>
        </div>
        <StarOutline
          v-else
          :class="sizeClasses"
          class="text-gray-300"
        />
      </button>
    </div>
    <span
      v-if="showValue && modelValue > 0"
      class="text-sm font-medium text-gray-700 ml-1"
    >
      {{ modelValue.toFixed(1) }}
    </span>
    <span
      v-if="showCount && count > 0"
      class="text-sm text-gray-400"
    >
      ({{ count }} avis)
    </span>
  </div>
</template>
