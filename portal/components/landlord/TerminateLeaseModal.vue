<script setup lang="ts">
import type { Lease } from '~/domain/types/user'

interface Props {
  modelValue: boolean
  lease: Lease | null
  isSubmitting?: boolean
}

withDefaults(defineProps<Props>(), {
  isSubmitting: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [reason: string]
}>()

const { t } = useLocale()

const reason = ref('')
const error = ref('')

function handleConfirm() {
  if (!reason.value.trim()) {
    error.value = t('landlord.terminationReasonError')
    return
  }
  error.value = ''
  emit('confirm', reason.value)
}

function handleClose() {
  reason.value = ''
  error.value = ''
  emit('update:modelValue', false)
}
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    :title="t('landlord.terminateLease')"
    size="md"
    @update:model-value="handleClose"
  >
    <div class="space-y-4">
      <div
        v-if="lease"
        class="p-3 bg-red-50 border border-red-200 rounded"
      >
        <p class="text-sm font-medium text-red-800">
          {{ t('landlord.terminateWarning') }}
        </p>
        <p class="text-sm text-red-700 mt-1">
          {{ lease.propertyTitle }} - {{ lease.tenantName }}
        </p>
      </div>

      <FormField
        :label="t('landlord.terminationReason')"
        :error="error"
        required
      >
        <textarea
          v-model="reason"
          class="form-control"
          rows="4"
          :placeholder="t('landlord.terminationPlaceholder')"
        />
      </FormField>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <button
          type="button"
          class="btn btn-secondary"
          @click="handleClose"
        >
          {{ t('ui.cancel') }}
        </button>
        <button
          type="button"
          class="btn btn-danger"
          :disabled="isSubmitting"
          @click="handleConfirm"
        >
          {{ isSubmitting ? t('landlord.terminating') : t('landlord.confirmTermination') }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>
