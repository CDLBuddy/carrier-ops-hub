// carrier-ops-hub/apps/web/src/app/routing/routes/dispatch/loads.$loadId.tsx

import { createFileRoute, Link } from '@tanstack/react-router'
import { useLoad, useUpdateLoad } from '@/features/loads/hooks'
import { useDocuments, useUploadDocument } from '@/features/documents/hooks'
import { useEvents } from '@/features/events/hooks'
import { useState } from 'react'
import { LOAD_STATUS, DOCUMENT_TYPE } from '@coh/shared'
import type { LoadData } from '@/services/repos/loads.repo'

export const Route = createFileRoute('/dispatch/loads/$loadId')({
  component: LoadDetailPage,
})

function LoadDetailPage() {
  const { loadId } = Route.useParams()
  const { data: load, isLoading: loadLoading } = useLoad(loadId)
  const { data: documents = [], isLoading: docsLoading } = useDocuments(loadId)
  const { data: events = [], isLoading: eventsLoading } = useEvents(loadId)
  const { mutate: updateLoad } = useUpdateLoad(loadId)
  const { mutate: uploadDocument } = useUploadDocument(loadId)

  const [selectedDriver, setSelectedDriver] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [uploading, setUploading] = useState(false)

  const handleAssign = () => {
    if (!selectedDriver || !selectedVehicle) return
    const updates: Partial<LoadData> = {
      assignedDriverUid: selectedDriver,
      assignedVehicleId: selectedVehicle,
      status: LOAD_STATUS.ASSIGNED as any,
    }
    updateLoad(updates)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    uploadDocument(
      {
        file,
        docType: DOCUMENT_TYPE.OTHER,
        notes: 'Uploaded from dispatch',
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
        <Link to="/dispatch/dashboard" className="text-blue-600 hover:underline">
          ← Back to Dispatch
        </Link>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-4">
        <span className="px-3 py-1 bg-gray-200 rounded-full text-sm font-medium">
          {loadData.status}
        </span>
        {loadData.assignedDriverUid && (
          <span className="text-sm text-gray-600">Driver: {loadData.assignedDriverUid}</span>
        )}
        {loadData.assignedVehicleId && (
          <span className="text-sm text-gray-600">Vehicle: {loadData.assignedVehicleId}</span>
        )}
      </div>

      {/* Assignment Section (if not assigned) */}
      {loadData.status === LOAD_STATUS.UNASSIGNED && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Assign Load</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Driver</label>
              <input
                type="text"
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                placeholder="Driver UID"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Vehicle</label>
              <input
                type="text"
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                placeholder="Vehicle ID"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          </div>
          <button
            onClick={handleAssign}
            disabled={!selectedDriver || !selectedVehicle}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            Assign Load
          </button>
        </div>
      )}

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
        <input
          type="file"
          onChange={handleFileUpload}
          disabled={uploading}
          className="mb-4 text-sm"
        />
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
