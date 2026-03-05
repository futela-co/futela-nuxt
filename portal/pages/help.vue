<script setup lang="ts">
import {
  QuestionMarkCircleIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  CalendarDaysIcon,
  UserIcon,
  CreditCardIcon,
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'default',
  public: true,
})

const { t } = useLocale()

useHead({
  title: () => t('help.title'),
})

const categories = computed(() => [
  {
    icon: HomeIcon,
    title: t('help.publishProperty'),
    description: t('help.publishPropertyDesc'),
  },
  {
    icon: MagnifyingGlassIcon,
    title: t('help.searchProperty'),
    description: t('help.searchPropertyDesc'),
  },
  {
    icon: CalendarDaysIcon,
    title: t('help.reservations'),
    description: t('help.reservationsDesc'),
  },
  {
    icon: HeartIcon,
    title: t('help.favorites'),
    description: t('help.favoritesDesc'),
  },
  {
    icon: UserIcon,
    title: t('help.account'),
    description: t('help.accountDesc'),
  },
  {
    icon: CreditCardIcon,
    title: t('help.payments'),
    description: t('help.paymentsDesc'),
  },
])
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-12">
    <div class="text-center mb-10">
      <div class="flex items-center justify-center w-14 h-14 rounded-full bg-primary-50 mx-auto mb-4">
        <QuestionMarkCircleIcon class="w-7 h-7 text-primary-600" />
      </div>
      <h1 class="text-3xl font-bold text-slate-900">{{ t('help.title') }}</h1>
      <p class="mt-2 text-slate-500">{{ t('help.subtitle') }}</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="cat in categories"
        :key="cat.title"
        class="p-6 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
      >
        <component :is="cat.icon" class="w-6 h-6 text-primary-600 mb-3" />
        <h3 class="font-semibold text-slate-900 mb-1">{{ cat.title }}</h3>
        <p class="text-sm text-slate-500">{{ cat.description }}</p>
      </div>
    </div>

    <div class="mt-12 text-center p-8 bg-slate-50 rounded-lg">
      <p class="text-slate-700 font-medium">{{ t('help.noAnswer') }}</p>
      <p class="text-sm text-slate-500 mt-1">{{ t('help.teamAvailable') }}</p>
      <NuxtLink to="/contact" class="btn btn-primary btn-lg mt-4">
        {{ t('help.contactUs') }}
      </NuxtLink>
    </div>
  </div>
</template>
