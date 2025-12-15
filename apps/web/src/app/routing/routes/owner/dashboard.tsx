// carrier-ops-hub/apps/web/src/app/routing/routes/owner/dashboard.tsx

import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routing/guards/requireAuth'
import { requireRole } from '@/app/routing/guards/requireRole'
import { useDrivers } from '@/features/drivers/hooks'
import { useVehicles } from '@/features/vehicles/hooks'

export const Route = createFileRoute('/owner/dashboard')({
  beforeLoad: ({ context }) => {
    requireAuth(context.auth)
    requireRole(context.auth, ['owner'])
  },
  component: OwnerDashboard,
})

function OwnerDashboard() {
  const { data: drivers = [], isLoading: driversLoading } = useDrivers()
  const { data: vehicles = [], isLoading: vehiclesLoading } = useVehicles()

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Owner Dashboard</h1>

      {/* Drivers Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">
          Drivers {driversLoading ? '' : `(${drivers.length})`}
        </h2>
        {driversLoading ? (
          <p className="text-gray-600">Loading drivers...</p>
        ) : drivers.length === 0 ? (
          <p className="text-gray-500">No drivers found</p>
        ) : (
          <ul className="space-y-2">
            {drivers.slice(0, 10).map((driver) => (
              <li key={driver.id} className="flex items-center justify-between text-sm">
                <span>
                  {driver.firstName} {driver.lastName}
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    driver.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {driver.status}
                </span>
              </li>
            ))}
            {drivers.length > 10 && (
              <li className="text-sm text-gray-500 italic">...and {drivers.length - 10} more</li>
            )}
          </ul>
        )}
      </div>

      {/* Vehicles Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">
          Vehicles {vehiclesLoading ? '' : `(${vehicles.length})`}
        </h2>
        {vehiclesLoading ? (
          <p className="text-gray-600">Loading vehicles...</p>
        ) : vehicles.length === 0 ? (
          <p className="text-gray-500">No vehicles found</p>
        ) : (
          <ul className="space-y-2">
            {vehicles.slice(0, 10).map((vehicle) => (
              <li key={vehicle.id} className="flex items-center justify-between text-sm">
                <span>
                  {vehicle.vehicleNumber} • {vehicle.make} {vehicle.model} ({vehicle.year})
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    vehicle.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : vehicle.status === 'MAINTENANCE'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {vehicle.status}
                </span>
              </li>
            ))}
            {vehicles.length > 10 && (
              <li className="text-sm text-gray-500 italic">...and {vehicles.length - 10} more</li>
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
