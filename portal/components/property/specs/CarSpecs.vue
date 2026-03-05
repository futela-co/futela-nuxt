<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { CheckCircleIcon } from '@heroicons/vue/24/solid'
import type { Property } from '~shared/domain/types/property'

defineProps<{ property: Property }>()
</script>

<template>
  <div class="space-y-6">
    <!-- Car identity -->
    <div v-if="property.brand || property.model" class="flex items-baseline gap-2">
      <span class="text-xl font-bold text-gray-900">{{ property.brand }}</span>
      <span class="text-lg text-gray-600">{{ property.model }}</span>
      <span v-if="property.year" class="text-sm text-gray-400">({{ property.year }})</span>
    </div>

    <!-- Technical specs grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div v-if="property.year" class="p-4 rounded-xl bg-gray-50">
        <p class="text-xs text-gray-500 uppercase tracking-wide">Annee</p>
        <p class="mt-1 font-semibold text-gray-900">{{ property.year }}</p>
      </div>
      <div v-if="property.color" class="p-4 rounded-xl bg-gray-50">
        <p class="text-xs text-gray-500 uppercase tracking-wide">Couleur</p>
        <p class="mt-1 font-semibold text-gray-900">{{ property.color }}</p>
      </div>
      <div v-if="property.seats" class="p-4 rounded-xl bg-gray-50">
        <p class="text-xs text-gray-500 uppercase tracking-wide">Places</p>
        <p class="mt-1 font-semibold text-gray-900">{{ property.seats }}</p>
      </div>
      <div v-if="property.transmission" class="p-4 rounded-xl bg-gray-50">
        <p class="text-xs text-gray-500 uppercase tracking-wide">Transmission</p>
        <p class="mt-1 font-semibold text-gray-900">{{ property.transmissionLabel ?? property.transmission }}</p>
      </div>
      <div v-if="property.fuelType" class="p-4 rounded-xl bg-gray-50">
        <p class="text-xs text-gray-500 uppercase tracking-wide">Carburant</p>
        <p class="mt-1 font-semibold text-gray-900">{{ property.fuelTypeLabel ?? property.fuelType }}</p>
      </div>
      <div v-if="property.mileage != null" class="p-4 rounded-xl bg-gray-50">
        <p class="text-xs text-gray-500 uppercase tracking-wide">Kilometrage</p>
        <p class="mt-1 font-semibold text-gray-900">{{ property.mileage.toLocaleString('fr-FR') }} km</p>
      </div>
    </div>

    <!-- Driver badge -->
    <div v-if="property.withDriver != null" class="flex flex-wrap gap-2">
      <span
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
        :class="property.withDriver ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'"
      >
        <component :is="property.withDriver ? CheckCircleIcon : XMarkIcon" class="w-4 h-4" :class="{ 'text-red-500': !property.withDriver }" />
        {{ property.withDriver ? 'Avec chauffeur' : 'Sans chauffeur' }}
      </span>
    </div>
  </div>
</template>
