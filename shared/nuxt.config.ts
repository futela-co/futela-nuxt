export default defineNuxtConfig({
  css: [
    '~/presentation/assets/css/main.css',
    '~/presentation/assets/css/components.css',
    '~/presentation/assets/css/transitions.css',
  ],

  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
  ],

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8006/api',
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'Futela',
      portalUrl: process.env.NUXT_PUBLIC_PORTAL_URL || 'http://localhost:3006',
      cpanelUrl: process.env.NUXT_PUBLIC_CPANEL_URL || 'http://localhost:3007',
    },
  },

  typescript: {
    strict: true,
  },

  components: {
    dirs: [
      { path: '~/presentation/components/base', prefix: 'Base' },
      { path: '~/presentation/components/form', prefix: 'Form' },
      { path: '~/presentation/components/data', prefix: 'Data' },
      { path: '~/presentation/components/layout', prefix: 'Admin' },
    ],
  },

  imports: {
    dirs: [
      'application/composables',
      'application/stores',
      'utils',
    ],
  },

  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
      autoprefixer: {},
    },
  },

  compatibilityDate: '2025-01-01',
})
