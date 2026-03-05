<script setup lang="ts">
import { CalendarIcon, FlagIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '~/application/stores/auth'
import type { Property } from '~/domain/types/property'

interface Props {
  property: Property
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'request-visit': []
  reserve: [data: any]
}>()

const authStore = useAuthStore()
const { formatFC, isReady: rateReady } = useExchangeRate()

const checkIn = ref('')
const checkOut = ref('')
const guests = ref({ adults: 1, children: 0, infants: 0 })
const isReserving = ref(false)

const nightsCount = computed(() => {
  if (!checkIn.value || !checkOut.value) return 0
  const start = new Date(checkIn.value)
  const end = new Date(checkOut.value)
  const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
})

const priceBreakdown = computed(() => {
  if (nightsCount.value <= 0 || !props.property.pricePerDay) return null
  const subtotal = props.property.pricePerDay * nightsCount.value
  const serviceFee = Math.round(subtotal * 0.1)
  return {
    nightlyRate: props.property.pricePerDay,
    nights: nightsCount.value,
    subtotal,
    serviceFee,
    total: subtotal + serviceFee,
  }
})

function formatPrice(val: number) {
  return `$${val.toLocaleString('fr-FR')}`
}

function handleReserve() {
  if (!authStore.isAuthenticated) {
    navigateTo({ path: '/auth/login', query: { redirect: `/properties/${props.property.id}` } })
    return
  }
  emit('reserve', {
    propertyId: props.property.id,
    checkIn: checkIn.value,
    checkOut: checkOut.value,
    guests: guests.value,
  })
}

function handleRequestVisit() {
  if (!authStore.isAuthenticated) {
    navigateTo({ path: '/auth/login', query: { redirect: `/properties/${props.property.id}` } })
    return
  }
  emit('request-visit')
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-24">
    <!-- Price -->
    <div class="mb-5">
      <div v-if="property.pricePerDay" class="flex items-baseline gap-1">
        <span class="text-2xl font-bold text-gray-900">{{ formatPrice(property.pricePerDay) }}</span>
        <span class="text-gray-500">/ jour</span>
        <span v-if="rateReady" class="text-sm text-gray-400 ml-1">({{ formatFC(property.pricePerDay) }})</span>
      </div>
      <div v-if="property.pricePerMonth" class="text-sm text-gray-500 mt-0.5">
        {{ formatPrice(property.pricePerMonth) }} / mois
        <span v-if="rateReady" class="text-gray-400"> ({{ formatFC(property.pricePerMonth) }})</span>
      </div>
    </div>

    <!-- Date inputs -->
    <div class="grid grid-cols-2 gap-px bg-gray-300 rounded-lg overflow-hidden mb-3">
      <div class="bg-white p-3">
        <label class="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Arrivee</label>
        <div class="flex items-center gap-2 mt-1">
          <CalendarIcon class="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            v-model="checkIn"
            type="date"
            class="text-sm text-gray-900 focus:outline-none w-full bg-transparent"
          >
        </div>
      </div>
      <div class="bg-white p-3">
        <label class="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Depart</label>
        <div class="flex items-center gap-2 mt-1">
          <CalendarIcon class="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            v-model="checkOut"
            type="date"
            :min="checkIn"
            class="text-sm text-gray-900 focus:outline-none w-full bg-transparent"
          >
        </div>
      </div>
    </div>

    <!-- Guest selector -->
    <div class="mb-4">
      <ReservationGuestSelector v-model="guests" />
    </div>

    <!-- Price breakdown -->
    <div v-if="priceBreakdown" class="space-y-2 mb-4 pt-4 border-t border-gray-100">
      <div class="flex justify-between text-sm">
        <span class="text-gray-600">{{ formatPrice(priceBreakdown.nightlyRate) }} x {{ priceBreakdown.nights }} nuits</span>
        <span class="text-gray-900">{{ formatPrice(priceBreakdown.subtotal) }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-600">Frais de service</span>
        <span class="text-gray-900">{{ formatPrice(priceBreakdown.serviceFee) }}</span>
      </div>
      <div class="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-100">
        <span>Total</span>
        <div class="text-right">
          <span>{{ formatPrice(priceBreakdown.total) }}</span>
          <span v-if="rateReady" class="block text-xs font-normal text-gray-400">{{ formatFC(priceBreakdown.total) }}</span>
        </div>
      </div>
    </div>

    <!-- Reserve button -->
    <button
      class="w-full btn btn-primary btn-lg"
      :disabled="!priceBreakdown || isReserving"
      @click="handleReserve"
    >
      Reserver maintenant
    </button>

    <!-- Separator -->
    <div class="flex items-center gap-4 my-4">
      <div class="flex-1 h-px bg-gray-200" />
      <span class="text-xs text-gray-400 uppercase">ou</span>
      <div class="flex-1 h-px bg-gray-200" />
    </div>

    <!-- Visit request button -->
    <button
      class="w-full btn btn-outline-blue py-3 font-semibold"
      @click="handleRequestVisit"
    >
      Demander une visite
    </button>

    <p class="text-xs text-gray-500 text-center mt-3">
      Vous ne serez pas debite immediatement
    </p>

    <!-- Report -->
    <button class="w-full flex items-center justify-center gap-1.5 mt-4 text-xs text-gray-400 hover:text-gray-600 transition-colors">
      <FlagIcon class="w-3.5 h-3.5" />
      Signaler cette annonce
    </button>
  </div>
</template>
