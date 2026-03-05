<script setup lang="ts">
import type { Property } from '~shared/domain/types/property'

interface Props {
  property: Property
}

const props = defineProps<Props>()
const { formatFC, isReady: rateReady } = useExchangeRate()

function formatPrice(val: number | null): string {
  if (!val) return '-'
  return `$${val.toLocaleString('fr-FR')}`
}
</script>

<template>
  <div class="space-y-2">
    <div
      v-if="property.pricePerDay"
      class="flex items-baseline gap-1"
    >
      <span class="text-2xl font-bold text-gray-900">{{ formatPrice(property.pricePerDay) }}</span>
      <span class="text-gray-500">/ jour</span>
      <span v-if="rateReady" class="text-sm text-gray-400">({{ formatFC(property.pricePerDay) }})</span>
    </div>
    <div
      v-if="property.pricePerMonth"
      class="flex items-baseline gap-1"
    >
      <span class="text-lg font-semibold text-gray-700">{{ formatPrice(property.pricePerMonth) }}</span>
      <span class="text-gray-500">/ mois</span>
      <span v-if="rateReady" class="text-sm text-gray-400">({{ formatFC(property.pricePerMonth) }})</span>
    </div>
  </div>
</template>
