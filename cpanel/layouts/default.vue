<script setup lang="ts">
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
} from '@heroicons/vue/24/outline'

const uiStore = useUiStore()
const authStore = useAuthStore()

onMounted(() => {
  uiStore.initializeUi()
})

const sidebarCollapsed = computed(() => uiStore.sidebarCollapsed)
const sidebarOpen = computed(() => uiStore.sidebarOpen)

function toggleSidebar() {
  uiStore.toggleSidebarCollapsed()
}

function toggleMobileSidebar() {
  uiStore.toggleSidebar()
}

function closeMobileSidebar() {
  uiStore.closeSidebar()
}

const showQuickSearch = ref(false)

function openQuickSearch() {
  showQuickSearch.value = true
}

function closeQuickSearch() {
  showQuickSearch.value = false
}

function handleKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault()
    openQuickSearch()
  }
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

const mainContentClass = computed(() => [
  'transition-all duration-300 ease-in-out',
  'min-h-screen flex flex-col',
  sidebarCollapsed.value ? 'lg:ml-16' : 'lg:ml-64',
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
      <main class="flex-1 p-4 lg:p-6">
        <!-- Breadcrumb -->
        <AdminBreadcrumb class="mb-4" />

        <!-- Page Slot -->
        <div class="page-enter">
          <slot />
        </div>
      </main>

      <!-- Footer -->
      <AdminFooter />
    </div>

    <!-- Quick Search Modal -->
    <AdminQuickSearch
      :open="showQuickSearch"
      @close="closeQuickSearch"
    />

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
