// carrier-ops-hub/apps/web/src/app/routing/routes/dispatch/loads.$loadId.tsx

import { createFileRoute, Link } from '@tanstack/react-router'
import { useLoad, useUpdateLoad } from '@/features/loads/hooks'
import { useDocuments, useUploadDocument } from '@/features/documents/hooks'
import { useEvents } from '@/features/events/hooks'
import { useDrivers } from '@/features/drivers/hooks'
import { useVehicles } from '@/features/vehicles/hooks'
import { useState, useMemo } from 'react'
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

export const Route = createFileRoute('/dispatch/loads/$loadId')({
  beforeLoad: ({ context }) => {
    requireAuth(context.auth)
    requireRole(context.auth, ['dispatcher', 'owner'])
  },
  component: LoadDetailPage,
})

function LoadDetailPage() {
  const { loadId } = Route.useParams()
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
  const { data: drivers = [], isLoading: driversLoading } = useDrivers()
  const { data: vehicles = [], isLoading: vehiclesLoading } = useVehicles()
  const { mutate: updateLoad } = useUpdateLoad(loadId)
  const { mutate: uploadDocument } = useUploadDocument(loadId)

  const [selectedDriver, setSelectedDriver] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [uploading, setUploading] = useState(false)

  // Build lookup maps for pretty labels
  const driverMap = useMemo(() => new Map(drivers.map((d) => [d.id, d])), [drivers])
  const vehicleMap = useMemo(() => new Map(vehicles.map((v) => [v.id, v])), [vehicles])

  const handleAssign = () => {
    if (!selectedDriver || !selectedVehicle) return
    const updates: Partial<LoadData> = {
      driverId: selectedDriver,
      vehicleId: selectedVehicle,
      status: LOAD_STATUS.ASSIGNED,
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

  const loadData: LoadData = load

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Load {loadData.loadNumber ?? 'Unknown'}</h1>
        <Link to="/dispatch/dashboard" className="text-blue-600 hover:underline">
          ← Back to Dispatch
        </Link>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-4">
        <span className="px-3 py-1 bg-gray-200 rounded-full text-sm font-medium">
          {loadData.status ?? 'Unknown'}
        </span>
        {loadData.driverId && (
          <span className="text-sm text-gray-600">
            Driver:{' '}
            {driverMap.get(loadData.driverId)
              ? `${driverMap.get(loadData.driverId)!.firstName} ${driverMap.get(loadData.driverId)!.lastName}`
              : loadData.driverId}
          </span>
        )}
        {loadData.vehicleId && (
          <span className="text-sm text-gray-600">
            Vehicle:{' '}
            {vehicleMap.get(loadData.vehicleId)
              ? vehicleMap.get(loadData.vehicleId)!.vehicleNumber
              : loadData.vehicleId}
          </span>
        )}
      </div>

      {/* Assignment Section (if not assigned) */}
      {loadData.status === LOAD_STATUS.UNASSIGNED && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Assign Load</h2>
          {driversLoading || vehiclesLoading ? (
            <p className="text-gray-600">Loading drivers and vehicles...</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Driver</label>
                  {drivers.length === 0 ? (
                    <p className="text-sm text-gray-500">No drivers available</p>
                  ) : (
                    <select
                      value={selectedDriver}
                      onChange={(e) => setSelectedDriver(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    >
                      <option value="">Select driver...</option>
                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.firstName} {driver.lastName}
                          {driver.status !== 'ACTIVE' ? ` (${driver.status})` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Vehicle</label>
                  {vehicles.length === 0 ? (
                    <p className="text-sm text-gray-500">No vehicles available</p>
                  ) : (
                    <select
                      value={selectedVehicle}
                      onChange={(e) => setSelectedVehicle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    >
                      <option value="">Select vehicle...</option>
                      {vehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.vehicleNumber} • {vehicle.make} {vehicle.model} ({vehicle.year})
                          {vehicle.status !== 'ACTIVE' ? ` (${vehicle.status})` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
              <button
                onClick={handleAssign}
                disabled={!selectedDriver || !selectedVehicle}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                Assign Load
              </button>
            </>
          )}
        </div>
      )}

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
            {documents.map((doc: DocumentData) => (
              <li key={doc.id as string} className="flex items-center justify-between">
                <span className="text-sm">
                  {doc.type ?? 'Unknown'} -{' '}
                  {doc.createdAt
                    ? new Date(doc.createdAt as number).toLocaleDateString()
                    : 'Unknown'}
                </span>
                <a
                  href={(doc.url as string) ?? '#'}
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
              <li key={event.id as string} className="text-sm">
                <span className="font-medium">{event.type ?? 'Unknown'}</span>
                <span className="text-gray-600 ml-2">
                  {event.createdAt
                    ? new Date(event.createdAt as number).toLocaleString()
                    : 'Unknown'}
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
