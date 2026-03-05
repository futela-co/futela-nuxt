<script setup lang="ts">
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'

const { t } = useLocale()
const currentYear = new Date().getFullYear()
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Language Switcher -->
    <div class="absolute top-4 right-4 z-10">
      <BaseLanguageSwitcher variant="full" size="sm" />
    </div>

    <!-- Content -->
    <div class="flex-1 flex items-center justify-center px-4 py-8">
      <div class="w-full max-w-[520px]">
        <!-- Logo -->
        <div class="text-center mb-8">
          <NuxtLink
            to="/"
            class="inline-block"
          >
            <span class="text-2xl font-bold text-primary-600 tracking-tight">FUTELA</span>
          </NuxtLink>
        </div>

        <!-- Auth Card -->
        <div class="bg-white rounded-xl shadow-lg p-8 sm:p-10">
          <slot />
        </div>

        <!-- Back to home -->
        <div class="mt-6 text-center">
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors"
          >
            <ArrowLeftIcon class="h-4 w-4" />
            {{ t('auth.backToHome') }}
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="px-4 py-4 flex items-center justify-center text-xs text-slate-400 border-t border-slate-200 bg-white">
      <span>&copy; {{ currentYear }} Futela. {{ t('footer.rights') }}</span>
    </div>
  </div>
</template>
