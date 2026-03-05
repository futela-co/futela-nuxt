import { api } from './client'
import { API_ENDPOINTS } from '../../domain/constants/api'
import type { Wallet, Transaction } from '../../domain/types/user'
import type { PaginatedResponse } from '../../domain/types/common'

export const walletApi = {
  getMyWallet(): Promise<Wallet> {
    return api.get(API_ENDPOINTS.WALLET.MINE)
  },

  getBalance(): Promise<{ balance: number; currency: string }> {
    return api.get(API_ENDPOINTS.WALLET.BALANCE)
  },

  topUp(data: { amount: number; gateway: string }): Promise<Transaction> {
    return api.post(API_ENDPOINTS.WALLET.TOP_UP, data)
  },

  withdraw(data: { amount: number; gateway: string }): Promise<Transaction> {
    return api.post(API_ENDPOINTS.WALLET.WITHDRAW, data)
  },

  getTransactions(params?: Record<string, any>): Promise<PaginatedResponse<Transaction>> {
    return api.get(API_ENDPOINTS.WALLET.TRANSACTIONS, params)
  },
}
