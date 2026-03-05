<script setup lang="ts">
/**
 * AdminQuickSearch.vue
 * Quick search modal component (Cmd+K / Ctrl+K)
 * Provides global search across the application with keyboard navigation
 */
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowRightIcon,
  ClockIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  HomeIcon,
} from '@heroicons/vue/24/outline'
import type { Component } from 'vue'

interface SearchResult {
  id: string
  title: string
  description?: string
  category: string
  icon?: Component
  to: string
  keywords?: string[]
}

interface SearchCategory {
  name: string
  icon: Component
  items: SearchResult[]
}

interface Props {
  /** Whether the modal is open */
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

// Search state
const searchQuery = ref('')
const selectedIndex = ref(0)
const searchInputRef = ref<HTMLInputElement | null>(null)
const isSearching = ref(false)

// Recent searches (stored in localStorage)
const recentSearches = ref<string[]>([])

// Load recent searches from localStorage
onMounted(() => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem('quick_search_recent')
    if (stored) {
      try {
        recentSearches.value = JSON.parse(stored)
      } catch {
        recentSearches.value = []
      }
    }
  }
})

// Focus input when modal opens
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      searchInputRef.value?.focus()
    })
    selectedIndex.value = 0
  } else {
    searchQuery.value = ''
    selectedIndex.value = 0
  }
})

// Quick actions / shortcuts
const quickActions: SearchCategory = {
  name: 'Actions rapides',
  icon: ArrowRightIcon,
  items: [
    { id: 'new-customer', title: 'Nouveau client', description: 'Creer un nouveau client', category: 'Marketing', icon: UserGroupIcon, to: '/marketing/customers/create', keywords: ['client', 'nouveau', 'creer'] },
    { id: 'new-order', title: 'Nouvelle commande', description: 'Creer une nouvelle commande', category: 'Marketing', icon: ShoppingCartIcon, to: '/marketing/orders/create', keywords: ['commande', 'nouveau', 'creer'] },
    { id: 'new-expense', title: 'Nouvelle depense', description: 'Enregistrer une depense', category: 'Finance', icon: CurrencyDollarIcon, to: '/finance/expenses/create', keywords: ['depense', 'nouveau', 'creer'] },
    { id: 'settings', title: 'Parametres', description: 'Configurer l\'application', category: 'Systeme', icon: Cog6ToothIcon, to: '/settings/general', keywords: ['parametres', 'configuration', 'reglages'] },
  ],
}

// Navigation items for search
const navigationItems: SearchCategory = {
  name: 'Pages',
  icon: DocumentTextIcon,
  items: [
    { id: 'dashboard', title: 'Tableau de bord', description: 'Vue d\'ensemble', category: 'Principal', icon: HomeIcon, to: '/dashboard', keywords: ['accueil', 'dashboard', 'tableau'] },
    { id: 'customers', title: 'Clients', description: 'Gestion des clients', category: 'Marketing', icon: UserGroupIcon, to: '/marketing/customers', keywords: ['clients', 'marketing'] },
    { id: 'orders', title: 'Commandes', description: 'Gestion des commandes', category: 'Marketing', icon: ShoppingCartIcon, to: '/marketing/orders', keywords: ['commandes', 'ventes'] },
    { id: 'budget', title: 'Budget', description: 'Gestion budgetaire', category: 'Finance', icon: CurrencyDollarIcon, to: '/finance/budget', keywords: ['budget', 'finance'] },
    { id: 'expenses', title: 'Depenses', description: 'Suivi des depenses', category: 'Finance', icon: CurrencyDollarIcon, to: '/finance/expenses', keywords: ['depenses', 'frais'] },
    { id: 'users', title: 'Utilisateurs', description: 'Gestion des utilisateurs', category: 'RH', icon: UserGroupIcon, to: '/hr/users', keywords: ['utilisateurs', 'employes', 'rh'] },
    { id: 'suppliers', title: 'Fournisseurs', description: 'Gestion des fournisseurs', category: 'Logistique', icon: UserGroupIcon, to: '/logistics/suppliers', keywords: ['fournisseurs', 'logistique'] },
    { id: 'production', title: 'Production', description: 'Suivi de production', category: 'Production', icon: DocumentTextIcon, to: '/production/manufacturing', keywords: ['production', 'fabrication'] },
    { id: 'processes', title: 'Processus', description: 'Processus de fabrication', category: 'Matieres Premieres', icon: DocumentTextIcon, to: '/raw-materials?tab=processes', keywords: ['processus', 'fabrication', 'matieres'] },
  ],
}

