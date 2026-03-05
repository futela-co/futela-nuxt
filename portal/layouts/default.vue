<script setup lang="ts">
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const authStore = useAuthStore()

const isHomePage = computed(() => route.path === '/')

const assistancePages = ['/help', '/contact', '/terms', '/privacy', '/legal']
const showCategoryBar = computed(() => !isHomePage.value && !assistancePages.includes(route.path))
const isAssistancePage = computed(() => assistancePages.includes(route.path))
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Sticky Header -->
    <PortalLayoutPublicHeader />

    <!-- Category Bar (hidden on home page and assistance pages) -->
    <PortalLayoutCategoryBar v-if="showCategoryBar" />

    <!-- Main Content -->
    <main
      class="flex-1 w-full"
      :class="isHomePage || isAssistancePage ? '' : 'max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 py-6'"
    >
      <slot />
    </main>

    <!-- Footer -->
    <PortalLayoutPublicFooter />

    <!-- Mobile Bottom Navigation -->
    <PortalLayoutMobileBottomNav />
  </div>
</template>
