<script setup lang="ts">
import {
  EyeIcon,
  EnvelopeIcon,
  DocumentArrowDownIcon,
} from '@heroicons/vue/24/outline'
import type { DataTableColumn } from '~/components/data/DataTable.vue'
import { useLandlordStore } from '~/stores/landlord'
import { formatDateShort } from '~/utils/date'
import type { RentInvoice } from '~/types/user'

definePageMeta({ layout: 'dashboard', landlord: true })

const { t } = useLocale()
const store = useLandlordStore()
const { formatFC, isReady: rateReady } = useExchangeRate()

const perPage = ref(10)
const filterStatus = ref<string | null>(null)
const showUnpaidOnly = ref(false)
const showDetailModal = ref(false)
const selectedInvoice = ref<RentInvoice | null>(null)

const statusOptions = computed(() => [
  { value: 'paid', label: t('status.paid') },
  { value: 'unpaid', label: t('status.unpaid') },
  { value: 'overdue', label: t('status.overdue') },
  { value: 'cancelled', label: t('status.cancelled') },
])

const columns = computed<DataTableColumn[]>(() => [
  { key: 'invoiceNumber', label: t('invoice.number'), sortable: true },
  { key: 'leaseId', label: t('invoice.leaseId') },
  { key: 'period', label: t('invoice.period') },
  { key: 'amount', label: t('invoice.amount'), sortable: true, align: 'right' },
  { key: 'dueDate', label: t('invoice.dueDate'), sortable: true },
  { key: 'status', label: t('ui.status'), align: 'center' },
  { key: 'actions', label: '', width: '100px', align: 'right' },
])

const monthNames = computed(() => [
  t('month.january'), t('month.february'), t('month.march'), t('month.april'), t('month.may'), t('month.june'),
  t('month.july'), t('month.august'), t('month.september'), t('month.october'), t('month.november'), t('month.december'),
])

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function typed(row: Record<string, unknown>): any { return row }

function getStatusVariant(status: string): 'success' | 'danger' | 'warning' | 'gray' {
  const map: Record<string, 'success' | 'danger' | 'warning' | 'gray'> = {
    paid: 'success',
    unpaid: 'warning',
    overdue: 'danger',
    cancelled: 'gray',
  }
  return map[status] ?? 'gray'
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    paid: t('status.paid'),
    unpaid: t('status.unpaid'),
    overdue: t('status.overdue'),
    cancelled: t('status.cancelled'),
  }
  return map[status] ?? status
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value) + ' USD'
}

function loadInvoices() {
  const params: Record<string, any> = {
    page: store.invoicesPage,
    itemsPerPage: perPage.value,
  }
  if (filterStatus.value) params.status = filterStatus.value
  if (showUnpaidOnly.value) params.status = 'unpaid'
  store.fetchInvoices(params)
}

function handlePageChange(page: number) {
  store.invoicesPage = page
  loadInvoices()
}

function toggleUnpaidOnly() {
  showUnpaidOnly.value = !showUnpaidOnly.value
  if (showUnpaidOnly.value) {
    filterStatus.value = null
  }
  loadInvoices()
}

function openDetailModal(invoice: RentInvoice) {
  selectedInvoice.value = invoice
  showDetailModal.value = true
}

