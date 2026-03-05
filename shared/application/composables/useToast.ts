/**
 * useToast Composable
 * Wrapper around vue-toastification with same API as before
 */
import { useToast as useVueToast } from 'vue-toastification'

export function useToast() {
  const toast = useVueToast()

  const success = (message: string) => {
    toast.success(message)
  }

  const error = (message: string) => {
    toast.error(message, { timeout: 8000 })
  }

  const warning = (message: string) => {
    toast.warning(message)
  }

  const info = (message: string) => {
    toast.info(message)
  }

  const dismissAll = () => {
    toast.clear()
  }

  return {
    success,
    error,
    warning,
    info,
    dismissAll,
  }
}

export default useToast
