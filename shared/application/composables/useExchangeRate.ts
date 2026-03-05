/**
 * Composable for fetching and caching the live USD → CDF exchange rate.
 *
 * Uses the open.er-api.com free API (no key required).
 * The rate is fetched once and cached globally for 30 minutes.
 */

const rate = ref<number | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const lastFetchedAt = ref<number>(0)

const CACHE_DURATION_MS = 30 * 60 * 1000 // 30 minutes
const FALLBACK_RATE = 2800 // Approximate USD→CDF fallback rate
const API_URL = 'https://open.er-api.com/v6/latest/USD'

async function fetchRate() {
  const now = Date.now()

  // Use cache if still valid
  if (rate.value !== null && now - lastFetchedAt.value < CACHE_DURATION_MS) {
    return
  }

  loading.value = true
  error.value = null

  try {
    const response = await fetch(API_URL)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const data = await response.json()
    if (data.result === 'success' && data.rates?.CDF) {
      rate.value = data.rates.CDF
      lastFetchedAt.value = now
    } else {
      throw new Error('Invalid API response')
    }
  } catch (e: any) {
    console.warn('[exchange-rate] Failed to fetch rate:', e.message)
    error.value = e.message
    // Use fallback rate if we never fetched successfully
    if (rate.value === null) {
      rate.value = FALLBACK_RATE
    }
  } finally {
    loading.value = false
  }
}

export function useExchangeRate() {
  // Auto-fetch on first use (client-side only)
  if (import.meta.client && rate.value === null && !loading.value) {
    fetchRate()
  }

  /**
   * Convert USD amount to CDF
   */
  function convertToFC(usdAmount: number): number | null {
    if (rate.value === null) return null
    return Math.round(usdAmount * rate.value)
  }

  /**
   * Format a USD amount as FC string (e.g., "7 000 000 FC")
   */
  function formatFC(usdAmount: number): string {
    const fc = convertToFC(usdAmount)
    if (fc === null) return ''
    return new Intl.NumberFormat('fr-FR').format(fc) + ' FC'
  }

  /**
   * Get the current exchange rate value
   */
  const currentRate = computed(() => rate.value)

  /**
   * Whether the rate has been loaded
   */
  const isReady = computed(() => rate.value !== null)

  return {
    rate: currentRate,
    loading: readonly(loading),
    error: readonly(error),
    isReady,
    convertToFC,
    formatFC,
    fetchRate,
  }
}
