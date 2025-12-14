// carrier-ops-hub/apps/web/src/app/providers/AuthContext.tsx

import { createContext, useContext } from 'react'
import type { User as FirebaseUser } from 'firebase/auth'
import type { Role } from '@coh/shared'

export interface AuthClaims {
  fleetId?: string
  roles: Role[]
  driverId?: string
}

export interface AuthContextValue {
  user: FirebaseUser | null
  claims: AuthClaims
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshClaims: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
