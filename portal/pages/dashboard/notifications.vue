<script setup lang="ts">
import {
  BellIcon,
  CheckIcon,
  TrashIcon,
  BellSlashIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '~/application/stores/auth'
import { notificationsApi } from '~/infrastructure/api/notifications'
import { messagesApi } from '~/infrastructure/api/messages'
import { formatDateTime } from '~/utils/date'
import type { Notification } from '~/domain/types/user'
import type { Conversation, Message } from '~/domain/types/user'

definePageMeta({ layout: 'dashboard' })

const { t } = useLocale()
const authStore = useAuthStore()
const pagination = usePagination()
const toast = useToast()
const { confirm } = useConfirm()

// ---- Top-level section ----
const activeSection = ref<'notifications' | 'messages'>('notifications')

// ========== NOTIFICATIONS ==========
const notifTab = ref<'all' | 'unread'>('all')
const notifications = ref<Notification[]>([])
const notifLoading = ref(false)
const notifError = ref<string | null>(null)

const notifTabs = computed(() => [
  { key: 'all' as const, label: t('dashboard.allNotificationsTab') },
  { key: 'unread' as const, label: t('dashboard.unreadNotificationsTab') },
])

const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length)

async function loadNotifications() {
  notifLoading.value = true
  notifError.value = null
  try {
    if (notifTab.value === 'unread') {
      const data = await notificationsApi.getUnread({ page: pagination.page.value })
      notifications.value = data
    } else {
      const response: any = await notificationsApi.list({
        page: pagination.page.value,
      })
      notifications.value = Array.isArray(response) ? response : (response.data ?? [])
      pagination.updateFromResponse(response)
    }
  } catch (e: any) {
    notifError.value = e.message || t('dashboard.loadNotificationsError')
  } finally {
    notifLoading.value = false
  }
}

async function handleMarkAsRead(notification: Notification) {
  if (notification.isRead) return
  try {
    await notificationsApi.markAsRead(notification.id)
    notification.isRead = true
  } catch {
    // silent
  }
}

async function handleMarkAllAsRead() {
  try {
    await notificationsApi.markAllAsRead()
    notifications.value.forEach(n => { n.isRead = true })
    toast.success(t('dashboard.allMarkedAsRead'))
  } catch {
    toast.error(t('dashboard.markError'))
  }
}

async function handleDeleteNotification(notification: Notification) {
  try {
    await notificationsApi.delete(notification.id)
    notifications.value = notifications.value.filter(n => n.id !== notification.id)
    toast.warning(t('dashboard.notificationDeleted'))
  } catch {
    toast.error(t('dashboard.deleteError'))
  }
}

function notificationIcon(type: string): string {
  const map: Record<string, string> = {
    reservation: 'bg-blue-100 text-blue-600',
    payment: 'bg-emerald-100 text-emerald-600',
    visit: 'bg-purple-100 text-purple-600',
    review: 'bg-yellow-100 text-yellow-600',
    message: 'bg-orange-100 text-orange-600',
  }
  return map[type] ?? 'bg-gray-100 text-gray-600'
}

