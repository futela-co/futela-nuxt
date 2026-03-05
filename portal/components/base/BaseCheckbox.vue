<script setup lang="ts">
interface Props {
  modelValue?: boolean | string[]
  value?: string
  label?: string
  disabled?: boolean
  indeterminate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  value: '',
  label: '',
  disabled: false,
  indeterminate: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean | string[]]
  change: [event: Event]
}>()

const inputRef = ref<HTMLInputElement>()

const isChecked = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(props.value)
  }
  return props.modelValue === true
})

function onChange(event: Event) {
  const target = event.target as HTMLInputElement

  if (Array.isArray(props.modelValue)) {
    const newValue = [...props.modelValue]
    if (target.checked) {
      newValue.push(props.value)
    } else {
      const index = newValue.indexOf(props.value)
      if (index > -1) {
        newValue.splice(index, 1)
      }
    }
    emit('update:modelValue', newValue)
  } else {
    emit('update:modelValue', target.checked)
  }

  emit('change', event)
}

watch(() => props.indeterminate, (value) => {
  if (inputRef.value) {
    inputRef.value.indeterminate = value
  }
}, { immediate: true })

defineExpose({ inputRef })
</script>

<template>
  <label
    class="form-check"
    :class="{ 'opacity-60 cursor-not-allowed': disabled }"
  >
    <input
      ref="inputRef"
      type="checkbox"
      :checked="isChecked"
      :value="value"
      :disabled="disabled"
      class="form-check-input"
      @change="onChange"
    >
    <span
      v-if="label || $slots.default"
      class="form-check-label"
    >
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>
