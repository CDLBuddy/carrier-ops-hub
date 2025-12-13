// carrier-ops-hub/packages/shared/src/guards/permissions.ts

import { ROLES, type Role } from '../constants/roles';

export function canManageUsers(role: Role): boolean {
  return role === ROLES.OWNER;
}

export function canManageLoads(role: Role): boolean {
  return [ROLES.OWNER, ROLES.DISPATCHER].includes(role);
}

export function canViewBilling(role: Role): boolean {
  return [ROLES.OWNER, ROLES.BILLING].includes(role);
}

export function canManageDrivers(role: Role): boolean {
  return [ROLES.OWNER, ROLES.SAFETY].includes(role);
}

export function canManageVehicles(role: Role): boolean {
  return [ROLES.OWNER, ROLES.MAINTENANCE].includes(role);
}
