<script setup lang="ts">
import { CalendarIcon, ClockIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { visitsApi } from '~shared/infrastructure/api/visits'
import { useUiStore } from '~shared/application/stores/ui'

interface Props {
  propertyId: string
  isOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  submitted: []
}>()

const ui = useUiStore()
const visitDate = ref('')
const visitTime = ref('09:00-10:00')
const notes = ref('')
const phone = ref('')
const submitting = ref(false)

const timeSlots = [
  '08:00-09:00',
  '09:00-10:00',
  '10:00-11:00',
  '11:00-12:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00',
]

async function handleSubmit() {
  if (!visitDate.value) return
  submitting.value = true
  try {
    await visitsApi.schedule({
      propertyId: props.propertyId,
      scheduledAt: `${visitDate.value}T${visitTime.value.split('-')[0]}:00`,
      notes: notes.value || null,
    })
    ui.showSuccess('Demande envoyee', 'Le proprietaire a 24h pour confirmer votre visite.')
    emit('submitted')
    emit('close')
    resetForm()
  } catch {
    ui.showError('Erreur', 'Impossible d\'envoyer la demande de visite.')
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  visitDate.value = ''
  visitTime.value = '09:00-10:00'
  notes.value = ''
  phone.value = ''
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-4"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-lg font-semibold text-gray-900">Demander une visite</h3>
          <button
            class="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            @click="$emit('close')"
          >
            <XMarkIcon class="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form
          class="space-y-4"
          @submit.prevent="handleSubmit"
        >
          <!-- Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Date souhaitee</label>
            <div class="relative">
              <CalendarIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-model="visitDate"
                type="date"
                required
                :min="new Date().toISOString().split('T')[0]"
                class="form-control pl-10"
              >
            </div>
          </div>

          <!-- Time -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Heure souhaitee</label>
            <div class="relative">
              <ClockIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                v-model="visitTime"
                class="form-control pl-10"
              >
                <option
                  v-for="slot in timeSlots"
                  :key="slot"
                  :value="slot"
                >
                  {{ slot }}
                </option>
              </select>
            </div>
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Message (optionnel)</label>
            <textarea
              v-model="notes"
              rows="3"
              placeholder="Bonjour, je souhaite visiter cette propriete..."
              class="form-control"
            />
          </div>

          <!-- Phone -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Telephone</label>
            <input
              v-model="phone"
              type="tel"
              placeholder="+243 812 345 678"
              class="form-control"
            >
          </div>

          <button
            type="submit"
            :disabled="submitting || !visitDate"
            class="w-full btn btn-primary btn-lg"
          >
            <span v-if="submitting">Envoi en cours...</span>
            <span v-else>Envoyer la demande</span>
          </button>

          <p class="text-xs text-gray-500 text-center">
            Le proprietaire a 24h pour confirmer votre visite.
          </p>
        </form>
      </div>
    </div>
  </Transition>
</template>
