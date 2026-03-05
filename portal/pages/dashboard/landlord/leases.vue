<script setup lang="ts">
import {
  PlusIcon,
  XCircleIcon,
  EyeIcon,
} from '@heroicons/vue/24/outline'
import type { DataTableColumn } from '~/components/data/DataTable.vue'
import { useLandlordStore } from '~/application/stores/landlord'
// formatDateShort auto-imported from ~/utils/date
import type { Lease } from '~/domain/types/user'

definePageMeta({ layout: 'dashboard', landlord: true })

const { t } = useLocale()
const store = useLandlordStore()
const toast = useToast()
const { formatFC, isReady: rateReady } = useExchangeRate()

const perPage = ref(10)
const filterStatus = ref<string | null>(null)

// Modals
const showCreateModal = ref(false)
const showTerminateModal = ref(false)
const showDetailModal = ref(false)
const selectedLease = ref<Lease | null>(null)
const isCreating = ref(false)
const isTerminating = ref(false)

const statusOptions = computed(() => [
  { value: 'active', label: t('status.active') },
  { value: 'expired', label: t('status.expired') },
  { value: 'terminated', label: t('status.terminated') },
])

const columns = computed<DataTableColumn[]>(() => [
  { key: 'tenantName', label: t('lease.tenant'), sortable: true },
  { key: 'propertyTitle', label: t('lease.property'), sortable: true },
  { key: 'dates', label: t('lease.period') },
  { key: 'monthlyRent', label: t('lease.monthlyRent'), sortable: true, align: 'right' },
  { key: 'status', label: t('ui.status'), align: 'center' },
  { key: 'actions', label: '', width: '100px', align: 'right' },
])

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function typed(row: Record<string, unknown>): any { return row }

function getStatusVariant(status: string): 'success' | 'gray' | 'danger' {
  const map: Record<string, 'success' | 'gray' | 'danger'> = {
    active: 'success',
    expired: 'gray',
    terminated: 'danger',
  }
  return map[status] ?? 'gray'
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    active: t('status.active'),
    expired: t('status.expired'),
    terminated: t('status.terminated'),
  }
  return map[status] ?? status
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value) + ' USD'
}

function loadLeases() {
  const params: Record<string, any> = {
    page: store.leasesPage,
    itemsPerPage: perPage.value,
  }
  if (filterStatus.value) params.status = filterStatus.value
  store.fetchLeases(params)
}

function handlePageChange(page: number) {
  store.leasesPage = page
  loadLeases()
}

async function handleCreateLease(data: Record<string, any>) {
  isCreating.value = true
  try {
    await store.createLease(data)
    toast.success(t('lease.createSuccess'))
    showCreateModal.value = false
    loadLeases()
  } catch {
    toast.error(t('lease.createError'))
  } finally {
    isCreating.value = false
  }
}

function openTerminateModal(lease: Lease) {
  selectedLease.value = lease
  showTerminateModal.value = true
}

async function handleTerminate(reason: string) {
  if (!selectedLease.value) return
  isTerminating.value = true
  try {
    await store.terminateLease(selectedLease.value.id, reason)
    toast.warning(t('lease.terminateSuccess'))
    showTerminateModal.value = false
    selectedLease.value = null
  } catch {
    toast.error(t('lease.terminateError'))
  } finally {
    isTerminating.value = false
  }
}

function openDetailModal(lease: Lease) {
  selectedLease.value = lease
  showDetailModal.value = true
}

