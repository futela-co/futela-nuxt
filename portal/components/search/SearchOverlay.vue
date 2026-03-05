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
} from '@heroicons/vue/24/outline'
import { geographyApi } from '~shared/infrastructure/api/geography'
import type { GeoSearchResult } from '~shared/infrastructure/api/geography'
import type { Town } from '~shared/domain/types/property'

const { t } = useLocale()

const emit = defineEmits<{ close: [] }>()

// Active panel
type Panel = 'type' | 'lieu' | 'budget' | null
const activePanel = ref<Panel>('type')

// Type de bien
const selectedType = ref<string | null>(null)
const typeOptions = computed(() => [
  { value: 'apartment', label: t('property.apartment'), icon: BuildingOffice2Icon, color: 'bg-blue-50 text-blue-600' },
  { value: 'house', label: t('property.house'), icon: HomeIcon, color: 'bg-green-50 text-green-600' },
  { value: 'land', label: t('property.land'), icon: GlobeAltIcon, color: 'bg-amber-50 text-amber-600' },
  { value: 'event_hall', label: t('property.eventHallLabel'), icon: BuildingLibraryIcon, color: 'bg-purple-50 text-purple-600' },
  { value: 'car', label: t('property.car'), icon: TruckIcon, color: 'bg-red-50 text-red-600' },
])

const typeLabel = computed(() => {
  if (!selectedType.value) return ''
  return typeOptions.value.find(o => o.value === selectedType.value)?.label ?? ''
})

