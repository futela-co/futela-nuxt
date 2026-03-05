<script setup lang="ts">
import { BuildingOffice2Icon, HomeIcon, GlobeAltIcon, BuildingLibraryIcon, TruckIcon } from '@heroicons/vue/24/outline'
import { categoriesApi } from '~/infrastructure/api/categories'
import type { Category } from '~/domain/types/property'

const categories = ref<Category[]>([])
const loading = ref(true)

const categoryIcons: Record<string, any> = {
  apartment: BuildingOffice2Icon,
  house: HomeIcon,
  land: GlobeAltIcon,
  event_hall: BuildingLibraryIcon,
  car: TruckIcon,
}

const categoryColors: Record<string, string> = {
  apartment: 'bg-blue-50 text-blue-600',
  house: 'bg-green-50 text-green-600',
  land: 'bg-amber-50 text-amber-600',
  event_hall: 'bg-purple-50 text-purple-600',
  car: 'bg-red-50 text-red-600',
}

function getIcon(slug: string) {
  return categoryIcons[slug] ?? BuildingOffice2Icon
}

function getColor(slug: string) {
  return categoryColors[slug] ?? 'bg-gray-50 text-gray-600'
}

const { t } = useLocale()

function navigateToCategory(category: Category) {
  navigateTo({ path: '/search', query: { categoryId: category.id } })
}

onMounted(async () => {
  try {
    categories.value = await categoriesApi.list()
  } catch {
    categories.value = []
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <!-- Loading state -->
    <div
      v-if="loading"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4"
    >
      <div
        v-for="i in 5"
        :key="i"
        class="bg-white rounded-xl p-6 text-center animate-pulse"
      >
        <div class="w-12 h-12 bg-gray-200 rounded-xl mx-auto" />
        <div class="h-4 bg-gray-200 rounded mt-3 w-20 mx-auto" />
        <div class="h-3 bg-gray-200 rounded mt-2 w-16 mx-auto" />
      </div>
    </div>

    <!-- Categories -->
    <div
      v-else
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4"
    >
      <button
        v-for="category in categories"
        :key="category.id"
        class="bg-white rounded-xl p-6 text-center hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer border border-gray-100"
        @click="navigateToCategory(category)"
      >
        <div
          class="w-12 h-12 rounded-xl flex items-center justify-center mx-auto"
          :class="getColor(category.slug)"
        >
          <component
            :is="getIcon(category.slug)"
            class="w-6 h-6"
          />
        </div>
        <h3 class="mt-3 font-semibold text-sm text-gray-900">{{ category.name }}</h3>
        <p class="text-xs text-gray-500 mt-1">{{ category.propertiesCount }} {{ t('category.properties') }}</p>
      </button>
    </div>
  </div>
</template>