// Fetch data immediately on navigation (Nuxt pattern)
loadLeases()
store.fetchProperties()
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900">{{ t('landlord.leases') }}</h1>
        <p class="text-sm text-gray-500">{{ t('landlord.leasesDesc') }}</p>
      </div>
      <button
        class="btn btn-primary inline-flex items-center gap-2"
        @click="showCreateModal = true"
      >
        <PlusIcon class="h-4 w-4" />
        {{ t('landlord.newLease') }}
      </button>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-4">
      <div class="w-48">
        <BaseSelect
          v-model="filterStatus"
          :options="statusOptions"
          :placeholder="t('misc.allStatuses')"
          size="sm"
          @change="loadLeases()"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded border border-gray-200">
      <DataTable
        :columns="columns"
        :data="store.leases"
        :loading="store.leasesLoading"
        :pagination="true"
        :current-page="store.leasesPage"
        :per-page="perPage"
        :total-items="store.leasesTotal"
        row-key="id"
        :empty-title="t('lease.noLeases')"
        :empty-description="t('lease.noLeasesDesc')"
        empty-icon="document"
        @page-change="handlePageChange"
      >
        <template #cell-tenantName="{ row }">
          <span class="text-sm font-medium text-gray-900">{{ typed(row).tenantName }}</span>
        </template>

        <template #cell-propertyTitle="{ row }">
          <span class="text-sm text-gray-700">{{ typed(row).propertyTitle }}</span>
        </template>

        <template #cell-dates="{ row }">
          <div class="text-xs text-gray-500">
            <span>{{ formatDateShort(typed(row).startDate) }}</span>
            <span class="mx-1">-</span>
            <span>{{ formatDateShort(typed(row).endDate) }}</span>
          </div>
        </template>

        <template #cell-monthlyRent="{ row }">
          <span class="text-sm font-medium text-gray-900">{{ formatCurrency(typed(row).monthlyRent) }}</span>
          <span v-if="rateReady" class="block text-xs text-gray-400">{{ formatFC(typed(row).monthlyRent) }}</span>
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
            <button
              v-if="typed(row).status === 'active'"
              class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded transition-colors"
              :title="t('lease.terminate')"
              @click.stop="openTerminateModal(typed(row))"
            >
              <XCircleIcon class="h-4 w-4" />
            </button>
          </div>
        </template>

        <template #empty-action>
          <button
            class="btn btn-primary btn-sm mt-2"
            @click="showCreateModal = true"
          >
            {{ t('lease.createLease') }}
          </button>
        </template>
      </DataTable>
    </div>

    <!-- Create Lease Modal -->
    <BaseModal
      v-model="showCreateModal"
      :title="t('lease.createLease')"
      size="lg"
    >
      <LeaseForm
        :properties="store.properties"
        :is-submitting="isCreating"
        @submit="handleCreateLease"
        @cancel="showCreateModal = false"
      />
    </BaseModal>

    <!-- Terminate Lease Modal -->
    <TerminateLeaseModal
      v-model="showTerminateModal"
      :lease="selectedLease"
      :is-submitting="isTerminating"
      @confirm="handleTerminate"
    />

    <!-- Detail Modal -->
    <BaseModal
      v-model="showDetailModal"
      :title="t('lease.leaseDetails')"
      size="lg"
    >
      <template v-if="selectedLease">
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gray-50 p-3 rounded">
              <p class="text-xs text-gray-500 uppercase">{{ t('lease.tenant') }}</p>
              <p class="text-sm font-medium text-gray-900">{{ selectedLease.tenantName }}</p>
            </div>
            <div class="bg-gray-50 p-3 rounded">
              <p class="text-xs text-gray-500 uppercase">{{ t('lease.property') }}</p>
              <p class="text-sm font-medium text-gray-900">{{ selectedLease.propertyTitle }}</p>
            </div>
            <div class="bg-gray-50 p-3 rounded">
              <p class="text-xs text-gray-500 uppercase">{{ t('lease.monthlyRent') }}</p>
              <p class="text-sm font-medium text-gray-900">{{ formatCurrency(selectedLease.monthlyRent) }}</p>
              <p v-if="rateReady" class="text-xs text-gray-400">≈ {{ formatFC(selectedLease.monthlyRent) }}</p>
            </div>
            <div class="bg-gray-50 p-3 rounded">
              <p class="text-xs text-gray-500 uppercase">{{ t('lease.deposit') }}</p>
              <p class="text-sm font-medium text-gray-900">{{ formatCurrency(selectedLease.deposit) }}</p>
              <p v-if="rateReady" class="text-xs text-gray-400">≈ {{ formatFC(selectedLease.deposit) }}</p>
            </div>
            <div class="bg-gray-50 p-3 rounded">
              <p class="text-xs text-gray-500 uppercase">{{ t('lease.startDate') }}</p>
              <p class="text-sm font-medium text-gray-900">{{ formatDateShort(selectedLease.startDate) }}</p>
            </div>
            <div class="bg-gray-50 p-3 rounded">
              <p class="text-xs text-gray-500 uppercase">{{ t('lease.endDate') }}</p>
              <p class="text-sm font-medium text-gray-900">{{ formatDateShort(selectedLease.endDate) }}</p>
            </div>
          </div>
          <div class="bg-gray-50 p-3 rounded">
            <p class="text-xs text-gray-500 uppercase">{{ t('ui.status') }}</p>
            <BaseBadge
              :variant="getStatusVariant(selectedLease.status)"
              size="sm"
              dot
              class="mt-1"
            >
              {{ getStatusLabel(selectedLease.status) }}
            </BaseBadge>
          </div>
          <div
            v-if="selectedLease.specialTerms"
            class="bg-gray-50 p-3 rounded"
          >
            <p class="text-xs text-gray-500 uppercase">{{ t('lease.specialTerms') }}</p>
            <p class="text-sm text-gray-700 mt-1">{{ selectedLease.specialTerms }}</p>
          </div>
          <div
            v-if="selectedLease.terminationReason"
            class="bg-red-50 p-3 rounded"
          >
            <p class="text-xs text-red-500 uppercase">{{ t('lease.terminationReason') }}</p>
            <p class="text-sm text-red-700 mt-1">{{ selectedLease.terminationReason }}</p>
          </div>
        </div>
      </template>
    </BaseModal>
  </div>
</template>
