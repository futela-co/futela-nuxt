// Property status
export const PROPERTY_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  UNPUBLISHED: 'unpublished',
  ARCHIVED: 'archived',
} as const

// Reservation status
export const RESERVATION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const

// Visit status
export const VISIT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

// Lease status
export const LEASE_STATUS = {
  ACTIVE: 'active',
  TERMINATED: 'terminated',
  EXPIRED: 'expired',
  PENDING: 'pending',
} as const

// Rent invoice status
export const INVOICE_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
} as const

// Review status
export const REVIEW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const

// Transaction type
export const TRANSACTION_TYPE = {
  TOP_UP: 'top_up',
  WITHDRAWAL: 'withdrawal',
  PAYMENT: 'payment',
  REFUND: 'refund',
} as const

// Transaction status
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const

// Notification status
export const NOTIFICATION_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  READ: 'read',
} as const

// Property types
export const PROPERTY_TYPES = {
  APARTMENT: 'apartment',
  HOUSE: 'house',
  LAND: 'land',
  EVENT_HALL: 'event_hall',
  CAR: 'car',
} as const

// Status color mapping
export type StatusColor = 'green' | 'yellow' | 'red' | 'gray' | 'blue'

export const STATUS_COLORS: Record<string, StatusColor> = {
  // Positive
  published: 'green',
  confirmed: 'green',
  completed: 'green',
  active: 'green',
  paid: 'green',
  approved: 'green',
  // Warning
  pending: 'yellow',
  sent: 'yellow',
  draft: 'yellow',
  // Danger
  cancelled: 'red',
  rejected: 'red',
  failed: 'red',
  overdue: 'red',
  terminated: 'red',
  // Neutral
  expired: 'gray',
  archived: 'gray',
  unpublished: 'gray',
  // Info
  read: 'blue',
}
