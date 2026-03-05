<script setup lang="ts">
import {
  UsersIcon,
  CheckCircleIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  HomeModernIcon,
} from '@heroicons/vue/24/outline'
import { useLandlordStore } from '~shared/application/stores/landlord'

definePageMeta({ layout: 'dashboard', landlord: true })

const { t } = useLocale()
const store = useLandlordStore()

const upToDateCount = computed(() => {
  return store.tenants.filter((t: any) => t.paymentStatus === 'up_to_date').length
})

// Fetch data immediately on navigation (Nuxt pattern)
store.fetchTenants()
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-xl font-bold text-gray-900">{{ t('landlord.tenants') }}</h1>
      <p class="text-sm text-gray-500">{{ t('landlord.tenantsSubtitle') }}</p>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <BaseStatCard
        :icon="UsersIcon"
        icon-bg-color="bg-blue-100"
        icon-color="text-blue-600"
        :value="store.tenantsTotal"
        :label="t('landlord.totalTenants')"
        :secondary-label="t('landlord.tenantsLabel')"
      />
      <BaseStatCard
        :icon="CheckCircleIcon"
        icon-bg-color="bg-green-100"
        icon-color="text-green-600"
        :value="upToDateCount"
        :label="t('landlord.upToDate')"
        :secondary-label="t('landlord.inPayments')"
      />
    </div>

    <!-- Loading -->
    <div
      v-if="store.tenantsLoading"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <div
        v-for="i in 6"
        :key="i"
        class="bg-white rounded border border-gray-200 p-4 animate-pulse"
      >
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 bg-gray-200 rounded-full" />
          <div class="flex-1">
            <div class="h-4 w-24 bg-gray-200 rounded" />
            <div class="h-3 w-32 bg-gray-200 rounded mt-1" />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="store.tenants.length === 0"
      class="bg-white rounded border border-gray-200"
    >
      <BaseEmpty
        :title="t('landlord.noTenant')"
        :description="t('landlord.noTenantDesc')"
        icon="users"
      >
        <template #action>
          <button
            class="btn btn-primary btn-sm"
            @click="navigateTo('/dashboard/landlord/leases')"
          >
            {{ t('lease.createLease') }}
          </button>
        </template>
      </BaseEmpty>
    </div>

    <!-- Tenant Cards -->
    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <div
        v-for="tenant in store.tenants"
        :key="tenant.id"
        class="bg-white rounded border border-gray-200 p-4 hover:shadow-sm transition-shadow"
      >
        <div class="flex items-start gap-3">
          <!-- Avatar -->
          <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <UserIcon class="h-5 w-5 text-primary-600" />
          </div>

          <div class="flex-1 min-w-0">
            <!-- Name -->
            <p class="text-sm font-semibold text-gray-900 truncate">{{ tenant.name ?? tenant.fullName ?? t('lease.tenant') }}</p>

            <!-- Contact -->
            <div class="mt-1 space-y-0.5">
              <div
                v-if="tenant.email"
                class="flex items-center gap-1.5 text-xs text-gray-500"
              >
                <EnvelopeIcon class="h-3 w-3 flex-shrink-0" />
                <span class="truncate">{{ tenant.email }}</span>
              </div>
              <div
                v-if="tenant.phone"
                class="flex items-center gap-1.5 text-xs text-gray-500"
              >
                <PhoneIcon class="h-3 w-3 flex-shrink-0" />
                <span>{{ tenant.phone }}</span>
              </div>
            </div>

            <!-- Property info -->
            <div
              v-if="tenant.propertyTitle"
              class="mt-2 flex items-center gap-1.5 text-xs text-gray-500"
            >
              <HomeModernIcon class="h-3 w-3 flex-shrink-0" />
              <span class="truncate">{{ tenant.propertyTitle }}</span>
            </div>

            <!-- Status badges -->
            <div class="mt-2 flex items-center gap-2">
              <BaseBadge
                v-if="tenant.leaseStatus"
                :variant="tenant.leaseStatus === 'active' ? 'success' : 'gray'"
                size="xs"
                dot
              >
                {{ tenant.leaseStatus === 'active' ? t('landlord.activeLease') : t('landlord.expiredLease') }}
              </BaseBadge>
              <BaseBadge
                v-if="tenant.paymentStatus"
                :variant="tenant.paymentStatus === 'up_to_date' ? 'success' : tenant.paymentStatus === 'overdue' ? 'danger' : 'warning'"
                size="xs"
              >
                {{ tenant.paymentStatus === 'up_to_date' ? t('landlord.upToDate') : tenant.paymentStatus === 'overdue' ? t('status.overdue') : t('status.pending') }}
              </BaseBadge>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
