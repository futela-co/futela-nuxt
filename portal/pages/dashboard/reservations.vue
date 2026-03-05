<script setup lang="ts">
import {
  CalendarDaysIcon,
  XMarkIcon,
  CheckIcon,
  ClockIcon,
  InboxIcon,
} from '@heroicons/vue/24/outline'
import { reservationsApi } from '~/infrastructure/api/reservations'
import { formatDateShort } from '~/utils/date'
import type { Reservation } from '~/domain/types/reservation'

definePageMeta({ layout: 'dashboard' })

const { t } = useLocale()
const pagination = usePagination()
const toast = useToast()
const { confirm } = useConfirm()

// ---- Top-level section ----
const activeSection = ref<'mine' | 'received'>('mine')

// ---- "Mes reservations" state ----
const myTab = ref<'upcoming' | 'past' | 'cancelled'>('upcoming')
const reservations = ref<Reservation[]>([])
const myLoading = ref(false)
const myError = ref<string | null>(null)

const myTabs = computed(() => [
  { key: 'upcoming' as const, label: t('dashboard.upcoming') },
  { key: 'past' as const, label: t('dashboard.past') },
  { key: 'cancelled' as const, label: t('dashboard.cancelled') },
])

const myStatusParams = computed(() => {
  switch (myTab.value) {
    case 'upcoming': return { status: 'confirmed,pending' }
    case 'past': return { status: 'completed' }
    case 'cancelled': return { status: 'cancelled' }
  }
})

async function loadReservations() {
  myLoading.value = true
  myError.value = null
  try {
    const response: any = await reservationsApi.myReservations({
      page: pagination.page.value,
      ...myStatusParams.value,
    })
    reservations.value = Array.isArray(response) ? response : (response.data ?? [])
    pagination.updateFromResponse(response)
  } catch (e: any) {
    myError.value = e.message || t('dashboard.loadReservationsError')
  } finally {
    myLoading.value = false
  }
}

async function handleCancel(reservation: Reservation) {
  const confirmed = await confirm({
    title: t('dashboard.cancelReservation'),
    message: t('dashboard.cancelReservationMsg').replace('{title}', reservation.propertyTitle),
    confirmText: t('dashboard.yesCancel'),
    cancelText: t('dashboard.noKeep'),
    variant: 'danger',
  })
  if (!confirmed) return

  try {
    await reservationsApi.cancel(reservation.id)
    toast.warning(t('dashboard.reservationCancelled'))
    loadReservations()
  } catch {
    toast.error(t('dashboard.cancelError'))
  }
}

// ---- "Reservations recues" state ----
const bookingTab = ref<'pending' | 'confirmed' | 'past'>('pending')
const bookings = ref<Reservation[]>([])
const bookingLoading = ref(false)
const bookingError = ref<string | null>(null)

const bookingTabs = computed(() => [
  { key: 'pending' as const, label: t('status.pending') },
  { key: 'confirmed' as const, label: t('dashboard.confirmedPlural') },
  { key: 'past' as const, label: t('dashboard.past') },
])

const bookingStatusParams = computed(() => {
  switch (bookingTab.value) {
    case 'pending': return { status: 'pending' }
    case 'confirmed': return { status: 'confirmed' }
    case 'past': return { status: 'completed,cancelled' }
  }
})

async function loadBookings() {
  bookingLoading.value = true
  bookingError.value = null
  try {
    const response: any = await reservationsApi.myBookings({
      page: pagination.page.value,
      ...bookingStatusParams.value,
    })
    bookings.value = Array.isArray(response) ? response : (response.data ?? [])
    pagination.updateFromResponse(response)
  } catch (e: any) {
    bookingError.value = e.message || t('dashboard.loadBookingsError')
  } finally {
    bookingLoading.value = false
  }
}

async function handleConfirmBooking(booking: Reservation) {
  const confirmed = await confirm({
    title: t('dashboard.confirmReservation'),
    message: t('dashboard.confirmReservationMsg').replace('{guest}', booking.guestName).replace('{title}', booking.propertyTitle),
    confirmText: t('ui.confirm'),
    cancelText: t('ui.cancel'),
    variant: 'success',
  })
  if (!confirmed) return

  try {
    await reservationsApi.confirm(booking.id)
    toast.success(t('dashboard.reservationConfirmed'))
    loadBookings()
  } catch {
    toast.error(t('dashboard.confirmError'))
  }
}

async function handleRejectBooking(booking: Reservation) {
  const confirmed = await confirm({
    title: t('dashboard.rejectReservation'),
    message: t('dashboard.rejectReservationMsg').replace('{guest}', booking.guestName).replace('{title}', booking.propertyTitle),
    confirmText: t('dashboard.yesReject'),
    cancelText: t('dashboard.noKeep'),
    variant: 'danger',
  })
  if (!confirmed) return

  try {
    await reservationsApi.cancel(booking.id)
    toast.warning(t('dashboard.reservationRejected'))
    loadBookings()
  } catch {
    toast.error(t('dashboard.rejectError'))
  }
}

