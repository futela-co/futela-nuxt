<script setup lang="ts">
import {
  UserCircleIcon,
  ComputerDesktopIcon,
  PowerIcon,
  Cog6ToothIcon,
} from '@heroicons/vue/24/outline'
import {
  mainNavigation,
  moduleNavigation,
} from '../../../config/navigation'
import { useAuthStore } from '../../../application/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const auth = useAuth()
const { t } = useLocale()

// User menu
const showUserMenu = ref(false)

// User computed properties
const user = computed(() => authStore.user)
const userFullName = computed(() => {
  if (user.value) {
    return user.value.fullName || user.value.email
  }
  return 'Utilisateur'
})

const userInitial = computed(() => {
  return userFullName.value.charAt(0).toUpperCase()
})

// Current page info based on route (title and icon)
const currentPageInfo = computed(() => {
  const currentPath = route.path

  // Default for dashboard
  if (currentPath === '/' || currentPath === '/dashboard') {
    const dashboardItem = mainNavigation.find(item => item.href === '/dashboard')
    return {
      title: t('sidebar.dashboard'),
      icon: dashboardItem?.icon || null
    }
  }

  // Search in main navigation
  for (const item of mainNavigation) {
    if (item.href && currentPath.startsWith(item.href)) {
      return {
        title: item.name,
        icon: item.icon || null
      }
    }
  }

  // Search in module navigation
  for (const [, mod] of Object.entries(moduleNavigation)) {
    for (const item of mod.items) {
      if (item.href && currentPath.startsWith(item.href)) {
        return {
          title: item.name,
          icon: item.icon || null
        }
      }
    }
  }

  // Fallback to route meta title or default
  return {
    title: (route.meta?.title as string) || t('sidebar.dashboard'),
    icon: null
  }
})

// Logout
async function logout() {
  auth.logout()
  navigateTo('/auth/login')
}

// Toggle user menu
function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}
</script>

<template>
  <header class="header !border-0 !shadow-none !bg-transparent">
    <div class="header-content">
      <!-- Left side - Current page title with icon -->
      <div class="header-left flex items-center gap-2">
        <component
          :is="currentPageInfo.icon"
          v-if="currentPageInfo.icon"
          class="h-5 w-5 text-gray-900"
        />
        <span class="text-sm font-normal text-gray-900">
          {{ currentPageInfo.title }}
        </span>
      </div>

      <!-- Right side - Notifications & User -->
      <div class="header-right flex items-center gap-1 ml-auto">
        <!-- Language switcher -->
        <BaseLanguageSwitcher variant="icon" size="sm" />

        <!-- Notifications -->
        <AdminNotifications />

        <!-- User menu -->
        <div class="user-menu-container">
          <button
            type="button"
            class="user-menu-btn"
            @click.stop="toggleUserMenu"
          >
            <div class="user-avatar">
              {{ userInitial }}
            </div>
            <div class="user-info">
              <p class="user-name">
                {{ user?.firstName }}
              </p>
            </div>
          </button>
        </div>

        <!-- Profile sidebar -->
        <BaseSidebar
          v-model="showUserMenu"
          title="Mon compte"
          size="sm"
        >
          <!-- User info -->
          <div class="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
            <div class="h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-lg font-bold flex-shrink-0">
              {{ userInitial }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-gray-900 truncate">{{ userFullName }}</p>
              <p class="text-xs text-gray-500 truncate">{{ user?.email }}</p>
            </div>
          </div>

          <!-- Menu items -->
          <nav class="space-y-1 -mx-3">
            <NuxtLink
              to="/portal/profile"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              @click="showUserMenu = false"
            >
              <UserCircleIcon class="h-5 w-5 text-gray-400" />
              {{ t('nav.profile') }}
            </NuxtLink>
            <NuxtLink
              to="/portal/devices"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              @click="showUserMenu = false"
            >
              <ComputerDesktopIcon class="h-5 w-5 text-gray-400" />
              Appareils connectes
            </NuxtLink>
            <NuxtLink
              to="/settings/exchange-rates"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              @click="showUserMenu = false"
            >
              <Cog6ToothIcon class="h-5 w-5 text-gray-400" />
              {{ t('sidebar.settings') }}
            </NuxtLink>
          </nav>

          <template #footer>
            <button
              type="button"
              class="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-rose-600 hover:bg-rose-50 transition-colors"
              @click="logout"
            >
              <PowerIcon class="h-5 w-5" />
              {{ t('nav.logout') }}
            </button>
          </template>
        </BaseSidebar>
      </div>
    </div>
  </header>
</template>
