<script setup lang="ts">
/**
 * AdminFooter.vue
 * Footer component with copyright information and useful links
 */

interface FooterLink {
  label: string
  to?: string
  href?: string
  external?: boolean
}

interface Props {
  /** Company name for copyright */
  companyName?: string
  /** Show version number */
  showVersion?: boolean
  /** Version string */
  version?: string
  /** Additional links to display */
  links?: FooterLink[]
}

const props = withDefaults(defineProps<Props>(), {
  companyName: 'Futela',
  showVersion: true,
  version: '1.0.0',
  links: () => [],
})

// Current year for copyright
const currentYear = new Date().getFullYear()

// Default footer links
const defaultLinks: FooterLink[] = [
  { label: 'Aide', to: '/help' },
  { label: 'Documentation', to: '/docs' },
  { label: 'Contact', to: '/contact' },
  { label: 'Mentions legales', to: '/legal' },
]

// Merged links (defaults + custom)
const footerLinks = computed(() => {
  if (props.links.length > 0) {
    return props.links
  }
  return defaultLinks
})
</script>

<template>
  <footer class="bg-white border-t border-gray-200 py-4 px-6">
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <!-- Copyright -->
      <div class="text-sm text-gray-900">
        <span>&copy; {{ currentYear }} {{ companyName }}. Tous droits reserves.</span>
        <span
          v-if="showVersion"
          class="ml-2 text-gray-400"
        >
          v{{ version }}
        </span>
      </div>

      <!-- Links -->
      <nav
        v-if="footerLinks.length > 0"
        class="flex items-center gap-4"
      >
        <template
          v-for="(link, index) in footerLinks"
          :key="index"
        >
          <!-- External link -->
          <a
            v-if="link.href || link.external"
            :href="link.href || link.to"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm text-gray-900 hover:text-primary-600 transition-colors"
          >
            {{ link.label }}
          </a>

          <!-- Internal link -->
          <NuxtLink
            v-else-if="link.to"
            :to="link.to"
            class="text-sm text-gray-900 hover:text-primary-600 transition-colors"
          >
            {{ link.label }}
          </NuxtLink>
        </template>
      </nav>
    </div>

    <!-- Optional: Secondary row for additional info -->
    <slot name="secondary" />
  </footer>
</template>
