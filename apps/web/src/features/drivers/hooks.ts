// carrier-ops-hub/apps/web/src/features/drivers/hooks.ts

import { useQuery } from '@tanstack/react-query'
import { driversRepo } from '@/services/repos/drivers.repo'
import { queryKeys } from '@/data/queryKeys'
import { useAuth } from '@/app/providers/AuthContext'

export function useDrivers() {
  const { claims } = useAuth()
  const fleetId = claims.fleetId

  return useQuery({
    queryKey: queryKeys.drivers.byFleet(fleetId || ''),
    queryFn: () => driversRepo.listByFleet({ fleetId: fleetId || '' }),
    enabled: !!fleetId,
  })
}

export function useDriver(driverId: string) {
  const { claims } = useAuth()
  const fleetId = claims.fleetId

  return useQuery({
    queryKey: [...queryKeys.drivers.byFleet(fleetId || ''), 'detail', driverId],
    queryFn: () => driversRepo.getById({ fleetId: fleetId || '', driverId }),
    enabled: !!fleetId && !!driverId,
  })
}
