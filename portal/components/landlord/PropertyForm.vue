<script setup lang="ts">
import {
  HomeModernIcon,
  BuildingOfficeIcon,
  MapIcon,
  SparklesIcon,
  TruckIcon,
  CheckIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  KeyIcon,
  BanknotesIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  PencilSquareIcon,
  DocumentTextIcon,
  HashtagIcon,
  MapPinIcon,
  TagIcon,
  CalendarIcon,
  SwatchIcon,
  UserGroupIcon,
} from '@heroicons/vue/24/outline'
import type { UploadedImage } from '~/components/form/FormImageUpload.vue'
import { propertiesApi } from '~shared/infrastructure/api/properties'
import { geographyApi } from '~shared/infrastructure/api/geography'
import type { Country, Province, City, Town } from '~shared/domain/types/property'

const props = withDefaults(defineProps<{
  mode: 'create' | 'edit'
  propertyId?: string
}>(), {
  propertyId: undefined,
})

const toast = useToast()
const { t } = useLocale()

const currentStep = ref(1)
const isLoading = ref(false)
const isSaving = ref(false)
const showCancelModal = ref(false)
const detectedCountry = ref<string | null>(null)

// Form data
const form = reactive({
  // Step 1: Type & Info
  type: '',
  title: '',
  description: '',
  listingType: 'for_rent',
  salePrice: null as number | null,
  // Step 2: Characteristics (dynamic per type)
  bedrooms: null as number | null,
  bathrooms: null as number | null,
  squareMeters: null as number | null,
  floor: null as number | null,
  hasElevator: false,
  hasBalcony: false,
  hasParking: false,
  floors: null as number | null,
  hasGarden: false,
  hasPool: false,
  hasGarage: false,
  landSquareMeters: null as number | null,
  houseSquareMeters: null as number | null,
  isFurnished: false,
  landType: '',
  hasWaterAccess: false,
  hasElectricityAccess: false,
  isFenced: false,
  hasBuildingPermit: false,
  capacity: null as number | null,
  hasSoundSystem: false,
  hasVideoProjector: false,
  hasKitchen: false,
  hasOutdoorSpace: false,
  brand: '',
  model: '',
  year: null as number | null,
  licensePlate: '',
  seats: null as number | null,
  fuelType: '',
  transmission: '',
  mileage: null as number | null,
  color: '',
  withDriver: false,
  // Step 3: Location & Price
  countryId: '',
  provinceId: '',
  cityId: '',
  townId: '',
  street: '',
  latitude: null as number | null,
  longitude: null as number | null,
  pricePerMonth: null as number | null,
  pricePerDay: null as number | null,
})

const photos = ref<UploadedImage[]>([])
const errors = reactive<Record<string, string>>({})

// LocalStorage persistence
const STORAGE_KEY = computed(() =>
  props.mode === 'edit' && props.propertyId
    ? `futela_property_edit_draft_${props.propertyId}`
    : 'futela_property_create_draft'
)

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function base64ToFile(base64: string, name: string, type: string): File {
  const [, data] = base64.split(',')
  const bytes = atob(data)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  return new File([arr], name, { type })
}

async function saveDraft() {
  if (typeof localStorage === 'undefined') return
  const serializedPhotos = await Promise.all(
    photos.value.map(async (p) => ({
      id: p.id,
      name: p.name,
      size: p.size,
      type: p.type,
      status: p.status,
      base64: await fileToBase64(p.file),
    }))
  )
  localStorage.setItem(STORAGE_KEY.value, JSON.stringify({
    form: { ...form },
    step: currentStep.value,
    photos: serializedPhotos,
  }))
}

function loadDraft(): boolean {
  if (typeof localStorage === 'undefined') return false
  const saved = localStorage.getItem(STORAGE_KEY.value)
  if (saved) {
    try {
      const { form: savedForm, step, photos: savedPhotos } = JSON.parse(saved)
      Object.assign(form, savedForm)
      currentStep.value = step ?? 1
      if (savedPhotos?.length) {
        photos.value = savedPhotos.map((p: any) => {
          const file = base64ToFile(p.base64, p.name, p.type)
          return {
            id: p.id,
            name: p.name,
            size: p.size,
            type: p.type,
            file,
            preview: p.base64,
            status: p.status ?? 'pending',
          } as UploadedImage
        })
      }
      return true
    } catch { /* ignore corrupt data */ }
  }
  return false
}

function clearDraft() {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(STORAGE_KEY.value)
}

// Save on every change
watch([() => ({ ...form }), currentStep, photos], () => saveDraft(), { deep: true })

// Reference data
const countries = ref<Country[]>([])
const provinces = ref<Province[]>([])
const cities = ref<City[]>([])
const towns = ref<Town[]>([])

const propertyTypes = computed(() => [
  { value: 'apartment', label: t('propertyForm.typeApartment'), icon: BuildingOfficeIcon },
  { value: 'house', label: t('propertyForm.typeHouse'), icon: HomeModernIcon },
  { value: 'land', label: t('propertyForm.typeLand'), icon: MapIcon },
  { value: 'event_hall', label: t('propertyForm.typeEventHall'), icon: SparklesIcon },
  { value: 'car', label: t('propertyForm.typeCar'), icon: TruckIcon },
])

const listingTypeOptions = computed(() => [
  { value: 'for_rent', label: t('propertyForm.forRent'), icon: KeyIcon },
  { value: 'for_sale', label: t('propertyForm.forSale'), icon: BanknotesIcon },
])

const countryOptions = computed(() => countries.value.map(c => ({ value: c.id, label: c.name })))
const provinceOptions = computed(() => provinces.value.map(p => ({ value: p.id, label: p.name })))
const cityOptions = computed(() => cities.value.map(c => ({ value: c.id, label: c.name })))
const townOptions = computed(() => towns.value.map(t => ({ value: t.id, label: t.name })))

