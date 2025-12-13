// carrier-ops-hub/packages/shared/src/constants/roles.ts

export const ROLES = {
  OWNER: 'OWNER',
  DISPATCHER: 'DISPATCHER',
  BILLING: 'BILLING',
  SAFETY: 'SAFETY',
  MAINTENANCE: 'MAINTENANCE',
  DRIVER: 'DRIVER',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES = Object.values(ROLES);
