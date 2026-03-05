<script setup lang="ts">
export interface DataTableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  headerClass?: string
  cellClass?: string
  visible?: boolean
}

export interface SortState {
  column: string
  direction: 'asc' | 'desc'
}

interface Props {
  columns: DataTableColumn[]
  data: Record<string, unknown>[]
  loading?: boolean
  sortable?: boolean
  selectable?: boolean
  pagination?: boolean
  currentPage?: number
  perPage?: number
  totalItems?: number
  rowKey?: string
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: 'inbox' | 'search' | 'document' | 'users' | 'folder' | 'chart' | 'error'
  striped?: boolean
  hoverable?: boolean
  compact?: boolean
  bordered?: boolean
  stickyHeader?: boolean
  showTotalCount?: boolean
  initialSort?: SortState
}

const { t } = useLocale()

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  sortable: false,
  selectable: false,
  pagination: false,
  currentPage: 1,
  perPage: 10,
  totalItems: 0,
  rowKey: 'id',
  emptyTitle: '',
  emptyDescription: '',
  emptyIcon: 'inbox',
  striped: true,
  hoverable: true,
  compact: false,
  bordered: false,
  stickyHeader: false,
  showTotalCount: true,
  initialSort: undefined,
})

const emit = defineEmits<{
  sort: [sortState: SortState]
  select: [selectedRows: Record<string, unknown>[]]
  'page-change': [page: number]
  'per-page-change': [perPage: number]
  'row-click': [row: Record<string, unknown>, index: number]
}>()

const sortState = ref<SortState | null>(props.initialSort || null)
const selectedRowKeys = ref<Set<string | number>>(new Set())

// Visible columns filter
const visibleColumns = computed(() => {
  return props.columns.filter(col => col.visible !== false)
})

const totalPages = computed(() => {
  if (props.totalItems > 0) {
    return Math.ceil(props.totalItems / props.perPage)
  }
  return Math.ceil(props.data.length / props.perPage)
})

const totalCount = computed(() => {
  return props.totalItems > 0 ? props.totalItems : props.data.length
})

const displayData = computed(() => {
  if (props.pagination && props.totalItems === 0) {
    const start = (props.currentPage - 1) * props.perPage
    const end = start + props.perPage
    return props.data.slice(start, end)
  }
  return props.data
})

const allSelected = computed(() => {
  if (displayData.value.length === 0) return false
  return displayData.value.every(row => selectedRowKeys.value.has(getRowKey(row)))
})

const someSelected = computed(() => {
  if (displayData.value.length === 0) return false
  const selectedCount = displayData.value.filter(row => selectedRowKeys.value.has(getRowKey(row))).length
  return selectedCount > 0 && selectedCount < displayData.value.length
})

const selectedRows = computed(() => {
  return props.data.filter(row => selectedRowKeys.value.has(getRowKey(row)))
})

function getRowKey(row: Record<string, unknown>): string | number {
  return row[props.rowKey] as string | number
}

function handleSort(column: DataTableColumn) {
  if (!props.sortable || !column.sortable) return

  let direction: 'asc' | 'desc' = 'asc'

  if (sortState.value?.column === column.key) {
    direction = sortState.value.direction === 'asc' ? 'desc' : 'asc'
  }

  sortState.value = { column: column.key, direction }
  emit('sort', sortState.value)
}

function getSortClass(column: DataTableColumn): string {
  if (!props.sortable || !column.sortable) return ''
  if (sortState.value?.column !== column.key) return 'sortable'
  return sortState.value.direction === 'asc' ? 'sortable sorted-asc' : 'sortable sorted-desc'
}

function getSortDirection(column: DataTableColumn): 'asc' | 'desc' | null {
  if (sortState.value?.column !== column.key) return null
  return sortState.value.direction
}

function isSortable(column: DataTableColumn): boolean {
  return props.sortable && !!column.sortable
}

function toggleSelectAll() {
  if (allSelected.value) {
    displayData.value.forEach(row => {
      selectedRowKeys.value.delete(getRowKey(row))
    })
  } else {
    displayData.value.forEach(row => {
      selectedRowKeys.value.add(getRowKey(row))
    })
  }
  emit('select', selectedRows.value)
}

function toggleRowSelection(row: Record<string, unknown>) {
  const key = getRowKey(row)
  if (selectedRowKeys.value.has(key)) {
    selectedRowKeys.value.delete(key)
  } else {
    selectedRowKeys.value.add(key)
  }
  emit('select', selectedRows.value)
}

function isRowSelected(row: Record<string, unknown>): boolean {
  return selectedRowKeys.value.has(getRowKey(row))
}

function handlePageChange(page: number) {
  emit('page-change', page)
}

function handleRowClick(row: Record<string, unknown>, index: number) {
  emit('row-click', row, index)
}

function getAlignClass(align?: 'left' | 'center' | 'right'): string {
  const classes: Record<string, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }
  return classes[align || 'left'] ?? 'text-left'
}

function clearSelection() {
  selectedRowKeys.value.clear()
  emit('select', [])
}

function resetSort() {
  sortState.value = null
}

defineExpose({
  selectedRows,
  clearSelection,
  sortState,
  resetSort,
  totalCount,
})
</script>

