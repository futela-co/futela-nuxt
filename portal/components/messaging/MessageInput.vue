<script setup lang="ts">
import { PaperAirplaneIcon } from '@heroicons/vue/24/solid'

defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  send: [content: string]
}>()

const message = ref('')

function handleSend() {
  const content = message.value.trim()
  if (!content) return
  emit('send', content)
  message.value = ''
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}
</script>

<template>
  <div class="border-t border-gray-200 bg-white px-4 py-3">
    <div class="flex items-end gap-2">
      <textarea
        v-model="message"
        :disabled="disabled"
        placeholder="Ecrire un message..."
        rows="1"
        class="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        @keydown="handleKeydown"
      />
      <button
        :disabled="!message.trim() || disabled"
        class="p-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        @click="handleSend"
      >
        <PaperAirplaneIcon class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>
