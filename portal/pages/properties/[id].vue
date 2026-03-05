<script setup lang="ts">
import { type Component } from 'vue'
import {
  ArrowLeftIcon,
  HeartIcon,
  ShareIcon,
  HomeIcon,
  MapPinIcon,
  ClipboardDocumentIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolid, StarIcon as StarSolid } from '@heroicons/vue/24/solid'
import { reviewsApi } from '~/infrastructure/api/reviews'
import { reservationsApi } from '~/infrastructure/api/reservations'
import type { Property } from '~/domain/types/property'
import type { Review } from '~/domain/types/user'

definePageMeta({
  layout: 'default',
  public: true,
})

const { t } = useLocale()
const route = useRoute()
const propertyStore = usePropertyStore()
const favoritesStore = useFavoritesStore()
const authStore = useAuthStore()
const ui = useUiStore()
const { formatFC, isReady: rateReady } = useExchangeRate()

const property = computed(() => propertyStore.currentProperty)
const loading = computed(() => propertyStore.loading)
const error = computed(() => propertyStore.error)

// Reviews
const reviews = ref<Review[]>([])
const reviewsLoading = ref(false)
const reviewsPage = ref(1)
const reviewsTotalPages = ref(1)

// Payment modal
const showPaymentModal = ref(false)
const reservationId = ref<string | null>(null)
const paymentPhone = ref('')
const paymentLoading = ref(false)

// UI state
const showVisitForm = ref(false)
const showShareModal = ref(false)
const showAllDescription = ref(false)
const showStickyNav = ref(false)
const activeSection = ref('description')

// Section refs for scroll spy
const sectionRefs = ref<Record<string, HTMLElement | null>>({})

function setSectionRef(key: string) {
  return (el: any) => {
    sectionRefs.value[key] = el
  }
}

// SEO
useSeoMeta({
  title: () => {
    if (property.value) {
      const city = property.value.address?.city?.name ?? ''
      return `${property.value.title} - Location ${city}`
    }
    return t('property.seoLoading')
  },
  description: () => {
    if (property.value) {
      return property.value.description?.slice(0, 160) ?? ''
    }
    return ''
  },
  ogTitle: () => {
    if (property.value) {
      const city = property.value.address?.city?.name ?? ''
      return `${property.value.title} - Location ${city} | Futela`
    }
    return 'Futela'
  },
  ogDescription: () => property.value?.description?.slice(0, 160) ?? '',
  ogImage: () => {
    const photo = property.value?.photos?.[0]
    if (!photo) return '/og-image.png'
    return photo.thumbnails?.large ?? photo.url
  },
  ogType: 'website',
})

// JSON-LD structured data
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() => {
        if (!property.value) return '{}'
        const p = property.value
        return JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'RealEstateListing',
          name: p.title,
          description: p.description,
          url: `${useRequestURL().origin}/properties/${p.id}`,
          image: p.photos?.map((photo) => photo.thumbnails?.large ?? photo.url) ?? [],
          address: p.address
            ? {
                '@type': 'PostalAddress',
                addressLocality: p.address.city?.name ?? '',
                addressRegion: p.address.town?.name ?? '',
              }
            : undefined,
          offers: {
            '@type': 'Offer',
            price: p.pricePerMonth ?? p.pricePerDay ?? 0,
            priceCurrency: 'USD',
            availability: p.isAvailable
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          },
          aggregateRating: p.rating
            ? {
                '@type': 'AggregateRating',
                ratingValue: p.rating,
                reviewCount: p.reviewCount,
              }
            : undefined,
        })
      }),
    },
  ],
})

