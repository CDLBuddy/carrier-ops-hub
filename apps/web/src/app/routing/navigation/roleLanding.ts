// carrier-ops-hub/apps/web/src/app/routing/navigation/roleLanding.ts

import type { Role } from '@coh/shared'

export function getLandingPath(roles: Role[]): string {
  // Driver-only users go to driver home
  if (roles.includes('driver') && roles.length === 1) {
    return '/driver/home'
  }

  // Dispatchers go to dispatch dashboard
  if (roles.includes('dispatcher')) {
    return '/dispatch/dashboard'
  }

  // Billing users go to billing dashboard
  if (roles.includes('billing')) {
    return '/billing/dashboard'
  }

  // Default to my-day
  return '/my-day'
}

// Legacy function for compatibility
export function getLandingPageForRole(role: string): string {
  const roleLandingPages: Record<string, string> = {
    owner: '/my-day',
    dispatcher: '/dispatch/dashboard',
    billing: '/billing/dashboard',
    fleet_manager: '/my-day',
    maintenance_manager: '/maintenance/dashboard',
    driver: '/driver/home',
  }
  return roleLandingPages[role] || '/my-day'
}
