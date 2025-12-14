// carrier-ops-hub/packages/shared/src/schemas/user.ts

import { z } from 'zod';
import { TimestampSchema } from './common';

export const UserSchema = z.object({
    id: z.string(),
    fleetId: z.string(),
    email: z.string().email(),
    displayName: z.string(),
    role: z.enum(['OWNER', 'DISPATCHER', 'DRIVER', 'BILLING', 'SAFETY', 'MAINTENANCE']),
    isActive: z.boolean().default(true),
    createdAt: z.number(),
    updatedAt: z.number(),
});

export type User = z.infer<typeof UserSchema>;
