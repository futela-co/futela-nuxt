<script setup lang="ts">
import { type Component } from 'vue'
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  MapPinIcon,
  HomeModernIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'
import { propertiesApi } from '~shared/infrastructure/api/properties'
import type { Property } from '~shared/domain/types/property'

definePageMeta({ layout: 'dashboard', landlord: true })

const { t } = useLocale()
const route = useRoute()
const toast = useToast()
const store = useLandlordStore()
const { formatFC, isReady: rateReady } = useExchangeRate()

const property = ref<Property | null>(null)
const loading = ref(true)
const showDeleteModal = ref(false)
const deleting = ref(false)
const showAllDescription = ref(false)

const propertyId = computed(() => route.params.id as string)

const typeLabels = computed<Record<string, string>>(() => ({
  apartment: t('property.apartment'),
  house: t('property.house'),
  land: t('property.land'),
  event_hall: t('property.eventHall'),
  car: t('property.car'),
}))

const typeBadgeColors: Record<string, string> = {
  apartment: 'bg-blue-100 text-blue-700',
  house: 'bg-emerald-100 text-emerald-700',
  land: 'bg-amber-100 text-amber-700',
  event_hall: 'bg-purple-100 text-purple-700',
  car: 'bg-rose-100 text-rose-700',
}

const canDelete = computed(() => property.value && !property.value.isPublished)

// Dynamic specs component per type (same as public page)
const specsComponentMap: Record<string, Component> = {
  apartment: resolveComponent('PropertySpecsApartmentSpecs') as Component,
  house: resolveComponent('PropertySpecsHouseSpecs') as Component,
  land: resolveComponent('PropertySpecsLandSpecs') as Component,
  event_hall: resolveComponent('PropertySpecsEventHallSpecs') as Component,
  car: resolveComponent('PropertySpecsCarSpecs') as Component,
}

const specsComponent = computed(() => {
  if (!property.value) return null
  return specsComponentMap[property.value.type] ?? null
})

const showAmenities = computed(() => property.value?.type !== 'car')

// Dynamic features row (same as public page)
const typeFeatures = computed((): Array<{ label: string; value: string }> => {
  const p = property.value
  if (!p) return []
  const items: Array<{ label: string; value: string }> = []

  switch (p.type) {
    case 'apartment':
      if (p.squareMeters) items.push({ label: t('property.surface'), value: `${p.squareMeters} m\u00B2` })
      if (p.floor != null) items.push({ label: t('property.floorLabel'), value: p.floor === 0 ? t('property.groundFloor') : `${p.floor}e ${t('property.floor')}` })
      if (p.bedrooms) items.push({ label: '', value: `${p.bedrooms} ${p.bedrooms > 1 ? t('property.bedroomPlural') : t('property.bedroom')}` })
      if (p.bathrooms) items.push({ label: '', value: `${p.bathrooms} ${p.bathrooms > 1 ? t('property.bathroomPlural') : t('property.bathroom')}` })
      break
    case 'house':
      if (p.houseSquareMeters) items.push({ label: t('property.surface'), value: `${p.houseSquareMeters} m\u00B2` })
      if (p.bedrooms) items.push({ label: '', value: `${p.bedrooms} ${p.bedrooms > 1 ? t('property.bedroomPlural') : t('property.bedroom')}` })
      if (p.bathrooms) items.push({ label: '', value: `${p.bathrooms} ${p.bathrooms > 1 ? t('property.bathroomPlural') : t('property.bathroom')}` })
      if (p.floors) items.push({ label: '', value: `${p.floors} ${p.floors > 1 ? t('property.levelPlural') : t('property.level')}` })
      break
    case 'land':
      if (p.squareMeters) items.push({ label: t('property.surface'), value: `${p.squareMeters} m\u00B2` })
      if (p.landType) items.push({ label: t('property.typeLabel'), value: p.landType })
      break
    case 'event_hall':
      if (p.capacity) items.push({ label: t('property.capacityLabel'), value: `${p.capacity} ${t('property.persons')}` })
      if (p.hasParking) items.push({ label: '', value: t('property.parkingLabel') })
      break
    case 'car':
      if (p.brand) items.push({ label: t('property.brandLabel'), value: p.brand })
      if (p.model) items.push({ label: t('property.modelLabel'), value: p.model })
      if (p.year) items.push({ label: t('property.yearLabel'), value: `${p.year}` })
      if (p.seats) items.push({ label: '', value: `${p.seats} ${t('property.seats')}` })
      break
  }
  return items
})

