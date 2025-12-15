// carrier-ops-hub/apps/web/src/data/invalidation.ts

import { queryClient } from './queryClient'
import { queryKeys } from './queryKeys'

// Helper functions for query invalidation

export function invalidateLoads() {
  return queryClient.invalidateQueries({ queryKey: queryKeys.loads.all })
}

export function invalidateLoad(fleetId: string, loadId: string) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.loads.detail(fleetId, loadId) })
}

export function invalidateEvents(fleetId: string, loadId: string) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.events.byLoad(fleetId, loadId) })
}
