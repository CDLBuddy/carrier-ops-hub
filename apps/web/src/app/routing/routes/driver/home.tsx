// carrier-ops-hub/apps/web/src/app/routing/routes/driver/home.tsx

import { createFileRoute, Link } from '@tanstack/react-router'
import { requireAuth } from '@/app/routing/guards/requireAuth'
import { requireRole } from '@/app/routing/guards/requireRole'
import { useLoads } from '@/features/loads/hooks'
import { useAuth } from '@/app/providers/AuthContext'
import { LOAD_STATUS } from '@coh/shared'

interface StopData {
  address?: string
  [key: string]: unknown
}

interface LoadData {
  id: string
  loadNumber?: string
  status?: string
  stops?: StopData[]
  [key: string]: unknown
}

export const Route = createFileRoute('/driver/home')({
  beforeLoad: ({ context }) => {
    requireAuth(context.auth)
    requireRole(context.auth, ['driver'])
  },
  component: DriverHomePage,
})

function DriverHomePage() {
  const { claims } = useAuth()
  const { data, isLoading } = useLoads() as { data: LoadData[] | undefined; isLoading: boolean }

  // Find loads assigned to this driver that are active
  const assignedLoads = (data || []).filter(
    (load: LoadData) =>
      load.driverId === claims?.driverId &&
      load.status !== LOAD_STATUS.DELIVERED &&
      load.status !== LOAD_STATUS.CANCELLED
  ) as LoadData[]

  const currentLoad: LoadData | undefined = assignedLoads[0] // Most recent assigned load

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Driver Home</h1>

      {isLoading ? (
        <div
          style={{
            padding: '3rem',
            textAlign: 'center',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#f9fafb',
          }}
        >
          <p style={{ color: '#6b7280' }}>Loading your assignments...</p>
        </div>
      ) : currentLoad ? (
        <div
          style={{
            padding: '2rem',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
          }}
        >
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
            Current Load
          </h2>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: '600' }}>Load #: </span>
              {currentLoad.loadNumber ?? 'Unknown'}
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: '600' }}>Status: </span>
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: '#dbeafe',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                }}
              >
                {currentLoad.status ?? 'Unknown'}
              </span>
            </div>
            {currentLoad.stops &&
              Array.isArray(currentLoad.stops) &&
              currentLoad.stops.length > 0 && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '600' }}>Next Stop: </span>
                  {currentLoad.stops[0]?.address ?? 'Unknown'}
                </div>
              )}
          </div>
          <Link
            to="/driver/loads/$loadId"
            params={{ loadId: currentLoad.id }}
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2563eb',
              color: 'white',
              borderRadius: '0.375rem',
              textDecoration: 'none',
              fontWeight: '500',
            }}
          >
            Open Current Load →
          </Link>

          {assignedLoads.length > 1 && (
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600' }}>
                Other Assigned Loads ({assignedLoads.length - 1})
              </h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {assignedLoads.slice(1).map((load: LoadData) => (
                  <li key={load.id} style={{ marginBottom: '0.5rem' }}>
                    <Link
                      to="/driver/loads/$loadId"
                      params={{ loadId: load.id }}
                      style={{ color: '#2563eb', textDecoration: 'underline' }}
                    >
                      Load {load.loadNumber ?? 'Unknown'} - {load.status ?? 'Unknown'}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            padding: '3rem',
            textAlign: 'center',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#f9fafb',
          }}
        >
          <svg
            style={{ width: '64px', height: '64px', marginBottom: '1rem', color: '#9ca3af' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h2 style={{ color: '#6b7280', marginBottom: '0.5rem' }}>No load assigned</h2>
          <p style={{ color: '#9ca3af' }}>Check back later for your next assignment</p>
        </div>
      )}
    </div>
  )
}
