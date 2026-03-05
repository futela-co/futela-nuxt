<script setup lang="ts">
const { t } = useLocale()
</script>

<template>
  <footer class="bg-gray-900 hidden md:block">
    <div class="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Brand -->
        <div>
          <span class="text-xl font-bold text-white">FUTELA</span>
          <p class="mt-3 text-sm text-gray-400">
            {{ t('footer.tagline') }}
          </p>
        </div>

        <!-- Decouvrir -->
        <div>
          <h3 class="text-sm font-semibold text-white mb-4">{{ t('footer.discover') }}</h3>
          <ul class="space-y-2">
            <li><NuxtLink to="/search?category=apartment" class="text-sm text-gray-400 hover:text-white transition-colors">{{ t('footer.apartments') }}</NuxtLink></li>
            <li><NuxtLink to="/search?category=house" class="text-sm text-gray-400 hover:text-white transition-colors">{{ t('footer.houses') }}</NuxtLink></li>
            <li><NuxtLink to="/search?category=land" class="text-sm text-gray-400 hover:text-white transition-colors">{{ t('footer.lands') }}</NuxtLink></li>
          </ul>
        </div>

        <!-- Proprietaires -->
        <div>
          <h3 class="text-sm font-semibold text-white mb-4">{{ t('footer.owners') }}</h3>
          <ul class="space-y-2">
            <li><NuxtLink to="/dashboard/landlord/properties" class="text-sm text-gray-400 hover:text-white transition-colors">{{ t('footer.publishProperty') }}</NuxtLink></li>
            <li><NuxtLink to="/dashboard/landlord" class="text-sm text-gray-400 hover:text-white transition-colors">{{ t('footer.manageProperties') }}</NuxtLink></li>
            <li><NuxtLink to="/dashboard/landlord/leases" class="text-sm text-gray-400 hover:text-white transition-colors">{{ t('footer.leases') }}</NuxtLink></li>
          </ul>
        </div>

        <!-- Assistance -->
        <div>
          <h3 class="text-sm font-semibold text-white mb-4">{{ t('footer.assistance') }}</h3>
          <ul class="space-y-2">
            <li><NuxtLink to="/help" class="text-sm text-gray-400 hover:text-white transition-colors">{{ t('footer.help') }}</NuxtLink></li>
            <li><NuxtLink to="/contact" class="text-sm text-gray-400 hover:text-white transition-colors">{{ t('footer.contactUs') }}</NuxtLink></li>
            <li><NuxtLink to="/terms" class="text-sm text-gray-400 hover:text-white transition-colors">{{ t('footer.terms') }}</NuxtLink></li>
            <li><NuxtLink to="/privacy" class="text-sm text-gray-400 hover:text-white transition-colors">{{ t('footer.privacy') }}</NuxtLink></li>
            <li><NuxtLink to="/legal" class="text-sm text-gray-400 hover:text-white transition-colors">{{ t('footer.legal') }}</NuxtLink></li>
          </ul>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-sm text-gray-500">&copy; {{ new Date().getFullYear() }} Futela. {{ t('footer.rights') }}</p>

        <!-- Social Icons -->
        <div class="flex items-center gap-4">
          <a href="#" class="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a href="#" class="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/></svg>
          </a>
          <a href="#" class="text-gray-400 hover:text-white transition-colors" aria-label="TikTok">
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
