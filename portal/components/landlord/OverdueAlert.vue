<script setup lang="ts">
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

interface Props {
  overduePayments: number
  pendingPayments: number
}

defineProps<Props>()

const { t } = useLocale()
</script>

<template>
  <div
    v-if="overduePayments > 0 || pendingPayments > 0"
    class="space-y-2"
  >
    <!-- Overdue alert -->
    <div
      v-if="overduePayments > 0"
      class="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded"
    >
      <div class="p-1.5 bg-red-100 rounded">
        <ExclamationTriangleIcon class="h-4 w-4 text-red-600" />
      </div>
      <div class="flex-1">
        <p class="text-sm font-medium text-red-800">
          {{ overduePayments }} {{ overduePayments > 1 ? t('landlord.overduePaymentPlural') : t('landlord.overduePayment') }}
        </p>
        <p class="text-xs text-red-600">
          {{ t('landlord.overdueDescription') }}
        </p>
      </div>
    </div>

    <!-- Pending alert -->
    <div
      v-if="pendingPayments > 0"
      class="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded"
    >
      <div class="p-1.5 bg-yellow-100 rounded">
        <ExclamationTriangleIcon class="h-4 w-4 text-yellow-600" />
      </div>
      <div class="flex-1">
        <p class="text-sm font-medium text-yellow-800">
          {{ pendingPayments }} {{ pendingPayments > 1 ? t('landlord.pendingPaymentPlural') : t('landlord.pendingPayment') }}
        </p>
        <p class="text-xs text-yellow-600">
          {{ t('landlord.pendingDescription') }}
        </p>
      </div>
    </div>
  </div>
</template>
