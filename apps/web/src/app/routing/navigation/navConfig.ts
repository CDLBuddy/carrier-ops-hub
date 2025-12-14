// carrier-ops-hub/apps/web/src/app/routing/navigation/navConfig.ts

export interface NavItem {
    label: string;
    path: string;
    icon?: string;
    roles?: string[];
}

export const navConfig: NavItem[] = [
    { label: 'My Day', path: '/my-day', roles: ['ALL'] },
    { label: 'Dispatch', path: '/dispatch/dashboard', roles: ['DISPATCHER', 'OWNER'] },
    { label: 'Billing', path: '/billing/dashboard', roles: ['BILLING', 'OWNER'] },
    { label: 'Safety', path: '/safety/dashboard', roles: ['SAFETY', 'OWNER'] },
    { label: 'Maintenance', path: '/maintenance/dashboard', roles: ['MAINTENANCE', 'OWNER'] },
    { label: 'Driver Home', path: '/driver/home', roles: ['DRIVER'] },
];
