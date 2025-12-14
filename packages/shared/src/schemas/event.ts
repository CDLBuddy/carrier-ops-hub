// carrier-ops-hub/packages/shared/src/schemas/event.ts

import { z } from 'zod';

export const EventSchema = z.object({
    id: z.string(),
    fleetId: z.string(),
    type: z.string(),
    entityType: z.enum(['LOAD', 'DRIVER', 'VEHICLE', 'DOCUMENT', 'USER']),
    entityId: z.string(),
    createdAt: z.number(),
    payload: z.record(z.any()),
});

export type Event = z.infer<typeof EventSchema>;
