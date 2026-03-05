<script setup lang="ts">
import { UserCircleIcon, StarIcon, ChatBubbleLeftRightIcon } from '@heroicons/vue/24/solid'

interface Props {
  ownerId: string
  ownerName: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  contact: [ownerId: string]
}>()
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 p-5">
    <div class="flex items-center gap-4">
      <div class="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
        <UserCircleIcon class="w-14 h-14 text-gray-400" />
      </div>
      <div>
        <h4 class="font-semibold text-gray-900">{{ ownerName }}</h4>
        <p class="text-sm text-gray-500">Proprietaire</p>
      </div>
    </div>

    <button
      class="w-full mt-4 btn btn-outline-primary flex items-center justify-center gap-2"
      @click="$emit('contact', ownerId)"
    >
      <ChatBubbleLeftRightIcon class="w-4 h-4" />
      Contacter
    </button>
  </div>
</template>
