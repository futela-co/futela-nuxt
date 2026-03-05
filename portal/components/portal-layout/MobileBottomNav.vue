<script setup lang="ts">
import {
  HomeIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  UserCircleIcon,
  Bars3Icon,
} from '@heroicons/vue/24/outline'

const route = useRoute()
const { t } = useLocale()

interface NavItem {
  name: string
  icon: any
  path: string
}

const navItems = computed<NavItem[]>(() => [
  { name: t('nav.home'), icon: HomeIcon, path: '/' },
  { name: t('nav.search'), icon: MagnifyingGlassIcon, path: '/search' },
  { name: t('nav.favorites'), icon: HeartIcon, path: '/dashboard/favorites' },
  { name: t('nav.profile'), icon: UserCircleIcon, path: '/dashboard/profile' },
])

function isActive(path: string): boolean {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

function navigate(path: string) {
  navigateTo(path)
}
</script>

<template>
  <nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 pb-safe">
    <div class="flex items-center justify-around h-14">
      <button
        v-for="item in navItems"
        :key="item.path"
        type="button"
        class="flex flex-col items-center justify-center flex-1 py-1 transition-colors"
        :class="isActive(item.path) ? 'text-primary-600' : 'text-gray-500'"
        @click="navigate(item.path)"
      >
        <component
          :is="item.icon"
          class="h-5 w-5"
        />
        <span class="text-[10px] mt-0.5">{{ item.name }}</span>
      </button>
    </div>
  </nav>
</template>
