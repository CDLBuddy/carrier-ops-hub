// carrier-ops-hub/packages/shared/src/schemas/event.ts

// TODO: Replace with Zod schemas in Phase 3

export const EventSchema = {
  id: 'string',
  loadId: 'string',
  type: 'string',
  description: 'string',
  metadata: 'object | null',
  createdBy: 'string',
  createdAt: 'date',
};

export type Event = {
  id: string;
  loadId: string;
  type: string;
  description: string;
  metadata: Record<string, unknown> | null;
  createdBy: string;
  createdAt: Date;
};
