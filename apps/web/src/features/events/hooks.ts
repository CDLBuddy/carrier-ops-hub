// carrier-ops-hub/apps/web/src/features/events/hooks.ts

import { useQuery } from '@tanstack/react-query'
import { eventsRepo } from '@/services/repos/events.repo'
import { queryKeys } from '@/data/queryKeys'
import { useAuth } from '@/app/providers/AuthContext'

export function useEvents(loadId: string) {
  const { claims } = useAuth()
  const fleetId = claims.fleetId

  return useQuery({
    queryKey: queryKeys.events.byLoad(loadId),
    queryFn: () => eventsRepo.listForLoad({ fleetId: fleetId || '', loadId }),
    enabled: !!fleetId && !!loadId,
  })
}
