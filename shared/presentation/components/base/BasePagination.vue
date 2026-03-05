<script setup lang="ts">
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/vue/24/outline'

interface Props {
  currentPage: number
  totalPages: number
  perPage?: number
  totalItems?: number
  perPageOptions?: number[]
  siblingCount?: number
  showInfo?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  perPage: 10,
  totalItems: 0,
  perPageOptions: () => [10, 25, 50, 100],
  siblingCount: 1,
  showInfo: true,
})

const emit = defineEmits<{
  'update:currentPage': [page: number]
  'update:perPage': [perPage: number]
}>()

const { t } = useLocale()

const pages = computed(() => {
  const { currentPage, totalPages, siblingCount } = props
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const result: (number | string)[] = []
  result.push(1)

  const leftSibling = Math.max(2, currentPage - siblingCount)
  const rightSibling = Math.min(totalPages - 1, currentPage + siblingCount)

  if (leftSibling > 2) result.push('...')
  for (let i = leftSibling; i <= rightSibling; i++) result.push(i)
  if (rightSibling < totalPages - 1) result.push('...')
  if (totalPages > 1) result.push(totalPages)

  return result
})

const startItem = computed(() => {
  if (props.totalItems === 0) return 0
  return (props.currentPage - 1) * props.perPage + 1
})

const endItem = computed(() => {
  return Math.min(props.currentPage * props.perPage, props.totalItems)
})

const canGoPrevious = computed(() => props.currentPage > 1)
const canGoNext = computed(() => props.currentPage < props.totalPages)

function goToPage(page: number) {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('update:currentPage', page)
  }
}

function changePerPage(event: Event) {
  const value = Number((event.target as HTMLSelectElement).value)
  emit('update:perPage', value)
}
</script>

<template>
  <div class="px-3 py-1.5 flex items-center justify-between border-t border-gray-200">
    <!-- Mobile pagination -->
    <div class="flex-1 flex justify-between md:hidden">
      <button
        :disabled="!canGoPrevious"
        class="btn btn-outline-secondary btn-sm"
        @click="goToPage(currentPage - 1)"
      >
        {{ t('table.previous') }}
      </button>
      <span class="inline-flex items-center px-3 text-xs text-gray-900">{{ currentPage }} / {{ totalPages }}</span>
      <button
        :disabled="!canGoNext"
        class="btn btn-outline-secondary btn-sm"
        @click="goToPage(currentPage + 1)"
      >
        {{ t('table.next') }}
      </button>
    </div>

    <!-- Desktop pagination -->
    <div class="hidden md:flex-1 md:flex md:items-center md:justify-between">
      <div class="flex items-center gap-3">
        <p
          v-if="showInfo && totalItems > 0"
          class="text-xs text-gray-900"
        >
          {{ t('table.showingFrom') }}
          <span class="font-medium">{{ startItem }}</span>
          {{ t('table.to') }}
          <span class="font-medium">{{ endItem }}</span>
          {{ t('ui.of') }}
          <span class="font-medium">{{ totalItems }}</span>
          {{ t('table.results') }}
        </p>
        <select
          :value="perPage"
          class="text-xs border border-gray-300 rounded px-1.5 py-0.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
          @change="changePerPage"
        >
          <option
            v-for="opt in perPageOptions"
            :key="opt"
            :value="opt"
          >
            {{ opt }} / page
          </option>
        </select>
      </div>

      <nav
        v-if="totalPages > 1"
        class="isolate inline-flex gap-1"
        aria-label="Pagination"
      >
        <button
          :disabled="currentPage === 1"
          class="btn btn-outline-primary px-2 py-1 text-xs"
          :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
          @click="goToPage(1)"
        >
          <ChevronDoubleLeftIcon class="h-3.5 w-3.5" />
        </button>
        <button
          :disabled="!canGoPrevious"
          class="btn btn-outline-primary px-2 py-1 text-xs"
          :class="{ 'opacity-50 cursor-not-allowed': !canGoPrevious }"
          @click="goToPage(currentPage - 1)"
        >
          <ChevronLeftIcon class="h-3.5 w-3.5" />
        </button>
        <template
          v-for="(page, idx) in pages"
          :key="idx"
        >
          <span
            v-if="page === '...'"
            class="inline-flex items-center px-2.5 py-1 text-xs font-medium text-gray-900"
          >...</span>
          <button
            v-else
            :class="[page === currentPage ? 'btn btn-primary px-2.5 py-1 text-xs' : 'btn btn-outline-primary px-2.5 py-1 text-xs']"
            @click="goToPage(page as number)"
          >
            {{ page }}
          </button>
        </template>
        <button
          :disabled="!canGoNext"
          class="btn btn-outline-primary px-2 py-1 text-xs"
          :class="{ 'opacity-50 cursor-not-allowed': !canGoNext }"
          @click="goToPage(currentPage + 1)"
        >
          <ChevronRightIcon class="h-3.5 w-3.5" />
        </button>
        <button
          :disabled="currentPage === totalPages"
          class="btn btn-outline-primary px-2 py-1 text-xs"
          :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }"
          @click="goToPage(totalPages)"
        >
          <ChevronDoubleRightIcon class="h-3.5 w-3.5" />
        </button>
      </nav>
    </div>
  </div>
</template>
