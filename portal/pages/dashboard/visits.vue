<script setup lang="ts">
import {
  HomeModernIcon,
  CalendarDaysIcon,
  ClockIcon,
  XMarkIcon,
  CheckIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'
import { StarIcon as StarSolid } from '@heroicons/vue/24/solid'
import { StarIcon as StarOutline } from '@heroicons/vue/24/outline'
import { visitsApi } from '~shared/infrastructure/api/visits'
import { reviewsApi } from '~shared/infrastructure/api/reviews'
import { formatDateTime, formatDateShort } from '~shared/utils/date'
import type { Visit } from '~shared/domain/types/reservation'
import type { Review } from '~shared/domain/types/user'

definePageMeta({ layout: 'dashboard' })

const { t } = useLocale()
const pagination = usePagination()
const toast = useToast()
const { confirm } = useConfirm()

// ---- Top-level section ----
const activeSection = ref<'visits' | 'reviews'>('visits')

// ---- Visits state ----
const visitTab = ref<'upcoming' | 'past'>('upcoming')
const visits = ref<Visit[]>([])
const visitLoading = ref(false)
const visitError = ref<string | null>(null)

const visitTabs = computed(() => [
  { key: 'upcoming' as const, label: t('dashboard.upcoming') },
  { key: 'past' as const, label: t('dashboard.past') },
])

async function loadVisits() {
  visitLoading.value = true
  visitError.value = null
  try {
    const response: any = await visitsApi.myVisits({
      page: pagination.page.value,
      status: visitTab.value === 'upcoming' ? 'scheduled,confirmed' : 'completed,cancelled',
    })
    visits.value = Array.isArray(response) ? response : (response.data ?? [])
    pagination.updateFromResponse(response)
  } catch (e: any) {
    visitError.value = e.message || t('dashboard.loadVisitsError')
  } finally {
    visitLoading.value = false
  }
}

async function handleCancelVisit(visit: Visit) {
  const confirmed = await confirm({
    title: t('dashboard.cancelVisit'),
    message: t('dashboard.cancelVisitMsg').replace('{title}', visit.propertyTitle),
    confirmText: t('dashboard.yesCancel'),
    cancelText: t('dashboard.noKeep'),
    variant: 'danger',
  })
  if (!confirmed) return

  try {
    await visitsApi.cancel(visit.id)
    toast.warning(t('dashboard.visitCancelled'))
    loadVisits()
  } catch {
    toast.error(t('dashboard.cancelError'))
  }
}

function visitStatusLabel(status: string): string {
  const map: Record<string, string> = {
    scheduled: t('dashboard.scheduled'),
    confirmed: t('status.confirmed'),
    completed: t('status.completed'),
    cancelled: t('status.cancelled'),
  }
  return map[status] ?? status
}

function visitStatusColor(status: string): string {
  const map: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
  }
  return map[status] ?? 'bg-gray-100 text-gray-700'
}

function visitStatusIcon(status: string) {
  switch (status) {
    case 'confirmed': return CheckIcon
    case 'scheduled': return ClockIcon
    case 'cancelled': return XMarkIcon
    default: return CalendarDaysIcon
  }
}

// ---- Reviews state ----
const reviewTab = ref<'written' | 'received'>('written')
const reviews = ref<Review[]>([])
const reviewLoading = ref(false)
const reviewError = ref<string | null>(null)

const reviewTabs = computed(() => [
  { key: 'written' as const, label: t('dashboard.myReviews') },
  { key: 'received' as const, label: t('dashboard.receivedReviews') },
])

async function loadReviews() {
  reviewLoading.value = true
  reviewError.value = null
  try {
    const response: any = await reviewsApi.myReviews({
      page: pagination.page.value,
      type: reviewTab.value,
    })
    reviews.value = Array.isArray(response) ? response : (response.data ?? [])
    pagination.updateFromResponse(response)
  } catch (e: any) {
    reviewError.value = e.message || t('dashboard.loadReviewsError')
  } finally {
    reviewLoading.value = false
  }
}

async function handleDeleteReview(review: Review) {
  const confirmed = await confirm({
    title: t('dashboard.deleteReview'),
    message: t('dashboard.deleteReviewMsg').replace('{title}', review.propertyTitle),
    confirmText: t('dashboard.yesDelete'),
    cancelText: t('ui.cancel'),
    variant: 'danger',
  })
  if (!confirmed) return

  try {
    await reviewsApi.delete(review.id)
    toast.warning(t('dashboard.reviewDeleted'))
    loadReviews()
  } catch {
    toast.error(t('dashboard.deleteError'))
  }
}

function renderStars(rating: number): number[] {
  return Array.from({ length: 5 }, (_, i) => i + 1)
}

