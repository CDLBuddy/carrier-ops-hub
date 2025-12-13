// carrier-ops-hub/apps/web/src/app/routing/guards/requireRole.ts

import { redirect } from '@tanstack/react-router';

export function requireRole(allowedRoles: string[]) {
  return () => {
    // TODO: Check if user has required role
    const userRole = 'DRIVER'; // Placeholder
    
    if (!allowedRoles.includes(userRole)) {
      throw redirect({ to: '/unauthorized' });
    }
  };
}
