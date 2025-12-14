// carrier-ops-hub/apps/web/src/app/routing/routes/my-day/index.tsx

import { createFileRoute, Link } from '@tanstack/react-router'
import { requireAuth } from '@/app/routing/guards/requireAuth'
import { useAuth } from '@/app/providers/AuthContext'
import { ROLE_LABELS } from '@coh/shared'

export const Route = createFileRoute('/my-day/')({
  beforeLoad: ({ context }) => {
    requireAuth(context.auth)
  },
  component: MyDayPage,
})

function MyDayPage() {
  const { claims, user } = useAuth()

  const quickLinks = []

  if (claims.roles.includes('dispatcher') || claims.roles.includes('owner')) {
    quickLinks.push({ to: '/dispatch/dashboard', label: 'Dispatch Dashboard' })
  }

  if (claims.roles.includes('billing') || claims.roles.includes('owner')) {
    quickLinks.push({ to: '/billing/dashboard', label: 'Billing Dashboard' })
  }

  if (claims.roles.includes('driver')) {
    quickLinks.push({ to: '/driver/home', label: 'Driver Home' })
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>My Day</h1>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Quick Links</h2>
        <div
          style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          }}
        >
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                padding: '1.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#3B82F6',
                fontWeight: 'bold',
                textAlign: 'center',
                backgroundColor: '#f9fafb',
                transition: 'all 0.2s',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {import.meta.env.DEV && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1rem' }}>Dev Info</h3>
          <div style={{ fontSize: '0.875rem', fontFamily: 'monospace' }}>
            <div>Email: {user?.email}</div>
            <div>Fleet ID: {claims.fleetId || 'none'}</div>
            <div>Roles: {claims.roles.map((r) => ROLE_LABELS[r]).join(', ') || 'none'}</div>
            {claims.driverId && <div>Driver ID: {claims.driverId}</div>}
          </div>
        </div>
      )}
    </div>
  )
}