const fuelTypeOptions = computed(() => [
  { value: 'gasoline', label: t('propertyForm.fuelGasoline') },
  { value: 'diesel', label: t('propertyForm.fuelDiesel') },
  { value: 'electric', label: t('propertyForm.fuelElectric') },
  { value: 'hybrid', label: t('propertyForm.fuelHybrid') },
])

const transmissionOptions = computed(() => [
  { value: 'manual', label: t('propertyForm.transmissionManual') },
  { value: 'automatic', label: t('propertyForm.transmissionAutomatic') },
])

const landTypeOptions = computed(() => [
  { value: 'residential', label: t('propertyForm.landResidential') },
  { value: 'commercial', label: t('propertyForm.landCommercial') },
  { value: 'agricultural', label: t('propertyForm.landAgricultural') },
  { value: 'industrial', label: t('propertyForm.landIndustrial') },
])

const steps = computed(() => [
  { number: 1, label: t('propertyForm.stepType') },
  { number: 2, label: t('propertyForm.stepCharacteristics') },
  { number: 3, label: t('propertyForm.stepLocation') },
  { number: 4, label: t('propertyForm.stepSummary') },
])

// Cascading selects
watch(() => form.countryId, async (countryId) => {
  form.provinceId = ''
  form.cityId = ''
  form.townId = ''
  provinces.value = []
  cities.value = []
  towns.value = []
  if (countryId) {
    provinces.value = await geographyApi.getProvinces({ countryId })
  }
})

watch(() => form.provinceId, async (provinceId) => {
  form.cityId = ''
  form.townId = ''
  cities.value = []
  towns.value = []
  if (provinceId) {
    cities.value = await geographyApi.getCities({ provinceId })
  }
})

watch(() => form.cityId, async (cityId) => {
  form.townId = ''
  towns.value = []
  if (cityId) {
    towns.value = await geographyApi.getTowns({ cityId })
  }
})

function validateStep(step: number): boolean {
  const newErrors: Record<string, string> = {}

  if (step === 1) {
    if (!form.type) newErrors.type = t('propertyForm.errorSelectType')
    if (form.title.trim().length < 5) newErrors.title = t('propertyForm.errorTitleMin')
    if (form.description.trim().length < 5) newErrors.description = t('propertyForm.errorDescriptionMin')
  }

  if (step === 2) {
    if (form.type === 'apartment') {
      if (!form.bedrooms) newErrors.bedrooms = t('propertyForm.errorBedroomsRequired')
      if (!form.bathrooms) newErrors.bathrooms = t('propertyForm.errorBathroomsRequired')
    } else if (form.type === 'house') {
      if (!form.bedrooms) newErrors.bedrooms = t('propertyForm.errorBedroomsRequired')
      if (!form.bathrooms) newErrors.bathrooms = t('propertyForm.errorBathroomsRequired')
    } else if (form.type === 'land') {
      if (!form.squareMeters) newErrors.squareMeters = t('propertyForm.errorSquareMetersRequired')
    } else if (form.type === 'event_hall') {
      if (!form.capacity) newErrors.capacity = t('propertyForm.errorCapacityRequired')
    } else if (form.type === 'car') {
      if (!form.brand) newErrors.brand = t('propertyForm.errorBrandRequired')
      if (!form.model) newErrors.model = t('propertyForm.errorModelRequired')
      if (!form.year) newErrors.year = t('propertyForm.errorYearRequired')
      if (!form.seats) newErrors.seats = t('propertyForm.errorSeatsRequired')
      if (!form.fuelType) newErrors.fuelType = t('propertyForm.errorFuelTypeRequired')
      if (!form.transmission) newErrors.transmission = t('propertyForm.errorTransmissionRequired')
    }
  }

  if (step === 3) {
    if (!form.townId) newErrors.townId = t('propertyForm.errorAddressRequired')
    if (!form.pricePerMonth && !form.pricePerDay) {
      newErrors.price = t('propertyForm.errorPriceRequired')
    }
  }

  Object.keys(errors).forEach(k => delete errors[k])
  Object.assign(errors, newErrors)
  return Object.keys(newErrors).length === 0
}

const isStepValid = computed(() => {
  switch (currentStep.value) {
    case 1: return !!form.type && form.title.trim().length >= 5 && form.description.trim().length >= 5
    case 2: {
      if (form.type === 'apartment' || form.type === 'house') return !!form.bedrooms && !!form.bathrooms
      if (form.type === 'land') return !!form.squareMeters
      if (form.type === 'event_hall') return !!form.capacity
      if (form.type === 'car') return !!form.brand && !!form.model && !!form.year && !!form.seats && !!form.fuelType && !!form.transmission
      return true
    }
    case 3: return !!form.townId && !!(form.pricePerMonth || form.pricePerDay)
    default: return true
  }
})

// Clear errors reactively as user types
watch(() => form.title, () => { if (form.title.trim().length >= 5) delete errors.title })
watch(() => form.description, () => { if (form.description.trim().length >= 5) delete errors.description })
watch(() => form.type, () => { if (form.type) delete errors.type })
watch(() => form.bedrooms, () => { if (form.bedrooms) delete errors.bedrooms })
watch(() => form.bathrooms, () => { if (form.bathrooms) delete errors.bathrooms })
watch(() => form.squareMeters, () => { if (form.squareMeters) delete errors.squareMeters })
watch(() => form.capacity, () => { if (form.capacity) delete errors.capacity })
watch(() => form.brand, () => { if (form.brand) delete errors.brand })
watch(() => form.model, () => { if (form.model) delete errors.model })
watch(() => form.year, () => { if (form.year) delete errors.year })
watch(() => form.seats, () => { if (form.seats) delete errors.seats })
watch(() => form.fuelType, () => { if (form.fuelType) delete errors.fuelType })
watch(() => form.transmission, () => { if (form.transmission) delete errors.transmission })
watch(() => form.townId, () => { if (form.townId) delete errors.townId })