// ---- Shared helpers ----
function statusLabel(status: string): string {
  const map: Record<string, string> = {
    confirmed: t('status.confirmed'),
    pending: t('status.pending'),
    cancelled: t('status.cancelled'),
    completed: t('status.completed'),
  }
  return map[status] ?? status
}

function statusColor(status: string): string {
  const map: Record<string, string> = {
    confirmed: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-gray-100 text-gray-700',
  }
  return map[status] ?? 'bg-gray-100 text-gray-700'
}

function statusIcon(status: string) {
  switch (status) {
    case 'confirmed': return CheckIcon
    case 'pending': return ClockIcon
    case 'cancelled': return XMarkIcon
    default: return CalendarDaysIcon
  }
}

function bookingStatusLabel(status: string): string {
  const map: Record<string, string> = {
    confirmed: t('status.confirmed'),
    pending: t('status.pending'),
    cancelled: t('dashboard.rejected'),
    completed: t('status.completed'),
  }
  return map[status] ?? status
}

// ---- Data loading logic ----
function loadCurrentSection() {
  pagination.reset()
  if (activeSection.value === 'mine') {
    loadReservations()
  } else {
    loadBookings()
  }
}

watch(activeSection, () => {
  loadCurrentSection()
})

watch(myTab, () => {
  if (activeSection.value === 'mine') {
    pagination.reset()
    loadReservations()
  }
})

watch(bookingTab, () => {
  if (activeSection.value === 'received') {
    pagination.reset()
    loadBookings()
  }
})

watch(() => pagination.page.value, () => {
  if (activeSection.value === 'mine') {
    loadReservations()
  } else {
    loadBookings()
  }
})

