// carrier-ops-hub/packages/shared/src/constants/collections.ts

export const COLLECTIONS = {
  USERS: 'users',
  DRIVERS: 'drivers',
  VEHICLES: 'vehicles',
  LOADS: 'loads',
  STOPS: 'stops',
  DOCUMENTS: 'documents',
  EXPENSES: 'expenses',
  EVENTS: 'events',
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
