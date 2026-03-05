<script setup lang="ts">
import {
  ArrowUpIcon,
  ArrowDownIcon,
  BanknotesIcon,
} from '@heroicons/vue/24/outline'
import { walletApi } from '~/infrastructure/api/wallet'
import { formatDateTime } from '~/utils/date'
import type { Transaction } from '~/types/user'

definePageMeta({ layout: 'dashboard' })

const { t } = useLocale()
const pagination = usePagination()

const transactions = ref<Transaction[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

async function loadTransactions() {
  isLoading.value = true
  error.value = null
  try {
    const response: any = await walletApi.getTransactions({
      page: pagination.page.value,
    })
    transactions.value = Array.isArray(response) ? response : (response.data ?? [])
    pagination.updateFromResponse(response)
  } catch (e: any) {
    error.value = e.message || t('dashboard.loadTransactionsError')
  } finally {
    isLoading.value = false
  }
}

function transactionTypeLabel(type: string): string {
  const map: Record<string, string> = {
    top_up: t('dashboard.topUp'),
    withdrawal: t('dashboard.withdrawal'),
    payment: t('dashboard.payment'),
    refund: t('dashboard.refund'),
    deposit: t('dashboard.deposit'),
    rent_payment: t('dashboard.rentPayment'),
    reservation_payment: t('dashboard.reservationPayment'),
  }
  return map[type] ?? type
}

function transactionStatusColor(status: string): string {
  const map: Record<string, string> = {
    completed: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    failed: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-600',
  }
  return map[status] ?? 'bg-gray-100 text-gray-600'
}

function transactionStatusLabel(status: string): string {
  const map: Record<string, string> = {
    completed: t('dashboard.txCompleted'),
    pending: t('dashboard.txPending'),
    failed: t('dashboard.txFailed'),
    cancelled: t('dashboard.txCancelled'),
  }
  return map[status] ?? status
}

function isCredit(type: string): boolean {
  return ['top_up', 'refund', 'deposit'].includes(type)
}

watch(() => pagination.page.value, () => {
  loadTransactions()
})

// Fetch data immediately on navigation (Nuxt pattern)
loadTransactions()
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">{{ t('dashboard.transactions') }}</h1>
      <p class="text-gray-500 text-sm mt-1">{{ t('dashboard.transactionsHistory') }}</p>
    </div>

    <!-- Error state -->
    <div v-if="error && !isLoading" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-6">
      <p class="text-red-700 font-medium">{{ error }}</p>
      <button
        class="btn btn-danger btn-lg mt-3"
        @click="loadTransactions"
      >
        {{ t('dashboard.retry') }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="bg-white rounded-xl shadow-sm p-5 space-y-3">
      <div v-for="i in 6" :key="i" class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
        <div class="flex-1 space-y-1.5">
          <div class="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
          <div class="h-3 bg-gray-200 rounded animate-pulse w-1/4" />
        </div>
        <div class="h-4 bg-gray-200 rounded animate-pulse w-16" />
      </div>
    </div>

    <!-- Empty -->
    <div
      v-else-if="!error && transactions.length === 0"
      class="bg-white rounded-xl shadow-sm p-12 text-center"
    >
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <BanknotesIcon class="w-8 h-8 text-gray-400" />
      </div>
      <h2 class="text-lg font-semibold text-gray-900">{{ t('dashboard.noTransaction') }}</h2>
      <p class="text-gray-500 text-sm mt-2">{{ t('dashboard.transactionsAppearHere') }}</p>
    </div>

    <!-- Transaction list -->
    <div v-else-if="transactions.length > 0" class="bg-white rounded-xl shadow-sm">
      <div class="divide-y divide-gray-100">
        <div
          v-for="tx in transactions"
          :key="tx.id"
          class="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors"
        >
          <!-- Icon -->
          <div
            class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            :class="isCredit(tx.type) ? 'bg-emerald-50' : 'bg-red-50'"
          >
            <ArrowUpIcon v-if="isCredit(tx.type)" class="w-5 h-5 text-emerald-600" />
            <ArrowDownIcon v-else class="w-5 h-5 text-red-500" />
          </div>

          <!-- Details -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900">{{ transactionTypeLabel(tx.type) }}</p>
            <p v-if="tx.description" class="text-xs text-gray-500 truncate">{{ tx.description }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ formatDateTime(tx.createdAt) }}</p>
          </div>

          <!-- Amount + Status -->
          <div class="text-right flex-shrink-0">
            <p
              class="text-sm font-semibold"
              :class="isCredit(tx.type) ? 'text-emerald-600' : 'text-red-600'"
            >
              {{ isCredit(tx.type) ? '+' : '-' }}{{ tx.amount.toLocaleString('fr-FR') }} {{ tx.currency }}
            </p>
            <span
              class="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium"
              :class="transactionStatusColor(tx.status)"
            >
              {{ transactionStatusLabel(tx.status) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="pagination.totalPages.value > 1"
        class="px-5 py-3 border-t border-gray-200 flex justify-center"
      >
        <nav class="flex items-center gap-1">
          <button
            :disabled="!pagination.hasPrev.value"
            class="px-3 py-1.5 text-xs rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="pagination.prevPage(); loadTransactions()"
          >
            {{ t('ui.previous') }}
          </button>
          <span class="text-xs text-gray-500 px-2">
            {{ t('dashboard.page') }} {{ pagination.page.value }} / {{ pagination.totalPages.value }}
          </span>
          <button
            :disabled="!pagination.hasNext.value"
            class="px-3 py-1.5 text-xs rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="pagination.nextPage(); loadTransactions()"
          >
            {{ t('ui.next') }}
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>
