<script setup lang="ts">
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  StarIcon,
} from '@heroicons/vue/24/solid'
import type { ActivityItem } from '~/application/stores/dashboard'
// formatDateTime auto-imported from ~/utils/date

defineProps<{
  items: ActivityItem[]
  loading?: boolean
}>()

const { t } = useLocale()

function getIndicator(type: ActivityItem['type']) {
  switch (type) {
    case 'reservation_confirmed':
      return { icon: CheckCircleIcon, color: 'text-emerald-500' }
    case 'reservation_cancelled':
      return { icon: XCircleIcon, color: 'text-red-500' }
    case 'visit_scheduled':
      return { icon: EyeIcon, color: 'text-blue-500' }
    case 'payment_pending':
      return { icon: ClockIcon, color: 'text-amber-500' }
    case 'review_published':
      return { icon: StarIcon, color: 'text-yellow-500' }
    default:
      return { icon: ClockIcon, color: 'text-gray-400' }
  }
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return t('dashboard.timeAgoMin').replace('{min}', String(diffMins))
  if (diffHours < 24) return t('dashboard.timeAgoHours').replace('{hours}', String(diffHours))
  if (diffDays === 1) return t('dashboard.timeAgoYesterday')
  if (diffDays < 7) return t('dashboard.timeAgoDays').replace('{days}', String(diffDays))
  return formatDateTime(dateStr)
}

function handleNavigateTo(link?: string) {
  if (link) navigateTo(link)
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm p-5">
    <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ t('dashboard.recentActivity') }}</h2>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 4" :key="i" class="flex gap-3">
        <div class="w-8 h-8 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          <div class="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="items.length === 0" class="text-center py-8">
      <p class="text-gray-500 text-sm">{{ t('dashboard.noActivity') }}</p>
    </div>

    <!-- Timeline -->
    <div v-else class="relative">
      <div class="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
      <div class="space-y-4">
        <button
          v-for="item in items"
          :key="item.id"
          class="relative flex items-start gap-3 pl-0 w-full text-left hover:bg-gray-50 rounded-lg p-2 -ml-2 transition-colors"
          @click="handleNavigateTo(item.link)"
        >
          <div class="relative z-10 flex-shrink-0">
            <component
              :is="getIndicator(item.type).icon"
              :class="[getIndicator(item.type).color, 'w-8 h-8']"
            />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900">{{ item.title }}</p>
            <p class="text-sm text-gray-500 truncate">{{ item.description }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ timeAgo(item.date) }}</p>
          </div>
        </button>
      </div>
    </div>

    <NuxtLink
      v-if="items.length > 0"
      to="/dashboard/notifications"
      class="mt-4 block text-sm text-primary-600 hover:text-primary-700 font-medium"
    >
      {{ t('dashboard.viewAllActivity') }} &rarr;
    </NuxtLink>
  </div>
</template>
