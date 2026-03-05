<script setup lang="ts">
import {
  CurrencyDollarIcon,
  ClockIcon,
  EyeIcon,
} from '@heroicons/vue/24/outline'
import type { DataTableColumn } from '~/components/data/DataTable.vue'
import { useLandlordStore } from '~shared/application/stores/landlord'
import { formatDateShort } from '~shared/utils/date'
import type { RentPayment } from '~shared/domain/types/user'

definePageMeta({ layout: 'dashboard', landlord: true })

const { t } = useLocale()
const store = useLandlordStore()
const { formatFC, isReady: rateReady } = useExchangeRate()

const perPage = ref(10)
const activeFilter = ref<'all' | 'pending' | 'received'>('all')
const showDetailModal = ref(false)
const selectedPayment = ref<RentPayment | null>(null)

const columns = computed<DataTableColumn[]>(() => [
  { key: 'invoiceId', label: t('landlord.invoice') },
  { key: 'amount', label: t('invoice.amount'), sortable: true, align: 'right' },
  { key: 'paymentMethod', label: t('landlord.method') },
  { key: 'reference', label: t('landlord.reference') },
  { key: 'paidAt', label: t('ui.date'), sortable: true },
  { key: 'actions', label: '', width: '60px', align: 'right' },
])

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function typed(row: Record<string, unknown>): any { return row }

const methodLabels = computed<Record<string, string>>(() => ({
  cash: t('payment.cash'),
  bank_transfer: t('payment.bankTransfer'),
  mobile_money: t('payment.mobileMoney'),
  card: t('payment.card'),
  wallet: t('payment.wallet'),
}))

const totalReceived = computed(() => {
  return store.payments.reduce((sum, p) => sum + p.amount, 0)
})

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value) + ' USD'
}

function loadPayments() {
  const params: Record<string, any> = {
    page: store.paymentsPage,
    itemsPerPage: perPage.value,
  }
  if (activeFilter.value !== 'all') {
    params.status = activeFilter.value
  }
  store.fetchPayments(params)
}

function handlePageChange(page: number) {
  store.paymentsPage = page
  loadPayments()
}

function setFilter(filter: 'all' | 'pending' | 'received') {
  activeFilter.value = filter
  store.paymentsPage = 1
  loadPayments()
}

function openDetailModal(payment: RentPayment) {
  selectedPayment.value = payment
  showDetailModal.value = true
}

const filterOptions = computed(() => [
  { value: 'all' as const, label: t('status.all') },
  { value: 'pending' as const, label: t('status.pending') },
  { value: 'received' as const, label: t('status.received') },
])

