// carrier-ops-hub/apps/web/src/app/routing/routes/maintenance/dashboard.tsx

import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routing/guards/requireAuth'
import { requireRole } from '@/app/routing/guards/requireRole'

export const Route = createFileRoute('/maintenance/dashboard')({
  beforeLoad: ({ context }) => {
    requireAuth(context.auth)
    requireRole(context.auth, ['maintenance_manager', 'owner'])
  },
  component: MaintenanceDashboard,
})

function MaintenanceDashboard() {
  return (
    <div>
      <h1>Maintenance Dashboard</h1>
      {/* TODO: Implement maintenance dashboard */}
    </div>
  )
}
