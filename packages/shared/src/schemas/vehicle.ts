// carrier-ops-hub/packages/shared/src/schemas/vehicle.ts

// TODO: Replace with Zod schemas in Phase 3

export const VehicleSchema = {
  id: 'string',
  unitNumber: 'string',
  vin: 'string',
  make: 'string',
  model: 'string',
  year: 'number',
  licensePlate: 'string',
  isActive: 'boolean',
  createdAt: 'date',
  updatedAt: 'date',
};

export type Vehicle = {
  id: string;
  unitNumber: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
