// carrier-ops-hub/apps/web/src/features/loads/hooks.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { loadsRepo, type LoadData } from '@/services/repos/loads.repo'
import { queryKeys } from '@/data/queryKeys'
import { useAuth } from '@/app/providers/AuthContext'

export type { LoadData }

export function useLoads() {
  const { claims } = useAuth()
  const fleetId = claims.fleetId

  return useQuery({
    queryKey: queryKeys.loads.byFleet(fleetId || ''),
    queryFn: () => loadsRepo.listByFleet({ fleetId: fleetId || '' }),
    enabled: !!fleetId,
  })
}

export function useLoad(loadId: string) {
  const { claims } = useAuth()
  const fleetId = claims.fleetId

  return useQuery({
    queryKey: queryKeys.loads.detail(fleetId || '', loadId),
    queryFn: () => loadsRepo.getById({ fleetId: fleetId || '', loadId }),
    enabled: !!fleetId && !!loadId,
  })
}

export function useUpdateLoad(loadId: string) {
  const { claims } = useAuth()
  const queryClient = useQueryClient()
  const fleetId = claims.fleetId

  return useMutation({
    mutationFn: (updates: Partial<LoadData>) =>
      loadsRepo.updateLoad({ fleetId: fleetId || '', loadId, updates }),
    onSuccess: () => {
      if (fleetId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.loads.detail(fleetId, loadId) })
        queryClient.invalidateQueries({ queryKey: queryKeys.loads.byFleet(fleetId) })
      }
    },
  })
}

export function useAssignLoad(loadId: string) {
  const { claims, user } = useAuth()
  const queryClient = useQueryClient()
  const fleetId = claims.fleetId

  return useMutation({
    mutationFn: ({ driverId, vehicleId }: { driverId: string; vehicleId: string }) =>
      loadsRepo.assignLoad({
        fleetId: fleetId || '',
        loadId,
        driverId,
        vehicleId,
        actorUid: user?.uid || '',
      }),
    onSuccess: () => {
      if (fleetId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.loads.detail(fleetId, loadId) })
        queryClient.invalidateQueries({ queryKey: queryKeys.loads.byFleet(fleetId) })
        queryClient.invalidateQueries({ queryKey: queryKeys.events.byLoad(fleetId, loadId) })
      }
    },
  })
}

export function useCreateLoad() {
  const { claims } = useAuth()
  const queryClient = useQueryClient()
  const fleetId = claims.fleetId

  return useMutation({
    mutationFn: (load: Partial<LoadData>) => loadsRepo.createLoad({ fleetId: fleetId || '', load }),
    onSuccess: () => {
      if (fleetId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.loads.byFleet(fleetId) })
      }
    },
  })
}
