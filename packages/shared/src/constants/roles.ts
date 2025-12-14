// carrier-ops-hub/packages/shared/src/constants/roles.ts

export const ROLES = [
  'owner',
  'dispatcher',
  'fleet_manager',
  'maintenance_manager',
  'billing',
  'driver',
] as const

export type Role = (typeof ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = {
  owner: 'Owner',
  dispatcher: 'Dispatcher',
  fleet_manager: 'Fleet Manager',
  maintenance_manager: 'Maintenance Manager',
  billing: 'Billing',
  driver: 'Driver',
}

export const ALL_ROLES: Role[] = [...ROLES]
