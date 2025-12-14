// carrier-ops-hub/apps/web/src/app/providers/AuthProvider.tsx

import { useEffect, useState, type ReactNode } from 'react'
import { auth } from '@/firebase/auth'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth'
import { AuthContext, type AuthClaims } from './AuthContext'
import type { Role } from '@coh/shared'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [claims, setClaims] = useState<AuthClaims>({ roles: [] })
  const [isLoading, setIsLoading] = useState(true)

  const parseClaims = async (firebaseUser: FirebaseUser | null): Promise<AuthClaims> => {
    if (!firebaseUser) {
      return { roles: [] }
    }

    try {
      const tokenResult = await firebaseUser.getIdTokenResult()
      const customClaims = tokenResult.claims

      return {
        fleetId: customClaims.fleetId as string | undefined,
        roles: (customClaims.roles as Role[]) || [],
        driverId: customClaims.driverId as string | undefined,
      }
    } catch (error) {
      console.error('Error parsing claims:', error)
      return { roles: [] }
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser)
        const parsedClaims = await parseClaims(firebaseUser)
        setClaims(parsedClaims)
      } catch (error) {
        console.error('Error in auth state change:', error)
        setClaims({ roles: [] })
      } finally {
        setIsLoading(false)
      }
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      const parsedClaims = await parseClaims(result.user)
      setClaims(parsedClaims)
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      const parsedClaims = await parseClaims(result.user)
      setClaims(parsedClaims)
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      setUser(null)
      setClaims({ roles: [] })
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  const refreshClaims = async () => {
    if (!user) return

    try {
      await user.getIdToken(true) // Force refresh
      const parsedClaims = await parseClaims(user)
      setClaims(parsedClaims)
    } catch (error) {
      console.error('Error refreshing claims:', error)
      throw error
    }
  }

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        Loading...
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{ user, claims, isLoading, signIn, signUp, signOut, refreshClaims }}
    >
      {children}
    </AuthContext.Provider>
  )
}
