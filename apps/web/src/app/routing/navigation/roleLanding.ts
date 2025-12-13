// carrier-ops-hub/apps/web/src/app/routing/navigation/roleLanding.ts

export const roleLandingPages: Record<string, string> = {
  OWNER: '/owner/dashboard',
  DISPATCHER: '/dispatch/dashboard',
  BILLING: '/billing/dashboard',
  SAFETY: '/safety/dashboard',
  MAINTENANCE: '/maintenance/dashboard',
  DRIVER: '/driver/home',
};

export function getLandingPageForRole(role: string): string {
  return roleLandingPages[role] || '/my-day';
}
