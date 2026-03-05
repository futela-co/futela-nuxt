<script setup lang="ts">
interface Props {
  type?: 'text' | 'title' | 'avatar' | 'image' | 'button' | 'card' | 'table-row'
  width?: string
  height?: string
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  count?: number
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  width: '',
  height: '',
  rounded: 'md',
  count: 1,
  animated: true
})

const roundedClasses = computed(() => {
  const classes: Record<string, string> = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded',
    lg: 'rounded',
    full: 'rounded-full'
  }
  return classes[props.rounded]
})

const typeClasses = computed(() => {
  const types: Record<string, string> = {
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    avatar: 'w-10 h-10 rounded-full',
    image: 'w-full aspect-video',
    button: 'h-8 w-24',
    card: 'w-full h-32',
    'table-row': 'h-12 w-full'
  }
  return types[props.type]
})

const customStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.width) style.width = props.width
  if (props.height) style.height = props.height
  return style
})
</script>

<template>
  <div class="space-y-2">
    <div
      v-for="i in count"
      :key="i"
      :class="[
        'skeleton bg-gray-200',
        roundedClasses,
        typeClasses,
        { 'animate-pulse': animated }
      ]"
      :style="customStyle"
    />
  </div>
</template>
