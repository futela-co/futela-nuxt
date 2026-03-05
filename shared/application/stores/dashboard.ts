import { defineStore } from 'pinia'
import { reservationsApi } from '~/infrastructure/api/reservations'
import { favoritesApi } from '~/infrastructure/api/favorites'
import { visitsApi } from '~/infrastructure/api/visits'
import { notificationsApi } from '~/infrastructure/api/notifications'
import { messagesApi } from '~/infrastructure/api/messages'
import type { Reservation, Visit } from '~/domain/types/reservation'
import type { Property } from '~/domain/types/property'

export interface ActivityItem {
  id: string
  type: 'reservation_confirmed' | 'reservation_cancelled' | 'visit_scheduled' | 'payment_pending' | 'review_published'
  title: string
  description: string
  date: string
  link?: string
}

export const useDashboardStore = defineStore('dashboard', () => {
  const reservations = ref<Reservation[]>([])
  const favorites = ref<Property[]>([])
  const upcomingVisits = ref<Visit[]>([])
  const unreadMessagesCount = ref(0)
  const unreadNotificationsCount = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const activeReservationsCount = computed(() =>
    reservations.value.filter(r => r.status === 'confirmed' || r.status === 'pending').length
  )

  const favoritesCount = computed(() => favorites.value.length)

  const upcomingVisitsCount = computed(() => upcomingVisits.value.length)

  const nextVisitInDays = computed(() => {
    if (upcomingVisits.value.length === 0) return null
    const next = upcomingVisits.value[0]!
    const diff = new Date(next.scheduledAt).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  })

  const upcomingReservations = computed(() =>
    reservations.value
      .filter(r => new Date(r.startDate) > new Date() && (r.status === 'confirmed' || r.status === 'pending'))
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 3)
  )

  const recentActivity = computed<ActivityItem[]>(() => {
    const items: ActivityItem[] = []

    for (const r of reservations.value.slice(0, 5)) {
      if (r.status === 'confirmed') {
        items.push({
          id: r.id,
          type: 'reservation_confirmed',
          title: 'Reservation confirmee',
          description: r.propertyTitle,
          date: r.confirmedAt ?? r.createdAt,
          link: `/dashboard/reservations`,
        })
      } else if (r.status === 'cancelled') {
        items.push({
          id: r.id,
          type: 'reservation_cancelled',
          title: 'Reservation annulee',
          description: r.propertyTitle,
          date: r.cancelledAt ?? r.createdAt,
          link: `/dashboard/reservations`,
        })
      } else if (r.status === 'pending') {
        items.push({
          id: r.id,
          type: 'payment_pending',
          title: 'Paiement en attente',
          description: `${r.propertyTitle} - $${r.totalPrice}`,
          date: r.createdAt,
          link: `/dashboard/reservations`,
        })
      }
    }

    for (const v of upcomingVisits.value.slice(0, 3)) {
      items.push({
        id: v.id,
        type: 'visit_scheduled',
        title: 'Visite programmee',
        description: v.propertyTitle,
        date: v.createdAt,
        link: `/dashboard/visits`,
      })
    }

    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6)
  })

  async function fetchDashboardData() {
    isLoading.value = true
    error.value = null
    try {
      const [reservationsRes, favoritesRes, visitsRes, unreadMsgRes, unreadNotifRes] = await Promise.all([
        reservationsApi.myReservations({ limit: 10 }),
        favoritesApi.list({ limit: 100 }),
        visitsApi.upcoming(),
        messagesApi.getUnreadCount(),
        notificationsApi.getUnreadCount(),
      ])
      reservations.value = Array.isArray(reservationsRes) ? reservationsRes : (reservationsRes.data ?? [])
      favorites.value = Array.isArray(favoritesRes) ? favoritesRes : (favoritesRes.data ?? [])
      upcomingVisits.value = visitsRes
      unreadMessagesCount.value = unreadMsgRes.count ?? 0
      unreadNotificationsCount.value = unreadNotifRes.count ?? 0
    } catch (e: any) {
      error.value = e.message || 'Erreur lors du chargement du tableau de bord'
    } finally {
      isLoading.value = false
    }
  }

  function $reset() {
    reservations.value = []
    favorites.value = []
    upcomingVisits.value = []
    unreadMessagesCount.value = 0
    unreadNotificationsCount.value = 0
    isLoading.value = false
    error.value = null
  }

  return {
    reservations,
    favorites,
    upcomingVisits,
    unreadMessagesCount,
    unreadNotificationsCount,
    isLoading,
    error,
    activeReservationsCount,
    favoritesCount,
    upcomingVisitsCount,
    nextVisitInDays,
    upcomingReservations,
    recentActivity,
    fetchDashboardData,
    $reset,
  }
})
