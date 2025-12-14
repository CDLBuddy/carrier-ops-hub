// carrier-ops-hub/apps/web/src/app/routing/routes/auth/bootstrap.tsx

import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '@/app/providers/AuthContext'
import { getFunctions, httpsCallable } from 'firebase/auth'
import { functions } from '@/firebase/functions'
import { getLandingPath } from '@/app/routing/navigation/roleLanding'
import { ROLE_LABELS, type Role } from '@coh/shared'

export const Route = createFileRoute('/auth/bootstrap')({
  beforeLoad: ({ context }) => {
    // Require authentication
    if (!context.auth.user) {
      throw redirect({ to: '/auth/sign-in' })
    }
    // If already has fleet, redirect away
    if (context.auth.claims.fleetId) {
      throw redirect({ to: '/my-day' })
    }
  },
  component: BootstrapPage,
})

function BootstrapPage() {
  const [fleetName, setFleetName] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<Role[]>(['owner', 'dispatcher'])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { refreshClaims, claims } = useAuth()
  const navigate = useNavigate()

  const toggleRole = (role: Role) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role))
    } else {
      setSelectedRoles([...selectedRoles, role])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (selectedRoles.length === 0) {
      setError('Please select at least one role')
      return
    }

    setLoading(true)

    try {
      const bootstrapFleet = httpsCallable(functions, 'bootstrapFleet')
      await bootstrapFleet({
        fleetName: fleetName.trim(),
        roles: selectedRoles,
      })

      // Force refresh claims
      await refreshClaims()

      // Navigate to role landing
      const landing = getLandingPath(selectedRoles)
      navigate({ to: landing as any })
    } catch (err: any) {
      console.error('Bootstrap error:', err)
      setError(err.message || 'Failed to create fleet. Are you running in emulator mode?')
    } finally {
      setLoading(false)
    }
  }

  const availableRoles: Role[] = [
    'owner',
    'dispatcher',
    'fleet_manager',
    'billing',
    'maintenance_manager',
    'driver',
  ]

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '1rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '500px' }}>
        <h1 style={{ marginBottom: '1rem', textAlign: 'center' }}>Create Your Fleet</h1>
        <p style={{ marginBottom: '2rem', textAlign: 'center', color: '#666' }}>
          Set up your fleet and assign yourself roles (emulator/dev only)
        </p>

        {error && (
          <div
            style={{
              padding: '0.75rem',
              marginBottom: '1rem',
              backgroundColor: '#fee',
              color: '#c00',
              borderRadius: '4px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Fleet Name
            </label>
            <input
              type="text"
              value={fleetName}
              onChange={(e) => setFleetName(e.target.value)}
              required
              placeholder="e.g., ACME Trucking"
              style={{
                width: '100%',
                padding: '0.5rem',
                fontSize: '1rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 'bold' }}>
              Your Roles
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {availableRoles.map((role) => (
                <label
                  key={role}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role)}
                    onChange={() => toggleRole(role)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>{ROLE_LABELS[role]}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Creating Fleet...' : 'Create Fleet'}
          </button>
        </form>
      </div>
    </div>
  )
}