// Filter results based on search query
const filteredResults = computed((): SearchCategory[] => {
  if (!searchQuery.value.trim()) {
    return [quickActions, navigationItems]
  }

  const query = searchQuery.value.toLowerCase().trim()
  const results: SearchCategory[] = []

  // Filter quick actions
  const filteredActions = quickActions.items.filter(item =>
    item.title.toLowerCase().includes(query) ||
    item.description?.toLowerCase().includes(query) ||
    item.category.toLowerCase().includes(query) ||
    item.keywords?.some(k => k.toLowerCase().includes(query))
  )

  if (filteredActions.length > 0) {
    results.push({ ...quickActions, items: filteredActions })
  }

  // Filter navigation items
  const filteredNavigation = navigationItems.items.filter(item =>
    item.title.toLowerCase().includes(query) ||
    item.description?.toLowerCase().includes(query) ||
    item.category.toLowerCase().includes(query) ||
    item.keywords?.some(k => k.toLowerCase().includes(query))
  )

  if (filteredNavigation.length > 0) {
    results.push({ ...navigationItems, items: filteredNavigation })
  }

  return results
})

// Flat list of all results for keyboard navigation
const flatResults = computed((): SearchResult[] => {
  return filteredResults.value.flatMap(category => category.items)
})

// Total results count
const totalResults = computed(() => flatResults.value.length)

// Handle keyboard navigation
function handleKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, totalResults.value - 1)
      scrollToSelected()
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
      scrollToSelected()
      break
    case 'Enter':
      event.preventDefault()
      if (flatResults.value[selectedIndex.value]) {
        selectResult(flatResults.value[selectedIndex.value]!)
      }
      break
    case 'Escape':
      event.preventDefault()
      emit('close')
      break
  }
}

// Scroll to selected item
function scrollToSelected() {
  nextTick(() => {
    const selectedElement = document.querySelector(`[data-search-index="${selectedIndex.value}"]`)
    selectedElement?.scrollIntoView({ block: 'nearest' })
  })
}

// Select a result
function selectResult(result: SearchResult) {
  // Save to recent searches
  saveRecentSearch(searchQuery.value)

  // Navigate
  emit('close')
  navigateTo(result.to)
}

// Save to recent searches
function saveRecentSearch(query: string) {
  if (!query.trim()) return

  // Remove if already exists
  recentSearches.value = recentSearches.value.filter(s => s !== query)

  // Add to beginning
  recentSearches.value.unshift(query)

  // Keep only last 5
  recentSearches.value = recentSearches.value.slice(0, 5)

  // Persist
  if (typeof window !== "undefined") {
    localStorage.setItem('quick_search_recent', JSON.stringify(recentSearches.value))
  }
}

// Clear recent searches
function clearRecentSearches() {
  recentSearches.value = []
  if (typeof window !== "undefined") {
    localStorage.removeItem('quick_search_recent')
  }
}

// Use recent search
function useRecentSearch(query: string) {
  searchQuery.value = query
  searchInputRef.value?.focus()
}

// Get the global index for an item
function getGlobalIndex(categoryIndex: number, itemIndex: number): number {
  let globalIndex = 0
  for (let i = 0; i < categoryIndex; i++) {
    globalIndex += filteredResults.value[i]!.items.length
  }
  return globalIndex + itemIndex
}

// Check if item is selected
function isSelected(categoryIndex: number, itemIndex: number): boolean {
  return getGlobalIndex(categoryIndex, itemIndex) === selectedIndex.value
}

