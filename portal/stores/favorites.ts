import { defineStore } from 'pinia'
import { favoritesApi } from '~/infrastructure/api/favorites'
import { useAuthStore } from '~/stores/auth'

export const useFavoritesStore = defineStore('favorites', () => {
  const favoriteIds = ref<Set<string>>(new Set())
  const loading = ref(false)
  const toggling = ref<Set<string>>(new Set())

  async function fetchFavorites() {
    const auth = useAuthStore()
    if (!auth.isAuthenticated) return

    loading.value = true
    try {
      const response = await favoritesApi.list({ limit: 100 })
      const items = Array.isArray(response) ? response : (response.data ?? [])
      favoriteIds.value = new Set(items.map((p: any) => p.id))
    } catch {
      // ignore
    } finally {
      loading.value = false
    }
  }

  function isFavorite(propertyId: string): boolean {
    return favoriteIds.value.has(propertyId)
  }

  async function toggleFavorite(propertyId: string) {
    const auth = useAuthStore()
    if (!auth.isAuthenticated) return false

    if (toggling.value.has(propertyId)) return false
    toggling.value.add(propertyId)

    const wasFavorite = favoriteIds.value.has(propertyId)

    // Optimistic update
    if (wasFavorite) {
      favoriteIds.value.delete(propertyId)
    } else {
      favoriteIds.value.add(propertyId)
    }
    // Force reactivity
    favoriteIds.value = new Set(favoriteIds.value)

    try {
      if (wasFavorite) {
        await favoritesApi.remove(propertyId)
      } else {
        await favoritesApi.add(propertyId)
      }
      return true
    } catch {
      // Rollback on error
      if (wasFavorite) {
        favoriteIds.value.add(propertyId)
      } else {
        favoriteIds.value.delete(propertyId)
      }
      favoriteIds.value = new Set(favoriteIds.value)
      return false
    } finally {
      toggling.value.delete(propertyId)
    }
  }

  return {
    favoriteIds,
    loading,
    toggling,
    fetchFavorites,
    isFavorite,
    toggleFavorite,
  }
})
