export default defineNuxtConfig({
  ssr: true,

  devServer: { port: 3006 },

  css: [
    '~/assets/css/main.css',
    '~/assets/css/components.css',
    '~/assets/css/transitions.css',
  ],

  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/sitemap',
    '@vite-pwa/nuxt',
  ],

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8006/api',
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'Futela',
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID || '',
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
      { path: '~/components/auth', prefix: 'Auth' },
      { path: '~/components/dashboard', prefix: 'Dashboard' },
      { path: '~/components/landlord', prefix: 'Landlord' },
      { path: '~/components/messaging', prefix: 'Messaging' },
      { path: '~/components/portal-layout', prefix: 'PortalLayout' },
      { path: '~/components/property', prefix: 'Property' },
      { path: '~/components/property/specs', prefix: 'PropertySpecs' },
      { path: '~/components/reservation', prefix: 'Reservation' },
      { path: '~/components/review', prefix: 'Review' },
      { path: '~/components/search', prefix: 'Search' },
    ],
  },

  imports: {
    dirs: [
      'composables',
      'stores',
    ],
  },

  routeRules: {
    '/': { isr: 3600 },
    '/search': { isr: 600 },
    '/properties/**': { isr: 1800 },
    '/auth/**': { ssr: false },
    '/dashboard/**': { ssr: false },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      title: 'Futela',
      titleTemplate: '%s | Futela',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
        { name: 'description', content: 'Futela - Location et réservation immobilière en RDC' },
        { name: 'theme-color', content: '#2563eb' },
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico' },
      ],
    },
    pageTransition: { name: 'page' },
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Futela',
      short_name: 'Futela',
      description: 'Location et réservation immobilière en RDC',
      theme_color: '#2563eb',
      background_color: '#ffffff',
      display: 'standalone',
      icons: [
        { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    workbox: {
      navigateFallback: undefined,
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/.*\/api\/.*/,
          handler: 'NetworkFirst',
          options: { cacheName: 'api-cache', expiration: { maxEntries: 100, maxAgeSeconds: 300 } },
        },
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
          handler: 'CacheFirst',
          options: { cacheName: 'image-cache', expiration: { maxEntries: 200, maxAgeSeconds: 86400 } },
        },
      ],
    },
  },

  sitemap: {
    sources: ['/api/__sitemap__/urls'],
    exclude: ['/dashboard/**', '/auth/**'],
  },

  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
      autoprefixer: {},
    },
  },

  compatibilityDate: '2025-01-01',
})
