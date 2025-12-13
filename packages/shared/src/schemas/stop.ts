// carrier-ops-hub/packages/shared/src/schemas/stop.ts

// TODO: Replace with Zod schemas in Phase 3

export const StopSchema = {
  id: 'string',
  loadId: 'string',
  type: 'string', // 'PICKUP' | 'DELIVERY'
  sequence: 'number',
  address: 'object',
  scheduledTime: 'date',
  actualTime: 'date | null',
  isCompleted: 'boolean',
  createdAt: 'date',
  updatedAt: 'date',
};

export type Stop = {
  id: string;
  loadId: string;
  type: 'PICKUP' | 'DELIVERY';
  sequence: number;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  scheduledTime: Date;
  actualTime: Date | null;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};
