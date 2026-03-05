<script setup lang="ts">
import { HomeIcon, ChevronDoubleRightIcon } from '@heroicons/vue/24/outline'

interface BreadcrumbItem {
  label: string
  to?: string
}

interface Props {
  items?: BreadcrumbItem[]
  homeRoute?: string
  showHome?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  homeRoute: '/dashboard',
  showHome: true,
})

const route = useRoute()

// Route label mappings for auto-generation
const routeLabels: Record<string, string> = {
  dashboard: 'Tableau de bord',
  marketing: 'Commercialisation',
  customers: 'Clients',
  orders: 'Commandes',
  'sales-reps': 'Delegues commerciaux',
  'sales-managers': 'Responsables commerciaux',
  supervisors: 'Superviseurs',
  wholesalers: 'Grossistes',
  retailers: 'Detaillants',
  declarations: 'Declarations de ventes',
  finance: 'Finance et Budget',
  budget: 'Budget',
  expenses: 'Depenses',
  billing: 'Factures',
  invoices: 'Factures',
  payments: 'Paiements',
  accounts: 'Balance des comptes',
  loans: 'Emprunts',
  creditors: 'Creanciers',
  treasury: 'Tresorerie',
  registers: 'Registres',
  'expense-plan': 'Planification des depenses',
  expense: 'Execution des depenses',
  hr: 'Ressources Humaines',
  users: 'Agents',
  directions: 'Directions',
  services: 'Services',
  categories: 'Categories',
  disciplinary: 'Actions disciplinaires',
  logistics: 'Logistique',
  'purchase-orders': 'Approvisionnement',
  suppliers: 'Fournisseurs',
  deliveries: 'Livraisons',
  itineraries: 'Charroi automobile',
  packaging: 'Conditionnement',
  production: 'Production',
  manufacturing: 'Usine de production',
  'quality-control': 'Controle Microbiologique',
  requisitions: 'Requisitions',
  'raw-materials': 'Matieres premieres',
  processes: 'Processus de fabrication',
  configurations: 'Configurations',
  'inventory-report': 'Rapport de l\'inventaire',
  analytics: 'Analyse des donnees',
  delegates: 'Liste des delegues',
  'delegates-performance': 'Cumul des performances',
  sales: 'Rapports de ventes',
  settings: 'Parametres',
  'exchange-rates': 'Taux de change',
  'daily-targets': 'Objectifs journaliers',
  create: 'Nouveau',
  new: 'Nouveau',
  edit: 'Modifier',
  view: 'Details',
  validate: 'Validation',
  reports: 'Rapports',
  profile: 'Profil',
}

// Auto-generate breadcrumbs from current route
const breadcrumbs = computed((): BreadcrumbItem[] => {
  // If custom items are provided, use them
  if (props.items && props.items.length > 0) {
    return props.items
  }

  // Auto-generate from route
  const pathSegments = route.path.split('/').filter(Boolean)
  const breadcrumbItems: BreadcrumbItem[] = []

  let currentPath = ''

  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i]!
    currentPath += `/${segment}`

    // Skip dynamic route parameters (numeric IDs)
    if (/^\d+$/.test(segment)) {
      continue
    }

    // Skip UUIDs
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
      continue
    }

    const label = routeLabels[segment] || formatLabel(segment)
    const isLast = i === pathSegments.length - 1

    breadcrumbItems.push({
      label,
      to: isLast ? undefined : currentPath,
    })
  }

  return breadcrumbItems
})

// Format a route segment as a label (fallback)
function formatLabel(segment: string): string {
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
</script>

<template>
  <nav
    class="breadcrumb"
    aria-label="Breadcrumb"
  >
    <a
      v-if="showHome"
      :href="homeRoute"
      class="breadcrumb-item breadcrumb-home"
      aria-label="Accueil"
    >
      <HomeIcon class="breadcrumb-icon" />
    </a>
    <ChevronDoubleRightIcon
      v-if="showHome && breadcrumbs.length > 0"
      class="breadcrumb-separator"
    />
    <template
      v-for="(item, index) in breadcrumbs"
      :key="index"
    >
      <a
        v-if="item.to"
        :href="item.to"
        class="breadcrumb-item"
      >{{ item.label }}</a>
      <span
        v-else
        class="breadcrumb-item active"
        aria-current="page"
      >{{ item.label }}</span>
      <ChevronDoubleRightIcon
        v-if="index < breadcrumbs.length - 1"
        class="breadcrumb-separator"
      />
    </template>
  </nav>
</template>
