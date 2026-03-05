<script setup lang="ts">
import {
  CurrencyDollarIcon,
  HomeModernIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'
import { useLandlordStore } from '~shared/application/stores/landlord'

definePageMeta({ layout: 'dashboard', landlord: true })

const { t } = useLocale()
const store = useLandlordStore()
const { formatFC, isReady: rateReady } = useExchangeRate()

let refreshInterval: ReturnType<typeof setInterval> | null = null

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value)
}

// Fetch data immediately on navigation (Nuxt pattern)
store.fetchDashboard()
store.fetchProperties({ page: 1, itemsPerPage: 5 })

onMounted(() => {
  // Auto-refresh every 60s (requires DOM lifecycle)
  refreshInterval = setInterval(() => {
    store.fetchDashboard()
  }, 60000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900">{{ t('landlord.dashboardTitle') }}</h1>
        <p class="text-sm text-gray-500">{{ t('landlord.dashboardSubtitle') }}</p>
      </div>
      <button
        class="btn btn-primary"
        @click="navigateTo('/dashboard/landlord/properties/create')"
      >
        {{ t('landlord.addProperty') }}
      </button>
    </div>

    <!-- Loading state -->
    <template v-if="store.dashboardLoading && !store.dashboard">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="i in 4"
          :key="i"
          class="bg-white rounded border border-gray-200 p-3 animate-pulse"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="h-9 w-9 bg-gray-200 rounded" />
              <div class="h-7 w-20 bg-gray-200 rounded" />
            </div>
            <div class="h-4 w-16 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="store.dashboard">
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <BaseStatCard
            :icon="CurrencyDollarIcon"
            icon-bg-color="bg-green-100"
            icon-color="text-green-600"
            :value="formatCurrency(store.dashboard.monthlyIncome)"
            unit="FC"
            :label="t('landlord.revenue')"
            :secondary-label="t('landlord.thisMonth')"
          />
          <p v-if="rateReady && store.dashboard?.monthlyIncome" class="text-xs text-gray-400 mt-1 text-center">
            ≈ {{ formatFC(store.dashboard.monthlyIncome) }}
          </p>
        </div>
        <BaseStatCard
          :icon="HomeModernIcon"
          icon-bg-color="bg-blue-100"
          icon-color="text-blue-600"
          :value="store.dashboard.activeLeases"
          :label="t('landlord.propertiesRented')"
          :secondary-label="t('landlord.rented')"
        />
        <BaseStatCard
          :icon="ClockIcon"
          icon-bg-color="bg-yellow-100"
          icon-color="text-yellow-600"
          :value="store.dashboard.pendingPayments"
          :label="t('landlord.paymentsLabel')"
          :secondary-label="t('landlord.pending')"
        />
        <BaseStatCard
          :icon="ExclamationTriangleIcon"
          icon-bg-color="bg-red-100"
          icon-color="text-red-600"
          :value="store.dashboard.overduePayments"
          value-color="text-red-600"
          :label="t('landlord.paymentsLabel')"
          :secondary-label="t('landlord.overdue')"
        />
      </div>

      <!-- Charts & Alerts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Revenue Chart -->
        <div class="lg:col-span-2">
          <RevenueChart
            :monthly-income="store.dashboard.monthlyIncome"
            :yearly-income="store.dashboard.yearlyIncome"
          />
        </div>

        <!-- Occupancy + Alerts -->
        <div class="space-y-4">
          <OccupancyCard
            :occupancy-rate="store.dashboard.occupancyRate"
            :total-properties="store.dashboard.totalProperties"
            :active-leases="store.dashboard.activeLeases"
          />
          <OverdueAlert
            :overdue-payments="store.dashboard.overduePayments"
            :pending-payments="store.dashboard.pendingPayments"
          />
        </div>
      </div>

      <!-- Quick Property List -->
      <div class="bg-white rounded border border-gray-200">
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 class="text-sm font-semibold text-gray-900">{{ t('landlord.recentProperties') }}</h2>
          <button
            class="text-xs text-primary-600 hover:text-primary-800 font-medium"
            @click="navigateTo('/dashboard/landlord/properties')"
          >
            {{ t('landlord.viewAll') }}
          </button>
        </div>

        <div
          v-if="store.propertiesLoading"
          class="p-4"
        >
          <div
            v-for="i in 3"
            :key="i"
            class="flex items-center gap-3 py-2 animate-pulse"
          >
            <div class="h-10 w-10 bg-gray-200 rounded" />
            <div class="flex-1">
              <div class="h-4 w-32 bg-gray-200 rounded" />
              <div class="h-3 w-20 bg-gray-200 rounded mt-1" />
            </div>
          </div>
        </div>

        <div
          v-else-if="store.properties.length === 0"
          class="p-6 text-center"
        >
          <p class="text-sm text-gray-500">{{ t('landlord.noPropertyYet') }}</p>
          <button
            class="mt-2 text-sm text-primary-600 hover:text-primary-800 font-medium"
            @click="navigateTo('/dashboard/landlord/properties/create')"
          >
            {{ t('landlord.addFirstProperty') }}
          </button>
        </div>

        <div
          v-else
          class="divide-y divide-gray-100"
        >
          <div
            v-for="property in store.properties.slice(0, 5)"
            :key="property.id"
            class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
            @click="navigateTo(`/dashboard/landlord/properties/${property.id}`)"
          >
            <div class="h-10 w-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                v-if="property.photos.length > 0"
                :src="property.photos[0]?.thumbnails?.thumbnail_webp ?? property.photos[0]?.thumbnails?.thumbnail ?? property.photos[0]?.url"
                :alt="property.title"
                class="h-full w-full object-cover"
              >
              <HomeModernIcon
                v-else
                class="h-5 w-5 text-gray-400"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ property.title }}</p>
              <p class="text-xs text-gray-500">{{ property.type }} - {{ property.address?.city?.name ?? t('property.noLocation') }}</p>
            </div>
            <div class="text-right">
              <span
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                :class="property.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
              >
                {{ property.isPublished ? t('status.published') : t('status.draft') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
