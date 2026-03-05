<script setup lang="ts">
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/vue/24/outline'
import type { Conversation } from '~/domain/types/user'

const props = defineProps<{
  conversations: Conversation[]
  selectedId: string | null
  loading?: boolean
  searchQuery?: string
}>()

const emit = defineEmits<{
  select: [conversation: Conversation]
  'new-conversation': []
  'update:searchQuery': [value: string]
}>()

function timeLabel(dateStr: string | null): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}min`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) return `${diffDays}j`
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

function getOtherParticipantName(conversation: Conversation): string {
  if (conversation.participants.length > 0) {
    return conversation.participants[0]?.name ?? 'Inconnu'
  }
  return 'Inconnu'
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-semibold text-gray-900">Messages</h2>
        <button
          class="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          title="Nouvelle conversation"
          @click="emit('new-conversation')"
        >
          <PlusIcon class="w-5 h-5" />
        </button>
      </div>
      <div class="relative">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          :value="searchQuery"
          placeholder="Rechercher une conversation..."
          class="w-full pl-9 pr-3 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white transition-colors"
          @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
        >
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="flex-1 overflow-y-auto p-2 space-y-1">
      <div v-for="i in 6" :key="i" class="flex items-center gap-3 p-3 rounded-lg">
        <div class="w-10 h-10 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
          <div class="h-3 bg-gray-200 rounded animate-pulse w-full" />
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="conversations.length === 0" class="flex-1 flex items-center justify-center p-4">
      <div class="text-center">
        <p class="text-gray-500 text-sm">Aucune conversation</p>
      </div>
    </div>

    <!-- Conversation list -->
    <div v-else class="flex-1 overflow-y-auto p-2 space-y-0.5">
      <button
        v-for="conv in conversations"
        :key="conv.id"
        class="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors"
        :class="selectedId === conv.id ? 'bg-primary-50 border-l-2 border-primary-500' : 'hover:bg-gray-50'"
        @click="emit('select', conv)"
      >
        <div class="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
          {{ getInitials(getOtherParticipantName(conv)) }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-gray-900 truncate">{{ getOtherParticipantName(conv) }}</p>
            <span class="text-xs text-gray-400 flex-shrink-0">{{ timeLabel(conv.lastMessageAt) }}</span>
          </div>
          <p class="text-xs text-gray-500 truncate mt-0.5">
            <template v-if="conv.propertyTitle">{{ conv.propertyTitle }} &middot; </template>
            {{ conv.subject }}
          </p>
        </div>
      </button>
    </div>
  </div>
</template>
