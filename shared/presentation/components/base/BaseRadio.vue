<script setup lang="ts">
interface Props {
  modelValue?: string | number | boolean
  value: string | number | boolean
  name?: string
  label?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  name: '',
  label: '',
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | boolean]
  change: [event: Event]
}>()

const inputRef = ref<HTMLInputElement>()

const isChecked = computed(() => props.modelValue === props.value)

function onChange(event: Event) {
  emit('update:modelValue', props.value)
  emit('change', event)
}

defineExpose({ inputRef })
</script>

<template>
  <label
    class="form-check"
    :class="{ 'opacity-60 cursor-not-allowed': disabled }"
  >
    <input
      ref="inputRef"
      type="radio"
      :checked="isChecked"
      :value="value"
      :name="name"
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
