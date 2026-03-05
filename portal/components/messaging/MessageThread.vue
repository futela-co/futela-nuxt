<script setup lang="ts">
import type { Message } from '~shared/domain/types/user'
// formatDateTime auto-imported from ~/utils/date

const props = defineProps<{
  messages: Message[]
  currentUserId: string
  loading?: boolean
}>()

const scrollContainer = ref<HTMLDivElement>()

watch(
  () => props.messages.length,
  async () => {
    await nextTick()
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
    }
  },
)

function isOwnMessage(message: Message): boolean {
  return message.senderId === props.currentUserId
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function shouldShowDateSeparator(index: number): boolean {
  if (index === 0) return true
  const current = new Date(props.messages[index]!.createdAt).toDateString()
  const previous = new Date(props.messages[index - 1]!.createdAt).toDateString()
  return current !== previous
}

function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return "Aujourd'hui"
  if (date.toDateString() === yesterday.toDateString()) return 'Hier'
  return formatDateTime(dateStr)
}
</script>

<template>
  <div ref="scrollContainer" class="flex-1 overflow-y-auto p-4 space-y-3">
    <!-- Loading skeleton -->
    <template v-if="loading">
      <div v-for="i in 5" :key="i" class="flex gap-2" :class="i % 2 === 0 ? 'justify-end' : ''">
        <div v-if="i % 2 !== 0" class="w-8 h-8 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
        <div class="max-w-[70%] space-y-1">
          <div class="h-10 bg-gray-200 rounded-xl animate-pulse" :style="{ width: `${120 + (i * 30)}px` }" />
        </div>
      </div>
    </template>

    <!-- Empty state -->
    <div v-else-if="messages.length === 0" class="flex items-center justify-center h-full">
      <p class="text-gray-400 text-sm">Aucun message. Commencez la conversation.</p>
    </div>

    <!-- Messages -->
    <template v-else>
      <template v-for="(message, index) in messages" :key="message.id">
        <!-- Date separator -->
        <div v-if="shouldShowDateSeparator(index)" class="flex items-center gap-3 py-2">
          <div class="flex-1 h-px bg-gray-200" />
          <span class="text-xs text-gray-400 font-medium">{{ formatDateSeparator(message.createdAt) }}</span>
          <div class="flex-1 h-px bg-gray-200" />
        </div>

        <!-- Own message -->
        <div v-if="isOwnMessage(message)" class="flex justify-end">
          <div class="max-w-[70%]">
            <div class="bg-primary-600 text-white rounded-2xl rounded-br-md px-4 py-2">
              <p class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
            </div>
            <p class="text-xs text-gray-400 text-right mt-0.5">{{ formatMessageTime(message.createdAt) }}</p>
          </div>
        </div>

        <!-- Other's message -->
        <div v-else class="flex gap-2">
          <div class="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
            {{ getInitials(message.senderName) }}
          </div>
          <div class="max-w-[70%]">
            <div class="bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md px-4 py-2">
              <p class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
            </div>
            <p class="text-xs text-gray-400 mt-0.5">{{ formatMessageTime(message.createdAt) }}</p>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>
