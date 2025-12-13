// carrier-ops-hub/packages/shared/src/schemas/load.ts

// TODO: Replace with Zod schemas in Phase 3

export const LoadSchema = {
  id: 'string',
  loadNumber: 'string',
  status: 'string',
  driverId: 'string | null',
  vehicleId: 'string | null',
  pickupDate: 'date',
  deliveryDate: 'date',
  rateCents: 'number',
  notes: 'string | null',
  createdAt: 'date',
  updatedAt: 'date',
};

export type Load = {
  id: string;
  loadNumber: string;
  status: string;
  driverId: string | null;
  vehicleId: string | null;
  pickupDate: Date;
  deliveryDate: Date;
  rateCents: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};
