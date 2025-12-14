// carrier-ops-hub/apps/web/src/data/invalidation.ts

import { queryClient } from './queryClient'
import { queryKeys } from './queryKeys'

// Helper functions for query invalidation

export function invalidateLoads() {
  return queryClient.invalidateQueries({ queryKey: queryKeys.loads.all })
}

export function invalidateLoad(loadId: string) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.loads.detail(loadId) })
}

export function invalidateEvents(loadId: string) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.events.byLoad(loadId) })
}
