import { resolve } from 'path'

const sharedDir = resolve(__dirname)

export default defineNuxtConfig({
  css: [
    resolve(sharedDir, 'presentation/assets/css/main.css'),
    resolve(sharedDir, 'presentation/assets/css/components.css'),
    resolve(sharedDir, 'presentation/assets/css/transitions.css'),
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
      { path: resolve(sharedDir, 'presentation/components/base'), prefix: 'Base' },
      { path: resolve(sharedDir, 'presentation/components/form'), prefix: 'Form' },
      { path: resolve(sharedDir, 'presentation/components/data'), prefix: 'Data' },
      { path: resolve(sharedDir, 'presentation/components/layout'), prefix: 'Admin' },
    ],
  },

  alias: {
    '~shared': sharedDir,
  },

  imports: {
    dirs: [
      resolve(sharedDir, 'application/composables'),
      resolve(sharedDir, 'application/stores'),
      resolve(sharedDir, 'utils'),
    ],
  },

  build: {
    transpile: ['vue-toastification'],
  },

  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
      autoprefixer: {},
    },
  },

  compatibilityDate: '2025-01-01',
})
