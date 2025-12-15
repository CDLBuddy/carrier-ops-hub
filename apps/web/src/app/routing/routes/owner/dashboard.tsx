// carrier-ops-hub/apps/web/src/app/routing/routes/owner/dashboard.tsx

import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routing/guards/requireAuth'
import { requireRole } from '@/app/routing/guards/requireRole'

export const Route = createFileRoute('/owner/dashboard')({
  beforeLoad: ({ context }) => {
    requireAuth(context.auth)
    requireRole(context.auth, ['owner'])
  },
  component: OwnerDashboard,
})

function OwnerDashboard() {
  return (
    <div>
      <h1>Owner Dashboard</h1>
      {/* TODO: Implement owner dashboard */}
    </div>
  )
}
