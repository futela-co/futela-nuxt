<script setup lang="ts">
/**
 * SidebarNav.vue
 * Shared navigation component used by both AdminSidebar and AdminMobileNav
 */
import {
  ArrowUturnLeftIcon,
  HomeIcon,
} from '@heroicons/vue/24/outline'
import {
  mainNavigation,
  moduleNavigation,
  getModuleFromPath,
  type NavItem,
} from '~/config/navigation'
import { useAuthStore } from '~/stores/auth'

interface Props {
  /** Whether the sidebar is collapsed (desktop only) */
  collapsed?: boolean
  /** Callback when navigation item is clicked (for mobile to close drawer) */
  onNavigate?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
  onNavigate: undefined,
})

const { t } = useLocale()
const route = useRoute()
const authStore = useAuthStore()

// Map navigation item hrefs to i18n sidebar keys
const navTranslationMap: Record<string, string> = {
  // User dashboard
  '/dashboard': 'sidebar.dashboard',
  '/dashboard/favorites': 'sidebar.favorites',
  '/dashboard/reservations': 'sidebar.reservations',
  '/dashboard/visits': 'sidebar.visitsAndReviews',
  '/dashboard/wallet': 'sidebar.transactions',
  '/dashboard/notifications': 'sidebar.notifications',
  '/dashboard/profile': 'sidebar.profile',
  // Landlord dashboard
  '/dashboard/landlord': 'sidebar.dashboard',
  '/dashboard/landlord/properties': 'sidebar.properties',
  '/dashboard/landlord/leases': 'sidebar.leases',
  '/dashboard/landlord/invoices': 'sidebar.rentInvoices',
  '/dashboard/landlord/payments': 'sidebar.rentPayments',
  '/dashboard/landlord/tenants': 'sidebar.tenants',
  // Admin / CPanel
  '/': 'sidebar.overview',
  '/properties': 'sidebar.properties',
  '/users': 'sidebar.users',
  '/categories': 'sidebar.categories',
  '/geography': 'sidebar.geography',
  '/reservations': 'sidebar.reservations',
  '/visits': 'sidebar.visits',
  '/leases': 'sidebar.leases',
  '/invoices': 'sidebar.rentInvoices',
  '/payments': 'sidebar.rentPayments',
  '/reviews': 'sidebar.reviews',
  '/messages': 'sidebar.messages',
  '/notifications': 'sidebar.notifications',
  '/wallets': 'sidebar.wallets',
  '/transactions': 'sidebar.transactions',
  '/settings': 'sidebar.settings',
}

// Module title translation map
const moduleTitleMap: Record<string, string> = {
  'Administration': 'sidebar.administration',
  'Réservations': 'sidebar.reservations',
  'Location': 'sidebar.rental',
  'Avis': 'sidebar.reviews',
  'Communication': 'sidebar.communication',
  'Finance': 'sidebar.finance',
  'Configuration': 'sidebar.configuration',
  // Dashboard module titles
  'Tableau de bord': 'sidebar.dashboard',
  'Bailleur': 'sidebar.landlord',
}

// Translate a nav item name using href lookup, fallback to raw name
function translateNavItem(item: NavItem): string {
  const key = navTranslationMap[item.href]
  return key ? t(key) : item.name
}

// Translate module title
function translateModuleTitle(title: string): string {
  const key = moduleTitleMap[title]
  return key ? t(key) : title
}

// Check if path is active
function isActive(href: string): boolean {
  const currentPath = route.path

  // Dashboard special case
  if (href === '/dashboard') {
    return currentPath === '/dashboard' || currentPath === '/'
  }

  // Module paths: check exact match or if path starts with href followed by /
  return currentPath === href || currentPath.startsWith(href + '/')
}

// Detect current module from route path
const currentModule = computed(() => getModuleFromPath(route.path))

// Check if we're in a module (not on dashboard)
const isInModule = computed(() => !!currentModule.value)

