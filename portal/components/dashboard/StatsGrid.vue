<script setup lang="ts">
import {
  CalendarDaysIcon,
  HeartIcon,
  HomeModernIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/vue/24/outline'

interface StatCard {
  label: string
  value: number
  icon: any
  color: string
  bgColor: string
  subtitle?: string
  link: string
}

const props = defineProps<{
  activeReservations: number
  favoritesCount: number
  upcomingVisits: number
  unreadMessages: number
  nextVisitInDays: number | null
}>()

const { t } = useLocale()

const stats = computed<StatCard[]>(() => [
  {
    label: t('dashboard.activeReservations'),
    value: props.activeReservations,
    icon: CalendarDaysIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    link: '/dashboard/reservations',
  },
  {
    label: t('dashboard.favorites'),
    value: props.favoritesCount,
    icon: HeartIcon,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    link: '/dashboard/favorites',
  },
  {
    label: t('dashboard.upcomingVisits'),
    value: props.upcomingVisits,
    icon: HomeModernIcon,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    subtitle: props.nextVisitInDays !== null ? t('dashboard.nextVisit').replace('{days}', String(props.nextVisitInDays)) : undefined,
    link: '/dashboard/visits',
  },
  {
    label: t('dashboard.unreadMessages'),
    value: props.unreadMessages,
    icon: ChatBubbleLeftRightIcon,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    link: '/dashboard/messages',
  },
])

function handleNavigateTo(link: string) {
  navigateTo(link)
}
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <button
      v-for="stat in stats"
      :key="stat.label"
      class="bg-white rounded-xl p-4 lg:p-5 shadow-sm hover:shadow-md transition-shadow text-left"
      @click="handleNavigateTo(stat.link)"
    >
      <div class="flex items-center gap-3 mb-3">
        <div :class="[stat.bgColor, 'p-2 rounded-lg']">
          <component :is="stat.icon" :class="[stat.color, 'w-5 h-5']" />
        </div>
        <span class="text-xs sm:text-sm text-gray-500 leading-tight">{{ stat.label }}</span>
      </div>
      <p class="text-3xl lg:text-4xl font-bold text-gray-900">{{ stat.value }}</p>
      <p v-if="stat.subtitle" class="text-xs text-gray-500 mt-1">{{ stat.subtitle }}</p>
    </button>
  </div>
</template>
