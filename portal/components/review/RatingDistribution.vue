<script setup lang="ts">
import { StarIcon } from '@heroicons/vue/24/solid'

interface Props {
  average: number
  count: number
  distribution: Record<string, number>
}

const props = defineProps<Props>()

const bars = computed(() => {
  const maxCount = Math.max(...Object.values(props.distribution), 1)
  return [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: props.distribution[String(star)] ?? 0,
    percentage: ((props.distribution[String(star)] ?? 0) / maxCount) * 100,
  }))
})
</script>

<template>
  <div class="flex flex-col sm:flex-row gap-6">
    <!-- Overall rating -->
    <div class="text-center sm:text-left flex-shrink-0">
      <div class="text-4xl font-bold text-gray-900">{{ average.toFixed(1) }}</div>
      <div class="flex items-center justify-center sm:justify-start gap-0.5 mt-1">
        <StarIcon
          v-for="i in 5"
          :key="i"
          class="w-4 h-4"
          :class="i <= Math.round(average) ? 'text-yellow-400' : 'text-gray-300'"
        />
      </div>
      <div class="text-sm text-gray-500 mt-1">{{ count }} avis</div>
    </div>

    <!-- Distribution bars -->
    <div class="flex-1 space-y-2">
      <div
        v-for="bar in bars"
        :key="bar.star"
        class="flex items-center gap-3"
      >
        <span class="text-sm text-gray-600 w-6 text-right flex-shrink-0">{{ bar.star }}</span>
        <StarIcon class="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
        <div class="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            class="h-full bg-yellow-400 rounded-full transition-all duration-500"
            :style="{ width: `${bar.percentage}%` }"
          />
        </div>
        <span class="text-sm text-gray-500 w-8 text-right flex-shrink-0">{{ bar.count }}</span>
      </div>
    </div>
  </div>
</template>
