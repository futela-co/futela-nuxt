<script setup lang="ts">
import { PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline'

interface Props {
  showEdit?: boolean
  showDelete?: boolean
  editTitle?: string
  deleteTitle?: string
  editDisabled?: boolean
  deleteDisabled?: boolean
}

withDefaults(defineProps<Props>(), {
  showEdit: true,
  showDelete: true,
  editTitle: 'Modifier',
  deleteTitle: 'Supprimer',
  editDisabled: false,
  deleteDisabled: false
})

const emit = defineEmits<{
  edit: []
  delete: []
}>()
</script>

<template>
  <div class="hidden sm:flex items-center gap-2">
    <button
      v-if="showEdit"
      class="p-2 text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      :title="editTitle"
      :disabled="editDisabled"
      @click="emit('edit')"
    >
      <PencilSquareIcon class="w-5 h-5" />
    </button>
    <button
      v-if="showDelete"
      class="p-2 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      :title="deleteTitle"
      :disabled="deleteDisabled"
      @click="emit('delete')"
    >
      <TrashIcon class="w-5 h-5" />
    </button>
  </div>
</template>
