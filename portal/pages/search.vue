<script setup lang="ts">
import {
  AdjustmentsHorizontalIcon,
  Squares2X2Icon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'default',
  public: true,
})

const searchStore = useSearchStore()
const favoritesStore = useFavoritesStore()
const authStore = useAuthStore()

const showMobileFilters = ref(false)
const { t } = useLocale()

useSeoMeta({
  title: () => {
    const q = searchStore.filters.query
    return q ? `${t('search.seoTitleQuery')} ${q}` : t('search.seoTitleDefault')
  },
  description: () => t('search.seoDescription'),
  ogTitle: () => {
    const q = searchStore.filters.query
    return q ? `${t('search.seoTitleQuery')} ${q} | Futela` : `${t('search.seoTitleDefault')} | Futela`
  },
})

const route = useRoute()

// Sync from route on mount
onMounted(async () => {
  searchStore.syncFromRoute(route.query as Record<string, any>)
  await searchStore.search()
  if (authStore.isAuthenticated) {
    favoritesStore.fetchFavorites()
  }
})

// Watch for route query changes
watch(() => route.query, (newQuery) => {
  searchStore.syncFromRoute(newQuery as Record<string, any>)
  searchStore.search()
}, { deep: true })

// Sync filters to URL
function applyFiltersAndSearch() {
  const query = searchStore.buildQueryParams()
  navigateTo({ path: '/search', query }, { replace: true })
}

function handleSortChange(sort: string) {
  searchStore.setSort(sort)
  applyFiltersAndSearch()
}

function handlePageChange(page: number) {
  searchStore.setPage(page)
  applyFiltersAndSearch()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleFilterApply() {
  applyFiltersAndSearch()
  showMobileFilters.value = false
}

function handleFilterClear() {
  searchStore.clearFilters()
  applyFiltersAndSearch()
  showMobileFilters.value = false
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto px-4 sm:px-6 py-6">
      <!-- Top bar -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-xl font-bold text-gray-900">
            <template v-if="searchStore.filters.query">
              {{ t('search.resultsFor') }} "{{ searchStore.filters.query }}"
            </template>
            <template v-else>
              {{ t('search.allProperties') }}
            </template>
          </h1>
          <p class="text-sm text-gray-500 mt-0.5">
            {{ searchStore.total }} {{ t('search.result') }}{{ searchStore.total !== 1 ? 's' : '' }}
          </p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Mobile filter toggle -->
          <button
            class="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700"
            @click="showMobileFilters = true"
          >
            <AdjustmentsHorizontalIcon class="w-4 h-4" />
            {{ t('search.filters') }}
          </button>

          <!-- View mode toggle -->
          <div class="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button
              class="p-2 transition-colors"
              :class="searchStore.viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'"
              @click="searchStore.viewMode = 'grid'"
            >
              <Squares2X2Icon class="w-4 h-4" />
            </button>
            <button
              class="p-2 transition-colors"
              :class="searchStore.viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'"
              @click="searchStore.viewMode = 'list'"
            >
              <ListBulletIcon class="w-4 h-4" />
            </button>
          </div>

          <!-- Sort -->
          <SearchSortDropdown
            :model-value="searchStore.sortBy"
            @update:model-value="handleSortChange"
          />
        </div>
      </div>

      <!-- Main layout -->
      <div class="flex gap-4">
        <!-- Sidebar filters (desktop) -->
        <aside class="hidden lg:block w-[22rem] flex-shrink-0">
          <SearchFilterPanel
            :filters="searchStore.filters"
            @update:filters="(f) => { searchStore.filters = f }"
            @apply="handleFilterApply"
            @clear="handleFilterClear"
          />
        </aside>

        <!-- Results -->
        <main class="flex-1 min-w-0">
          <!-- Loading -->
          <div
            v-if="searchStore.loading"
            :class="searchStore.viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'
              : 'space-y-4'"
          >
            <PropertyCard
              v-for="i in 6"
              :key="i"
              variant="skeleton"
            />
          </div>

          <!-- Results grid -->
          <div
            v-else-if="searchStore.hasResults"
          >
            <div
              :class="searchStore.viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'
                : 'space-y-4'"
            >
              <PropertyCard
                v-for="property in searchStore.results"
                :key="property.id"
                :property="property"
                :variant="searchStore.viewMode === 'list' ? 'horizontal' : 'vertical'"
              />
            </div>

            <!-- Pagination -->
            <div class="mt-8">
              <BasePagination
                :current-page="searchStore.pagination.page"
                :total-pages="searchStore.pagination.totalPages"
                :total-items="searchStore.total"
                :per-page="searchStore.pagination.itemsPerPage"
                @update:current-page="handlePageChange"
              />
            </div>
          </div>

          <!-- Empty state -->
          <div
            v-else
            class="text-center py-16"
          >
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MagnifyingGlassIcon class="w-8 h-8 text-gray-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900">{{ t('search.noResultsTitle') }}</h3>
            <p class="mt-2 text-gray-500 max-w-sm mx-auto">
              {{ t('search.noResultsMessage') }}
            </p>
            <button
              class="mt-4 btn btn-primary"
              @click="handleFilterClear"
            >
              {{ t('search.resetFilters') }}
            </button>
          </div>
        </main>
      </div>
    </div>

    <!-- Mobile filter drawer -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showMobileFilters"
          class="fixed inset-0 z-50 lg:hidden"
        >
          <div
            class="absolute inset-0 bg-black/50"
            @click="showMobileFilters = false"
          />
          <div class="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl overflow-y-auto">
            <div class="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 class="font-semibold text-gray-900">{{ t('search.filters') }}</h3>
              <button
                class="p-1 rounded hover:bg-gray-100"
                @click="showMobileFilters = false"
              >
                <XMarkIcon class="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div class="p-4">
              <SearchFilterPanel
                :filters="searchStore.filters"
                @update:filters="(f) => { searchStore.filters = f }"
                @apply="handleFilterApply"
                @clear="handleFilterClear"
                @close="showMobileFilters = false"
              />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
