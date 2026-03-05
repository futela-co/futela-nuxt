<script setup lang="ts">
import {
  MagnifyingGlassIcon,
  Bars3Icon,
  UserCircleIcon,
} from '@heroicons/vue/24/outline'
// UserMenu and SearchOverlay auto-imported by Nuxt

const { t } = useLocale()
const showUserMenu = ref(false)
const showSearch = ref(false)

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

function closeUserMenu() {
  showUserMenu.value = false
}
</script>

<template>
  <header class="sticky top-0 z-40 bg-white border-b border-gray-200">
    <div class="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20">
      <div class="flex items-center justify-between h-11">
        <!-- Logo -->
        <NuxtLink
          to="/"
          class="flex-shrink-0"
        >
          <span class="text-base font-bold text-primary-600 tracking-tight">FUTELA</span>
        </NuxtLink>

        <!-- Desktop Search Bar -->
        <div class="hidden md:flex flex-1 max-w-lg mx-8">
          <div
            class="flex items-center w-full border border-gray-300 rounded-full px-4 py-2 hover:shadow-md transition-shadow cursor-pointer"
            @click="showSearch = true"
          >
            <MagnifyingGlassIcon class="h-4 w-4 text-gray-400 mr-3" />
            <span class="text-sm text-gray-500">{{ t('search.placeholder') }}</span>
          </div>
        </div>

        <!-- Right Actions -->
        <div class="flex items-center gap-3">
          <!-- Mobile Search Button -->
          <button
            type="button"
            class="md:hidden p-2 rounded-full text-gray-600 hover:bg-gray-100"
            @click="showSearch = true"
          >
            <MagnifyingGlassIcon class="h-5 w-5" />
          </button>

          <!-- Language Switcher -->
          <BaseLanguageSwitcher variant="icon" size="sm" />

          <!-- User Menu Button -->
          <div class="relative">
            <button
              type="button"
              class="flex items-center gap-2 border border-gray-300 rounded-full p-1.5 pl-3 hover:shadow-md transition-shadow"
              @click="toggleUserMenu"
            >
              <Bars3Icon class="h-4 w-4 text-gray-600" />
              <UserCircleIcon class="h-7 w-7 text-gray-500" />
            </button>

            <!-- User Menu Dropdown -->
            <PortalLayoutUserMenu
              v-if="showUserMenu"
              @close="closeUserMenu"
            />
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Search Overlay -->
  <SearchOverlay
    v-if="showSearch"
    @close="showSearch = false"
  />
</template>
