<script setup lang="ts">
import {
  ArrowRightIcon,
  BuildingOffice2Icon,
  HomeIcon,
  GlobeAmericasIcon,
  BuildingLibraryIcon,
  TruckIcon,
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'default',
  public: true,
})

const { t } = useLocale()

useSeoMeta({
  title: () => t('home.seoTitle'),
  description: () => t('home.seoDescription'),
  ogTitle: () => t('home.seoOgTitle'),
  ogDescription: () => t('home.heroSubtitle'),
  ogImage: '/og-image.png',
  ogUrl: '/',
})

const propertyStore = usePropertyStore()
const favoritesStore = useFavoritesStore()
const authStore = useAuthStore()

onMounted(async () => {
  await Promise.all([
    propertyStore.fetchNearby(),
    propertyStore.fetchPopular(),
    propertyStore.fetchRecent(),
  ])

  if (authStore.isAuthenticated) {
    favoritesStore.fetchFavorites()
  }
})

function navigateToSearch(section?: string) {
  const query: Record<string, string> = {}
  if (section) query.sort = section
  navigateTo({ path: '/search', query })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section class="w-full bg-white border-b border-gray-100">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 sm:pt-14 sm:pb-16">
        <div class="text-center mb-8 sm:mb-10">
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
            {{ t('home.heroTitle') }}
          </h1>
          <p class="mt-0.5 text-base sm:text-lg text-gray-500">
            {{ t('home.heroSubtitle') }}
          </p>
        </div>

        <!-- 5 category illustrations -->
        <div class="flex justify-center gap-4 sm:gap-8 mb-8 sm:mb-10">
          <button
            v-for="cat in [
              { icon: BuildingOffice2Icon, label: t('property.apartment'), type: 'apartment', color: 'text-blue-500 bg-blue-50 ring-blue-200' },
              { icon: HomeIcon, label: t('property.house'), type: 'house', color: 'text-emerald-500 bg-emerald-50 ring-emerald-200' },
              { icon: GlobeAmericasIcon, label: t('property.land'), type: 'land', color: 'text-amber-500 bg-amber-50 ring-amber-200' },
              { icon: BuildingLibraryIcon, label: t('property.eventHallLabel'), type: 'event_hall', color: 'text-purple-500 bg-purple-50 ring-purple-200' },
              { icon: TruckIcon, label: t('property.car'), type: 'car', color: 'text-rose-500 bg-rose-50 ring-rose-200' },
            ]"
            :key="cat.label"
            class="flex flex-col items-center gap-2 group"
            @click="navigateTo({ path: '/search', query: { category: cat.type } })"
          >
            <span
              class="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ring-1 transition-shadow group-hover:ring-2 group-hover:shadow-md"
              :class="cat.color"
            >
              <component :is="cat.icon" class="w-7 h-7 sm:w-8 sm:h-8" />
            </span>
            <span class="text-xs sm:text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
              {{ cat.label }}
            </span>
          </button>
        </div>

        <SearchHeroSearchBar />
      </div>
    </section>

    <!-- Nearby Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-900">
          {{ t('home.nearbyTitle') }}
        </h2>
        <button
          class="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          @click="navigateToSearch('nearby')"
        >
          {{ t('home.viewAll') }}
          <ArrowRightIcon class="w-4 h-4" />
        </button>
      </div>
      <div
        v-if="propertyStore.loading && propertyStore.nearbyProperties.length === 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <PropertyCard
          v-for="i in 4"
          :key="i"
          variant="skeleton"
        />
      </div>
      <div
        v-else-if="propertyStore.nearbyProperties.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <PropertyCard
          v-for="property in propertyStore.nearbyProperties.slice(0, 4)"
          :key="property.id"
          :property="property"
        />
      </div>
      <div
        v-else
        class="text-center py-8 text-gray-500"
      >
        {{ t('home.noProperties') }}
      </div>
    </section>

    <!-- Popular Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-900">
          {{ t('home.popularTitle') }}
        </h2>
        <button
          class="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          @click="navigateToSearch('popular')"
        >
          {{ t('home.viewAll') }}
          <ArrowRightIcon class="w-4 h-4" />
        </button>
      </div>
      <div
        v-if="propertyStore.loading && propertyStore.popularProperties.length === 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <PropertyCard
          v-for="i in 4"
          :key="i"
          variant="skeleton"
        />
      </div>
      <div
        v-else-if="propertyStore.popularProperties.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <PropertyCard
          v-for="property in propertyStore.popularProperties.slice(0, 4)"
          :key="property.id"
          :property="property"
        />
      </div>
      <div
        v-else
        class="text-center py-8 text-gray-500"
      >
        {{ t('home.noProperties') }}
      </div>
    </section>

    <!-- Recent Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-900">
          {{ t('home.recentTitle') }}
        </h2>
        <button
          class="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          @click="navigateToSearch('recent')"
        >
          {{ t('home.viewAll') }}
          <ArrowRightIcon class="w-4 h-4" />
        </button>
      </div>
      <div
        v-if="propertyStore.loading && propertyStore.recentProperties.length === 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <PropertyCard
          v-for="i in 4"
          :key="i"
          variant="skeleton"
        />
      </div>
      <div
        v-else-if="propertyStore.recentProperties.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <PropertyCard
          v-for="property in propertyStore.recentProperties.slice(0, 4)"
          :key="property.id"
          :property="property"
        />
      </div>
      <div
        v-else
        class="text-center py-8 text-gray-500"
      >
        {{ t('home.noProperties') }}
      </div>
    </section>
  </div>
</template>
