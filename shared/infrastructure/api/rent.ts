import { api } from './client'
import { API_ENDPOINTS } from '~/domain/constants/api'
import type { Lease, RentInvoice, RentPayment, LandlordDashboard } from '~/domain/types/user'
import type { PaginatedResponse } from '~/domain/types/common'

export const rentApi = {
  // Leases
  getLeases(params?: Record<string, any>): Promise<PaginatedResponse<Lease>> {
    return api.get(API_ENDPOINTS.RENT.LEASES, params)
  },

  getLease(id: string): Promise<Lease> {
    return api.get(API_ENDPOINTS.RENT.LEASE_DETAIL(id))
  },

  createLease(data: Record<string, any>): Promise<Lease> {
    return api.post(API_ENDPOINTS.RENT.CREATE_LEASE, data)
  },

  terminateLease(id: string, data: { reason: string }): Promise<Lease> {
    return api.post(API_ENDPOINTS.RENT.TERMINATE_LEASE(id), data)
  },

  // Invoices
  getInvoices(params?: Record<string, any>): Promise<PaginatedResponse<RentInvoice>> {
    return api.get(API_ENDPOINTS.RENT.INVOICES, params)
  },

  getInvoice(id: string): Promise<RentInvoice> {
    return api.get(API_ENDPOINTS.RENT.INVOICE_DETAIL(id))
  },

  payInvoice(id: string, data: Record<string, any>): Promise<RentPayment> {
    return api.post(API_ENDPOINTS.RENT.PAY_INVOICE(id), data)
  },

  // Payments
  getPayments(params?: Record<string, any>): Promise<PaginatedResponse<RentPayment>> {
    return api.get(API_ENDPOINTS.RENT.PAYMENTS, params)
  },

  // Landlord
  getLandlordDashboard(): Promise<LandlordDashboard> {
    return api.get(API_ENDPOINTS.RENT.LANDLORD_DASHBOARD)
  },

  getLandlordLeases(params?: Record<string, any>): Promise<PaginatedResponse<Lease>> {
    return api.get(API_ENDPOINTS.RENT.LANDLORD_LEASES, params)
  },

  getLandlordInvoices(params?: Record<string, any>): Promise<PaginatedResponse<RentInvoice>> {
    return api.get(API_ENDPOINTS.RENT.LANDLORD_INVOICES, params)
  },

  getLandlordPayments(params?: Record<string, any>): Promise<PaginatedResponse<RentPayment>> {
    return api.get(API_ENDPOINTS.RENT.LANDLORD_PAYMENTS, params)
  },

  getLandlordTenants(params?: Record<string, any>): Promise<any> {
    return api.get(API_ENDPOINTS.RENT.LANDLORD_TENANTS, params)
  },

  getLandlordProperties(params?: Record<string, any>): Promise<any> {
    return api.get(API_ENDPOINTS.RENT.LANDLORD_PROPERTIES, params)
  },

  // Tenant
  getTenantLeases(params?: Record<string, any>): Promise<PaginatedResponse<Lease>> {
    return api.get(API_ENDPOINTS.RENT.TENANT_LEASES, params)
  },

  getTenantInvoices(params?: Record<string, any>): Promise<PaginatedResponse<RentInvoice>> {
    return api.get(API_ENDPOINTS.RENT.TENANT_INVOICES, params)
  },

  getTenantPayments(params?: Record<string, any>): Promise<PaginatedResponse<RentPayment>> {
    return api.get(API_ENDPOINTS.RENT.TENANT_PAYMENTS, params)
  },
}
