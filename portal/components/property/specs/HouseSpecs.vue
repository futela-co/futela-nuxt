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
      <div v-if="property.houseSquareMeters" class="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
        <ArrowsPointingOutIcon class="w-6 h-6 text-emerald-500 flex-shrink-0" />
        <div>
          <p class="text-sm text-gray-500">Surface habitable</p>
          <p class="font-semibold text-gray-900">{{ property.houseSquareMeters }} m²</p>
        </div>
      </div>
      <div v-if="property.landSquareMeters" class="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
        <ArrowsPointingOutIcon class="w-6 h-6 text-emerald-500 flex-shrink-0" />
        <div>
          <p class="text-sm text-gray-500">Surface terrain</p>
          <p class="font-semibold text-gray-900">{{ property.landSquareMeters }} m²</p>
        </div>
      </div>
      <div v-if="property.floors" class="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
        <BuildingOfficeIcon class="w-6 h-6 text-emerald-500 flex-shrink-0" />
        <div>
          <p class="text-sm text-gray-500">Etages</p>
          <p class="font-semibold text-gray-900">{{ property.floors }}</p>
        </div>
      </div>
      <div v-if="property.bedrooms" class="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
        <HomeModernIcon class="w-6 h-6 text-emerald-500 flex-shrink-0" />
        <div>
          <p class="text-sm text-gray-500">Chambres</p>
          <p class="font-semibold text-gray-900">{{ property.bedrooms }}</p>
        </div>
      </div>
      <div v-if="property.bathrooms" class="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
        <HomeModernIcon class="w-6 h-6 text-emerald-500 flex-shrink-0" />
        <div>
          <p class="text-sm text-gray-500">Salles de bain</p>
          <p class="font-semibold text-gray-900">{{ property.bathrooms }}</p>
        </div>
      </div>
    </div>

    <!-- Boolean badges -->
    <div class="flex flex-wrap gap-2">
      <span
        v-if="property.hasGarden != null"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
        :class="property.hasGarden ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'"
      >
        <component :is="property.hasGarden ? CheckCircleIcon : XMarkIcon" class="w-4 h-4" :class="{ 'text-red-500': !property.hasGarden }" />
        Jardin
      </span>
      <span
        v-if="property.hasPool != null"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
        :class="property.hasPool ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'"
      >
        <component :is="property.hasPool ? CheckCircleIcon : XMarkIcon" class="w-4 h-4" :class="{ 'text-red-500': !property.hasPool }" />
        Piscine
      </span>
      <span
        v-if="property.hasGarage != null"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
        :class="property.hasGarage ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'"
      >
        <component :is="property.hasGarage ? CheckCircleIcon : XMarkIcon" class="w-4 h-4" :class="{ 'text-red-500': !property.hasGarage }" />
        Garage
      </span>
      <span
        v-if="property.isFurnished != null"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
        :class="property.isFurnished ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'"
      >
        <component :is="property.isFurnished ? CheckCircleIcon : XMarkIcon" class="w-4 h-4" :class="{ 'text-red-500': !property.isFurnished }" />
        Meuble
      </span>
    </div>
  </div>
</template>
