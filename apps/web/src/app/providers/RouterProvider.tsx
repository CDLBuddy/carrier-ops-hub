// carrier-ops-hub/apps/web/src/app/providers/RouterProvider.tsx

import { RouterProvider as TanStackRouterProvider } from '@tanstack/react-router'
import { router } from '@/app/routing/router'
import { useAuth } from './AuthContext'
import { ConnectionBanner } from '@/ui/ConnectionBanner'
import { ToastProvider, ToastContainer } from '@/ui/Toast'

export function RouterProvider() {
  const auth = useAuth()
  return (
    <ToastProvider>
      <ConnectionBanner />
      <ToastContainer />
      <TanStackRouterProvider router={router} context={{ auth }} />
    </ToastProvider>
  )
}
