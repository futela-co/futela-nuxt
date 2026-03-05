<script setup lang="ts">
import { HeartIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { favoritesApi } from '~shared/infrastructure/api/favorites'
import { useFavoritesStore } from '~shared/application/stores/favorites'
import type { Property } from '~shared/domain/types/property'

definePageMeta({ layout: 'dashboard' })

const { t } = useLocale()
const favoritesStore = useFavoritesStore()
const pagination = usePagination()

const properties = ref<Property[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

async function loadFavorites() {
  isLoading.value = true
  error.value = null
  try {
    const response: any = await favoritesApi.list({
      page: pagination.page.value,
    })
    properties.value = Array.isArray(response) ? response : (response.data ?? [])
    pagination.updateFromResponse(response)
    // Sync favoriteIds in store so heart icons show as active
    favoritesStore.fetchFavorites()
  } catch (e: any) {
    error.value = e.message || t('dashboard.loadFavoritesError')
  } finally {
    isLoading.value = false
  }
}

function handleRemoveFavorite(propertyId: string) {
  // PropertyCard already called toggleFavorite + toast — just remove from local list
  properties.value = properties.value.filter(p => p.id !== propertyId)
}

watch(() => pagination.page.value, () => {
  loadFavorites()
})

// Fetch data immediately on navigation (Nuxt pattern)
loadFavorites()
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ t('dashboard.myFavorites') }}</h1>
        <p class="text-gray-500 text-sm mt-1">{{ pagination.total.value }} {{ t('dashboard.properties') }}</p>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <PropertyCard
        v-for="i in 6"
        :key="i"
        variant="skeleton"
      />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <p class="text-red-700 font-medium">{{ error }}</p>
      <button
        class="btn btn-danger btn-lg mt-3"
        @click="loadFavorites"
      >
        {{ t('dashboard.retry') }}
      </button>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="properties.length === 0"
      class="bg-white rounded-xl shadow-sm p-12 text-center"
    >
      <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <HeartIcon class="w-8 h-8 text-red-400" />
      </div>
      <h2 class="text-lg font-semibold text-gray-900">{{ t('dashboard.noFavoritesYet') }}</h2>
      <p class="text-gray-500 text-sm mt-2 max-w-md mx-auto">
        {{ t('dashboard.noFavoritesDesc') }}
      </p>
      <button
        class="btn btn-primary btn-lg gap-2 mt-4"
        @click="navigateTo('/search')"
      >
        <MagnifyingGlassIcon class="w-4 h-4" />
        {{ t('dashboard.exploreProperties') }}
      </button>
    </div>

    <!-- Grid -->
    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PropertyCard
          v-for="property in properties"
          :key="property.id"
          :property="property"
          :show-favorite="true"
          @toggle-favorite="handleRemoveFavorite"
        />
      </div>

      <!-- Pagination -->
      <div
        v-if="pagination.totalPages.value > 1"
        class="mt-8 flex justify-center"
      >
        <nav class="flex items-center gap-1">
          <button
            :disabled="!pagination.hasPrev.value"
            class="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="pagination.prevPage()"
          >
            {{ t('ui.previous') }}
          </button>
          <template v-for="p in pagination.visiblePages.value" :key="p">
            <span v-if="p === '...'" class="px-2 text-gray-400">...</span>
            <button
              v-else
              class="w-10 h-10 text-sm rounded-lg"
              :class="p === pagination.page.value
                ? 'bg-primary-600 text-white font-semibold'
                : 'border border-gray-300 hover:bg-gray-50 text-gray-700'"
              @click="pagination.goToPage(p as number)"
            >
              {{ p }}
            </button>
          </template>
          <button
            :disabled="!pagination.hasNext.value"
            class="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="pagination.nextPage()"
          >
            {{ t('ui.next') }}
          </button>
        </nav>
      </div>
    </template>
  </div>
</template>
