/**
 * Filter value type
 */
export type FilterValue = string | number | boolean | null | undefined | (string | number)[]

/**
 * Filters object type
 */
export type Filters = Record<string, FilterValue>

/**
 * Filter options interface
 */
export interface FilterOptions<T extends Filters = Filters> {
  /** Initial filter values */
  initialFilters?: T
  /** Sync filters with URL query params */
  syncWithUrl?: boolean
  /** Debounce URL sync in milliseconds */
  urlDebounce?: number
  /** Keys to exclude from URL sync */
  excludeFromUrl?: (keyof T)[]
  /** Callback when filters change */
  onFilterChange?: (filters: T) => void
}

/**
 * Filter management composable
 * Provides reactive filter state with URL sync support
 *
 * @example
 * ```ts
 * // Basic usage
 * const { filters, setFilter, clearAll } = useFilters({
 *   initialFilters: { status: 'active', category: null }
 * })
 *
 * // With URL sync
 * const { filters, applyFilters } = useFilters({
 *   initialFilters: { search: '', page: 1 },
 *   syncWithUrl: true
 * })
 *
 * // Apply filters to data
 * const filteredData = applyFilters(data, {
 *   status: (item, value) => item.status === value,
 *   category: (item, value) => item.categoryId === value
 * })
 * ```
 */
