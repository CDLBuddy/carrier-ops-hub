// carrier-ops-hub/apps/web/src/app/providers/RouterProvider.tsx

import { RouterProvider as TanStackRouterProvider } from '@tanstack/react-router';
import { router } from '@/app/routing/router';

export function RouterProvider() {
  return <TanStackRouterProvider router={router} />;
}
