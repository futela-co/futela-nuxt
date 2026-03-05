/**
 * Paginated response interface
 * Used by usePagination to update state from API responses
 */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  meta: {
    total: number
    page: number
    itemsPerPage: number
    totalPages: number
  }
}

export interface PaginationOptions {
  page?: number
}

export interface PaginationReturn {
  page: Ref<number>
  itemsPerPage: Ref<number>
  total: Ref<number>
  totalPages: Ref<number>
  from: ComputedRef<number>
  to: ComputedRef<number>
  hasNext: ComputedRef<boolean>
  hasPrev: ComputedRef<boolean>
  visiblePages: ComputedRef<(number | string)[]>
  nextPage: () => void
  prevPage: () => void
  goToPage: (page: number) => void
  reset: () => void
  updateFromResponse: (response: PaginatedResponse<any>) => void
}

/**
 * Composable global de pagination.
 * Ne hardcode pas itemsPerPage -- la valeur est lue depuis la reponse API via updateFromResponse().
 *
 * Usage:
 * ```ts
 * const pagination = usePagination()
 *
 * async function loadData() {
 *   const response = await api.list({ page: pagination.page.value })
 *   items.value = response.data
 *   pagination.updateFromResponse(response)
 * }
 * ```
 */
export function usePagination(options: PaginationOptions = {}): PaginationReturn {
  const page = ref(options.page ?? 1)
  const itemsPerPage = ref(0)
  const total = ref(0)
  const totalPages = ref(0)

  const from = computed(() => {
    if (total.value === 0 || itemsPerPage.value === 0) return 0
    return (page.value - 1) * itemsPerPage.value + 1
  })

  const to = computed(() => {
    if (itemsPerPage.value === 0) return total.value
    return Math.min(page.value * itemsPerPage.value, total.value)
  })

  const hasNext = computed(() => page.value < totalPages.value)
  const hasPrev = computed(() => page.value > 1)

  const visiblePages = computed<(number | string)[]>(() => {
    const current = page.value
    const tp = totalPages.value
    const delta = 2
    const pages: (number | string)[] = []

    if (tp <= 7) {
      for (let i = 1; i <= tp; i++) pages.push(i)
    } else {
      pages.push(1)
      if (current > delta + 2) pages.push('...')
      const start = Math.max(2, current - delta)
      const end = Math.min(tp - 1, current + delta)
      for (let i = start; i <= end; i++) pages.push(i)
      if (current < tp - delta - 1) pages.push('...')
      if (tp > 1) pages.push(tp)
    }
    return pages
  })

  const nextPage = () => {
    if (hasNext.value) page.value++
  }

  const prevPage = () => {
    if (hasPrev.value) page.value--
  }

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages.value && newPage !== page.value) {
      page.value = newPage
    }
  }

  const reset = () => {
    page.value = 1
  }

  /**
   * Met a jour l'etat de pagination depuis la reponse API normalisee.
   * Lit automatiquement itemsPerPage, totalPages, total et page depuis response.meta.
   */
  const updateFromResponse = (response: any) => {
    if (Array.isArray(response)) {
      total.value = response.length
      totalPages.value = 1
      return
    }
    total.value = response.total ?? 0
    if (response.meta) {
      itemsPerPage.value = response.meta.itemsPerPage ?? 0
      totalPages.value = response.meta.totalPages ?? 1
    }
  }

  return {
    page,
    itemsPerPage,
    total,
    totalPages,
    from,
    to,
    hasNext,
    hasPrev,
    visiblePages,
    nextPage,
    prevPage,
    goToPage,
    reset,
    updateFromResponse,
  }
}