function selectType(type: string) {
  selectedType.value = selectedType.value === type ? null : type
  if (selectedType.value) activePanel.value = 'lieu'
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

const selectedTypeOption = computed(() => typeOptions.value.find(o => o.value === selectedType.value))

const hasAnySelection = computed(() => {
  return !!selectedType.value || !!lieuLabel.value || !!budgetLabel.value
})

// Focus input when lieu panel opens
const geoInput = ref<HTMLInputElement | null>(null)
watch(activePanel, (v) => {
  if (v === 'lieu') {
    nextTick(() => setTimeout(() => geoInput.value?.focus(), 50))
  }
})

onMounted(() => {
  document.body.style.overflow = 'hidden'
})

function close() {
  document.body.style.overflow = ''
  emit('close')
}

// Search
function handleSearch() {
  const query: Record<string, string> = {}
  if (selectedType.value) query.category = selectedType.value
  if (selectedProvince.value) query.provinceId = selectedProvince.value.id
  if (selectedCity.value) query.cityId = selectedCity.value.id
  if (selectedTown.value) query.townId = selectedTown.value.id
  if (minPrice.value) query.minPrice = String(minPrice.value)
  if (maxPrice.value) query.maxPrice = String(maxPrice.value)

  document.body.style.overflow = ''
  emit('close')
  navigateTo({ path: '/search', query })
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex flex-col">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="close" />

      <!-- Content -->
      <div class="relative flex flex-col h-full">
        <!-- Header -->
        <div class="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <span class="text-lg font-semibold text-gray-900">{{ t('filter.searchProperty') }}</span>
          <button
            class="p-2 rounded-full hover:bg-gray-100 transition-colors"
            @click="close"
          >
            <XMarkIcon class="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <!-- Search bar (pill style) -->
        <div class="bg-white px-4 sm:px-8 py-6 pb-3">
          <div class="max-w-3xl mx-auto">
            <div class="bg-gray-50 rounded-full border border-gray-200 flex items-stretch">
              <!-- Type de bien -->
              <button
                class="flex-1 flex flex-col justify-center px-5 py-3 rounded-full text-left transition-colors min-w-0"
                :class="activePanel === 'type' ? 'bg-white shadow-md' : 'hover:bg-white/60'"
                @click="activePanel = activePanel === 'type' ? null : 'type'"
              >
                <span class="text-xs font-semibold text-gray-900">{{ t('search.type') }}</span>
                <span class="text-sm truncate" :class="typeLabel ? 'text-gray-900' : 'text-gray-400'">
                  {{ typeLabel || t('filter.whatType') }}
                </span>
              </button>

              <div class="w-px bg-gray-200 my-3" />

              <!-- Lieu -->
              <button
                class="flex-1 flex flex-col justify-center px-5 py-3 rounded-full text-left transition-colors min-w-0"
                :class="activePanel === 'lieu' ? 'bg-white shadow-md' : 'hover:bg-white/60'"
                @click="activePanel = activePanel === 'lieu' ? null : 'lieu'"
              >
                <span class="text-xs font-semibold text-gray-900">{{ t('filter.place') }}</span>
                <span class="text-sm truncate" :class="lieuLabel ? 'text-gray-900' : 'text-gray-400'">
                  {{ lieuLabel || t('filter.placePlaceholder') }}
                </span>
              </button>


              <div class="w-px bg-gray-200 my-3" />

              <!-- Budget -->
              <button
                class="flex-1 flex flex-col justify-center px-5 py-3 rounded-full text-left transition-colors min-w-0"
                :class="activePanel === 'budget' ? 'bg-white shadow-md' : 'hover:bg-white/60'"
                @click="activePanel = activePanel === 'budget' ? null : 'budget'"
              >
                <span class="text-xs font-semibold text-gray-900">{{ t('filter.budget') }}</span>
                <span class="text-sm truncate" :class="budgetLabel ? 'text-gray-900' : 'text-gray-400'">
                  {{ budgetLabel || t('search.priceRange') }}
                </span>
              </button>
            </div>

            <!-- Active filter badges below pill bar -->
            <div v-if="hasAnySelection" class="flex flex-wrap gap-2 mt-3">
              <!-- Type badge -->
              <span
                v-if="selectedType"
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                :class="selectedTypeOption?.color || 'bg-gray-100 text-gray-600'"
              >
                <component :is="selectedTypeOption?.icon" class="w-3.5 h-3.5" />
                {{ typeLabel }}
                <button class="ml-0.5 hover:opacity-70" @click.stop="selectedType = null">
                  <XMarkIcon class="w-3 h-3" />
                </button>
              </span>
              <!-- Lieu badge -->
              <span
                v-if="lieuLabel"
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600"
              >
                <MapPinIcon class="w-3.5 h-3.5" />
                {{ lieuLabel }}
                <button class="ml-0.5 hover:opacity-70" @click.stop="clearLieu">
                  <XMarkIcon class="w-3 h-3" />
                </button>
              </span>
              <!-- Budget badge -->
              <span
                v-if="budgetLabel"
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-600"
              >
                {{ budgetLabel }}
                <button class="ml-0.5 hover:opacity-70" @click.stop="minPrice = null; maxPrice = null">
                  <XMarkIcon class="w-3 h-3" />
                </button>
              </span>
            </div>
          </div>
        </div>

        <!-- Active panel content -->
        <div class="flex-1 bg-white overflow-y-auto">
          <div class="max-w-3xl mx-auto px-4 sm:px-8 py-6">
            <!-- Type panel -->
            <div v-if="activePanel === 'type'">
              <p class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">{{ t('filter.choosePropertyType') }}</p>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button
                  v-for="opt in typeOptions"
                  :key="opt.value"
                  class="flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left"
                  :class="selectedType === opt.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'"
                  @click="selectType(opt.value)"
                >
                  <div
                    class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    :class="opt.color"
                  >
                    <component :is="opt.icon" class="w-6 h-6" />
                  </div>
                  <span class="text-sm font-medium text-gray-900">{{ opt.label }}</span>
                </button>
              </div>
            </div>

            <!-- Lieu panel -->
            <div v-else-if="activePanel === 'lieu'">
              <!-- Selected location badge -->
              <div v-if="lieuLabel" class="flex items-center gap-2 mb-4">
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-600">
                  <MapPinIcon class="w-4 h-4" />
                  {{ lieuLabel }}
                  <button class="ml-0.5 hover:text-blue-800" @click="clearLieu">
                    <XMarkIcon class="w-3.5 h-3.5" />
                  </button>
                </span>
              </div>

              <!-- Search input -->
              <div class="mb-4">
                <div class="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg">
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
                    class="text-gray-400 hover:text-gray-600"
                    @click="geoQuery = ''"
                  >
                    <XMarkIcon class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <!-- Search results -->
              <template v-if="geoQuery.trim().length > 0">
                <p v-if="geoLoading" class="text-sm text-gray-400 py-3">{{ t('filter.searching') }}</p>
                <template v-else-if="hasGeoResults">
                  <!-- Provinces -->
                  <template v-if="geoResults.provinces.length > 0">
                    <p class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{{ t('filter.provinces') }}</p>
                    <div class="space-y-1 mb-4">
                      <button
                        v-for="prov in geoResults.provinces"
                        :key="prov.id"
                        class="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                        @click="selectProvince({ id: prov.id, name: prov.name })"
                      >
                        <div class="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                          <GlobeAltIcon class="w-4 h-4 text-amber-500" />
                        </div>
                        <div>
                          <span class="text-sm font-medium text-gray-900">{{ prov.name }}</span>
                          <p v-if="(prov as any).countryName" class="text-xs text-gray-400">{{ (prov as any).countryName }}</p>
                        </div>
                      </button>
                    </div>
                  </template>
                  <!-- Cities -->
                  <template v-if="geoResults.cities.length > 0">
                    <p class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{{ t('filter.cities') }}</p>
                    <div class="space-y-1 mb-4">
                      <button
                        v-for="city in geoResults.cities"
                        :key="city.id"
                        class="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                        @click="selectCity(city)"
                      >
                        <div class="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <MapPinIcon class="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <span class="text-sm font-medium text-gray-900">{{ city.name }}</span>
                          <p v-if="(city as any).provinceName" class="text-xs text-gray-400">{{ (city as any).provinceName }}</p>
                        </div>
                      </button>
                    </div>
                  </template>
                  <!-- Towns -->
                  <template v-if="geoResults.towns.length > 0">
                    <p class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{{ t('filter.towns') }}</p>
                    <div class="space-y-1">
                      <button
                        v-for="town in geoResults.towns"
                        :key="town.id"
                        class="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                        @click="selectTown(town)"
                      >
                        <div class="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                          <MapPinIcon class="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                          <span class="text-sm font-medium text-gray-900">{{ town.name }}</span>
                          <p v-if="(town as any).cityName" class="text-xs text-gray-400">{{ (town as any).cityName }}</p>
                        </div>
                      </button>
                    </div>
                  </template>
                </template>
                <p v-else class="text-sm text-gray-400 py-3">{{ t('ui.noResults') }}</p>
              </template>

              <!-- Empty state when no search -->
              <div v-else-if="!lieuLabel" class="text-center py-8">
                <MapPinIcon class="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p class="text-sm text-gray-400">{{ t('filter.typeSearch') }}</p>
              </div>
            </div>

            <!-- Budget panel -->
            <div v-else-if="activePanel === 'budget'">
              <p class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">{{ t('filter.priceRangeUsd') }}</p>

              <div class="flex items-center gap-4 mb-5">
                <div class="flex-1">
                  <label class="text-xs text-gray-500 mb-1 block">{{ t('filter.minimum') }}</label>
                  <input
                    v-model.number="minPrice"
                    type="number"
                    placeholder="0"
                    min="0"
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                </div>
              </div>

              <div class="flex flex-wrap gap-2">
                <button
                  v-for="range in [
                    { label: '< 100$', min: null, max: 100 },
                    { label: '100$ - 500$', min: 100, max: 500 },
                    { label: '500$ - 1000$', min: 500, max: 1000 },
                    { label: '> 1000$', min: 1000, max: null },
                  ]"
                  :key="range.label"
                  class="px-4 py-2 rounded-full text-sm font-medium border transition-colors"
                  :class="minPrice === range.min && maxPrice === range.max
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'"
                  @click="minPrice = range.min; maxPrice = range.max"
                >
                  {{ range.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer with search button -->
        <div class="bg-white border-t border-gray-200 px-4 sm:px-8 py-4">
          <div class="max-w-3xl mx-auto flex items-center justify-between">
            <button
              class="text-sm font-medium text-gray-600 underline hover:text-gray-900"
              @click="selectedType = null; clearLieu(); minPrice = null; maxPrice = null;"
            >
              {{ t('filter.clearAll') }}
            </button>
            <button
              class="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full px-8 py-3 font-semibold transition-colors"
              @click="handleSearch"
            >
              <MagnifyingGlassIcon class="w-5 h-5" />
              {{ t('search.title') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
