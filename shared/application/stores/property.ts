import { defineStore } from 'pinia'
import { propertiesApi } from '../../infrastructure/api/properties'
import type { Property } from '../../domain/types/property'

export const usePropertyStore = defineStore('property', () => {
  const properties = ref<Property[]>([])
  const nearbyProperties = ref<Property[]>([])
  const popularProperties = ref<Property[]>([])
  const recentProperties = ref<Property[]>([])
  const currentProperty = ref<Property | null>(null)
  const similarProperties = ref<Property[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    totalPages: 1,
    totalItems: 0,
  })

  async function fetchProperties(params?: Record<string, any>) {
    loading.value = true
    error.value = null
    try {
      const response = await propertiesApi.list(params)
      const items = Array.isArray(response) ? response : (response.data ?? [])
      properties.value = items
      if (!Array.isArray(response) && response.meta) {
        pagination.value = {
          page: response.meta.page,
          totalPages: response.meta.totalPages,
          totalItems: response.total,
        }
      } else {
        pagination.value = { page: 1, totalPages: 1, totalItems: items.length }
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des proprietes'
    } finally {
      loading.value = false
    }
  }

  async function fetchNearby() {
    try {
      const response = await propertiesApi.list({ sort: 'nearby', limit: 8 })
      nearbyProperties.value = Array.isArray(response) ? response : (response.data ?? [])
    } catch {
      nearbyProperties.value = []
    }
  }

  async function fetchPopular() {
    try {
      const response = await propertiesApi.list({ sort: 'popular', limit: 8 })
      popularProperties.value = Array.isArray(response) ? response : (response.data ?? [])
    } catch {
      popularProperties.value = []
    }
  }

  async function fetchRecent() {
    try {
      const response = await propertiesApi.list({ sort: 'recent', limit: 8 })
      recentProperties.value = Array.isArray(response) ? response : (response.data ?? [])
    } catch {
      recentProperties.value = []
    }
  }

  async function fetchProperty(id: string) {
    loading.value = true
    error.value = null
    try {
      currentProperty.value = await propertiesApi.get(id)
    } catch (err: any) {
      error.value = err.message || 'Propriete introuvable'
      currentProperty.value = null
    } finally {
      loading.value = false
    }
  }

  async function fetchSimilar(propertyId: string) {
    try {
      const response = await propertiesApi.list({ similar_to: propertyId, limit: 4 })
      similarProperties.value = Array.isArray(response) ? response : (response.data ?? [])
    } catch {
      similarProperties.value = []
    }
  }

  async function loadMore() {
    if (pagination.value.page >= pagination.value.totalPages) return
    const nextPage = pagination.value.page + 1
    try {
      const response = await propertiesApi.list({ page: nextPage })
      const items = Array.isArray(response) ? response : (response.data ?? [])
      properties.value.push(...items)
      pagination.value.page = nextPage
    } catch {
      // ignore
    }
  }

  return {
    properties,
    nearbyProperties,
    popularProperties,
    recentProperties,
    currentProperty,
    similarProperties,
    loading,
    error,
    pagination,
    fetchProperties,
    fetchNearby,
    fetchPopular,
    fetchRecent,
    fetchProperty,
    fetchSimilar,
    loadMore,
  }
})
