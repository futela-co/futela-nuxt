export interface Reservation {
  id: string
  propertyId: string
  propertyTitle: string
  guestId: string
  guestName: string
  hostId: string
  hostName: string
  startDate: string
  endDate: string
  totalPrice: number
  currency: string
  status: string
  numberOfGuests: number
  specialRequests: string | null
  numberOfNights: number
  confirmedAt: string | null
  cancelledAt: string | null
  completedAt: string | null
  createdAt: string
}

export interface Visit {
  id: string
  propertyId: string
  propertyTitle: string
  visitorId: string
  visitorName: string
  scheduledAt: string
  status: string
  notes: string | null
  confirmedAt: string | null
  completedAt: string | null
  createdAt: string
  isPaid: boolean
  paymentTransactionId: string | null
}

export interface CalendarDate {
  date: string
  status: 'available' | 'booked' | 'blocked'
  reservationId?: string
}

export interface PropertyCalendar {
  propertyId: string
  dates: CalendarDate[]
}

export interface InvoiceResponse {
  id: string
  reservationId: string
  amount: number
  currency: string
  status: string
  pdfUrl: string | null
  createdAt: string
}
