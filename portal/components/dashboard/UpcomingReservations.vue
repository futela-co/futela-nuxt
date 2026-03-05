<script setup lang="ts">
import type { Reservation } from '~/types/reservation'
// formatDateShort auto-imported from ~/utils/date

defineProps<{
  reservations: Reservation[]
  loading?: boolean
}>()

const { formatFC, isReady: rateReady } = useExchangeRate()

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    confirmed: 'Confirmee',
    pending: 'En attente',
    cancelled: 'Annulee',
    completed: 'Terminee',
  }
  return map[status] ?? status
}

function statusColor(status: string): string {
  const map: Record<string, string> = {
    confirmed: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-gray-100 text-gray-700',
  }
  return map[status] ?? 'bg-gray-100 text-gray-700'
}

function formatPrice(amount: number, currency: string): string {
  return `$${amount.toLocaleString('fr-FR')}`
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm p-5">
    <h2 class="text-lg font-semibold text-gray-900 mb-4">Reservations a venir</h2>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="flex gap-3 p-3 rounded-lg bg-gray-50">
        <div class="w-16 h-16 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          <div class="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
          <div class="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="reservations.length === 0" class="text-center py-8">
      <p class="text-gray-500 text-sm">Aucune reservation a venir</p>
      <NuxtLink
        to="/search"
        class="mt-2 inline-block text-sm text-primary-600 hover:text-primary-700 font-medium"
      >
        Explorer les proprietes &rarr;
      </NuxtLink>
    </div>

    <!-- Reservation list -->
    <div v-else class="space-y-3">
      <div
        v-for="reservation in reservations"
        :key="reservation.id"
        class="flex gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
        @click="navigateTo('/dashboard/reservations')"
      >
        <div class="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-400 text-xs">
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 7.5h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">{{ reservation.propertyTitle }}</p>
          <p class="text-xs text-gray-500 mt-0.5">
            {{ formatDateShort(reservation.startDate) }} - {{ formatDateShort(reservation.endDate) }}
          </p>
          <div class="flex items-center gap-2 mt-1">
            <span
              :class="[statusColor(reservation.status), 'text-xs font-medium px-2 py-0.5 rounded-full']"
            >
              {{ statusLabel(reservation.status) }}
            </span>
            <span class="text-xs font-semibold text-gray-700">
              {{ formatPrice(reservation.totalPrice, reservation.currency) }}
            </span>
            <span v-if="rateReady" class="text-[10px] text-gray-400">({{ formatFC(reservation.totalPrice) }})</span>
          </div>
        </div>
      </div>
    </div>

    <NuxtLink
      v-if="reservations.length > 0"
      to="/dashboard/reservations"
      class="mt-4 block text-sm text-primary-600 hover:text-primary-700 font-medium"
    >
      Voir toutes les reservations &rarr;
    </NuxtLink>
  </div>
</template>
