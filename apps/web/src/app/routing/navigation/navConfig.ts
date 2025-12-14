// carrier-ops-hub/apps/web/src/app/routing/navigation/navConfig.ts

import type { Role } from '@coh/shared';

export interface NavItem {
    label: string;
    path: string;
    icon?: string;
    roles?: Role[]; // undefined means all authenticated users
}

export const navConfig: NavItem[] = [
    { label: 'My Day', path: '/my-day' }, // No roles = all authenticated
    { label: 'Dispatch', path: '/dispatch/dashboard', roles: ['dispatcher', 'owner'] },
    { label: 'Billing', path: '/billing/dashboard', roles: ['billing', 'owner'] },
    { label: 'Safety', path: '/safety/dashboard', roles: ['fleet_manager', 'owner'] },
    { label: 'Maintenance', path: '/maintenance/dashboard', roles: ['maintenance_manager', 'owner'] },
    { label: 'Driver Home', path: '/driver/home', roles: ['driver'] },
];
