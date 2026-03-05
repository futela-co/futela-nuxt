export default defineNuxtConfig({
  ssr: false,

  devServer: { port: 3007 },

  css: [
    '~/assets/css/main.css',
    '~/assets/css/components.css',
    '~/assets/css/transitions.css',
  ],

  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
  ],

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8006/api',
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'Futela Admin',
      portalUrl: process.env.NUXT_PUBLIC_PORTAL_URL || 'http://localhost:3006',
      cpanelUrl: process.env.NUXT_PUBLIC_CPANEL_URL || 'http://localhost:3007',
    },
  },

  typescript: {
    strict: true,
  },

  components: {
    dirs: [
      { path: '~/components/base', prefix: 'Base' },
      { path: '~/components/form', prefix: 'Form' },
      { path: '~/components/data', prefix: 'Data' },
      { path: '~/components/layout', prefix: 'Admin' },
      '~/components',
    ],
  },

  imports: {
    dirs: [
      'composables',
      'stores',
    ],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      title: 'Futela Admin',
      titleTemplate: '%s | Futela Admin',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
        { name: 'theme-color', content: '#2563eb' },
      ],
    },
    pageTransition: { name: 'page' },
  },

  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
      autoprefixer: {},
    },
  },

  compatibilityDate: '2025-01-01',
})
