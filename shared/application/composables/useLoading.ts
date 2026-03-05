/**
 * Loading state options
 */
export interface LoadingOptions {
  /** Initial loading state */
  initialState?: boolean
  /** Minimum loading time in ms (prevents flickering) */
  minLoadingTime?: number
}

/**
 * Named loading states map
 */
type LoadingStates = Map<string, boolean>

// Global loading states for named loaders
const globalLoadingStates = reactive<LoadingStates>(new Map())

/**
 * Loading state management composable
 * Provides methods for managing loading states with support for named states
 *
 * @example
 * ```ts
 * // Basic usage
 * const { isLoading, startLoading, stopLoading } = useLoading()
 *
 * // With async wrapper
 * const { withLoading } = useLoading()
 * const data = await withLoading(fetchData())
 *
 * // Named loading states
 * const { isLoadingNamed, withLoadingNamed } = useLoading()
 * await withLoadingNamed('users', fetchUsers())
 * const usersLoading = isLoadingNamed('users')
 * ```
 */
export function useLoading(options: LoadingOptions = {}) {
  const { initialState = false, minLoadingTime = 0 } = options

  /**
   * Local loading state
   */
  const isLoading = ref(initialState)

  /**
   * Loading start timestamp for minimum loading time
   */
  let loadingStartTime = 0

  /**
   * Start loading
   */
  function startLoading() {
    loadingStartTime = Date.now()
    isLoading.value = true
  }

  /**
   * Stop loading (respects minimum loading time)
   */
  async function stopLoading() {
    if (minLoadingTime > 0) {
      const elapsed = Date.now() - loadingStartTime
      const remaining = minLoadingTime - elapsed

      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining))
      }
    }

    isLoading.value = false
  }

  /**
   * Wrap an async function with loading state
   */
  async function withLoading<T>(asyncFn: Promise<T> | (() => Promise<T>)): Promise<T> {
    startLoading()

    try {
      const result = await (typeof asyncFn === 'function' ? asyncFn() : asyncFn)
      return result
    } finally {
      await stopLoading()
    }
  }

  /**
   * Check if a named loading state is active
   */
  function isLoadingNamed(name: string): boolean {
    return globalLoadingStates.get(name) ?? false
  }

  /**
   * Get reactive loading state for a named loader
   */
  function getLoadingState(name: string) {
    return computed(() => globalLoadingStates.get(name) ?? false)
  }

  /**
   * Start named loading state
   */
  function startLoadingNamed(name: string) {
    globalLoadingStates.set(name, true)
  }

  /**
   * Stop named loading state
   */
  function stopLoadingNamed(name: string) {
    globalLoadingStates.set(name, false)
  }

  /**
   * Wrap an async function with named loading state
   */
  async function withLoadingNamed<T>(
    name: string,
    asyncFn: Promise<T> | (() => Promise<T>)
  ): Promise<T> {
    startLoadingNamed(name)

    try {
      const result = await (typeof asyncFn === 'function' ? asyncFn() : asyncFn)
      return result
    } finally {
      stopLoadingNamed(name)
    }
  }

  /**
   * Check if any loading state is active
   */
  const hasAnyLoading = computed(() => {
    if (isLoading.value) return true

    for (const [, loading] of globalLoadingStates) {
      if (loading) return true
    }

    return false
  })

  /**
   * Get all active loading state names
   */
  const activeLoadingStates = computed(() => {
    const active: string[] = []

    globalLoadingStates.forEach((loading, name) => {
      if (loading) active.push(name)
    })

    return active
  })

  /**
   * Clear all loading states
   */
  function clearAllLoading() {
    isLoading.value = false
    globalLoadingStates.clear()
  }

  return {
    // Local state
    isLoading: readonly(isLoading),
    startLoading,
    stopLoading,
    withLoading,

    // Named states
    isLoadingNamed,
    getLoadingState,
    startLoadingNamed,
    stopLoadingNamed,
    withLoadingNamed,

    // Global
    hasAnyLoading,
    activeLoadingStates,
    clearAllLoading
  }
}

/**
 * Type alias for useLoading return type
 */
export type LoadingComposable = ReturnType<typeof useLoading>
