<script setup lang="ts">
import {
  WifiIcon,
  TruckIcon,
  SunIcon,
  FireIcon,
  HomeModernIcon,
  LockClosedIcon,
  BoltIcon,
  BeakerIcon,
  SparklesIcon,
} from '@heroicons/vue/24/outline'
import type { Property } from '~/types/property'

interface Props {
  property: Property
}

const props = defineProps<Props>()
const showAll = ref(false)

const amenityMap: Record<string, { label: string; icon: any }> = {
  hasParking: { label: 'Parking', icon: TruckIcon },
  hasElevator: { label: 'Ascenseur', icon: HomeModernIcon },
  hasBalcony: { label: 'Balcon', icon: SunIcon },
  isFurnished: { label: 'Meuble', icon: HomeModernIcon },
  hasPool: { label: 'Piscine', icon: SparklesIcon },
  hasGarden: { label: 'Jardin', icon: SparklesIcon },
  hasGarage: { label: 'Garage', icon: TruckIcon },
  hasWaterAccess: { label: 'Eau courante', icon: BeakerIcon },
  hasElectricityAccess: { label: 'Electricite', icon: BoltIcon },
  isFenced: { label: 'Cloture', icon: LockClosedIcon },
  hasSoundSystem: { label: 'Sonorisation', icon: SparklesIcon },
  hasVideoProjector: { label: 'Videoprojecteur', icon: SparklesIcon },
  hasKitchen: { label: 'Cuisine', icon: FireIcon },
  hasOutdoorSpace: { label: 'Espace exterieur', icon: SunIcon },
}

const amenities = computed(() => {
  const list: Array<{ key: string; label: string; icon: any }> = []

  // Always show WiFi as first (common amenity)
  list.push({ key: 'wifi', label: 'WiFi', icon: WifiIcon })

  for (const [key, config] of Object.entries(amenityMap)) {
    if ((props.property as any)[key] === true) {
      list.push({ key, ...config })
    }
  }

  return list
})

const displayedAmenities = computed(() => {
  if (showAll.value) return amenities.value
  return amenities.value.slice(0, 6)
})
</script>

<template>
  <div v-if="amenities.length > 0">
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div
        v-for="amenity in displayedAmenities"
        :key="amenity.key"
        class="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
      >
        <component
          :is="amenity.icon"
          class="w-5 h-5 text-gray-500 flex-shrink-0"
        />
        <span class="text-sm text-gray-700">{{ amenity.label }}</span>
      </div>
    </div>
    <button
      v-if="amenities.length > 6"
      class="mt-3 text-sm font-medium text-primary-600 hover:text-primary-700"
      @click="showAll = !showAll"
    >
      {{ showAll ? 'Voir moins' : `Voir tous les equipements (${amenities.length})` }}
    </button>
  </div>
</template>
