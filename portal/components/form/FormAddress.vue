<script setup lang="ts">
export interface Address {
  country: string | null
  province: string | null
  city: string | null
  town: string | null
  district: string | null
  street: string | null
}

export interface LocationOption {
  value: string
  label: string
}

export interface LocationData {
  countries: LocationOption[]
  provinces: Record<string, LocationOption[]>
  cities: Record<string, LocationOption[]>
  towns: Record<string, LocationOption[]>
  districts: Record<string, LocationOption[]>
}

interface Props {
  modelValue: Address
  locationData?: LocationData
  disabled?: boolean
  readonly?: boolean
  errors?: Partial<Record<keyof Address, string>>
  size?: 'sm' | 'md' | 'lg'
  showLabels?: boolean
  compact?: boolean
}

const defaultLocationData: LocationData = {
  countries: [
    { value: 'CD', label: 'RD Congo' },
    { value: 'CG', label: 'Congo' },
    { value: 'RW', label: 'Rwanda' },
    { value: 'BI', label: 'Burundi' },
    { value: 'UG', label: 'Ouganda' },
  ],
  provinces: {
    CD: [
      { value: 'KN', label: 'Kinshasa' },
      { value: 'NK', label: 'Nord-Kivu' },
      { value: 'SK', label: 'Sud-Kivu' },
      { value: 'KT', label: 'Katanga' },
      { value: 'EQ', label: 'Equateur' },
      { value: 'BC', label: 'Bas-Congo' },
      { value: 'BN', label: 'Bandundu' },
      { value: 'KO', label: 'Kasai-Oriental' },
      { value: 'KW', label: 'Kasai-Occidental' },
      { value: 'MN', label: 'Maniema' },
      { value: 'OR', label: 'Province Orientale' },
    ],
    CG: [
      { value: 'BZ', label: 'Brazzaville' },
      { value: 'PN', label: 'Pointe-Noire' },
    ],
    RW: [
      { value: 'KG', label: 'Kigali' },
    ],
    BI: [
      { value: 'BJ', label: 'Bujumbura' },
    ],
    UG: [
      { value: 'KP', label: 'Kampala' },
    ],
  },
  cities: {
    KN: [
      { value: 'KIN', label: 'Kinshasa' },
    ],
    NK: [
      { value: 'GOM', label: 'Goma' },
      { value: 'BNI', label: 'Beni' },
      { value: 'BTM', label: 'Butembo' },
    ],
    SK: [
      { value: 'BKV', label: 'Bukavu' },
      { value: 'UVR', label: 'Uvira' },
    ],
    KT: [
      { value: 'LUB', label: 'Lubumbashi' },
      { value: 'KLW', label: 'Kolwezi' },
    ],
  },
  towns: {
    GOM: [
      { value: 'GOM-C', label: 'Goma Centre' },
      { value: 'HIM', label: 'Himbi' },
      { value: 'KAT', label: 'Katindo' },
      { value: 'KYE', label: 'Kyeshero' },
    ],
    BKV: [
      { value: 'BKV-C', label: 'Bukavu Centre' },
      { value: 'IBN', label: 'Ibanda' },
      { value: 'KAD', label: 'Kadutu' },
      { value: 'BGR', label: 'Bagira' },
    ],
    KIN: [
      { value: 'GLB', label: 'Gombe' },
      { value: 'LIM', label: 'Limete' },
      { value: 'NGL', label: 'Ngaliema' },
      { value: 'KSA', label: 'Kasa-Vubu' },
    ],
  },
  districts: {
    'GOM-C': [
      { value: 'D1', label: 'Quartier 1' },
      { value: 'D2', label: 'Quartier 2' },
    ],
    HIM: [
      { value: 'HIM1', label: 'Himbi 1' },
      { value: 'HIM2', label: 'Himbi 2' },
    ],
  },
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  readonly: false,
  size: 'md',
  showLabels: true,
  compact: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: Address]
}>()

const locationData = computed(() => props.locationData || defaultLocationData)

const availableProvinces = computed(() => {
  if (!props.modelValue.country) return []
  return locationData.value.provinces[props.modelValue.country] || []
})

const availableCities = computed(() => {
  if (!props.modelValue.province) return []
  return locationData.value.cities[props.modelValue.province] || []
})

const availableTowns = computed(() => {
  if (!props.modelValue.city) return []
  return locationData.value.towns[props.modelValue.city] || []
})

const availableDistricts = computed(() => {
  if (!props.modelValue.town) return []
  return locationData.value.districts[props.modelValue.town] || []
})

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-4 py-3 text-base',
}

function getSelectClasses(field: keyof Address) {
  const error = props.errors?.[field]
  return [
    'block w-full rounded border appearance-none bg-white transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    'bg-no-repeat bg-right pr-10',
    sizeClasses[props.size],
    error
      ? 'border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 text-gray-900 focus:border-primary-500 focus:ring-primary-500',
    props.disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'cursor-pointer',
  ]
}

function getInputClasses(field: keyof Address) {
  const error = props.errors?.[field]
  return [
    'block w-full rounded border transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    sizeClasses[props.size],
    error
      ? 'border-red-500 text-red-900 placeholder-red-400 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500',
    props.disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white',
    props.readonly ? 'bg-gray-50' : '',
  ]
}

function updateField(field: keyof Address, value: string | null) {
  const newAddress = { ...props.modelValue }
  newAddress[field] = value || null

  if (field === 'country') {
    newAddress.province = null
    newAddress.city = null
    newAddress.town = null
    newAddress.district = null
  } else if (field === 'province') {
    newAddress.city = null
    newAddress.town = null
    newAddress.district = null
  } else if (field === 'city') {
    newAddress.town = null
    newAddress.district = null
  } else if (field === 'town') {
    newAddress.district = null
  }

  emit('update:modelValue', newAddress)
}

