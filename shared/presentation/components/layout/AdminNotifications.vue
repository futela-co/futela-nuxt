<script setup lang="ts">
/**
 * AdminNotifications.vue
 * Notifications center dropdown component
 * Displays unread notifications with actions to mark as read or view all
 */
import {
  BellIcon,
  CheckIcon,
  // XMarkIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  Cog6ToothIcon,
} from '@heroicons/vue/24/outline'
import { formatDateShort } from '../../../utils/date'
import { useNotificationsStore } from '../../../application/stores/notifications'
import type { Notification } from '../../../domain/types/user'

interface Props {
  /** Maximum number of notifications to show in dropdown */
  maxVisible?: number
  /** Show the settings link */
  showSettings?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxVisible: 5,
  showSettings: true,
})

const notificationsStore = useNotificationsStore()

// Dropdown state
const isOpen = ref(false)

// Toggle dropdown
function toggleDropdown() {
  isOpen.value = !isOpen.value
}

// Close dropdown
function closeDropdown() {
  isOpen.value = false
}

// Close on outside click
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.notifications-dropdown')) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  // Start polling for notifications
  notificationsStore.startPolling() // Every 30 seconds
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  notificationsStore.stopPolling()
})

// Visible notifications (limited)
const visibleNotifications = computed(() =>
  notificationsStore.sortedNotifications.slice(0, props.maxVisible)
)

// Check if there are more notifications
const hasMore = computed(() =>
  notificationsStore.notifications.length > props.maxVisible
)

// Remaining count
const remainingCount = computed(() =>
  notificationsStore.notifications.length - props.maxVisible
)

// Get icon for notification type
function getNotificationIcon(type: string) {
  const icons: Record<string, typeof InformationCircleIcon> = {
    info: InformationCircleIcon,
    success: CheckCircleIcon,
    warning: ExclamationTriangleIcon,
    error: ExclamationCircleIcon,
  }
  return icons[type] || InformationCircleIcon
}

// Get icon color classes for notification type
function getIconColorClasses(type: string): string {
  const colors: Record<string, string> = {
    info: 'text-blue-500 bg-blue-100',
    success: 'text-success-500 bg-success-100',
    warning: 'text-warning-600 bg-warning-100',
    error: 'text-danger-500 bg-danger-100',
  }
  return colors[type] || 'text-gray-900 bg-gray-100'
}

// Format time ago
function formatTimeAgo(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) {
    return 'A l\'instant'
  } else if (diffMinutes < 60) {
    return `Il y a ${diffMinutes} min`
  } else if (diffHours < 24) {
    return `Il y a ${diffHours}h`
  } else if (diffDays < 7) {
    return `Il y a ${diffDays}j`
  } else {
    return formatDateShort(date)
  }
}

// Handle notification click
async function handleNotificationClick(notification: Notification) {
  // Mark as read
  if (!notification.isRead) {
    await notificationsStore.markAsRead(notification.id)
  }

  // Navigate if link provided
  if (notification.data?.link) {
    closeDropdown()
    navigateTo(notification.data.link)
  }
}

// Mark all as read
async function handleMarkAllRead() {
  await notificationsStore.markAllAsRead()
}

// Suppression desactivee pour l'instant
// async function handleRemove(event: Event, notification: Notification) {
//   event.stopPropagation()
//   await notificationsStore.remove(notification.id)
// }
</script>

<template>
  <div class="notifications-dropdown relative">
    <!-- Trigger Button -->
    <button
      type="button"
      class="relative p-2 text-gray-900 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
      aria-label="Notifications"
      @click.stop="toggleDropdown"
    >
      <BellIcon class="w-5 h-5" />

      <!-- Unread Badge -->
      <span
        v-if="notificationsStore.hasUnread"
        class="absolute top-1 right-1 min-w-[1rem] h-4 px-1 text-xs font-medium text-white bg-danger-500 rounded-full flex items-center justify-center"
      >
        {{ notificationsStore.unreadCount > 99 ? '99+' : notificationsStore.unreadCount }}
      </span>
    </button>

    <!-- Dropdown Panel -->
    <Transition name="dropdown">
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded shadow-lg border border-gray-200 z-50 overflow-hidden"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50">
          <h3 class="text-xs font-semibold text-gray-900">
            Notifications
            <span
              v-if="notificationsStore.hasUnread"
              class="ml-1 text-xs font-normal text-gray-500"
            >
              ({{ notificationsStore.unreadCount }} non lues)
            </span>
          </h3>

          <!-- Mark all as read -->
          <button
            v-if="notificationsStore.hasUnread"
            type="button"
            class="text-xs text-primary-600 hover:text-primary-700 font-medium"
            @click="handleMarkAllRead"
          >
            Tout marquer comme lu
          </button>
        </div>

        <!-- Notifications List -->
        <div class="max-h-96 overflow-y-auto">
          <!-- Loading State -->
          <div
            v-if="notificationsStore.isLoading && notificationsStore.notifications.length === 0"
            class="px-4 py-8 text-center"
          >
            <div class="flex items-center justify-center gap-1.5 mb-2">
              <span class="w-2.5 h-2.5 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span class="w-2.5 h-2.5 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span class="w-2.5 h-2.5 bg-primary-500 rounded-full animate-bounce" />
            </div>
            <p class="text-xs text-gray-500">
              Chargement...
            </p>
          </div>

          <!-- Empty State -->
          <div
            v-else-if="notificationsStore.notifications.length === 0"
            class="px-4 py-8 text-center"
          >
            <BellIcon class="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p class="text-xs text-gray-500">
              Aucune notification
            </p>
          </div>

          <!-- Notification Items -->
          <template v-else>
            <button
              v-for="notification in visibleNotifications"
              :key="notification.id"
              type="button"
              class="w-full flex items-start gap-2 px-3 py-2 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
              :class="{ 'bg-primary-50/50': !notification.isRead }"
              @click="handleNotificationClick(notification)"
            >
              <!-- Icon -->
              <div
                class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                :class="getIconColorClasses(notification.type)"
              >
                <component
                  :is="getNotificationIcon(notification.type)"
                  class="w-3 h-3"
                />
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <p
                    class="text-xs font-medium text-gray-900 truncate"
                    :class="{ 'font-semibold': !notification.isRead }"
                  >
                    {{ notification.title }}
                  </p>
                </div>

                <p class="text-xs text-gray-600 line-clamp-2 mt-0.5">
                  {{ notification.content }}
                </p>

                <p class="text-[10px] text-gray-400 mt-0.5">
                  {{ formatTimeAgo(notification.createdAt) }}
                </p>
              </div>

              <!-- Unread indicator -->
              <div
                v-if="!notification.isRead"
                class="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2"
              />
            </button>

            <!-- More notifications indicator -->
            <div
              v-if="hasMore"
              class="px-4 py-2 bg-gray-50 text-center"
            >
              <span class="text-xs text-gray-900">
                Et {{ remainingCount }} autre{{ remainingCount > 1 ? 's' : '' }} notification{{ remainingCount > 1 ? 's' : '' }}
              </span>
            </div>
          </template>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between px-3 py-2 border-t border-gray-200 bg-gray-50">
          <NuxtLink
            to="/notifications"
            class="text-xs text-primary-600 hover:text-primary-700 font-medium"
            @click="closeDropdown"
          >
            Voir toutes les notifications
          </NuxtLink>

          <NuxtLink
            v-if="showSettings"
            to="/profile/settings#notifications"
            class="text-gray-400 hover:text-gray-600"
            @click="closeDropdown"
          >
            <Cog6ToothIcon class="w-3.5 h-3.5" />
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </div>
</template>
