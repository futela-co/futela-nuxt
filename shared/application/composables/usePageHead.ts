/**
 * usePageHead - Thin wrapper around Nuxt's built-in useHead
 * Provides Futela-specific defaults for page title and meta description.
 *
 * Since Nuxt has its own useHead(), this composable is named usePageHead
 * to avoid conflicts and provide a simplified API for common page-level usage.
 *
 * @example
 * ```ts
 * usePageHead({ title: 'Dashboard', description: 'Your Futela dashboard' })
 * ```
 */
export function usePageHead(options: { title?: string; description?: string }) {
  useHead({
    title: options.title,
    meta: options.description ? [{ name: 'description', content: options.description }] : [],
  })
}
