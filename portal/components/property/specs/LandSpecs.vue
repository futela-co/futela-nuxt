<script setup lang="ts">
import { ArrowsPointingOutIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { CheckCircleIcon } from '@heroicons/vue/24/solid'
import type { Property } from '~shared/domain/types/property'

defineProps<{ property: Property }>()
</script>

<template>
  <div class="space-y-6">
    <!-- Surface + type -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <div v-if="property.squareMeters" class="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
        <ArrowsPointingOutIcon class="w-6 h-6 text-amber-500 flex-shrink-0" />
        <div>
          <p class="text-sm text-gray-500">Surface</p>
          <p class="font-semibold text-gray-900">{{ property.squareMeters }} m²</p>
        </div>
      </div>
      <div v-if="property.landType" class="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
        <div class="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <span class="text-amber-600 text-xs font-bold">T</span>
        </div>
        <div>
          <p class="text-sm text-gray-500">Type de terrain</p>
          <p class="font-semibold text-gray-900">{{ property.landTypeLabel ?? property.landType }}</p>
        </div>
      </div>
    </div>

    <!-- Boolean badges -->
    <div class="flex flex-wrap gap-2">
      <span
        v-if="property.hasBuildingPermit != null"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
        :class="property.hasBuildingPermit ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'"
      >
        <component :is="property.hasBuildingPermit ? CheckCircleIcon : XMarkIcon" class="w-4 h-4" :class="{ 'text-red-500': !property.hasBuildingPermit }" />
        Permis de construire
      </span>
      <span
        v-if="property.hasWaterAccess != null"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
        :class="property.hasWaterAccess ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'"
      >
        <component :is="property.hasWaterAccess ? CheckCircleIcon : XMarkIcon" class="w-4 h-4" :class="{ 'text-red-500': !property.hasWaterAccess }" />
        Acces eau
      </span>
      <span
        v-if="property.hasElectricityAccess != null"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
        :class="property.hasElectricityAccess ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'"
      >
        <component :is="property.hasElectricityAccess ? CheckCircleIcon : XMarkIcon" class="w-4 h-4" :class="{ 'text-red-500': !property.hasElectricityAccess }" />
        Electricite
      </span>
      <span
        v-if="property.isFenced != null"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
        :class="property.isFenced ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'"
      >
        <component :is="property.isFenced ? CheckCircleIcon : XMarkIcon" class="w-4 h-4" :class="{ 'text-red-500': !property.isFenced }" />
        Cloture
      </span>
    </div>
  </div>
</template>
