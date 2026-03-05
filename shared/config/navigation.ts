import {
  HomeIcon,
  BuildingOffice2Icon,
  HeartIcon,
  CalendarDaysIcon,
  EyeIcon,
  StarIcon,
  UserCircleIcon,
  WalletIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  KeyIcon,
  DocumentTextIcon,
  BanknotesIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  TagIcon,
  GlobeAltIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
} from '@heroicons/vue/24/outline'

export interface NavItem {
  name: string
  href: string
  icon: any
  badge?: number
  badgeVariant?: string
  roles?: string[]
}

export interface ModuleNav {
  title: string
  icon: any
  items: NavItem[]
}

// ===== PORTAL NAVIGATION =====

export const userDashboardNav: NavItem[] = [
  { name: 'Tableau de bord', href: '/dashboard', icon: HomeIcon },
  { name: 'Favoris', href: '/dashboard/favorites', icon: HeartIcon },
  { name: 'Réservations', href: '/dashboard/reservations', icon: CalendarDaysIcon },
  { name: 'Visites & Avis', href: '/dashboard/visits', icon: EyeIcon },
  { name: 'Transactions', href: '/dashboard/wallet', icon: WalletIcon },
  { name: 'Notifications', href: '/dashboard/notifications', icon: BellIcon },
  { name: 'Profil', href: '/dashboard/profile', icon: UserCircleIcon },
]

export const landlordDashboardNav: NavItem[] = [
  { name: 'Tableau de bord', href: '/dashboard/landlord', icon: ChartBarIcon },
  { name: 'Mes propriétés', href: '/dashboard/landlord/properties', icon: BuildingOffice2Icon },
  { name: 'Baux', href: '/dashboard/landlord/leases', icon: KeyIcon },
  { name: 'Factures loyer', href: '/dashboard/landlord/invoices', icon: DocumentTextIcon },
  { name: 'Paiements loyer', href: '/dashboard/landlord/payments', icon: BanknotesIcon },
  { name: 'Locataires', href: '/dashboard/landlord/tenants', icon: UsersIcon },
]

// ===== CPANEL NAVIGATION =====

export const adminNav: Record<string, ModuleNav> = {
  main: {
    title: 'Administration',
    icon: Cog6ToothIcon,
    items: [
      { name: 'Vue d\'ensemble', href: '/', icon: ChartBarIcon },
      { name: 'Propriétés', href: '/properties', icon: BuildingOffice2Icon },
      { name: 'Utilisateurs', href: '/users', icon: UsersIcon },
      { name: 'Catégories', href: '/categories', icon: TagIcon },
      { name: 'Géographie', href: '/geography', icon: GlobeAltIcon },
    ],
  },
  reservations: {
    title: 'Réservations',
    icon: CalendarDaysIcon,
    items: [
      { name: 'Réservations', href: '/reservations', icon: CalendarDaysIcon },
      { name: 'Visites', href: '/visits', icon: EyeIcon },
    ],
  },
  rent: {
    title: 'Location',
    icon: KeyIcon,
    items: [
      { name: 'Baux', href: '/leases', icon: KeyIcon },
      { name: 'Factures loyer', href: '/invoices', icon: DocumentTextIcon },
      { name: 'Paiements loyer', href: '/payments', icon: BanknotesIcon },
    ],
  },
  reviews: {
    title: 'Avis',
    icon: StarIcon,
    items: [
      { name: 'Avis', href: '/reviews', icon: StarIcon },
    ],
  },
  communication: {
    title: 'Communication',
    icon: ChatBubbleLeftRightIcon,
    items: [
      { name: 'Messages', href: '/messages', icon: ChatBubbleLeftRightIcon },
      { name: 'Notifications', href: '/notifications', icon: BellIcon },
    ],
  },
  finance: {
    title: 'Finance',
    icon: WalletIcon,
    items: [
      { name: 'Portefeuilles', href: '/wallets', icon: WalletIcon },
      { name: 'Transactions', href: '/transactions', icon: CreditCardIcon },
    ],
  },
  settings: {
    title: 'Configuration',
    icon: Cog6ToothIcon,
    items: [
      { name: 'Paramètres', href: '/settings', icon: Cog6ToothIcon },
    ],
  },
}

/**
 * Get module from route path
 */
export function getModuleFromPath(path: string): string | null {
  if (path.startsWith('/dashboard/landlord')) return 'landlord'
  if (path.startsWith('/dashboard')) return 'dashboard'
  return null
}

/**
 * Check if we're in a module
 */
export function isInModule(path: string): boolean {
  return getModuleFromPath(path) !== null
}

// Aliases used by admin layout components
export const mainNavigation: NavItem[] = userDashboardNav
export const moduleNavigation: Record<string, ModuleNav> = adminNav
