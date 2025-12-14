// carrier-ops-hub/apps/web/src/app/routing/routes/dispatch/dashboard.tsx

import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { requireAuth } from '@/app/routing/guards/requireAuth'
import { requireRole } from '@/app/routing/guards/requireRole'
import { useLoads, useCreateLoad } from '@/features/loads/hooks'

interface LoadData {
  id: string
  loadNumber?: string
  status?: string
  customerName?: string
  updatedAt?: number
  [key: string]: unknown
}

export const Route = createFileRoute('/dispatch/dashboard')({
  beforeLoad: ({ context }) => {
    requireAuth(context.auth)
    requireRole(context.auth, ['dispatcher', 'owner'])
  },
  component: DispatchDashboard,
})

function DispatchDashboard() {
  const { data: loads, isLoading } = useLoads() as {
    data: LoadData[] | undefined
    isLoading: boolean
  }
  const createLoad = useCreateLoad()
  const [showForm, setShowForm] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [referenceNumber, setReferenceNumber] = useState('')

  const handleCreateLoad = async (e: React.FormEvent) => {
    e.preventDefault()

    // Create two placeholder stops
    const stops = [
      {
        id: `stop-${Date.now()}-1`,
        type: 'PICKUP',
        sequence: 0,
        address: { street: '', city: '', state: '', zip: '', country: 'US' },
        scheduledTime: Date.now(),
        actualTime: null,
        isCompleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: `stop-${Date.now()}-2`,
        type: 'DELIVERY',
        sequence: 1,
        address: { street: '', city: '', state: '', zip: '', country: 'US' },
        scheduledTime: Date.now() + 86400000, // +1 day
        actualTime: null,
        isCompleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]

    await createLoad.mutateAsync({
      customerName: customerName.trim(),
      referenceNumber: referenceNumber.trim(),
      status: 'UNASSIGNED',
      stops,
    })

    // Reset form
    setCustomerName('')
    setReferenceNumber('')
    setShowForm(false)
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div
        style={{
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1 style={{ margin: 0 }}>Dispatch</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          {showForm ? 'Cancel' : 'Create Load'}
        </button>
      </div>

      {showForm && (
        <div
          style={{
            marginBottom: '2rem',
            padding: '1.5rem',
            border: '1px solid #ccc',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>New Load</h2>
          <form onSubmit={handleCreateLoad}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Customer Name (optional)
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g., ACME Corp"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  fontSize: '1rem',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Reference Number (optional)
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g., PO-12345"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  fontSize: '1rem',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={createLoad.isPending}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: createLoad.isPending ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
              }}
            >
              {createLoad.isPending ? 'Creating...' : 'Create Load'}
            </button>
          </form>
        </div>
      )}

      <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
        <div
          style={{
            backgroundColor: '#f9fafb',
            padding: '1rem',
            borderBottom: '1px solid #e5e7eb',
            fontWeight: 'bold',
          }}
        >
          Loads
        </div>

        {isLoading && <div style={{ padding: '2rem', textAlign: 'center' }}>Loading loads...</div>}

        {!isLoading && loads && loads.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
            <p>No loads yet. Click "Create Load" to get started.</p>
          </div>
        )}

        {!isLoading && loads && loads.length > 0 && (
          <div>
            {loads.map((load: LoadData) => (
              <div
                key={load.id}
                style={{
                  padding: '1rem',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                    {load.loadNumber ?? 'Unknown'}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>
                    Status: {load.status ?? 'Unknown'}
                    {load.customerName && ` • ${load.customerName}`}
                  </div>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>
                  {load.updatedAt ? new Date(load.updatedAt).toLocaleDateString() : 'Unknown'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
