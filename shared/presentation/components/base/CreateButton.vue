<script setup lang="ts">
import { PlusIcon } from '@heroicons/vue/24/outline'

interface Props {
  label: string
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  emit('click', event)
}
</script>

<template>
  <button
    type="button"
    class="btn btn-primary font-normal w-[16.5rem]"
    :disabled="disabled"
    @click="handleClick"
  >
    <PlusIcon class="h-4 w-4 mr-1.5" />
    {{ label }}
  </button>
</template>
