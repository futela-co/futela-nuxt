<script setup lang="ts">
interface DropdownItem {
  label: string
  value?: string | number
  icon?: string
  disabled?: boolean
  danger?: boolean
  divider?: boolean
  header?: boolean
}

interface Props {
  items?: DropdownItem[]
  position?: 'left' | 'right'
  trigger?: 'click' | 'hover'
  closeOnSelect?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  position: 'left',
  trigger: 'click',
  closeOnSelect: true,
  disabled: false
})

const emit = defineEmits<{
  select: [item: DropdownItem]
  open: []
  close: []
}>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement>()

const positionClasses = computed(() => {
  return props.position === 'right' ? 'right-0' : 'left-0'
})

function toggle() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    emit('open')
  } else {
    emit('close')
  }
}

function open() {
  if (props.disabled) return
  isOpen.value = true
  emit('open')
}

function close() {
  isOpen.value = false
  emit('close')
}

function selectItem(item: DropdownItem) {
  if (item.disabled || item.divider || item.header) return
  emit('select', item)
  if (props.closeOnSelect) {
    close()
  }
}

function onClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    close()
  }
}

const triggerEvents = computed(() => {
  if (props.trigger === 'hover') {
    return {
      mouseenter: open,
      mouseleave: close
    }
  }
  return { click: toggle }
})

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})

defineExpose({ open, close, toggle })
</script>

<template>
  <div
    ref="dropdownRef"
    class="relative inline-block"
    v-on="trigger === 'hover' ? triggerEvents : {}"
  >
    <!-- Trigger -->
    <div
      :class="{ 'cursor-not-allowed opacity-60': disabled }"
      v-on="trigger === 'click' ? triggerEvents : {}"
    >
      <slot name="trigger">
        <button
          type="button"
          class="btn btn-secondary"
        >
          Dropdown
          <svg
            class="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </slot>
    </div>

    <!-- Menu -->
    <Transition name="dropdown">
      <div
        v-if="isOpen"
        :class="[
          'dropdown-menu absolute z-[1000] mt-1 min-w-[180px] origin-top-right rounded bg-white shadow-lg ring-1 ring-black/5 focus:outline-none py-1',
          positionClasses
        ]"
      >
        <slot name="menu">
          <template
            v-for="(item, index) in items"
            :key="index"
          >
            <!-- Divider -->
            <div
              v-if="item.divider"
              class="dropdown-divider"
            />

            <!-- Header -->
            <div
              v-else-if="item.header"
              class="dropdown-header"
            >
              {{ item.label }}
            </div>

            <!-- Item -->
            <button
              v-else
              type="button"
              :disabled="item.disabled"
              :class="[
                'dropdown-item',
                {
                  'dropdown-item-danger': item.danger,
                  'opacity-50 cursor-not-allowed': item.disabled
                }
              ]"
              @click="selectItem(item)"
            >
              <slot
                name="item"
                :item="item"
              >
                {{ item.label }}
              </slot>
            </button>
          </template>
        </slot>
      </div>
    </Transition>
  </div>
</template>
