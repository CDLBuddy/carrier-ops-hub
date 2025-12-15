// carrier-ops-hub/apps/web/src/data/queryKeys.ts

// Query key factory for TanStack Query

export const queryKeys = {
  loads: {
    all: ['loads'] as const,
    byFleet: (fleetId: string) => [...queryKeys.loads.all, 'fleet', fleetId] as const,
    lists: () => [...queryKeys.loads.all, 'list'] as const,
    list: (filters: unknown) => [...queryKeys.loads.lists(), filters] as const,
    details: () => [...queryKeys.loads.all, 'detail'] as const,
    detail: (fleetId: string, loadId: string) =>
      [...queryKeys.loads.all, 'fleet', fleetId, 'detail', loadId] as const,
  },
  events: {
    all: ['events'] as const,
    byLoad: (fleetId: string, loadId: string) =>
      [...queryKeys.events.all, 'fleet', fleetId, 'load', loadId] as const,
  },
  documents: {
    all: ['documents'] as const,
    byLoad: (fleetId: string, loadId: string) =>
      [...queryKeys.documents.all, 'fleet', fleetId, 'load', loadId] as const,
  },
  drivers: {
    all: ['drivers'] as const,
    byFleet: (fleetId: string) => [...queryKeys.drivers.all, 'fleet', fleetId] as const,
  },
  vehicles: {
    all: ['vehicles'] as const,
    byFleet: (fleetId: string) => [...queryKeys.vehicles.all, 'fleet', fleetId] as const,
  },
} as const
