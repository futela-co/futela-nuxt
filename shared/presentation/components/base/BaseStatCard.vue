<script setup lang="ts">
interface Props {
  icon: Component
  iconBgColor?: string
  iconColor?: string
  value: string | number
  valueColor?: string
  unit?: string
  label: string
  secondaryLabel?: string
  /** Use 'text' variant for text values (smaller font), 'number' for numeric values (larger font) */
  variant?: 'number' | 'text'
  /** Size of the value: 'sm' for small, 'md' for medium (default), 'lg' for large */
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  iconBgColor: 'bg-blue-100',
  iconColor: 'text-blue-600',
  valueColor: 'text-gray-900',
  unit: '',
  secondaryLabel: '',
  variant: 'number',
  size: 'md',
})

const valueSizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'text-lg'
    case 'lg':
      return 'text-3xl'
    default:
      return 'text-2xl'
  }
})

const iconSizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'h-4 w-4'
    case 'lg':
      return 'h-6 w-6'
    default:
      return 'h-5 w-5'
  }
})

const iconBgPaddingClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'p-1.5'
    case 'lg':
      return 'p-2.5'
    default:
      return 'p-2'
  }
})
</script>

<template>
  <div class="bg-white rounded border border-gray-200 p-3">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <!-- Icon -->
        <div
          class="rounded"
          :class="[iconBgColor, iconBgPaddingClass]"
        >
          <component
            :is="icon"
            :class="[iconColor, iconSizeClass]"
          />
        </div>

        <!-- Value & Unit -->
        <div
          v-if="variant === 'number'"
          class="flex items-baseline gap-1"
        >
          <slot name="value">
            <p
              class="font-bold"
              :class="[valueSizeClass, valueColor]"
            >
              {{ value }}
            </p>
          </slot>
          <p
            v-if="unit"
            class="text-sm"
            :class="valueColor"
          >
            {{ unit }}
          </p>
        </div>

        <!-- Text value -->
        <template v-else>
          <slot name="value">
            <p
              class="text-sm font-semibold"
              :class="valueColor"
            >
              {{ value }}
            </p>
          </slot>
        </template>
      </div>

      <!-- Label -->
      <div class="text-right">
        <p class="text-xs text-gray-900 uppercase">
          {{ label }}
        </p>
        <p
          v-if="secondaryLabel"
          class="text-xs text-gray-900 uppercase"
        >
          {{ secondaryLabel }}
        </p>
      </div>
    </div>
  </div>
</template>
