<script setup lang="ts">
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  XMarkIcon,
  BuildingOffice2Icon,
  HomeIcon,
  GlobeAltIcon,
  BuildingLibraryIcon,
  TruckIcon,
  CurrencyDollarIcon,
} from '@heroicons/vue/24/outline'
import { geographyApi } from '~/infrastructure/api/geography'
import type { GeoSearchResult } from '~/infrastructure/api/geography'
import type { Town } from '~/domain/types/property'

const { t } = useLocale()

// Active panel
type Panel = 'type' | 'lieu' | 'budget' | null
const activePanel = ref<Panel>(null)

// Type de bien
const selectedType = ref<string | null>(null)
const typeOptions = computed(() => [
  { value: 'apartment', label: t('property.apartment'), icon: BuildingOffice2Icon, color: 'bg-blue-50 text-blue-600' },
  { value: 'house', label: t('property.house'), icon: HomeIcon, color: 'bg-green-50 text-green-600' },
  { value: 'land', label: t('property.land'), icon: GlobeAltIcon, color: 'bg-amber-50 text-amber-600' },
  { value: 'event_hall', label: t('property.eventHallLabel'), icon: BuildingLibraryIcon, color: 'bg-purple-50 text-purple-600' },
  { value: 'car', label: t('property.car'), icon: TruckIcon, color: 'bg-red-50 text-red-600' },
])

const selectedTypeOption = computed(() => typeOptions.value.find(o => o.value === selectedType.value) ?? null)
const typeLabel = computed(() => selectedTypeOption.value?.label ?? '')

function selectType(type: string) {
  selectedType.value = selectedType.value === type ? null : type
  if (selectedType.value) activePanel.value = 'lieu'
}

function clearType() {
  selectedType.value = null
}

// Lieu - AJAX search
const geoQuery = ref('')
const geoResults = ref<GeoSearchResult>({ provinces: [], cities: [], towns: [] })
const geoLoading = ref(false)
let geoSearchTimer: ReturnType<typeof setTimeout> | null = null

const selectedProvince = ref<{ id: string; name: string } | null>(null)
const selectedCity = ref<{ id: string; name: string; provinceId?: string } | null>(null)
const selectedTown = ref<Town | null>(null)
const lieuLabel = ref('')

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

function selectProvince(prov: { id: string; name: string }) {
  selectedProvince.value = prov
  selectedCity.value = null
  selectedTown.value = null
  lieuLabel.value = prov.name
  geoQuery.value = ''
  geoResults.value = { provinces: [], cities: [], towns: [] }
  activePanel.value = 'budget'
}

function selectCity(city: any) {
  selectedCity.value = { id: city.id, name: city.name, provinceId: city.provinceId }
  if (city.provinceName) {
    selectedProvince.value = { id: city.provinceId ?? '', name: city.provinceName }
  }
  selectedTown.value = null
  lieuLabel.value = city.provinceName ? `${city.name}, ${city.provinceName}` : city.name
  geoQuery.value = ''
  geoResults.value = { provinces: [], cities: [], towns: [] }
  activePanel.value = 'budget'
}

function selectTown(town: any) {
  selectedTown.value = town
  if (town.cityName) {
    selectedCity.value = { id: town.cityId ?? '', name: town.cityName }
  }
  const parts = [town.name, town.cityName, town.provinceName].filter(Boolean)
  lieuLabel.value = parts.join(', ')
  geoQuery.value = ''
  geoResults.value = { provinces: [], cities: [], towns: [] }
  activePanel.value = 'budget'
}

function clearLieu() {
  selectedProvince.value = null
  selectedCity.value = null
  selectedTown.value = null
  lieuLabel.value = ''
  geoQuery.value = ''
  geoResults.value = { provinces: [], cities: [], towns: [] }
}

// Budget
const minPrice = ref<number | null>(null)
const maxPrice = ref<number | null>(null)

const budgetLabel = computed(() => {
  if (minPrice.value && maxPrice.value) return `${minPrice.value}$ - ${maxPrice.value}$`
  if (minPrice.value) return t('filter.startFrom').replace('{price}', String(minPrice.value))
  if (maxPrice.value) return t('filter.upTo').replace('{price}', String(maxPrice.value))
  return ''
})

function clearBudget() {
  minPrice.value = null
  maxPrice.value = null
}

// Has any active filter
const hasActiveFilters = computed(() => !!(selectedType.value || lieuLabel.value || minPrice.value || maxPrice.value))

// Root ref for click outside
const rootRef = ref<HTMLElement | null>(null)

function openPanel(panel: Panel) {
  activePanel.value = activePanel.value === panel ? null : panel
}

