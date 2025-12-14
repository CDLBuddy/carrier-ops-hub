// carrier-ops-hub/packages/shared/src/constants/roles.ts

export type Role = 'owner' | 'dispatcher' | 'fleet_manager' | 'maintenance_manager' | 'billing' | 'driver';

export const ROLE_LABELS: Record<Role, string> = {
    owner: 'Owner',
    dispatcher: 'Dispatcher',
    fleet_manager: 'Fleet Manager',
    maintenance_manager: 'Maintenance Manager',
    billing: 'Billing',
    driver: 'Driver',
};

export const ALL_ROLES: Role[] = [
    'owner',
    'dispatcher',
    'fleet_manager',
    'maintenance_manager',
    'billing',
    'driver',
];
