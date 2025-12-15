// carrier-ops-hub/apps/web/src/features/loads/hooks.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { loadsRepo, type LoadData } from '@/services/repos/loads.repo'
import { queryKeys } from '@/data/queryKeys'
import { useAuth } from '@/app/providers/AuthContext'
import { useToast } from '@/ui/Toast'
import { getErrorMessage, getDriverActionName, getDispatcherActionName } from '@/lib/errorMessages'
import { computeDriverTransition } from './lifecycle'
import { computeDispatcherTransition } from './dispatcherLifecycle'
import type { DriverLoadAction } from './lifecycle'
import type { DispatcherLoadAction, AssignmentData } from './dispatcherLifecycle'

export type { LoadData }

// Re-export real-time hooks
export {
  useLoadRealtime,
  useLoadsRealtime,
  useEventsRealtime,
  useConnectionState,
  useFirestoreConnectionState,
} from './realtimeHooks'

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

export function useDriverAction(loadId: string) {
  const { claims, user } = useAuth()
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const fleetId = claims.fleetId
  const driverId = claims.driverId

  return useMutation({
    mutationFn: async (action: DriverLoadAction) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.loads.detail(fleetId || '', loadId) })

      // Snapshot previous value
      const previousLoad = queryClient.getQueryData<LoadData>(queryKeys.loads.detail(fleetId || '', loadId))

      // Optimistically update
      if (previousLoad) {
        const transition = computeDriverTransition(previousLoad, action, Date.now())

        // Apply stop updates if any
        const updatedStops = previousLoad.stops?.map((stop, index) => {
          const stopUpdate = transition.stopUpdates.find((u) => u.index === index)
          if (stopUpdate) {
            return {
              ...stop,
              actualTime: stopUpdate.actualTime,
              isCompleted: stopUpdate.isCompleted,
              updatedAt: stopUpdate.updatedAt,
            }
          }
          return stop
        })

        queryClient.setQueryData<LoadData>(queryKeys.loads.detail(fleetId || '', loadId), {
          ...previousLoad,
          status: transition.nextStatus,
          stops: updatedStops || previousLoad.stops,
          updatedAt: Date.now(),
        })
      }

      try {
        // Perform mutation
        await loadsRepo.applyDriverAction({
          fleetId: fleetId || '',
          loadId,
          action,
          actorUid: user?.uid || '',
          actorDriverId: driverId || '',
        })

        // Refetch to get server state
        await queryClient.invalidateQueries({ queryKey: queryKeys.loads.detail(fleetId || '', loadId) })
      } catch (error) {
        // Rollback on error
        queryClient.setQueryData<LoadData>(queryKeys.loads.detail(fleetId || '', loadId), previousLoad)

        // Show error toast
        const actionName = getDriverActionName(action)
        const errorMessage = getErrorMessage(error)
        showToast('error', `Failed to ${actionName}: ${errorMessage}`)

        throw error
      }
    },
    onSuccess: (_, action) => {
      // Show success toast
      const actionName = getDriverActionName(action)
      showToast('success', `Successfully completed: ${actionName}`)

      // Invalidate related queries
      if (fleetId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.loads.byFleet(fleetId) })
        queryClient.invalidateQueries({ queryKey: queryKeys.events.byLoad(fleetId, loadId) })
      }
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  })
}

export function useDispatcherAction(loadId: string) {
  const { claims, user } = useAuth()
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const fleetId = claims.fleetId

  return useMutation({
    mutationFn: async ({
      action,
      assignmentData,
      reason,
    }: {
      action: DispatcherLoadAction
      assignmentData?: AssignmentData
      reason?: string
    }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.loads.detail(fleetId || '', loadId) })

      // Snapshot previous value
      const previousLoad = queryClient.getQueryData<LoadData>(
        queryKeys.loads.detail(fleetId || '', loadId)
      )

      // Optimistically update
      if (previousLoad) {
        const transition = computeDispatcherTransition(previousLoad, action, assignmentData)

        const updates: Partial<LoadData> = {
          status: transition.nextStatus,
          updatedAt: Date.now(),
          ...transition.updates,
        }

        queryClient.setQueryData<LoadData>(queryKeys.loads.detail(fleetId || '', loadId), {
          ...previousLoad,
          ...updates,
        })
      }

      try {
        // Perform mutation
        await loadsRepo.applyDispatcherAction({
          fleetId: fleetId || '',
          loadId,
          action,
          actorUid: user?.uid || '',
          actorRole: claims.roles,
          assignmentData,
          reason,
        })

        // Refetch to get server state
        await queryClient.invalidateQueries({ queryKey: queryKeys.loads.detail(fleetId || '', loadId) })
      } catch (error) {
        // Rollback on error
        queryClient.setQueryData<LoadData>(queryKeys.loads.detail(fleetId || '', loadId), previousLoad)

        // Show error toast
        const actionName = getDispatcherActionName(action)
        const errorMessage = getErrorMessage(error)
        showToast('error', `Failed to ${actionName}: ${errorMessage}`)

        throw error
      }
    },
    onSuccess: (_, variables) => {
      // Show success toast
      const actionName = getDispatcherActionName(variables.action)
      showToast('success', `Successfully completed: ${actionName}`)

      // Invalidate related queries
      if (fleetId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.loads.byFleet(fleetId) })
        queryClient.invalidateQueries({ queryKey: queryKeys.events.byLoad(fleetId, loadId) })
      }
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  })
}
