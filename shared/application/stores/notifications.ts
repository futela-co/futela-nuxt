import { defineStore } from 'pinia'
import { notificationsApi } from '~/infrastructure/api/notifications'
import type { Notification } from '~/domain/types/user'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])
  const isLoading = ref(false)
  let pollingInterval: ReturnType<typeof setInterval> | null = null

  const sortedNotifications = computed(() =>
    [...notifications.value].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  )

  const unreadCount = computed(() =>
    notifications.value.filter(n => !n.isRead).length
  )

  const hasUnread = computed(() => unreadCount.value > 0)

  async function fetchNotifications() {
    isLoading.value = true
    try {
      const response = await notificationsApi.list()
      notifications.value = Array.isArray(response) ? response : (response.data ?? [])
    } catch {
      // Silently fail - notifications are non-critical
    } finally {
      isLoading.value = false
    }
  }

  async function markAsRead(id: string) {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.isRead = true
      try {
        await notificationsApi.markAsRead(id)
      } catch {
        // Revert on failure
        notification.isRead = false
      }
    }
  }

  async function markAllAsRead() {
    const previousStates = notifications.value.map(n => ({ id: n.id, isRead: n.isRead }))
    notifications.value.forEach(n => { n.isRead = true })
    try {
      await notificationsApi.markAllAsRead()
    } catch {
      // Revert on failure
      previousStates.forEach(prev => {
        const n = notifications.value.find(x => x.id === prev.id)
        if (n) n.isRead = prev.isRead
      })
    }
  }

  function startPolling(intervalMs = 30000) {
    fetchNotifications()
    pollingInterval = setInterval(fetchNotifications, intervalMs)
  }

  function stopPolling() {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      pollingInterval = null
    }
  }

  return {
    notifications,
    isLoading,
    sortedNotifications,
    unreadCount,
    hasUnread,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    startPolling,
    stopPolling,
  }
})
