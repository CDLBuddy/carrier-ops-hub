// carrier-ops-hub/packages/shared/src/schemas/driver.ts

// TODO: Replace with Zod schemas in Phase 3

export const DriverSchema = {
  id: 'string',
  userId: 'string',
  firstName: 'string',
  lastName: 'string',
  licenseNumber: 'string',
  licenseState: 'string',
  phoneNumber: 'string',
  isActive: 'boolean',
  createdAt: 'date',
  updatedAt: 'date',
};

export type Driver = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  licenseState: string;
  phoneNumber: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
