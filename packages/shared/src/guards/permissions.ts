// carrier-ops-hub/packages/shared/src/guards/permissions.ts

import type { Role } from '../constants/roles';

export function canManageUsers(role: Role): boolean {
    return role === 'owner';
}

export function canManageLoads(role: Role): boolean {
    return ['owner', 'dispatcher'].includes(role);
}

export function canViewBilling(role: Role): boolean {
    return ['owner', 'billing'].includes(role);
}

export function canManageDrivers(role: Role): boolean {
    return ['owner', 'fleet_manager'].includes(role);
}

export function canManageVehicles(role: Role): boolean {
    return ['owner', 'maintenance_manager'].includes(role);
}