function handleClickOutside(e: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    activePanel.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const geoInput = ref<HTMLInputElement | null>(null)
watch(activePanel, (v) => {
  if (v === 'lieu') {
    setTimeout(() => geoInput.value?.focus(), 50)
  }
})

// Search
function handleSearch() {
  const query: Record<string, string> = {}
  if (selectedType.value) query.category = selectedType.value
  if (selectedProvince.value) query.provinceId = selectedProvince.value.id
  if (selectedCity.value) query.cityId = selectedCity.value.id
  if (selectedTown.value) query.townId = selectedTown.value.id
  if (minPrice.value) query.minPrice = String(minPrice.value)
  if (maxPrice.value) query.maxPrice = String(maxPrice.value)

  activePanel.value = null
  navigateTo({ path: '/search', query })
}
</script>

<template>
  <div ref="rootRef" class="w-full max-w-4xl mx-auto">
    <!-- Search bar wrapper (positioning context for dropdowns) -->
    <div class="relative">
    <div
      class="bg-white rounded-full shadow-xl border border-gray-200 flex items-stretch"
      :class="{ 'shadow-2xl': activePanel }"
    >
      <button
        class="flex-1 flex flex-col justify-center px-6 py-3 rounded-full text-left transition-colors min-w-0"
        :class="activePanel === 'type' ? 'bg-white shadow-md' : 'hover:bg-gray-50'"
        @click="openPanel('type')"
      >
        <span class="text-xs font-semibold text-gray-900">{{ t('search.type') }}</span>
        <span class="text-sm truncate" :class="typeLabel ? 'text-gray-900' : 'text-gray-400'">
          {{ typeLabel || t('filter.whatType') }}
        </span>
      </button>

      <div class="w-px bg-gray-200 my-3" />

      <button
        class="flex-1 flex flex-col justify-center px-6 py-3 rounded-full text-left transition-colors min-w-0"
        :class="activePanel === 'lieu' ? 'bg-white shadow-md' : 'hover:bg-gray-50'"
        @click="openPanel('lieu')"
      >
        <span class="text-xs font-semibold text-gray-900">{{ t('filter.place') }}</span>
        <span class="text-sm truncate" :class="lieuLabel ? 'text-gray-900' : 'text-gray-400'">
          {{ lieuLabel || t('filter.placePlaceholder') }}
        </span>
      </button>

      <div class="w-px bg-gray-200 my-3" />

      <button
        class="flex-1 flex flex-col justify-center px-6 py-3 rounded-full text-left transition-colors min-w-0"
        :class="activePanel === 'budget' ? 'bg-white shadow-md' : 'hover:bg-gray-50'"
        @click="openPanel('budget')"
      >
        <span class="text-xs font-semibold text-gray-900">{{ t('filter.budget') }}</span>
        <span class="text-sm truncate" :class="budgetLabel ? 'text-gray-900' : 'text-gray-400'">
          {{ budgetLabel || t('search.priceRange') }}
        </span>
      </button>

      <div class="flex items-center pr-2">
        <button
          class="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full px-5 py-3 font-semibold transition-colors"
          @click="handleSearch"
        >
          <MagnifyingGlassIcon class="w-5 h-5" />
          <span class="hidden sm:inline">{{ t('search.title') }}</span>
        </button>
      </div>
    </div>

    <!-- Type panel -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="activePanel === 'type'"
        class="absolute top-full left-0 mt-3 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-50"
      >
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{{ t('filter.chooseType') }}</p>
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="opt in typeOptions"
            :key="opt.value"
            class="flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left"
            :class="selectedType === opt.value
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'"
            @click="selectType(opt.value)"
          >
            <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" :class="opt.color">
              <component :is="opt.icon" class="w-5 h-5" />
            </div>
            <span class="text-sm font-medium text-gray-900">{{ opt.label }}</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Lieu panel -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="activePanel === 'lieu'"
        class="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
      >
        <!-- Selected badge + search input -->
        <div class="p-4 border-b border-gray-100">
          <div v-if="lieuLabel" class="flex items-center gap-2 mb-3">
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-600">
              <MapPinIcon class="w-4 h-4" />
              {{ lieuLabel }}
              <button class="ml-0.5 hover:text-blue-800" @click="clearLieu">
                <XMarkIcon class="w-3.5 h-3.5" />
              </button>
            </span>
          </div>
          <div class="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg">
            <MagnifyingGlassIcon class="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              ref="geoInput"
              v-model="geoQuery"
              type="text"
              :placeholder="t('filter.searchProvince')"
              class="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none border-none focus:outline-none focus:ring-0 focus:border-transparent"
            >
            <button
              v-if="geoQuery"
              class="text-gray-400 hover:text-gray-600 flex-shrink-0"
              @click="geoQuery = ''"
            >
              <XMarkIcon class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="max-h-72 overflow-y-auto">
          <template v-if="geoQuery.trim().length > 0">
            <p v-if="geoLoading" class="px-4 py-3 text-sm text-gray-400">{{ t('filter.searching') }}</p>
            <template v-else-if="hasGeoResults">
              <!-- Provinces -->
              <template v-if="geoResults.provinces.length > 0">
                <p class="px-4 pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ t('filter.provinces') }}</p>
                <button
                  v-for="prov in geoResults.provinces"
                  :key="prov.id"
                  class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                  @click="selectProvince({ id: prov.id, name: prov.name })"
                >
                  <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <GlobeAltIcon class="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ prov.name }}</p>
                    <p v-if="(prov as any).countryName" class="text-xs text-gray-400">{{ (prov as any).countryName }}</p>
                  </div>
                </button>
              </template>
              <!-- Cities -->
              <template v-if="geoResults.cities.length > 0">
                <p class="px-4 pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ t('filter.cities') }}</p>
                <button
                  v-for="city in geoResults.cities"
                  :key="city.id"
                  class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                  @click="selectCity(city)"
                >
                  <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <MapPinIcon class="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ city.name }}</p>
                    <p v-if="(city as any).provinceName" class="text-xs text-gray-400">{{ (city as any).provinceName }}</p>
                  </div>
                </button>
              </template>
              <!-- Towns -->
              <template v-if="geoResults.towns.length > 0">
                <p class="px-4 pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ t('filter.towns') }}</p>
                <button
                  v-for="town in geoResults.towns"
                  :key="town.id"
                  class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                  @click="selectTown(town)"
                >
                  <div class="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <MapPinIcon class="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ town.name }}</p>
                    <p v-if="(town as any).cityName" class="text-xs text-gray-400">{{ (town as any).cityName }}</p>
                  </div>
                </button>
              </template>
            </template>
            <p v-else class="px-4 py-3 text-sm text-gray-400">{{ t('ui.noResults') }}</p>
          </template>

          <!-- Empty state -->
          <div v-else-if="!lieuLabel" class="text-center py-8">
            <MapPinIcon class="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p class="text-sm text-gray-400">{{ t('filter.typeSearch') }}</p>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Budget panel -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="activePanel === 'budget'"
        class="absolute top-full right-0 mt-3 w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 z-50"
      >
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">{{ t('filter.priceRangeUsd') }}</p>
        <div class="flex items-center gap-4">
          <div class="flex-1">
            <label class="text-xs text-gray-500 mb-1 block">{{ t('filter.minimum') }}</label>
            <input
              v-model.number="minPrice"
              type="number"
              placeholder="0"
              min="0"
              class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
          </div>
          <span class="text-gray-300 mt-5">&mdash;</span>
          <div class="flex-1">
            <label class="text-xs text-gray-500 mb-1 block">{{ t('filter.maximum') }}</label>
            <input
              v-model.number="maxPrice"
              type="number"
              :placeholder="t('filter.unlimited')"
              min="0"
              class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
          </div>
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          <button
            v-for="range in [
              { label: '< 100$', min: null, max: 100 },
              { label: '100$ - 500$', min: 100, max: 500 },
              { label: '500$ - 1000$', min: 500, max: 1000 },
              { label: '> 1000$', min: 1000, max: null },
            ]"
            :key="range.label"
            class="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
            :class="minPrice === range.min && maxPrice === range.max
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'"
            @click="minPrice = range.min; maxPrice = range.max"
          >
            {{ range.label }}
          </button>
        </div>
      </div>
    </Transition>
    </div>

    <!-- Active filter badges -->
    <div
      v-if="hasActiveFilters"
      class="flex flex-wrap items-center gap-2 mt-3 px-2"
    >
      <span
        v-if="selectedTypeOption"
        class="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-800 shadow-sm border border-white/50 backdrop-blur-sm"
      >
        <span class="w-5 h-5 rounded-full flex items-center justify-center" :class="selectedTypeOption.color">
          <component :is="selectedTypeOption.icon" class="w-3 h-3" />
        </span>
        {{ selectedTypeOption.label }}
        <button class="ml-0.5 hover:text-gray-600" @click="clearType">
          <XMarkIcon class="w-3 h-3" />
        </button>
      </span>

      <span
        v-if="lieuLabel"
        class="inline-flex items-center gap-1.5 pl-2 pr-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-800 shadow-sm border border-white/50 backdrop-blur-sm"
      >
        <MapPinIcon class="w-3.5 h-3.5 text-primary-500" />
        {{ lieuLabel }}
        <button class="ml-0.5 hover:text-gray-600" @click="clearLieu">
          <XMarkIcon class="w-3 h-3" />
        </button>
      </span>

      <span
        v-if="budgetLabel"
        class="inline-flex items-center gap-1.5 pl-2 pr-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-800 shadow-sm border border-white/50 backdrop-blur-sm"
      >
        <CurrencyDollarIcon class="w-3.5 h-3.5 text-primary-500" />
        {{ budgetLabel }}
        <button class="ml-0.5 hover:text-gray-600" @click="clearBudget">
          <XMarkIcon class="w-3 h-3" />
        </button>
      </span>
    </div>
  </div>
</template>