// ---- Data loading logic ----
function loadCurrentSection() {
  pagination.reset()
  if (activeSection.value === 'visits') {
    loadVisits()
  } else {
    loadReviews()
  }
}

watch(activeSection, () => {
  loadCurrentSection()
})

watch(visitTab, () => {
  if (activeSection.value === 'visits') {
    pagination.reset()
    loadVisits()
  }
})

watch(reviewTab, () => {
  if (activeSection.value === 'reviews') {
    pagination.reset()
    loadReviews()
  }
})

watch(() => pagination.page.value, () => {
  if (activeSection.value === 'visits') {
    loadVisits()
  } else {
    loadReviews()
  }
})

// Fetch data immediately on navigation (Nuxt pattern)
loadVisits()
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">{{ t('dashboard.visitsAndReviews') }}</h1>
      <p class="text-gray-500 text-sm mt-1">{{ t('dashboard.visitsAndReviewsSubtitle') }}</p>
    </div>

    <!-- Section tabs (top-level) -->
    <div class="flex gap-2 mb-6">
      <button
        class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
        :class="activeSection === 'visits'
          ? 'bg-primary-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        @click="activeSection = 'visits'"
      >
        {{ t('dashboard.visits') }}
      </button>
      <button
        class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
        :class="activeSection === 'reviews'
          ? 'bg-primary-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        @click="activeSection = 'reviews'"
      >
        {{ t('dashboard.reviews') }}
      </button>
    </div>

    <!-- ========== VISITES ========== -->
    <template v-if="activeSection === 'visits'">
      <!-- Sub-tabs -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="flex gap-6">
          <button
            v-for="tab in visitTabs"
            :key="tab.key"
            class="pb-3 text-sm font-medium border-b-2 transition-colors"
            :class="visitTab === tab.key
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'"
            @click="visitTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Loading skeleton -->
      <div v-if="visitLoading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="bg-white rounded-xl shadow-sm p-5">
          <div class="flex gap-4">
            <div class="w-12 h-12 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
            <div class="flex-1 space-y-2">
              <div class="h-5 bg-gray-200 rounded animate-pulse w-2/3" />
              <div class="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
              <div class="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
            </div>
          </div>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="visitError" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p class="text-red-700 font-medium">{{ visitError }}</p>
        <button
          class="btn btn-danger btn-lg mt-3"
          @click="loadVisits"
        >
          {{ t('dashboard.retry') }}
        </button>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="visits.length === 0"
        class="bg-white rounded-xl shadow-sm p-12 text-center"
      >
        <div class="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <HomeModernIcon class="w-8 h-8 text-emerald-400" />
        </div>
        <h2 class="text-lg font-semibold text-gray-900">{{ t('dashboard.noVisit') }}</h2>
        <p class="text-gray-500 text-sm mt-2">
          <template v-if="visitTab === 'upcoming'">{{ t('dashboard.noUpcomingVisit') }}</template>
          <template v-else>{{ t('dashboard.noPastVisit') }}</template>
        </p>
      </div>

      <!-- Visit list -->
      <div v-else class="space-y-4">
        <div
          v-for="visit in visits"
          :key="visit.id"
          class="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow"
        >
          <div class="flex flex-col sm:flex-row gap-4">
            <div class="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <HomeModernIcon class="w-6 h-6 text-blue-500" />
            </div>

            <div class="flex-1">
              <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <h3 class="font-semibold text-gray-900">{{ visit.propertyTitle }}</h3>
                  <div class="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                    <CalendarDaysIcon class="w-4 h-4" />
                    <span>{{ formatDateTime(visit.scheduledAt) }}</span>
                  </div>
                  <p v-if="visit.notes" class="text-sm text-gray-400 mt-1">{{ visit.notes }}</p>
                </div>
                <span
                  :class="[visitStatusColor(visit.status), 'inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full self-start']"
                >
                  <component :is="visitStatusIcon(visit.status)" class="w-3.5 h-3.5" />
                  {{ visitStatusLabel(visit.status) }}
                </span>
              </div>

              <div
                v-if="visit.status === 'scheduled' || visit.status === 'confirmed'"
                class="flex gap-2 mt-3"
              >
                <button
                  class="btn btn-outline-danger"
                  @click="handleCancelVisit(visit)"
                >
                  {{ t('dashboard.cancelVisitBtn') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ========== AVIS ========== -->
    <template v-if="activeSection === 'reviews'">
      <!-- Sub-tabs -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="flex gap-6">
          <button
            v-for="tab in reviewTabs"
            :key="tab.key"
            class="pb-3 text-sm font-medium border-b-2 transition-colors"
            :class="reviewTab === tab.key
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'"
            @click="reviewTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Loading skeleton -->
      <div v-if="reviewLoading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="bg-white rounded-xl shadow-sm p-5">
          <div class="space-y-2">
            <div class="h-5 bg-gray-200 rounded animate-pulse w-2/3" />
            <div class="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
            <div class="h-16 bg-gray-200 rounded animate-pulse w-full" />
          </div>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="reviewError" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p class="text-red-700 font-medium">{{ reviewError }}</p>
        <button
          class="btn btn-danger btn-lg mt-3"
          @click="loadReviews"
        >
          {{ t('dashboard.retry') }}
        </button>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="reviews.length === 0"
        class="bg-white rounded-xl shadow-sm p-12 text-center"
      >
        <div class="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <StarOutline class="w-8 h-8 text-yellow-400" />
        </div>
        <h2 class="text-lg font-semibold text-gray-900">{{ t('dashboard.noReview') }}</h2>
        <p class="text-gray-500 text-sm mt-2">
          <template v-if="reviewTab === 'written'">{{ t('dashboard.noWrittenReview') }}</template>
          <template v-else>{{ t('dashboard.noReceivedReview') }}</template>
        </p>
      </div>

      <!-- Review list -->
      <div v-else class="space-y-4">
        <div
          v-for="review in reviews"
          :key="review.id"
          class="bg-white rounded-xl shadow-sm p-5"
        >
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900">{{ review.propertyTitle }}</h3>
              <div class="flex items-center gap-1 mt-1">
                <template v-for="star in renderStars(review.rating)" :key="star">
                  <StarSolid
                    v-if="star <= review.rating"
                    class="w-4 h-4 text-yellow-400"
                  />
                  <StarOutline
                    v-else
                    class="w-4 h-4 text-gray-300"
                  />
                </template>
                <span class="text-sm text-gray-500 ml-1">{{ review.rating }}/5</span>
              </div>
              <p class="text-sm text-gray-500 mt-1">
                <template v-if="reviewTab === 'written'">{{ t('dashboard.propertyOf') }} {{ review.revieweeName }}</template>
                <template v-else>{{ t('dashboard.by') }} {{ review.reviewerName }}</template>
                &middot; {{ formatDateShort(review.createdAt) }}
              </p>
            </div>

            <!-- Actions (only for own reviews) -->
            <div v-if="reviewTab === 'written'" class="flex gap-2 self-start">
              <button
                class="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                :title="t('ui.delete')"
                @click="handleDeleteReview(review)"
              >
                <TrashIcon class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Review content -->
          <div class="mt-3">
            <p v-if="review.title" class="text-sm font-medium text-gray-800">{{ review.title }}</p>
            <p class="text-sm text-gray-600 mt-1">{{ review.comment }}</p>
          </div>

          <!-- Pros/Cons -->
          <div v-if="review.pros || review.cons" class="mt-3 flex flex-col sm:flex-row gap-3">
            <div v-if="review.pros" class="flex-1">
              <p class="text-xs font-medium text-emerald-700 mb-0.5">{{ t('dashboard.positivePoints') }}</p>
              <p class="text-sm text-gray-600">{{ review.pros }}</p>
            </div>
            <div v-if="review.cons" class="flex-1">
              <p class="text-xs font-medium text-red-700 mb-0.5">{{ t('dashboard.negativePoints') }}</p>
              <p class="text-sm text-gray-600">{{ review.cons }}</p>
            </div>
          </div>

          <!-- Owner response -->
          <div v-if="review.response" class="mt-3 bg-gray-50 rounded-lg p-3">
            <p class="text-xs font-medium text-gray-500 mb-1">{{ t('dashboard.ownerResponse') }}</p>
            <p class="text-sm text-gray-700">{{ review.response }}</p>
          </div>
        </div>
      </div>
    </template>

    <!-- Pagination (shared) -->
    <div
      v-if="!visitLoading && !reviewLoading && pagination.totalPages.value > 1"
      class="mt-8 flex justify-center"
    >
      <nav class="flex items-center gap-1">
        <button
          :disabled="!pagination.hasPrev.value"
          class="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="pagination.prevPage()"
        >
          {{ t('ui.previous') }}
        </button>
        <template v-for="p in pagination.visiblePages.value" :key="p">
          <span v-if="p === '...'" class="px-2 text-gray-400">...</span>
          <button
            v-else
            class="w-10 h-10 text-sm rounded-lg"
            :class="p === pagination.page.value
              ? 'bg-primary-600 text-white font-semibold'
              : 'border border-gray-300 hover:bg-gray-50 text-gray-700'"
            @click="pagination.goToPage(p as number)"
          >
            {{ p }}
          </button>
        </template>
        <button
          :disabled="!pagination.hasNext.value"
          class="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="pagination.nextPage()"
        >
          {{ t('ui.next') }}
        </button>
      </nav>
    </div>
  </div>
</template>
