<script setup lang="ts">
interface Props {
  content?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  trigger?: 'hover' | 'click'
  delay?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  position: 'top',
  trigger: 'hover',
  delay: 200,
  disabled: false
})

const isVisible = ref(false)
const triggerRef = ref<HTMLElement>()
const tooltipRef = ref<HTMLElement>()
let timeoutId: ReturnType<typeof setTimeout> | null = null

const positionClasses = computed(() => {
  const positions: Record<string, { tooltip: string; arrow: string }> = {
    top: {
      tooltip: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
      arrow: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 border-x-transparent border-b-transparent'
    },
    bottom: {
      tooltip: 'top-full left-1/2 -translate-x-1/2 mt-2',
      arrow: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 border-x-transparent border-t-transparent'
    },
    left: {
      tooltip: 'right-full top-1/2 -translate-y-1/2 mr-2',
      arrow: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 border-y-transparent border-r-transparent'
    },
    right: {
      tooltip: 'left-full top-1/2 -translate-y-1/2 ml-2',
      arrow: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 border-y-transparent border-l-transparent'
    }
  }
  return positions[props.position]
})

function show() {
  if (props.disabled) return
  if (timeoutId) clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    isVisible.value = true
  }, props.delay)
}

function hide() {
  if (timeoutId) clearTimeout(timeoutId)
  isVisible.value = false
}

function toggle() {
  if (props.disabled) return
  isVisible.value = !isVisible.value
}

const events = computed(() => {
  if (props.trigger === 'click') {
    return { click: toggle }
  }
  return {
    mouseenter: show,
    mouseleave: hide,
    focus: show,
    blur: hide
  }
})

onUnmounted(() => {
  if (timeoutId) clearTimeout(timeoutId)
})
</script>

<template>
  <div class="relative inline-flex">
    <div
      ref="triggerRef"
      v-on="events"
    >
      <slot />
    </div>

    <Transition name="tooltip">
      <div
        v-if="isVisible && (content || $slots.content)"
        ref="tooltipRef"
        :class="[
          'tooltip absolute z-[1070] px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg whitespace-nowrap',
          positionClasses?.tooltip
        ]"
      >
        <slot name="content">
          {{ content }}
        </slot>
        <div
          :class="[
            'absolute w-0 h-0 border-4',
            positionClasses?.arrow
          ]"
        />
      </div>
    </Transition>
  </div>
</template>
