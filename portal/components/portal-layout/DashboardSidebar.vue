<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { userDashboardNav, landlordDashboardNav } from '~/config/navigation'
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'

interface Props {
  collapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
})

const emit = defineEmits<{
  close: []
}>()

const route = useRoute()
const authStore = useAuthStore()

const isLandlordSection = computed(() => route.path.startsWith('/dashboard/landlord'))

const navItems = computed(() => {
  return isLandlordSection.value ? landlordDashboardNav : userDashboardNav
})

const sidebarTitle = computed(() => {
  return isLandlordSection.value ? 'Proprietaire' : 'Mon espace'
})

function isActive(href: string): boolean {
  if (href === '/dashboard' || href === '/dashboard/landlord') {
    return route.path === href
  }
  return route.path.startsWith(href)
}

function navigate(href: string) {
  navigateTo(href)
  emit('close')
}
</script>

<template>
  <aside
    class="sidebar bg-white border-r border-gray-200 h-screen flex flex-col"
    :class="collapsed ? 'sidebar-collapsed w-16' : 'sidebar-expanded w-64'"
  >
    <!-- Header -->
    <div class="flex items-center h-11 px-4 border-b border-gray-200">
      <template v-if="!collapsed">
        <span class="text-sm font-bold text-primary-600">FUTELA</span>
        <span class="ml-1.5 text-xs text-gray-400">{{ sidebarTitle }}</span>
        <button
          type="button"
          class="ml-auto lg:hidden p-1 rounded text-gray-400 hover:text-gray-600"
          @click="emit('close')"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </template>
      <template v-else>
        <span class="text-lg font-bold text-primary-600 mx-auto">F</span>
      </template>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-4 px-2">
      <ul class="space-y-1">
        <li
          v-for="item in navItems"
          :key="item.href"
        >
          <button
            type="button"
            class="sidebar-item w-full flex items-center gap-3 rounded-lg transition-colors"
            :class="[
              collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
              isActive(item.href)
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            ]"
            :title="collapsed ? item.name : undefined"
            @click="navigate(item.href)"
          >
            <component
              :is="item.icon"
              class="h-5 w-5 flex-shrink-0"
              :class="isActive(item.href) ? 'text-white' : 'text-gray-400'"
            />
            <span
              v-if="!collapsed"
              class="text-sm font-medium"
            >
              {{ item.name }}
            </span>
            <span
              v-if="!collapsed && item.badge"
              class="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
              :class="isActive(item.href) ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-700'"
            >
              {{ item.badge }}
            </span>
          </button>
        </li>
      </ul>
    </nav>

    <!-- Switch Section -->
    <div
      v-if="!collapsed"
      class="p-4 border-t border-gray-200"
    >
      <button
        v-if="(authStore.isLandlord || authStore.isAdmin) && !isLandlordSection"
        type="button"
        class="w-full flex items-center justify-between text-sm text-primary-600 hover:text-primary-700 font-medium py-2.5 px-3 rounded-lg hover:bg-primary-50 transition-colors"
        @click="navigate('/dashboard/landlord')"
      >
        <span>Espace proprietaire</span>
        <ChevronRightIcon class="h-4 w-4" />
      </button>
      <button
        v-else-if="isLandlordSection"
        type="button"
        class="w-full flex items-center justify-between text-sm text-primary-600 hover:text-primary-700 font-medium py-2.5 px-3 rounded-lg hover:bg-primary-50 transition-colors"
        @click="navigate('/dashboard')"
      >
        <span>Mon espace</span>
        <ChevronLeftIcon class="h-4 w-4" />
      </button>
    </div>
  </aside>
</template>