// Reset selection when results change
watch(filteredResults, () => {
  selectedIndex.value = 0
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
        @keydown="handleKeydown"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/30"
          @click="emit('close')"
        />

        <!-- Modal Content -->
        <div class="relative w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden">
          <!-- Search Input -->
          <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
            <MagnifyingGlassIcon class="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher une page, action ou commande..."
              class="flex-1 text-base text-gray-900 placeholder-gray-400 bg-transparent border-none outline-none focus:ring-0"
              autocomplete="off"
            >
            <div class="flex items-center gap-1 flex-shrink-0">
              <kbd class="hidden sm:inline-flex items-center px-2 py-1 text-xs font-medium text-gray-900 bg-gray-100 rounded">
                esc
              </kbd>
              <button
                type="button"
                class="p-1 text-gray-400 hover:text-gray-900 sm:hidden"
                @click="emit('close')"
              >
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Results -->
          <div class="max-h-96 overflow-y-auto">
            <!-- Recent Searches (when no query) -->
            <div
              v-if="!searchQuery && recentSearches.length > 0"
              class="px-4 py-3 border-b border-gray-100"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recherches recentes
                </span>
                <button
                  type="button"
                  class="text-xs text-gray-400 hover:text-gray-900"
                  @click="clearRecentSearches"
                >
                  Effacer
                </button>
              </div>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="recent in recentSearches"
                  :key="recent"
                  type="button"
                  class="inline-flex items-center gap-1 px-2 py-1 text-sm text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  @click="useRecentSearch(recent)"
                >
                  <ClockIcon class="w-3 h-3" />
                  {{ recent }}
                </button>
              </div>
            </div>

            <!-- No Results -->
            <div
              v-if="searchQuery && totalResults === 0"
              class="px-4 py-8 text-center"
            >
              <MagnifyingGlassIcon class="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p class="text-sm text-gray-900">
                Aucun resultat pour "{{ searchQuery }}"
              </p>
              <p class="text-xs text-gray-400 mt-1">
                Essayez une autre recherche
              </p>
            </div>

            <!-- Results Categories -->
            <template
              v-for="(category, categoryIndex) in filteredResults"
              :key="category.name"
            >
              <div class="px-4 py-2">
                <span class="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ category.name }}
                </span>
              </div>

              <div class="pb-2">
                <button
                  v-for="(item, itemIndex) in category.items"
                  :key="item.id"
                  type="button"
                  :data-search-index="getGlobalIndex(categoryIndex, itemIndex)"
                  class="w-full flex items-center gap-3 px-4 py-2 text-left transition-colors"
                  :class="isSelected(categoryIndex, itemIndex) ? 'bg-primary-50 text-primary-900' : 'hover:bg-gray-50'"
                  @click="selectResult(item)"
                  @mouseenter="selectedIndex = getGlobalIndex(categoryIndex, itemIndex)"
                >
                  <!-- Icon -->
                  <div
                    class="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center"
                    :class="isSelected(categoryIndex, itemIndex) ? 'bg-primary-100' : 'bg-gray-100'"
                  >
                    <component
                      :is="item.icon || DocumentTextIcon"
                      class="w-4 h-4"
                      :class="isSelected(categoryIndex, itemIndex) ? 'text-primary-600' : 'text-gray-900'"
                    />
                  </div>

                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <p
                      class="text-sm font-medium truncate"
                      :class="isSelected(categoryIndex, itemIndex) ? 'text-primary-900' : 'text-gray-900'"
                    >
                      {{ item.title }}
                    </p>
                    <p
                      v-if="item.description"
                      class="text-xs truncate"
                      :class="isSelected(categoryIndex, itemIndex) ? 'text-primary-600' : 'text-gray-900'"
                    >
                      {{ item.description }}
                    </p>
                  </div>

                  <!-- Category Badge -->
                  <span
                    class="flex-shrink-0 text-xs px-2 py-0.5 rounded"
                    :class="isSelected(categoryIndex, itemIndex) ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-900'"
                  >
                    {{ item.category }}
                  </span>

                  <!-- Arrow indicator when selected -->
                  <ArrowRightIcon
                    v-if="isSelected(categoryIndex, itemIndex)"
                    class="w-4 h-4 text-primary-500 flex-shrink-0"
                  />
                </button>
              </div>
            </template>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-900">
            <div class="flex items-center gap-4">
              <span class="flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px]">&#8593;</kbd>
                <kbd class="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px]">&#8595;</kbd>
                naviguer
              </span>
              <span class="flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px]">&#8629;</kbd>
                selectionner
              </span>
            </div>
            <span>
              {{ totalResults }} resultat{{ totalResults !== 1 ? 's' : '' }}
            </span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
