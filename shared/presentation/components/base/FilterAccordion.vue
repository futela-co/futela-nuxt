<script setup lang="ts">
/**
 * FilterAccordion.vue
 * Composant réutilisable pour les accordions de filtres
 * - Gère l'état ouvert/fermé
 * - Affiche les badges de filtres actifs
 * - Affiche un avertissement si les filtres sont actifs depuis longtemps
 * - Se ferme automatiquement lors du reset ou clic sur bouton Filtrer
 * - Ne se ferme PAS lors de la saisie dans un champ texte
 */
import { useDebounceFn } from '@vueuse/core'
import {
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ClockIcon,
} from '@heroicons/vue/24/outline'

export interface FilterBadge {
  key: string
  label: string
  value?: string
}

interface Props {
  /** Badges des filtres actifs à afficher */
  badges?: FilterBadge[]
  /** État de chargement */
  loading?: boolean
  /** Désactiver le bouton reset */
  disableReset?: boolean
  /** Afficher les boutons par défaut (search/reset) */
  showDefaultActions?: boolean
  /** Texte du bouton recherche */
  searchLabel?: string
  /** Texte du bouton reset */
  resetLabel?: string
  /** État initial de l'accordion (ouvert/fermé) */
  defaultExpanded?: boolean
  /** Classe CSS supplémentaire pour le container */
  containerClass?: string
  /** Fermer l'accordion après la recherche (défaut: false) */
  closeOnSearch?: boolean
  /** Clé unique pour le stockage du timestamp (nécessaire pour le suivi des filtres stale) */
  storageKey?: string
  /** Durée en minutes avant avertissement (défaut: 30) */
  staleAfterMinutes?: number
  /** Objet de filtres à surveiller pour déclencher la recherche automatiquement */
  autoSearchFilters?: Record<string, any> | null
  /** Délai en ms avant le déclenchement automatique (défaut: 300) */
  autoSearchDelay?: number
}

const props = withDefaults(defineProps<Props>(), {
  badges: () => [],
  loading: false,
  disableReset: false,
  showDefaultActions: true,
  searchLabel: 'Filtrer',
  resetLabel: 'Réinitialiser',
  defaultExpanded: false,
  containerClass: 'mb-2',
  closeOnSearch: false,
  storageKey: '',
  staleAfterMinutes: 30,
  autoSearchFilters: null,
  autoSearchDelay: 300,
})

const emit = defineEmits<{
  search: []
  reset: []
}>()

// State
const isExpanded = ref(props.defaultExpanded)

// ============================================
// Stale Filter Tracking
// ============================================

// Timestamp for stale filter tracking (resets on page leave)
const filterTimestamp = ref<number | null>(null)

// Temps écoulé en minutes
const elapsedMinutes = ref(0)

// Intervalle pour mise à jour
let updateInterval: ReturnType<typeof setInterval> | null = null

// Y a-t-il des filtres actifs?
const hasActiveFilters = computed(() => props.badges.length > 0)

// Les filtres sont-ils "stale"?
const isStale = computed(() => {
  if (!hasActiveFilters.value || !filterTimestamp.value) return false
  return elapsedMinutes.value >= props.staleAfterMinutes
})

// Message formaté du temps écoulé
const elapsedTimeMessage = computed(() => {
  if (!hasActiveFilters.value || !filterTimestamp.value) return ''

  const mins = elapsedMinutes.value
  if (mins < 1) return 'À l\'instant'
  if (mins < 60) return `Filtres actifs depuis ${mins} min`

  const hours = Math.floor(mins / 60)
  const remainingMins = mins % 60
  if (remainingMins === 0) return `Filtres actifs depuis ${hours}h`
  return `Filtres actifs depuis ${hours}h ${remainingMins}min`
})

// Mettre à jour le temps écoulé
function updateElapsedTime() {
  if (!filterTimestamp.value) {
    elapsedMinutes.value = 0
    return
  }
  const now = Date.now()
  elapsedMinutes.value = Math.floor((now - filterTimestamp.value) / 60000)
}

// Observer les changements de badges (filtres actifs)
watch(
  () => props.badges.length,
  (count, oldCount) => {
    if (count > 0 && (oldCount === 0 || oldCount === undefined)) {
      // Filtres activés - enregistrer le timestamp
      filterTimestamp.value = Date.now()
    } else if (count === 0 && (oldCount ?? 0) > 0) {
      // Filtres désactivés - effacer le timestamp
      filterTimestamp.value = null
      elapsedMinutes.value = 0
    }
    updateElapsedTime()
  },
  { immediate: true }
)