// Fetch data immediately on navigation (Nuxt pattern)
loadInvoices()
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-xl font-bold text-gray-900">{{ t('landlord.invoices') }}</h1>
      <p class="text-sm text-gray-500">{{ t('landlord.invoicesDesc') }}</p>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-4">
      <div class="w-48">
        <BaseSelect
          v-model="filterStatus"
          :options="statusOptions"
          :placeholder="t('misc.allStatuses')"
          size="sm"
          :disabled="showUnpaidOnly"
          @change="loadInvoices()"
        />
      </div>
      <label class="inline-flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          class="form-check-input"
          :checked="showUnpaidOnly"
          @change="toggleUnpaidOnly"
        >
        <span class="text-sm text-gray-700">{{ t('invoice.unpaidOnly') }}</span>
      </label>
    </div>

    <!-- Table -->
    <div class="bg-white rounded border border-gray-200">
      <DataTable
        :columns="columns"
        :data="store.invoices"
        :loading="store.invoicesLoading"
        :pagination="true"
        :current-page="store.invoicesPage"
        :per-page="perPage"
        :total-items="store.invoicesTotal"
        row-key="id"
        :empty-title="t('invoice.noInvoices')"
        :empty-description="t('invoice.noInvoicesDesc')"
        empty-icon="document"
        @page-change="handlePageChange"
      >
        <template #cell-invoiceNumber="{ row }">
          <span class="text-sm font-mono font-medium text-gray-900">{{ typed(row).invoiceNumber }}</span>
        </template>

        <template #cell-leaseId="{ row }">
          <span class="text-xs text-gray-500 font-mono">{{ typed(row).leaseId?.slice(0, 8) }}...</span>
        </template>

        <template #cell-period="{ row }">
          <span class="text-sm text-gray-700">
            {{ monthNames[typed(row).month - 1] }} {{ typed(row).year }}
          </span>
        </template>

        <template #cell-amount="{ row }">
          <span class="text-sm font-medium text-gray-900">{{ formatCurrency(typed(row).amount) }}</span>
          <span v-if="rateReady" class="block text-xs text-gray-400">{{ formatFC(typed(row).amount) }}</span>
        </template>

        <template #cell-dueDate="{ row }">
          <span class="text-sm text-gray-700">{{ formatDateShort(typed(row).dueDate) }}</span>
        </template>

        <template #cell-status="{ row }">
          <BaseBadge
            :variant="getStatusVariant(typed(row).status)"
            size="sm"
            dot
          >
            {{ getStatusLabel(typed(row).status) }}
          </BaseBadge>
        </template>

        <template #cell-actions="{ row }">
          <div class="flex items-center justify-end gap-1">
            <button
              class="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded transition-colors"
              :title="t('ui.details')"
              @click.stop="openDetailModal(typed(row))"
            >
              <EyeIcon class="h-4 w-4" />
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Detail Modal -->
    <BaseModal
      v-model="showDetailModal"
      :title="t('invoice.details')"
      size="lg"
    >
      <template v-if="selectedInvoice">
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gray-50 p-3 rounded">
              <p class="text-xs text-gray-500 uppercase">{{ t('invoice.number') }}</p>
              <p class="text-sm font-mono font-medium text-gray-900">{{ selectedInvoice.invoiceNumber }}</p>
            </div>
            <div class="bg-gray-50 p-3 rounded">
              <p class="text-xs text-gray-500 uppercase">{{ t('ui.status') }}</p>
              <BaseBadge
                :variant="getStatusVariant(selectedInvoice.status)"
                size="sm"
                dot
                class="mt-1"
              >
                {{ getStatusLabel(selectedInvoice.status) }}
              </BaseBadge>
            </div>
            <div class="bg-gray-50 p-3 rounded">
              <p class="text-xs text-gray-500 uppercase">{{ t('invoice.period') }}</p>
              <p class="text-sm font-medium text-gray-900">
                {{ monthNames[selectedInvoice.month - 1] }} {{ selectedInvoice.year }}
              </p>
            </div>
            <div class="bg-gray-50 p-3 rounded">
              <p class="text-xs text-gray-500 uppercase">{{ t('invoice.amount') }}</p>
              <p class="text-sm font-medium text-gray-900">{{ formatCurrency(selectedInvoice.amount) }}</p>
              <p v-if="rateReady" class="text-xs text-gray-400">≈ {{ formatFC(selectedInvoice.amount) }}</p>
            </div>
            <div class="bg-gray-50 p-3 rounded">
              <p class="text-xs text-gray-500 uppercase">{{ t('invoice.dueDate') }}</p>
              <p class="text-sm font-medium text-gray-900">{{ formatDateShort(selectedInvoice.dueDate) }}</p>
            </div>
            <div class="bg-gray-50 p-3 rounded">
              <p class="text-xs text-gray-500 uppercase">{{ t('invoice.paidAt') }}</p>
              <p class="text-sm font-medium text-gray-900">{{ selectedInvoice.paidAt ? formatDateShort(selectedInvoice.paidAt) : '-' }}</p>
            </div>
          </div>

          <div class="flex gap-3 pt-2">
            <button class="btn btn-secondary btn-sm inline-flex items-center gap-2">
              <EnvelopeIcon class="h-4 w-4" />
              {{ t('invoice.sendEmail') }}
            </button>
            <button
              v-if="selectedInvoice.pdfPath"
              class="btn btn-secondary btn-sm inline-flex items-center gap-2"
            >
              <DocumentArrowDownIcon class="h-4 w-4" />
              {{ t('invoice.downloadPdf') }}
            </button>
          </div>
        </div>
      </template>
    </BaseModal>
  </div>
</template>