// Group notifications by date
const groupedNotifications = computed(() => {
  const groups: Record<string, Notification[]> = {}
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()

  for (const notif of notifications.value) {
    const dateStr = new Date(notif.createdAt).toDateString()
    let label: string
    if (dateStr === today) label = t('dashboard.today')
    else if (dateStr === yesterday) label = t('dashboard.yesterday')
    else label = new Date(notif.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

    if (!groups[label]) groups[label] = []
    groups[label]!.push(notif)
  }
  return groups
})

// ========== MESSAGES ==========
const conversations = ref<Conversation[]>([])
const selectedConversation = ref<Conversation | null>(null)
const messages = ref<Message[]>([])
const searchQuery = ref('')
const conversationsLoading = ref(false)
const messagesLoading = ref(false)
const sendingMessage = ref(false)

// Mobile view state
const showThread = ref(false)

const currentUserId = computed(() => authStore.user?.id ?? '')

const filteredConversations = computed(() => {
  if (!searchQuery.value.trim()) return conversations.value
  const q = searchQuery.value.toLowerCase()
  return conversations.value.filter(c =>
    c.subject.toLowerCase().includes(q) ||
    c.participants.some(p => p.name.toLowerCase().includes(q)) ||
    (c.propertyTitle && c.propertyTitle.toLowerCase().includes(q))
  )
})

async function loadConversations() {
  conversationsLoading.value = true
  try {
    const response: any = await messagesApi.getConversations({
      limit: 50,
    })
    conversations.value = Array.isArray(response) ? response : (response.data ?? [])
  } catch {
    toast.error(t('dashboard.loadConversationsError'))
  } finally {
    conversationsLoading.value = false
  }
}

async function loadMessages(conversationId: string) {
  messagesLoading.value = true
  try {
    const response: any = await messagesApi.getMessages(conversationId, {
      limit: 50,
    })
    messages.value = Array.isArray(response) ? response : (response.data ?? [])
  } catch {
    toast.error(t('dashboard.loadMessagesError'))
  } finally {
    messagesLoading.value = false
  }
}

function handleSelectConversation(conversation: Conversation) {
  selectedConversation.value = conversation
  showThread.value = true
  loadMessages(conversation.id)
}

function handleBack() {
  showThread.value = false
  selectedConversation.value = null
  messages.value = []
}

async function handleSendMessage(content: string) {
  if (!selectedConversation.value) return
  sendingMessage.value = true
  try {
    const newMessage = await messagesApi.sendMessage(selectedConversation.value.id, { content })
    messages.value.push(newMessage)

    // Update last message time in conversation list
    const conv = conversations.value.find(c => c.id === selectedConversation.value?.id)
    if (conv) {
      conv.lastMessageAt = newMessage.createdAt
    }
  } catch {
    toast.error(t('dashboard.sendMessageError'))
  } finally {
    sendingMessage.value = false
  }
}

async function handleArchiveConversation() {
  if (!selectedConversation.value) return
  const confirmed = await confirm({
    title: t('dashboard.archiveConversation'),
    message: t('dashboard.archiveConversationMsg'),
    confirmText: t('dashboard.archive'),
    cancelText: t('ui.cancel'),
    variant: 'warning',
  })
  if (!confirmed) return

  try {
    await messagesApi.archiveConversation(selectedConversation.value.id)
    conversations.value = conversations.value.filter(c => c.id !== selectedConversation.value?.id)
    handleBack()
    toast.warning(t('dashboard.conversationArchived'))
  } catch {
    toast.error(t('dashboard.archiveError'))
  }
}

async function handleDeleteConversation() {
  if (!selectedConversation.value) return
  const confirmed = await confirm({
    title: t('dashboard.deleteConversation'),
    message: t('dashboard.deleteConversationMsg'),
    confirmText: t('ui.delete'),
    cancelText: t('ui.cancel'),
    variant: 'danger',
  })
  if (!confirmed) return

  try {
    await messagesApi.deleteConversation(selectedConversation.value.id)
    conversations.value = conversations.value.filter(c => c.id !== selectedConversation.value?.id)
    handleBack()
    toast.warning(t('dashboard.conversationDeleted'))
  } catch {
    toast.error(t('dashboard.deleteError'))
  }
}

// ---- Data loading logic ----
watch(activeSection, () => {
  if (activeSection.value === 'notifications') {
    pagination.reset()
    loadNotifications()
  } else {
    loadConversations()
  }
})

watch(notifTab, () => {
  if (activeSection.value === 'notifications') {
    pagination.reset()
    loadNotifications()
  }
})

watch(() => pagination.page.value, () => {
  if (activeSection.value === 'notifications') {
    loadNotifications()
  }
})

// Fetch data immediately on navigation (Nuxt pattern)
loadNotifications()
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ t('dashboard.notificationsAndMessages') }}</h1>
        <p class="text-gray-500 text-sm mt-1">
          <template v-if="activeSection === 'notifications'">
            {{ unreadCount > 0 ? (unreadCount > 1 ? t('dashboard.unreadCountPlural').replace('{count}', String(unreadCount)) : t('dashboard.unreadCount').replace('{count}', String(unreadCount))) : t('dashboard.allUpToDate') }}
          </template>
          <template v-else>
            {{ conversations.length > 1 ? t('dashboard.conversationCountPlural').replace('{count}', String(conversations.length)) : t('dashboard.conversationCount').replace('{count}', String(conversations.length)) }}
          </template>
        </p>
      </div>
      <button
        v-if="activeSection === 'notifications' && unreadCount > 0"
        class="btn btn-ghost-primary btn-lg gap-1.5"
        @click="handleMarkAllAsRead"
      >
        <CheckIcon class="w-4 h-4" />
        {{ t('dashboard.markAllAsRead') }}
      </button>
    </div>

    <!-- Section tabs (top-level) -->
    <div class="flex gap-2 mb-6">
      <button
        class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
        :class="activeSection === 'notifications'
          ? 'bg-primary-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        @click="activeSection = 'notifications'"
      >
        {{ t('sidebar.notifications') }}
      </button>
      <button
        class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
        :class="activeSection === 'messages'
          ? 'bg-primary-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        @click="activeSection = 'messages'"
      >
        {{ t('sidebar.messages') }}
      </button>
    </div>

    <!-- ========== NOTIFICATIONS ========== -->
    <template v-if="activeSection === 'notifications'">
      <!-- Sub-tabs -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="flex gap-6">
          <button
            v-for="tab in notifTabs"
            :key="tab.key"
            class="pb-3 text-sm font-medium border-b-2 transition-colors"
            :class="notifTab === tab.key
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'"
            @click="notifTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Loading -->
      <div v-if="notifLoading" class="space-y-3">
        <div v-for="i in 5" :key="i" class="bg-white rounded-xl shadow-sm p-4">
          <div class="flex gap-3">
            <div class="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
              <div class="h-3 bg-gray-200 rounded animate-pulse w-full" />
              <div class="h-3 bg-gray-200 rounded animate-pulse w-1/4" />
            </div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="notifError" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p class="text-red-700 font-medium">{{ notifError }}</p>
        <button
          class="btn btn-danger btn-lg mt-3"
          @click="loadNotifications"
        >
          {{ t('dashboard.retry') }}
        </button>
      </div>

      <!-- Empty -->
      <div
        v-else-if="notifications.length === 0"
        class="bg-white rounded-xl shadow-sm p-12 text-center"
      >
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BellSlashIcon class="w-8 h-8 text-gray-400" />
        </div>
        <h2 class="text-lg font-semibold text-gray-900">{{ t('dashboard.noNotification') }}</h2>
        <p class="text-gray-500 text-sm mt-2">
          <template v-if="notifTab === 'unread'">{{ t('dashboard.youAreUpToDate') }}</template>
          <template v-else>{{ t('dashboard.noNotificationYet') }}</template>
        </p>
      </div>

      <!-- Grouped notifications -->
      <div v-else class="space-y-6">
        <div v-for="(group, dateLabel) in groupedNotifications" :key="dateLabel">
          <h3 class="text-sm font-medium text-gray-500 mb-2">{{ dateLabel }}</h3>
          <div class="space-y-2">
            <div
              v-for="notif in group"
              :key="notif.id"
              class="bg-white rounded-xl shadow-sm p-4 flex gap-3 hover:shadow-md transition-shadow cursor-pointer"
              :class="{ 'border-l-4 border-primary-500': !notif.isRead }"
              @click="handleMarkAsRead(notif)"
            >
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                :class="notificationIcon(notif.type)"
              >
                <BellIcon class="w-5 h-5" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <p class="text-sm font-medium text-gray-900" :class="{ 'font-semibold': !notif.isRead }">
                      {{ notif.title }}
                    </p>
                    <p class="text-sm text-gray-500 mt-0.5">{{ notif.content }}</p>
                    <p class="text-xs text-gray-400 mt-1">{{ formatDateTime(notif.createdAt) }}</p>
                  </div>
                  <button
                    class="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                    :title="t('ui.delete')"
                    @click.stop="handleDeleteNotification(notif)"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination (only for 'all' tab) -->
      <div
        v-if="!notifLoading && notifTab === 'all' && pagination.totalPages.value > 1"
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
          <span class="text-xs text-gray-500 px-2">
            {{ t('dashboard.page') }} {{ pagination.page.value }} / {{ pagination.totalPages.value }}
          </span>
          <button
            :disabled="!pagination.hasNext.value"
            class="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="pagination.nextPage()"
          >
            {{ t('ui.next') }}
          </button>
        </nav>
      </div>
    </template>

    <!-- ========== MESSAGES ========== -->
    <template v-if="activeSection === 'messages'">
      <!-- Desktop: Split panel / Mobile: Switch between list and thread -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden" style="height: calc(100vh - 16rem);">
        <div class="flex h-full">
          <!-- Left panel: Conversation list -->
          <div
            class="border-r border-gray-200 flex-shrink-0"
            :class="[
              showThread ? 'hidden lg:flex lg:w-80' : 'w-full lg:w-80',
              'flex flex-col'
            ]"
          >
            <MessagingConversationList
              :conversations="filteredConversations"
              :selected-id="selectedConversation?.id ?? null"
              :loading="conversationsLoading"
              :search-query="searchQuery"
              @select="handleSelectConversation"
              @new-conversation="() => {}"
              @update:search-query="searchQuery = $event"
            />
          </div>

          <!-- Right panel: Chat thread -->
          <div
            class="flex-1 flex flex-col"
            :class="showThread ? 'flex' : 'hidden lg:flex'"
          >
            <!-- No conversation selected -->
            <div
              v-if="!selectedConversation"
              class="flex-1 flex items-center justify-center"
            >
              <div class="text-center">
                <ChatBubbleLeftRightIcon class="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p class="text-gray-500">{{ t('dashboard.selectConversation') }}</p>
              </div>
            </div>

            <!-- Conversation thread -->
            <template v-else>
              <MessagingConversationHeader
                :conversation="selectedConversation"
                @back="handleBack"
                @archive="handleArchiveConversation"
                @delete="handleDeleteConversation"
              />
              <MessagingMessageThread
                :messages="messages"
                :current-user-id="currentUserId"
                :loading="messagesLoading"
              />
              <MessagingMessageInput
                :disabled="sendingMessage"
                @send="handleSendMessage"
              />
            </template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
