<script setup lang="ts">
import { UserGroupIcon, TruckIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { CheckCircleIcon } from '@heroicons/vue/24/solid'
import type { Property } from '~/domain/types/property'

defineProps<{ property: Property }>()
</script>

<template>
  <div class="space-y-6">
    <!-- Capacity highlight + parking -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <div v-if="property.capacity" class="col-span-2 sm:col-span-1 flex items-center gap-3 p-4 rounded-xl bg-purple-50 border border-purple-100">
        <UserGroupIcon class="w-8 h-8 text-purple-500 flex-shrink-0" />
        <div>
          <p class="text-sm text-purple-600">Capacite</p>
          <p class="text-2xl font-bold text-purple-900">{{ property.capacity }}</p>
          <p class="text-xs text-purple-500">personnes</p>
        </div>
      </div>
      <div v-if="property.hasParking != null" class="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
        <TruckIcon class="w-6 h-6 text-purple-500 flex-shrink-0" />
        <div>
          <p class="text-sm text-gray-500">Parking</p>
          <p class="font-semibold text-gray-900">{{ property.hasParking ? 'Oui' : 'Non' }}</p>
        </div>
      </div>
    </div>

    <!-- Equipment badges -->
    <div class="flex flex-wrap gap-2">
      <span
        v-if="property.hasSoundSystem != null"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
        :class="property.hasSoundSystem ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'"
      >
        <component :is="property.hasSoundSystem ? CheckCircleIcon : XMarkIcon" class="w-4 h-4" :class="{ 'text-red-500': !property.hasSoundSystem }" />
        Sonorisation
      </span>
      <span
        v-if="property.hasVideoProjector != null"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
        :class="property.hasVideoProjector ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'"
      >
        <component :is="property.hasVideoProjector ? CheckCircleIcon : XMarkIcon" class="w-4 h-4" :class="{ 'text-red-500': !property.hasVideoProjector }" />
        Videoprojecteur
      </span>
      <span
        v-if="property.hasKitchen != null"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
        :class="property.hasKitchen ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'"
      >
        <component :is="property.hasKitchen ? CheckCircleIcon : XMarkIcon" class="w-4 h-4" :class="{ 'text-red-500': !property.hasKitchen }" />
        Cuisine
      </span>
      <span
        v-if="property.hasOutdoorSpace != null"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
        :class="property.hasOutdoorSpace ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'"
      >
        <component :is="property.hasOutdoorSpace ? CheckCircleIcon : XMarkIcon" class="w-4 h-4" :class="{ 'text-red-500': !property.hasOutdoorSpace }" />
        Espace exterieur
      </span>
    </div>

    <!-- Event types tags -->
    <div v-if="property.eventTypes && property.eventTypes.length > 0">
      <p class="text-sm font-medium text-gray-700 mb-2">Types d'evenements</p>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="eventType in property.eventTypes"
          :key="eventType"
          class="inline-flex px-3 py-1 rounded-full text-sm bg-purple-50 text-purple-700 font-medium"
        >
          {{ eventType }}
        </span>
      </div>
    </div>
  </div>
</template>
