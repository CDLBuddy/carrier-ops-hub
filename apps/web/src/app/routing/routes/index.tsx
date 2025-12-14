// carrier-ops-hub/apps/web/src/app/routing/routes/index.tsx

import { createFileRoute, redirect } from '@tanstack/react-router'
import { getLandingPath } from '@/app/routing/navigation/roleLanding'

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    // Not authenticated → sign in
    if (!context.auth.user) {
      throw redirect({ to: '/auth/sign-in' })
    }

    // Authenticated but no fleet → bootstrap
    if (!context.auth.claims.fleetId) {
      throw redirect({ to: '/auth/bootstrap' })
    }

    // Has fleet → role landing
    const landing = getLandingPath(context.auth.claims.roles)
    throw redirect({ to: landing as any })
  },
  component: () => (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>Redirecting...</p>
    </div>
  ),
})
