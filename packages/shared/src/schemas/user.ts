// carrier-ops-hub/packages/shared/src/schemas/user.ts

// TODO: Replace with Zod schemas in Phase 3

export const UserSchema = {
  id: 'string',
  email: 'string',
  displayName: 'string',
  role: 'string',
  isActive: 'boolean',
  createdAt: 'date',
  updatedAt: 'date',
};

export type User = {
  id: string;
  email: string;
  displayName: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
