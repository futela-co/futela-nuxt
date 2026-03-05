<script setup lang="ts">
import {
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  FireIcon,
} from '@heroicons/vue/24/outline'
import type { SearchFilters } from '~shared/domain/types/property'

import { geographyApi, type GeoSearchResult } from '~shared/infrastructure/api/geography'

interface Props {
  filters: SearchFilters
  isOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: true,
})

const emit = defineEmits<{
  'update:filters': [filters: SearchFilters]
  apply: []
  clear: []
  close: []
}>()

const localFilters = ref<SearchFilters>({ ...props.filters })

watch(() => props.filters, (newVal) => {
  skipPriceWatch = true
  localFilters.value = { ...newVal }
  // Restore geoLabel from filters if present
  if ((newVal as any)._geoLabel) {
    geoLabel.value = (newVal as any)._geoLabel
  }
  nextTick(() => { skipPriceWatch = false })
}, { deep: true })

const listingTypeOptions = computed(() => [
  { value: 'for_rent', label: t('filter.forRent') },
  { value: 'for_sale', label: t('filter.forSale') },
])

const typeOptions = computed(() => [
  { value: 'apartment', label: t('filter.apartments') },
  { value: 'house', label: t('filter.houses') },
  { value: 'land', label: t('filter.lands') },
  { value: 'event_hall', label: t('filter.eventHalls') },
  { value: 'car', label: t('filter.cars') },
])

const bedroomOptions = [1, 2, 3, 4, 5]

// Popular quick filters
const popularFilters = computed(() => [
  { label: t('filter.under500'), filter: { maxPrice: 500 } },
  { label: t('filter.furnishedApt'), filter: { type: 'apartment' } },
  { label: t('filter.housesGarden'), filter: { type: 'house' } },
  { label: t('filter.buildableLand'), filter: { type: 'land' } },
])

function applyPopular(filter: Partial<SearchFilters>) {
  localFilters.value = { ...localFilters.value, ...filter }
  applyFilters()
}

// Geo search state
const geoQuery = ref('')
const geoResults = ref<GeoSearchResult>({ provinces: [], cities: [], towns: [] })
const geoLoading = ref(false)
const geoLabel = ref('')

let geoSearchTimer: ReturnType<typeof setTimeout> | null = null

async function searchGeo(query: string) {
  geoLoading.value = true
  try {
    geoResults.value = await geographyApi.search(query)
  } catch {
    geoResults.value = { provinces: [], cities: [], towns: [] }
  } finally {
    geoLoading.value = false
  }
}

watch(geoQuery, (val) => {
  if (geoSearchTimer) clearTimeout(geoSearchTimer)
  const q = val.trim()
  if (q.length === 0) {
    geoResults.value = { provinces: [], cities: [], towns: [] }
    return
  }
  geoSearchTimer = setTimeout(() => searchGeo(q), 300)
})

const hasGeoResults = computed(() => {
  const r = geoResults.value
  return r.provinces.length > 0 || r.cities.length > 0 || r.towns.length > 0
})

function pickProvince(prov: any) {
  geoLabel.value = prov.name
  geoQuery.value = ''
  geoResults.value = { provinces: [], cities: [], towns: [] }
  localFilters.value.provinceId = prov.id
  delete localFilters.value.cityId
  delete localFilters.value.townId
  applyFilters()
}

function pickCity(city: any) {
  geoLabel.value = city.provinceName ? `${city.name}, ${city.provinceName}` : city.name
  geoQuery.value = ''
  geoResults.value = { provinces: [], cities: [], towns: [] }
  localFilters.value.cityId = city.id
  localFilters.value.provinceId = city.provinceId
  delete localFilters.value.townId
  applyFilters()
}

function pickTown(town: any) {
  const parts = [town.name, town.cityName, town.provinceName].filter(Boolean)
  geoLabel.value = parts.join(', ')
  geoQuery.value = ''
  geoResults.value = { provinces: [], cities: [], towns: [] }
  localFilters.value.townId = town.id
  applyFilters()
}

function clearGeo() {
  geoQuery.value = ''
  geoLabel.value = ''
  geoResults.value = { provinces: [], cities: [], towns: [] }
  delete localFilters.value.provinceId
  delete localFilters.value.cityId
  delete localFilters.value.townId
  applyFilters()
}

