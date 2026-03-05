<script setup lang="ts">
interface Props {
  length?: number
  disabled?: boolean
  error?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  length: 6,
  disabled: false,
  error: false,
})

const emit = defineEmits<{
  complete: [code: string]
  'update:modelValue': [value: string]
}>()

const digits = ref<string[]>(Array(props.length).fill(''))
const inputRefs = ref<HTMLInputElement[]>([])

function setRef(el: any, index: number) {
  if (el) inputRefs.value[index] = el
}

function focusInput(index: number) {
  nextTick(() => {
    inputRefs.value[index]?.focus()
    inputRefs.value[index]?.select()
  })
}

function handleInput(event: Event, index: number) {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/\D/g, '')

  if (value.length === 0) {
    digits.value[index] = ''
    emitValue()
    return
  }

  // Take only the last character if multiple entered
  digits.value[index] = value.slice(-1)
  emitValue()

  // Auto-advance to next input
  if (index < props.length - 1) {
    focusInput(index + 1)
  }

  // Check if complete
  const code = digits.value.join('')
  if (code.length === props.length) {
    emit('complete', code)
  }
}

function handleKeydown(event: KeyboardEvent, index: number) {
  if (event.key === 'Backspace') {
    if (!digits.value[index] && index > 0) {
      // Move to previous input when backspace on empty
      event.preventDefault()
      digits.value[index - 1] = ''
      focusInput(index - 1)
      emitValue()
    }
  } else if (event.key === 'ArrowLeft' && index > 0) {
    event.preventDefault()
    focusInput(index - 1)
  } else if (event.key === 'ArrowRight' && index < props.length - 1) {
    event.preventDefault()
    focusInput(index + 1)
  }
}

function handlePaste(event: ClipboardEvent) {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData('text')?.replace(/\D/g, '') ?? ''

  if (!pastedData) return

  for (let i = 0; i < Math.min(pastedData.length, props.length); i++) {
    digits.value[i] = pastedData[i] as string
  }

  emitValue()

  // Focus the next empty or last input
  const nextEmpty = digits.value.findIndex(d => !d)
  if (nextEmpty !== -1) {
    focusInput(nextEmpty)
  } else {
    focusInput(props.length - 1)
    const code = digits.value.join('')
    if (code.length === props.length) {
      emit('complete', code)
    }
  }
}

function emitValue() {
  emit('update:modelValue', digits.value.join(''))
}

function clear() {
  digits.value = Array(props.length).fill('')
  emitValue()
  focusInput(0)
}

// Auto-focus first input on mount
nextTick(() => {
  if (!props.disabled) {
    focusInput(0)
  }
})

defineExpose({ clear })
</script>

<template>
  <div
    class="flex justify-center gap-2 sm:gap-3"
    role="group"
    aria-label="Saisie du code de verification"
  >
    <input
      v-for="(_, index) in length"
      :key="index"
      :ref="(el) => setRef(el, index)"
      type="text"
      inputmode="numeric"
      pattern="[0-9]"
      maxlength="1"
      :value="digits[index]"
      :disabled="disabled"
      :aria-label="`Chiffre ${index + 1} sur ${length}`"
      :autocomplete="index === 0 ? 'one-time-code' : 'off'"
      class="w-11 h-12 sm:w-[52px] sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0"
      :class="[
        disabled ? 'bg-gray-100 opacity-50 cursor-not-allowed' : 'bg-white',
        error
          ? 'border-red-500 text-red-600 focus:ring-red-500 animate-shake'
          : digits[index]
            ? 'border-primary-500 text-gray-900 focus:ring-primary-500'
            : 'border-gray-300 text-gray-900 focus:border-primary-500 focus:ring-primary-500',
      ]"
      @input="handleInput($event, index)"
      @keydown="handleKeydown($event, index)"
      @paste="handlePaste"
    >
  </div>
</template>
