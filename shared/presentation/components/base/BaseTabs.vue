<script setup lang="ts">
interface Tab {
  key: string
  label: string
  icon?: string
  disabled?: boolean
  badge?: string | number
}

interface Props {
  modelValue?: string
  tabs: Tab[]
  variant?: 'tabs' | 'pills' | 'underline'
  fullWidth?: boolean
  vertical?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  variant: 'tabs',
  fullWidth: false,
  vertical: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [tab: Tab]
}>()

const activeTab = computed({
  get: () => props.modelValue || props.tabs[0]?.key || '',
  set: (value) => emit('update:modelValue', value)
})

const containerClasses = computed(() => {
  if (props.vertical) {
    return 'flex flex-col space-y-1'
  }

  const variants: Record<string, string> = {
    tabs: 'nav-tabs',
    pills: 'nav-pills',
    underline: 'flex border-b border-gray-200'
  }
  return variants[props.variant]
})

const tabClasses = computed(() => {
  const base = props.fullWidth ? 'flex-1 text-center' : ''

  const variants: Record<string, { active: string; inactive: string }> = {
    tabs: {
      active: 'nav-tab active',
      inactive: 'nav-tab'
    },
    pills: {
      active: 'nav-pill active',
      inactive: 'nav-pill'
    },
    underline: {
      active: 'px-4 py-2 text-sm font-medium text-primary-600 border-b-2 border-primary-600 cursor-pointer',
      inactive: 'px-4 py-2 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:text-gray-900 hover:border-gray-300 cursor-pointer'
    }
  }

  return { base, ...variants[props.variant] }
})

function selectTab(tab: Tab) {
  if (tab.disabled) return
  activeTab.value = tab.key
  emit('change', tab)
}

function isActive(tab: Tab): boolean {
  return activeTab.value === tab.key
}
</script>

<template>
  <div :class="{ 'flex gap-4': vertical }">
    <!-- Tab Navigation -->
    <div :class="containerClasses">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        :disabled="tab.disabled"
        :class="[
          tabClasses.base,
          isActive(tab) ? tabClasses.active : tabClasses.inactive,
          { 'opacity-50 cursor-not-allowed': tab.disabled }
        ]"
        @click="selectTab(tab)"
      >
        <span class="flex items-center justify-center gap-2">
          <slot
            name="tab-icon"
            :tab="tab"
          />
          <span>{{ tab.label }}</span>
          <span
            v-if="tab.badge !== undefined"
            class="badge badge-primary ml-1"
          >
            {{ tab.badge }}
          </span>
        </span>
      </button>
    </div>

    <!-- Tab Content -->
    <div
      class="mt-4 flex-1"
      :class="{ 'mt-0': vertical }"
    >
      <template
        v-for="tab in tabs"
        :key="tab.key"
      >
        <div v-show="isActive(tab)">
          <slot
            :name="tab.key"
            :tab="tab"
          >
            <slot
              name="default"
              :tab="tab"
            />
          </slot>
        </div>
      </template>
    </div>
  </div>
</template>
