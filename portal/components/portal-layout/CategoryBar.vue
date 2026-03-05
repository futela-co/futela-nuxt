<script setup lang="ts">
import {
  BuildingOffice2Icon,
  HomeModernIcon,
  GlobeAltIcon,
  BuildingLibraryIcon,
  TruckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/vue/24/outline'

const route = useRoute()

interface Category {
  id: string
  name: string
  icon: any
  slug: string
}

const categories: Category[] = [
  { id: '1', name: 'Appartements', icon: BuildingOffice2Icon, slug: 'apartment' },
  { id: '2', name: 'Maisons', icon: HomeModernIcon, slug: 'house' },
  { id: '3', name: 'Terrains', icon: GlobeAltIcon, slug: 'land' },
  { id: '4', name: "Salles d'événement", icon: BuildingLibraryIcon, slug: 'event_hall' },
  { id: '5', name: 'Voitures', icon: TruckIcon, slug: 'car' },
]

const activeCategory = computed(() => route.query.category as string | undefined)

const scrollContainer = ref<HTMLElement>()
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

function updateArrows() {
  const el = scrollContainer.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 4
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 4
}

function scrollBy(dir: number) {
  scrollContainer.value?.scrollBy({ left: dir * 120, behavior: 'smooth' })
}

onMounted(() => {
  updateArrows()
  scrollContainer.value?.addEventListener('scroll', updateArrows, { passive: true })
  window.addEventListener('resize', updateArrows)
})

onBeforeUnmount(() => {
  scrollContainer.value?.removeEventListener('scroll', updateArrows)
  window.removeEventListener('resize', updateArrows)
})
</script>

<template>
  <div class="bg-white border-b border-gray-200">
    <div class="relative max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20">
      <!-- Left arrow -->
      <button
        v-show="canScrollLeft"
        class="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white/90 shadow rounded-full text-gray-600 md:hidden"
        @click="scrollBy(-1)"
      >
        <ChevronLeftIcon class="w-4 h-4" />
      </button>

      <!-- Scrollable categories -->
      <div
        ref="scrollContainer"
        class="flex items-stretch gap-0 overflow-x-auto scrollbar-hide md:overflow-visible"
      >
        <NuxtLink
          v-for="category in categories"
          :key="category.id"
          :to="{ path: '/search', query: { category: category.slug } }"
          class="flex-shrink-0 md:flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-5 md:px-0 transition-colors border-b-2 no-underline"
          :class="[
            activeCategory === category.slug
              ? 'text-primary-600 border-primary-600'
              : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300',
          ]"
        >
          <component
            :is="category.icon"
            class="h-6 w-6"
          />
          <span class="text-xs font-medium whitespace-nowrap">{{ category.name }}</span>
        </NuxtLink>
      </div>

      <!-- Right arrow -->
      <button
        v-show="canScrollRight"
        class="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white/90 shadow rounded-full text-gray-600 md:hidden"
        @click="scrollBy(1)"
      >
        <ChevronRightIcon class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
