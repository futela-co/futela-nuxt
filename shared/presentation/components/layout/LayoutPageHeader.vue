<script setup lang="ts">
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'

interface Props {
  title: string
  subtitle?: string
  showBackButton?: boolean
  backRoute?: string
  titleColor?: string
  titleSize?: string
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  showBackButton: true,
  backRoute: '',
  titleColor: 'text-primary-600',
  titleSize: 'text-lg',
})

const router = useRouter()

function goBack() {
  if (props.backRoute) {
    navigateTo(props.backRoute)
  } else {
    router.back()
  }
}
</script>

<template>
  <div
    class="flex justify-between mb-4"
    :class="$slots.center ? 'items-start' : 'items-center'"
  >
    <div
      class="flex items-center gap-4"
      :class="$slots.center ? 'pt-1' : ''"
    >
      <button
        v-if="showBackButton"
        class="p-2 hover:bg-gray-100 rounded transition-colors"
        @click="goBack"
      >
        <ArrowLeftIcon class="h-5 w-5 text-gray-900" />
      </button>

      <div>
        <div class="flex items-center gap-2">
          <h1
            class="font-bold"
            :class="[titleColor, titleSize]"
          >
            {{ title }}
          </h1>
          <slot name="badge" />
        </div>
        <p
          v-if="subtitle"
          class="text-sm text-gray-500"
        >
          {{ subtitle }}
        </p>
      </div>
    </div>

    <!-- Center slot (optional, e.g. timeline stepper) -->
    <div
      v-if="$slots.center"
      class="hidden lg:flex items-center flex-1 mx-8"
    >
      <slot name="center" />
    </div>

    <div
      class="flex items-center"
      :class="$slots.center ? 'pt-1' : ''"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
