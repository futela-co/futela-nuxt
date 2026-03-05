<script setup lang="ts">
interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  autofocus?: boolean
  error?: string
  id?: string
  name?: string
  autocomplete?: 'current-password' | 'new-password' | 'off'
  size?: 'sm' | 'md' | 'lg'
  showStrength?: boolean
  minLength?: number
  maxLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Mot de passe',
  disabled: false,
  readonly: false,
  required: false,
  autofocus: false,
  autocomplete: 'current-password',
  size: 'md',
  showStrength: false,
  minLength: 6,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
  input: [event: Event]
}>()

const generatedId = `password-${Math.random().toString(36).substring(2, 9)}`
const inputId = computed(() => props.id || generatedId)

const showPassword = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-4 py-3 text-base',
}

const inputClasses = computed(() => [
  'block w-full rounded border transition-colors duration-200',
  'focus:outline-none focus:ring-2 focus:ring-offset-0',
  'pr-12',
  sizeClasses[props.size],
  props.error
    ? 'border-red-500 text-red-900 placeholder-red-400 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500',
  props.disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white',
  props.readonly ? 'bg-gray-50' : '',
])

const inputType = computed(() => showPassword.value ? 'text' : 'password')

// Password validation: 6+ characters with at least one digit and one letter
const hasMinLength = computed(() => props.modelValue.length >= props.minLength)
const hasDigit = computed(() => /\d/.test(props.modelValue))
const hasLetter = computed(() => /[a-zA-Z]/.test(props.modelValue))

// For backward compatibility, keep the more complex strength rules for display
interface StrengthRule {
  label: string
  test: (password: string) => boolean
}

const strengthRules: StrengthRule[] = [
  { label: `Au moins ${props.minLength} caracteres`, test: (p) => p.length >= props.minLength },
  { label: 'Au moins une lettre', test: (p) => /[a-zA-Z]/.test(p) },
  { label: 'Au moins un chiffre', test: (p) => /[0-9]/.test(p) },
]

const passwordStrength = computed(() => {
  if (!props.modelValue) return { score: 0, label: '', color: '' }

  const passedRules = strengthRules.filter(rule => rule.test(props.modelValue)).length
  const score = passedRules

  if (score === 3) {
    return { score, label: 'Valide', color: 'bg-green-500' }
  } else if (score >= 1) {
    return { score, label: 'Incomplet', color: 'bg-orange-500' }
  } else {
    return { score, label: 'Invalide', color: 'bg-red-500' }
  }
})

const strengthPercentage = computed(() => {
  return (passwordStrength.value.score / strengthRules.length) * 100
})

// isValid is true when password meets minimum requirements
const isValid = computed(() => hasMinLength.value && hasDigit.value && hasLetter.value)

function toggleVisibility() {
  showPassword.value = !showPassword.value
  nextTick(() => {
    inputRef.value?.focus()
  })
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
  emit('input', event)
}

function handleBlur(event: FocusEvent) {
  emit('blur', event)
}

function handleFocus(event: FocusEvent) {
  emit('focus', event)
}

// Expose validation state
defineExpose({
  isValid,
  hasMinLength,
  hasDigit,
  hasLetter,
  passwordStrength,
})
</script>

<template>
  <div class="w-full">
    <label
      v-if="label"
      :for="inputId"
      class="block text-sm font-medium text-slate-700 mb-1.5"
    >
      {{ label }}
    </label>
    <div class="relative">
      <input
        :id="inputId"
        ref="inputRef"
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autofocus="autofocus"
        :name="name"
        :autocomplete="autocomplete"
        :minlength="minLength"
        :maxlength="maxLength"
        :class="inputClasses"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${inputId}-error` : showStrength ? `${inputId}-strength` : undefined"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      >

      <button
        type="button"
        class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-900 focus:outline-none focus:text-gray-900"
        :disabled="disabled"
        tabindex="-1"
        :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
        @click="toggleVisibility"
      >
        <svg
          v-if="showPassword"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
          />
        </svg>
        <svg
          v-else
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      </button>
    </div>

    <div
      v-if="showStrength && modelValue"
      :id="`${inputId}-strength`"
      class="mt-2"
    >
      <div class="flex items-center gap-2 mb-1">
        <div class="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            class="h-full transition-all duration-300 rounded-full"
            :class="passwordStrength.color"
            :style="{ width: `${strengthPercentage}%` }"
          />
        </div>
        <span class="text-xs text-slate-500">{{ passwordStrength.label }}</span>
      </div>

      <ul class="mt-2 space-y-1">
        <li
          v-for="rule in strengthRules"
          :key="rule.label"
          class="flex items-center gap-2 text-xs"
          :class="rule.test(modelValue) ? 'text-green-600' : 'text-gray-400'"
        >
          <svg
            v-if="rule.test(modelValue)"
            class="h-3.5 w-3.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
              clip-rule="evenodd"
            />
          </svg>
          <svg
            v-else
            class="h-3.5 w-3.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clip-rule="evenodd"
            />
          </svg>
          <span>{{ rule.label }}</span>
        </li>
      </ul>
    </div>

    <p
      v-if="error"
      :id="`${inputId}-error`"
      class="mt-1.5 text-xs text-red-500"
    >
      {{ error }}
    </p>
  </div>
</template>
