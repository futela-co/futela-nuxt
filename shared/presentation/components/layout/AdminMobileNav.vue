<script setup lang="ts">
/**
 * AdminMobileNav.vue
 * Mobile navigation drawer component
 * Uses the same SidebarNav component as AdminSidebar
 */
import {
  XMarkIcon,
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon,
  Cog6ToothIcon,
  HomeIcon,
} from '@heroicons/vue/24/outline'
import {
  moduleNavigation,
  getModuleFromPath,
} from '~/config/navigation'
import { useAuthStore } from '~/application/stores/auth'

interface Props {
  /** Whether the drawer is open */
  open: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const route = useRoute()
const authStore = useAuthStore()
const auth = useAuth()
const { t } = useLocale()

// Detect current module from route path
const currentModule = computed(() => getModuleFromPath(route.path))

// Get current module navigation config
const currentModuleNav = computed(() => {
  if (currentModule.value && moduleNavigation[currentModule.value]) {
    return moduleNavigation[currentModule.value]
  }
  return null
})

// Header title - shows module title when in module, "Futela" otherwise
const headerTitle = computed(() => {
  if (currentModuleNav.value) {
    return currentModuleNav.value.title
  }
  return 'Futela'
})

// Header icon - shows module icon when in module, HomeIcon otherwise
const HeaderIcon = computed(() => {
  if (currentModuleNav.value) {
    return currentModuleNav.value.icon
  }
  return HomeIcon
})

// Navigate and close drawer
function handleNavigation() {
  emit('close')
}

// Handle logout
function handleLogout() {
  emit('close')
  auth.logout()
}

// User info
const user = computed(() => authStore.user)
</script>

<template>
  <Transition name="slide-left">
    <aside
      v-if="open"
      class="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl flex flex-col lg:hidden"
    >
      <!-- Header -->
      <div class="sidebar-header">
        <!-- Logo -->
        <NuxtLink
          to="/dashboard"
          class="sidebar-brand"
          @click="handleNavigation"
        >
          <div class="sidebar-logo">
            <component
              :is="HeaderIcon"
              class="sidebar-logo-icon"
            />
          </div>
          <span class="sidebar-title">
            {{ headerTitle }}
          </span>
        </NuxtLink>

        <!-- Close button -->
        <button
          type="button"
          class="sidebar-toggle-btn"
          @click="emit('close')"
        >
          <XMarkIcon class="sidebar-toggle-icon" />
        </button>
      </div>

      <!-- Navigation - Using shared component -->
      <AdminSidebarNav
        :collapsed="false"
        :on-navigate="handleNavigation"
      />

      <!-- User Section -->
      <div class="border-t border-gray-200 p-4 mt-auto">
        <!-- User Info -->
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
            <UserCircleIcon class="w-6 h-6 text-primary-600" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">
              {{ user?.firstName }} {{ user?.lastName }}
            </p>
            <p class="text-xs text-gray-900 truncate">
              {{ user?.email }}
            </p>
          </div>
        </div>

        <!-- Language Switcher -->
        <div class="mb-3">
          <BaseLanguageSwitcher variant="full" size="sm" />
        </div>

        <!-- User Actions -->
        <div class="flex gap-2">
          <NuxtLink
            to="/profile"
            class="flex-1 btn btn-secondary btn-lg gap-2"
            @click="handleNavigation"
          >
            <Cog6ToothIcon class="w-4 h-4" />
            {{ t('nav.profile') }}
          </NuxtLink>
          <button
            type="button"
            class="flex-1 btn btn-outline-danger btn-lg gap-2"
            @click="handleLogout"
          >
            <ArrowRightStartOnRectangleIcon class="w-4 h-4" />
            {{ t('nav.logout') }}
          </button>
        </div>
      </div>

      <!-- Version -->
      <div class="px-4 py-2 border-t border-gray-100">
        <p class="text-xs text-gray-400 text-center">
          Version 1.0.0
        </p>
      </div>
    </aside>
  </Transition>
</template>
