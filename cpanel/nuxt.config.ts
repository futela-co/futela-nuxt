export default defineNuxtConfig({
  extends: ['../shared'],

  ssr: false,

  devServer: { port: 3007 },

  runtimeConfig: {
    public: {
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'Futela Admin',
    },
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
})
