<script setup lang="ts">
import {
  PlusIcon,
  PencilSquareIcon,
  HomeModernIcon,
} from '@heroicons/vue/24/outline'
import type { DataTableColumn } from '~/components/data/DataTable.vue'
import { useLandlordStore } from '~/stores/landlord'

definePageMeta({ layout: 'dashboard', landlord: true })

const { t } = useLocale()
const store = useLandlordStore()
const { formatFC, isReady: rateReady } = useExchangeRate()

const filterType = ref<string | null>(null)
const filterStatus = ref<string | null>(null)
const perPage = ref(10)

const typeOptions = computed(() => [
  { value: 'apartment', label: t('property.apartment') },
  { value: 'house', label: t('property.house') },
  { value: 'land', label: t('property.land') },
  { value: 'event_hall', label: t('property.eventHall') },
  { value: 'car', label: t('property.car') },
])

const statusOptions = computed(() => [
  { value: 'published', label: t('status.published') },
  { value: 'draft', label: t('status.draft') },
])

const columns = computed<DataTableColumn[]>(() => [
  { key: 'index', label: '#', width: '40px', align: 'center' },
  { key: 'photo', label: '', width: '50px' },
  { key: 'title', label: t('landlord.title'), sortable: true },
  { key: 'type', label: t('landlord.type'), sortable: true },
  { key: 'price', label: t('landlord.price'), sortable: true, align: 'right' },
  { key: 'status', label: t('ui.status'), align: 'center' },
  { key: 'date', label: t('ui.date'), align: 'center' },
  { key: 'actions', label: '', width: '50px', align: 'right' },
])

const filteredData = computed(() => {
  return store.properties.map(p => ({
    ...p,
    photo: p.photos?.[0]?.thumbnails?.thumbnail_webp ?? p.photos?.[0]?.thumbnails?.thumbnail ?? p.photos?.[0]?.url ?? null,
    price: p.pricePerMonth ?? p.pricePerDay ?? 0,
  }))
})

const typeLabels = computed<Record<string, string>>(() => ({
  apartment: t('property.apartment'),
  house: t('property.house'),
  land: t('property.land'),
  event_hall: t('property.eventHall'),
  car: t('property.car'),
}))

const typeBadgeColors: Record<string, string> = {
  apartment: 'bg-blue-100 text-blue-700',
  house: 'bg-emerald-100 text-emerald-700',
  land: 'bg-amber-100 text-amber-700',
  event_hall: 'bg-purple-100 text-purple-700',
  car: 'bg-rose-100 text-rose-700',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function typed(row: Record<string, unknown>): any { return row }

function getStatusVariant(property: any): 'success' | 'gray' {
  return property.isPublished ? 'success' : 'gray'
}

function getStatusLabel(property: any): string {
  return property.isPublished ? t('status.published') : t('status.draft')
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value) + ' USD'
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function loadProperties() {
  const params: Record<string, any> = {
    page: store.propertiesPage,
    itemsPerPage: perPage.value,
  }
  if (filterType.value) params.type = filterType.value
  if (filterStatus.value) {
    params.isPublished = filterStatus.value === 'published'
  }
  store.fetchProperties(params)
}

function handlePageChange(page: number) {
  store.propertiesPage = page
  loadProperties()
}

function handlePerPageChange(value: number) {
  perPage.value = value
  store.propertiesPage = 1
  loadProperties()
}

// Fetch data immediately on navigation (Nuxt pattern)
loadProperties()
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900">{{ t('landlord.properties') }}</h1>
        <p class="text-sm text-gray-500">{{ t('landlord.propertiesDesc') }}</p>
      </div>
      <button
        class="btn btn-primary inline-flex items-center gap-2"
        @click="navigateTo('/dashboard/landlord/properties/create')"
      >
        <PlusIcon class="h-4 w-4" />
        {{ t('landlord.addProperty') }}
      </button>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-4">
      <div class="w-48">
        <BaseSelect
          v-model="filterType"
          :options="typeOptions"
          :placeholder="t('misc.allTypes')"
          size="sm"
          @change="loadProperties()"
        />
      </div>
      <div class="w-48">
        <BaseSelect
          v-model="filterStatus"
          :options="statusOptions"
          :placeholder="t('misc.allStatuses')"
          size="sm"
          @change="loadProperties()"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded border border-gray-200">
      <DataTable
        :columns="columns"
        :data="filteredData"
        :loading="store.propertiesLoading"
        :pagination="true"
        :current-page="store.propertiesPage"
        :per-page="perPage"
        :total-items="store.propertiesTotal"
        row-key="id"
        :empty-title="t('landlord.noPropertyEmpty')"
        :empty-description="t('landlord.noPropertyEmptyDesc')"
        empty-icon="folder"
        @page-change="handlePageChange"
        @per-page-change="handlePerPageChange"
        @row-click="(row: any) => navigateTo(`/dashboard/landlord/properties/${row.id}`)"
      >
        <!-- Index -->
        <template #cell-index="{ index }">
          <span class="text-xs text-gray-400">{{ (store.propertiesPage - 1) * perPage + index + 1 }}</span>
        </template>

        <!-- Photo -->
        <template #cell-photo="{ row }">
          <div class="h-10 w-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
            <img
              v-if="typed(row).photo"
              :src="typed(row).photo"
              :alt="typed(row).title"
              class="h-full w-full object-cover"
            >
            <HomeModernIcon
              v-else
              class="h-5 w-5 text-gray-400"
            />
          </div>
        </template>

        <!-- Title -->
        <template #cell-title="{ row }">
          <div>
            <p class="text-sm font-medium text-gray-900">{{ typed(row).title }}</p>
            <p class="text-xs text-gray-500">{{ typed(row).address?.city?.name ?? t('property.noLocation') }}</p>
          </div>
        </template>

        <!-- Type -->
        <template #cell-type="{ row }">
          <span
            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
            :class="typeBadgeColors[typed(row).type] ?? 'bg-gray-100 text-gray-700'"
          >{{ typeLabels[typed(row).type] ?? typed(row).type }}</span>
        </template>

        <!-- Price -->
        <template #cell-price="{ row }">
          <div class="whitespace-nowrap">
            <span class="text-sm font-medium text-gray-900">{{ formatPrice(typed(row).price) }}</span>
            <span class="text-xs text-gray-500">{{ typed(row).pricePerMonth ? t('landlord.perMonth') : t('landlord.perDay') }}</span>
            <span v-if="rateReady" class="text-xs text-gray-400 ml-1">({{ formatFC(typed(row).price) }})</span>
          </div>
        </template>

        <!-- Status -->
        <template #cell-status="{ row }">
          <BaseBadge
            :variant="getStatusVariant(typed(row))"
            size="sm"
            dot
          >
            {{ getStatusLabel(typed(row)) }}
          </BaseBadge>
        </template>

        <!-- Date -->
        <template #cell-date="{ row }">
          <span class="text-xs text-gray-500">{{ formatDate(typed(row).createdAt) }}</span>
        </template>

        <!-- Actions (edit only) -->
        <template #cell-actions="{ row }">
          <button
            class="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded transition-colors"
            :title="t('ui.edit')"
            @click.stop="navigateTo(`/dashboard/landlord/properties/${typed(row).id}/edit`)"
          >
            <PencilSquareIcon class="h-4 w-4" />
          </button>
        </template>

        <template #empty-action>
          <button
            class="btn btn-primary btn-sm mt-2"
            @click="navigateTo('/dashboard/landlord/properties/create')"
          >
            {{ t('landlord.addProperty') }}
          </button>
        </template>
      </DataTable>
    </div>
  </div>
</template>
