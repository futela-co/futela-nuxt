<script setup lang="ts">
interface Props {
  title?: string
  description?: string
  icon?: 'inbox' | 'search' | 'document' | 'users' | 'folder' | 'chart' | 'error'
  size?: 'sm' | 'md' | 'lg'
}

const { t } = useLocale()

const props = withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
  icon: 'inbox',
  size: 'md',
})

const sizeClasses: Record<string, { icon: string; title: string; description: string; padding: string }> = {
  sm: {
    icon: 'w-10 h-10',
    title: 'text-sm font-medium',
    description: 'text-xs',
    padding: 'py-6',
  },
  md: {
    icon: 'w-16 h-16',
    title: 'text-base font-semibold',
    description: 'text-sm',
    padding: 'py-10',
  },
  lg: {
    icon: 'w-20 h-20',
    title: 'text-lg font-semibold',
    description: 'text-base',
    padding: 'py-16',
  },
}

const iconPaths: Record<string, string> = {
  inbox: 'M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z',
  search: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z',
  document: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
  users: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
  folder: 'M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z',
  chart: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
  error: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
}
</script>

<template>
  <div
    class="flex flex-col items-center justify-center text-center"
    :class="sizeClasses[size]?.padding"
  >
    <slot name="icon">
      <div class="mx-auto flex items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <svg
          :class="sizeClasses[size]?.icon"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="p-3"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            :d="iconPaths[icon]"
          />
        </svg>
      </div>
    </slot>

    <h3
      v-if="title || !$slots.default"
      class="mt-4 text-gray-500 font-medium"
      :class="sizeClasses[size]?.title"
    >
      {{ title || t('table.noData') }}
    </h3>

    <p
      v-if="description || !$slots.default"
      class="text-gray-500 font-medium max-w-sm"
      :class="sizeClasses[size]?.description"
    >
      {{ description || t('table.noDataDefault') }}
    </p>

    <slot />

    <div
      v-if="$slots.action"
      class="mt-4"
    >
      <slot name="action" />
    </div>
  </div>
</template>
