import { defineStore } from 'pinia'
import { rentApi } from '~/infrastructure/api/rent'
import { propertiesApi } from '~/infrastructure/api/properties'
import type { Lease, RentInvoice, RentPayment, LandlordDashboard } from '~/types/user'
import type { Property } from '~/types/property'

export const useLandlordStore = defineStore('landlord', () => {
  // Dashboard
  const dashboard = ref<LandlordDashboard | null>(null)
  const dashboardLoading = ref(false)

  // Properties
  const properties = ref<Property[]>([])
  const propertiesTotal = ref(0)
  const propertiesLoading = ref(false)
  const propertiesPage = ref(1)

  // Leases
  const leases = ref<Lease[]>([])
  const leasesTotal = ref(0)
  const leasesLoading = ref(false)
  const leasesPage = ref(1)

  // Invoices
  const invoices = ref<RentInvoice[]>([])
  const invoicesTotal = ref(0)
  const invoicesLoading = ref(false)
  const invoicesPage = ref(1)

  // Payments
  const payments = ref<RentPayment[]>([])
  const paymentsTotal = ref(0)
  const paymentsLoading = ref(false)
  const paymentsPage = ref(1)

  // Tenants
  const tenants = ref<any[]>([])
  const tenantsTotal = ref(0)
  const tenantsLoading = ref(false)

  // Dashboard actions
  async function fetchDashboard() {
    dashboardLoading.value = true
    try {
      dashboard.value = await rentApi.getLandlordDashboard()
    } catch (error) {
      console.error('Failed to fetch dashboard:', error)
    } finally {
      dashboardLoading.value = false
    }
  }

  // Properties actions
  async function fetchProperties(params?: Record<string, any>) {
    propertiesLoading.value = true
    try {
      const response: any = await propertiesApi.myProperties(params)
      const items = Array.isArray(response) ? response : (response.data ?? [])
      properties.value = items
      propertiesTotal.value = Array.isArray(response) ? items.length : (response.total ?? items.length)
      if (!Array.isArray(response) && response.meta) {
        propertiesPage.value = response.meta.page
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error)
    } finally {
      propertiesLoading.value = false
    }
  }

  async function publishProperty(id: string) {
    await propertiesApi.publish(id)
    const prop = properties.value.find(p => p.id === id)
    if (prop) prop.isPublished = true
  }

  async function unpublishProperty(id: string) {
    await propertiesApi.unpublish(id)
    const prop = properties.value.find(p => p.id === id)
    if (prop) prop.isPublished = false
  }

  async function deleteProperty(id: string) {
    await propertiesApi.delete(id)
    properties.value = properties.value.filter(p => p.id !== id)
    propertiesTotal.value--
  }

  // Leases actions
  async function fetchLeases(params?: Record<string, any>) {
    leasesLoading.value = true
    try {
      const response: any = await rentApi.getLandlordLeases(params)
      const items = Array.isArray(response) ? response : (response.data ?? [])
      leases.value = items
      leasesTotal.value = Array.isArray(response) ? items.length : (response.total ?? items.length)
      if (!Array.isArray(response) && response.meta) {
        leasesPage.value = response.meta.page
      }
    } catch (error) {
      console.error('Failed to fetch leases:', error)
    } finally {
      leasesLoading.value = false
    }
  }

  async function createLease(data: Record<string, any>): Promise<Lease> {
    const lease = await rentApi.createLease(data)
    leases.value.unshift(lease)
    leasesTotal.value++
    return lease
  }

  async function terminateLease(id: string, reason: string): Promise<Lease> {
    const lease = await rentApi.terminateLease(id, { reason })
    const index = leases.value.findIndex(l => l.id === id)
    if (index !== -1) {
      leases.value[index] = lease
    }
    return lease
  }

  // Invoices actions
  async function fetchInvoices(params?: Record<string, any>) {
    invoicesLoading.value = true
    try {
      const response: any = await rentApi.getLandlordInvoices(params)
      const items = Array.isArray(response) ? response : (response.data ?? [])
      invoices.value = items
      invoicesTotal.value = Array.isArray(response) ? items.length : (response.total ?? items.length)
      if (!Array.isArray(response) && response.meta) {
        invoicesPage.value = response.meta.page
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
    } finally {
      invoicesLoading.value = false
    }
  }

  // Payments actions
  async function fetchPayments(params?: Record<string, any>) {
    paymentsLoading.value = true
    try {
      const response: any = await rentApi.getLandlordPayments(params)
      const items = Array.isArray(response) ? response : (response.data ?? [])
      payments.value = items
      paymentsTotal.value = Array.isArray(response) ? items.length : (response.total ?? items.length)
      if (!Array.isArray(response) && response.meta) {
        paymentsPage.value = response.meta.page
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    } finally {
      paymentsLoading.value = false
    }
  }

  // Tenants actions
  async function fetchTenants(params?: Record<string, any>) {
    tenantsLoading.value = true
    try {
      const response = await rentApi.getLandlordTenants(params)
      if (Array.isArray(response)) {
        tenants.value = response
        tenantsTotal.value = response.length
      } else {
        tenants.value = response.data ?? response
        tenantsTotal.value = response.total ?? tenants.value.length
      }
    } catch (error) {
      console.error('Failed to fetch tenants:', error)
    } finally {
      tenantsLoading.value = false
    }
  }

  // Computed
  const activeLeases = computed(() => leases.value.filter(l => l.status === 'active'))
  const unpaidInvoices = computed(() => invoices.value.filter(i => i.status === 'unpaid' || i.status === 'overdue'))

  return {
    // Dashboard
    dashboard,
    dashboardLoading,
    fetchDashboard,
    // Properties
    properties,
    propertiesTotal,
    propertiesLoading,
    propertiesPage,
    fetchProperties,
    publishProperty,
    unpublishProperty,
    deleteProperty,
    // Leases
    leases,
    leasesTotal,
    leasesLoading,
    leasesPage,
    fetchLeases,
    createLease,
    terminateLease,
    activeLeases,
    // Invoices
    invoices,
    invoicesTotal,
    invoicesLoading,
    invoicesPage,
    fetchInvoices,
    unpaidInvoices,
    // Payments
    payments,
    paymentsTotal,
    paymentsLoading,
    paymentsPage,
    fetchPayments,
    // Tenants
    tenants,
    tenantsTotal,
    tenantsLoading,
    fetchTenants,
  }
})
