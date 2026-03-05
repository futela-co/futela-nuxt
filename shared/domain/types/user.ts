export interface Review {
  id: string
  propertyId: string
  propertyTitle: string
  reviewerId: string
  reviewerName: string
  revieweeId: string
  revieweeName: string
  rating: number
  title: string
  comment: string
  pros: string | null
  cons: string | null
  wouldRecommend: boolean
  status: string
  isFlagged: boolean
  response: string | null
  respondedAt: string | null
  createdAt: string
}

export interface Conversation {
  id: string
  subject: string
  participants: Array<{ id: string; name: string }>
  participantIds: string[]
  propertyId: string | null
  propertyTitle: string | null
  lastMessageAt: string | null
  isArchived: boolean
  createdAt: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  content: string
  isRead: boolean
  readAt: string | null
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  content: string
  data: Record<string, any>
  relatedEntityId: string | null
  relatedEntityType: string | null
  status: string
  channel: string
  isRead: boolean
  readAt: string | null
  sentVia: string[]
  createdAt: string
}

export interface Wallet {
  id: string
  userId: string
  balance: number
  currency: string
  isActive: boolean
  lastTransactionAt: string | null
  createdAt: string
}

export interface Transaction {
  id: string
  walletId: string
  userId: string
  type: string
  amount: number
  currency: string
  status: string
  gateway: string
  externalId: string | null
  description: string | null
  metadata: Record<string, any>
  relatedEntity: string | null
  relatedEntityType: string | null
  processedAt: string | null
  createdAt: string
}

export interface Lease {
  id: string
  propertyId: string
  propertyTitle: string
  tenantId: string
  tenantName: string
  landlordId: string
  landlordName: string
  monthlyRent: number
  currency: string
  deposit: number
  startDate: string
  endDate: string
  status: string
  paymentDayOfMonth: number
  specialTerms: string | null
  terminationReason: string | null
  terminatedAt: string | null
  createdAt: string
}

export interface RentInvoice {
  id: string
  leaseId: string
  invoiceNumber: string
  month: number
  year: number
  amount: number
  currency: string
  dueDate: string
  status: string
  pdfPath: string | null
  sentAt: string | null
  paidAt: string | null
  cancellationReason: string | null
  createdAt: string
}

export interface RentPayment {
  id: string
  invoiceId: string
  amount: number
  currency: string
  paymentMethod: string
  reference: string | null
  paidAt: string
  createdAt: string
}

export interface LandlordDashboard {
  totalProperties: number
  activeLeases: number
  totalTenants: number
  monthlyIncome: number
  yearlyIncome: number
  pendingPayments: number
  overduePayments: number
  occupancyRate: number
}
