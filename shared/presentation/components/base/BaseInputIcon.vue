<script setup lang="ts">
/**
 * BaseInputIcon.vue
 * Input avec icône intégrée à gauche
 * Utilisé dans les filtres et formulaires
 */
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

interface Props {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  icon?: Component
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number' | 'date' | 'search'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  disabled: false,
  size: 'md',
  icon: () => MagnifyingGlassIcon,
  type: 'text'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'input': [value: string]
  'keyup': [event: KeyboardEvent]
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
}>()

const inputValue = computed({
  get: () => props.modelValue ?? '',
  set: (value: string) => emit('update:modelValue', value)
})

const inputClasses = computed(() => {
  const classes = ['form-control', 'w-full', '!pl-10', 'border', 'border-gray-300']
  if (props.size === 'sm') {
    classes.push('text-xs', 'py-1.5')
  } else if (props.size === 'lg') {
    classes.push('text-base', 'py-3')
  } else {
    classes.push('text-sm')
  }
  return classes
})

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('input', target.value)
}

function handleKeyup(event: KeyboardEvent) {
  emit('keyup', event)
}

function handleFocus(event: FocusEvent) {
  emit('focus', event)
}

function handleBlur(event: FocusEvent) {
  emit('blur', event)
}
</script>

<template>
  <div class="relative">
    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
      <component
        :is="icon"
        class="h-4 w-4 text-gray-400"
      />
    </div>
    <input
      v-model="inputValue"
      :type="type"
      :class="inputClasses"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="handleInput"
      @keyup="handleKeyup"
      @focus="handleFocus"
      @blur="handleBlur"
    >
  </div>
</template>