function applyFilters() {
  emit('update:filters', { ...localFilters.value, _geoLabel: geoLabel.value || undefined })
  emit('apply')
}

function clearFilters() {
  localFilters.value = {}
  clearGeo()
  emit('update:filters', {})
  emit('clear')
}

function setListingType(type: string) {
  if (localFilters.value.listingType === type) {
    delete localFilters.value.listingType
  } else {
    localFilters.value.listingType = type
  }
  applyFilters()
}

function setType(type: string) {
  if (localFilters.value.type === type) {
    delete localFilters.value.type
  } else {
    localFilters.value.type = type
  }
  applyFilters()
}

function setBedrooms(count: number) {
  if (localFilters.value.bedrooms === count) {
    delete localFilters.value.bedrooms
  } else {
    localFilters.value.bedrooms = count
  }
  applyFilters()
}

function setBathrooms(count: number) {
  if (localFilters.value.bathrooms === count) {
    delete localFilters.value.bathrooms
  } else {
    localFilters.value.bathrooms = count
  }
  applyFilters()
}

// Auto-apply price filters after user stops typing
const { t } = useLocale()

let priceTimer: ReturnType<typeof setTimeout> | null = null
let skipPriceWatch = false
watch(() => [localFilters.value.minPrice, localFilters.value.maxPrice], () => {
  if (skipPriceWatch) return
  if (priceTimer) clearTimeout(priceTimer)
  priceTimer = setTimeout(() => applyFilters(), 500)
})
</script>