function handleSelectChange(field: keyof Address, event: Event) {
  const target = event.target as HTMLSelectElement
  updateField(field, target.value || null)
}

function handleInputChange(field: keyof Address, event: Event) {
  const target = event.target as HTMLInputElement
  updateField(field, target.value || null)
}

const { t } = useLocale()
</script>

<template>
  <div class="w-full space-y-4">
    <div :class="compact ? 'grid grid-cols-2 gap-2' : 'space-y-4'">
      <div>
        <label
          v-if="showLabels"
          class="block text-sm font-medium text-gray-900 mb-1.5"
        >
          {{ t('form.addressCountry') }}
        </label>
        <div class="relative">
          <select
            :value="modelValue.country || ''"
            :disabled="disabled"
            :class="getSelectClasses('country')"
            @change="handleSelectChange('country', $event)"
          >
            <option value="">
              {{ t('form.addressSelectCountry') }}
            </option>
            <option
              v-for="country in locationData.countries"
              :key="country.value"
              :value="country.value"
            >
              {{ country.label }}
            </option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              class="h-5 w-5 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>
        <p
          v-if="errors?.country"
          class="mt-1.5 text-xs text-red-500"
        >
          {{ errors.country }}
        </p>
      </div>

      <div>
        <label
          v-if="showLabels"
          class="block text-sm font-medium text-gray-900 mb-1.5"
        >
          {{ t('form.addressProvince') }}
        </label>
        <div class="relative">
          <select
            :value="modelValue.province || ''"
            :disabled="disabled || !modelValue.country"
            :class="getSelectClasses('province')"
            @change="handleSelectChange('province', $event)"
          >
            <option value="">
              {{ t('form.addressSelectProvince') }}
            </option>
            <option
              v-for="province in availableProvinces"
              :key="province.value"
              :value="province.value"
            >
              {{ province.label }}
            </option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              class="h-5 w-5 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>
        <p
          v-if="errors?.province"
          class="mt-1.5 text-xs text-red-500"
        >
          {{ errors.province }}
        </p>
      </div>
    </div>

    <div :class="compact ? 'grid grid-cols-2 gap-2' : 'space-y-4'">
      <div>
        <label
          v-if="showLabels"
          class="block text-sm font-medium text-gray-900 mb-1.5"
        >
          {{ t('form.addressCity') }}
        </label>
        <div class="relative">
          <select
            :value="modelValue.city || ''"
            :disabled="disabled || !modelValue.province"
            :class="getSelectClasses('city')"
            @change="handleSelectChange('city', $event)"
          >
            <option value="">
              {{ t('form.addressSelectCity') }}
            </option>
            <option
              v-for="city in availableCities"
              :key="city.value"
              :value="city.value"
            >
              {{ city.label }}
            </option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              class="h-5 w-5 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>
        <p
          v-if="errors?.city"
          class="mt-1.5 text-xs text-red-500"
        >
          {{ errors.city }}
        </p>
      </div>

      <div>
        <label
          v-if="showLabels"
          class="block text-sm font-medium text-gray-900 mb-1.5"
        >
          {{ t('form.addressTown') }}
        </label>
        <div class="relative">
          <select
            :value="modelValue.town || ''"
            :disabled="disabled || !modelValue.city"
            :class="getSelectClasses('town')"
            @change="handleSelectChange('town', $event)"
          >
            <option value="">
              {{ t('form.addressSelectTown') }}
            </option>
            <option
              v-for="town in availableTowns"
              :key="town.value"
              :value="town.value"
            >
              {{ town.label }}
            </option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              class="h-5 w-5 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>
        <p
          v-if="errors?.town"
          class="mt-1.5 text-xs text-red-500"
        >
          {{ errors.town }}
        </p>
      </div>
    </div>

    <div :class="compact ? 'grid grid-cols-2 gap-2' : 'space-y-4'">
      <div>
        <label
          v-if="showLabels"
          class="block text-sm font-medium text-gray-900 mb-1.5"
        >
          {{ t('form.addressDistrict') }}
        </label>
        <div class="relative">
          <select
            v-if="availableDistricts.length > 0"
            :value="modelValue.district || ''"
            :disabled="disabled || !modelValue.town"
            :class="getSelectClasses('district')"
            @change="handleSelectChange('district', $event)"
          >
            <option value="">
              {{ t('form.addressSelectDistrict') }}
            </option>
            <option
              v-for="district in availableDistricts"
              :key="district.value"
              :value="district.value"
            >
              {{ district.label }}
            </option>
          </select>
          <input
            v-else
            type="text"
            :value="modelValue.district || ''"
            :disabled="disabled || !modelValue.town"
            :readonly="readonly"
            :class="getInputClasses('district')"
            :placeholder="t('form.addressDistrictName')"
            @input="handleInputChange('district', $event)"
          >
          <div
            v-if="availableDistricts.length > 0"
            class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
          >
            <svg
              class="h-5 w-5 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>
        <p
          v-if="errors?.district"
          class="mt-1.5 text-xs text-red-500"
        >
          {{ errors.district }}
        </p>
      </div>

      <div>
        <label
          v-if="showLabels"
          class="block text-sm font-medium text-gray-900 mb-1.5"
        >
          {{ t('form.addressStreet') }}
        </label>
        <input
          type="text"
          :value="modelValue.street || ''"
          :disabled="disabled"
          :readonly="readonly"
          :class="getInputClasses('street')"
          :placeholder="t('form.addressStreetPlaceholder')"
          @input="handleInputChange('street', $event)"
        >
        <p
          v-if="errors?.street"
          class="mt-1.5 text-xs text-red-500"
        >
          {{ errors.street }}
        </p>
      </div>
    </div>
  </div>
</template>
