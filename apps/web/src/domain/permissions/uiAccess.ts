// carrier-ops-hub/apps/web/src/domain/permissions/uiAccess.ts

// UI access control helpers

export function canViewDispatch(role: string): boolean {
    return ['DISPATCHER', 'OWNER'].includes(role);
}

export function canEditLoad(role: string): boolean {
    return ['DISPATCHER', 'OWNER'].includes(role);
}

export function canViewBilling(role: string): boolean {
    return ['BILLING', 'OWNER'].includes(role);
}

export function canViewSafety(role: string): boolean {
    return ['SAFETY', 'OWNER'].includes(role);
}
