<script setup lang="ts">
interface Props {
  title?: string
  description?: string
  collapsible?: boolean
  defaultOpen?: boolean
  bordered?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  collapsible: false,
  defaultOpen: true,
  bordered: false,
  padding: 'md',
})

const emit = defineEmits<{
  toggle: [isOpen: boolean]
}>()

const isOpen = ref(props.defaultOpen)

const paddingClasses: Record<string, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

const containerClasses = computed(() => [
  'w-full',
  props.bordered ? 'border border-gray-200 rounded' : '',
])

const headerClasses = computed(() => [
  'flex items-start justify-between',
  props.bordered ? 'px-4 py-3 border-b border-gray-200' : 'pb-4',
  props.collapsible && !props.bordered ? '' : '',
])

const contentClasses = computed(() => [
  props.bordered ? paddingClasses[props.padding] : '',
])

function toggleSection() {
  if (props.collapsible) {
    isOpen.value = !isOpen.value
    emit('toggle', isOpen.value)
  }
}
</script>

<template>
  <div :class="containerClasses">
    <div
      v-if="title || description || $slots.header"
      :class="headerClasses"
      :role="collapsible ? 'button' : undefined"
      :tabindex="collapsible ? 0 : undefined"
      :aria-expanded="collapsible ? isOpen : undefined"
      @click="toggleSection"
      @keydown.enter="toggleSection"
      @keydown.space.prevent="toggleSection"
    >
      <div class="flex-1 min-w-0">
        <slot name="header">
          <h3
            v-if="title"
            class="text-base font-semibold text-gray-900"
          >
            {{ title }}
          </h3>
          <p
            v-if="description"
            class="mt-1 text-sm text-gray-900"
          >
            {{ description }}
          </p>
        </slot>
      </div>

      <button
        v-if="collapsible"
        type="button"
        class="ml-4 flex-shrink-0 p-1 text-gray-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
        :aria-label="isOpen ? 'Reduire la section' : 'Etendre la section'"
      >
        <svg
          class="h-5 w-5 transition-transform duration-200"
          :class="{ '-rotate-180': isOpen }"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-show="!collapsible || isOpen"
        :class="contentClasses"
      >
        <slot />
      </div>
    </Transition>
  </div>
</template>
