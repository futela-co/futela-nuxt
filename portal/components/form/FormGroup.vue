<script setup lang="ts">
interface Props {
  layout?: 'horizontal' | 'vertical'
  cols?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  alignItems?: 'start' | 'center' | 'end'
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'vertical',
  cols: 1,
  gap: 'md',
})

const gapClasses: Record<string, string> = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
}

const colClasses: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

const alignClasses: Record<string, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
}

const containerClasses = computed(() => {
  if (props.layout === 'horizontal') {
    return [
      'flex flex-wrap',
      gapClasses[props.gap],
      props.alignItems ? alignClasses[props.alignItems] : '',
    ]
  }

  return [
    'grid',
    colClasses[props.cols],
    gapClasses[props.gap],
    props.alignItems ? alignClasses[props.alignItems] : '',
  ]
})
</script>

<template>
  <div :class="containerClasses">
    <slot />
  </div>
</template>
