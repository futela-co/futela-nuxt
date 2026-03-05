<script setup lang="ts">
import {
  HeartIcon as HeartOutline,
  BuildingOffice2Icon,
  HomeIcon,
  GlobeAltIcon,
  BuildingLibraryIcon,
  TruckIcon,
  PhotoIcon,
} from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolid, StarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/solid'
import { useFavoritesStore } from '~/stores/favorites'
import { useAuthStore } from '~/stores/auth'
import type { Property } from '~/types/property'

interface Props {
  property?: Property
  variant?: 'vertical' | 'horizontal' | 'compact' | 'skeleton'
  showFavorite?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'vertical',
  showFavorite: true,
})

const emit = defineEmits<{
  click: [property: Property]
  'toggle-favorite': [propertyId: string]
}>()

const favoritesStore = useFavoritesStore()
const authStore = useAuthStore()

const currentPhotoIndex = ref(0)
const isHovered = ref(false)
const imgErrored = ref(false)

const photos = computed(() => props.property?.photos ?? [])
const hasMultiplePhotos = computed(() => photos.value.length > 1)
const currentPhotoUrl = computed(() => {
  const photo = photos.value[currentPhotoIndex.value]
  if (!photo) return ''
  return photo.thumbnails?.medium_webp ?? photo.thumbnails?.medium ?? photo.url
})

// Reset error state when switching photos
watch(currentPhotoIndex, () => { imgErrored.value = false })

function onImgError() {
  imgErrored.value = true
}

const isFavorite = computed(() => {
  if (!props.property) return false
  return favoritesStore.isFavorite(props.property.id)
})

const isNew = computed(() => {
  if (!props.property) return false
  const created = new Date(props.property.createdAt)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
  return diffDays < 7
})

const location = computed(() => {
  if (!props.property?.address) return ''
  const city = props.property.address.city?.name ?? ''
  const town = props.property.address.town?.name ?? ''
  return town ? `${town}, ${city}` : city
})

const typeLabel = computed(() => {
  const typeMap: Record<string, string> = {
    apartment: 'Appartement',
    house: 'Maison',
    land: 'Terrain',
    event_hall: 'Salle',
    car: 'Voiture',
  }
  return typeMap[props.property?.type ?? ''] ?? props.property?.type ?? ''
})

const typeBadgeClasses = computed(() => {
  const colorMap: Record<string, string> = {
    apartment: 'bg-blue-100 text-blue-700',
    house: 'bg-emerald-100 text-emerald-700',
    land: 'bg-amber-100 text-amber-700',
    event_hall: 'bg-purple-100 text-purple-700',
    car: 'bg-rose-100 text-rose-700',
  }
  return colorMap[props.property?.type ?? ''] ?? 'bg-gray-100 text-gray-700'
})

const typeDetails = computed(() => {
  const p = props.property
  if (!p) return ''
  switch (p.type) {
    case 'apartment':
      return [
        p.squareMeters ? `${p.squareMeters} m²` : null,
        p.bedrooms ? `${p.bedrooms} ch.` : null,
        p.bathrooms ? `${p.bathrooms} sdb` : null,
        p.floor ? `${p.floor}e etage` : null,
      ].filter(Boolean).join(' · ')
    case 'house':
      return [
        p.houseSquareMeters ? `${p.houseSquareMeters} m²` : null,
        p.bedrooms ? `${p.bedrooms} ch.` : null,
        p.bathrooms ? `${p.bathrooms} sdb` : null,
        p.floors ? `${p.floors} etage${p.floors > 1 ? 's' : ''}` : null,
      ].filter(Boolean).join(' · ')
    case 'land':
      return [
        p.squareMeters ? `${p.squareMeters} m²` : (p.landSquareMeters ? `${p.landSquareMeters} m²` : null),
        p.hasWaterAccess ? 'Eau' : null,
        p.hasElectricityAccess ? 'Electricite' : null,
      ].filter(Boolean).join(' · ')
    case 'event_hall':
      return [
        p.capacity ? `${p.capacity} places` : null,
        p.hasParking ? 'Parking' : null,
        p.hasSoundSystem ? 'Sono' : null,
        p.hasKitchen ? 'Cuisine' : null,
      ].filter(Boolean).join(' · ')
    case 'car':
      return [
        p.brand && p.model ? `${p.brand} ${p.model}` : null,
        p.year ? `${p.year}` : null,
        p.seats ? `${p.seats} places` : null,
        p.transmissionLabel ?? null,
        p.fuelTypeLabel ?? null,
      ].filter(Boolean).join(' · ')
    default:
      return ''
  }
})

