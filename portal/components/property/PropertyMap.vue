<script setup lang="ts">
import { MapPinIcon } from '@heroicons/vue/24/solid'

interface Props {
  latitude?: number | null
  longitude?: number | null
  address?: string
}

const props = withDefaults(defineProps<Props>(), {
  latitude: null,
  longitude: null,
  address: '',
})
</script>

<template>
  <div>
    <div class="flex items-center gap-2 mb-3">
      <MapPinIcon class="w-5 h-5 text-primary-500" />
      <span class="text-sm text-gray-700">{{ address }}</span>
    </div>

    <div class="w-full h-64 bg-gray-100 rounded-xl overflow-hidden relative">
      <template v-if="latitude && longitude">
        <iframe
          :src="`https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`"
          class="w-full h-full border-0"
          loading="lazy"
        />
      </template>
      <template v-else>
        <div class="flex items-center justify-center h-full text-gray-400">
          <div class="text-center">
            <MapPinIcon class="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p class="text-sm">Localisation non disponible</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
