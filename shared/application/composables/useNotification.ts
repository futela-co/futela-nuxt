import { useToast } from 'vue-toastification'
import { POSITION } from 'vue-toastification'

export const useNotification = () => {
  const globalOptions = {
    position: POSITION.TOP_CENTER,
    timeout: 5000,
  }

  const createToast = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    if (!import.meta.client) return
    if (type === 'success') {
      localStorage.setItem('success_notification', message)
    } else if (type === 'error') {
      localStorage.setItem('error_notification', message)
    } else if (type === 'info') {
      localStorage.setItem('info_notification', message)
    } else {
      localStorage.setItem('warning_notification', message)
    }
  }

  const readToast = () => {
    if (!import.meta.client) return

    let message = localStorage.getItem('success_notification')
    if (message) {
      useToast().success(message)
      localStorage.removeItem('success_notification')
      return
    }

    message = localStorage.getItem('error_notification')
    if (message) {
      useToast().error(message)
      localStorage.removeItem('error_notification')
      return
    }

    message = localStorage.getItem('info_notification')
    if (message) {
      useToast().info(message)
      localStorage.removeItem('info_notification')
      return
    }

    message = localStorage.getItem('warning_notification')
    if (message) {
      useToast().warning(message)
      localStorage.removeItem('warning_notification')
      return
    }
  }

  const showToast = (type: 'success' | 'error' | 'info' | 'warning', message: string, options: Record<string, any> = {}) => {
    const newOptions = { ...globalOptions, ...options }
    if (type === 'success') {
      useToast().success(message, newOptions)
    } else if (type === 'error') {
      useToast().error(message, newOptions)
    } else if (type === 'info') {
      useToast().info(message, newOptions)
    } else {
      useToast().warning(message, newOptions)
    }
  }

  const clearAllToast = () => {
    useToast().clear()
  }

  return {
    createToast,
    readToast,
    showToast,
    clearAllToast,
  }
}
