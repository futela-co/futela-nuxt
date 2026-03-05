<script setup lang="ts">
import { useDashboardStore } from '~/application/stores/dashboard'
import { useAuthStore } from '~/application/stores/auth'

definePageMeta({ layout: 'dashboard' })

const { t } = useLocale()
const dashboardStore = useDashboardStore()
const authStore = useAuthStore()

// Fetch data immediately on navigation (Nuxt pattern)
dashboardStore.fetchDashboardData()
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">
        {{ t('dashboard.hello') }} {{ authStore.user?.firstName ?? '' }}
      </h1>
      <p class="text-gray-500 mt-1">{{ t('dashboard.overviewSubtitle') }}</p>
    </div>

    <!-- Error state -->
    <div
      v-if="dashboardStore.error"
      class="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-6"
    >
      <p class="text-red-700 font-medium">{{ t('dashboard.loadingError') }}</p>
      <p class="text-red-600 text-sm mt-1">{{ dashboardStore.error }}</p>
      <button
        class="btn btn-danger btn-lg mt-3"
        @click="dashboardStore.fetchDashboardData()"
      >
        {{ t('dashboard.retry') }}
      </button>
    </div>

    <!-- Loading skeleton for stats -->
    <div
      v-if="dashboardStore.isLoading"
      class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      <div
        v-for="i in 4"
        :key="i"
        class="bg-white rounded-xl p-5 shadow-sm"
      >
        <div class="flex items-center gap-3 mb-3">
          <div class="w-9 h-9 bg-gray-200 rounded-lg animate-pulse" />
          <div class="h-4 bg-gray-200 rounded animate-pulse w-20" />
        </div>
        <div class="h-10 bg-gray-200 rounded animate-pulse w-12" />
      </div>
    </div>

    <!-- KPI Stats -->
    <div v-else class="mb-8">
      <DashboardStatsGrid
        :active-reservations="dashboardStore.activeReservationsCount"
        :favorites-count="dashboardStore.favoritesCount"
        :upcoming-visits="dashboardStore.upcomingVisitsCount"
        :unread-messages="dashboardStore.unreadMessagesCount"
        :next-visit-in-days="dashboardStore.nextVisitInDays"
      />
    </div>

    <!-- Main content: Activity + Upcoming Reservations -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DashboardActivityTimeline
        :items="dashboardStore.recentActivity"
        :loading="dashboardStore.isLoading"
      />
      <DashboardUpcomingReservations
        :reservations="dashboardStore.upcomingReservations"
        :loading="dashboardStore.isLoading"
      />
    </div>
  </div>
</template>
