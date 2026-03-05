import { defineStore } from 'pinia'
import { propertiesApi } from '../../infrastructure/api/properties'
import type { Property, SearchFilters } from '../../domain/types/property'

export const useSearchStore = defineStore('search', () => {
  const filters = ref<SearchFilters>({})
  const results = ref<Property[]>([])
  const total = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const sortBy = ref<string>('recent')
  const viewMode = ref<'grid' | 'list'>('grid')
  const pagination = ref({
    page: 1,
    totalPages: 1,
    itemsPerPage: 20,
  })

  const hasResults = computed(() => results.value.length > 0)
  const hasActiveFilters = computed(() => {
    const f = filters.value
    return !!(f.query || f.type || f.categoryId || f.provinceId || f.cityId || f.townId || f.districtId || f.minPrice || f.maxPrice || f.bedrooms || f.bathrooms)
  })

  async function search() {
    loading.value = true
    error.value = null
    try {
      const params: Record<string, any> = { ...filters.value }
      if (sortBy.value) params.sort = sortBy.value
      params.page = pagination.value.page
      params.limit = pagination.value.itemsPerPage

      const response = await propertiesApi.search(params as SearchFilters) as any
      const items = Array.isArray(response)
        ? response
        : (response.properties ?? response.data ?? [])
      results.value = items
      total.value = Array.isArray(response) ? items.length : (response.total ?? items.length)
      pagination.value.totalPages = Array.isArray(response) ? 1 : (response.totalPages ?? response.meta?.totalPages ?? 1)
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la recherche'
      results.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  function updateFilter(key: keyof SearchFilters, value: any) {
    if (value === '' || value === null || value === undefined) {
      delete filters.value[key]
    } else {
      (filters.value as any)[key] = value
    }
    pagination.value.page = 1
  }

  function clearFilters() {
    filters.value = {}
    pagination.value.page = 1
  }

  function setSort(sort: string) {
    sortBy.value = sort
    pagination.value.page = 1
  }

  function setPage(page: number) {
    pagination.value.page = page
  }

  function syncFromRoute(query: Record<string, any>) {
    const f: SearchFilters = {}
    if (query.q) f.query = query.q as string
    if (query.category) f.type = query.category as string
    else if (query.type) f.type = query.type as string
    if (query.categoryId) f.categoryId = query.categoryId as string
    if (query.provinceId) f.provinceId = query.provinceId as string
    if (query.cityId) f.cityId = query.cityId as string
    if (query.townId) f.townId = query.townId as string
    if (query.districtId) f.districtId = query.districtId as string
    if (query.geoLabel) (f as any)._geoLabel = query.geoLabel as string
    if (query.minPrice) f.minPrice = Number(query.minPrice)
    if (query.maxPrice) f.maxPrice = Number(query.maxPrice)
    if (query.bedrooms) f.bedrooms = Number(query.bedrooms)
    if (query.bathrooms) f.bathrooms = Number(query.bathrooms)
    if (query.page) pagination.value.page = Number(query.page)
    if (query.sort) sortBy.value = query.sort as string
    filters.value = f
  }

  function buildQueryParams(): Record<string, string> {
    const params: Record<string, string> = {}
    const f = filters.value
    if (f.query) params.q = f.query
    if (f.type) params.category = f.type
    if (f.categoryId) params.categoryId = f.categoryId
    if (f.provinceId) params.provinceId = f.provinceId
    if (f.cityId) params.cityId = f.cityId
    if (f.townId) params.townId = f.townId
    if (f.districtId) params.districtId = f.districtId
    if ((f as any)._geoLabel) params.geoLabel = (f as any)._geoLabel
    if (f.minPrice) params.minPrice = String(f.minPrice)
    if (f.maxPrice) params.maxPrice = String(f.maxPrice)
    if (f.bedrooms) params.bedrooms = String(f.bedrooms)
    if (f.bathrooms) params.bathrooms = String(f.bathrooms)
    if (pagination.value.page > 1) params.page = String(pagination.value.page)
    if (sortBy.value !== 'recent') params.sort = sortBy.value
    return params
  }

  return {
    filters,
    results,
    total,
    loading,
    error,
    sortBy,
    viewMode,
    pagination,
    hasResults,
    hasActiveFilters,
    search,
    updateFilter,
    clearFilters,
    setSort,
    setPage,
    syncFromRoute,
    buildQueryParams,
  }
})
