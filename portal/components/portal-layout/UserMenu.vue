<script setup lang="ts">
import { useAuthStore } from '~/application/stores/auth'
import {
  ChartBarIcon,
  HeartIcon,
  CalendarDaysIcon,
  WalletIcon,
  UserCircleIcon,
  BellIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/vue/24/outline'

const emit = defineEmits<{
  close: []
}>()

const authStore = useAuthStore()
const { t } = useLocale()

function navigate(path: string) {
  navigateTo(path)
  emit('close')
}

function handleLogout() {
  authStore.logout()
  emit('close')
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.user-menu-container')) {
    emit('close')
  }
}

onMounted(() => {
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside)
  }, 0)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="user-menu-container absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
    <template v-if="authStore.isAuthenticated">
      <!-- User Info -->
      <div class="px-4 py-3 border-b border-gray-100">
        <p class="text-sm font-medium text-gray-900">{{ authStore.userFullName }}</p>
        <p class="text-xs text-gray-500">{{ authStore.user?.email }}</p>
      </div>

      <!-- Navigation -->
      <div class="py-1">
        <button
          type="button"
          class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          @click="navigate('/dashboard')"
        >
          <ChartBarIcon class="h-5 w-5 text-gray-400" />
          {{ t('sidebar.dashboard') }}
        </button>
        <button
          type="button"
          class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          @click="navigate('/dashboard/favorites')"
        >
          <HeartIcon class="h-5 w-5 text-gray-400" />
          {{ t('nav.favorites') }}
        </button>
        <button
          type="button"
          class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          @click="navigate('/dashboard/reservations')"
        >
          <CalendarDaysIcon class="h-5 w-5 text-gray-400" />
          {{ t('sidebar.reservations') }}
        </button>
        <button
          type="button"
          class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          @click="navigate('/dashboard/wallet')"
        >
          <WalletIcon class="h-5 w-5 text-gray-400" />
          {{ t('sidebar.wallet') }}
        </button>
      </div>

      <div class="border-t border-gray-100 py-1">
        <button
          type="button"
          class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          @click="navigate('/dashboard/profile')"
        >
          <UserCircleIcon class="h-5 w-5 text-gray-400" />
          {{ t('nav.profile') }}
        </button>
        <button
          type="button"
          class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          @click="navigate('/dashboard/notifications')"
        >
          <BellIcon class="h-5 w-5 text-gray-400" />
          {{ t('nav.notifications') }}
        </button>
      </div>

      <div class="border-t border-gray-100 py-1">
        <button
          type="button"
          class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
          @click="handleLogout"
        >
          <ArrowRightStartOnRectangleIcon class="h-5 w-5" />
          {{ t('nav.logout') }}
        </button>
      </div>
    </template>

    <template v-else>
      <!-- Guest Menu -->
      <div class="py-1">
        <button
          type="button"
          class="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
          @click="navigate('/login')"
        >
          {{ t('nav.login') }}
        </button>
        <button
          type="button"
          class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          @click="navigate('/register')"
        >
          {{ t('nav.register') }}
        </button>
      </div>

      <div class="border-t border-gray-100 py-1">
        <button
          type="button"
          class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          @click="navigate('/')"
        >
          {{ t('nav.help') }}
        </button>
      </div>
    </template>
  </div>
</template>
