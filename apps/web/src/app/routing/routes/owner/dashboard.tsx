// carrier-ops-hub/apps/web/src/app/routing/routes/owner/dashboard.tsx

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/owner/dashboard')({
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