function prevPhoto(e: Event) {
  e.stopPropagation()
  if (currentPhotoIndex.value > 0) {
    currentPhotoIndex.value--
  } else {
    currentPhotoIndex.value = photos.value.length - 1
  }
}

function nextPhoto(e: Event) {
  e.stopPropagation()
  if (currentPhotoIndex.value < photos.value.length - 1) {
    currentPhotoIndex.value++
  } else {
    currentPhotoIndex.value = 0
  }
}

const toast = useToast()
const { formatFC, isReady: rateReady } = useExchangeRate()

async function handleFavoriteClick(e: Event) {
  e.stopPropagation()
  if (!authStore.isAuthenticated) {
    navigateTo({ path: '/auth/login', query: { redirect: `/properties/${props.property?.id}` } })
    return
  }
  if (props.property) {
    const wasFavorite = favoritesStore.isFavorite(props.property.id)
    const success = await favoritesStore.toggleFavorite(props.property.id)
    if (success) {
      if (wasFavorite) {
        toast.warning('Retire des favoris')
      } else {
        toast.success('Ajoute aux favoris')
      }
    } else {
      toast.error('Erreur lors de la mise a jour des favoris')
    }
    emit('toggle-favorite', props.property.id)
  }
}

function handleCardClick() {
  if (props.property) {
    emit('click', props.property)
    navigateTo(`/properties/${props.property.id}`)
  }
}

function formatPrice(value: number | null): string {
  if (!value) return ''
  return `$${value.toLocaleString('fr-FR')}`
}

// For apartment/house: monthly is primary, daily is secondary
const isMonthlyPrimary = computed(() => ['apartment', 'house'].includes(props.property?.type ?? ''))

const primaryPrice = computed(() => {
  const p = props.property
  if (!p) return null
  if (isMonthlyPrimary.value && p.pricePerMonth) return { value: p.pricePerMonth, label: '/mois', short: '/mois' }
  if (p.pricePerDay) return { value: p.pricePerDay, label: '/jour', short: '/j' }
  if (p.pricePerMonth) return { value: p.pricePerMonth, label: '/mois', short: '/mois' }
  return null
})

const secondaryPrice = computed(() => {
  const p = props.property
  if (!p) return null
  if (isMonthlyPrimary.value && p.pricePerMonth && p.pricePerDay) return { value: p.pricePerDay, label: '/jour', short: '/j' }
  if (!isMonthlyPrimary.value && p.pricePerDay && p.pricePerMonth) return { value: p.pricePerMonth, label: '/mois', short: '/mois' }
  return null
})

const isPlaceholder = computed(() => photos.value.length === 0 || imgErrored.value)

const placeholderColors = computed(() => {
  const colorMap: Record<string, { bg: string; border: string; iconColor: string }> = {
    apartment: { bg: 'bg-blue-50', border: 'border-blue-200', iconColor: 'text-blue-300' },
    house: { bg: 'bg-emerald-50', border: 'border-emerald-200', iconColor: 'text-emerald-300' },
    land: { bg: 'bg-amber-50', border: 'border-amber-200', iconColor: 'text-amber-300' },
    event_hall: { bg: 'bg-purple-50', border: 'border-purple-200', iconColor: 'text-purple-300' },
    car: { bg: 'bg-rose-50', border: 'border-rose-200', iconColor: 'text-rose-300' },
  }
  return colorMap[props.property?.type ?? ''] ?? { bg: 'bg-gray-50', border: 'border-gray-200', iconColor: 'text-gray-300' }
})

const placeholderIcon = computed(() => {
  const map: Record<string, any> = {
    apartment: BuildingOffice2Icon,
    house: HomeIcon,
    land: GlobeAltIcon,
    event_hall: BuildingLibraryIcon,
    car: TruckIcon,
  }
  return map[props.property?.type ?? ''] ?? PhotoIcon
})
</script>

