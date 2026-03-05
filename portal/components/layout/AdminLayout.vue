<script setup lang="ts">
import { useUiStore } from '~/stores/ui'
import { useAuthStore } from '~/stores/auth'

/**
 * AdminLayout.vue
 * Main admin layout component with header, sidebar, and content area
 * Provides responsive behavior for desktop and mobile viewports
 */

interface Props {
  /** Show the footer */
  showFooter?: boolean
  /** Show breadcrumbs */
  showBreadcrumb?: boolean
  /** Custom content padding class */
  contentClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  showFooter: true,
  showBreadcrumb: true,
  contentClass: 'p-4 lg:p-6',
})

const uiStore = useUiStore()
const authStore = useAuthStore()

// Initialize UI state
onMounted(() => {
  uiStore.initializeUi()
  authStore.initializeAuth()
})

// Sidebar state
const sidebarCollapsed = computed(() => uiStore.sidebarCollapsed)
const sidebarOpen = computed(() => uiStore.sidebarOpen)

// Toggle sidebar collapsed state (desktop)
function toggleSidebar() {
  uiStore.toggleSidebarCollapsed()
}

// Toggle mobile sidebar
function toggleMobileSidebar() {
  uiStore.toggleSidebar()
}

// Close mobile sidebar
function closeMobileSidebar() {
  uiStore.closeSidebar()
}

// Quick search modal state
const showQuickSearch = ref(false)

// Open quick search with keyboard shortcut
function openQuickSearch() {
  showQuickSearch.value = true
}

function closeQuickSearch() {
  showQuickSearch.value = false
}

// Handle Cmd+K / Ctrl+K keyboard shortcut
function handleKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault()
    openQuickSearch()
  }
  // Close mobile sidebar on Escape
  if (event.key === 'Escape' && sidebarOpen.value) {
    closeMobileSidebar()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// Provide state to children
provide('sidebarCollapsed', sidebarCollapsed)
provide('toggleSidebar', toggleSidebar)
provide('openQuickSearch', openQuickSearch)

// Main content margin class based on sidebar state
const mainContentClass = computed(() => [
  'transition-all duration-300 ease-in-out',
  'min-h-screen flex flex-col',
  // Desktop margin
  sidebarCollapsed.value ? 'lg:ml-16' : 'lg:ml-64',
  // Mobile no margin (sidebar is overlay)
  'ml-0',
])
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Mobile Sidebar Overlay -->
    <Transition name="fade">
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-40 bg-black/30 lg:hidden"
        @click="closeMobileSidebar"
      />
    </Transition>

    <!-- Mobile Navigation Drawer -->
    <AdminMobileNav
      :open="sidebarOpen"
      @close="closeMobileSidebar"
    />

    <!-- Desktop Sidebar -->
    <div class="hidden lg:block">
      <AdminSidebar :collapsed="sidebarCollapsed" />
    </div>

    <!-- Main Content Area -->
    <div :class="mainContentClass">
      <!-- Header -->
      <AdminHeader
        @toggle-sidebar="toggleSidebar"
        @toggle-mobile-sidebar="toggleMobileSidebar"
        @open-search="openQuickSearch"
      />

      <!-- Page Content -->
      <main :class="['flex-1', props.contentClass]">
        <!-- Breadcrumb -->
        <AdminBreadcrumb
          v-if="showBreadcrumb"
          class="mb-4"
        />

        <!-- Page Slot -->
        <div class="page-enter">
          <slot />
        </div>
      </main>

      <!-- Footer -->
      <AdminFooter v-if="showFooter" />
    </div>

    <!-- Quick Search Modal -->
    <AdminQuickSearch
      :open="showQuickSearch"
      @close="closeQuickSearch"
    />

    <!-- Toast Container -->
    <div
      id="toast-container"
      class="fixed top-4 right-4 z-50 flex flex-col gap-2"
    />

    <!-- Modal Container -->
    <div id="modal-container" />

    <!-- Global Loading Overlay -->
    <Transition name="fade">
      <div
        v-if="uiStore.globalLoading"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/30"
      >
        <div class="bg-white rounded p-6 shadow-xl flex flex-col items-center gap-4">
          <div class="flex items-center justify-center gap-2">
            <span class="w-3 h-3 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span class="w-3 h-3 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span class="w-3 h-3 bg-primary-500 rounded-full animate-bounce" />
          </div>
          <p
            v-if="uiStore.loadingMessage"
            class="text-sm text-gray-900"
          >
            {{ uiStore.loadingMessage }}
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>
