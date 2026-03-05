/**
 * Confirm options interface
 */
export interface ConfirmDialogOptions {
  /** Dialog title */
  title: string
  /** Dialog message */
  message: string
  /** Confirm button text */
  confirmText?: string
  /** Cancel button text */
  cancelText?: string
  /** Button variant for styling */
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning'
  /** Icon to display */
  icon?: string
}

/**
 * Confirm dialog state interface
 */
interface ConfirmState {
  isOpen: boolean
  options: ConfirmDialogOptions | null
  resolve: ((value: boolean) => void) | null
}

// Global confirm state
const confirmState = reactive<ConfirmState>({
  isOpen: false,
  options: null,
  resolve: null
})

/**
 * Confirmation dialog composable
 * Provides a global confirm dialog with Promise-based API
 *
 * @example
 * ```ts
 * const { confirm } = useConfirm()
 *
 * const confirmed = await confirm({
 *   title: 'Delete Item',
 *   message: 'Are you sure you want to delete this item?',
 *   confirmText: 'Delete',
 *   variant: 'danger'
 * })
 *
 * if (confirmed) {
 *   // User clicked confirm
 * }
 * ```
 */
export function useConfirm() {
  /**
   * Check if confirm dialog is open
   */
  const isOpen = computed(() => confirmState.isOpen)

  /**
   * Get current confirm options
   */
  const options = computed(() => confirmState.options)

  /**
   * Show confirm dialog and return Promise<boolean>
   */
  function confirm(dialogOptions: ConfirmDialogOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      confirmState.options = {
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        variant: 'primary',
        ...dialogOptions
      }
      confirmState.resolve = resolve
      confirmState.isOpen = true
    })
  }

  /**
   * Shorthand for danger confirmation (delete, remove, etc.)
   */
  function confirmDanger(title: string, message: string): Promise<boolean> {
    return confirm({
      title,
      message,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    })
  }

  /**
   * Shorthand for warning confirmation
   */
  function confirmWarning(title: string, message: string): Promise<boolean> {
    return confirm({
      title,
      message,
      confirmText: 'Continue',
      cancelText: 'Cancel',
      variant: 'warning'
    })
  }

  /**
   * Handle user confirmation (called by confirm dialog component)
   */
  function handleConfirm() {
    if (confirmState.resolve) {
      confirmState.resolve(true)
    }
    closeDialog()
  }

  /**
   * Handle user cancellation (called by confirm dialog component)
   */
  function handleCancel() {
    if (confirmState.resolve) {
      confirmState.resolve(false)
    }
    closeDialog()
  }

  /**
   * Close the dialog and reset state
   */
  function closeDialog() {
    confirmState.isOpen = false
    confirmState.options = null
    confirmState.resolve = null
  }

  return {
    // State
    isOpen,
    options,

    // Methods
    confirm,
    confirmDanger,
    confirmWarning,
    handleConfirm,
    handleCancel,
    closeDialog
  }
}

/**
 * Type alias for useConfirm return type
 */
export type ConfirmComposable = ReturnType<typeof useConfirm>
