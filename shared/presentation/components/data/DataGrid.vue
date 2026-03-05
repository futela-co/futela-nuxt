<script setup lang="ts">
interface Props {
  data: Record<string, unknown>[]
  columns?: 1 | 2 | 3 | 4 | 5 | 6
  gap?: 'sm' | 'md' | 'lg'
  loading?: boolean
  skeletonCount?: number
  rowKey?: string
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: 'inbox' | 'search' | 'document' | 'users' | 'folder' | 'chart'
}

const props = withDefaults(defineProps<Props>(), {
  columns: 3,
  gap: 'md',
  loading: false,
  skeletonCount: 6,
  rowKey: 'id',
  emptyTitle: '',
  emptyDescription: '',
  emptyIcon: 'inbox',
})

const emit = defineEmits<{
  'item-click': [item: Record<string, unknown>, index: number]
}>()

const gridClasses = computed(() => {
  const colClasses: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  }
  return colClasses[props.columns]
})

const gapClasses = computed(() => {
  const gapMap: Record<string, string> = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  }
  return gapMap[props.gap]
})

const emptyIconPaths: Record<string, string> = {
  inbox: 'M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z',
  search: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z',
  document: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
  users: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
  folder: 'M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z',
  chart: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
}

function getItemKey(item: Record<string, unknown>, index: number): string | number {
  return (item[props.rowKey] as string | number) ?? index
}

const { t } = useLocale()

function handleItemClick(item: Record<string, unknown>, index: number) {
  emit('item-click', item, index)
}
</script>

<template>
  <div class="data-grid">
    <!-- Loading State -->
    <div
      v-if="loading"
      :class="['grid', gridClasses, gapClasses]"
    >
      <div
        v-for="i in skeletonCount"
        :key="`skeleton-${i}`"
        class="bg-white rounded border border-gray-200 p-4 animate-pulse"
      >
        <div class="skeleton h-32 rounded mb-4" />
        <div class="skeleton h-4 w-3/4 rounded mb-2" />
        <div class="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="data.length === 0"
      class="flex flex-col items-center justify-center py-12 px-4"
    >
      <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <svg
          class="w-8 h-8 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            :d="emptyIconPaths[emptyIcon]"
          />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-1">
        {{ emptyTitle || t('table.noData') }}
      </h3>
      <p class="text-sm text-gray-900 text-center max-w-sm">
        {{ emptyDescription || t('table.noDataDefault') }}
      </p>
      <slot name="empty-action" />
    </div>

    <!-- Data Grid -->
    <div
      v-else
      :class="['grid', gridClasses, gapClasses]"
    >
      <div
        v-for="(item, index) in data"
        :key="getItemKey(item, index)"
        class="data-grid-item"
        @click="handleItemClick(item, index)"
      >
        <slot
          :item="item"
          :index="index"
        >
          <!-- Default Card Rendering -->
          <div class="bg-white rounded border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
            <slot
              name="card-content"
              :item="item"
              :index="index"
            >
              <pre class="text-xs text-gray-900 overflow-hidden">{{ JSON.stringify(item, null, 2) }}</pre>
            </slot>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>
