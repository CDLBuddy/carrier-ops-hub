// carrier-ops-hub/apps/web/src/app/routing/routes/driver/loads.$loadId.tsx

import { createFileRoute, Link } from '@tanstack/react-router'
import { useLoad, useUpdateLoad } from '@/features/loads/hooks'
import { useDocuments, useUploadDocument } from '@/features/documents/hooks'
import { useEvents } from '@/features/events/hooks'
import { useState } from 'react'
import { useAuth } from '@/app/providers/AuthContext'
import { LOAD_STATUS, DOCUMENT_TYPE, EVENT_TYPE, type EventType, type Address } from '@coh/shared'
import { eventsRepo } from '@/services/repos/events.repo'
import { requireAuth } from '@/app/routing/guards/requireAuth'
import { requireRole } from '@/app/routing/guards/requireRole'

interface StopData {
  type?: string
  address?: Address
  scheduledTime?: number
  actualTime?: number | null
  [key: string]: unknown
}

interface LoadData {
  id: string
  loadNumber?: string
  status?: string
  driverId?: string
  vehicleId?: string
  stops?: StopData[]
  [key: string]: unknown
}

interface DocumentData {
  id?: string
  type?: string
  createdAt?: number
  url?: string
  [key: string]: unknown
}

interface EventData {
  id?: string
  type?: string
  createdAt?: number
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
  const { user, claims } = useAuth()
  const { data: load, isLoading: loadLoading } = useLoad(loadId) as {
    data: LoadData | undefined
    isLoading: boolean
  }
  const { data: documents = [], isLoading: docsLoading } = useDocuments(loadId) as {
    data: DocumentData[]
    isLoading: boolean
  }
  const { data: events = [], isLoading: eventsLoading } = useEvents(loadId) as {
    data: EventData[]
    isLoading: boolean
  }
  const { mutate: updateLoad } = useUpdateLoad(loadId)
  const { mutate: uploadDocument } = useUploadDocument(loadId)

  const [uploading, setUploading] = useState(false)

  const handleStatusChange = async (newStatus: string, eventType: EventType) => {
    if (!claims.fleetId || !user?.uid) return

    // Create event first
    await eventsRepo.create({
      fleetId: claims.fleetId,
      loadId,
      type: eventType,
      actorUid: user.uid,
      payload: { previousStatus: load?.status, newStatus },
    })

    // Update load status
    updateLoad({ status: newStatus })
  }

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
              onClick={() => handleStatusChange(LOAD_STATUS.AT_PICKUP, EVENT_TYPE.STATUS_CHANGED)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Arrived at Pickup
            </button>
          )}
          {loadData.status === LOAD_STATUS.AT_PICKUP && (
            <button
              onClick={() => handleStatusChange(LOAD_STATUS.IN_TRANSIT, EVENT_TYPE.STOP_COMPLETED)}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Depart Pickup (In Transit)
            </button>
          )}
          {loadData.status === LOAD_STATUS.IN_TRANSIT && (
            <button
              onClick={() => handleStatusChange(LOAD_STATUS.AT_DELIVERY, EVENT_TYPE.STATUS_CHANGED)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Arrived at Delivery
            </button>
          )}
          {loadData.status === LOAD_STATUS.AT_DELIVERY && (
            <button
              onClick={() => handleStatusChange(LOAD_STATUS.DELIVERED, EVENT_TYPE.STOP_COMPLETED)}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Mark Delivered
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
            {documents.map((doc: DocumentData) => (
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
            {events.map((event: EventData) => (
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
