// carrier-ops-hub/apps/web/src/app/routing/navigation/roleLanding.ts

import type { Role } from '@coh/shared'

/**
 * Get the landing path for a user based on their roles.
 * Priority order:
 * 1. driver-only → /driver/home
 * 2. dispatcher → /dispatch/dashboard
 * 3. owner → /owner/dashboard
 * 4. billing → /billing/dashboard
 * 5. maintenance_manager → /maintenance/dashboard
 * 6. fleet_manager → /safety/dashboard
 * 7. fallback → /my-day
 */
export function getLandingPath(roles: Role[]): string {
  // Driver-only users go to driver home
  if (roles.includes('driver') && roles.length === 1) {
    return '/driver/home'
  }

  // Dispatchers go to dispatch dashboard
  if (roles.includes('dispatcher')) {
    return '/dispatch/dashboard'
  }

  // Owners go to owner dashboard
  if (roles.includes('owner')) {
    return '/owner/dashboard'
  }

  // Billing users go to billing dashboard
  if (roles.includes('billing')) {
    return '/billing/dashboard'
  }

  // Maintenance managers go to maintenance dashboard
  if (roles.includes('maintenance_manager')) {
    return '/maintenance/dashboard'
  }

  // Fleet managers go to safety dashboard
  if (roles.includes('fleet_manager')) {
    return '/safety/dashboard'
  }

  // Default to my-day
  return '/my-day'
}

// Legacy function for compatibility
export function getLandingPageForRole(role: string): string {
  const roleLandingPages: Record<string, string> = {
    owner: '/owner/dashboard',
    dispatcher: '/dispatch/dashboard',
    billing: '/billing/dashboard',
    fleet_manager: '/safety/dashboard',
    maintenance_manager: '/maintenance/dashboard',
    driver: '/driver/home',
  }
  return roleLandingPages[role] || '/my-day'
}
