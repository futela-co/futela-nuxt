<script setup lang="ts">
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon,
  HomeIcon,
  UserIcon,
  Cog6ToothIcon,
} from '@heroicons/vue/24/outline'

const { t } = useLocale()
const uiStore = useUiStore()
const authStore = useAuthStore()
const profileMenuOpen = ref(false)

function toggleProfileMenu() {
  profileMenuOpen.value = !profileMenuOpen.value
}

function closeProfileMenu() {
  profileMenuOpen.value = false
}

function navigateFromMenu(path: string) {
  navigateTo(path)
  closeProfileMenu()
}

function handleLogout() {
  authStore.logout()
  closeProfileMenu()
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.profile-menu-container')) {
    closeProfileMenu()
  }
}

onMounted(() => {
  uiStore.initializeUi()
  document.addEventListener('click', handleClickOutside)
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

const mainContentClass = computed(() => [
  'transition-all duration-300 ease-in-out',
  'min-h-screen flex flex-col',
  sidebarCollapsed.value ? 'lg:ml-16' : 'lg:ml-64',
  'ml-0',
])

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && sidebarOpen.value) {
    closeMobileSidebar()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('click', handleClickOutside)
})
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

    <!-- Mobile Sidebar Drawer -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full"
    >
      <div
        v-if="sidebarOpen"
        class="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
      >
        <PortalLayoutDashboardSidebar
          :collapsed="false"
          @close="closeMobileSidebar"
        />
      </div>
    </Transition>

    <!-- Desktop Sidebar -->
    <div class="hidden lg:block">
      <PortalLayoutDashboardSidebar :collapsed="sidebarCollapsed" />
    </div>

    <!-- Main Content -->
    <div :class="mainContentClass">
      <!-- Header -->
      <header class="sticky top-0 z-30 bg-white border-b border-gray-200 h-11 flex items-center px-4 lg:px-6">
        <!-- Mobile menu button -->
        <button
          type="button"
          class="lg:hidden p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          @click="toggleMobileSidebar"
        >
          <Bars3Icon class="h-5 w-5" />
        </button>

        <!-- Desktop sidebar toggle -->
        <button
          type="button"
          class="hidden lg:flex p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          @click="toggleSidebar"
        >
          <Bars3Icon class="h-4 w-4" />
        </button>

        <div class="flex-1" />

        <!-- Header right actions -->
        <div class="flex items-center gap-2">
          <BaseLanguageSwitcher variant="icon" size="sm" />

          <button
            type="button"
            class="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 relative"
            @click="navigateTo('/dashboard/notifications')"
          >
            <BellIcon class="h-4 w-4" />
          </button>

          <!-- Profile dropdown -->
          <div class="relative profile-menu-container">
            <button
              type="button"
              class="flex items-center gap-1.5 p-1 rounded-md hover:bg-gray-100 transition-colors"
              @click.stop="toggleProfileMenu"
            >
              <UserCircleIcon class="h-6 w-6 text-gray-400" />
              <span class="hidden sm:block text-xs font-medium text-gray-700">
                {{ authStore.userFullName }}
              </span>
            </button>

            <!-- Dropdown menu -->
            <Transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div
                v-if="profileMenuOpen"
                class="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-50"
              >
                <!-- User Info -->
                <div class="px-4 py-2.5 border-b border-gray-100">
                  <p class="text-sm font-medium text-gray-900">{{ authStore.userFullName }}</p>
                  <p class="text-xs text-gray-500">{{ authStore.user?.email }}</p>
                </div>

                <!-- Navigation -->
                <div class="py-1">
                  <button
                    type="button"
                    class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    @click="navigateFromMenu('/')"
                  >
                    <HomeIcon class="h-4 w-4 text-gray-400" />
                    {{ t('sidebar.backToHome') }}
                  </button>
                  <button
                    type="button"
                    class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    @click="navigateFromMenu('/dashboard/profile')"
                  >
                    <UserIcon class="h-4 w-4 text-gray-400" />
                    {{ t('nav.profile') }}
                  </button>
                  <button
                    type="button"
                    class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    @click="navigateFromMenu('/dashboard/notifications')"
                  >
                    <BellIcon class="h-4 w-4 text-gray-400" />
                    {{ t('nav.notifications') }}
                  </button>
                </div>

                <!-- Logout -->
                <div class="border-t border-gray-100 py-1">
                  <button
                    type="button"
                    class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    @click="handleLogout"
                  >
                    <ArrowRightStartOnRectangleIcon class="h-4 w-4" />
                    {{ t('nav.logout') }}
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-4 lg:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
