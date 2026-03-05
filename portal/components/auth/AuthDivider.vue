<script setup lang="ts">
interface Props {
  text?: string
}

const props = defineProps<Props>()
const { t } = useLocale()

const label = computed(() => props.text ?? t('auth.or'))
</script>

<template>
  <div class="relative my-6">
    <div class="absolute inset-0 flex items-center">
      <div class="w-full border-t border-gray-300" />
    </div>
    <div class="relative flex justify-center text-xs uppercase">
      <span class="bg-white px-4 text-gray-400">{{ label }}</span>
    </div>
  </div>
</template>
