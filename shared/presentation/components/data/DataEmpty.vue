<script setup lang="ts">
type IconType = 'inbox' | 'search' | 'document' | 'users' | 'folder' | 'chart' | 'error' | 'no-data' | 'no-results' | 'no-connection' | 'maintenance'

interface Props {
  title?: string
  description?: string
  icon?: IconType
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'centered' | 'compact'
  showIcon?: boolean
  actionLabel?: string
  actionVariant?: 'primary' | 'secondary' | 'outline-primary'
}

const { t } = useLocale()

const props = withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
  icon: 'inbox',
  size: 'md',
  variant: 'default',
  showIcon: true,
  actionLabel: '',
  actionVariant: 'primary',
})

const emit = defineEmits<{
  action: []
}>()

const iconPaths: Record<IconType, string> = {
  inbox: 'M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z',
  search: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z',
  document: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
  users: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
  folder: 'M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z',
  chart: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
  error: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
  'no-data': 'M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125',
  'no-results': 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
  'no-connection': 'M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z',
  maintenance: 'M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z',
}

const sizeClasses = computed(() => {
  const sizeMap: Record<string, { container: string; icon: string; title: string; description: string }> = {
    sm: {
      container: 'py-6 px-4',
      icon: 'w-10 h-10',
      title: 'text-sm',
      description: 'text-xs',
    },
    md: {
      container: 'py-12 px-4',
      icon: 'w-16 h-16',
      title: 'text-lg',
      description: 'text-sm',
    },
    lg: {
      container: 'py-16 px-6',
      icon: 'w-20 h-20',
      title: 'text-xl',
      description: 'text-base',
    },
  }
  return sizeMap[props.size]
})

const iconContainerClasses = computed(() => {
  const sizeMap: Record<string, string> = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  }
  return sizeMap[props.size]
})

const iconSvgClasses = computed(() => {
  const sizeMap: Record<string, string> = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  }
  return sizeMap[props.size]
})

const iconColor = computed(() => {
  if (props.icon === 'error') return 'text-danger-400'
  if (props.icon === 'no-connection') return 'text-warning-400'
  if (props.icon === 'maintenance') return 'text-info-400'
  return 'text-gray-400'
})

const iconBgColor = computed(() => {
  if (props.icon === 'error') return 'bg-danger-100'
  if (props.icon === 'no-connection') return 'bg-warning-100'
  if (props.icon === 'maintenance') return 'bg-info-100'
  return 'bg-gray-100'
})

const actionButtonClasses = computed(() => {
  const variantMap: Record<string, string> = {
    primary: 'btn btn-primary',
    secondary: 'btn btn-secondary',
    'outline-primary': 'btn btn-outline-primary',
  }
  return variantMap[props.actionVariant]
})

function handleAction() {
  emit('action')
}
</script>

<template>
  <div
    :class="[
      'flex flex-col items-center justify-center text-center',
      sizeClasses?.container,
    ]"
  >
    <!-- Icon -->
    <div
      v-if="showIcon"
      :class="[
        'rounded-full flex items-center justify-center mb-4',
        iconContainerClasses,
        iconBgColor,
      ]"
    >
      <slot name="icon">
        <svg
          :class="[iconSvgClasses, iconColor]"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            :d="iconPaths[icon]"
          />
        </svg>
      </slot>
    </div>

    <!-- Title -->
    <h3
      v-if="title"
      :class="['font-medium text-gray-500', sizeClasses?.title]"
    >
      {{ title || t('table.noData') }}
    </h3>

    <!-- Description -->
    <p
      v-if="description || !$slots.default"
      :class="['text-gray-500 font-medium max-w-sm', sizeClasses?.description]"
    >
      {{ description || t('table.noDataDefault') }}
    </p>

    <!-- Default Slot for Extra Content -->
    <div
      v-if="$slots.default"
      class="mt-4"
    >
      <slot />
    </div>

    <!-- Action Button -->
    <button
      v-if="actionLabel"
      type="button"
      :class="[actionButtonClasses, 'mt-4']"
      @click="handleAction"
    >
      {{ actionLabel }}
    </button>

    <!-- Actions Slot -->
    <div
      v-if="$slots.actions"
      class="mt-4"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