function nextStep() {
  if (!validateStep(currentStep.value)) return
  if (currentStep.value < 4) currentStep.value++
}

function prevStep() {
  if (currentStep.value > 1) currentStep.value--
}

function goToStep(step: number) {
  if (step < currentStep.value) {
    currentStep.value = step
  }
}

function buildPayload(): Record<string, any> {
  const payload: Record<string, any> = {
    type: form.type,
    title: form.title,
    description: form.description,
    listingType: form.listingType,
    salePrice: form.listingType === 'for_sale' ? form.salePrice : null,
    pricePerMonth: form.pricePerMonth,
    pricePerDay: form.pricePerDay,
  }

  if (form.townId) {
    payload.address = {
      townId: form.townId,
      street: form.street || null,
      latitude: form.latitude,
      longitude: form.longitude,
    }
  }

  if (form.type === 'apartment') {
    Object.assign(payload, {
      bedrooms: form.bedrooms, bathrooms: form.bathrooms, squareMeters: form.squareMeters,
      floor: form.floor, hasElevator: form.hasElevator, hasBalcony: form.hasBalcony, hasParking: form.hasParking,
    })
  } else if (form.type === 'house') {
    Object.assign(payload, {
      bedrooms: form.bedrooms, bathrooms: form.bathrooms, floors: form.floors,
      hasGarden: form.hasGarden, hasPool: form.hasPool, hasGarage: form.hasGarage,
      landSquareMeters: form.landSquareMeters, houseSquareMeters: form.houseSquareMeters, isFurnished: form.isFurnished,
    })
  } else if (form.type === 'land') {
    Object.assign(payload, {
      squareMeters: form.squareMeters, landType: form.landType || null,
      hasWaterAccess: form.hasWaterAccess, hasElectricityAccess: form.hasElectricityAccess,
      isFenced: form.isFenced, hasBuildingPermit: form.hasBuildingPermit,
    })
  } else if (form.type === 'event_hall') {
    Object.assign(payload, {
      squareMeters: form.squareMeters, capacity: form.capacity,
      hasSoundSystem: form.hasSoundSystem, hasVideoProjector: form.hasVideoProjector,
      hasKitchen: form.hasKitchen, hasOutdoorSpace: form.hasOutdoorSpace,
    })
  } else if (form.type === 'car') {
    Object.assign(payload, {
      brand: form.brand || null, model: form.model || null, year: form.year,
      licensePlate: form.licensePlate || null, seats: form.seats, fuelType: form.fuelType || null,
      transmission: form.transmission || null, mileage: form.mileage, color: form.color || null,
      withDriver: form.withDriver,
    })
  }

  return payload
}

async function handleSubmit() {
  // Prevent double-submit
  if (isSaving.value) return

  // Validate all steps before submitting
  if (!validateStep(1)) { currentStep.value = 1; toast.error(t('propertyForm.fixErrors')); return }
  if (!validateStep(2)) { currentStep.value = 2; toast.error(t('propertyForm.fixErrors')); return }
  if (!validateStep(3)) { currentStep.value = 3; toast.error(t('propertyForm.fixErrors')); return }

  isSaving.value = true
  // Clear draft immediately to prevent re-submission on page reload
  clearDraft()
  try {
    const payload = buildPayload()

    if (props.mode === 'edit' && props.propertyId) {
      await propertiesApi.update(props.propertyId, payload)
    } else {
      const property = await propertiesApi.create(payload)

      // Upload photos for new property
      if (photos.value.length > 0) {
        const formData = new FormData()
        for (const photo of photos.value) {
          if (photo.file) {
            formData.append('photos[]', photo.file)
          }
        }
        if (formData.has('photos[]')) {
          await propertiesApi.uploadPhoto(property.id, formData)
        }
      }
    }

    toast.success(props.mode === 'edit' ? t('propertyForm.editSuccess') : t('propertyForm.createSuccess'))
    navigateTo('/dashboard/landlord/properties')
  } catch (err: any) {
    const message = err?.data?.error?.message || err?.data?.detail || err?.message || t('propertyForm.saveError')
    toast.error(message)
  } finally {
    isSaving.value = false
  }
}

const cancelRedirect = computed(() =>
  props.mode === 'edit' && props.propertyId
    ? `/dashboard/landlord/properties/${props.propertyId}`
    : '/dashboard/landlord/properties'
)

function confirmCancel() {
  clearDraft()
  showCancelModal.value = false
  navigateTo(cancelRedirect.value)
}

function getTypeLabel(type: string): string {
  return propertyTypes.value.find(pt => pt.value === type)?.label ?? type
}

function formatPrice(value: number | null): string {
  if (!value) return '-'
  return new Intl.NumberFormat('fr-FR').format(value) + ' USD'
}