// Fetch data immediately on navigation (Nuxt pattern)
loadReservations()
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">{{ t('dashboard.reservationsTitle') }}</h1>
      <p class="text-gray-500 text-sm mt-1">{{ t('dashboard.reservationsSubtitle') }}</p>
    </div>

    <!-- Section tabs (top-level) -->
    <div class="flex gap-2 mb-6">
      <button
        class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
        :class="activeSection === 'mine'
          ? 'bg-primary-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        @click="activeSection = 'mine'"
      >
        {{ t('dashboard.myReservations') }}
      </button>
      <button
        class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
        :class="activeSection === 'received'
          ? 'bg-primary-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        @click="activeSection = 'received'"
      >
        {{ t('dashboard.receivedReservations') }}
      </button>
    </div>

    <!-- ========== MES RESERVATIONS ========== -->
    <template v-if="activeSection === 'mine'">
      <!-- Sub-tabs -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="flex gap-6">
          <button
            v-for="tab in myTabs"
            :key="tab.key"
            class="pb-3 text-sm font-medium border-b-2 transition-colors"
            :class="myTab === tab.key
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'"
            @click="myTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Loading skeleton -->
      <div v-if="myLoading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="bg-white rounded-xl shadow-sm p-5">
          <div class="flex gap-4">
            <div class="w-20 h-20 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
            <div class="flex-1 space-y-2">
              <div class="h-5 bg-gray-200 rounded animate-pulse w-2/3" />
              <div class="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
              <div class="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
            </div>
          </div>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="myError" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p class="text-red-700 font-medium">{{ myError }}</p>
        <button
          class="btn btn-danger btn-lg mt-3"
          @click="loadReservations"
        >
          {{ t('dashboard.retry') }}
        </button>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="reservations.length === 0"
        class="bg-white rounded-xl shadow-sm p-12 text-center"
      >
        <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CalendarDaysIcon class="w-8 h-8 text-blue-400" />
        </div>
        <h2 class="text-lg font-semibold text-gray-900">{{ t('dashboard.noReservation') }}</h2>
        <p class="text-gray-500 text-sm mt-2">
          <template v-if="myTab === 'upcoming'">{{ t('dashboard.noUpcomingReservation') }}</template>
          <template v-else-if="myTab === 'past'">{{ t('dashboard.noPastReservation') }}</template>
          <template v-else>{{ t('dashboard.noCancelledReservation') }}</template>
        </p>
        <button
          v-if="myTab === 'upcoming'"
          class="btn btn-primary btn-lg mt-4"
          @click="navigateTo('/search')"
        >
          {{ t('dashboard.exploreProperties') }}
        </button>
      </div>

      <!-- Reservation list -->
      <div v-else class="space-y-4">
        <div
          v-for="reservation in reservations"
          :key="reservation.id"
          class="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow"
        >
          <div class="flex flex-col sm:flex-row gap-4">
            <div class="w-full sm:w-24 h-32 sm:h-24 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-300">
              <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 7.5h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
              </svg>
            </div>

            <div class="flex-1">
              <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <h3 class="font-semibold text-gray-900">{{ reservation.propertyTitle }}</h3>
                  <p class="text-sm text-gray-500 mt-0.5">
                    {{ formatDateShort(reservation.startDate) }} - {{ formatDateShort(reservation.endDate) }}
                    <span class="text-gray-400">({{ reservation.numberOfNights }} {{ t('dashboard.nights') }})</span>
                  </p>
                </div>
                <span
                  :class="[statusColor(reservation.status), 'inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full self-start']"
                >
                  <component :is="statusIcon(reservation.status)" class="w-3.5 h-3.5" />
                  {{ statusLabel(reservation.status) }}
                </span>
              </div>

              <div class="flex items-center gap-4 mt-3 text-sm">
                <span class="font-bold text-gray-900">${{ reservation.totalPrice.toLocaleString('fr-FR') }}</span>
                <span class="text-gray-400">{{ reservation.numberOfGuests }} {{ reservation.numberOfGuests > 1 ? t('dashboard.travelers') : t('dashboard.traveler') }}</span>
              </div>

              <div v-if="reservation.status === 'pending' || reservation.status === 'confirmed'" class="flex gap-2 mt-3">
                <button
                  class="btn btn-outline-danger"
                  @click="handleCancel(reservation)"
                >
                  {{ t('ui.cancel') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ========== RESERVATIONS RECUES ========== -->
    <template v-if="activeSection === 'received'">
      <!-- Sub-tabs -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="flex gap-6">
          <button
            v-for="tab in bookingTabs"
            :key="tab.key"
            class="pb-3 text-sm font-medium border-b-2 transition-colors"
            :class="bookingTab === tab.key
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'"
            @click="bookingTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Loading skeleton -->
      <div v-if="bookingLoading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="bg-white rounded-xl shadow-sm p-5">
          <div class="flex gap-4">
            <div class="w-12 h-12 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
            <div class="flex-1 space-y-2">
              <div class="h-5 bg-gray-200 rounded animate-pulse w-2/3" />
              <div class="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
              <div class="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
            </div>
          </div>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="bookingError" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p class="text-red-700 font-medium">{{ bookingError }}</p>
        <button
          class="btn btn-danger btn-lg mt-3"
          @click="loadBookings"
        >
          {{ t('dashboard.retry') }}
        </button>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="bookings.length === 0"
        class="bg-white rounded-xl shadow-sm p-12 text-center"
      >
        <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <InboxIcon class="w-8 h-8 text-blue-400" />
        </div>
        <h2 class="text-lg font-semibold text-gray-900">{{ t('dashboard.noRequest') }}</h2>
        <p class="text-gray-500 text-sm mt-2">
          <template v-if="bookingTab === 'pending'">{{ t('dashboard.noPendingRequest') }}</template>
          <template v-else-if="bookingTab === 'confirmed'">{{ t('dashboard.noConfirmedReservation') }}</template>
          <template v-else>{{ t('dashboard.noPastBooking') }}</template>
        </p>
      </div>

      <!-- Booking list -->
      <div v-else class="space-y-4">
        <div
          v-for="booking in bookings"
          :key="booking.id"
          class="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow"
        >
          <div class="flex flex-col sm:flex-row gap-4">
            <!-- Guest avatar -->
            <div class="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
              {{ booking.guestName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) }}
            </div>

            <div class="flex-1">
              <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <h3 class="font-semibold text-gray-900">{{ booking.guestName }}</h3>
                  <p class="text-sm text-gray-500 mt-0.5">{{ booking.propertyTitle }}</p>
                  <p class="text-sm text-gray-400 mt-0.5">
                    {{ formatDateShort(booking.startDate) }} - {{ formatDateShort(booking.endDate) }}
                    ({{ booking.numberOfNights }} {{ t('dashboard.nights') }}, {{ booking.numberOfGuests }} {{ t('dashboard.persons') }})
                  </p>
                </div>
                <div class="flex items-center gap-2 self-start">
                  <span
                    :class="[statusColor(booking.status), 'text-xs font-medium px-2.5 py-1 rounded-full']"
                  >
                    {{ bookingStatusLabel(booking.status) }}
                  </span>
                  <span class="text-sm font-bold text-gray-900">${{ booking.totalPrice.toLocaleString('fr-FR') }}</span>
                </div>
              </div>

              <!-- Actions for pending bookings -->
              <div v-if="booking.status === 'pending'" class="flex gap-2 mt-3">
                <button
                  class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                  @click="handleConfirmBooking(booking)"
                >
                  <CheckIcon class="w-3.5 h-3.5" />
                  {{ t('ui.confirm') }}
                </button>
                <button
                  class="btn btn-outline-danger gap-1"
                  @click="handleRejectBooking(booking)"
                >
                  <XMarkIcon class="w-3.5 h-3.5" />
                  {{ t('dashboard.refuse') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Pagination (shared) -->
    <div
      v-if="!myLoading && !bookingLoading && pagination.totalPages.value > 1"
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
