// carrier-ops-hub/apps/web/src/app/routing/routes/safety/dashboard.tsx

import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routing/guards/requireAuth'
import { requireRole } from '@/app/routing/guards/requireRole'

export const Route = createFileRoute('/safety/dashboard')({
  beforeLoad: ({ context }) => {
    requireAuth(context.auth)
    requireRole(context.auth, ['fleet_manager', 'owner'])
  },
  component: SafetyDashboard,
})

function SafetyDashboard() {
  return (
    <div>
      <h1>Safety Dashboard</h1>
      {/* TODO: Implement safety dashboard */}
    </div>
  )
}
