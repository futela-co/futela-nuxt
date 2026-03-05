<script setup lang="ts">
import { HomeModernIcon } from '@heroicons/vue/24/outline'

interface Props {
  occupancyRate: number
  totalProperties: number
  activeLeases: number
}

const props = defineProps<Props>()

const { t } = useLocale()

const percentage = computed(() => Math.round(props.occupancyRate * 100))

const colorClass = computed(() => {
  if (percentage.value >= 80) return 'text-green-600'
  if (percentage.value >= 50) return 'text-yellow-600'
  return 'text-red-600'
})

const bgClass = computed(() => {
  if (percentage.value >= 80) return 'bg-green-500'
  if (percentage.value >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
})
</script>

<template>
  <div class="bg-white rounded border border-gray-200 p-4">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-medium text-gray-900">{{ t('landlord.occupancyRate') }}</h3>
      <div class="p-1.5 bg-blue-100 rounded">
        <HomeModernIcon class="h-4 w-4 text-blue-600" />
      </div>
    </div>

    <div class="flex items-baseline gap-1 mb-3">
      <span
        class="text-3xl font-bold"
        :class="colorClass"
      >{{ percentage }}%</span>
    </div>

    <!-- Progress bar -->
    <div class="w-full bg-gray-200 rounded-full h-2 mb-3">
      <div
        class="h-2 rounded-full transition-all duration-500"
        :class="bgClass"
        :style="{ width: `${percentage}%` }"
      />
    </div>

    <div class="flex justify-between text-xs text-gray-500">
      <span>{{ activeLeases }} {{ t('landlord.propertiesRented') }}</span>
      <span>{{ totalProperties }} {{ t('ui.total').toLowerCase() }}</span>
    </div>
  </div>
</template>