// ============================================
// Auto-search on filter changes
// ============================================
const debouncedAutoSearch = useDebounceFn(() => {
  emit('search')
}, props.autoSearchDelay)

// Watch filter changes and auto-search (skips the very first value on mount)
let autoSearchSkipCount = 0

watch(
  () => props.autoSearchFilters,
  (newVal, oldVal) => {
    if (!props.autoSearchFilters) return
    // Skip the first emission which is the initial hydration from localStorage/defaults
    // oldVal is undefined on the very first trigger
    if (oldVal === undefined) {
      autoSearchSkipCount++
      return
    }
    debouncedAutoSearch()
  },
  { deep: true },
)

// Lifecycle
onMounted(() => {
  updateElapsedTime()
  // Mise à jour chaque minute
  updateInterval = setInterval(updateElapsedTime, 60000)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})

// Methods
function toggle() {
  isExpanded.value = !isExpanded.value
}

function expand() {
  isExpanded.value = true
}

function collapse() {
  isExpanded.value = false
}

/**
 * Applique les filtres et ferme l'accordion (appelé par le bouton Filtrer)
 */
function handleSearch() {
  emit('search')
  // Fermer l'accordéon après la recherche (clic sur bouton)
  if (props.closeOnSearch) {
    isExpanded.value = false
  }
}

/**
 * Applique les filtres sans fermer l'accordion (pour saisie texte dynamique)
 */
function handleSearchWithoutClose() {
  emit('search')
  // Ne pas fermer l'accordion - utile pour la saisie texte
}

function handleReset() {
  isExpanded.value = false
  // Réinitialiser le timestamp
  filterTimestamp.value = null
  elapsedMinutes.value = 0
  emit('reset')
}

// Expose methods for parent components
defineExpose({
  expand,
  collapse,
  toggle,
  isExpanded,
  handleSearchWithoutClose,
  isStale,
  elapsedTimeMessage,
})
</script>

<template>
  <div
    class="bg-white border border-gray-200 rounded"
    :class="containerClass"
  >
    <!-- Accordion Header -->
    <button
      type="button"
      class="w-full flex items-center justify-between px-3 py-2 text-left cursor-pointer hover:bg-gray-50 transition-colors"
      @click="toggle"
    >
      <div class="flex items-center flex-wrap gap-2">
        <FunnelIcon class="h-3.5 w-3.5 text-gray-900 mr-1" />
        <h3 class="text-xs font-medium text-gray-900">
          Filtres
        </h3>
        <!-- Badges des filtres actifs -->
        <span
          v-for="badge in badges"
          :key="badge.key"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800"
        >
          <MagnifyingGlassIcon class="h-3 w-3" />
          {{ badge.label }}
        </span>
        <!-- Avertissement filtres "stale" -->
        <span
          v-if="isStale"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800 animate-pulse"
          :title="elapsedTimeMessage"
        >
          <ClockIcon class="h-3 w-3" />
          {{ elapsedTimeMessage }}
        </span>
      </div>
      <ChevronUpIcon
        v-if="isExpanded"
        class="h-3.5 w-3.5 text-gray-900 transition-transform flex-shrink-0"
      />
      <ChevronDownIcon
        v-else
        class="h-3.5 w-3.5 text-gray-900 transition-transform flex-shrink-0"
      />
    </button>

    <!-- Accordion Content -->
    <div
      v-show="isExpanded"
      class="px-4 pb-3 pt-2 bg-gray-50 border-t border-gray-200"
    >
      <!-- Slot pour le contenu des filtres -->
      <slot />

      <!-- Actions par défaut ou slot personnalisé -->
      <div
        v-if="showDefaultActions || $slots.actions"
        class="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-200"
      >
        <slot name="actions">
          <!-- Actions par défaut -->
          <button
            type="button"
            class="btn btn-secondary"
            :disabled="disableReset || loading"
            @click="handleReset"
          >
            <XMarkIcon class="h-3.5 w-3.5 mr-1.5" />
            {{ resetLabel }}
          </button>
          <button
            type="button"
            class="btn btn-primary"
            :disabled="loading"
            @click="handleSearch"
          >
            <MagnifyingGlassIcon class="h-3.5 w-3.5 mr-1.5" />
            {{ searchLabel }}
          </button>
        </slot>
      </div>
    </div>
  </div>
</template>
