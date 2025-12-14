// carrier-ops-hub/packages/shared/src/schemas/driver.ts

import { z } from 'zod';

export const DriverSchema = z.object({
    id: z.string(),
    fleetId: z.string(),
    userId: z.string().optional(),
    firstName: z.string(),
    lastName: z.string(),
    licenseNumber: z.string(),
    licenseState: z.string().length(2),
    phoneNumber: z.string(),
    isActive: z.boolean().default(true),
    createdAt: z.number(),
    updatedAt: z.number(),
});

export type Driver = z.infer<typeof DriverSchema>;
