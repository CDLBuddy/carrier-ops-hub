// carrier-ops-hub/apps/web/src/app/routing/routes/driver/home.tsx

import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routing/guards/requireAuth'
import { requireRole } from '@/app/routing/guards/requireRole'

export const Route = createFileRoute('/driver/home')({
  beforeLoad: ({ context }) => {
    requireAuth(context.auth)
    requireRole(context.auth, ['driver'])
  },
  component: DriverHomePage,
})

function DriverHomePage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Driver</h1>

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
    </div>
  )
}