async function reverseGeolocate(lat: number, lon: number): Promise<string | null> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=fr`, {
      headers: { 'User-Agent': 'Futela/1.0' },
    })
    const data = await res.json()
    const addr = data?.address
    if (!addr) return null

    const countryName = addr.country
    const stateName = addr.state
    const cityName = addr.city || addr.town || addr.village

    // Auto-select country
    if (countryName && countries.value.length) {
      const match = countries.value.find(c => c.name.toLowerCase() === countryName.toLowerCase())
      if (match) {
        form.countryId = match.id
        // Wait for provinces to load then match
        await nextTick()
        setTimeout(async () => {
          if (stateName && provinces.value.length) {
            const provMatch = provinces.value.find(p => p.name.toLowerCase() === stateName.toLowerCase())
            if (provMatch) {
              form.provinceId = provMatch.id
              await nextTick()
              setTimeout(() => {
                if (cityName && cities.value.length) {
                  const cityMatch = cities.value.find(c => c.name.toLowerCase() === cityName.toLowerCase())
                  if (cityMatch) form.cityId = cityMatch.id
                }
              }, 500)
            }
          }
        }, 500)
      }
    }

    // Build display label
    const parts = [cityName, stateName, countryName].filter(Boolean)
    return parts.join(', ')
  } catch {
    return null
  }
}

function getUserLocation() {
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        form.latitude = position.coords.latitude
        form.longitude = position.coords.longitude
        const country = await reverseGeolocate(position.coords.latitude, position.coords.longitude)
        detectedCountry.value = country
        toast.success(t('propertyForm.positionUpdated'))
      },
      () => { toast.error(t('propertyForm.positionError')) }
    )
  }
}

const headerTitle = computed(() => {
  if (currentStep.value > 1 && form.type) return getTypeLabel(form.type)
  return props.mode === 'edit' ? t('propertyForm.editProperty') : t('propertyForm.addProperty')
})

const headerSubtitle = computed(() =>
  props.mode === 'edit'
    ? t('propertyForm.editSubtitle')
    : t('propertyForm.addSubtitle')
)

// Fetch reference data
;(async () => {
  isLoading.value = true
  try {
    const ctries = await geographyApi.getCountries()
    countries.value = Array.isArray(ctries) ? ctries : (ctries as any).data ?? []

    if (props.mode === 'edit' && props.propertyId) {
      // Try draft first, fallback to API
      if (!loadDraft()) {
        const property = await propertiesApi.get(props.propertyId)
        form.type = property.type
        form.title = property.title
        form.description = property.description
        form.listingType = property.listingType ?? 'for_rent'
        form.salePrice = property.salePrice ?? null
        form.pricePerMonth = property.pricePerMonth
        form.pricePerDay = property.pricePerDay
        form.bedrooms = property.bedrooms ?? null
        form.bathrooms = property.bathrooms ?? null
        form.squareMeters = property.squareMeters ?? null
        form.floor = property.floor ?? null
        form.hasElevator = property.hasElevator ?? false
        form.hasBalcony = property.hasBalcony ?? false
        form.hasParking = property.hasParking ?? false
        form.floors = property.floors ?? null
        form.hasGarden = property.hasGarden ?? false
        form.hasPool = property.hasPool ?? false
        form.hasGarage = property.hasGarage ?? false
        form.landSquareMeters = property.landSquareMeters ?? null
        form.houseSquareMeters = property.houseSquareMeters ?? null
        form.isFurnished = property.isFurnished ?? false
        form.landType = property.landType ?? ''
        form.hasWaterAccess = property.hasWaterAccess ?? false
        form.hasElectricityAccess = property.hasElectricityAccess ?? false
        form.isFenced = property.isFenced ?? false
        form.hasBuildingPermit = property.hasBuildingPermit ?? false
        form.capacity = property.capacity ?? null
        form.hasSoundSystem = property.hasSoundSystem ?? false
        form.hasVideoProjector = property.hasVideoProjector ?? false
        form.hasKitchen = property.hasKitchen ?? false
        form.hasOutdoorSpace = property.hasOutdoorSpace ?? false
        form.brand = property.brand ?? ''
        form.model = property.model ?? ''
        form.year = property.year ?? null
        form.licensePlate = property.licensePlate ?? ''
        form.seats = property.seats ?? null
        form.fuelType = property.fuelType ?? ''
        form.transmission = property.transmission ?? ''
        form.mileage = property.mileage ?? null
        form.color = property.color ?? ''
        form.withDriver = property.withDriver ?? false
        form.street = property.address?.street ?? ''
      }
    } else {
      loadDraft()
    }

    getUserLocation()
  } catch (err) {
    toast.error(t('propertyForm.loadError'))
  } finally {
    isLoading.value = false
  }
})()
</script>

<template>
  <div class="space-y-1">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <button
        class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
        @click="showCancelModal = true"
      >
        <ArrowLeftIcon class="h-5 w-5" />
      </button>
      <div>
        <h1 class="text-xl font-bold" :class="currentStep > 1 && form.type ? 'text-blue-600' : 'text-gray-900'">
          {{ headerTitle }}
        </h1>
        <p class="text-sm text-gray-500">
          {{ headerSubtitle }}
        </p>
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="isLoading"
      class="bg-white rounded border border-gray-200 p-8"
    >
      <div class="flex items-center justify-center gap-3">
        <div class="h-5 w-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <span class="text-sm text-gray-500">{{ t('propertyForm.loading') }}</span>
      </div>
    </div>

    <template v-else>
      <!-- Step Indicator -->
      <div class="bg-white rounded border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div
            v-for="(step, index) in steps"
            :key="step.number"
            class="flex items-center"
            :class="{ 'flex-1': index < steps.length - 1 }"
          >
            <button
              class="flex items-center gap-2"
              :class="currentStep >= step.number ? 'cursor-pointer' : 'cursor-default'"
              @click="goToStep(step.number)"
            >
              <div
                class="h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors"
                :class="
                  currentStep > step.number
                    ? 'bg-green-100 text-green-700'
                    : currentStep === step.number
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-400'
                "
              >
                <CheckIcon
                  v-if="currentStep > step.number"
                  class="h-4 w-4"
                />
                <span v-else>{{ step.number }}</span>
              </div>
              <span
                class="text-sm hidden sm:inline"
                :class="currentStep >= step.number ? 'text-gray-900 font-medium' : 'text-gray-400'"
              >
                {{ step.label }}
              </span>
            </button>
            <div
              v-if="index < steps.length - 1"
              class="flex-1 h-px mx-4"
              :class="currentStep > step.number ? 'bg-green-300' : 'bg-gray-200'"
            />
          </div>
        </div>
      </div>

      <!-- Step Content -->
      <div class="bg-white rounded border border-gray-200 p-4">
        <!-- Step 1: Type & Info -->
        <div v-show="currentStep === 1">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">{{ t('propertyForm.sectionTypeInfo') }}</h2>

          <!-- Type Selection -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-900 mb-2">
              {{ t('propertyForm.propertyTypeLabel') }} <span class="text-red-500">*</span>
            </label>
            <div class="grid grid-cols-3 sm:grid-cols-5 gap-2">
              <button
                v-for="ptype in propertyTypes"
                :key="ptype.value"
                type="button"
                class="flex flex-col items-center gap-1 p-2 rounded border-2 transition-all"
                :class="
                  form.type === ptype.value
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                "
                @click="form.type = ptype.value"
              >
                <component :is="ptype.icon" class="h-5 w-5" />
                <span class="text-xs font-medium">{{ ptype.label }}</span>
              </button>
            </div>
            <p v-if="errors.type" class="mt-1 text-xs text-red-500">{{ errors.type }}</p>
          </div>

          <!-- Listing Type Selection -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-900 mb-2">
              {{ t('propertyForm.listingTypeLabel') }} <span class="text-red-500">*</span>
            </label>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="ltype in listingTypeOptions"
                :key="ltype.value"
                type="button"
                class="flex items-center justify-center gap-2 p-2 rounded border-2 transition-all"
                :class="
                  form.listingType === ltype.value
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                "
                @click="form.listingType = ltype.value"
              >
                <component :is="ltype.icon" class="h-5 w-5" />
                <span class="text-xs font-medium">{{ ltype.label }}</span>
              </button>
            </div>
          </div>

          <div class="space-y-4">
            <FormField :label="t('propertyForm.title')" :error="errors.title" required>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <PencilSquareIcon class="h-5 w-5 text-slate-400" />
                </div>
                <input
                  v-model="form.title"
                  type="text"
                  class="form-control !pl-11"
                  :class="{ '!border-red-500 !ring-red-500': form.title.length > 0 && form.title.trim().length < 5 }"
                  :placeholder="t('propertyForm.titlePlaceholder')"
                >
              </div>
              <div class="flex items-center justify-between mt-1">
                <p v-if="form.title.length > 0 && form.title.trim().length < 5" class="text-xs text-red-500">
                  {{ t('propertyForm.minCharsRequired') }}
                </p>
                <span v-else />
                <span class="text-xs" :class="form.title.trim().length < 5 ? 'text-red-500' : 'text-gray-400'">
                  {{ form.title.trim().length }} / 5
                </span>
              </div>
            </FormField>

            <FormField :label="t('propertyForm.description')" :error="errors.description" required>
              <div class="relative">
                <div class="absolute left-0 top-0 flex items-center pl-3.5 pt-2.5 pointer-events-none">
                  <DocumentTextIcon class="h-5 w-5 text-slate-400" />
                </div>
                <textarea
                  v-model="form.description"
                  class="form-control !pl-11"
                  :class="{ '!border-red-500 !ring-red-500': form.description.length > 0 && form.description.trim().length < 5 }"
                  rows="4"
                  :placeholder="t('propertyForm.descriptionPlaceholder')"
                />
              </div>
              <div class="flex items-center justify-between mt-1">
                <p v-if="form.description.length > 0 && form.description.trim().length < 5" class="text-xs text-red-500">
                  {{ t('propertyForm.minCharsRequired') }}
                </p>
                <span v-else />
                <span class="text-xs" :class="form.description.trim().length < 5 ? 'text-red-500' : 'text-gray-400'">
                  {{ form.description.trim().length }} / 5
                </span>
              </div>
            </FormField>
          </div>
        </div>

        <!-- Step 2: Characteristics -->
        <div v-show="currentStep === 2">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">{{ t('propertyForm.sectionCharacteristics') }}</h2>

          <!-- Apartment fields -->
          <div v-if="form.type === 'apartment'" class="space-y-4">
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <FormField :label="t('propertyForm.bedrooms')" :error="errors.bedrooms" required>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <HashtagIcon class="h-5 w-5 text-slate-400" />
                  </div>
                  <input v-model.number="form.bedrooms" type="number" class="form-control !pl-11" placeholder="0" min="0">
                </div>
              </FormField>
              <FormField :label="t('propertyForm.bathrooms')" :error="errors.bathrooms" required>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <HashtagIcon class="h-5 w-5 text-slate-400" />
                  </div>
                  <input v-model.number="form.bathrooms" type="number" class="form-control !pl-11" placeholder="0" min="0">
                </div>
              </FormField>
              <FormField :label="t('propertyForm.squareMeters')">
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <HashtagIcon class="h-5 w-5 text-slate-400" />
                  </div>
                  <input v-model.number="form.squareMeters" type="number" class="form-control !pl-11" placeholder="0" min="0">
                </div>
              </FormField>
              <FormField :label="t('propertyForm.floor')">
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <HashtagIcon class="h-5 w-5 text-slate-400" />
                  </div>
                  <input v-model.number="form.floor" type="number" class="form-control !pl-11" placeholder="0" min="0">
                </div>
              </FormField>
            </div>
            <div class="flex flex-wrap gap-4 pt-2">
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input v-model="form.hasElevator" type="checkbox" class="form-check-input">
                <span class="text-sm text-gray-700">{{ t('propertyForm.elevator') }}</span>
              </label>
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input v-model="form.hasBalcony" type="checkbox" class="form-check-input">
                <span class="text-sm text-gray-700">{{ t('propertyForm.balcony') }}</span>
              </label>
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input v-model="form.hasParking" type="checkbox" class="form-check-input">
                <span class="text-sm text-gray-700">{{ t('propertyForm.parking') }}</span>
              </label>
            </div>
          </div>

          <!-- House fields -->
          <div v-if="form.type === 'house'" class="space-y-4">
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <FormField :label="t('propertyForm.bedrooms')" :error="errors.bedrooms" required>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <HashtagIcon class="h-5 w-5 text-slate-400" />
                  </div>
                  <input v-model.number="form.bedrooms" type="number" class="form-control !pl-11" placeholder="0" min="0">
                </div>
              </FormField>
              <FormField :label="t('propertyForm.bathrooms')" :error="errors.bathrooms" required>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <HashtagIcon class="h-5 w-5 text-slate-400" />
                  </div>
                  <input v-model.number="form.bathrooms" type="number" class="form-control !pl-11" placeholder="0" min="0">
                </div>
              </FormField>
              <FormField :label="t('propertyForm.floors')">
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <HashtagIcon class="h-5 w-5 text-slate-400" />
                  </div>
                  <input v-model.number="form.floors" type="number" class="form-control !pl-11" placeholder="0" min="0">
                </div>
              </FormField>
              <FormField :label="t('propertyForm.houseSquareMeters')">
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <HashtagIcon class="h-5 w-5 text-slate-400" />
                  </div>
                  <input v-model.number="form.houseSquareMeters" type="number" class="form-control !pl-11" placeholder="0" min="0">
                </div>
              </FormField>
              <FormField :label="t('propertyForm.landSquareMeters')">
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <HashtagIcon class="h-5 w-5 text-slate-400" />
                  </div>
                  <input v-model.number="form.landSquareMeters" type="number" class="form-control !pl-11" placeholder="0" min="0">
                </div>
              </FormField>
            </div>
            <div class="flex flex-wrap gap-4 pt-2">
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input v-model="form.hasGarden" type="checkbox" class="form-check-input">
                <span class="text-sm text-gray-700">{{ t('propertyForm.garden') }}</span>
              </label>
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input v-model="form.hasPool" type="checkbox" class="form-check-input">
                <span class="text-sm text-gray-700">{{ t('propertyForm.pool') }}</span>
              </label>
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input v-model="form.hasGarage" type="checkbox" class="form-check-input">
                <span class="text-sm text-gray-700">{{ t('propertyForm.garage') }}</span>
              </label>
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input v-model="form.isFurnished" type="checkbox" class="form-check-input">
                <span class="text-sm text-gray-700">{{ t('propertyForm.furnished') }}</span>
              </label>
            </div>
          </div>

          <!-- Land fields -->
          <div v-if="form.type === 'land'" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <FormField :label="t('propertyForm.squareMeters')" :error="errors.squareMeters" required>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <HashtagIcon class="h-5 w-5 text-slate-400" />
                  </div>
                  <input v-model.number="form.squareMeters" type="number" class="form-control !pl-11" placeholder="0" min="0">
                </div>
              </FormField>
              <FormField :label="t('propertyForm.landTypeLabel')">
                <BaseSelect v-model="form.landType" :options="landTypeOptions" :placeholder="t('propertyForm.selectPlaceholder')" />
              </FormField>
            </div>
            <div class="flex flex-wrap gap-4 pt-2">
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input v-model="form.hasWaterAccess" type="checkbox" class="form-check-input">
                <span class="text-sm text-gray-700">{{ t('propertyForm.waterAccess') }}</span>
              </label>
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input v-model="form.hasElectricityAccess" type="checkbox" class="form-check-input">
                <span class="text-sm text-gray-700">{{ t('propertyForm.electricityAccess') }}</span>
              </label>
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input v-model="form.isFenced" type="checkbox" class="form-check-input">
                <span class="text-sm text-gray-700">{{ t('propertyForm.fenced') }}</span>
              </label>
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input v-model="form.hasBuildingPermit" type="checkbox" class="form-check-input">
                <span class="text-sm text-gray-700">{{ t('propertyForm.buildingPermit') }}</span>
              </label>
            </div>
          </div>

          <!-- Event Hall fields -->
          <div v-if="form.type === 'event_hall'" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <FormField :label="t('propertyForm.capacity')" :error="errors.capacity" required>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <UserGroupIcon class="h-5 w-5 text-slate-400" />
                  </div>
                  <input v-model.number="form.capacity" type="number" class="form-control !pl-11" placeholder="0" min="0">
                </div>
              </FormField>
              <FormField :label="t('propertyForm.squareMeters')">
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <HashtagIcon class="h-5 w-5 text-slate-400" />
                  </div>
                  <input v-model.number="form.squareMeters" type="number" class="form-control !pl-11" placeholder="0" min="0">
                </div>
              </FormField>
            </div>
            <div class="flex flex-wrap gap-4 pt-2">
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input v-model="form.hasSoundSystem" type="checkbox" class="form-check-input">
                <span class="text-sm text-gray-700">{{ t('propertyForm.soundSystem') }}</span>
              </label>
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input v-model="form.hasVideoProjector" type="checkbox" class="form-check-input">
                <span class="text-sm text-gray-700">{{ t('propertyForm.videoProjector') }}</span>
              </label>
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input v-model="form.hasKitchen" type="checkbox" class="form-check-input">
                <span class="text-sm text-gray-700">{{ t('propertyForm.kitchen') }}</span>
              </label>
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input v-model="form.hasOutdoorSpace" type="checkbox" class="form-check-input">
                <span class="text-sm text-gray-700">{{ t('propertyForm.outdoorSpace') }}</span>
              </label>
            </div>
          </div>

          <!-- Car fields -->
          <div v-if="form.type === 'car'" class="space-y-4">
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <FormField :label="t('propertyForm.brand')" :error="errors.brand" required>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <TagIcon class="h-5 w-5 text-slate-400" />
                  </div>
                  <input v-model="form.brand" type="text" class="form-control !pl-11" :placeholder="t('propertyForm.brandPlaceholder')">
                </div>
              </FormField>
              <FormField :label="t('propertyForm.model')" :error="errors.model" required>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <TagIcon class="h-5 w-5 text-slate-400" />
                  </div>
                  <input v-model="form.model" type="text" class="form-control !pl-11" :placeholder="t('propertyForm.modelPlaceholder')">
                </div>
              </FormField>
              <FormField :label="t('propertyForm.year')" :error="errors.year" required>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <CalendarIcon class="h-5 w-5 text-slate-400" />
                  </div>
                  <input v-model.number="form.year" type="number" class="form-control !pl-11" :placeholder="t('propertyForm.yearPlaceholder')" min="1990" max="2030">
                </div>
              </FormField>
              <FormField :label="t('propertyForm.licensePlate')">
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <TagIcon class="h-5 w-5 text-slate-400" />
                  </div>
                  <input v-model="form.licensePlate" type="text" class="form-control !pl-11" :placeholder="t('propertyForm.licensePlatePlaceholder')">
                </div>
              </FormField>
              <FormField :label="t('propertyForm.seats')" :error="errors.seats" required>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <UserGroupIcon class="h-5 w-5 text-slate-400" />
                  </div>
                  <input v-model.number="form.seats" type="number" class="form-control !pl-11" :placeholder="t('propertyForm.seatsPlaceholder')" min="1">
                </div>
              </FormField>
              <FormField :label="t('propertyForm.mileage')">
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <HashtagIcon class="h-5 w-5 text-slate-400" />
                  </div>
                  <input v-model.number="form.mileage" type="number" class="form-control !pl-11" placeholder="0" min="0">
                </div>
              </FormField>
              <FormField :label="t('propertyForm.fuelType')" :error="errors.fuelType" required>
                <BaseSelect v-model="form.fuelType" :options="fuelTypeOptions" :placeholder="t('propertyForm.selectPlaceholder')" />
              </FormField>
              <FormField :label="t('propertyForm.transmission')" :error="errors.transmission" required>
                <BaseSelect v-model="form.transmission" :options="transmissionOptions" :placeholder="t('propertyForm.selectPlaceholder')" />
              </FormField>
              <FormField :label="t('propertyForm.color')">
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <SwatchIcon class="h-5 w-5 text-slate-400" />
                  </div>
                  <input v-model="form.color" type="text" class="form-control !pl-11" :placeholder="t('propertyForm.colorPlaceholder')">
                </div>
              </FormField>
            </div>
            <label class="inline-flex items-center gap-2 cursor-pointer pt-2">
              <input v-model="form.withDriver" type="checkbox" class="form-check-input">
              <span class="text-sm text-gray-700">{{ t('propertyForm.withDriver') }}</span>
            </label>
          </div>

          <!-- Photos -->
          <div class="mt-6">
            <FormField :label="t('propertyForm.photos')">
              <FormImageUpload v-model="photos" multiple :max-files="10" preview-size="md" />
            </FormField>
          </div>
        </div>

        <!-- Step 3: Location & Price -->
        <div v-show="currentStep === 3">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">{{ t('propertyForm.sectionLocationPrice') }}</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Left: Adresse -->
            <div class="space-y-4">
              <h3 class="text-sm font-semibold text-gray-900">{{ t('propertyForm.addressHeading') }}</h3>
              <p v-if="errors.townId" class="text-xs text-red-500 -mt-1">{{ errors.townId }}</p>
              <div class="grid grid-cols-2 gap-4">
                <FormField :label="t('propertyForm.country')">
                  <BaseSelect v-model="form.countryId" :options="countryOptions" :placeholder="t('propertyForm.selectCountry')" />
                </FormField>
                <FormField :label="t('propertyForm.province')">
                  <BaseSelect v-model="form.provinceId" :options="provinceOptions" :disabled="!form.countryId" :placeholder="t('propertyForm.selectProvince')" />
                </FormField>
                <FormField :label="t('propertyForm.city')">
                  <BaseSelect v-model="form.cityId" :options="cityOptions" :disabled="!form.provinceId" :placeholder="t('propertyForm.selectCity')" />
                </FormField>
                <FormField :label="t('propertyForm.town')">
                  <BaseSelect v-model="form.townId" :options="townOptions" :disabled="!form.cityId" :placeholder="t('propertyForm.selectTown')" />
                </FormField>
                <div class="col-span-2">
                  <FormField :label="t('propertyForm.street')">
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                        <MapPinIcon class="h-5 w-5 text-slate-400" />
                      </div>
                      <input v-model="form.street" type="text" class="form-control !pl-11" :placeholder="t('propertyForm.streetPlaceholder')">
                    </div>
                  </FormField>
                </div>
                <FormField :label="t('propertyForm.latitude')">
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                      <LockClosedIcon class="h-5 w-5 text-slate-400" />
                    </div>
                    <input :value="form.latitude ?? ''" type="text" class="form-control bg-gray-50 text-gray-500 !pl-11" :placeholder="t('propertyForm.viaRefresh')" disabled>
                  </div>
                </FormField>
                <FormField :label="t('propertyForm.longitude')">
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                      <LockClosedIcon class="h-5 w-5 text-slate-400" />
                    </div>
                    <input :value="form.longitude ?? ''" type="text" class="form-control bg-gray-50 text-gray-500 !pl-11" :placeholder="t('propertyForm.viaRefresh')" disabled>
                  </div>
                </FormField>
              </div>
              <div class="flex items-center gap-2">
                <p v-if="form.latitude && form.longitude" class="text-xs text-green-600">{{ t('propertyForm.positionDetected') }}</p>
                <p v-else class="text-xs text-gray-400">{{ t('propertyForm.allowLocation') }}</p>
                <button type="button" class="text-xs text-primary-600 hover:text-primary-700 underline" @click="getUserLocation">
                  {{ t('propertyForm.refresh') }}<span v-if="detectedCountry"> ({{ detectedCountry }})</span>
                </button>
              </div>
            </div>

            <!-- Right: Tarification -->
            <div class="space-y-4">
              <h3 class="text-sm font-semibold text-gray-900">{{ t('propertyForm.pricingHeading') }}</h3>
              <FormField :label="t('propertyForm.pricePerMonth')" :error="errors.price">
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <BanknotesIcon class="h-5 w-5 text-slate-400" />
                  </div>
                  <input v-model.number="form.pricePerMonth" type="number" class="form-control !pl-11" placeholder="0" min="0">
                </div>
              </FormField>
              <FormField :label="t('propertyForm.pricePerDay')">
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <BanknotesIcon class="h-5 w-5 text-slate-400" />
                  </div>
                  <input v-model.number="form.pricePerDay" type="number" class="form-control !pl-11" placeholder="0" min="0">
                </div>
              </FormField>
              <FormField v-if="form.listingType === 'for_sale'" :label="t('propertyForm.salePrice')">
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <BanknotesIcon class="h-5 w-5 text-slate-400" />
                  </div>
                  <input v-model.number="form.salePrice" type="number" class="form-control !pl-11" placeholder="0" min="0">
                </div>
              </FormField>
            </div>
          </div>
        </div>

        <!-- Step 4: Summary -->
        <div v-show="currentStep === 4">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">{{ t('propertyForm.sectionSummary') }}</h2>

          <div class="space-y-4">
            <div class="bg-gray-50 p-3 rounded">
              <p class="text-xs text-gray-500 uppercase">{{ t('propertyForm.summaryType') }}</p>
              <p class="text-sm font-medium text-gray-900">{{ getTypeLabel(form.type) }}</p>
            </div>
            <div class="bg-gray-50 p-3 rounded">
              <p class="text-xs text-gray-500 uppercase">{{ t('propertyForm.summaryTitle') }}</p>
              <p class="text-sm font-medium text-gray-900">{{ form.title }}</p>
            </div>
            <div class="bg-gray-50 p-3 rounded">
              <p class="text-xs text-gray-500 uppercase">{{ t('propertyForm.summaryDescription') }}</p>
              <p class="text-sm text-gray-700 whitespace-pre-line">{{ form.description }}</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 p-3 rounded">
                <p class="text-xs text-gray-500 uppercase">{{ t('propertyForm.summaryPricePerMonth') }}</p>
                <p class="text-sm font-medium text-gray-900">{{ formatPrice(form.pricePerMonth) }}</p>
              </div>
              <div class="bg-gray-50 p-3 rounded">
                <p class="text-xs text-gray-500 uppercase">{{ t('propertyForm.summaryPricePerDay') }}</p>
                <p class="text-sm font-medium text-gray-900">{{ formatPrice(form.pricePerDay) }}</p>
              </div>
            </div>
            <div v-if="photos.length > 0" class="bg-gray-50 p-3 rounded">
              <p class="text-xs text-gray-500 uppercase mb-2">{{ t('propertyForm.photos') }} ({{ photos.length }})</p>
              <div class="flex gap-2 flex-wrap">
                <img
                  v-for="photo in photos"
                  :key="photo.id"
                  :src="photo.preview"
                  :alt="photo.name"
                  class="h-16 w-16 object-cover rounded border border-gray-200"
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <button
            v-if="currentStep > 1"
            type="button"
            class="btn btn-secondary inline-flex items-center gap-2"
            @click="prevStep"
          >
            <ArrowLeftIcon class="h-4 w-4" />
            {{ t('propertyForm.previous') }}
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="btn btn-outline-danger inline-flex items-center gap-2"
            @click="showCancelModal = true"
          >
            <XMarkIcon class="h-4 w-4" />
            {{ t('propertyForm.cancel') }}
          </button>

          <button
            v-if="currentStep < 4"
            type="button"
            class="btn btn-primary inline-flex items-center gap-2"
            :disabled="!isStepValid"
            @click="nextStep"
          >
            {{ t('propertyForm.next') }}
            <ArrowRightIcon class="h-4 w-4" />
          </button>
          <button
            v-else
            type="button"
            class="btn btn-primary inline-flex items-center gap-2"
            :disabled="isSaving"
            @click="handleSubmit"
          >
            <CheckIcon class="h-4 w-4" />
            {{ isSaving ? t('propertyForm.saving') : t('propertyForm.submitForReview') }}
          </button>
        </div>
      </div>
    </template>

    <!-- Cancel Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="showCancelModal"
        class="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div
          class="fixed inset-0 bg-black/50"
          @click="showCancelModal = false"
        />
        <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <ExclamationTriangleIcon class="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ t('propertyForm.cancelModalTitle') }}</h3>
              <p class="text-sm text-gray-500">{{ t('propertyForm.cancelModalMessage') }}</p>
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              class="btn btn-secondary"
              @click="showCancelModal = false"
            >
              {{ t('propertyForm.continueEditing') }}
            </button>
            <button
              type="button"
              class="btn btn-danger"
              @click="confirmCancel"
            >
              {{ t('propertyForm.confirmCancel') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
