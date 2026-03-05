<script setup lang="ts">
export interface StatItem {
  label: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: string
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info'
  prefix?: string
  suffix?: string
}

interface Props {
  stats: StatItem[]
  columns?: 1 | 2 | 3 | 4 | 5 | 6
  variant?: 'card' | 'simple' | 'bordered'
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  columns: 4,
  variant: 'card',
  loading: false,
})

const gridClasses = computed(() => {
  const colClasses: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  }
  return colClasses[props.columns]
})

const variantClasses = computed(() => {
  const classes: Record<string, string> = {
    card: 'bg-white rounded shadow-sm border border-gray-200 p-4',
    simple: 'p-4',
    bordered: 'border border-gray-200 rounded p-4',
  }
  return classes[props.variant]
})

function getColorClasses(color?: string): { bg: string; text: string; icon: string } {
  const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
    primary: {
      bg: 'bg-primary-100',
      text: 'text-primary-600',
      icon: 'text-primary-500',
    },
    secondary: {
      bg: 'bg-gray-100',
      text: 'text-gray-900',
      icon: 'text-gray-900',
    },
    success: {
      bg: 'bg-success-100',
      text: 'text-success-600',
      icon: 'text-success-500',
    },
    danger: {
      bg: 'bg-danger-100',
      text: 'text-danger-600',
      icon: 'text-danger-500',
    },
    warning: {
      bg: 'bg-warning-100',
      text: 'text-warning-600',
      icon: 'text-warning-500',
    },
    info: {
      bg: 'bg-info-100',
      text: 'text-info-600',
      icon: 'text-info-500',
    },
  }
  return colorMap[color || 'primary'] ?? colorMap['primary']!
}

function getChangeClasses(change?: number): string {
  if (change === undefined || change === 0) return 'text-gray-900'
  return change > 0 ? 'text-success-600' : 'text-danger-600'
}

function formatChange(change?: number): string {
  if (change === undefined) return ''
  const sign = change > 0 ? '+' : ''
  return `${sign}${change}%`
}

const iconPaths: Record<string, string> = {
  currency: 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  users: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
  chart: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
  trending: 'M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941',
  shopping: 'M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z',
  document: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
  clock: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
  check: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  star: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z',
  box: 'M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9',
}
</script>

<template>
  <div :class="['grid gap-4', gridClasses]">
    <!-- Loading State -->
    <template v-if="loading">
      <div
        v-for="i in columns"
        :key="`skeleton-${i}`"
        :class="variantClasses"
      >
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="skeleton h-3 w-20 rounded mb-2" />
            <div class="skeleton h-8 w-28 rounded mb-2" />
            <div class="skeleton h-3 w-16 rounded" />
          </div>
          <div class="skeleton h-12 w-12 rounded-full" />
        </div>
      </div>
    </template>

    <!-- Stats Cards -->
    <template v-else>
      <div
        v-for="(stat, index) in stats"
        :key="`stat-${index}`"
        :class="variantClasses"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <!-- Label -->
            <p class="text-sm font-medium text-gray-900 truncate">
              {{ stat.label }}
            </p>

            <!-- Value -->
            <p class="mt-1 text-2xl font-bold text-gray-900">
              <slot
                :name="`value-${index}`"
                :stat="stat"
              >
                <span
                  v-if="stat.prefix"
                  class="text-lg font-normal text-gray-900"
                >{{ stat.prefix }}</span>
                {{ stat.value }}
                <span
                  v-if="stat.suffix"
                  class="text-lg font-normal text-gray-900"
                >{{ stat.suffix }}</span>
              </slot>
            </p>

            <!-- Change Indicator -->
            <div
              v-if="stat.change !== undefined"
              class="mt-2 flex items-center gap-1"
            >
              <span :class="['text-sm font-medium', getChangeClasses(stat.change)]">
                <!-- Up Arrow -->
                <svg
                  v-if="stat.change > 0"
                  class="inline w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M4.5 15.75l7.5-7.5 7.5 7.5"
                  />
                </svg>
                <!-- Down Arrow -->
                <svg
                  v-else-if="stat.change < 0"
                  class="inline w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
                {{ formatChange(stat.change) }}
              </span>
              <span
                v-if="stat.changeLabel"
                class="text-xs text-gray-900"
              >
                {{ stat.changeLabel }}
              </span>
            </div>
          </div>

          <!-- Icon -->
          <div
            v-if="stat.icon"
            :class="[
              'flex-shrink-0 p-3 rounded-full',
              getColorClasses(stat.color).bg
            ]"
          >
            <slot
              :name="`icon-${index}`"
              :stat="stat"
            >
              <svg
                :class="['w-6 h-6', getColorClasses(stat.color).icon]"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  :d="iconPaths[stat.icon] || iconPaths.chart"
                />
              </svg>
            </slot>
          </div>
        </div>

        <!-- Custom Content Slot -->
        <slot
          :name="`content-${index}`"
          :stat="stat"
        />
      </div>
    </template>
  </div>
</template>