<template>
  <div
    v-if="isOpen"
    class="bg-white rounded-xl border border-gray-200 p-4"
  >
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <AdjustmentsHorizontalIcon class="w-5 h-5 text-gray-500" />
        <h3 class="font-semibold text-gray-900">{{ t('search.filters') }}</h3>
      </div>
      <button
        class="lg:hidden p-1 rounded hover:bg-gray-100"
        @click="$emit('close')"
      >
        <XMarkIcon class="w-5 h-5 text-gray-500" />
      </button>
    </div>

    <!-- Type d'annonce -->
    <div class="mb-4">
      <h4 class="text-sm font-medium text-gray-700 mb-2">{{ t('filter.listingType') }}</h4>
      <div class="space-y-1">
        <button
          v-for="opt in listingTypeOptions"
          :key="opt.value"
          class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
          :class="localFilters.listingType === opt.value
            ? 'bg-primary-50 text-primary-700 font-medium'
            : 'text-gray-600 hover:bg-gray-50'"
          @click="setListingType(opt.value)"
        >
          <span
            class="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0"
            :class="localFilters.listingType === opt.value
              ? 'border-primary-500 bg-primary-500'
              : 'border-gray-300'"
          >
            <svg
              v-if="localFilters.listingType === opt.value"
              class="w-2.5 h-2.5 text-white"
              fill="currentColor"
              viewBox="0 0 12 12"
            >
              <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
            </svg>
          </span>
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- Type de propriete -->
    <div class="mb-4">
      <h4 class="text-sm font-medium text-gray-700 mb-2">{{ t('filter.propertyType') }}</h4>
      <div class="space-y-1">
        <button
          v-for="opt in typeOptions"
          :key="opt.value"
          class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
          :class="localFilters.type === opt.value
            ? 'bg-primary-50 text-primary-700 font-medium'
            : 'text-gray-600 hover:bg-gray-50'"
          @click="setType(opt.value)"
        >
          <span
            class="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0"
            :class="localFilters.type === opt.value
              ? 'border-primary-500 bg-primary-500'
              : 'border-gray-300'"
          >
            <svg
              v-if="localFilters.type === opt.value"
              class="w-2.5 h-2.5 text-white"
              fill="currentColor"
              viewBox="0 0 12 12"
            >
              <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
            </svg>
          </span>
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- Localisation -->
    <div class="mb-4">
      <div class="flex items-center gap-1.5 mb-2 flex-wrap">
        <h4 class="text-sm font-medium text-gray-700 flex items-center gap-1.5">
          <MapPinIcon class="w-4 h-4 text-primary-500" />
          {{ t('filter.location') }}
        </h4>
        <span
          v-if="geoLabel"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-medium"
        >
          {{ geoLabel }}
          <button class="ml-0.5 hover:text-primary-900" @click="clearGeo">
            <XMarkIcon class="w-3 h-3" />
          </button>
        </span>
      </div>

      <!-- Search input -->
      <div class="relative">
        <MagnifyingGlassIcon class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          v-model="geoQuery"
          type="text"
          :placeholder="t('filter.searchCity')"
          class="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
        >
      </div>

      <!-- Search results dropdown -->
      <div
        v-if="geoQuery.trim().length > 0"
        class="mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-100 bg-white"
      >
        <p v-if="geoLoading" class="text-xs text-gray-400 px-3 py-2">{{ t('filter.searching') }}</p>

        <template v-else-if="hasGeoResults">
          <!-- Provinces -->
          <template v-if="geoResults.provinces.length > 0">
            <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 pt-2 pb-1">{{ t('filter.provinces') }}</p>
            <button
              v-for="prov in geoResults.provinces"
              :key="'p-' + prov.id"
              class="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              @click="pickProvince(prov)"
            >
              <MapPinIcon class="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span>{{ prov.name }}</span>
            </button>
          </template>

          <!-- Cities -->
          <template v-if="geoResults.cities.length > 0">
            <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 pt-2 pb-1">{{ t('filter.cities') }}</p>
            <button
              v-for="city in geoResults.cities"
              :key="'c-' + city.id"
              class="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              @click="pickCity(city)"
            >
              <MapPinIcon class="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span>{{ city.name }}</span>
              <span v-if="city.provinceName" class="text-xs text-gray-400">{{ city.provinceName }}</span>
            </button>
          </template>

          <!-- Towns -->
          <template v-if="geoResults.towns.length > 0">
            <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 pt-2 pb-1">{{ t('filter.towns') }}</p>
            <button
              v-for="town in geoResults.towns"
              :key="'t-' + town.id"
              class="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              @click="pickTown(town)"
            >
              <MapPinIcon class="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span>{{ town.name }}</span>
              <span v-if="town.cityName" class="text-xs text-gray-400">{{ town.cityName }}</span>
            </button>
          </template>
        </template>

        <p v-else class="text-xs text-gray-400 px-3 py-2">{{ t('ui.noResults') }}</p>
      </div>
    </div>

    <!-- Populaire -->
    <div class="mb-4">
      <h4 class="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
        <FireIcon class="w-4 h-4 text-orange-500" />
        {{ t('filter.popular') }}
      </h4>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="item in popularFilters"
          :key="item.label"
          class="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
          @click="applyPopular(item.filter)"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <!-- Fourchette de prix -->
    <div class="mb-4">
      <h4 class="text-sm font-medium text-gray-700 mb-2">{{ t('filter.priceRangeUsd') }}</h4>
      <div class="flex items-center gap-2">
        <input
          v-model.number="localFilters.minPrice"
          type="number"
          placeholder="Min"
          min="0"
          class="form-control text-sm"
        >
        <span class="text-gray-400">-</span>
        <input
          v-model.number="localFilters.maxPrice"
          type="number"
          placeholder="Max"
          min="0"
          class="form-control text-sm"
        >
      </div>
    </div>

    <!-- Chambres -->
    <div class="mb-4">
      <h4 class="text-sm font-medium text-gray-700 mb-2">{{ t('filter.bedrooms') }}</h4>
      <div class="flex gap-2">
        <button
          v-for="count in bedroomOptions"
          :key="count"
          class="px-3.5 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="localFilters.bedrooms === count
            ? 'bg-primary-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          @click="setBedrooms(count)"
        >
          {{ count }}+
        </button>
      </div>
    </div>

    <!-- Salles de bain -->
    <div class="mb-4">
      <h4 class="text-sm font-medium text-gray-700 mb-2">{{ t('filter.bathrooms') }}</h4>
      <div class="flex gap-2">
        <button
          v-for="count in [1, 2, 3, 4]"
          :key="count"
          class="px-3.5 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="localFilters.bathrooms === count
            ? 'bg-primary-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          @click="setBathrooms(count)"
        >
          {{ count }}+
        </button>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="flex gap-2 pt-3 border-t border-gray-100">
      <button
        class="flex-1 btn btn-outline-secondary text-sm"
        @click="clearFilters"
      >
        {{ t('ui.reset') }}
      </button>
      <button
        class="flex-1 btn btn-primary text-sm"
        @click="applyFilters"
      >
        {{ t('ui.apply') }}
      </button>
    </div>
  </div>
</template>
