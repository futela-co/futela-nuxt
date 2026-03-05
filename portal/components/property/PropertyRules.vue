<script setup lang="ts">
import { ClockIcon, UserGroupIcon, NoSymbolIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/vue/24/outline'

interface Props {
  checkIn?: string
  checkOut?: string
  maxGuests?: number
  smoking?: boolean
  pets?: boolean
  parties?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  checkIn: '14:00',
  checkOut: '11:00',
  maxGuests: 6,
  smoking: false,
  pets: false,
  parties: false,
})
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center gap-3 text-sm">
      <ClockIcon class="w-5 h-5 text-gray-400 flex-shrink-0" />
      <span class="text-gray-600">Arrivee : <strong>{{ checkIn }}</strong></span>
      <span class="text-gray-300">&middot;</span>
      <span class="text-gray-600">Depart : <strong>{{ checkOut }}</strong></span>
    </div>
    <div class="flex items-center gap-3 text-sm">
      <UserGroupIcon class="w-5 h-5 text-gray-400 flex-shrink-0" />
      <span class="text-gray-600">Voyageurs max : <strong>{{ maxGuests }}</strong></span>
    </div>
    <div class="flex items-center gap-3 text-sm">
      <component
        :is="smoking ? CheckCircleIcon : XCircleIcon"
        class="w-5 h-5 flex-shrink-0"
        :class="smoking ? 'text-green-500' : 'text-red-400'"
      />
      <span class="text-gray-600">{{ smoking ? 'Fumeur autorise' : 'Non-fumeur' }}</span>
    </div>
    <div class="flex items-center gap-3 text-sm">
      <component
        :is="pets ? CheckCircleIcon : XCircleIcon"
        class="w-5 h-5 flex-shrink-0"
        :class="pets ? 'text-green-500' : 'text-red-400'"
      />
      <span class="text-gray-600">{{ pets ? 'Animaux acceptes' : 'Pas d\'animaux' }}</span>
    </div>
    <div class="flex items-center gap-3 text-sm">
      <component
        :is="parties ? CheckCircleIcon : XCircleIcon"
        class="w-5 h-5 flex-shrink-0"
        :class="parties ? 'text-green-500' : 'text-red-400'"
      />
      <span class="text-gray-600">{{ parties ? 'Fetes autorisees' : 'Pas de fetes' }}</span>
    </div>
  </div>
</template>
