<script setup lang="ts">
import { GlobeAltIcon, CheckIcon, LanguageIcon } from '@heroicons/vue/24/outline'

interface Props {
  variant?: 'icon' | 'full'
  size?: 'sm' | 'md'
}

withDefaults(defineProps<Props>(), {
  variant: 'icon',
  size: 'sm',
})

const { locale, setLocale, localeOptions } = useLocale()
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

function toggle() {
  isOpen.value = !isOpen.value
}

function selectLocale(code: string) {
  setLocale(code as any)
  isOpen.value = false
}

// Close on click outside
function handleClickOutside(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const currentOption = computed(() => localeOptions.find(o => o.value === locale.value))
</script>

<template>
  <div
    ref="dropdownRef"
    class="relative"
  >
    <!-- Trigger Button -->
    <button
      type="button"
      class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
      :class="size === 'sm' ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'"
      @click="toggle"
    >
      <LanguageIcon
        :class="size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'"
      />
      <span class="font-medium">{{ currentOption?.label }}</span>
    </button>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 z-50 mt-1.5 w-44 rounded-lg bg-white shadow-lg border border-slate-200 py-1 origin-top-right"
      >
        <button
          v-for="option in localeOptions"
          :key="option.value"
          type="button"
          class="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors"
          :class="option.value === locale ? 'bg-primary-50 text-primary-700' : 'text-slate-700 hover:bg-slate-50'"
          @click="selectLocale(option.value)"
        >
          <LanguageIcon class="h-4 w-4 shrink-0" />
          <span class="flex-1 text-left">{{ option.fullLabel }}</span>
          <CheckIcon
            v-if="option.value === locale"
            class="h-4 w-4 text-primary-600"
          />
        </button>
      </div>
    </Transition>
  </div>
</template>
