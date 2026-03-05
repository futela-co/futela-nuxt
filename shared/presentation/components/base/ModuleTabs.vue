<script setup lang="ts">
/**
 * ModuleTabs.vue
 * Composant de tabs réutilisable avec design uniforme
 * Utilisé dans tous les modules pour la navigation par onglets
 */
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/vue/24/solid'
import { ExclamationTriangleIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

export interface TabItem {
  id: string
  label: string
  icon?: any
  /** Circled number to display instead of icon */
  number?: number
  /** Status indicator: 'completed' shows checkmark, 'pending' shows exclamation, null/undefined shows nothing */
  status?: 'completed' | 'pending' | null
  /** Optional badge count */
  badge?: number | string
  /** Disable the tab */
  disabled?: boolean
}

interface Props {
  /** Currently active tab id */
  modelValue: string
  /** Array of tab items */
  tabs: TabItem[]
  /** Enable horizontal scrolling on mobile */
  scrollable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  scrollable: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [tab: TabItem]
}>()

const navRef = ref<HTMLElement | null>(null)
const hasOverflow = ref(false)
const isAtEnd = ref(false)

const activeTab = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

function selectTab(tab: TabItem) {
  if (tab.disabled) return
  activeTab.value = tab.id
  emit('change', tab)
}

function isActive(tabId: string): boolean {
  return activeTab.value === tabId
}

function getTabClasses(tab: TabItem): string {
  // Responsive: smaller padding on mobile, normal on desktop
  const base = 'inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 pt-2 sm:pt-3 pb-1.5 sm:pb-2 text-xs sm:text-sm border-b-2 whitespace-nowrap transition-colors'

  if (tab.disabled) {
    return `${base} font-normal text-gray-400 border-transparent cursor-not-allowed`
  }

  if (isActive(tab.id)) {
    return `${base} font-medium text-primary-600 border-primary-600`
  }

  return `${base} font-normal text-gray-900 hover:text-primary-600 hover:border-gray-300 border-transparent`
}

// Check if nav has overflow content
function checkOverflow() {
  if (navRef.value) {
    hasOverflow.value = navRef.value.scrollWidth > navRef.value.clientWidth
    isAtEnd.value = navRef.value.scrollLeft + navRef.value.clientWidth >= navRef.value.scrollWidth - 5
  }
}

// Handle scroll to update arrow visibility
function handleScroll() {
  checkOverflow()
}

onMounted(() => {
  checkOverflow()
  window.addEventListener('resize', checkOverflow)
  navRef.value?.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkOverflow)
  navRef.value?.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="border-b border-gray-200 relative">
    <nav
      ref="navRef"
      class="-mb-px flex space-x-2 sm:space-x-3 scrollbar-hide pr-6 sm:pr-0"
      :class="{ 'overflow-x-auto': scrollable }"
      aria-label="Tabs"
    >
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        :class="getTabClasses(tab)"
        :disabled="tab.disabled"
        :aria-current="isActive(tab.id) ? 'page' : undefined"
        @click="selectTab(tab)"
      >
        <!-- Tab Label - always visible -->
        <span>{{ tab.label }}</span>

        <!-- Status Indicator - responsive size -->
        <CheckCircleSolidIcon
          v-if="tab.status === 'completed'"
          class="h-3 w-3 sm:h-4 sm:w-4 text-primary-600 flex-shrink-0"
        />
        <ExclamationTriangleIcon
          v-else-if="tab.status === 'pending'"
          class="h-3 w-3 sm:h-4 sm:w-4 text-red-500 flex-shrink-0"
        />

        <!-- Badge -->
        <span
          v-if="tab.badge !== undefined"
          class="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full"
          :class="isActive(tab.id) ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'"
        >
          {{ tab.badge }}
        </span>
      </button>
    </nav>

    <!-- Scroll indicator arrow - visible on mobile when there's overflow and not at end -->
    <div
      v-if="hasOverflow && !isAtEnd"
      class="absolute right-0 top-0 bottom-0 flex items-center sm:hidden pointer-events-none"
    >
      <div class="bg-gradient-to-l from-white via-white to-transparent pl-4 pr-1 h-full flex items-center">
        <ChevronRightIcon class="h-4 w-4 text-gray-400 animate-pulse" />
      </div>
    </div>
  </div>
</template>