// Fetch data
onMounted(async () => {
  const id = route.params.id as string
  await propertyStore.fetchProperty(id)

  if (property.value) {
    fetchReviews()
    propertyStore.fetchSimilar(id)
  }

  if (authStore.isAuthenticated) {
    favoritesStore.fetchFavorites()
  }

  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Watch route param changes
watch(() => route.params.id, async (newId) => {
  if (newId && typeof newId === 'string') {
    await propertyStore.fetchProperty(newId)
    if (property.value) {
      reviews.value = []
      reviewsPage.value = 1
      fetchReviews()
      propertyStore.fetchSimilar(newId)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
})

async function fetchReviews(page: number = 1) {
  if (!property.value) return
  reviewsLoading.value = true
  try {
    const response: any = await reviewsApi.propertyReviews(property.value.id, { page, itemsPerPage: 5 })
    const items = Array.isArray(response) ? response : (response.data ?? [])
    if (page === 1) {
      reviews.value = items
    } else {
      reviews.value.push(...items)
    }
    reviewsPage.value = Array.isArray(response) ? 1 : (response.meta?.page ?? 1)
    reviewsTotalPages.value = Array.isArray(response) ? 1 : (response.meta?.totalPages ?? 1)
  } catch {
    // ignore
  } finally {
    reviewsLoading.value = false
  }
}

function loadMoreReviews() {
  if (reviewsPage.value < reviewsTotalPages.value) {
    fetchReviews(reviewsPage.value + 1)
  }
}

// Scroll handling for sticky nav
function handleScroll() {
  showStickyNav.value = window.scrollY > 500

  // Scroll spy
  const sections = navSections.value.map(s => s.id)
  for (const section of [...sections].reverse()) {
    const el = sectionRefs.value[section]
    if (el && el.getBoundingClientRect().top <= 150) {
      activeSection.value = section
      break
    }
  }
}

function scrollToSection(id: string) {
  const el = sectionRefs.value[id]
  if (el) {
    const offset = 120
    const top = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

// Favorites
function handleToggleFavorite() {
  if (!authStore.isAuthenticated) {
    navigateTo({ path: '/auth/login', query: { redirect: useRoute().fullPath } })
    return
  }
  if (property.value) {
    favoritesStore.toggleFavorite(property.value.id)
  }
}

const isFavorite = computed(() => {
  if (!property.value) return false
  return favoritesStore.isFavorite(property.value.id)
})

// Share
function handleShare() {
  showShareModal.value = true
}

function shareTo(platform: string) {
  if (!property.value) return
  const url = window.location.href
  const title = property.value.title

  const shareText = `${t('property.shareDiscover')} ${url}`
  const shareUrls: Record<string, string> = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    email: `mailto:?subject=${encodeURIComponent(t('property.shareEmailSubject').replace('{title}', title))}&body=${encodeURIComponent(`${t('property.shareDiscover')}: ${url}`)}`,
    sms: `sms:?body=${encodeURIComponent(shareText)}`,
  }

  if (platform === 'copy') {
    navigator.clipboard.writeText(url)
    ui.showSuccess(t('property.linkCopied'), t('property.linkCopiedDesc'))
    showShareModal.value = false
    return
  }

  if (shareUrls[platform]) {
    window.open(shareUrls[platform], '_blank')
    showShareModal.value = false
  }
}

// Reservation & Visit
async function handleReserve(data: any) {
  if (!property.value) return
  try {
    const response = await reservationsApi.create({
      propertyId: property.value.id,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      guests: data.guests,
    })
    reservationId.value = response.id
    paymentPhone.value = ''
    showPaymentModal.value = true
  } catch (err: any) {
    ui.showError(t('ui.error'), err?.message ?? t('property.reservationError'))
  }
}

async function handlePayment() {
  if (!paymentPhone.value.trim()) {
    ui.showError(t('ui.error'), t('property.paymentPhoneError'))
    return
  }
  if (!reservationId.value) return
  paymentLoading.value = true
  try {
    await reservationsApi.pay(reservationId.value, {
      paymentPhone: paymentPhone.value,
      currency: 'USD',
    })
    ui.showSuccess(t('property.paymentTitle'), t('property.paymentSuccess'))
    showPaymentModal.value = false
    navigateTo('/dashboard/reservations')
  } catch (err: any) {
    ui.showError(t('ui.error'), err?.message ?? t('property.paymentFailure'))
  } finally {
    paymentLoading.value = false
  }
}

function handleRequestVisit() {
  if (!authStore.isAuthenticated) {
    navigateTo({ path: '/auth/login', query: { redirect: useRoute().fullPath } })
    return
  }
  showVisitForm.value = true
}

function handleContact(ownerId: string) {
  if (!authStore.isAuthenticated) {
    navigateTo({ path: '/auth/login', query: { redirect: useRoute().fullPath } })
    return
  }
  navigateTo({ path: '/dashboard/messages', query: { to: ownerId, property: property.value?.id } })
}

// Helpers
function formatPrice(val: number | null): string {
  if (!val) return '-'
  return `$${val.toLocaleString('fr-FR')}`
}

function formatPropertyType(type: string): string {
  const map: Record<string, string> = {
    apartment: t('property.apartment'),
    house: t('property.house'),
    land: t('property.land'),
    event_hall: t('property.eventHallLabel'),
    car: t('property.car'),
  }
  return map[type] ?? type
}

function typeBadgeClasses(type: string): string {
  const colorMap: Record<string, string> = {
    apartment: 'bg-blue-100 text-blue-700',
    house: 'bg-emerald-100 text-emerald-700',
    land: 'bg-amber-100 text-amber-700',
    event_hall: 'bg-purple-100 text-purple-700',
    car: 'bg-rose-100 text-rose-700',
  }
  return colorMap[type] ?? 'bg-gray-100 text-gray-700'
}

function formatAddress(p: Property): string {
  const parts: string[] = []
  if (p.address?.town?.name) parts.push(p.address.town.name)
  if (p.address?.city?.name) parts.push(p.address.city.name)
  return parts.join(', ')
}

const ratingDistribution = computed(() => {
  const dist: Record<string, number> = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 }
  reviews.value.forEach(r => {
    const key = String(Math.round(r.rating))
    if (dist[key] !== undefined) {
      dist[key]++
    }
  })
  return dist
})

// Specs component per type - use resolveComponent for auto-imported components
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

// Dynamic features row based on type
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

// Section visibility per type
const showAmenities = computed(() => property.value?.type !== 'car')
const showRules = computed(() => ['apartment', 'house', 'event_hall'].includes(property.value?.type ?? ''))
const showMap = computed(() => property.value?.type !== 'car')

// Navigation sections (dynamic per type)
const navSections = computed(() => {
  const sections = [{ id: 'description', label: t('property.description') }]
  if (specsComponent.value) sections.push({ id: 'specs', label: t('property.specs') })
  if (showAmenities.value) sections.push({ id: 'amenities', label: t('property.amenities') })
  if (showRules.value) sections.push({ id: 'rules', label: t('property.rules') })
  sections.push({ id: 'reviews', label: t('property.reviews') })
  if (showMap.value) sections.push({ id: 'map', label: t('property.mapSection') })
  return sections
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading state -->
    <div v-if="loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="animate-pulse">
        <!-- Gallery skeleton -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-xl overflow-hidden mb-8">
          <div class="aspect-[4/3] bg-gray-200" />
          <div class="hidden md:grid grid-cols-2 gap-2">
            <div class="aspect-[4/3] bg-gray-200" />
            <div class="aspect-[4/3] bg-gray-200" />
            <div class="aspect-[4/3] bg-gray-200" />
            <div class="aspect-[4/3] bg-gray-200" />
          </div>
        </div>
        <!-- Content skeleton -->
        <div class="flex gap-8">
          <div class="flex-1 space-y-4">
            <div class="h-8 bg-gray-200 rounded w-3/4" />
            <div class="h-4 bg-gray-200 rounded w-1/2" />
            <div class="h-4 bg-gray-200 rounded w-2/3" />
            <div class="h-32 bg-gray-200 rounded mt-6" />
            <div class="h-32 bg-gray-200 rounded" />
          </div>
          <div class="hidden lg:block w-80">
            <div class="h-96 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    </div>

    <!-- Error / 404 state -->
    <div
      v-else-if="error || !property"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
    >
      <div class="text-center">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <HomeIcon class="w-8 h-8 text-gray-400" />
        </div>
        <h2 class="text-xl font-semibold text-gray-900">{{ t('property.notFound') }}</h2>
        <p class="mt-2 text-gray-500 max-w-sm mx-auto">
          {{ t('property.notFoundDesc') }}
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          <button
            class="btn btn-primary"
            @click="navigateTo('/')"
          >
            {{ t('property.backToHome') }}
          </button>
          <button
            class="btn btn-outline-primary"
            @click="navigateTo('/search')"
          >
            {{ t('property.viewSearches') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <template v-else>
      <!-- Sticky navigation bar -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-full"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-full"
      >
        <div
          v-if="showStickyNav"
          class="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm"
        >
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center h-14 gap-8 overflow-x-auto">
              <button
                v-for="section in navSections"
                :key="section.id"
                class="flex-shrink-0 text-sm font-medium pb-0.5 border-b-2 transition-colors whitespace-nowrap"
                :class="activeSection === section.id
                  ? 'text-primary-600 border-primary-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'"
                @click="scrollToSection(section.id)"
              >
                {{ section.label }}
                <template v-if="section.id === 'reviews' && property.reviewCount">
                  ({{ property.reviewCount }})
                </template>
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- Back button -->
        <button
          class="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          @click="useRouter().back()"
        >
          <ArrowLeftIcon class="w-4 h-4" />
          {{ t('property.backToResults') }}
        </button>

        <!-- Header (above gallery) -->
        <div class="mb-4">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="typeBadgeClasses(property.type)"
                >
                  {{ formatPropertyType(property.type) }}
                </span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
                {{ property.title }}
              </h1>
              <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-gray-500">
                <div v-if="property.rating" class="flex items-center gap-1">
                  <StarSolid class="w-4 h-4 text-yellow-400" />
                  <span class="font-medium text-gray-900">{{ property.rating.toFixed(1) }}</span>
                  <span>({{ property.reviewCount }} {{ t('property.reviews') }})</span>
                </div>
                <span v-if="property.rating && formatAddress(property)" class="text-gray-300">&middot;</span>
                <div v-if="formatAddress(property)" class="flex items-center gap-1">
                  <MapPinIcon class="w-4 h-4" />
                  <span>{{ formatAddress(property) }}</span>
                </div>
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
            <!-- Action buttons -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <button
                class="p-2.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                @click="handleToggleFavorite"
              >
                <HeartSolid
                  v-if="isFavorite"
                  class="w-5 h-5 text-red-500"
                />
                <HeartIcon
                  v-else
                  class="w-5 h-5 text-gray-600"
                />
              </button>
              <button
                class="p-2.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                @click="handleShare"
              >
                <ShareIcon class="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        <!-- Photo Gallery -->
        <PropertyGallery :photos="property.photos" :property-type="property.type" />

        <!-- Two column layout -->
        <div class="flex gap-8 mt-8">
          <!-- Left column: main content -->
          <div class="flex-1 min-w-0">

            <!-- Description section -->
            <section :ref="setSectionRef('description')" class="py-8 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ t('property.description') }}</h2>
              <div class="relative">
                <p
                  class="text-gray-700 leading-relaxed whitespace-pre-line"
                  :class="{ 'line-clamp-4': !showAllDescription && property.description.length > 300 }"
                >
                  {{ property.description }}
                </p>
                <button
                  v-if="property.description.length > 300"
                  class="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                  @click="showAllDescription = !showAllDescription"
                >
                  {{ showAllDescription ? t('property.showLess') : t('property.readMore') }}
                </button>
              </div>
            </section>

            <!-- Specs section (dynamic per type) -->
            <section v-if="specsComponent" :ref="setSectionRef('specs')" class="py-8 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ t('property.specs') }}</h2>
              <component :is="specsComponent" :property="property" />
            </section>

            <!-- Amenities section (hidden for car) -->
            <section v-if="showAmenities" :ref="setSectionRef('amenities')" class="py-8 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ t('property.amenities') }}</h2>
              <PropertyAmenities :property="property" />
            </section>

            <!-- Rules section (apartment, house, event_hall only) -->
            <section v-if="showRules" :ref="setSectionRef('rules')" class="py-8 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ t('property.rules') }}</h2>
              <PropertyRules
                check-in="14:00"
                check-out="11:00"
              />
            </section>

            <!-- Reviews section -->
            <section :ref="setSectionRef('reviews')" class="py-8 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900 mb-6">
                {{ t('property.reviews') }}
                <span v-if="property.reviewCount" class="text-gray-500 font-normal">({{ property.reviewCount }})</span>
              </h2>

              <!-- Rating distribution -->
              <div v-if="property.rating && property.reviewCount > 0" class="mb-8">
                <ReviewRatingDistribution
                  :average="property.rating"
                  :count="property.reviewCount"
                  :distribution="ratingDistribution"
                />
              </div>

              <!-- Reviews list -->
              <div v-if="reviews.length > 0" class="space-y-0">
                <ReviewCard
                  v-for="review in reviews"
                  :key="review.id"
                  :review="review"
                />
              </div>

              <!-- Load more reviews -->
              <button
                v-if="reviewsPage < reviewsTotalPages"
                class="mt-4 text-sm font-medium text-primary-600 hover:text-primary-700"
                :disabled="reviewsLoading"
                @click="loadMoreReviews"
              >
                {{ reviewsLoading ? t('ui.loading') : t('property.allReviews').replace('{count}', String(property.reviewCount)) }}
              </button>

              <!-- Empty reviews -->
              <p
                v-if="reviews.length === 0 && !reviewsLoading"
                class="text-sm text-gray-500"
              >
                {{ t('property.noReviews') }}
              </p>
            </section>

            <!-- Map section (hidden for car) -->
            <section v-if="showMap" :ref="setSectionRef('map')" class="py-8 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ t('property.location') }}</h2>
              <PropertyMap
                :latitude="property.address?.latitude"
                :longitude="property.address?.longitude"
                :address="formatAddress(property)"
              />
            </section>

            <!-- Similar properties -->
            <section v-if="propertyStore.similarProperties.length > 0" class="py-8">
              <h2 class="text-lg font-semibold text-gray-900 mb-6">{{ t('property.similarProperties') }}</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <PropertyCard
                  v-for="similar in propertyStore.similarProperties.slice(0, 3)"
                  :key="similar.id"
                  :property="similar"
                  variant="compact"
                />
              </div>
            </section>
          </div>

          <!-- Right column: reservation sidebar (desktop) -->
          <div class="hidden lg:block lg:w-[30%] xl:w-[28%] flex-shrink-0">
            <div class="sticky top-24">
              <ReservationSidebar
                :property="property"
                @reserve="handleReserve"
                @request-visit="handleRequestVisit"
              />

            </div>
          </div>
        </div>
      </div>

      <!-- Mobile bottom bar -->
      <div class="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-lg">
        <div class="flex items-center justify-between px-4 py-3">
          <div>
            <div v-if="property.pricePerDay" class="flex items-baseline gap-1">
              <span class="text-lg font-bold text-gray-900">{{ formatPrice(property.pricePerDay) }}</span>
              <span class="text-sm text-gray-500">{{ t('property.perDay') }}</span>
              <span v-if="rateReady" class="text-xs text-gray-400">({{ formatFC(property.pricePerDay) }})</span>
            </div>
            <div v-if="property.pricePerMonth" class="text-xs text-gray-500">
              {{ formatPrice(property.pricePerMonth) }} {{ t('property.perMonth') }}
              <span v-if="rateReady" class="text-gray-400">({{ formatFC(property.pricePerMonth) }})</span>
            </div>
          </div>
          <button
            class="btn btn-primary btn-lg"
            @click="handleReserve({ propertyId: property.id })"
          >
            {{ t('property.reserve') }}
          </button>
        </div>
      </div>

      <!-- Spacer for mobile bottom bar -->
      <div class="lg:hidden h-20" />
    </template>

    <!-- Share modal -->
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
          v-if="showShareModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        >
          <div class="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div class="flex items-center justify-between p-5 border-b border-gray-200">
              <h3 class="font-semibold text-gray-900">{{ t('property.shareTitle') }}</h3>
              <button
                class="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                @click="showShareModal = false"
              >
                <XMarkIcon class="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div class="p-5 space-y-3">
              <!-- Copy link -->
              <button
                class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                @click="shareTo('copy')"
              >
                <ClipboardDocumentIcon class="w-5 h-5 text-gray-500" />
                <span class="text-sm font-medium text-gray-700">{{ t('property.copyLink') }}</span>
              </button>
              <!-- WhatsApp -->
              <button
                class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                @click="shareTo('whatsapp')"
              >
                <span class="w-5 h-5 flex items-center justify-center text-green-500 font-bold text-sm">W</span>
                <span class="text-sm font-medium text-gray-700">WhatsApp</span>
              </button>
              <!-- Facebook -->
              <button
                class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                @click="shareTo('facebook')"
              >
                <span class="w-5 h-5 flex items-center justify-center text-blue-600 font-bold text-sm">f</span>
                <span class="text-sm font-medium text-gray-700">Facebook</span>
              </button>
              <!-- Twitter -->
              <button
                class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                @click="shareTo('twitter')"
              >
                <span class="w-5 h-5 flex items-center justify-center text-gray-800 font-bold text-sm">X</span>
                <span class="text-sm font-medium text-gray-700">Twitter / X</span>
              </button>
              <!-- Email -->
              <button
                class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                @click="shareTo('email')"
              >
                <span class="w-5 h-5 flex items-center justify-center text-gray-500 font-bold text-sm">@</span>
                <span class="text-sm font-medium text-gray-700">Email</span>
              </button>
              <!-- SMS -->
              <button
                class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                @click="shareTo('sms')"
              >
                <span class="w-5 h-5 flex items-center justify-center text-gray-500 font-bold text-sm">SMS</span>
                <span class="text-sm font-medium text-gray-700">SMS</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Visit request form modal -->
    <ReservationVisitRequestForm
      v-if="property"
      :property-id="property.id"
      :is-open="showVisitForm"
      @close="showVisitForm = false"
      @submitted="showVisitForm = false"
    />

    <!-- Payment modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showPaymentModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div class="absolute inset-0 bg-black/30" @click="showPaymentModal = false" />
          <div class="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">{{ t('property.paymentTitle') }}</h3>
              <button class="p-1 rounded-lg hover:bg-gray-100" @click="showPaymentModal = false">
                <XMarkIcon class="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('property.phoneNumber') }}</label>
              <input
                v-model="paymentPhone"
                type="tel"
                placeholder="+243..."
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
            </div>
            <div class="flex gap-3 justify-end">
              <button
                class="btn btn-ghost btn-lg"
                @click="showPaymentModal = false"
              >
                {{ t('ui.cancel') }}
              </button>
              <button
                :disabled="!paymentPhone.trim() || paymentLoading"
                class="btn btn-primary btn-lg"
                @click="handlePayment"
              >
                {{ paymentLoading ? t('property.processing') : t('property.pay') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
