<script setup lang="ts">
import {
  HomeModernIcon,
  ArrowsPointingOutIcon,
  BuildingOfficeIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { CheckCircleIcon } from '@heroicons/vue/24/solid'
import type { Property } from '~/domain/types/property'

defineProps<{ property: Property }>()
</script>

<template>
  <div class="space-y-6">
    <!-- Grid specs -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div v-if="property.squareMeters" class="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
        <ArrowsPointingOutIcon class="w-6 h-6 text-blue-500 flex-shrink-0" />
        <div>
          <p class="text-sm text-gray-500">Surface</p>
          <p class="font-semibold text-gray-900">{{ property.squareMeters }} m²</p>
        </div>
      </div>
      <div v-if="property.floor != null" class="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
        <BuildingOfficeIcon class="w-6 h-6 text-blue-500 flex-shrink-0" />
        <div>
          <p class="text-sm text-gray-500">Etage</p>
          <p class="font-semibold text-gray-900">{{ property.floor === 0 ? 'RDC' : property.floor }}</p>
        </div>
      </div>
      <div v-if="property.bedrooms" class="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
        <HomeModernIcon class="w-6 h-6 text-blue-500 flex-shrink-0" />
        <div>
          <p class="text-sm text-gray-500">Chambres</p>
          <p class="font-semibold text-gray-900">{{ property.bedrooms }}</p>
        </div>
      </div>
      <div v-if="property.bathrooms" class="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
        <svg class="w-6 h-6 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582" />
        </svg>
        <div>
          <p class="text-sm text-gray-500">Salles de bain</p>
          <p class="font-semibold text-gray-900">{{ property.bathrooms }}</p>
        </div>
      </div>
    </div>

    <!-- Boolean badges -->
    <div class="flex flex-wrap gap-2">
      <span
        v-if="property.hasElevator != null"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
        :class="property.hasElevator ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'"
      >
        <component :is="property.hasElevator ? CheckCircleIcon : XMarkIcon" class="w-4 h-4" :class="{ 'text-red-500': !property.hasElevator }" />
        Ascenseur
      </span>
      <span
        v-if="property.hasBalcony != null"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
        :class="property.hasBalcony ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'"
      >
        <component :is="property.hasBalcony ? CheckCircleIcon : XMarkIcon" class="w-4 h-4" :class="{ 'text-red-500': !property.hasBalcony }" />
        Balcon
      </span>
      <span
        v-if="property.hasParking != null"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
        :class="property.hasParking ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'"
      >
        <component :is="property.hasParking ? CheckCircleIcon : XMarkIcon" class="w-4 h-4" :class="{ 'text-red-500': !property.hasParking }" />
        Parking
      </span>
    </div>
  </div>
</template>
