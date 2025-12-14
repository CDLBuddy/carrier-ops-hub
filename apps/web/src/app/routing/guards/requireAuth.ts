// carrier-ops-hub/apps/web/src/app/routing/guards/requireAuth.ts

import { redirect } from '@tanstack/react-router'
import type { AuthContextValue } from '@/app/providers/AuthContext'

export function requireAuth(auth: AuthContextValue) {
  if (!auth.user) {
    throw redirect({ to: '/auth/sign-in' })
  }
}