// Get current module navigation config
const currentModuleNav = computed(() => {
  if (!currentModule.value) return null
  if (currentModule.value === 'admin' && moduleNavigation['main']) {
    return moduleNavigation['main']
  }
  if (moduleNavigation[currentModule.value]) {
    return moduleNavigation[currentModule.value]
  }
  return null
})

// Filter navigation items by user roles
function canAccessNavItem(item: NavItem): boolean {
  if (!item.roles || item.roles.length === 0) return true
  const userRoles = authStore.user?.roles || []
  return item.roles.some(role => userRoles.includes(role))
}

// Filter main navigation by user roles
const filteredMainNavigation = computed(() => {
  return mainNavigation.filter(canAccessNavItem)
})

// Filter module items by user roles
const filteredModuleItems = computed(() => {
  if (!currentModuleNav.value) return []
  return currentModuleNav.value.items.filter(canAccessNavItem)
})

// Handle navigation click
function handleClick() {
  if (props.onNavigate) {
    props.onNavigate()
  }
}

// Header info for parent components
const headerTitle = computed(() => {
  if (currentModuleNav.value) return currentModuleNav.value.title
  return 'Futela'
})

const HeaderIcon = computed(() => {
  if (currentModuleNav.value) return currentModuleNav.value.icon
  return HomeIcon
})

defineExpose({
  headerTitle,
  HeaderIcon,
})
</script>

<template>
  <nav class="sidebar-content">
    <!-- Main mode: show all modules -->
    <template v-if="!isInModule">
      <div class="sidebar-section">
        <ul class="sidebar-nav">
          <li
            v-for="item in filteredMainNavigation"
            :key="item.name"
          >
            <NuxtLink
              :to="item.href"
              class="sidebar-item"
              :class="{ 'sidebar-item-active': isActive(item.href) }"
              @click="handleClick"
            >
              <component
                :is="item.icon"
                class="sidebar-item-icon"
              />
              <Transition name="fade">
                <span
                  v-if="!collapsed"
                  class="sidebar-item-label"
                >
                  {{ translateNavItem(item) }}
                </span>
              </Transition>
              <Transition name="fade">
                <span
                  v-if="!collapsed && item.badge"
                  class="sidebar-item-badge"
                >
                  {{ item.badge }}
                </span>
              </Transition>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </template>

    <!-- Module mode: show module items -->
    <template v-else>
      <div class="sidebar-section">
        <Transition name="fade">
          <p
            v-if="!collapsed"
            class="sidebar-section-title"
          >
            {{ currentModuleNav?.title ? translateModuleTitle(currentModuleNav.title) : '' }}
          </p>
        </Transition>
        <ul class="sidebar-nav">
          <li
            v-for="item in filteredModuleItems"
            :key="item.href"
          >
            <NuxtLink
              :to="item.href"
              class="sidebar-item"
              :class="{ 'sidebar-item-active': isActive(item.href) }"
              @click="handleClick"
            >
              <component
                :is="item.icon"
                v-if="item.icon"
                class="sidebar-item-icon"
              />
              <Transition name="fade">
                <span
                  v-if="!collapsed"
                  class="sidebar-item-label"
                >
                  {{ translateNavItem(item) }}
                </span>
              </Transition>
            </NuxtLink>
          </li>
        </ul>
      </div>

      <!-- Return button -->
      <div class="sidebar-section">
        <ul class="sidebar-nav">
          <li>
            <NuxtLink
              to="/dashboard"
              class="sidebar-item sidebar-item-return"
              @click="handleClick"
            >
              <ArrowUturnLeftIcon class="sidebar-item-icon" />
              <Transition name="fade">
                <span
                  v-if="!collapsed"
                  class="sidebar-item-label"
                >
                  {{ t('sidebar.backToHome') }}
                </span>
              </Transition>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </template>
  </nav>
</template>
