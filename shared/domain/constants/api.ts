export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    GOOGLE: '/auth/google',
    SEND_EMAIL_CODE: '/auth/send-email-code',
    SEND_PHONE_CODE: '/auth/send-phone-code',
    CONFIRM_EMAIL: '/auth/confirm-email',
    CONFIRM_PHONE: '/auth/confirm-phone',
    DEVICES: '/auth/devices',
    REVOKE_ALL: '/auth/revoke-all',
  },

  // Properties
  PROPERTIES: {
    LIST: '/properties',
    DETAIL: (id: string) => `/properties/${id}`,
    CREATE: '/properties',
    UPDATE: (id: string) => `/properties/${id}`,
    DELETE: (id: string) => `/properties/${id}`,
    PUBLISH: (id: string) => `/properties/${id}/publish`,
    UNPUBLISH: (id: string) => `/properties/${id}/unpublish`,
    SEARCH: '/properties/search',
    PHOTOS: (id: string) => `/properties/${id}/photos`,
    PHOTO_DELETE: (propertyId: string, photoId: string) => `/properties/${propertyId}/photos/${photoId}`,
    CONTACT: (id: string) => `/properties/${id}/contact`,
    MY_PROPERTIES: '/me/properties',
  },

  // Favorites
  FAVORITES: {
    LIST: '/me/favorites',
    REMOVE: (propertyId: string) => `/me/favorites/${propertyId}`,
  },

  // Categories
  CATEGORIES: {
    LIST: '/categories',
    DETAIL: (id: string) => `/categories/${id}`,
  },

  // Geography
  GEOGRAPHY: {
    COUNTRIES: '/countries',
    PROVINCES: '/provinces',
    CITIES: '/cities',
    DISTRICTS: '/districts',
    TOWNS: '/towns',
    SEARCH: '/geography/search',
  },

  // Reservations
  RESERVATIONS: {
    LIST: '/reservations',
    DETAIL: (id: string) => `/reservations/${id}`,
    CREATE: '/reservations',
    CANCEL: (id: string) => `/reservations/${id}/cancel`,
    CONFIRM: (id: string) => `/reservations/${id}/confirm`,
    INVOICE: (id: string) => `/reservations/${id}/invoice`,
    PAY: (id: string) => `/reservations/${id}/pay`,
    MY_RESERVATIONS: '/me/reservations',
    MY_BOOKINGS: '/me/bookings',
    MY_BOOKINGS_PENDING: '/me/bookings/pending',
    MY_BOOKINGS_CONFIRMED: '/me/bookings/confirmed',
    MY_RESERVATIONS_INCOMING: '/me/reservations/incoming',
    MY_RESERVATIONS_PAST: '/me/reservations/past',
    MY_RESERVATIONS_CANCELLED: '/me/reservations/cancelled',
    CALENDAR: (propertyId: string) => `/properties/${propertyId}/calendar`,
  },

  // Visits
  VISITS: {
    SCHEDULE: '/visits',
    DETAIL: (id: string) => `/visits/${id}`,
    CANCEL: (id: string) => `/visits/${id}/cancel`,
    CONFIRM: (id: string) => `/visits/${id}/confirm`,
    COMPLETE: (id: string) => `/visits/${id}/complete`,
    MY_VISITS: '/me/visits',
    UPCOMING: '/me/visits/upcoming',
    PAST: '/me/visits/past',
    PROPERTY_REQUESTS: (propertyId: string) => `/properties/${propertyId}/visits`,
  },

  // Reviews
  REVIEWS: {
    LIST: '/reviews',
    DETAIL: (id: string) => `/reviews/${id}`,
    CREATE: '/reviews',
    UPDATE: (id: string) => `/reviews/${id}`,
    DELETE: (id: string) => `/reviews/${id}`,
    APPROVE: (id: string) => `/reviews/${id}/approve`,
    REJECT: (id: string) => `/reviews/${id}/reject`,
    FLAG: (id: string) => `/reviews/${id}/flag`,
    RESPOND: (id: string) => `/reviews/${id}/respond`,
    PENDING: '/reviews/pending',
    PROPERTY: (propertyId: string) => `/properties/${propertyId}/reviews`,
    PROPERTY_AVERAGE: (propertyId: string) => `/properties/${propertyId}/reviews/average`,
    USER_REVIEWS: (userId: string) => `/users/${userId}/reviews`,
    USER_REVIEWS_RECEIVED: (userId: string) => `/users/${userId}/reviews-received`,
    MY_REVIEWS: '/me/reviews',
  },

  // Messaging
  MESSAGES: {
    CONVERSATIONS: '/conversations',
    CONVERSATION: (id: string) => `/conversations/${id}`,
    MESSAGES: (conversationId: string) => `/conversations/${conversationId}/messages`,
    SEND: (conversationId: string) => `/conversations/${conversationId}/messages`,
    MARK_READ: (messageId: string) => `/messages/${messageId}/read`,
    DELETE_MESSAGE: (messageId: string) => `/messages/${messageId}`,
    ARCHIVE: (conversationId: string) => `/conversations/${conversationId}/archive`,
    UNREAD_COUNT: '/me/messages/unread',
    MY_MESSAGES: '/me/messages',
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    DETAIL: (id: string) => `/notifications/${id}`,
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    DELETE: (id: string) => `/notifications/${id}`,
    UNREAD_COUNT: '/notifications/unread-count',
    UNREAD: '/notifications/unread',
    MY_NOTIFICATIONS: '/me/notifications',
  },

  // Wallet & Payments
  WALLET: {
    MINE: '/wallets/mine',
    BALANCE: '/wallets/balance',
    TOP_UP: '/wallets/top-up',
    WITHDRAW: '/wallets/withdraw',
    TRANSACTIONS: '/me/transactions',
  },

  // Rent Management
  RENT: {
    LEASES: '/leases',
    LEASE_DETAIL: (id: string) => `/leases/${id}`,
    CREATE_LEASE: '/leases',
    TERMINATE_LEASE: (id: string) => `/leases/${id}/terminate`,
    INVOICES: '/rent-invoices',
    INVOICE_DETAIL: (id: string) => `/rent-invoices/${id}`,
    PAY_INVOICE: (id: string) => `/rent-invoices/${id}/pay`,
    PAYMENTS: '/rent-payments',
    LANDLORD_DASHBOARD: '/landlord/dashboard',
    LANDLORD_LEASES: '/me/leases',
    LANDLORD_INVOICES: '/me/rent-invoices',
    LANDLORD_PAYMENTS: '/me/rent-payments',
    LANDLORD_TENANTS: '/landlord/tenants',
    LANDLORD_PROPERTIES: '/me/properties',
    LANDLORD_INCOME_MONTHLY: '/landlord/income/monthly',
    LANDLORD_INCOME_YEARLY: '/landlord/income/yearly',
    TENANT_LEASES: '/me/leases',
    TENANT_INVOICES: '/me/rent-invoices',
    TENANT_INVOICES_UNPAID: '/me/rent-invoices/unpaid',
    TENANT_PAYMENTS: '/me/rent-payments',
    TENANT_PAYMENTS_HISTORY: '/me/rent-payments/history',
  },

  // Contact
  CONTACT: {
    SUBMIT: '/contacts',
    RESPOND: (id: string) => `/contacts/${id}/respond`,
  },

  // User
  USER: {
    PROFILE: '/me/profile',
    UPDATE_PROFILE: '/me/profile',
    UPDATE_PASSWORD: '/me/password',
    TOGGLE_AVAILABILITY: '/me/availability',
  },
} as const
