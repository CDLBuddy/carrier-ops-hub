// carrier-ops-hub/packages/shared/src/schemas/load.ts

import { z } from 'zod';
import { StopSchema } from './stop';

export const LoadSchema = z.object({
    id: z.string(),
    fleetId: z.string(),
    loadNumber: z.string(),
    status: z.enum(['AVAILABLE', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'INVOICED', 'PAID', 'CANCELLED']),
    driverId: z.string().nullable(),
    vehicleId: z.string().nullable(),
    stops: z.array(StopSchema).min(2),
    pickupDate: z.number(),
    deliveryDate: z.number(),
    rateCents: z.number().int().min(0),
    notes: z.string().nullable(),
    createdAt: z.number(),
    updatedAt: z.number(),
});

export type Load = z.infer<typeof LoadSchema>;
