import { defineStore } from 'pinia'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface ToastNotification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  dismissible?: boolean
  createdAt: Date
}

export type Theme = 'light' | 'dark' | 'system'
export type ErrorPageType = '401' | '403' | '404' | '500' | null

export const useUiStore = defineStore('ui', () => {
  // State
  const sidebarOpen = ref(false)
  const sidebarCollapsed = ref(false)
  const theme = ref<Theme>('light')
  const notifications = ref<ToastNotification[]>([])
  const globalLoading = ref(false)
  const loadingMessage = ref<string | null>(null)
  const breadcrumbs = ref<Array<{ label: string; to?: string }>>([])
  const pageTitle = ref('')
  const errorPage = ref<ErrorPageType>(null)

  // Getters
  const hasNotifications = computed(() => notifications.value.length > 0)
  const notificationCount = computed(() => notifications.value.length)
  const hasErrorPage = computed(() => errorPage.value !== null)
  const isDarkMode = computed(() => {
    if (theme.value === 'system') {
      return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return theme.value === 'dark'
  })

  // Actions
  function toggleSidebar() { sidebarOpen.value = !sidebarOpen.value }
  function openSidebar() { sidebarOpen.value = true }
  function closeSidebar() { sidebarOpen.value = false }

  function toggleSidebarCollapsed() {
    sidebarCollapsed.value = !sidebarCollapsed.value
    localStorage.setItem('futela_sidebar_collapsed', String(sidebarCollapsed.value))
  }

  function setTheme(newTheme: Theme) {
    theme.value = newTheme
    localStorage.setItem('futela_theme', newTheme)
    applyTheme(newTheme)
  }

  function toggleTheme() {
    setTheme(isDarkMode.value ? 'light' : 'dark')
  }

  function applyTheme(themeValue: Theme) {
    if (typeof window === 'undefined') return
    const root = document.documentElement
    if (themeValue === 'dark' || (themeValue === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  function initializeUi() {
    if (typeof window === 'undefined') return

    const storedSidebar = localStorage.getItem('futela_sidebar_collapsed')
    if (storedSidebar !== null) sidebarCollapsed.value = storedSidebar === 'true'

    const storedTheme = localStorage.getItem('futela_theme') as Theme | null
    if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
      theme.value = storedTheme
      applyTheme(storedTheme)
    }
  }

  function addNotification(notification: Omit<ToastNotification, 'id' | 'createdAt'>): string {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const newNotification: ToastNotification = {
      id,
      dismissible: true,
      duration: 5000,
      ...notification,
      createdAt: new Date(),
    }

    notifications.value.push(newNotification)

    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => removeNotification(id), newNotification.duration)
    }

    return id
  }

  function removeNotification(id: string) {
    const index = notifications.value.findIndex((n) => n.id === id)
    if (index !== -1) notifications.value.splice(index, 1)
  }

  function clearNotifications() { notifications.value = [] }
  function showSuccess(title: string, message?: string) { return addNotification({ type: 'success', title, message }) }
  function showError(title: string, message?: string) { return addNotification({ type: 'error', title, message, duration: 8000 }) }
  function showWarning(title: string, message?: string) { return addNotification({ type: 'warning', title, message }) }
  function showInfo(title: string, message?: string) { return addNotification({ type: 'info', title, message }) }

  function showLoading(message?: string) {
    globalLoading.value = true
    loadingMessage.value = message ?? null
  }

  function hideLoading() {
    globalLoading.value = false
    loadingMessage.value = null
  }

  function setBreadcrumbs(items: Array<{ label: string; to?: string }>) { breadcrumbs.value = items }

  function setPageTitle(title: string) {
    pageTitle.value = title
    if (typeof window !== 'undefined') {
      document.title = title ? `${title} | Futela` : 'Futela'
    }
  }

  function showErrorPage(type: ErrorPageType) { errorPage.value = type }
  function clearErrorPage() { errorPage.value = null }

  return {
    sidebarOpen, sidebarCollapsed, theme, notifications, globalLoading, loadingMessage,
    breadcrumbs, pageTitle, errorPage,
    hasNotifications, notificationCount, isDarkMode, hasErrorPage,
    toggleSidebar, openSidebar, closeSidebar, toggleSidebarCollapsed,
    setTheme, toggleTheme, initializeUi,
    addNotification, removeNotification, clearNotifications,
    showSuccess, showError, showWarning, showInfo,
    showLoading, hideLoading, setBreadcrumbs, setPageTitle,
    showErrorPage, clearErrorPage,
  }
})
