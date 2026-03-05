<script setup lang="ts">
import { ChevronDownIcon } from '@heroicons/vue/24/outline'
import type { Component } from 'vue'

interface SidebarChild {
  to: string
  label: string
  badge?: string | number
}

interface Props {
  to?: string
  icon?: Component
  label: string
  badge?: string | number
  children?: SidebarChild[]
  collapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
})

const route = useRoute()
const isExpanded = ref(false)

// Check if current route matches this item or any of its children
const isActive = computed(() => {
  if (props.to) {
    return route.path === props.to || route.path.startsWith(props.to + '/')
  }
  return false
})

// Check if any child is active
const hasActiveChild = computed(() => {
  if (!props.children || props.children.length === 0) return false
  return props.children.some(child =>
    route.path === child.to || route.path.startsWith(child.to + '/')
  )
})

// Auto-expand if a child is active
watch(hasActiveChild, (active) => {
  if (active) {
    isExpanded.value = true
  }
}, { immediate: true })

// Check if a specific child is active
function isChildActive(childTo: string): boolean {
  return route.path === childTo || route.path.startsWith(childTo + '/')
}

function toggleExpand() {
  if (props.children && props.children.length > 0) {
    isExpanded.value = !isExpanded.value
  }
}

const hasChildren = computed(() => props.children && props.children.length > 0)

const itemClasses = computed(() => [
  'sidebar-item',
  {
    'active': isActive.value || hasActiveChild.value,
    'justify-center': props.collapsed,
  }
])
</script>

<template>
  <div class="sidebar-item-wrapper">
    <!-- Main item - Link or button depending on children -->
    <NuxtLink
      v-if="to && !hasChildren"
      :to="to"
      :class="itemClasses"
    >
      <component
        :is="icon"
        v-if="icon"
        class="sidebar-item-icon"
      />
      <span
        v-if="!collapsed"
        class="sidebar-item-text"
      >{{ label }}</span>
      <span
        v-if="badge && !collapsed"
        class="ml-auto px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-700"
      >
        {{ badge }}
      </span>
    </NuxtLink>

    <button
      v-else
      type="button"
      :class="itemClasses"
      @click="toggleExpand"
    >
      <component
        :is="icon"
        v-if="icon"
        class="sidebar-item-icon"
      />
      <span
        v-if="!collapsed"
        class="sidebar-item-text"
      >{{ label }}</span>
      <span
        v-if="badge && !collapsed"
        class="ml-auto px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-700"
      >
        {{ badge }}
      </span>
      <ChevronDownIcon
        v-if="hasChildren && !collapsed"
        class="w-4 h-4 ml-auto transition-transform duration-200"
        :class="{ 'rotate-180': isExpanded }"
      />
    </button>

    <!-- Children submenu -->
    <Transition name="submenu">
      <div
        v-if="hasChildren && isExpanded && !collapsed"
        class="sidebar-submenu"
      >
        <NuxtLink
          v-for="child in children"
          :key="child.to"
          :to="child.to"
          class="sidebar-subitem"
          :class="{ 'active': isChildActive(child.to) }"
        >
          <span class="sidebar-subitem-dot" />
          <span class="sidebar-subitem-text">{{ child.label }}</span>
          <span
            v-if="child.badge"
            class="ml-auto px-1.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-900"
          >
            {{ child.badge }}
          </span>
        </NuxtLink>
      </div>
    </Transition>

    <!-- Tooltip for collapsed state -->
    <div
      v-if="collapsed"
      class="sidebar-tooltip"
    >
      <span class="font-medium">{{ label }}</span>
      <div
        v-if="hasChildren"
        class="mt-2 space-y-1"
      >
        <NuxtLink
          v-for="child in children"
          :key="child.to"
          :to="child.to"
          class="block text-xs text-gray-300 hover:text-white"
        >
          {{ child.label }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
