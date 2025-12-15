// carrier-ops-hub/apps/web/src/app/routing/routes/billing/dashboard.tsx

import { createFileRoute, Link } from '@tanstack/react-router'
import { useLoads, type LoadData } from '@/features/loads/hooks'
import { useDocuments, type DocumentData } from '@/features/documents/hooks'
import { LOAD_STATUS, DOCUMENT_TYPE } from '@coh/shared'
import { useMemo } from 'react'
import { requireAuth } from '@/app/routing/guards/requireAuth'
import { requireRole } from '@/app/routing/guards/requireRole'

export const Route = createFileRoute('/billing/dashboard')({
  beforeLoad: ({ context }) => {
    requireAuth(context.auth)
    requireRole(context.auth, ['billing', 'owner'])
  },
  component: BillingDashboard,
})

function BillingDashboard() {
  const { data: loads = [], isLoading: loadsLoading } = useLoads()

  // Filter delivered loads
  const deliveredLoads = loads.filter((load) => load.status === LOAD_STATUS.DELIVERED)

  // Group loads by billing readiness
  const { readyLoads, blockedLoads } = useMemo(() => {
    const ready: LoadData[] = []
    const blocked: LoadData[] = []

    deliveredLoads.forEach((load) => {
      // Check if load has required documents (will be determined per load)
      ready.push(load) // Temporarily add to ready, will be refined below
    })

    return { readyLoads: ready, blockedLoads: blocked }
  }, [deliveredLoads])

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Billing Dashboard</h1>

      {loadsLoading ? (
        <div className="text-center p-8">
          <p className="text-gray-600">Loading loads...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {/* Ready for Billing */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-green-700">
              Ready for Billing ({readyLoads.length})
            </h2>
            {readyLoads.length > 0 ? (
              <ul className="space-y-2">
                {readyLoads.map((load) => (
                  <LoadBillingCard key={load.id} load={load} />
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No loads ready for billing</p>
            )}
          </div>

          {/* Blocked */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-red-700">
              Blocked ({blockedLoads.length})
            </h2>
            {blockedLoads.length > 0 ? (
              <ul className="space-y-2">
                {blockedLoads.map((load) => (
                  <LoadBillingCard key={load.id} load={load} />
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No blocked loads</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function LoadBillingCard({ load }: { load: LoadData }) {
  const { data: documents = [] } = useDocuments(load.id) as { data: DocumentData[] }

  const hasPOD = documents.some((doc) => doc.type === DOCUMENT_TYPE.POD)
  const hasRateConfirmation = documents.some((doc) => doc.type === DOCUMENT_TYPE.RATE_CONFIRMATION)

  const isActuallyReady = hasPOD && hasRateConfirmation
  const missingDocs: string[] = []
  if (!hasPOD) missingDocs.push('POD')
  if (!hasRateConfirmation) missingDocs.push('Rate Confirmation')

  return (
    <li className="border border-gray-200 rounded p-3">
      <div className="flex items-center justify-between mb-2">
        <Link
          to="/dispatch/loads/$loadId"
          params={{ loadId: load.id }}
          className="font-medium text-blue-600 hover:underline"
        >
          Load {load.loadNumber ?? 'Unknown'}
        </Link>
        <span
          className={`px-2 py-1 text-xs rounded ${
            isActuallyReady ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {isActuallyReady ? 'Ready' : 'Blocked'}
        </span>
      </div>
      <div className="text-sm text-gray-600">
        <div>POD: {hasPOD ? '✓' : '✗'}</div>
        <div>Rate Confirmation: {hasRateConfirmation ? '✓' : '✗'}</div>
      </div>
      {missingDocs.length > 0 && (
        <div className="text-xs text-red-600 mt-2">Missing: {missingDocs.join(', ')}</div>
      )}
    </li>
  )
}
