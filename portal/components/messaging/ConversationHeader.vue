<script setup lang="ts">
import {
  ArrowLeftIcon,
  EllipsisVerticalIcon,
  ArchiveBoxIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'
import type { Conversation } from '~/types/user'

const props = defineProps<{
  conversation: Conversation
}>()

const emit = defineEmits<{
  back: []
  archive: []
  delete: []
}>()

const showMenu = ref(false)

function getOtherParticipantName(): string {
  if (props.conversation.participants.length > 0) {
    return props.conversation.participants[0]?.name ?? 'Inconnu'
  }
  return 'Inconnu'
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function handleArchive() {
  showMenu.value = false
  emit('archive')
}

function handleDelete() {
  showMenu.value = false
  emit('delete')
}
</script>

<template>
  <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
    <!-- Back button (mobile) -->
    <button
      class="lg:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      @click="emit('back')"
    >
      <ArrowLeftIcon class="w-5 h-5" />
    </button>

    <!-- Avatar -->
    <div class="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
      {{ getInitials(getOtherParticipantName()) }}
    </div>

    <!-- Info -->
    <div class="flex-1 min-w-0">
      <p class="text-sm font-semibold text-gray-900 truncate">{{ getOtherParticipantName() }}</p>
      <p v-if="conversation.propertyTitle" class="text-xs text-gray-500 truncate">{{ conversation.propertyTitle }}</p>
    </div>

    <!-- Menu -->
    <div class="relative">
      <button
        class="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        @click="showMenu = !showMenu"
      >
        <EllipsisVerticalIcon class="w-5 h-5" />
      </button>
      <Transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="showMenu"
          class="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
        >
          <button
            class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            @click="handleArchive"
          >
            <ArchiveBoxIcon class="w-4 h-4" />
            Archiver
          </button>
          <button
            class="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            @click="handleDelete"
          >
            <TrashIcon class="w-4 h-4" />
            Supprimer
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>
