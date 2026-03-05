<script setup lang="ts">
import { ChevronDownIcon } from '@heroicons/vue/24/outline'
import type { Component } from 'vue'

interface SidebarChild {
  to: string
  label: string
  badge?: string | number
}

interface SidebarItem {
  to?: string
  icon?: Component
  label: string
  badge?: string | number
  children?: SidebarChild[]
}

interface Props {
  title: string
  items: SidebarItem[]
  collapsed?: boolean
  collapsible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
  collapsible: true,
})

const isGroupExpanded = ref(true)

function toggleGroup() {
  if (props.collapsible && !props.collapsed) {
    isGroupExpanded.value = !isGroupExpanded.value
  }
}

// Auto-expand when sidebar is collapsed
watch(() => props.collapsed, (newCollapsed) => {
  if (!newCollapsed) {
    isGroupExpanded.value = true
  }
})
</script>

<template>
  <div class="sidebar-group">
    <!-- Group header -->
    <button
      v-if="!collapsed"
      type="button"
      class="sidebar-group-header"
      :class="{ 'cursor-pointer': collapsible }"
      @click="toggleGroup"
    >
      <span class="sidebar-group-title">{{ title }}</span>
      <ChevronDownIcon
        v-if="collapsible"
        class="w-3.5 h-3.5 text-gray-400 transition-transform duration-200"
        :class="{ 'rotate-180': !isGroupExpanded }"
      />
    </button>

    <!-- Divider line for collapsed state -->
    <div
      v-else
      class="sidebar-group-divider"
    />

    <!-- Group items -->
    <Transition name="group">
      <div
        v-show="isGroupExpanded || collapsed"
        class="sidebar-group-items"
      >
        <AdminSidebarItem
          v-for="item in items"
          :key="item.label"
          :to="item.to"
          :icon="item.icon"
          :label="item.label"
          :badge="item.badge"
          :children="item.children"
          :collapsed="collapsed"
        />
      </div>
    </Transition>
  </div>
</template>
