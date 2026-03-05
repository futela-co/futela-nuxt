<script setup lang="ts">
import { ChevronDownIcon, MinusIcon, PlusIcon } from '@heroicons/vue/24/outline'

interface Guests {
  adults: number
  children: number
  infants: number
}

interface Props {
  modelValue: Guests
  maxGuests?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxGuests: 6,
})

const emit = defineEmits<{
  'update:modelValue': [value: Guests]
}>()

const isOpen = ref(false)

const totalGuests = computed(() => props.modelValue.adults + props.modelValue.children)
const label = computed(() => {
  const parts: string[] = []
  if (props.modelValue.adults > 0) parts.push(`${props.modelValue.adults} adulte${props.modelValue.adults > 1 ? 's' : ''}`)
  if (props.modelValue.children > 0) parts.push(`${props.modelValue.children} enfant${props.modelValue.children > 1 ? 's' : ''}`)
  if (props.modelValue.infants > 0) parts.push(`${props.modelValue.infants} bebe${props.modelValue.infants > 1 ? 's' : ''}`)
  return parts.length > 0 ? parts.join(', ') : '1 voyageur'
})

function update(key: keyof Guests, delta: number) {
  const newVal = { ...props.modelValue }
  newVal[key] = Math.max(key === 'adults' ? 1 : 0, newVal[key] + delta)
  if (newVal.adults + newVal.children > props.maxGuests) return
  emit('update:modelValue', newVal)
}
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 transition-colors"
      @click="isOpen = !isOpen"
    >
      <span>{{ label }}</span>
      <ChevronDownIcon
        class="w-4 h-4 text-gray-400 transition-transform"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-20"
      >
        <!-- Adults -->
        <div class="flex items-center justify-between py-3">
          <div>
            <div class="text-sm font-medium text-gray-900">Adultes</div>
            <div class="text-xs text-gray-500">13 ans et +</div>
          </div>
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed"
              :disabled="modelValue.adults <= 1"
              @click="update('adults', -1)"
            >
              <MinusIcon class="w-4 h-4" />
            </button>
            <span class="w-6 text-center text-sm font-medium">{{ modelValue.adults }}</span>
            <button
              type="button"
              class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed"
              :disabled="totalGuests >= maxGuests"
              @click="update('adults', 1)"
            >
              <PlusIcon class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Children -->
        <div class="flex items-center justify-between py-3 border-t border-gray-100">
          <div>
            <div class="text-sm font-medium text-gray-900">Enfants</div>
            <div class="text-xs text-gray-500">2-12 ans</div>
          </div>
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed"
              :disabled="modelValue.children <= 0"
              @click="update('children', -1)"
            >
              <MinusIcon class="w-4 h-4" />
            </button>
            <span class="w-6 text-center text-sm font-medium">{{ modelValue.children }}</span>
            <button
              type="button"
              class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed"
              :disabled="totalGuests >= maxGuests"
              @click="update('children', 1)"
            >
              <PlusIcon class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Infants -->
        <div class="flex items-center justify-between py-3 border-t border-gray-100">
          <div>
            <div class="text-sm font-medium text-gray-900">Bebes</div>
            <div class="text-xs text-gray-500">Moins de 2 ans</div>
          </div>
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed"
              :disabled="modelValue.infants <= 0"
              @click="update('infants', -1)"
            >
              <MinusIcon class="w-4 h-4" />
            </button>
            <span class="w-6 text-center text-sm font-medium">{{ modelValue.infants }}</span>
            <button
              type="button"
              class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
              @click="update('infants', 1)"
            >
              <PlusIcon class="w-4 h-4" />
            </button>
          </div>
        </div>

        <p class="text-xs text-gray-500 mt-2">Maximum {{ maxGuests }} voyageurs</p>

        <button
          type="button"
          class="w-full btn btn-primary text-sm mt-3"
          @click="isOpen = false"
        >
          Appliquer
        </button>
      </div>
    </Transition>
  </div>
</template>
