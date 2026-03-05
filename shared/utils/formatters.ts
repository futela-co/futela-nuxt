/**
 * Format a price with currency (USD by default)
 */
export function formatPrice(amount: number | null | undefined, currency = 'USD'): string {
  if (amount == null) return '-'
  return new Intl.NumberFormat('fr-CD', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format a date string to localized format
 */
export function formatDate(date: string | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('fr-FR', options ?? { day: '2-digit', month: 'short', year: 'numeric' })
}

/**
 * Format a date to relative time (e.g., "il y a 2 heures")
 */
export function formatRelativeDate(date: string | null | undefined): string {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'

  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return "à l'instant"
  if (minutes < 60) return `il y a ${minutes} min`
  if (hours < 24) return `il y a ${hours}h`
  if (days < 7) return `il y a ${days}j`
  return formatDate(date)
}

/**
 * Format a datetime string
 */
export function formatDateTimeFormatted(date: string | null | undefined): string {
  return formatDate(date, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format a number with thousands separators
 */
export function formatNumber(n: number | null | undefined): string {
  if (n == null) return '0'
  return new Intl.NumberFormat('fr-FR').format(n)
}

/**
 * Truncate text to a maximum length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Get initials from a full name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/**
 * Format phone number
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '-'
  return phone.replace(/(\+\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
}

/**
 * Format a number as FC (Franc Congolais) string
 */
export function formatFC(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(Math.round(amount)) + ' FC'
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
