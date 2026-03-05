<script setup lang="ts">
export interface ActionItem {
  key: string
  label: string
  icon?: string
  variant?: 'default' | 'danger' | 'success' | 'warning'
  disabled?: boolean
  hidden?: boolean
  divider?: boolean
}

interface Props {
  actions: ActionItem[]
  row: Record<string, unknown>
  rowIndex: number
  disabled?: boolean
  triggerIcon?: 'dots-vertical' | 'dots-horizontal' | 'chevron'
  position?: 'left' | 'right'
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  triggerIcon: 'dots-vertical',
  position: 'right',
  size: 'md',
})

const emit = defineEmits<{
  action: [actionKey: string, row: Record<string, unknown>, rowIndex: number]
}>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement>()

const visibleActions = computed(() => {
  return props.actions.filter((action) => !action.hidden)
})

const iconPaths: Record<string, string> = {
  view: 'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  edit: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10',
  delete: 'M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0',
  duplicate: 'M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75',
  download: 'M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3',
  archive: 'm20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z',
  send: 'M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5',
  print: 'M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z',
}

const triggerIconPaths: Record<string, string> = {
  'dots-vertical': 'M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z',
  'dots-horizontal': 'M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z',
  chevron: 'M19.5 8.25l-7.5 7.5-7.5-7.5',
}

function getVariantClasses(variant?: string): string {
  const variantMap: Record<string, string> = {
    default: 'text-gray-900 hover:bg-gray-100',
    danger: 'text-danger-600 hover:bg-danger-50',
    success: 'text-success-600 hover:bg-success-50',
    warning: 'text-warning-600 hover:bg-warning-50',
  }
  return variantMap[variant || 'default'] ?? variantMap['default']!
}

function toggle() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

function handleAction(action: ActionItem) {
  if (action.disabled) return
  emit('action', action.key, props.row, props.rowIndex)
  close()
}

function onClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})

const { t } = useLocale()

defineExpose({
  open: () => (isOpen.value = true),
  close,
  isOpen,
})
</script>

<template>
  <div
    ref="dropdownRef"
    class="relative inline-block"
  >
    <!-- Trigger Button -->
    <button
      type="button"
      :class="[
        'inline-flex items-center justify-center rounded-md text-gray-900 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 transition-colors',
        size === 'sm' ? 'p-1' : 'p-1.5',
      ]"
      :disabled="disabled"
      @click.stop="toggle"
    >
      <svg
        :class="size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          :d="triggerIconPaths[triggerIcon]"
        />
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <Transition name="dropdown">
      <div
        v-if="isOpen"
        :class="[
          'absolute z-50 mt-1 min-w-[160px] origin-top rounded bg-white shadow-lg ring-1 ring-black/5 focus:outline-none py-1',
          position === 'right' ? 'right-0' : 'left-0',
        ]"
      >
        <template
          v-for="(action, index) in visibleActions"
          :key="action.key"
        >
          <!-- Divider -->
          <div
            v-if="action.divider && index > 0"
            class="my-1 border-t border-gray-100"
          />

          <!-- Action Item -->
          <button
            type="button"
            :class="[
              'flex items-center w-full px-3 py-2 text-sm transition-colors',
              getVariantClasses(action.variant),
              { 'opacity-50 cursor-not-allowed': action.disabled },
            ]"
            :disabled="action.disabled"
            @click.stop="handleAction(action)"
          >
            <svg
              v-if="action.icon && iconPaths[action.icon]"
              class="w-4 h-4 mr-2.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                :d="iconPaths[action.icon]"
              />
            </svg>
            <span>{{ action.label }}</span>
          </button>
        </template>

        <!-- Empty State -->
        <div
          v-if="visibleActions.length === 0"
          class="px-3 py-2 text-sm text-gray-900"
        >
          {{ t('table.noAction') }}
        </div>
      </div>
    </Transition>
  </div>
</template>
