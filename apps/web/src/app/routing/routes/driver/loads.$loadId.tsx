// carrier-ops-hub/apps/web/src/app/routing/routes/driver/loads.$loadId.tsx

import { createFileRoute, Link } from '@tanstack/react-router'
import { useLoad, useUpdateLoad } from '@/features/loads/hooks'
import { useDocuments, useUploadDocument } from '@/features/documents/hooks'
import { useEvents } from '@/features/events/hooks'
import { useState } from 'react'
import { useAuth } from '@/app/providers/AuthContext'
import { LOAD_STATUS, DOCUMENT_TYPE, EVENT_TYPE } from '@coh/shared'
import { eventsRepo } from '@/services/repos/events.repo'

export const Route = createFileRoute('/driver/loads/$loadId')({
  component: DriverLoadDetailPage,
})

function DriverLoadDetailPage() {
  const { loadId } = Route.useParams()
  const { user, claims } = useAuth()
  const { data: load, isLoading: loadLoading } = useLoad(loadId)
  const { data: documents = [], isLoading: docsLoading } = useDocuments(loadId)
  const { data: events = [], isLoading: eventsLoading } = useEvents(loadId)
  const { mutate: updateLoad } = useUpdateLoad(loadId)
  const { mutate: uploadDocument } = useUploadDocument(loadId)

  const [uploading, setUploading] = useState(false)

  const handleStatusChange = async (newStatus: string, eventType: string) => {
    if (!claims.fleetId || !user?.uid) return

    // Create event first
    await eventsRepo.create({
      fleetId: claims.fleetId,
      loadId,
      type: eventType as any,
      actorUid: user.uid,
      payload: { previousStatus: (load as any)?.status, newStatus },
    })

    // Update load status
    updateLoad({ status: newStatus as any })
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

  const loadData = load as any

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Load {loadData.loadNumber}</h1>
        <Link to="/driver/home" className="text-blue-600 hover:underline">
          ← Back to Home
        </Link>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-4">
        <span className="px-3 py-1 bg-blue-200 rounded-full text-sm font-medium">
          {loadData.status}
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
        {loadData.stops && loadData.stops.length > 0 ? (
          <div className="space-y-3">
            {loadData.stops.map((stop: any, idx: number) => (
              <div key={idx} className="border-l-4 border-blue-500 pl-4">
                <div className="font-medium">{stop.type}</div>
                <div className="text-sm text-gray-600">{stop.address}</div>
                <div className="text-xs text-gray-500">
                  {new Date(stop.scheduledDate).toLocaleDateString()} {stop.scheduledTime}
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
            {documents.map((doc: any) => (
              <li key={doc.id} className="flex items-center justify-between">
                <span className="text-sm">
                  {doc.type} - {new Date(doc.createdAt).toLocaleDateString()}
                </span>
                <a
                  href={doc.url}
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
            {events.map((event: any) => (
              <li key={event.id} className="text-sm">
                <span className="font-medium">{event.type}</span>
                <span className="text-gray-600 ml-2">
                  {new Date(event.createdAt).toLocaleString()}
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
