export const ROLES = {
  ADMIN: 'ROLE_ADMIN',
  LANDLORD: 'ROLE_LANDLORD',
  USER: 'ROLE_USER',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.ADMIN]: 'Administrateur',
  [ROLES.LANDLORD]: 'Propriétaire',
  [ROLES.USER]: 'Utilisateur',
}

export const ROLE_HIERARCHY: Record<Role, Role[]> = {
  [ROLES.ADMIN]: [ROLES.ADMIN, ROLES.LANDLORD, ROLES.USER],
  [ROLES.LANDLORD]: [ROLES.LANDLORD, ROLES.USER],
  [ROLES.USER]: [ROLES.USER],
}

export function hasRole(userRoles: string[], requiredRole: Role): boolean {
  return userRoles.some((role) => {
    const hierarchy = ROLE_HIERARCHY[role as Role]
    return hierarchy?.includes(requiredRole)
  })
}

export function hasAnyRole(userRoles: string[], requiredRoles: string[]): boolean {
  return requiredRoles.some(role => hasRole(userRoles, role as Role))
}

export function canAccessDashboard(userRoles: string[]): boolean {
  return hasRole(userRoles, ROLES.ADMIN)
}

export function getHomeRouteForRoles(userRoles: string[], _userId?: string): string {
  if (hasRole(userRoles, ROLES.ADMIN)) return '/dashboard'
  if (hasRole(userRoles, ROLES.LANDLORD)) return '/dashboard/landlord'
  return '/dashboard'
}
