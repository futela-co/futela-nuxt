<script setup lang="ts">
import {
  UserCircleIcon,
  LockClosedIcon,
  CheckCircleIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '~/application/stores/auth'
import { userApi } from '~/infrastructure/api/user'

definePageMeta({ layout: 'dashboard' })

const { t } = useLocale()
const authStore = useAuthStore()
const toast = useToast()

const activeSection = ref<'profile' | 'password'>('profile')

// Profile form
const profileForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
})
const profileLoading = ref(false)

// Password form
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const passwordLoading = ref(false)
const availabilityLoading = ref(false)

async function loadProfile() {
  if (authStore.user) {
    profileForm.value = {
      firstName: authStore.user.firstName,
      lastName: authStore.user.lastName,
      email: authStore.user.email,
      phone: authStore.user.phone ?? '',
    }
  }
}

async function handleUpdateProfile() {
  profileLoading.value = true
  try {
    const updated = await userApi.updateProfile({
      firstName: profileForm.value.firstName,
      lastName: profileForm.value.lastName,
      phone: profileForm.value.phone || null,
    })
    authStore.updateUser(updated)
    toast.success(t('dashboard.profileUpdated'))
  } catch (e: any) {
    toast.error(e.message || t('dashboard.updateError'))
  } finally {
    profileLoading.value = false
  }
}

async function handleChangePassword() {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.error(t('auth.passwordMismatch'))
    return
  }
  if (passwordForm.value.newPassword.length < 8) {
    toast.error(t('auth.passwordTooShort'))
    return
  }

  passwordLoading.value = true
  try {
    await userApi.updatePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    })
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
    toast.success(t('dashboard.passwordChanged'))
  } catch (e: any) {
    toast.error(e.message || t('dashboard.passwordChangeError'))
  } finally {
    passwordLoading.value = false
  }
}

async function handleToggleAvailability() {
  availabilityLoading.value = true
  try {
    const updatedUser = await userApi.toggleAvailability(!authStore.user?.isAvailable)
    authStore.updateUser(updatedUser)
    toast.success(t('dashboard.availabilityUpdated'))
  } catch (e: any) {
    toast.error(e.message || t('dashboard.availabilityError'))
  } finally {
    availabilityLoading.value = false
  }
}

// Fetch data immediately on navigation (Nuxt pattern)
loadProfile()
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">{{ t('dashboard.myProfile') }}</h1>
      <p class="text-gray-500 text-sm mt-1">{{ t('dashboard.managePersonalInfo') }}</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Sidebar navigation -->
      <div class="lg:col-span-1">
        <nav class="bg-white rounded-xl shadow-sm p-2 space-y-1">
          <button
            class="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
            :class="activeSection === 'profile' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'"
            @click="activeSection = 'profile'"
          >
            <UserCircleIcon class="w-5 h-5" />
            {{ t('dashboard.information') }}
          </button>
          <button
            class="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
            :class="activeSection === 'password' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'"
            @click="activeSection = 'password'"
          >
            <LockClosedIcon class="w-5 h-5" />
            {{ t('auth.password') }}
          </button>
        </nav>
      </div>

      <!-- Content -->
      <div class="lg:col-span-3">
        <!-- Profile section -->
        <div v-if="activeSection === 'profile'" class="bg-white rounded-xl shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">{{ t('dashboard.personalInformation') }}</h2>

          <!-- Avatar -->
          <div class="flex items-center gap-4 mb-6">
            <div class="w-20 h-20 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold">
              {{ (authStore.user?.firstName?.[0] ?? '') + (authStore.user?.lastName?.[0] ?? '') }}
            </div>
            <div>
              <p class="font-medium text-gray-900">{{ authStore.userFullName }}</p>
              <p class="text-sm text-gray-500">{{ authStore.user?.email }}</p>
              <div v-if="authStore.user?.isVerified" class="flex items-center gap-1 mt-1">
                <CheckCircleIcon class="w-4 h-4 text-emerald-500" />
                <span class="text-xs text-emerald-600">{{ t('dashboard.accountVerified') }}</span>
              </div>
            </div>
          </div>

          <!-- Availability toggle -->
          <div class="flex items-center justify-between p-4 mb-6 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <p class="text-sm font-medium text-gray-900">{{ t('dashboard.availableForTenants') }}</p>
              <p class="text-xs text-gray-500 mt-0.5">{{ t('dashboard.availableForTenantsDesc') }}</p>
            </div>
            <BaseSwitch
              :model-value="authStore.user?.isAvailable ?? false"
              :disabled="availabilityLoading"
              variant="success"
              @change="handleToggleAvailability"
            />
          </div>

          <form @submit.prevent="handleUpdateProfile">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('auth.firstName') }}</label>
                <input
                  v-model="profileForm.firstName"
                  type="text"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('auth.lastName') }}</label>
                <input
                  v-model="profileForm.lastName"
                  type="text"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('auth.email') }}</label>
                <input
                  :value="profileForm.email"
                  type="email"
                  disabled
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('auth.phone') }}</label>
                <input
                  v-model="profileForm.phone"
                  type="tel"
                  placeholder="+243 ..."
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
              </div>
            </div>

            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="profileLoading"
                class="btn btn-primary btn-lg"
              >
                {{ profileLoading ? t('dashboard.saving') : t('ui.save') }}
              </button>
            </div>
          </form>
        </div>

        <!-- Password section -->
        <div v-if="activeSection === 'password'" class="bg-white rounded-xl shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">{{ t('dashboard.changePassword') }}</h2>

          <form @submit.prevent="handleChangePassword">
            <div class="space-y-4 max-w-md mb-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('dashboard.currentPassword') }}</label>
                <input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('dashboard.newPassword') }}</label>
                <input
                  v-model="passwordForm.newPassword"
                  type="password"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                  minlength="8"
                >
                <p class="text-xs text-gray-400 mt-1">{{ t('auth.passwordMinChars') }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('dashboard.confirmNewPassword') }}</label>
                <input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                  minlength="8"
                >
              </div>
            </div>

            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="passwordLoading"
                class="btn btn-primary btn-lg"
              >
                {{ passwordLoading ? t('dashboard.changing') : t('dashboard.changePasswordBtn') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
