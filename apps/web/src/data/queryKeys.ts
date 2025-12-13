// carrier-ops-hub/apps/web/src/data/queryKeys.ts

// Query key factory for TanStack Query

export const queryKeys = {
  loads: {
    all: ['loads'] as const,
    lists: () => [...queryKeys.loads.all, 'list'] as const,
    list: (filters: unknown) => [...queryKeys.loads.lists(), filters] as const,
    details: () => [...queryKeys.loads.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.loads.details(), id] as const,
  },
  events: {
    all: ['events'] as const,
    byLoad: (loadId: string) => [...queryKeys.events.all, 'load', loadId] as const,
  },
  documents: {
    all: ['documents'] as const,
    byLoad: (loadId: string) => [...queryKeys.documents.all, 'load', loadId] as const,
  },
} as const;