<template>
  <!-- Skeleton variant -->
  <div
    v-if="variant === 'skeleton'"
    class="bg-white rounded-xl overflow-hidden shadow-sm"
  >
    <div class="aspect-[4/3] bg-gray-200 animate-pulse" />
    <div class="p-4 space-y-3">
      <div class="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
      <div class="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
      <div class="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
      <div class="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
    </div>
  </div>

  <!-- Horizontal variant -->
  <div
    v-else-if="variant === 'horizontal' && property"
    class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer flex"
    @click="handleCardClick"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div class="relative w-64 flex-shrink-0">
      <!-- Colored placeholder -->
      <div
        v-if="isPlaceholder"
        class="w-full h-full flex flex-col items-center justify-center border-2 border-dashed"
        :class="[placeholderColors.bg, placeholderColors.border]"
      >
        <component :is="placeholderIcon" class="w-10 h-10 mb-1" :class="placeholderColors.iconColor" />
        <span class="text-xs font-medium" :class="placeholderColors.iconColor">Aucune photo</span>
      </div>
      <img
        v-else
        :src="currentPhotoUrl"
        :alt="property.title"
        class="w-full h-full object-cover"
        loading="lazy"
        @error="onImgError"
      >
      <span
        v-if="typeLabel"
        class="absolute top-3 left-3 backdrop-blur-sm text-xs font-normal px-2.5 py-1 rounded-full"
        :class="typeBadgeClasses"
      >
        {{ typeLabel }}
      </span>
      <button
        v-if="showFavorite"
        class="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
        @click="handleFavoriteClick"
      >
        <HeartSolid v-if="isFavorite" class="w-5 h-5 text-red-500" />
        <HeartOutline v-else class="w-5 h-5 text-gray-600" />
      </button>
      <!-- Carousel dots -->
      <div
        v-if="hasMultiplePhotos"
        class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1"
      >
        <span
          v-for="(_, idx) in photos.slice(0, 5)"
          :key="idx"
          class="w-1.5 h-1.5 rounded-full transition-colors"
          :class="idx === currentPhotoIndex ? 'bg-white' : 'bg-white/50'"
        />
      </div>
    </div>
    <div class="flex-1 p-4 flex flex-col justify-between">
      <div>
        <div class="flex items-start justify-between">
          <h3 class="font-semibold text-gray-900 line-clamp-1">{{ property.title }}</h3>
        </div>
        <p class="text-sm text-gray-500 mt-1">{{ location }}</p>
        <p v-if="typeDetails" class="text-xs text-gray-400 mt-1">{{ typeDetails }}</p>
      </div>
      <div>
        <div class="flex items-baseline gap-2 mt-2">
          <span v-if="primaryPrice" class="font-bold text-gray-900">{{ formatPrice(primaryPrice.value) }}{{ primaryPrice.label }}</span>
          <span v-if="primaryPrice && rateReady" class="text-xs text-gray-400">({{ formatFC(primaryPrice.value) }})</span>
          <span v-if="secondaryPrice" class="text-gray-400">&middot;</span>
          <span v-if="secondaryPrice" class="text-sm text-gray-600">{{ formatPrice(secondaryPrice.value) }}{{ secondaryPrice.label }}</span>
        </div>
        <div class="flex items-center gap-1 mt-1">
          <StarIcon class="w-4 h-4 text-yellow-400" />
          <span class="text-sm font-medium text-gray-700">{{ property.rating?.toFixed(1) ?? '-' }}</span>
          <span class="text-sm text-gray-400">({{ property.reviewCount }} avis)</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Compact variant -->
  <div
    v-else-if="variant === 'compact' && property"
    class="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
    @click="handleCardClick"
  >
    <div class="relative aspect-[4/3]">
      <!-- Colored placeholder -->
      <div
        v-if="isPlaceholder"
        class="w-full h-full flex flex-col items-center justify-center border-2 border-dashed rounded-t-lg"
        :class="[placeholderColors.bg, placeholderColors.border]"
      >
        <component :is="placeholderIcon" class="w-8 h-8 mb-1" :class="placeholderColors.iconColor" />
        <span class="text-xs font-medium" :class="placeholderColors.iconColor">Aucune photo</span>
      </div>
      <img
        v-else
        :src="currentPhotoUrl"
        :alt="property.title"
        class="w-full h-full object-cover"
        loading="lazy"
        @error="onImgError"
      >
      <button
        v-if="showFavorite"
        class="absolute top-2 right-2 p-1 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
        @click="handleFavoriteClick"
      >
        <HeartSolid v-if="isFavorite" class="w-4 h-4 text-red-500" />
        <HeartOutline v-else class="w-4 h-4 text-gray-600" />
      </button>
    </div>
    <div class="p-2.5">
      <h3 class="text-sm font-semibold text-gray-900 line-clamp-1">{{ property.title }}</h3>
      <div class="flex items-center gap-1.5 mt-1">
        <span v-if="primaryPrice" class="text-sm font-bold text-gray-900">{{ formatPrice(primaryPrice.value) }}{{ primaryPrice.short }}</span>
        <span v-if="primaryPrice && rateReady" class="text-[10px] text-gray-400">({{ formatFC(primaryPrice.value) }})</span>
        <span class="text-gray-300">&middot;</span>
        <StarIcon class="w-3.5 h-3.5 text-yellow-400" />
        <span class="text-xs text-gray-600">{{ property.rating?.toFixed(1) ?? '-' }}</span>
      </div>
    </div>
  </div>

  <!-- Default vertical variant -->
  <div
    v-else-if="property"
    class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer group"
    @click="handleCardClick"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div class="relative aspect-[3/2] overflow-hidden">
      <!-- Colored placeholder -->
      <div
        v-if="isPlaceholder"
        class="w-full h-full flex flex-col items-center justify-center border-2 border-dashed"
        :class="[placeholderColors.bg, placeholderColors.border]"
      >
        <component :is="placeholderIcon" class="w-14 h-14 mb-2" :class="placeholderColors.iconColor" />
        <span class="text-sm font-medium" :class="placeholderColors.iconColor">Aucune photo</span>
      </div>
      <img
        v-else
        :src="currentPhotoUrl"
        :alt="property.title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
        @error="onImgError"
      >
      <!-- Type badge -->
      <span
        v-if="typeLabel"
        class="absolute top-3 left-3 backdrop-blur-sm text-xs font-normal px-2.5 py-1 rounded-full"
        :class="typeBadgeClasses"
      >
        {{ typeLabel }}
        <template v-if="isNew"> • NOUVEAU</template>
      </span>
      <!-- Favorite button -->
      <button
        v-if="showFavorite"
        class="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
        @click="handleFavoriteClick"
      >
        <HeartSolid v-if="isFavorite" class="w-5 h-5 text-red-500" />
        <HeartOutline v-else class="w-5 h-5 text-gray-600" />
      </button>
      <!-- Carousel arrows (desktop only) -->
      <template v-if="hasMultiplePhotos && isHovered">
        <button
          class="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/90 shadow hover:bg-white transition-colors"
          @click="prevPhoto"
        >
          <ChevronLeftIcon class="w-4 h-4 text-gray-700" />
        </button>
        <button
          class="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/90 shadow hover:bg-white transition-colors"
          @click="nextPhoto"
        >
          <ChevronRightIcon class="w-4 h-4 text-gray-700" />
        </button>
      </template>
      <!-- Carousel dots -->
      <div
        v-if="hasMultiplePhotos"
        class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1"
      >
        <span
          v-for="(_, idx) in photos.slice(0, 5)"
          :key="idx"
          class="w-1.5 h-1.5 rounded-full transition-colors"
          :class="idx === currentPhotoIndex ? 'bg-white' : 'bg-white/50'"
        />
      </div>
    </div>
    <div class="p-3">
      <h3 class="text-sm font-semibold text-gray-900 line-clamp-1">{{ property.title }}</h3>
      <p class="text-xs text-gray-500 mt-0.5">{{ location }}</p>
      <p v-if="typeDetails" class="text-xs text-gray-400 mt-0.5">{{ typeDetails }}</p>
      <div class="flex items-baseline gap-2 mt-1.5">
        <span v-if="primaryPrice" class="text-sm font-bold text-gray-900">{{ formatPrice(primaryPrice.value) }}{{ primaryPrice.label }}</span>
        <span v-if="primaryPrice && rateReady" class="text-xs text-gray-400">({{ formatFC(primaryPrice.value) }})</span>
        <span v-if="secondaryPrice" class="text-gray-400">&middot;</span>
        <span v-if="secondaryPrice" class="text-xs text-gray-600">{{ formatPrice(secondaryPrice.value) }}{{ secondaryPrice.label }}</span>
      </div>
      <div class="flex items-center gap-1 mt-1">
        <StarIcon class="w-3.5 h-3.5 text-yellow-400" />
        <span class="text-xs font-medium text-gray-700">{{ property.rating?.toFixed(1) ?? '-' }}</span>
        <span class="text-xs text-gray-400">({{ property.reviewCount }} avis)</span>
      </div>
    </div>
  </div>
</template>
