// carrier-ops-hub/apps/web/src/app/providers/RouterProvider.tsx

import { RouterProvider as TanStackRouterProvider } from '@tanstack/react-router'
import { router } from '@/app/routing/router'
import { useAuth } from './AuthContext'

export function RouterProvider() {
  const auth = useAuth()
  return <TanStackRouterProvider router={router} context={{ auth }} />
}