export function useFilters<T extends Filters = Filters>(options: FilterOptions<T> = {}) {
  const {
    initialFilters = {} as T,
    syncWithUrl = false,
    urlDebounce = 300,
    excludeFromUrl = [],
    onFilterChange
  } = options

  const route = useRoute()

  /**
   * Reactive filters object
   */
  const filters = reactive<T>({ ...initialFilters }) as T

  /**
   * URL sync debounce timeout
   */
  let urlSyncTimeout: ReturnType<typeof setTimeout> | null = null

  /**
   * Initialize filters from URL if syncWithUrl is enabled
   */
  function initFromUrl() {
    if (!syncWithUrl || typeof window === "undefined") return

    const query = route.query

    for (const key of Object.keys(initialFilters) as (keyof T)[]) {
      if (excludeFromUrl.includes(key)) continue

      const urlValue = query[key as string]

      if (urlValue !== undefined) {
        // Parse value based on initial filter type
        const initialValue = initialFilters[key]

        if (typeof initialValue === 'number') {
          (filters as Record<string, FilterValue>)[key as string] = Number(urlValue)
        } else if (typeof initialValue === 'boolean') {
          (filters as Record<string, FilterValue>)[key as string] = urlValue === 'true'
        } else if (Array.isArray(initialValue)) {
          const arrayValue = Array.isArray(urlValue) ? urlValue : [urlValue]
          ;(filters as Record<string, FilterValue>)[key as string] = arrayValue.filter((v): v is string => v !== null)
        } else {
          (filters as Record<string, FilterValue>)[key as string] = urlValue as string
        }
      }
    }
  }

  /**
   * Sync filters to URL
   */
  function syncToUrl() {
    if (!syncWithUrl || typeof window === "undefined") return

    // Clear existing timeout
    if (urlSyncTimeout) {
      clearTimeout(urlSyncTimeout)
    }

    urlSyncTimeout = setTimeout(() => {
      const query: Record<string, string | string[]> = {}

      for (const key of Object.keys(filters) as (keyof T)[]) {
        if (excludeFromUrl.includes(key)) continue

        const value = filters[key]

        // Only add non-empty values to URL
        if (value !== null && value !== undefined && value !== '' &&
          !(Array.isArray(value) && value.length === 0)) {
          if (Array.isArray(value)) {
            query[key as string] = value.map(String)
          } else {
            query[key as string] = String(value)
          }
        }
      }

      // Update URL without triggering navigation
      navigateTo({ query }, { replace: true })
    }, urlDebounce)
  }

  /**
   * Set a single filter value
   */
  function setFilter<K extends keyof T>(key: K, value: T[K]) {
    (filters as Record<string, FilterValue>)[key as string] = value
  }

  /**
   * Set multiple filter values
   */
  function setFilters(newFilters: Partial<T>) {
    for (const [key, value] of Object.entries(newFilters)) {
      (filters as Record<string, FilterValue>)[key] = value
    }
  }

  /**
   * Clear a single filter (reset to initial value)
   */
  function clearFilter<K extends keyof T>(key: K) {
    (filters as Record<string, FilterValue>)[key as string] = initialFilters[key]
  }

  /**
   * Clear all filters (reset to initial values)
   */
  function clearAll() {
    for (const key of Object.keys(initialFilters) as (keyof T)[]) {
      (filters as Record<string, FilterValue>)[key as string] = initialFilters[key]
    }
  }

  /**
   * Check if a filter has a value (not empty/null/undefined)
   */
  function hasFilter<K extends keyof T>(key: K): boolean {
    const value = filters[key]

    if (value === null || value === undefined || value === '') {
      return false
    }

    if (Array.isArray(value) && value.length === 0) {
      return false
    }

    return true
  }

  /**
   * Get count of active filters
   */
  const activeFilterCount = computed(() => {
    let count = 0

    for (const key of Object.keys(filters) as (keyof T)[]) {
      if (hasFilter(key)) {
        // Don't count if value equals initial value
        if (filters[key] !== initialFilters[key]) {
          count++
        }
      }
    }

    return count
  })

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = computed(() => activeFilterCount.value > 0)

  /**
   * Get filter value
   */
  function getFilter<K extends keyof T>(key: K): T[K] {
    return filters[key]
  }

  /**
   * Toggle a boolean filter
   */
  function toggleFilter<K extends keyof T>(key: K) {
    const currentValue = filters[key]

    if (typeof currentValue === 'boolean') {
      (filters as Record<string, FilterValue>)[key as string] = !currentValue
    }
  }

  /**
   * Add value to array filter
   */
  function addToFilter<K extends keyof T>(key: K, value: string | number) {
    const currentValue = filters[key]

    if (Array.isArray(currentValue)) {
      if (!currentValue.includes(value)) {
        (filters as Record<string, FilterValue>)[key as string] = [...currentValue, value]
      }
    }
  }

  /**
   * Remove value from array filter
   */
  function removeFromFilter<K extends keyof T>(key: K, value: string | number) {
    const currentValue = filters[key]

    if (Array.isArray(currentValue)) {
      (filters as Record<string, FilterValue>)[key as string] = currentValue.filter(
        (v) => v !== value
      )
    }
  }

  /**
   * Apply filters to data array
   * @param data - Array of items to filter
   * @param filterFns - Object mapping filter keys to filter functions
   * @returns Filtered array
   */
  function applyFilters<D>(
    data: D[],
    filterFns: Partial<Record<keyof T, (item: D, value: FilterValue) => boolean>>
  ): D[] {
    return data.filter((item) => {
      for (const key of Object.keys(filterFns) as (keyof T)[]) {
        const filterFn = filterFns[key]
        const value = filters[key]

        // Skip empty filters
        if (!hasFilter(key)) continue

        // Apply filter function
        if (filterFn && !filterFn(item, value)) {
          return false
        }
      }

      return true
    })
  }

  /**
   * Get filters as query object (for API requests)
   */
  function toQueryParams(): Record<string, string | string[]> {
    const params: Record<string, string | string[]> = {}

    for (const key of Object.keys(filters) as (keyof T)[]) {
      const value = filters[key]

      if (value !== null && value !== undefined && value !== '' &&
        !(Array.isArray(value) && value.length === 0)) {
        if (Array.isArray(value)) {
          params[key as string] = value.map(String)
        } else {
          params[key as string] = String(value)
        }
      }
    }

    return params
  }

  // Initialize from URL on mount
  if (typeof window !== "undefined") {
    initFromUrl()
  }

  // Watch for filter changes
  watch(
    () => ({ ...filters }),
    (newFilters) => {
      // Call onChange callback
      if (onFilterChange) {
        onFilterChange(newFilters as T)
      }

      // Sync to URL
      if (syncWithUrl) {
        syncToUrl()
      }
    },
    { deep: true }
  )

  // Cleanup
  onUnmounted(() => {
    if (urlSyncTimeout) {
      clearTimeout(urlSyncTimeout)
    }
  })

  return {
    // State
    filters,
    activeFilterCount,
    hasActiveFilters,

    // Methods
    setFilter,
    setFilters,
    clearFilter,
    clearAll,
    hasFilter,
    getFilter,
    toggleFilter,
    addToFilter,
    removeFromFilter,
    applyFilters,
    toQueryParams,
    initFromUrl
  }
}

/**
 * Type alias for useFilters return type
 */
export type FiltersComposable<T extends Filters = Filters> = ReturnType<typeof useFilters<T>>
