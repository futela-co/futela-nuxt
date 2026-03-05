/**
 * Composable pour le formatage des dates
 * Format: "17 janv 25 17h:22"
 */

/**
 * Format une date avec l'heure au format francais court
 * Ex: "17 janv 25 17h:22"
 */
function _formatDateTime(dateStr: Date | string | null | undefined): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'

  const day = date.getDate().toString().padStart(2, '0')
  const month = date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')
  const year = date.getFullYear().toString().slice(-2)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  return `${day} ${month} ${year} ${hours}h:${minutes}`
}

/**
 * Format une date sans l'heure au format francais court
 * Ex: "17 janv 25"
 */
function _formatDateShort(dateStr: Date | string | null | undefined): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'

  const day = date.getDate().toString().padStart(2, '0')
  const month = date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')
  const year = date.getFullYear().toString().slice(-2)

  return `${day} ${month} ${year}`
}

/**
 * Format une date au format complet francais
 * Ex: "17/01/2025"
 */
function _formatDateFull(dateStr: Date | string | null | undefined): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'

  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

/**
 * Composable useFormatDate
 * Usage: const { formatDate, formatDateTime, formatDateShort } = useFormatDate()
 */
export function useFormatDate() {
  return {
    formatDate: _formatDateTime,
    formatDateTime: _formatDateTime,
    formatDateShort: _formatDateShort,
    formatDateFull: _formatDateFull
  }
}

// Export par defaut pour compatibilite
export default useFormatDate
