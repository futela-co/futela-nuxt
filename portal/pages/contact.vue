<script setup lang="ts">
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'default',
  public: true,
})

const { t } = useLocale()

useHead({
  title: () => t('contact.title'),
})

const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: '',
})

const loading = ref(false)
const sent = ref(false)

async function handleSubmit() {
  if (!form.name || !form.email || !form.message) return
  loading.value = true
  try {
    // TODO: integrate with contactApi.submit()
    await new Promise(resolve => setTimeout(resolve, 1000))
    sent.value = true
  } finally {
    loading.value = false
  }
}

const contactInfo = computed(() => [
  {
    icon: EnvelopeIcon,
    label: t('contact.email'),
    value: 'contact@futela.com',
    description: t('contact.responseTime'),
  },
  {
    icon: PhoneIcon,
    label: t('contact.phone'),
    value: '+243 XXX XXX XXX',
    description: t('contact.phoneHours'),
  },
  {
    icon: MapPinIcon,
    label: t('contact.address'),
    value: 'Kinshasa, RDC',
    description: t('contact.addressDesc'),
  },
])
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-12">
    <!-- Header -->
    <div class="text-center mb-12">
      <div class="flex items-center justify-center w-14 h-14 rounded-full bg-primary-50 mx-auto mb-4">
        <ChatBubbleLeftRightIcon class="w-7 h-7 text-primary-600" />
      </div>
      <h1 class="text-3xl font-bold text-slate-900">{{ t('contact.title') }}</h1>
      <p class="mt-2 text-slate-500 max-w-md mx-auto">{{ t('contact.question') }}</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-10">
      <!-- Left: Contact Info -->
      <div class="lg:col-span-2 space-y-6">
        <div
          v-for="info in contactInfo"
          :key="info.label"
          class="flex items-start gap-4 p-5 bg-white border border-slate-200 rounded-xl"
        >
          <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-50 shrink-0">
            <component :is="info.icon" class="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p class="font-semibold text-slate-900 text-sm">{{ info.label }}</p>
            <p class="text-sm text-slate-700 mt-0.5">{{ info.value }}</p>
            <p class="text-xs text-slate-400 mt-0.5">{{ info.description }}</p>
          </div>
        </div>

        <div class="p-5 bg-slate-50 rounded-xl">
          <p class="text-sm font-medium text-slate-700">{{ t('contact.needHelp') }}</p>
          <p class="text-xs text-slate-500 mt-1">{{ t('contact.helpCenterDesc') }}</p>
          <NuxtLink to="/help" class="inline-block mt-3 text-sm font-medium text-primary-600 hover:text-primary-700">
            {{ t('contact.viewHelpCenter') }} &rarr;
          </NuxtLink>
        </div>
      </div>

      <!-- Right: Form -->
      <div class="lg:col-span-3">
        <div v-if="sent" class="p-10 bg-green-50 border border-green-200 rounded-xl text-center">
          <div class="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto mb-4">
            <EnvelopeIcon class="w-6 h-6 text-green-600" />
          </div>
          <p class="text-green-800 font-semibold text-lg">{{ t('contact.messageSent') }}</p>
          <p class="text-sm text-green-600 mt-2">{{ t('contact.thankYou') }}</p>
        </div>

        <form v-else class="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-5" @submit.prevent="handleSubmit">
          <h2 class="text-lg font-semibold text-slate-900">{{ t('contact.sendUsMessage') }}</h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">{{ t('contact.name') }}</label>
              <input
                v-model="form.name"
                type="text"
                required
                :placeholder="t('contact.namePlaceholder')"
                class="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">{{ t('contact.email') }}</label>
              <input
                v-model="form.email"
                type="email"
                required
                :placeholder="t('contact.emailPlaceholder')"
                class="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">{{ t('contact.subject') }}</label>
            <input
              v-model="form.subject"
              type="text"
              :placeholder="t('contact.subjectPlaceholder')"
              class="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">{{ t('contact.message') }}</label>
            <textarea
              v-model="form.message"
              rows="5"
              required
              :placeholder="t('contact.messagePlaceholder')"
              class="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="btn btn-primary btn-lg w-full sm:w-auto"
          >
            {{ loading ? t('contact.sending') : t('contact.send') }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
