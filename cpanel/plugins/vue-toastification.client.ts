import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

export default defineNuxtPlugin({
  name: 'vue-toastification',
  parallel: true,
  async setup(nuxtApp) {
    nuxtApp.vueApp.use(Toast, {
      position: 'top-center',
      timeout: 5000,
    })
  },
})