<template>
  <div class="data-table-wrapper">
    <!-- Total Count Header -->
    <div
      v-if="showTotalCount && !loading && totalCount > 0"
      class="px-4 py-3 border-b border-gray-200 bg-gray-50/50"
    >
      <p class="text-xs text-gray-900">
        <span class="font-medium">{{ totalCount }}</span>
        {{ totalCount === 1 ? t('table.result') : t('table.results') }}
        <template v-if="selectedRowKeys.size > 0">
          <span class="mx-2 text-gray-300">|</span>
          <span class="text-primary-600 font-medium">{{ selectedRowKeys.size }} {{ t('table.selected') }}</span>
        </template>
      </p>
    </div>

    <!-- Table Container -->
    <div class="overflow-x-auto">
      <table
        :class="[
          'data-table w-full',
          { 'data-table-compact': compact },
          { 'data-table-bordered': bordered }
        ]"
      >
        <!-- Header -->
        <thead :class="{ 'sticky top-0 z-10 bg-white': stickyHeader }">
          <tr>
            <!-- Selection Column -->
            <th
              v-if="selectable"
              class="w-10"
            >
              <input
                type="checkbox"
                :checked="allSelected"
                :indeterminate="someSelected"
                class="form-check-input"
                @change="toggleSelectAll"
              >
            </th>

            <!-- Data Columns -->
            <th
              v-for="column in visibleColumns"
              :key="column.key"
              :style="column.width ? { width: column.width } : {}"
              :class="[
                getSortClass(column),
                getAlignClass(column.align),
                column.headerClass,
                { 'cursor-pointer select-none hover:bg-gray-100 transition-colors': isSortable(column) }
              ]"
              @click="handleSort(column)"
            >
              <div
                class="flex items-center gap-1.5"
                :class="{ 'justify-center': column.align === 'center', 'justify-end': column.align === 'right' }"
              >
                <slot
                  :name="`header-${column.key}`"
                  :column="column"
                >
                  <span>{{ column.label }}</span>
                </slot>
                <!-- Sort Icon -->
                <span
                  v-if="isSortable(column)"
                  class="inline-flex flex-col items-center"
                >
                  <svg
                    v-if="getSortDirection(column) === null"
                    class="w-4 h-4 text-gray-300"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M8 9l4-4 4 4M16 15l-4 4-4-4"
                    />
                  </svg>
                  <svg
                    v-else-if="getSortDirection(column) === 'asc'"
                    class="w-4 h-4 text-primary-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M8 15l4-4 4 4"
                    />
                  </svg>
                  <svg
                    v-else
                    class="w-4 h-4 text-primary-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M16 9l-4 4-4-4"
                    />
                  </svg>
                </span>
              </div>
            </th>
          </tr>
        </thead>

        <!-- Body -->
        <tbody class="divide-y divide-gray-200">
          <!-- Loading State -->
          <template v-if="loading">
            <tr
              v-for="i in Math.min(perPage, 5)"
              :key="`skeleton-${i}`"
              class="animate-pulse"
            >
              <td v-if="selectable">
                <div class="h-4 w-4 bg-gray-200 rounded" />
              </td>
              <td
                v-for="column in visibleColumns"
                :key="`skeleton-${i}-${column.key}`"
              >
                <div
                  class="h-4 bg-gray-200 rounded"
                  :style="{ width: `${50 + (i * 7) % 40}%` }"
                />
              </td>
            </tr>
          </template>

          <!-- Empty State -->
          <template v-else-if="displayData.length === 0">
            <tr>
              <td :colspan="selectable ? visibleColumns.length + 1 : visibleColumns.length">
                <slot name="empty">
                  <BaseEmpty
                    :title="emptyTitle || t('table.noData')"
                    :description="emptyDescription || t('table.noDataDefault')"
                    :icon="emptyIcon"
                    size="sm"
                  >
                    <slot name="empty-action" />
                  </BaseEmpty>
                </slot>
              </td>
            </tr>
          </template>

          <!-- Data Rows -->
          <template v-else>
            <tr
              v-for="(row, index) in displayData"
              :key="getRowKey(row)"
              :class="[
                { 'row-active bg-primary-50': isRowSelected(row) },
                { 'cursor-pointer': $attrs.onRowClick },
                { 'hover:bg-gray-50': hoverable && !isRowSelected(row) },
                { 'bg-gray-50/50': striped && index % 2 === 1 && !isRowSelected(row) }
              ]"
              @click="handleRowClick(row, index)"
            >
              <!-- Selection Cell -->
              <td
                v-if="selectable"
                @click.stop
              >
                <input
                  type="checkbox"
                  :checked="isRowSelected(row)"
                  class="form-check-input"
                  @change="toggleRowSelection(row)"
                >
              </td>

              <!-- Data Cells -->
              <td
                v-for="column in visibleColumns"
                :key="`${getRowKey(row)}-${column.key}`"
                :class="[getAlignClass(column.align), column.cellClass]"
              >
                <slot
                  :name="`cell-${column.key}`"
                  :value="row[column.key]"
                  :row="row"
                  :column="column"
                  :index="index"
                >
                  {{ row[column.key] ?? '-' }}
                </slot>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <BasePagination
      v-if="pagination && !loading && displayData.length > 0"
      :current-page="currentPage"
      :total-pages="totalPages"
      :per-page="perPage"
      :total-items="totalItems > 0 ? totalItems : data.length"
      @update:current-page="handlePageChange"
      @update:per-page="(v: number) => emit('per-page-change', v)"
    />

    <!-- Selection Info -->
    <div
      v-if="selectable && selectedRowKeys.size > 0"
      class="mt-3 px-4 py-2 bg-primary-50 rounded flex items-center justify-between"
    >
      <span class="text-xs text-primary-700">
        {{ selectedRowKeys.size }} {{ t('table.elementsSelected') }}
      </span>
      <button
        type="button"
        class="text-xs text-primary-600 hover:text-primary-800 font-medium"
        @click="clearSelection"
      >
        {{ t('table.clearSelection') }}
      </button>
    </div>
  </div>
</template>
