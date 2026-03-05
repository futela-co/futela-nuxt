<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
  image?: string
  imageAlt?: string
  badge?: string
  badgeVariant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info'
  variant?: 'default' | 'bordered' | 'elevated' | 'flat'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  clickable?: boolean
  loading?: boolean
  horizontal?: boolean
  imagePosition?: 'top' | 'bottom' | 'left' | 'right'
  imageSize?: 'sm' | 'md' | 'lg' | 'full'
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  image: '',
  imageAlt: '',
  badge: '',
  badgeVariant: 'primary',
  variant: 'default',
  padding: 'md',
  hoverable: false,
  clickable: false,
  loading: false,
  horizontal: false,
  imagePosition: 'top',
  imageSize: 'md',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const cardClasses = computed(() => {
  const variantClasses: Record<string, string> = {
    default: 'bg-white border border-gray-200 rounded',
    bordered: 'bg-white border-2 border-gray-300 rounded',
    elevated: 'bg-white rounded shadow-md',
    flat: 'bg-gray-50 rounded',
  }

  return [
    variantClasses[props.variant],
    { 'hover:shadow-lg transition-shadow': props.hoverable },
    { 'cursor-pointer': props.clickable },
    { 'flex': props.horizontal || props.imagePosition === 'left' || props.imagePosition === 'right' },
    { 'flex-row-reverse': props.imagePosition === 'right' },
    { 'flex-col-reverse': props.imagePosition === 'bottom' },
  ]
})

const paddingClasses = computed(() => {
  const paddingMap: Record<string, string> = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }
  return paddingMap[props.padding]
})

const imageSizeClasses = computed(() => {
  if (props.horizontal || props.imagePosition === 'left' || props.imagePosition === 'right') {
    const sizeMap: Record<string, string> = {
      sm: 'w-24',
      md: 'w-32',
      lg: 'w-48',
      full: 'w-1/3',
    }
    return sizeMap[props.imageSize]
  }
  const sizeMap: Record<string, string> = {
    sm: 'h-24',
    md: 'h-40',
    lg: 'h-56',
    full: 'h-auto',
  }
  return sizeMap[props.imageSize]
})

const badgeClasses = computed(() => {
  const variantMap: Record<string, string> = {
    primary: 'bg-primary-100 text-primary-700',
    secondary: 'bg-gray-100 text-gray-900',
    success: 'bg-success-100 text-success-700',
    danger: 'bg-danger-100 text-danger-700',
    warning: 'bg-warning-100 text-warning-700',
    info: 'bg-info-100 text-info-700',
  }
  return variantMap[props.badgeVariant]
})

function handleClick(event: MouseEvent) {
  if (props.clickable) {
    emit('click', event)
  }
}
</script>

<template>
  <div
    :class="cardClasses"
    @click="handleClick"
  >
    <!-- Loading State -->
    <template v-if="loading">
      <div class="animate-pulse">
        <div
          v-if="image || $slots.image"
          :class="['bg-gray-200', imageSizeClasses, 'rounded-t-lg']"
        />
        <div :class="paddingClasses">
          <div class="skeleton h-5 w-3/4 rounded mb-2" />
          <div class="skeleton h-4 w-1/2 rounded mb-4" />
          <div class="skeleton h-3 w-full rounded mb-2" />
          <div class="skeleton h-3 w-5/6 rounded" />
        </div>
      </div>
    </template>

    <template v-else>
      <!-- Image -->
      <div
        v-if="image || $slots.image"
        :class="[
          'flex-shrink-0 overflow-hidden',
          imageSizeClasses,
          (imagePosition === 'top' || imagePosition === 'bottom') ? 'w-full' : '',
          (imagePosition === 'top') ? 'rounded-t-lg' : '',
          (imagePosition === 'bottom') ? 'rounded-b-lg' : '',
          (imagePosition === 'left') ? 'rounded-l-lg' : '',
          (imagePosition === 'right') ? 'rounded-r-lg' : '',
        ]"
      >
        <slot name="image">
          <img
            v-if="image"
            :src="image"
            :alt="imageAlt || title"
            class="w-full h-full object-cover"
          >
        </slot>
      </div>

      <!-- Content -->
      <div :class="['flex-1 min-w-0', paddingClasses]">
        <!-- Header -->
        <div
          v-if="title || subtitle || badge || $slots.header"
          class="mb-3"
        >
          <slot name="header">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <h3
                  v-if="title"
                  class="text-base font-semibold text-gray-900 truncate"
                >
                  {{ title }}
                </h3>
                <p
                  v-if="subtitle"
                  class="text-sm text-gray-900 mt-0.5 truncate"
                >
                  {{ subtitle }}
                </p>
              </div>
              <span
                v-if="badge"
                :class="[
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0',
                  badgeClasses,
                ]"
              >
                {{ badge }}
              </span>
            </div>
          </slot>
        </div>

        <!-- Body -->
        <div
          v-if="$slots.default"
          class="text-sm text-gray-900"
        >
          <slot />
        </div>

        <!-- Meta -->
        <div
          v-if="$slots.meta"
          class="mt-3"
        >
          <slot name="meta" />
        </div>

        <!-- Footer -->
        <div
          v-if="$slots.footer"
          class="mt-4 pt-4 border-t border-gray-100"
        >
          <slot name="footer" />
        </div>

        <!-- Actions -->
        <div
          v-if="$slots.actions"
          class="mt-4 flex items-center gap-2"
        >
          <slot name="actions" />
        </div>
      </div>
    </template>
  </div>
</template>
