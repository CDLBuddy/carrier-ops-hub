// carrier-ops-hub/apps/web/src/app/routing/router.ts

import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import type { AuthContextValue } from '@/app/providers/AuthContext';

export const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
    context: {
        auth: undefined as any as AuthContextValue,
    },
});

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
