// carrier-ops-hub/apps/web/src/app/routing/routes/driver/loads.$loadId.tsx

import { createFileRoute, Link } from '@tanstack/react-router'
import { useLoad, useDriverAction, type LoadData } from '@/features/loads/hooks'
import { useDocuments, useUploadDocument } from '@/features/documents/hooks'
import { useEvents } from '@/features/events/hooks'
import { useState } from 'react'
import { LOAD_STATUS, DOCUMENT_TYPE, type Address } from '@coh/shared'
import { requireAuth } from '@/app/routing/guards/requireAuth'
import { requireRole } from '@/app/routing/guards/requireRole'

interface StopData {
  type?: string
  address?: Address
  scheduledTime?: number
  actualTime?: number | null
  [key: string]: unknown
}

export const Route = createFileRoute('/driver/loads/$loadId')({
  beforeLoad: ({ context }) => {
    requireAuth(context.auth)
    requireRole(context.auth, ['driver'])
  },
  component: DriverLoadDetailPage,
})

function DriverLoadDetailPage() {
  const { loadId } = Route.useParams()
  const { data: load, isLoading: loadLoading } = useLoad(loadId)
  const { data: documents = [], isLoading: docsLoading } = useDocuments(loadId)
  const { data: events = [], isLoading: eventsLoading } = useEvents(loadId)
  const { mutate: performAction, isPending } = useDriverAction(loadId)
  const { mutate: uploadDocument } = useUploadDocument(loadId)

  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    uploadDocument(
      {
        file,
        docType: DOCUMENT_TYPE.POD,
        notes: 'Uploaded by driver',
      },
      {
        onSettled: () => setUploading(false),
      }
    )
  }

  if (loadLoading) return <div className="p-4">Loading load...</div>
  if (!load) return <div className="p-4">Load not found</div>

  const loadData: LoadData = load

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Load {loadData.loadNumber ?? 'Unknown'}</h1>
        <Link to="/driver/home" className="text-blue-600 hover:underline">
          ← Back to Home
        </Link>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-4">
        <span className="px-3 py-1 bg-blue-200 rounded-full text-sm font-medium">
          {loadData.status ?? 'Unknown'}
        </span>
      </div>

      {/* Driver Action Buttons */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Update Status</h2>
        <div className="grid grid-cols-2 gap-3">
          {loadData.status === LOAD_STATUS.ASSIGNED && (
            <button
              onClick={() => performAction('ARRIVE_PICKUP')}
              disabled={isPending}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {isPending ? 'Updating...' : 'Arrived at Pickup'}
            </button>
          )}
          {loadData.status === LOAD_STATUS.AT_PICKUP && (
            <button
              onClick={() => performAction('DEPART_PICKUP')}
              disabled={isPending}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
            >
              {isPending ? 'Updating...' : 'Depart Pickup (In Transit)'}
            </button>
          )}
          {loadData.status === LOAD_STATUS.IN_TRANSIT && (
            <button
              onClick={() => performAction('ARRIVE_DELIVERY')}
              disabled={isPending}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {isPending ? 'Updating...' : 'Arrived at Delivery'}
            </button>
          )}
          {loadData.status === LOAD_STATUS.AT_DELIVERY && (
            <button
              onClick={() => performAction('MARK_DELIVERED')}
              disabled={isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {isPending ? 'Updating...' : 'Mark Delivered'}
            </button>
          )}
        </div>
      </div>

      {/* Stops Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Stops</h2>
        {loadData.stops && Array.isArray(loadData.stops) && loadData.stops.length > 0 ? (
          <div className="space-y-3">
            {loadData.stops.map((stop: StopData, idx: number) => (
              <div key={idx} className="border-l-4 border-blue-500 pl-4">
                <div className="font-medium">{stop.type ?? 'Unknown'}</div>
                <div className="text-sm text-gray-600">
                  {stop.address
                    ? `${stop.address.street}, ${stop.address.city}, ${stop.address.state} ${stop.address.zip}`
                    : 'Address unknown'}
                </div>
                <div className="text-xs text-gray-500">
                  {stop.scheduledTime
                    ? new Date(stop.scheduledTime).toLocaleString()
                    : 'Scheduled time TBD'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No stops defined</p>
        )}
      </div>

      {/* Documents Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Documents</h2>
        <label className="block mb-4">
          <span className="text-sm font-medium">Upload POD or Document</span>
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
            className="block mt-2 text-sm"
          />
        </label>
        {docsLoading ? (
          <p>Loading documents...</p>
        ) : documents.length > 0 ? (
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li key={doc.id ?? Math.random()} className="flex items-center justify-between">
                <span className="text-sm">
                  {doc.type ?? 'Unknown'} -{' '}
                  {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Unknown'}
                </span>
                <a
                  href={doc.url ?? '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  View
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No documents uploaded</p>
        )}
      </div>

      {/* Events Timeline */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Activity Timeline</h2>
        {eventsLoading ? (
          <p>Loading events...</p>
        ) : events.length > 0 ? (
          <ul className="space-y-2">
            {events.map((event) => (
              <li key={event.id ?? Math.random()} className="text-sm">
                <span className="font-medium">{event.type ?? 'Unknown'}</span>
                <span className="text-gray-600 ml-2">
                  {event.createdAt ? new Date(event.createdAt).toLocaleString() : 'Unknown'}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No events recorded</p>
        )}
      </div>
    </div>
  )
}
