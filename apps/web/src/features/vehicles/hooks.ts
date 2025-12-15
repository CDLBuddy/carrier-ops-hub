// carrier-ops-hub/apps/web/src/features/vehicles/hooks.ts

import { useQuery } from '@tanstack/react-query'
import { vehiclesRepo } from '@/services/repos/vehicles.repo'
import { queryKeys } from '@/data/queryKeys'
import { useAuth } from '@/app/providers/AuthContext'

export function useVehicles() {
  const { claims } = useAuth()
  const fleetId = claims.fleetId

  return useQuery({
    queryKey: queryKeys.vehicles.byFleet(fleetId || ''),
    queryFn: () => vehiclesRepo.listByFleet({ fleetId: fleetId || '' }),
    enabled: !!fleetId,
  })
}

export function useVehicle(vehicleId: string) {
  const { claims } = useAuth()
  const fleetId = claims.fleetId

  return useQuery({
    queryKey: [...queryKeys.vehicles.byFleet(fleetId || ''), 'detail', vehicleId],
    queryFn: () => vehiclesRepo.getById({ fleetId: fleetId || '', vehicleId }),
    enabled: !!fleetId && !!vehicleId,
  })
}
