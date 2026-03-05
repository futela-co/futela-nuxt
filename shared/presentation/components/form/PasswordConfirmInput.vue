<script setup lang="ts">
import {
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
} from '@heroicons/vue/24/outline'

interface Props {
  modelValue: string
  password: string // Original password to compare against
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Confirmer le mot de passe',
  placeholder: '••••••••',
  disabled: false,
  required: false,
  id: 'passwordConfirmation',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showPassword = ref(false)

const passwordsMatch = computed(() => {
  return props.password && props.modelValue && props.password === props.modelValue
})

const showMismatchError = computed(() => {
  return props.modelValue && !passwordsMatch.value
})

const inputClasses = computed(() => {
  const baseClasses = 'block w-full rounded border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 pr-12 px-4 py-2 text-sm'
  if (showMismatchError.value) {
    return `${baseClasses} border-red-300 focus:ring-red-500 focus:border-red-500`
  }
  if (passwordsMatch.value) {
    return `${baseClasses} border-green-300 focus:ring-green-500 focus:border-green-500`
  }
  return `${baseClasses} border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500`
})

// Expose validation state
defineExpose({
  passwordsMatch,
})
</script>

<template>
  <div class="w-full">
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium text-slate-700 mb-1.5"
    >
      {{ label }}
    </label>
    <div class="relative">
      <input
        :id="id"
        :value="modelValue"
        :type="showPassword ? 'text' : 'password'"
        autocomplete="new-password"
        :required="required"
        :disabled="disabled"
        :placeholder="placeholder"
        :class="inputClasses"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      >
      <button
        type="button"
        tabindex="-1"
        :disabled="disabled"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed"
        @click="showPassword = !showPassword"
      >
        <EyeSlashIcon
          v-if="showPassword"
          class="h-5 w-5"
        />
        <EyeIcon
          v-else
          class="h-5 w-5"
        />
      </button>
    </div>
    <p
      v-if="showMismatchError"
      class="mt-1 text-xs text-red-600"
    >
      Les mots de passe ne correspondent pas
    </p>
    <p
      v-if="passwordsMatch"
      class="mt-1 text-xs text-green-600 flex items-center gap-1"
    >
      <CheckCircleIcon class="h-3 w-3" />
      Les mots de passe correspondent
    </p>
  </div>
</template>
