<script setup lang="ts">
interface Props {
  title?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  bordered?: boolean
  hoverable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  padding: 'md',
  shadow: 'sm',
  bordered: true,
  hoverable: false,
})

const slots = useSlots()

const paddingClasses: Record<string, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
}

const shadowClasses: Record<string, string> = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
}

const cardClasses = computed(() => [
  'bg-white rounded-xl',
  shadowClasses[props.shadow],
  props.bordered ? 'border border-gray-200' : '',
  props.hoverable ? 'transition-shadow duration-200 hover:shadow-lg' : '',
])

const bodyPaddingClasses = computed(() => {
  if (props.title || slots.header) {
    return paddingClasses[props.padding]
  }
  return paddingClasses[props.padding]
})
</script>

<script lang="ts">
export default {
  name: 'BaseCard',
}
</script>

<template>
  <div :class="cardClasses">
    <div
      v-if="title || $slots.header"
      class="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200"
    >
      <slot name="header">
        <h3 class="text-base font-semibold text-gray-900">
          {{ title }}
        </h3>
      </slot>
    </div>

    <div :class="bodyPaddingClasses">
      <slot />
    </div>

    <div
      v-if="$slots.footer"
      class="px-4 py-3 sm:px-6 sm:py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
