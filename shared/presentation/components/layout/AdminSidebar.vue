<script setup lang="ts">
import {
  ChevronLeftIcon,
  HomeIcon,
} from '@heroicons/vue/24/outline'
import {
  moduleNavigation,
  getModuleFromPath,
} from '~/config/navigation'

interface Props {
  collapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
})

const emit = defineEmits<{
  toggleSidebar: []
}>()

const { t } = useLocale()
const route = useRoute()

// Detect current module from route path
const currentModule = computed(() => getModuleFromPath(route.path))

// Get current module navigation config
const currentModuleNav = computed(() => {
  if (currentModule.value && moduleNavigation[currentModule.value]) {
    return moduleNavigation[currentModule.value]
  }
  return null
})

// Header title - shows module title when in module, "Futela" otherwise
const headerTitle = computed(() => {
  if (currentModuleNav.value) {
    return currentModuleNav.value.title
  }
  return 'Futela'
})

// Header icon - shows module icon when in module, HomeIcon otherwise
const HeaderIcon = computed(() => {
  if (currentModuleNav.value) {
    return currentModuleNav.value.icon
  }
  return HomeIcon
})

const sidebarClasses = computed(() => [
  'sidebar',
  props.collapsed ? 'sidebar-collapsed' : 'sidebar-expanded',
])
</script>

<template>
  <aside :class="sidebarClasses">
    <!-- Header with logo, title and toggle -->
    <div
      class="sidebar-header"
      :class="{ 'sidebar-header-collapsed': collapsed }"
    >
      <!-- Expanded: Logo + Title (no navigation) -->
      <div
        v-if="!collapsed"
        class="sidebar-brand"
      >
        <div class="sidebar-logo">
          <component
            :is="HeaderIcon"
            class="sidebar-logo-icon"
          />
        </div>
        <span class="sidebar-title">
          {{ headerTitle }}
        </span>
      </div>

      <!-- Collapsed: Logo button to expand sidebar -->
      <button
        v-if="collapsed"
        type="button"
        class="sidebar-logo sidebar-logo-btn"
        :title="t('sidebar.expandMenu')"
        @click.stop="emit('toggleSidebar')"
      >
        <component
          :is="HeaderIcon"
          class="sidebar-logo-icon"
        />
      </button>

      <!-- Toggle button - only visible when expanded -->
      <button
        v-if="!collapsed"
        type="button"
        class="sidebar-toggle-btn"
        :title="t('sidebar.collapseMenu')"
        @click.stop="emit('toggleSidebar')"
      >
        <ChevronLeftIcon class="sidebar-toggle-icon" />
      </button>
    </div>

    <!-- Navigation - Using shared component -->
    <AdminSidebarNav :collapsed="collapsed" />

    <!-- Language switcher at the bottom -->
    <div
      class="mt-auto p-3 border-t border-slate-200/60"
      :class="{ 'flex justify-center': collapsed }"
    >
      <BaseLanguageSwitcher
        :variant="collapsed ? 'icon' : 'full'"
        size="sm"
      />
    </div>
  </aside>
</template>
