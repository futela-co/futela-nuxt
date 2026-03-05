<script setup lang="ts">
import { ChartBarIcon } from '@heroicons/vue/24/outline'

interface Props {
  monthlyIncome: number
  yearlyIncome: number
}

const props = defineProps<Props>()

const { formatFC, isReady: rateReady } = useExchangeRate()

const loading = ref(true)
const chartRef = ref<HTMLCanvasElement | null>(null)

const months = computed(() => {
  const now = new Date()
  const labels: string[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    labels.push(d.toLocaleDateString('fr-FR', { month: 'short' }))
  }
  return labels
})

// Simulated monthly data based on current monthlyIncome
const chartData = computed(() => {
  const base = props.monthlyIncome
  return months.value.map((_, i) => {
    const variance = 0.7 + Math.random() * 0.6
    return i === months.value.length - 1 ? base : Math.round(base * variance)
  })
})

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value) + ' USD'
}

onMounted(() => {
  loading.value = false
})
</script>

<template>
  <DataChart
    title="Revenus mensuels"
    subtitle="Evolution sur les 6 derniers mois"
    :loading="loading"
  >
    <div class="space-y-4">
      <!-- Summary row -->
      <div class="flex items-center gap-6 text-sm">
        <div>
          <span class="text-gray-500">Ce mois:</span>
          <span class="ml-1 font-semibold text-gray-900">{{ formatCurrency(monthlyIncome) }}</span>
          <span v-if="rateReady" class="ml-1 text-xs text-gray-400">({{ formatFC(monthlyIncome) }})</span>
        </div>
        <div>
          <span class="text-gray-500">Cette annee:</span>
          <span class="ml-1 font-semibold text-gray-900">{{ formatCurrency(yearlyIncome) }}</span>
          <span v-if="rateReady" class="ml-1 text-xs text-gray-400">({{ formatFC(yearlyIncome) }})</span>
        </div>
      </div>

      <!-- Bar chart -->
      <div class="flex items-end gap-2 h-40">
        <div
          v-for="(value, index) in chartData"
          :key="index"
          class="flex-1 flex flex-col items-center gap-1"
        >
          <span class="text-xs text-gray-500">{{ formatCurrency(value) }}</span>
          <div
            class="w-full rounded-t transition-all duration-300"
            :class="index === chartData.length - 1 ? 'bg-primary-600' : 'bg-primary-200'"
            :style="{
              height: `${Math.max((value / Math.max(...chartData)) * 100, 5)}%`
            }"
          />
          <span class="text-xs text-gray-500">{{ months[index] }}</span>
        </div>
      </div>
    </div>
  </DataChart>
</template>