function formatPrice(val: number | null): string {
  if (!val) return '-'
  return `$${val.toLocaleString('fr-FR')}`
}

function formatAddress(p: Property): string {
  const parts: string[] = []
  if (p.address?.town?.name) parts.push(p.address.town.name)
  if (p.address?.city?.name) parts.push(p.address.city.name)
  return parts.join(', ')
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

async function fetchProperty() {
  loading.value = true
  try {
    property.value = await propertiesApi.get(propertyId.value)
  } catch {
    property.value = null
  } finally {
    loading.value = false
  }
}

async function confirmDelete() {
  if (!property.value) return
  deleting.value = true
  try {
    await store.deleteProperty(property.value.id)
    toast.warning(t('toast.deleteSuccess'))
    showDeleteModal.value = false
    navigateTo('/dashboard/landlord/properties')
  } catch (err: any) {
    const message = err?.data?.error?.message || err?.data?.detail || err?.message || t('toast.deleteError')
    toast.error(message)
  } finally {
    deleting.value = false
  }
}

fetchProperty()
</script>

<template>
  <div class="space-y-6">
    <!-- Loading -->
    <div v-if="loading" class="animate-pulse">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-xl overflow-hidden mb-8">
        <div class="aspect-[4/3] bg-gray-200" />
        <div class="hidden md:grid grid-cols-2 gap-2">
          <div class="aspect-[4/3] bg-gray-200" />
          <div class="aspect-[4/3] bg-gray-200" />
          <div class="aspect-[4/3] bg-gray-200" />
          <div class="aspect-[4/3] bg-gray-200" />
        </div>
      </div>
      <div class="space-y-4">
        <div class="h-8 bg-gray-200 rounded w-3/4" />
        <div class="h-4 bg-gray-200 rounded w-1/2" />
        <div class="h-32 bg-gray-200 rounded mt-6" />
      </div>
    </div>

    <!-- Not found -->
    <div v-else-if="!property" class="text-center py-16">
      <HomeModernIcon class="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h2 class="text-lg font-semibold text-gray-900">{{ t('property.notFound') }}</h2>
      <p class="text-sm text-gray-500 mt-1">{{ t('property.notFoundDesc') }}</p>
      <button
        class="btn btn-primary mt-4"
        @click="navigateTo('/dashboard/landlord/properties')"
      >
        {{ t('landlord.properties') }}
      </button>
    </div>

    <!-- Property detail -->
    <template v-else>
      <!-- Back + Actions -->
      <div class="flex items-center justify-between">
        <button
          class="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          @click="navigateTo('/dashboard/landlord/properties')"
        >
          <ArrowLeftIcon class="w-4 h-4" />
          {{ t('landlord.properties') }}
        </button>
        <div class="flex items-center gap-2">
          <button
            class="btn btn-outline-primary btn-sm inline-flex items-center gap-1.5"
            @click="navigateTo(`/dashboard/landlord/properties/${property.id}/edit`)"
          >
            <PencilSquareIcon class="w-4 h-4" />
            {{ t('ui.edit') }}
          </button>
          <button
            v-if="canDelete"
            class="btn btn-outline-danger btn-sm inline-flex items-center gap-1.5"
            @click="showDeleteModal = true"
          >
            <TrashIcon class="w-4 h-4" />
            {{ t('ui.delete') }}
          </button>
        </div>
      </div>

      <!-- Header (like public page) -->
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            :class="typeBadgeColors[property.type] ?? 'bg-gray-100 text-gray-700'"
          >
            {{ typeLabels[property.type] ?? property.type }}
          </span>
          <BaseBadge
            :variant="property.isPublished ? 'success' : 'gray'"
            size="sm"
            dot
          >
            {{ property.isPublished ? t('status.published') : t('status.draft') }}
          </BaseBadge>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">{{ property.title }}</h1>
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-gray-500">
          <div v-if="formatAddress(property)" class="flex items-center gap-1">
            <MapPinIcon class="w-4 h-4" />
            <span>{{ formatAddress(property) }}</span>
          </div>
          <span v-if="formatAddress(property)" class="text-gray-300">&middot;</span>
          <span class="text-xs text-gray-400">{{ formatDate(property.createdAt) }}</span>
        </div>
        <!-- Features row (dynamic per type) -->
        <div v-if="typeFeatures.length > 0" class="flex flex-wrap gap-2 mt-1.5">
          <span
            v-for="(feat, idx) in typeFeatures"
            :key="idx"
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-900"
          >
            <span v-if="feat.label" class="text-gray-500">{{ feat.label }}</span>
            <span class="text-blue-600">{{ feat.value }}</span>
          </span>
        </div>
      </div>

      <!-- Photo Gallery (same component as public page) -->
      <PropertyGallery :photos="property.photos ?? []" :property-type="property.type" />

      <!-- Two column layout (like public page) -->
      <div class="flex gap-8">
        <!-- Left column: main content -->
        <div class="flex-1 min-w-0">
          <!-- Description -->
          <section class="py-6 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ t('property.description') }}</h2>
            <div class="relative">
              <p
                class="text-gray-700 leading-relaxed whitespace-pre-line"
                :class="{ 'line-clamp-4': !showAllDescription && (property.description?.length ?? 0) > 300 }"
              >
                {{ property.description }}
              </p>
              <button
                v-if="(property.description?.length ?? 0) > 300"
                class="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                @click="showAllDescription = !showAllDescription"
              >
                {{ showAllDescription ? t('property.showLess') : t('property.readMore') }}
              </button>
            </div>
          </section>

          <!-- Specs section (dynamic per type, same components as public page) -->
          <section v-if="specsComponent" class="py-6 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ t('property.specs') }}</h2>
            <component :is="specsComponent" :property="property" />
          </section>

          <!-- Amenities (same component as public page, hidden for car) -->
          <section v-if="showAmenities" class="py-6 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ t('property.amenities') }}</h2>
            <PropertyAmenities :property="property" />
          </section>
        </div>

        <!-- Right column: Price & Location -->
        <div class="hidden md:block md:w-[30%] xl:w-[28%] flex-shrink-0">
          <div class="sticky top-24 space-y-4">
            <!-- Price card -->
            <div class="bg-white rounded-xl border border-gray-200 p-5">
              <div v-if="property.pricePerDay" class="mb-3">
                <div class="flex items-baseline gap-1">
                  <span class="text-2xl font-bold text-gray-900">{{ formatPrice(property.pricePerDay) }}</span>
                  <span class="text-sm text-gray-500">/ {{ t('landlord.perDay') }}</span>
                </div>
                <span v-if="rateReady" class="text-sm text-gray-400">({{ formatFC(property.pricePerDay) }})</span>
              </div>
              <div v-if="property.pricePerMonth">
                <div class="flex items-baseline gap-1">
                  <span class="text-2xl font-bold text-gray-900">{{ formatPrice(property.pricePerMonth) }}</span>
                  <span class="text-sm text-gray-500">/ {{ t('landlord.perMonth') }}</span>
                </div>
                <span v-if="rateReady" class="text-sm text-gray-400">({{ formatFC(property.pricePerMonth) }})</span>
              </div>
              <div v-if="property.salePrice" class="mt-3 pt-3 border-t border-gray-100">
                <div class="flex items-baseline gap-1">
                  <span class="text-xl font-bold text-gray-900">{{ formatPrice(property.salePrice) }}</span>
                  <span class="text-sm text-gray-500">{{ t('propertyForm.salePrice') }}</span>
                </div>
              </div>
            </div>

            <!-- Location card -->
            <div v-if="formatAddress(property) || property.address?.street" class="bg-white rounded-xl border border-gray-200 p-5">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">{{ t('property.location') }}</h3>
              <div class="flex items-start gap-2">
                <MapPinIcon class="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p class="text-sm text-gray-700">{{ formatAddress(property) }}</p>
                  <p v-if="property.address?.street" class="text-sm text-gray-500 mt-0.5">
                    {{ property.address.street }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Delete confirmation modal -->
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
          v-if="showDeleteModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        >
          <div class="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div class="p-6 text-center">
              <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon class="w-6 h-6 text-red-600" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ t('ui.delete') }}</h3>
              <p class="text-sm text-gray-500">{{ t('landlord.confirmDelete') }}</p>
              <p class="text-sm font-medium text-gray-700 mt-1">{{ property?.title }}</p>
            </div>
            <div class="flex gap-3 px-6 pb-6">
              <button
                class="btn btn-ghost flex-1"
                :disabled="deleting"
                @click="showDeleteModal = false"
              >
                {{ t('ui.cancel') }}
              </button>
              <button
                class="btn btn-danger flex-1"
                :disabled="deleting"
                @click="confirmDelete"
              >
                {{ deleting ? t('ui.loading') : t('ui.delete') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