// Fetch data immediately on navigation (Nuxt pattern)
loadPayments()
store.fetchDashboard()
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-xl font-bold text-gray-900">{{ t('landlord.payments') }}</h1>
      <p class="text-sm text-gray-500">{{ t('landlord.paymentsDesc') }}</p>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <BaseStatCard
          :icon="CurrencyDollarIcon"
          icon-bg-color="bg-green-100"
          icon-color="text-green-600"
          :value="formatCurrency(totalReceived)"
          :label="t('landlord.totalLabel')"
          :secondary-label="t('landlord.received')"
        />
        <p v-if="rateReady && totalReceived" class="text-xs text-gray-400 mt-1 text-center">
          ≈ {{ formatFC(totalReceived) }}
        </p>
      </div>
      <BaseStatCard
        :icon="ClockIcon"
        icon-bg-color="bg-yellow-100"
        icon-color="text-yellow-600"
        :value="store.dashboard?.pendingPayments ?? 0"
        :label="t('landlord.paymentsLabel')"
        :secondary-label="t('landlord.pending')"
      />
    </div>

    <!-- Filter Radio Buttons -->
    <div class="flex items-center gap-2">
      <button
        v-for="option in filterOptions"
        :key="option.value"
        class="px-4 py-1.5 text-sm rounded-full border transition-colors"
        :class="
          activeFilter === option.value
            ? 'bg-primary-600 text-white border-primary-600'
            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
        "
        @click="setFilter(option.value)"
      >
        {{ option.label }}
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded border border-gray-200">
      <DataTable
        :columns="columns"
        :data="store.payments"
        :loading="store.paymentsLoading"
        :pagination="true"
        :current-page="store.paymentsPage"
        :per-page="perPage"
        :total-items="store.paymentsTotal"
        row-key="id"
        :empty-title="t('landlord.noPaymentEmpty')"
        :empty-description="t('landlord.noPaymentEmptyDesc')"
        empty-icon="chart"
        @page-change="handlePageChange"
      >
        <template #cell-invoiceId="{ row }">
          <span class="text-xs text-gray-500 font-mono">{{ typed(row).invoiceId?.slice(0, 8) }}...</span>
        </template>

        <template #cell-amount="{ row }">
          <span class="text-sm font-medium text-gray-900">{{ formatCurrency(typed(row).amount) }}</span>
          <span v-if="rateReady" class="block text-xs text-gray-400">{{ formatFC(typed(row).amount) }}</span>
        </template>

        <template #cell-paymentMethod="{ row }">
          <BaseBadge
            variant="info"
            size="xs"
          >
            {{ methodLabels[typed(row).paymentMethod] ?? typed(row).paymentMethod }}
          </BaseBadge>
        </template>

        <template #cell-reference="{ row }">
          <span class="text-xs text-gray-500 font-mono">{{ typed(row).reference ?? '-' }}</span>
        </template>

        <template #cell-paidAt="{ row }">
          <span class="text-sm text-gray-700">{{ formatDateShort(typed(row).paidAt) }}</span>
        </template>

        <template #cell-actions="{ row }">
          <button
            class="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded transition-colors"
            :title="t('ui.details')"
            @click.stop="openDetailModal(typed(row))"
          >
            <EyeIcon class="h-4 w-4" />
          </button>
        </template>
      </DataTable>
    </div>

    <!-- Detail Modal -->
    <BaseModal
      v-model="showDetailModal"
      :title="t('landlord.paymentDetail')"
      size="md"
    >
      <template v-if="selectedPayment">
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gray-50 p-3 rounded">
              <p class="text-xs text-gray-500 uppercase">{{ t('invoice.amount') }}</p>
              <p class="text-sm font-medium text-gray-900">{{ formatCurrency(selectedPayment.amount) }}</p>
              <p v-if="rateReady" class="text-xs text-gray-400">≈ {{ formatFC(selectedPayment.amount) }}</p>
            </div>
            <div class="bg-gray-50 p-3 rounded">
              <p class="text-xs text-gray-500 uppercase">{{ t('invoice.currency') }}</p>
              <p class="text-sm font-medium text-gray-900">{{ selectedPayment.currency }}</p>
            </div>
            <div class="bg-gray-50 p-3 rounded">
              <p class="text-xs text-gray-500 uppercase">{{ t('landlord.method') }}</p>
              <p class="text-sm font-medium text-gray-900">
                {{ methodLabels[selectedPayment.paymentMethod] ?? selectedPayment.paymentMethod }}
              </p>
            </div>
            <div class="bg-gray-50 p-3 rounded">
              <p class="text-xs text-gray-500 uppercase">{{ t('ui.date') }}</p>
              <p class="text-sm font-medium text-gray-900">{{ formatDateShort(selectedPayment.paidAt) }}</p>
            </div>
          </div>
          <div
            v-if="selectedPayment.reference"
            class="bg-gray-50 p-3 rounded"
          >
            <p class="text-xs text-gray-500 uppercase">{{ t('landlord.reference') }}</p>
            <p class="text-sm font-mono font-medium text-gray-900">{{ selectedPayment.reference }}</p>
          </div>
        </div>
      </template>
    </BaseModal>
  </div>
</template>
