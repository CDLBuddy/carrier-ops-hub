// carrier-ops-hub/apps/web/src/app/routing/guards/requireRole.ts

import { redirect } from '@tanstack/react-router';
import type { AuthContextValue } from '@/app/providers/AuthContext';
import type { Role } from '@coh/shared';

export function requireRole(auth: AuthContextValue, allowedRoles: Role[]) {
    const hasRole = allowedRoles.some((role) => auth.claims.roles.includes(role));

    if (!hasRole) {
        // Redirect to appropriate landing based on user's roles
        if (auth.claims.roles.includes('driver') && auth.claims.roles.length === 1) {
            throw redirect({ to: '/driver/home' });
        }
        throw redirect({ to: '/my-day' });
    }
}
