<script setup lang="ts">
import { required, min } from '~/utils/validators'
import type { SelectOption } from '~/components/base/BaseSelect.vue'
import type { Property } from '~/domain/types/property'

interface Props {
  properties: Property[]
  isSubmitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSubmitting: false,
})

const emit = defineEmits<{
  submit: [data: Record<string, any>]
  cancel: []
}>()

const { t } = useLocale()

const propertyOptions: SelectOption[] = props.properties.map(p => ({
  value: p.id,
  label: p.title,
}))

const { data, errors, getFieldProps, validate, handleInput, handleBlur } = useForm({
  initialData: {
    propertyId: '',
    tenantEmail: '',
    monthlyRent: 0,
    deposit: 0,
    startDate: '',
    endDate: '',
    paymentDayOfMonth: 1,
    specialTerms: '',
  },
  rules: {
    propertyId: required(t('leaseForm.errorSelectProperty')),
    tenantEmail: required(t('leaseForm.errorTenantEmail')),
    monthlyRent: [required(t('leaseForm.errorMonthlyRent')), min(1, t('leaseForm.errorRentPositive'))],
    deposit: required(t('leaseForm.errorDeposit')),
    startDate: required(t('leaseForm.errorStartDate')),
    endDate: required(t('leaseForm.errorEndDate')),
  },
})

function handleSubmit() {
  if (!validate()) return
  emit('submit', { ...data })
}
</script>

<template>
  <form
    class="space-y-4"
    @submit.prevent="handleSubmit"
  >
    <FormField
      :label="t('leaseForm.property')"
      :error="errors.propertyId"
      required
    >
      <BaseSelect
        :model-value="data.propertyId"
        :options="propertyOptions"
        :placeholder="t('leaseForm.selectProperty')"
        :error="errors.propertyId"
        @update:model-value="(v: any) => handleInput('propertyId', v)"
      />
    </FormField>

    <FormField
      :label="t('leaseForm.tenantEmail')"
      :error="errors.tenantEmail"
      required
    >
      <input
        v-bind="getFieldProps('tenantEmail')"
        type="email"
        class="form-control"
        :placeholder="t('leaseForm.tenantEmailPlaceholder')"
        :value="data.tenantEmail"
        @input="(e: Event) => handleInput('tenantEmail', (e.target as HTMLInputElement).value)"
        @blur="handleBlur('tenantEmail')"
      >
    </FormField>

    <div class="grid grid-cols-2 gap-4">
      <FormField
        :label="t('leaseForm.monthlyRent')"
        :error="errors.monthlyRent"
        required
      >
        <input
          type="number"
          class="form-control"
          placeholder="0"
          :value="data.monthlyRent"
          @input="(e: Event) => handleInput('monthlyRent', Number((e.target as HTMLInputElement).value))"
          @blur="handleBlur('monthlyRent')"
        >
      </FormField>

      <FormField
        :label="t('leaseForm.deposit')"
        :error="errors.deposit"
        required
      >
        <input
          type="number"
          class="form-control"
          placeholder="0"
          :value="data.deposit"
          @input="(e: Event) => handleInput('deposit', Number((e.target as HTMLInputElement).value))"
          @blur="handleBlur('deposit')"
        >
      </FormField>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <FormField
        :label="t('leaseForm.startDate')"
        :error="errors.startDate"
        required
      >
        <input
          type="date"
          class="form-control"
          :value="data.startDate"
          @input="(e: Event) => handleInput('startDate', (e.target as HTMLInputElement).value)"
          @blur="handleBlur('startDate')"
        >
      </FormField>

      <FormField
        :label="t('leaseForm.endDate')"
        :error="errors.endDate"
        required
      >
        <input
          type="date"
          class="form-control"
          :value="data.endDate"
          @input="(e: Event) => handleInput('endDate', (e.target as HTMLInputElement).value)"
          @blur="handleBlur('endDate')"
        >
      </FormField>
    </div>

    <FormField :label="t('leaseForm.paymentDay')">
      <BaseSelect
        :model-value="data.paymentDayOfMonth"
        :options="Array.from({ length: 28 }, (_, i) => ({ value: i + 1, label: t('leaseForm.dayOfMonth', { day: i + 1 }) }))"
        @update:model-value="(v: any) => handleInput('paymentDayOfMonth', Number(v))"
      />
    </FormField>

    <FormField :label="t('leaseForm.specialTerms')">
      <textarea
        class="form-control"
        rows="3"
        :placeholder="t('leaseForm.specialTermsPlaceholder')"
        :value="data.specialTerms"
        @input="(e: Event) => handleInput('specialTerms', (e.target as HTMLTextAreaElement).value)"
      />
    </FormField>

    <div class="flex justify-end gap-3 pt-2">
      <button
        type="button"
        class="btn btn-secondary"
        @click="emit('cancel')"
      >
        {{ t('leaseForm.cancel') }}
      </button>
      <button
        type="submit"
        class="btn btn-primary"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? t('leaseForm.creating') : t('leaseForm.createLease') }}
      </button>
    </div>
  </form>
</template>
