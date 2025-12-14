// carrier-ops-hub/packages/shared/src/constants/collections.ts

export const COLLECTIONS = {
  FLEETS: 'fleets',
  USERS: 'users',
  DRIVERS: 'drivers',
  VEHICLES: 'vehicles',
  LOADS: 'loads',
  STOPS: 'stops',
  DOCUMENTS: 'documents',
  EXPENSES: 'expenses',
  EVENTS: 'events',
  THREADS: 'threads',
} as const

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS]
